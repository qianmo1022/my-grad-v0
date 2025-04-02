import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 删除保存的配置
export async function DELETE(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求URL中的参数
    const url = new URL(request.url);
    const configId = url.searchParams.get('configId');
    
    if (!configId) {
      return NextResponse.json({ error: '缺少配置ID参数' }, { status: 400 });
    }
    
    // 查找配置并验证所有权
    const savedConfig = await prisma.savedConfiguration.findUnique({
      where: { id: configId },
    });
    
    if (!savedConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }
    
    // 验证用户是否为配置的所有者
    if (savedConfig.userId !== session.user.id) {
      return NextResponse.json({ error: '无权删除此配置' }, { status: 403 });
    }
    
    // 删除配置
    await prisma.savedConfiguration.delete({
      where: { id: configId },
    });
    
    // 返回成功消息
    return NextResponse.json({ success: true, message: '配置已成功删除' });
  } catch (error) {
    console.error('删除配置失败:', error);
    return NextResponse.json({ error: '删除配置失败' }, { status: 500 });
  }
}