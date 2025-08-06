const cloudinary = require('cloudinary').v2

// import { v2 as cloudinary } from 'cloudinary';

require('dotenv').config({ path: '../config/.env'})

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
    module.exports = cloudinary