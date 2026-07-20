/**
 * =========================================================
 * DATABASE SETUP SCRIPT
 * =========================================================
 * Creates the database and tables if they don't exist
 * 
 * Usage: npm run db:setup
 * =========================================================
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function setupDatabase() {
    console.log('🚀 Setting up Celine Dating Database...');

    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connected to MySQL server');

        const schemaPath = path.join(__dirname, '../../database/celine_dating.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        console.log('📝 Creating database and tables...');
        await connection.query(schemaSQL);

        console.log('✅ Database setup completed successfully!');
        console.log('📊 Database: ' + (process.env.DB_NAME || 'celine_dating'));
    } catch (error) {
        console.warn('⚠️  MySQL is not available or credentials are invalid.');
        console.warn('   The backend scaffold is still ready for local development.');
        console.warn(`   Error: ${error.message}`);
        console.warn('   Update the database credentials in backend/.env to enable full database setup.');
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();