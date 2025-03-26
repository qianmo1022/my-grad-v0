import { PrismaClient } from '@prisma/client';
import { carModels } from '../lib/car-data';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子初始化...');

  // 清理现有数据
  console.log('清理现有数据...');
  await prisma.order.deleteMany({});
  await prisma.savedConfiguration.deleteMany({});
  await prisma.browsingHistory.deleteMany({});
  await prisma.userPreference.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.dealer.deleteMany({});

  // 导入汽车数据
  console.log('导入汽车数据...');
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

  // 创建测试订单
  console.log('创建测试订单...');
  const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  for (let i = 0; i < 5; i++) {
    const car = cars[Math.floor(Math.random() * cars.length)];
    await prisma.order.create({
      data: {
        amount: car.basePrice + Math.floor(Math.random() * 50000),
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        userId: testUser.id,
        dealerId: testDealer.id,
        carId: car.id,
        configuration: {
          'exterior-color': ['black', 'white', 'silver', 'blue', 'red'][Math.floor(Math.random() * 5)],
          'wheels': ['standard', 'sport', 'luxury'][Math.floor(Math.random() * 3)],
        },
      },
    });
  }

  console.log('数据库种子初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据库种子初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });