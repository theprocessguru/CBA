import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetAdminPassword() {
  const email = 'admin@croydonba.org.uk';
  const newPassword = 'Admin2025!'; // Temporary password
  
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password in the database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, first_name',
      [hashedPassword, email]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Password reset successful!');
      console.log('=====================================');
      console.log('Email:', email);
      console.log('New Password:', newPassword);
      console.log('=====================================');
      console.log('⚠️  Please change this password after logging in!');
    } else {
      console.log('❌ User not found with email:', email);
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

// Run the reset
resetAdminPassword();