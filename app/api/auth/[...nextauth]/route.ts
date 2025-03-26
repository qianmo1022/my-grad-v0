import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// 使用外部authOptions配置创建处理程序
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };