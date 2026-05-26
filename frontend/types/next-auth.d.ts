import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    apiToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: "admin" | "client";
    };
  }
  interface User {
    role?: "admin" | "client";
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "client";
    apiToken?: string;
  }
}
