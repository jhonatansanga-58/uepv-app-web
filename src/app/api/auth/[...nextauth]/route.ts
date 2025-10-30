import NextAuth from "next-auth";
import { compare } from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: {
          label: "Username or Email",
          type: "text",
          placeholder: "username or email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Check if user exists by username or email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { userName: credentials.usernameOrEmail },
              { email: credentials.usernameOrEmail },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
            password: true,
            role: true,
            active: true,
          },
        });

        if (!user) {
          throw new Error("No user found");
        }

        if (!user.active) {
          throw new Error("User is inactive");
        }

        // Compare passwords
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          userName: user.userName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to JWT token
      if (user) {
        return {
          ...token,
          id: user.id,
          userName: user.userName,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          userName: token.userName,
          role: token.role,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
    // Add other custom pages here if needed
  },
});

export { handler as GET, handler as POST };