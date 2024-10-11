import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';

interface ExtendedToken extends JWT {
  accessToken?: string; // Add the accessToken field
}

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: { scope: "read:user user:email" }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Ensure account is defined before accessing its properties
      if (account) {
        token.accessToken = account.access_token as string; // Use type assertion here
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = (token as ExtendedToken).accessToken; // Type assertion for token
      return session;
    },
  },
});