// Debug script for Env vars
// Run with: npx tsx -r dotenv/config src/scripts/debug-env.ts dotenv_config_path=.env.local

console.log('🔑 Checking Environment Variables:');
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
if (process.env.RESEND_API_KEY) {
  console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY.length);
  console.log('RESEND_API_KEY start:', process.env.RESEND_API_KEY.substring(0, 3));
}
