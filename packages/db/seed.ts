import { PrismaClient, Status, UserRole, BgType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean up existing data
  await prisma.auditLog.deleteMany()
  await prisma.contentVersion.deleteMany()
  await prisma.caseTag.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.leadFormConfig.deleteMany()
  await prisma.promo.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.featureBlock.deleteMany()
  await prisma.heroBlock.deleteMany()
  await prisma.mediaAsset.deleteMany()
  await prisma.faqItem.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.post.deleteMany()
  await prisma.author.deleteMany()
  await prisma.service.deleteMany()
  await prisma.case.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.page.deleteMany()
  await prisma.navItem.deleteMany()
  await prisma.botContent.deleteMany()
  await prisma.siteSettings.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned up existing data')

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@elyse.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@elyse.com',
      name: 'Editor User',
      role: UserRole.EDITOR,
    },
  })

  console.log('👥 Created users')

  // Create site settings
  const siteSettings = await prisma.siteSettings.create({
    data: {
      siteName: 'Elyse Astro Bot',
      logo: '/logo.png',
      footerText: '© 2025 Elyse Astro Bot. Все права защищены.',
      contacts: {
        email: 'info@elyse.com',
        phone: '+7 (999) 123-45-67',
        tg: '@elyse_support'
      },
      social: [
        { platform: 'telegram', url: 'https://t.me/elyse_bot' },
        { platform: 'instagram', url: 'https://instagram.com/elyse' }
      ],
      defaultSEO: {
        title: 'Elyse Astro Bot - Персональный астролог',
        description: 'Получите персональный гороскоп и астрологические прогнозы',
        image: '/og-image.jpg'
      }
    }
  })

  console.log('⚙️ Created site settings')

  // Create navigation items
  const navItems = await Promise.all([
    prisma.navItem.create({
      data: { label: 'Главная', href: '/', order: 1, visible: true }
    }),
    prisma.navItem.create({
      data: { label: 'Услуги', href: '/services', order: 2, visible: true }
    }),
    prisma.navItem.create({
      data: { label: 'Кейсы', href: '/cases', order: 3, visible: true }
    }),
    prisma.navItem.create({
      data: { label: 'Блог', href: '/blog', order: 4, visible: true }
    }),
    prisma.navItem.create({
      data: { label: 'О нас', href: '/about', order: 5, visible: true }
    }),
    prisma.navItem.create({
      data: { label: 'Контакты', href: '/contacts', order: 6, visible: true }
    })
  ])

  console.log('🧭 Created navigation items')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Астрология', slug: 'astrology' } }),
    prisma.tag.create({ data: { name: 'Гороскоп', slug: 'horoscope' } }),
    prisma.tag.create({ data: { name: 'Нумерология', slug: 'numerology' } }),
    prisma.tag.create({ data: { name: 'Таро', slug: 'tarot' } }),
    prisma.tag.create({ data: { name: 'Психология', slug: 'psychology' } })
  ])

  console.log('🏷️ Created tags')

  // Create hero block
  const heroBlock = await prisma.heroBlock.create({
    data: {
      headline: 'Персональный астролог в вашем кармане',
      subheadline: 'Получите точные прогнозы и персональные рекомендации от ИИ-астролога',
      ctaText: 'Начать консультацию',
      ctaHref: '/consultation',
      bgType: BgType.GRADIENT,
      bgRef: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlay: false,
      variant: 'default'
    }
  })

  console.log('🎯 Created hero block')

  // Create feature block
  const featureBlock = await prisma.featureBlock.create({
    data: {
      title: 'Почему выбирают Elyse?',
      items: [
        {
          icon: '🌟',
          title: 'Точность прогнозов',
          text: 'Используем современные астрологические алгоритмы'
        },
        {
          icon: '🔮',
          title: 'Персональный подход',
          text: 'Учитываем вашу дату рождения и время'
        },
        {
          icon: '📱',
          title: 'Удобство использования',
          text: 'Доступно 24/7 в Telegram'
        }
      ]
    }
  })

  console.log('✨ Created feature block')

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: 'Персональный гороскоп',
        slug: 'personal-horoscope',
        icon: '🌟',
        excerpt: 'Полный анализ вашей натальной карты',
        content: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Детальный анализ вашей натальной карты с учетом времени и места рождения.'
            }
          ]
        },
        priceFrom: 1500,
        features: [
          'Анализ планет в знаках',
          'Аспекты и их влияние',
          'Персональные рекомендации'
        ],
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        updatedById: adminUser.id
      }
    }),
    prisma.service.create({
      data: {
        title: 'Прогноз на месяц',
        slug: 'monthly-forecast',
        icon: '📅',
        excerpt: 'Что ждет вас в ближайший месяц',
        content: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Ежемесячный прогноз с учетом транзитов планет.'
            }
          ]
        },
        priceFrom: 800,
        features: [
          'Транзиты планет',
          'Благоприятные периоды',
          'Советы по планированию'
        ],
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        updatedById: adminUser.id
      }
    }),
    prisma.service.create({
      data: {
        title: 'Совместимость партнеров',
        slug: 'compatibility',
        icon: '💕',
        excerpt: 'Анализ совместимости в отношениях',
        content: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Глубокий анализ совместимости двух людей по астрологическим показателям.'
            }
          ]
        },
        priceFrom: 2000,
        features: [
          'Синнастри',
          'Анализ аспектов',
          'Рекомендации для пары'
        ],
        status: Status.DRAFT,
        updatedById: editorUser.id
      }
    })
  ])

  console.log('🛠️ Created services')

  // Create cases
  const cases = await Promise.all([
    prisma.case.create({
      data: {
        title: 'Успешный прогноз карьеры',
        slug: 'career-success-case',
        coverImage: '/cases/career.jpg',
        tags: ['astrology', 'career'],
        short: 'Как астрология помогла клиенту найти свое призвание',
        content: {
          blocks: [
            {
              type: 'heading',
              content: 'История успеха'
            },
            {
              type: 'paragraph',
              content: 'Клиент обратился за консультацией по поводу карьеры...'
            }
          ]
        },
        gallery: ['/cases/career-1.jpg', '/cases/career-2.jpg'],
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        updatedById: adminUser.id
      }
    }),
    prisma.case.create({
      data: {
        title: 'Решение проблем в отношениях',
        slug: 'relationship-healing-case',
        coverImage: '/cases/relationship.jpg',
        tags: ['astrology', 'psychology'],
        short: 'Астрологический анализ помог восстановить отношения',
        content: {
          blocks: [
            {
              type: 'heading',
              content: 'Восстановление отношений'
            },
            {
              type: 'paragraph',
              content: 'Пара обратилась за помощью в сложный период...'
            }
          ]
        },
        gallery: ['/cases/relationship-1.jpg'],
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        updatedById: adminUser.id
      }
    }),
    prisma.case.create({
      data: {
        title: 'Планирование важных событий',
        slug: 'event-planning-case',
        coverImage: '/cases/planning.jpg',
        tags: ['astrology', 'planning'],
        short: 'Выбор оптимальной даты для важного события',
        content: {
          blocks: [
            {
              type: 'heading',
              content: 'Планирование свадьбы'
            },
            {
              type: 'paragraph',
              content: 'Молодожены хотели выбрать идеальную дату...'
            }
          ]
        },
        gallery: [],
        status: Status.DRAFT,
        updatedById: editorUser.id
      }
    })
  ])

  console.log('📁 Created cases')

  // Create author
  const author = await prisma.author.create({
    data: {
      name: 'Елена Астролог',
      avatar: '/authors/elena.jpg',
      bio: 'Профессиональный астролог с 15-летним опытом',
      links: [
        { platform: 'telegram', url: 'https://t.me/elena_astrolog' },
        { platform: 'instagram', url: 'https://instagram.com/elena_astrolog' }
      ]
    }
  })

  console.log('✍️ Created author')

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Как астрология влияет на нашу жизнь',
        slug: 'how-astrology-affects-life',
        cover: '/posts/astrology-life.jpg',
        excerpt: 'Разбираем основные принципы влияния звезд на судьбу человека',
        content: {
          blocks: [
            {
              type: 'heading',
              content: 'Влияние астрологии на жизнь'
            },
            {
              type: 'paragraph',
              content: 'Астрология - это древняя наука, которая изучает...'
            }
          ]
        },
        authorId: author.id,
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        seoTitle: 'Влияние астрологии на жизнь человека',
        seoDescription: 'Узнайте, как звезды влияют на вашу судьбу и как использовать это знание',
        seoImage: '/posts/astrology-life-og.jpg'
      }
    }),
    prisma.post.create({
      data: {
        title: 'Лунный календарь на 2025 год',
        slug: 'lunar-calendar-2025',
        cover: '/posts/lunar-2025.jpg',
        excerpt: 'Важные даты и рекомендации по лунному календарю',
        content: {
          blocks: [
            {
              type: 'heading',
              content: 'Лунный календарь 2025'
            },
            {
              type: 'paragraph',
              content: 'Луна оказывает огромное влияние на нашу жизнь...'
            }
          ]
        },
        authorId: author.id,
        status: Status.DRAFT,
        seoTitle: 'Лунный календарь 2025 - важные даты',
        seoDescription: 'Полный лунный календарь на 2025 год с рекомендациями'
      }
    })
  ])

  console.log('📝 Created posts')

  // Create testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        author: 'Анна К.',
        role: 'Предприниматель',
        avatar: '/testimonials/anna.jpg',
        rating: 5,
        quote: 'Благодаря Elyse я смогла правильно спланировать запуск бизнеса. Все прогнозы сбылись!',
        sourceUrl: 'https://t.me/elyse_reviews',
        visible: true
      }
    }),
    prisma.testimonial.create({
      data: {
        author: 'Михаил С.',
        role: 'IT-специалист',
        avatar: '/testimonials/mikhail.jpg',
        rating: 5,
        quote: 'Отличный сервис! Получаю гороскопы каждый месяц, очень точные.',
        sourceUrl: 'https://t.me/elyse_reviews',
        visible: true
      }
    })
  ])

  console.log('💬 Created testimonials')

  // Create FAQ items
  const faqItems = await Promise.all([
    prisma.faqItem.create({
      data: {
        question: 'Как работает астрологический прогноз?',
        answer: 'Мы используем вашу дату, время и место рождения для создания натальной карты, а затем анализируем транзиты планет.',
        category: 'Общие вопросы',
        order: 1,
        visible: true
      }
    }),
    prisma.faqItem.create({
      data: {
        question: 'Насколько точны ваши прогнозы?',
        answer: 'Точность зависит от качества исходных данных. Чем точнее время рождения, тем точнее прогноз.',
        category: 'Точность',
        order: 2,
        visible: true
      }
    }),
    prisma.faqItem.create({
      data: {
        question: 'Можно ли получить консультацию онлайн?',
        answer: 'Да, все консультации проводятся онлайн через Telegram бота.',
        category: 'Консультации',
        order: 3,
        visible: true
      }
    })
  ])

  console.log('❓ Created FAQ items')

  // Create banner
  const banner = await prisma.banner.create({
    data: {
      title: 'Скидка 20% на первую консультацию!',
      text: 'Успейте получить персональный гороскоп по специальной цене',
      ctaText: 'Получить скидку',
      ctaHref: '/discount',
      placement: 'homepage_top',
      activeFrom: new Date(),
      visible: true
    }
  })

  console.log('🎯 Created banner')

  // Create lead form config
  const leadFormConfig = await prisma.leadFormConfig.create({
    data: {
      fields: [
        { name: 'name', label: 'Имя', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'birthDate', label: 'Дата рождения', type: 'date', required: true },
        { name: 'birthTime', label: 'Время рождения', type: 'time', required: false },
        { name: 'question', label: 'Ваш вопрос', type: 'textarea', required: true }
      ],
      consentText: 'Я согласен на обработку персональных данных',
      successMessage: 'Спасибо! Мы свяжемся с вами в ближайшее время.'
    }
  })

  console.log('📋 Created lead form config')

  // Create bot content
  const botContent = await prisma.botContent.create({
    data: {
      section: 'welcome_message',
      payload: {
        text: 'Добро пожаловать в Elyse Astro Bot! 🌟\n\nЯ помогу вам разобраться в астрологии и получить персональные прогнозы.',
        buttons: [
          { text: 'Получить гороскоп', action: 'get_horoscope' },
          { text: 'Задать вопрос', action: 'ask_question' },
          { text: 'О сервисе', action: 'about_service' }
        ]
      },
      status: Status.PUBLISHED
    }
  })

  console.log('🤖 Created bot content')

  // Create sample page
  const page = await prisma.page.create({
    data: {
      slug: 'about',
      title: 'О нас',
      seoTitle: 'О Elyse Astro Bot - персональный астролог',
      seoDescription: 'Узнайте больше о нашем сервисе персональной астрологии',
      blocks: {
        blocks: [
          {
            type: 'heading',
            content: 'О Elyse Astro Bot'
          },
          {
            type: 'paragraph',
            content: 'Мы создаем персональные астрологические прогнозы с помощью современных технологий.'
          }
        ]
      },
      status: Status.PUBLISHED,
      publishedAt: new Date(),
      updatedById: adminUser.id
    }
  })

  console.log('📄 Created sample page')

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






