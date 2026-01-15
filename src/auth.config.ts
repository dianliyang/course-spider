import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
  },
  providers: [],
} satisfies NextAuthConfig;
