const fs = require('fs');
const path = require('path');

// 读取package.json文件
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 添加prisma相关脚本
packageJson.scripts = {
  ...packageJson.scripts,
  "prisma:generate": "prisma generate",
  "prisma:push": "prisma db push",
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
};

// 添加prisma依赖
packageJson.devDependencies = {
  ...packageJson.devDependencies,
  "ts-node": "^10.9.2"
};

// 写回package.json文件
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('package.json已更新，添加了Prisma种子脚本配置');