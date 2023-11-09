import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async jwt(token, user, account) {
      try {
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        throw error; // Re-throw the error to ensure the sign-in process fails
      }
    },
    async session(session, token) {
      try {
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        throw error; // Re-throw the error to ensure the sign-in process fails
      }
    },
  },
})

export { handler as POST, handler as GET }