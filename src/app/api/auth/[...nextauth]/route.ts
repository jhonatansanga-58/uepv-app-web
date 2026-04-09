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

        // Verificador de contraseña por defecto (Fase 2.2)
        // Detectar si el usuario sigue usando la contraseña auto-generada
        const firstWord = user.firstName.trim().split(' ')[0];
        const defaultPassword = `Uepv-${firstWord}`;
        const isUsingDefaultPassword = credentials.password === defaultPassword;

        return {
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          userName: user.userName,
          role: user.role,
          forcePasswordChange: isUsingDefaultPassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add custom fields to JWT token
      if (user) {
        return {
          ...token,
          id: user.id,
          userName: (user as any).userName,
          role: (user as any).role,
          forcePasswordChange: (user as any).forcePasswordChange,
        };
      }
      // If the user updates their session manually (e.g., after resetting password)
      if (trigger === "update" && session?.forcePasswordChange === false) {
        return { ...token, forcePasswordChange: false };
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          userName: token.userName as string,
          role: token.role as string,
          forcePasswordChange: token.forcePasswordChange as boolean,
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