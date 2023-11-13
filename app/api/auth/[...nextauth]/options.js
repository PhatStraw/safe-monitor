import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sql } from '@vercel/postgres';

async function saveUser(user) {
  const { email, name, google_id } = user;

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM Users WHERE email = ${email}
    `;

    // If user exists, return the user
    if (existingUser.rowCount > 0) {
      return existingUser.rows[0];
    }

    // If user doesn't exist, insert new user
    const { rows } = await sql`
      INSERT INTO Users (email, name, google_id)
      VALUES (${email}, ${name}, ${google_id})
      RETURNING *;
    `;

    return rows[0];
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export const options = {
  debug: true,
  events: {
    signIn(message) {
      console.log("signin message", message);
    },
    signOut(message) {
      console.log("SIGNOUT====", message);
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
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({user, account, profile}) {
      try {
        const savedUser = await saveUser({
          email: user.email,
          name: user.name,
          google_id: account.providerAccountId,
        });
  
        console.log('Saved user:', savedUser);
      } catch (error) {
        console.error('Error in sign-in callback:', error);
        return Promise.reject(new Error('Failed to save user'));
      }
  
      return Promise.resolve(true);
    },
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
