import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { options } from "./options";

export const handler = NextAuth(options);

export { handler as POST, handler as GET };
