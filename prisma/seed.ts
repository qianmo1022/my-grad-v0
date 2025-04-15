import { PrismaClient } from '@prisma/client';
import { getAllCars } from '../lib/car-data';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子初始化...');

  try {
    // 清理现有数据
    console.log('清理现有数据...');
    await prisma.$transaction([
      prisma.order.deleteMany({}),
      prisma.savedConfiguration.deleteMany({}),
      prisma.browsingHistory.deleteMany({}),
      prisma.userPreference.deleteMany({}),
      prisma.car.deleteMany({}),
      prisma.user.deleteMany({}),
      prisma.dealer.deleteMany({}),
      prisma.salesData.deleteMany({}),
      prisma.customer.deleteMany({}),
      prisma.review.deleteMany({}),
      prisma.notification.deleteMany({}),
      prisma.carFeature.deleteMany({}),
      prisma.carConfigOption.deleteMany({}),
      prisma.carConfigCategory.deleteMany({})
    ]);

    // 导入汽车数据
    console.log('导入汽车数据...');
    const carModels = await getAllCars();
    for (const car of carModels) {
      await prisma.car.create({
        data: {
          id: car.id,
          name: car.name,
          basePrice: car.basePrice,
          description: car.description,
          thumbnail: car.thumbnail,
          defaultColor: car.defaultColor,
        },
      });
    }

    // 创建测试用户
    console.log('创建测试用户...');
    const testUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 密码: password
        firstName: '张',
        lastName: '三',
      },
    });

    // 创建测试商家
    console.log('创建测试商家...');
    const testDealer = await prisma.dealer.create({
      data: {
        email: 'dealer@example.com',
        password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 密码: password
        name: '示例汽车经销商',
        businessId: 'BUS123456789',
        phone: '13800138000',
      },
    });

    // 创建用户偏好
    console.log('创建用户偏好...');
    const preferences = [
      { name: '加速性能', value: 4 },
      { name: '操控性', value: 5 },
      { name: '座椅舒适度', value: 3 },
      { name: '娱乐系统', value: 4 },
      { name: '外观设计', value: 5 },
      { name: '价格', value: 3 },
    ];

    for (const pref of preferences) {
      await prisma.userPreference.create({
        data: {
          name: pref.name,
          value: pref.value,
          userId: testUser.id,
        },
      });
    }

    // 创建浏览历史
    console.log('创建浏览历史...');
    const cars = await prisma.car.findMany();
    for (const car of cars) {
      await prisma.browsingHistory.create({
        data: {
          duration: Math.floor(Math.random() * 300) + 60, // 60-360秒
          userId: testUser.id,
          carId: car.id,
        },
      });
    }

    // 创建保存的配置
    console.log('创建保存的配置...');
    await prisma.savedConfiguration.create({
      data: {
        options: {
          'exterior-color': 'red',
          'wheels': 'sport',
          'interior': 'premium',
          'tech-package': 'advanced',
        },
        userId: testUser.id,
        carId: cars[0].id,
      },
    });

    // 创建销售数据
    console.log('创建销售数据...');
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    await prisma.salesData.create({
      data: {
        date: today,
        revenue: 150000,
        orderCount: 5,
        period: 'weekly',
        dealerId: testDealer.id,
      },
    });

    await prisma.salesData.create({
      data: {
        date: lastWeek,
        revenue: 120000,
        orderCount: 4,
        period: 'weekly',
        dealerId: testDealer.id,
      },
    });

    console.log('数据库种子初始化完成！');
  } catch (error) {
    console.error('数据库种子初始化失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });