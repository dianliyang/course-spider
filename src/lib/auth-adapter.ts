import { Adapter, AdapterUser, AdapterSession } from "next-auth/adapters"
import { queryD1, runD1 } from "./d1"

interface DbAccount {
  id: number;
  email: string;
  emailVerified?: string | null;
  name?: string | null;
  image?: string | null;
  [key: string]: unknown;
}

interface DbSession {
  sessionToken: string;
  userId: number;
  expires: string;
}

interface DbVerificationToken {
  identifier: string;
  token: string;
  expires: string;
}

// Helper to cast DB account row to AdapterUser
function mapUser(account: DbAccount): AdapterUser | null {
  if (!account) return null;
  return {
    id: account.id.toString(),
    email: account.email,
    emailVerified: account.emailVerified ? new Date(account.emailVerified) : null,
    name: account.name ?? null,
    image: account.image ?? null
  }
}

function mapSession(session: DbSession): AdapterSession | null {
  if (!session) return null;
  return {
    sessionToken: session.sessionToken,
    userId: session.userId.toString(),
    expires: new Date(session.expires)
  }
}

export function CodeCampusAdapter(): Adapter {
  return {
    async createUser(user) {
      const { email, emailVerified, name, image } = user;
      // We assume 'email' provider for default creation.
      await runD1(
        "INSERT INTO accounts (email, emailVerified, name, image, provider, providerAccountId, type) VALUES (?, ?, ?, ?, 'email', ?, 'email')",
        [email, emailVerified?.toISOString(), name, image, email]
      );
      
      const row = await queryD1<DbAccount>("SELECT * FROM accounts WHERE email = ? ORDER BY id DESC LIMIT 1", [email]);
      return mapUser(row[0])!;
    },
    async getUser(id) {
      const rows = await queryD1<DbAccount>("SELECT * FROM accounts WHERE id = ? LIMIT 1", [parseInt(id)]);
      return mapUser(rows[0]);
    },
    async getUserByEmail(email) {
      const rows = await queryD1<DbAccount>("SELECT * FROM accounts WHERE email = ? LIMIT 1", [email]);
      return mapUser(rows[0]);
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const rows = await queryD1<DbAccount>(
        `SELECT * FROM accounts WHERE provider = ? AND providerAccountId = ?`,
        [provider, providerAccountId]
      );
      return mapUser(rows[0]);
    },
    async updateUser(user) {
      const id = parseInt(user.id!);
      await runD1(
        "UPDATE accounts SET email = ?, emailVerified = ?, name = ?, image = ? WHERE id = ?",
        [user.email, user.emailVerified?.toISOString(), user.name, user.image, id]
      );
      return user as AdapterUser;
    },
    async deleteUser(userId) {
      await runD1("DELETE FROM accounts WHERE id = ?", [parseInt(userId)]);
    },
    async linkAccount(account) {
      // In a merged schema, the account info is stored on the user row.
      await runD1(
        `UPDATE accounts SET provider = ?, providerAccountId = ?, type = ?, refresh_token = ?, access_token = ?, expires_at = ?, token_type = ?, scope = ?, id_token = ?, session_state = ? WHERE id = ?`,
        [
          account.provider,
          account.providerAccountId,
          account.type,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
          account.session_state,
          parseInt(account.userId)
        ]
      );
      return account;
    },
    async unlinkAccount() {
      // We can't really unlink in a merged schema without deleting the user or resetting columns.
      // We'll reset the provider columns to default 'email' state?
      // Or simply do nothing/throw.
      // For now, we stub it as we don't expect to use it with Magic Link only.
    },
    async createSession(session) {
      await runD1(
        "INSERT INTO sessions (sessionToken, userId, expires) VALUES (?, ?, ?)",
        [session.sessionToken, parseInt(session.userId), session.expires.toISOString()]
      );
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const sessionRows = await queryD1<DbSession>(
        "SELECT * FROM sessions WHERE sessionToken = ? LIMIT 1",
        [sessionToken]
      );
      if (!sessionRows.length) return null;
      
      const session = sessionRows[0];
      const userRows = await queryD1<DbAccount>(
        "SELECT * FROM accounts WHERE id = ? LIMIT 1",
        [session.userId]
      );
      if (!userRows.length) return null;

      return {
        session: mapSession(session)!,
        user: mapUser(userRows[0])!
      }
    },
    async updateSession(session) {
      await runD1(
        "UPDATE sessions SET expires = ? WHERE sessionToken = ?",
        [session.expires?.toISOString(), session.sessionToken]
      );
      return session as AdapterSession;
    },
    async deleteSession(sessionToken) {
      await runD1("DELETE FROM sessions WHERE sessionToken = ?", [sessionToken]);
    },
    async createVerificationToken(verificationToken) {
      await runD1(
        "INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)",
        [verificationToken.identifier, verificationToken.token, verificationToken.expires.toISOString()]
      );
      return verificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const rows = await queryD1<DbVerificationToken>(
        "SELECT * FROM verification_tokens WHERE identifier = ? AND token = ? LIMIT 1",
        [identifier, token]
      );
      if (!rows.length) return null;
      
      await runD1(
        "DELETE FROM verification_tokens WHERE identifier = ? AND token = ?",
        [identifier, token]
      );
      
      const t = rows[0];
      return {
        identifier: t.identifier,
        token: t.token,
        expires: new Date(t.expires)
      };
    },
  }
}
