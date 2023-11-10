import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const options = {
  debug: true,
  events: {
    signIn(message) {
      console.log('signin message', message)
    },
    signOut(message) {
      console.log("SIGNOUT====",message)
    },
  },
  providers: [
    GoogleProvider({
      profile(profile) {
        console.log("Profile Google: ", profile);

        let userRole = "Google User";
        return {
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid profile email https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
    //   console.log("Token:", token);
    //   console.log("Account:", account);
    //   console.log("User:", user);
      try {
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.tokenType = account.token_type;
          token.expiryDate = account.expires_at
            ? Date.now() + account.expires_at * 1000
            : null;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        throw error; // Re-throw the error to ensure the sign-in process fails
      }
    },
    async session({ session, user, token }) {
    //   console.log("Session:", session);
    //   console.log("User:", user);
    //   console.log("Token:", token);
      try {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.tokenType = token.tokenType;
        session.expiryDate = token.expiryDate;
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        throw error; // Re-throw the error to ensure the sign-in process fails
      }
    },
  },
};