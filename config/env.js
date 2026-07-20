/**
 * =========================================================
 * ENVIRONMENT CONFIGURATION
 * =========================================================
 * Loads and validates environment variables
 */

const dotenv = require('dotenv');
dotenv.config();

// Required environment variables
const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
];

// Check for required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\n💡 Create a .env file with these variables');
    process.exit(1);
}

// Environment configuration object
const config = {
    // Server
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        poolSize: parseInt(process.env.DB_POOL_SIZE) || 10
    },
    
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    
    // App
    app: {
        name: process.env.APP_NAME || 'Celine Dating',
        adminName: process.env.ADMIN_NAME || 'Celine',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@celinedating.com',
        maxUsers: parseInt(process.env.MAX_USERS) || 3000
    },
    
    // Security
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
        corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
    }
};

// Validate JWT secret length
if (config.jwt.secret.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
}

module.exports = config;