import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Инициализация данных подписок и промо видео...');

  try {
    // Создаем тарифные планы
    const plans = [
      {
        name: 'Годовая подписка',
        duration: '365 дней',
        price: 2190,
        pricePerWeek: 42.12,
        savings: 94,
        features: ['Полный доступ ко всем функциям', 'Приоритетная поддержка', 'Эксклюзивный контент'],
        isActive: true,
        isPopular: false
      },
      {
        name: 'Месячная подписка',
        duration: '30 дней',
        price: 799,
        pricePerWeek: 199.75,
        savings: null,
        features: ['Полный доступ ко всем функциям', 'Стандартная поддержка'],
        isActive: true,
        isPopular: false
      },
      {
        name: 'Недельная подписка',
        duration: '7 дней',
        price: 349,
        pricePerWeek: 349,
        savings: null,
        features: ['Полный доступ ко всем функциям'],
        isActive: true,
        isPopular: true
      }
    ];

    console.log('📋 Создаем тарифные планы...');
    
    for (const planData of plans) {
      const plan = await prisma.subscriptionPlan.create({
        data: {
          ...planData,
          features: JSON.stringify(planData.features)
        }
      });
      console.log(`✅ Создан тариф: ${plan.name}`);
    }

    // Создаем промо видео
    console.log('🎬 Создаем промо видео...');
    
    const promoVideo = await prisma.promoVideo.create({
      data: {
        title: 'Познакомьтесь с премиум возможностями',
        description: 'Посмотрите, что вы получите с премиум подпиской - персональные прогнозы, совместимость знаков зодиака и многое другое',
        videoUrl: 'https://example.com/promo-video.mp4',
        thumbnailUrl: 'https://example.com/promo-thumbnail.jpg',
        isActive: true,
        showOnMainPage: true,
        autoPlay: true,
        showOnMobile: true
      }
    });
    
    console.log(`✅ Создано промо видео: ${promoVideo.title}`);

    console.log('🎉 Инициализация завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

