import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { D1Adapter } from "@auth/d1-adapter";
import { queryD1 } from "@/lib/d1";
import { authConfig } from "./auth.config";

// A robust shim to allow the D1Adapter to work in local dev by routing queries through our queryD1 utility.
// In production, we prioritize the real binding.
const unifiedDb = {
  prepare: (sql: string) => {
    const createStmt = (params: unknown[] = []) => ({
      bind: (...args: unknown[]) => createStmt(args),
      all: async () => {
        const results = await queryD1(sql, params);
        return { results, success: true, meta: {} };
      },
      run: async () => {
        await queryD1(sql, params);
        return { success: true, meta: {} };
      },
      first: async () => {
        const results = await queryD1(sql, params);
        return results[0] || null;
      },
      raw: async () => {
        return await queryD1(sql, params);
      }
    });
    return createStmt();
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Use the real D1 binding in production, or the robust shim in local dev
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: D1Adapter((process.env.DB || (globalThis as any).DB || unifiedDb) as any),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?sent=true",
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || "re_123456789",
      from: process.env.EMAIL_FROM || "CodeCampus <no-reply@codecampus.example.com>",
      maxAge: 10 * 60, // 10 minutes
      async sendVerificationRequest({ identifier: email, url }) {
        console.log(`[Auth] Magic Link Request for ${email}`);
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://course.oili.dev";
        
        try {
          // Edge-safe Base64URL encoding for the token deterrent
          const tokenParam = btoa(url)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
            
          const confirmUrl = new URL("/auth/confirm", baseUrl);
          confirmUrl.searchParams.set("t", tokenParam);
          const displayUrl = confirmUrl.toString();

          if (process.env.AUTH_RESEND_KEY && process.env.AUTH_RESEND_KEY !== "re_123456789") {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || "onboarding@resend.dev",
                to: email,
                subject: "🔒 Authenticate your CodeCampus Session",
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
                      .container { max-width: 600px; margin: 0 auto; padding: 48px 24px; }
                      .logo { color: #000000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 40px; }
                      .dot { color: #3b82f6; }
                      .content { background-color: #fcfcfc; border: 1px solid #f0f0f0; padding: 48px; border-radius: 24px; }
                      h1 { font-size: 22px; font-weight: 900; color: #111827; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em; }
                      p { color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
                      .button { display: inline-block; background-color: #000000; color: #ffffff !important; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; padding: 20px 40px; border-radius: 12px; text-decoration: none; text-align: center; }
                      .divider { height: 1px; background-color: #eeeeee; margin: 40px 0; }
                      .footer { margin-top: 40px; text-align: center; }
                      .footer-text { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; }
                      .security { font-size: 12px; color: #9ca3af; line-height: 1.5; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="logo">CodeCampus<span class="dot">.</span></div>
                      <div class="content">
                        <h1>System Authentication</h1>
                        <p>A secure access request was initiated for your identity. Click the button below to authorize the session and enter the network.</p>
                        <a href="${displayUrl}" class="button">Authenticate Session</a>
                        <div class="divider"></div>
                        <div class="security">
                          <strong>Security Protocol:</strong> This link is valid for 10 minutes and can only be used once. If you did not initiate this request, no action is required.
                        </div>
                      </div>
                      <div class="footer">
                        <p class="footer-text">© 2026 CodeCampus Global Network // 0xFC</p>
                      </div>
                    </div>
                  </body>
                  </html>
                `,
                text: `Authenticate your CodeCampus Session: ${displayUrl}`,
              }),
            });

            if (!res.ok) {
              const errorBody = await res.text();
              console.error("[Resend API Error]", res.status, errorBody);
              throw new Error("Failed to deliver verification email.");
            }
            console.log("[Auth] Verification email dispatched successfully.");
          } else {
            console.log(`\n\n[Auth] 🪄 MAGIC LINK (Dev): ${displayUrl}\n\n`);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[Auth System Error]", message);
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      return !!(account?.provider === "resend" || account?.provider === "email");
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          const results = await queryD1(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [session.user.email]
          );
          if (results && results.length > 0) {
            const u = results[0] as { id: string };
            (session.user as { id: string }).id = u.id;
          }
        } catch (e) {
          console.error("[Session Callback Error]", e);
        }
      }
      return session;
    },
    async authorized({ auth }) {
      return !!auth;
    },
  },
});