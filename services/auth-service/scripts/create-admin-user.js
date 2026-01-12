/**
 * Script to create admin user with email "admin@me.com" and password "admin123"
 * Password "admin123" (8 chars) meets validation requirements (min 6 chars)
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');

// Database configuration (adjust as needed)
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://viridial:123456@localhost:5432/viridial';

async function createAdminUser() {
  // Parse DATABASE_URL
  const dbUrl = new URL(DATABASE_URL);
  const client = new Client({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 5432,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
  });

  try {
    await client.connect();
    console.log('Database connection established');

    // Hash password "admin123" (8 characters, meets validation)
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('Password hash generated');

    // Check if user already exists
    const checkResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@me.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('User admin@me.com already exists. Updating password...');
      await client.query(
        'UPDATE users SET password_hash = $1, role = $2, updated_at = NOW() WHERE email = $3',
        [passwordHash, 'super_admin', 'admin@me.com']
      );
      console.log('Password and role updated successfully');
      console.log('User ID:', checkResult.rows[0].id);
    } else {
      // Create admin user - using minimal required fields based on User entity
      const result = await client.query(
        `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, email, role`,
        ['admin@me.com', passwordHash, 'super_admin', true, true]
      );
      console.log('User created successfully:', result.rows[0]);
    }

    await client.end();
    console.log('Database connection closed');
    console.log('\n✅ Admin user created/updated successfully!');
    console.log('📧 Email: admin@me.com');
    console.log('🔐 Password: admin123');
    console.log('👤 Role: super_admin');
  } catch (error) {
    console.error('Error:', error.message);
    if (client) await client.end();
    process.exit(1);
  }
}

createAdminUser();
