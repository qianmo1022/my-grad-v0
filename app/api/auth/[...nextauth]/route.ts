import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
        type: { label: '用户类型', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.type) {
          return null;
        }

        try {
          if (credentials.type === 'user') {
            // 查找用户
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user) {
              return null;
            }

            // 验证密码
            const passwordMatch = await bcrypt.compare(credentials.password, user.password);
            if (!passwordMatch) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              type: 'user'
            };
          } else if (credentials.type === 'dealer') {
            // 查找商家
            const dealer = await prisma.dealer.findUnique({
              where: { email: credentials.email },
            });

            if (!dealer) {
              return null;
            }

            // 验证密码
            const passwordMatch = await bcrypt.compare(credentials.password, dealer.password);
            if (!passwordMatch) {
              return null;
            }

            return {
              id: dealer.id,
              email: dealer.email,
              name: dealer.name,
              type: 'dealer'
            };
          }
          
          return null;
        } catch (error) {
          console.error('认证错误:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.type = token.type as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  secret: process.env.AUTH_SECRET,
});

export { handler as GET, handler as POST };