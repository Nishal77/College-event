# EventoEMS - Event Management System

Introducing our Event Management System, a solution developed as part of our final year group project, designed to streamline campus event planning, registration, and ticket booking. I played a key role as the architect, creating the user interface where I incorporated modern design principles and prioritized user experience. We are developing the system using the MERN stack (MongoDB, Express.js, React.js, Node.js), and we are utilizing the agile Scrum methodology for efficient development.

**Skills:** *Figma · Ui/ux · React.js · MongoDB · Node.js · Express.js · Requirements Analysis · User Interface Design*

**Features**
* Schedule a Event.
* View upcoming events.
* View the event calendar.
* Getting approval for the events.
* Ticket Booking for the event.
* QR Code generation for receiving tickets.

**Technologies Used**
* ReactJs
* NodeJs
* ExpressJs
* MongoDB
* NPM (Node Package Manager)
* JWT webtoken
* QR code

**_Getting Started_**

**Prerequisites**
* Node.js and npm installed
* MongoDB Database

**Installation**
1. Clone the repository to your local machine.
2. Navigate to the project directory. Use two terminals:
   - **Terminal 1:** `cd api` (For Backend)
   - **Terminal 2:** `cd client` (For Frontend)
3. Install dependencies for both frontend and backend:
   - In `api` folder: `npm install`
   - In `client` folder: `npm install`
4. Create a `.env` file in the `api` directory with the following content:
   ```
   # For local MongoDB:
   MONGO_URL=mongodb://localhost:27017/eventoems
   
   # For MongoDB Atlas (cloud - replace with your connection string):
   # MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/eventoems?retryWrites=true&w=majority
   
   JWT_SECRET=bsbsfbrnsftentwnnwnwn
   PORT=4000
   ```
5. Start the backend server (in `api` folder):
   - Use: `npm run dev` (runs with nodemon for auto-reload)
   - Or use: `npm start` (runs without nodemon)
6. Start the frontend client (in `client` folder):
   - Use: `npm run dev`

**The application should now be running. You can access it at http://localhost:5173**<br>
**The Server is running on http://localhost:4000**

<h1>Thank You</h1>

![portfolio_1](https://github.com/Bilal025/EventoEMS/assets/95700674/001ddf1c-72b3-40bb-8e3e-975ae00ccee5)
