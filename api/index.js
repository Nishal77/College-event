const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const AdminModel = require("./models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const Ticket = require("./models/Ticket");
const Booking = require("./models/Booking");

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || "bsbsfbrnsftentwnnwnwn";

app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:5173",
   })
);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with proper options
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/eventoems';

console.log('🔗 Connecting to MongoDB:', mongoUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

const mongooseOptions = {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
   socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Add SSL options if connecting to MongoDB Atlas
if (mongoUrl.includes('mongodb+srv://')) {
   mongooseOptions.tls = true;
   // Remove conflicting TLS options for Atlas
}

mongoose.connect(mongoUrl, mongooseOptions);

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
   console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
   console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
   console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
   await mongoose.connection.close();
   console.log('MongoDB connection closed through app termination');
   process.exit(0);
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/");
   },
   filename: (req, file, cb) => {
      // Generate unique filename with timestamp to avoid conflicts
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = file.originalname.replace(ext, '').replace(/\s+/g, '-');
      cb(null, name + '-' + uniqueSuffix + ext);
   },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
   const allowedTypes = /jpeg|jpg|png|gif|webp/;
   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
   const mimetype = allowedTypes.test(file.mimetype);
   
   if (mimetype && extname) {
      return cb(null, true);
   } else {
      cb(new Error('Only image files are allowed!'));
   }
};

const upload = multer({ 
   storage,
   fileFilter,
   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.get("/test", (req, res) => {
   res.json("test ok");
});

app.post("/register", async (req, res) => {
   const { name, email, password } = req.body;

   try {
      const userDoc = await UserModel.create({
         name,
         email,
         password: bcrypt.hashSync(password, bcryptSalt),
      });
      res.json(userDoc);
   } catch (e) {
      res.status(422).json(e);
   }
});

app.post("/login", async (req, res) => {
   const { email, password } = req.body;

   const userDoc = await UserModel.findOne({ email });

   if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
   }

   const passOk = bcrypt.compareSync(password, userDoc.password);
   if (!passOk) {
      return res.status(401).json({ error: "Invalid password" });
   }

   jwt.sign(
      {
         email: userDoc.email,
         id: userDoc._id,
      },
      jwtSecret,
      {},
      (err, token) => {
         if (err) {
            return res.status(500).json({ error: "Failed to generate token" });
         }
         res.cookie("token", token).json(userDoc);
      }
   );
});

app.get("/profile", (req, res) => {
   const { token } = req.cookies;
   if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
         if (err) throw err;
         const { name, email, _id } = await UserModel.findById(userData.id);
         res.json({ name, email, _id });
      });
   } else {
      res.json(null);
   }
});

app.post("/logout", (req, res) => {
   res.cookie("token", "").json(true);
});

// Admin Authentication Routes
app.post("/admin/register", async (req, res) => {
   const { name, email, password } = req.body;

   try {
      const adminDoc = await AdminModel.create({
         name,
         email,
         password: bcrypt.hashSync(password, bcryptSalt),
         role: 'admin'
      });
      res.json(adminDoc);
   } catch (e) {
      res.status(422).json(e);
   }
});

app.post("/admin/login", async (req, res) => {
   const { email, password } = req.body;

   try {
      const adminDoc = await AdminModel.findOne({ email });

      if (!adminDoc) {
         return res.status(404).json({ error: "Admin not found" });
      }

      const passOk = bcrypt.compareSync(password, adminDoc.password);
      if (!passOk) {
         return res.status(401).json({ error: "Invalid password" });
      }

      jwt.sign(
         {
            email: adminDoc.email,
            id: adminDoc._id,
            role: 'admin'
         },
         jwtSecret,
         {},
         (err, token) => {
            if (err) {
               return res.status(500).json({ error: "Failed to generate token" });
            }
            res.json({ token, admin: adminDoc });
         }
      );
   } catch (e) {
      res.status(500).json({ error: "Server error" });
   }
});

const eventSchema = new mongoose.Schema({
   owner: String,
   title: String,
   description: String,
   organizedBy: String,
   eventDate: Date,
   eventTime: String,
   location: String,
   Participants: Number,
   Count: Number,
   Income: Number,
   ticketPrice: Number,
   Quantity: Number,
   image: String,
   likes: Number,
   Comment: [String],
});

const Event = mongoose.model("Event", eventSchema);

app.post("/createEvent", upload.single("image"), async (req, res) => {
   try {
      const eventData = req.body;
      
      // Store only the filename, not the full path
      if (req.file) {
         eventData.image = req.file.filename;
      } else {
         eventData.image = "";
      }
      
      const newEvent = new Event(eventData);
      await newEvent.save();
      
      res.status(201).json(newEvent);
   } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to save the event to MongoDB" });
   }
});

app.get("/createEvent", async (req, res) => {
   try {
      const events = await Event.find();
      res.status(200).json(events);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch events from MongoDB" });
   }
});

