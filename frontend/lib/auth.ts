import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "./api";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await api.post("/login", {
            email: credentials.email,
            password: credentials.password,
          });
          const { data } = res.data;
          if (!data?.token || !data?.user) return null;
          return {
            id: String(data.user.id),
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            token: data.token,
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.apiToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session as any).apiToken = token.apiToken;
      return session;
    },
  },
};
