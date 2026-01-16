import { runD1, queryD1 } from '../lib/d1';

async function seedGuest() {
  const guestEmail = 'guest@codecampus.example.com';
  const existing = await queryD1('SELECT id FROM users WHERE email = ?', [guestEmail]);
  
  if (existing.length === 0) {
    const id = 'guest-user-id';
    await runD1('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [id, 'Guest Scholar', guestEmail]);
    console.log('Guest user created.');
  } else {
    console.log('Guest user already exists.');
  }
}

seedGuest().catch(console.error);