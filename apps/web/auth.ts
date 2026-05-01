import NextAuth, { type NextAuthResult } from "next-auth";
import GitHub from "next-auth/providers/github";

const allowedLogins = (process.env.ADMIN_GITHUB_LOGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const result: NextAuthResult = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn({ profile }) {
      if (!profile?.login) return false;
      if (allowedLogins.length === 0) return false;
      return allowedLogins.includes(profile.login as string);
    },
    session({ session, token }) {
      if (token.login) {
        session.user.name = token.login as string;
      }
      return session;
    },
    jwt({ token, profile }) {
      if (profile?.login) {
        token.login = profile.login;
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});

export const { handlers, auth, signIn, signOut } = result;
