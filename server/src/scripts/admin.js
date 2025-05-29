const User = require('../models/user');
const bcrypt = require('bcrypt');

async function createAdminAccount() {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        if (existingAdmin) {
            console.log('Admin account already exists.');
            return;
        }
        const newAdmin = new User({
            name: 'Admin',
            email: 'admin@test.com',
            password: await bcrypt.hash('admin123', 10), // Hashing the password
            role: 'admin'
        });
        await newAdmin.save();
        console.log('Admin account created successfully.');
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
}   

module.exports = createAdminAccount;