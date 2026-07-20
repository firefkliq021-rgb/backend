/**
 * =========================================================
 * CELINE DATING - DATABASE CONFIGURATION
 * =========================================================
 * 
 * This file handles the database connection using MySQL2
 * with connection pooling for optimal performance.
 * 
 * Environment variables are loaded from .env file
 * =========================================================
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Database Configuration Object
 * Uses environment variables with fallback defaults for development
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'celine_dating',
    port: parseInt(process.env.DB_PORT) || 3306,
    
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 10,
    queueLimit: 0,
    
    // Additional options
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    // SSL configuration (optional)
    // ssl: process.env.DB_SSL === 'true' ? {
    //     rejectUnauthorized: false
    // } : undefined
};

/**
 * Create MySQL connection pool
 * Using mysql2/promise for async/await support
 */
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 * Used during application startup
 */
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connection established successfully');
        console.log(`📊 Connected to: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
        
        // Test query to verify database exists
        const [result] = await connection.query('SELECT 1 + 1 AS test');
        console.log('✅ Database test query successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`   - Error: ${error.message}`);
        console.error(`   - Host: ${dbConfig.host}`);
        console.error(`   - Database: ${dbConfig.database}`);
        console.error(`   - User: ${dbConfig.user}`);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   - 💡 Check your database credentials in .env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   - 💡 Database does not exist. Please create it first.');
            console.error('   - Run: CREATE DATABASE IF NOT EXISTS celine_dating;');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   - 💡 MySQL server is not running. Please start MySQL.');
        }
        return false;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Get a connection from the pool
 * Use this for transactions or when you need a single connection
 */
async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Error getting connection:', error.message);
        throw error;
    }
}

/**
 * Execute a query with the pool
 * This is the primary method for database operations
 */
async function executeQuery(sql, params = []) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows, fields] = await connection.query(sql, params);
        return { rows, fields };
    } catch (error) {
        console.error('Query execution error:', {
            sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : ''),
            params: Array.isArray(params) ? params : [params],
            error: error.message
        });
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Execute a transaction with multiple queries
 * All queries will be rolled back if any fails
 */
async function executeTransaction(callback) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Create a query function for the transaction
        const query = async (sql, params = []) => {
            const [rows, fields] = await connection.query(sql, params);
            return { rows, fields };
        };
        
        // Execute the callback with the query function
        const result = await callback(query);
        
        // Commit the transaction
        await connection.commit();
        return result;
    } catch (error) {
        // Rollback on error
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError);
            }
        }
        console.error('Transaction error:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Close the connection pool
 * Should be called when shutting down the application
 */
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Database connection pool closed');
    } catch (error) {
        console.error('Error closing pool:', error);
    }
}

/**
 * Get pool status information
 */
function getPoolStatus() {
    return {
        totalConnections: pool.pool._allConnections.length,
        freeConnections: pool.pool._freeConnections.length,
        queueLength: pool.pool._queue.length,
        maxConnections: dbConfig.connectionLimit
    };
}

/**
 * Utility to escape SQL strings
 * Prevents SQL injection
 */
function escapeString(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'string') {
        return mysql.escape(str);
    }
    return str;
}

/**
 * Utility to build WHERE clause from object
 */
function buildWhereClause(params, prefix = '') {
    const conditions = [];
    const values = [];
    
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
            const column = prefix ? `${prefix}.${key}` : key;
            conditions.push(`${column} = ?`);
            values.push(value);
        }
    });
    
    return {
        where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        values
    };
}

/**
 * Utility to build UPDATE SET clause from object
 */
function buildSetClause(params) {
    const sets = [];
    const values = [];
    
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
            sets.push(`${key} = ?`);
            values.push(value);
        }
    });
    
    return {
        set: sets.length > 0 ? `SET ${sets.join(', ')}` : '',
        values
    };
}

// Export all functions and the pool
module.exports = {
    // Core
    pool,
    testConnection,
    getConnection,
    executeQuery,
    executeTransaction,
    closePool,
    getPoolStatus,
    
    // Utilities
    escapeString,
    buildWhereClause,
    buildSetClause,
    
    // Config access (read-only)
    getConfig: () => ({ ...dbConfig })
};

/**
 * =========================================================
 * USAGE EXAMPLES
 * =========================================================
 * 
 * // Basic query
 * const { rows } = await db.executeQuery(
 *     'SELECT * FROM users WHERE email = ?',
 *     ['user@example.com']
 * );
 * 
 * // Transaction
 * await db.executeTransaction(async (query) => {
 *     await query('INSERT INTO users ...', ['John', 'john@email.com']);
 *     await query('INSERT INTO profiles ...', [userId, 'Bio...']);
 * });
 * 
 * // Build WHERE clause
 * const { where, values } = db.buildWhereClause({ name: 'John', age: 25 });
 * const { rows } = await db.executeQuery(
 *     `SELECT * FROM users ${where}`,
 *     values
 * );
 * 
 * // Build UPDATE SET
 * const { set, values } = db.buildSetClause({ name: 'Jane', age: 26 });
 * await db.executeQuery(
 *     `UPDATE users ${set} WHERE id = ?`,
 *     [...values, userId]
 * );
 * =========================================================
 */