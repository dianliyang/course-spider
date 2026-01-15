import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { queryD1 } from "@/lib/d1";
import { CodeCampusAdapter } from "@/lib/auth-adapter";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: CodeCampusAdapter(),
  session: {
    strategy: "jwt",
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || "re_123456789", // Fallback to dummy key to prevent init failure
      from: process.env.EMAIL_FROM || "CodeCampus <no-reply@codecampus.example.com>",
      // Custom sendVerificationRequest to allow console logging in dev
      async sendVerificationRequest({ identifier: email, url }) {
        console.log(`\n\n[Auth] 🪄 Magic Link for ${email}: ${url}\n\n`);
        
        // Only attempt Resend if key is present and not in local dev console-only mode
        if (process.env.AUTH_RESEND_KEY) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "onboarding@resend.dev",
              to: email,
              subject: "Sign in to CodeCampus",
              html: `<p>Click the link below to sign in to your account:</p><p><a href="${url}">Sign in to CodeCampus</a></p>`,
              text: `Sign in to CodeCampus: ${url}`,
            }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(JSON.stringify(error));
          }
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      // Allow Email provider
      if (account?.provider === "resend" || account?.provider === "email") return true;
      return true;
    },
    async session({ session }) {
      // console.log("[Auth] Session Callback");
      if (session.user && session.user.email) {
        // ... (existing logic) ...
         try {
           const dbUser = await queryD1<{ id: number }>(
             "SELECT id FROM accounts WHERE email = ? LIMIT 1",
             [session.user.email]
           );
           if (dbUser.length > 0) {
             session.user.id = dbUser[0].id.toString();
           }
        } catch (e) {
          console.error("Session lookup error:", e);
        }
      }
      return session;
    },
    async authorized({ auth }) {
      return !!auth;
    }
  }
});
