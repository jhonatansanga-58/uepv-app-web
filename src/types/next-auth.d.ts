import { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      userName: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    userName: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userName: string;
    role: Role;
  }
}