app.get("/event/:id", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.delete("/event/:id", async (req, res) => {
   const { id } = req.params;
   try {
      await Event.findByIdAndDelete(id);
      res.json({ message: "Event deleted successfully" });
   } catch (error) {
      res.status(500).json({ error: "Failed to delete event from MongoDB" });
   }
});

app.post("/event/:eventId", (req, res) => {
   const eventId = req.params.eventId;

   Event.findById(eventId)
      .then((event) => {
         if (!event) {
            return res.status(404).json({ message: "Event not found" });
         }

         event.likes += 1;
         return event.save();
      })
      .then((updatedEvent) => {
         res.json(updatedEvent);
      })
      .catch((error) => {
         console.error("Error liking the event:", error);
         res.status(500).json({ message: "Server error" });
      });
});

app.get("/events", (req, res) => {
   Event.find()
      .then((events) => {
         res.json(events);
      })
      .catch((error) => {
         console.error("Error fetching events:", error);
         res.status(500).json({ message: "Server error" });
      });
});

app.get("/event/:id/ordersummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.post("/tickets", async (req, res) => {
   try {
      const ticketData = req.body;
      
      // Validate required fields
      if (!ticketData.ticketDetails) {
         return res.status(400).json({ error: "Ticket details are required" });
      }

      // Create ticket with proper structure
      const newTicket = new Ticket({
         userid: ticketData.userid || '',
         eventid: ticketData.eventid || '',
         ticketDetails: {
            name: ticketData.ticketDetails.name || '',
            email: ticketData.ticketDetails.email || '',
            eventname: ticketData.ticketDetails.eventname || '',
            eventdate: ticketData.ticketDetails.eventdate || new Date(),
            eventtime: ticketData.ticketDetails.eventtime || '',
            ticketprice: ticketData.ticketDetails.ticketprice || 0,
            qr: ticketData.ticketDetails.qr || '',
         },
         count: ticketData.count || 0,
      });
      
      await newTicket.save();
      return res.status(201).json({ ticket: newTicket });
   } catch (error) {
      console.error("Error creating ticket:", error);
      return res.status(500).json({ error: "Failed to create ticket", details: error.message });
   }
});

app.get("/tickets/:id", async (req, res) => {
   try {
      const tickets = await Ticket.find();
      res.json(tickets);
   } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
   }
});

app.get("/tickets/all", async (req, res) => {
   try {
      const tickets = await Ticket.find();
      res.json(tickets);
   } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
   }
});

app.get("/tickets/user/:userId", (req, res) => {
   const userId = req.params.userId;

   Ticket.find({ userid: userId })
      .then((tickets) => {
         res.json(tickets);
      })
      .catch((error) => {
         console.error("Error fetching user tickets:", error);
         res.status(500).json({ error: "Failed to fetch user tickets" });
      });
});

app.delete("/tickets/:id", async (req, res) => {
   try {
      const ticketId = req.params.id;
      await Ticket.findByIdAndDelete(ticketId);
      res.status(204).send();
   } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
   }
});

//! ============ BOOKING ROUTES ============

// Create a new booking
app.post("/bookings", async (req, res) => {
   try {
      const {
         name,
         email,
         phone,
         eventId,
         eventTitle,
         eventDate,
         eventTime,
         eventLocation,
         ticketQuantity,
         ticketPrice,
         totalAmount,
         paymentMethod,
         paymentStatus,
         qrCode,
         bookingStatus
      } = req.body;

      // Validation
      if (!name || !email || !phone || !eventId || !eventTitle || !qrCode) {
         return res.status(400).json({ error: "Missing required fields" });
      }

      // Create new booking
      const booking = await Booking.create({
         name,
         email,
         phone,
         eventId,
         eventTitle,
         eventDate,
         eventTime,
         eventLocation,
         ticketQuantity: ticketQuantity || 1,
         ticketPrice,
         totalAmount,
         paymentMethod: paymentMethod || 'Credit/Debit Card',
         paymentStatus: paymentStatus || 'Completed',
         qrCode,
         bookingStatus: bookingStatus || 'Confirmed'
      });

      console.log('✅ Booking created:', booking._id);
      res.status(201).json(booking);
      
   } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
   }
});

// Get booking by ID
app.get("/bookings/:id", async (req, res) => {
   try {
      const booking = await Booking.findById(req.params.id);
      
      if (!booking) {
         return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
   } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
   }
});

// Get all bookings (for admin)
app.get("/bookings", async (req, res) => {
   try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      res.json(bookings);
   } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
   }
});

// Get bookings by event ID
app.get("/bookings/event/:eventId", async (req, res) => {
   try {
      const bookings = await Booking.find({ eventId: req.params.eventId });
      res.json(bookings);
   } catch (error) {
      console.error("Error fetching event bookings:", error);
      res.status(500).json({ error: "Failed to fetch event bookings" });
   }
});

// Delete booking (cancel booking)
app.delete("/bookings/:id", async (req, res) => {
   try {
      const booking = await Booking.findByIdAndUpdate(
         req.params.id,
         { bookingStatus: 'Cancelled' },
         { new: true }
      );
      
      if (!booking) {
         return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
   } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
   }
});

// Get booking statistics for admin dashboard
app.get("/admin/booking-stats", async (req, res) => {
   try {
      const totalBookings = await Booking.countDocuments({ bookingStatus: 'Confirmed' });
      const totalRevenue = await Booking.aggregate([
         { $match: { paymentStatus: 'Completed', bookingStatus: 'Confirmed' } },
         { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      
      const recentBookings = await Booking.find()
         .sort({ createdAt: -1 })
         .limit(10);
      
      res.json({
         totalBookings,
         totalRevenue: totalRevenue[0]?.total || 0,
         recentBookings
      });
   } catch (error) {
      console.error("Error fetching booking stats:", error);
      res.status(500).json({ error: "Failed to fetch booking statistics" });
   }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
