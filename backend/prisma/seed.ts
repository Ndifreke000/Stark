import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@starknet.io' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@starknet.io',
      password_hash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create analyst user
  const analystPassword = await bcrypt.hash('analyst123', 10);
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@starknet.io' },
    update: {},
    create: {
      name: 'John Analyst',
      email: 'analyst@starknet.io',
      password_hash: analystPassword,
      role: Role.ANALYST,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@starknet.io' },
    update: {},
    create: {
      name: 'Jane User',
      email: 'user@starknet.io',
      password_hash: userPassword,
      role: Role.USER,
    },
  });

  // Create sample bounties
  const bounty1 = await prisma.bounty.create({
    data: {
      title: 'Starknet Transaction Analysis',
      description: 'Analyze the transaction patterns on Starknet mainnet for the last 30 days. Focus on gas usage trends and popular contract interactions.',
      reward_amount: 500.0,
      created_by: admin.id,
    },
  });

  const bounty2 = await prisma.bounty.create({
    data: {
      title: 'DeFi Protocol Comparison',
      description: 'Compare the top 3 DeFi protocols on Starknet in terms of TVL, user adoption, and security features. Provide detailed analysis with charts.',
      reward_amount: 750.0,
      created_by: admin.id,
    },
  });

  const bounty3 = await prisma.bounty.create({
    data: {
      title: 'Cairo Contract Optimization Study',
      description: 'Research and document best practices for optimizing Cairo smart contracts for gas efficiency and performance.',
      reward_amount: 1000.0,
      created_by: admin.id,
    },
  });

  // Create sample submissions
  await prisma.submission.create({
    data: {
      bounty_id: bounty1.id,
      analyst_id: analyst.id,
      link_to_work: 'https://github.com/analyst/starknet-tx-analysis',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Sample accounts created:');
  console.log('👤 Admin: admin@starknet.io / admin123');
  console.log('🔍 Analyst: analyst@starknet.io / analyst123');
  console.log('👨‍💻 User: user@starknet.io / user123');
  console.log('\n🎯 Sample bounties and submissions created!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });