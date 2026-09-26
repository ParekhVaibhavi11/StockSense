import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const fixSeed = async () => {
  try {
    console.log('⚡ Generating valid bcrypt hashes for demo users (password: password123)...');
    const hash = await bcrypt.hash('password123', 10);

    // Update demo manager
    await query(
      `INSERT INTO users (name, email, password_hash, role, is_verified) 
       VALUES ('Alex Rivera (Manager)', 'manager@stocksense.com', $1, 'inventory_manager', TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, is_verified = TRUE`,
      [hash]
    );

    // Update demo staff
    await query(
      `INSERT INTO users (name, email, password_hash, role, is_verified) 
       VALUES ('Sam Chen (Staff)', 'staff@stocksense.com', $1, 'warehouse_staff', TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, is_verified = TRUE`,
      [hash]
    );

    console.log('✅ Demo users updated with valid password: password123');
  } catch (err) {
    console.error('❌ Failed to update seed passwords:', err);
  }
};

fixSeed();
