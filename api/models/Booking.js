const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
   // User Information
   name: { type: String, required: true },
   email: { type: String, required: true },
   phone: { type: String, required: true },
   
   // Event Information
   eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
   eventTitle: { type: String, required: true },
   eventDate: { type: String, required: true },
   eventTime: { type: String, required: true },
   eventLocation: { type: String, required: true },
   
   // Ticket Information
   ticketQuantity: { type: Number, default: 1 },
   ticketPrice: { type: Number, required: true },
   totalAmount: { type: Number, required: true },
   
   // Payment Information
   paymentMethod: { type: String, default: 'Credit/Debit Card' },
   paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
   
   // QR Code for ticket
   qrCode: { type: String, required: true },
   
   // Booking Status
   bookingStatus: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
   
}, { timestamps: true });

const BookingModel = mongoose.model('Booking', bookingSchema);
module.exports = BookingModel;
