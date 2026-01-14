import { NextResponse } from 'next/server';
import { runD1, queryD1 } from '@/lib/d1';

export async function POST() {
  try {
    // Mock user for now
    const mockUserEmail = "test@example.com";
    const user = await queryD1<{ id: number }>('SELECT id FROM users WHERE email = ? LIMIT 1', [mockUserEmail]);
    
    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user[0].id;

    // Delete user data (Cascading delete in schema will handle user_courses if configured, 
    // but we'll do it explicitly here for safety)
    await runD1('DELETE FROM user_courses WHERE user_id = ?', [userId]);
    await runD1('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
