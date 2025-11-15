const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', AdminSchema);

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/eventoems';

async function createAdminAccount() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Email: admin@gmail.com');
      process.exit(0);
    }

    // Create admin account
    const bcryptSalt = bcrypt.genSaltSync(10);
    const adminPassword = 'admin123'; // Change this password after first login!

    const admin = await Admin.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: bcrypt.hashSync(adminPassword, bcryptSalt),
      role: 'admin'
    });

    console.log('Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@gmail.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
