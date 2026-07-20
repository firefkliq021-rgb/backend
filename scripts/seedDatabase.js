/**
 * =========================================================
 * DATABASE SEED SCRIPT
 * =========================================================
 * Populates the database with sample data for testing
 * 
 * Usage: npm run db:seed
 * =========================================================
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

async function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedDatabase() {
    console.log('🌱 Seeding database with sample data...');
    
    try {
        // Test connection
        const isConnected = await db.testConnection();
        if (!isConnected) {
            console.error('❌ Cannot connect to database. Please check your configuration.');
            process.exit(1);
        }
        
        // Check if already seeded
        const { rows: existingUsers } = await db.executeQuery(
            'SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE'
        );
        
        if (existingUsers[0].count > 0) {
            console.log('⚠️  Database already has users. Skipping seed.');
            console.log('   To re-seed, truncate tables first.');
            process.exit(0);
        }
        
        console.log('📝 Creating sample users...');
        
        // Sample users data
        const sampleUsers = [
            {
                name: 'Emma',
                email: 'emma@test.com',
                password: 'password123',
                age: 24,
                location: 'Los Angeles, CA',
                bio: 'Adventurer, coffee lover, and professional dog petter 🐕',
                avatar: { skin: '#F7D9B6', hair: '#9B4F96', accent: '#EC4899', style: 'curly' }
            },
            {
                name: 'James',
                email: 'james@test.com',
                password: 'password123',
                age: 27,
                location: 'San Francisco, CA',
                bio: 'Tech enthusiast, amateur chef, and weekend hiker 🏔️',
                avatar: { skin: '#E8AD7D', hair: '#222222', accent: '#4ADE80', style: 'short' }
            },
            {
                name: 'Sophia',
                email: 'sophia@test.com',
                password: 'password123',
                age: 23,
                location: 'Miami, FL',
                bio: 'Beach lover, salsa dancer, and bookworm 📚',
                avatar: { skin: '#F2C9A0', hair: '#B5651D', accent: '#FBBF24', style: 'wavy' }
            },
            {
                name: 'Michael',
                email: 'michael@test.com',
                password: 'password123',
                age: 30,
                location: 'Austin, TX',
                bio: 'Music producer, guitar player, and vinyl collector 🎵',
                avatar: { skin: '#D9A066', hair: '#4A3728', accent: '#8B5CF6', style: 'short' }
            },
            {
                name: 'Olivia',
                email: 'olivia@test.com',
                password: 'password123',
                age: 25,
                location: 'Seattle, WA',
                bio: 'Nature lover, photographer, and rainy day enthusiast 🌧️',
                avatar: { skin: '#F2C9A0', hair: '#6B3F2A', accent: '#FF6B9D', style: 'long' }
            }
        ];
        
        // Get admin user
        const { rows: adminRows } = await db.executeQuery(
            'SELECT id FROM users WHERE is_admin = TRUE LIMIT 1'
        );
        const adminId = adminRows[0]?.id;
        
        if (!adminId) {
            console.error('❌ Admin user not found. Please run setup first.');
            process.exit(1);
        }
        
        // Insert users
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const passwordHash = await hashPassword(userData.password);
            const uuid = uuidv4();
            
            const { rows } = await db.executeQuery(
                `INSERT INTO users 
                (uuid, name, email, password_hash, age, location, bio, 
                 avatar_skin, avatar_hair, avatar_accent, avatar_style, is_admin) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uuid,
                    userData.name,
                    userData.email.toLowerCase(),
                    passwordHash,
                    userData.age,
                    userData.location,
                    userData.bio,
                    userData.avatar.skin,
                    userData.avatar.hair,
                    userData.avatar.accent,
                    userData.avatar.style,
                    false
                ]
            );
            
            const [user] = await db.executeQuery(
                'SELECT id, name FROM users WHERE id = ?',
                [rows.insertId]
            );
            createdUsers.push(user[0]);
            
            // Send welcome message from admin
            await db.executeQuery(
                `INSERT INTO messages (uuid, sender_id, receiver_id, message, message_type, is_read) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    uuidv4(),
                    adminId,
                    user[0].id,
                    `Welcome to Celine Dating! ❤️ I'm Celine, your personal matchmaker. I'm here to help you find love! 🥰`,
                    'text',
                    true
                ]
            );
            
            console.log(`   ✅ Created user: ${userData.name} (${userData.email})`);
        }
        
        console.log('\n✅ Database seeding completed successfully!');
        console.log(`   👤 Created ${createdUsers.length} sample users`);
        console.log('   💡 Test credentials:');
        createdUsers.forEach(user => {
            console.log(`   - ${user.name}: ${user.email} / password123`);
        });
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await db.closePool();
    }
}

// Run seeding
seedDatabase();