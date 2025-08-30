"use client";

import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Stories from '../../components/today/Stories'
import Forecast from '../../components/today/Forecast'
import LunarCalendar from '../../components/today/LunarCalendar'
import Banner from '../../components/today/Banner'
import BottomNav from '../../components/BottomNav'
import { useUser } from '../../store/user'

// Типы для данных из CMS
interface StorySlide {
  id: string;
  kind: 'text' | 'image' | 'video';
  title?: string;
  text?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  durationMs: number;
}

interface Story {
  id: string;
  type: 'DAILY_TIPS' | 'DO_DONT' | 'TODAYS_LUCK';
  title: string;
  category: string;
  slides: StorySlide[];
  publishedAt: string;
}

interface ForecastData {
  id: string;
  title: string;
  transitsCount: number;
  transits: Array<{
    planet: string;
    sign: string;
    house: number;
    aspect: string;
  }>;
  focus: Array<{
    category: string;
    description: string;
  }>;
  troubles: Array<{
    category: string;
    description: string;
  }>;
  emotionalShifts: {
    title: string;
    description: string;
  };
  careerDynamics: {
    title: string;
    description: string;
  };
  publishedAt: string;
}

interface LunarData {
  currentPhase: {
    name: string;
    percentage: number;
    sign: string;
    date: string;
  };
  monthRange: {
    start: string;
    end: string;
  };
  phases: Array<{
    date: string;
    phase: string;
    sign: string;
    icon: string;
  }>;
}

interface BannerData {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaAction: string;
  ctaLink: string;
}

export default function TodayPage() {
  const { profile } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState<{
    stories: Story[]
    forecast: ForecastData | null
    lunar: LunarData | null
    banner: BannerData | null
  }>({
    stories: [],
    forecast: null,
    lunar: null,
    banner: null,
  })

  // Загружаем контент из CMS
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true)
        const today = new Date().toISOString().split('T')[0]
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

        // Загружаем все данные параллельно
        const [storiesRes, forecastRes, lunarRes, bannerRes] = await Promise.all([
          fetch(`/api/content/stories?date=${today}&tz=${tz}`),
          fetch(`/api/content/forecast?date=${today}&tz=${tz}`),
          fetch(`/api/content/lunar/month?date=${today}&tz=${tz}`),
          fetch(`/api/content/banner?type=CHAT_ASTROLOGER`),
        ])

        if (storiesRes.ok) {
          const storiesData = await storiesRes.json()
          if (storiesData.success) {
            setContent(prev => ({ ...prev, stories: storiesData.data }))
          }
        }

        if (forecastRes.ok) {
          const forecastData = await forecastRes.json()
          if (forecastData.success) {
            setContent(prev => ({ ...prev, forecast: forecastData.data }))
          }
        }

        if (lunarRes.ok) {
          const lunarData = await lunarRes.json()
          if (lunarData.success) {
            setContent(prev => ({ ...prev, lunar: lunarData.data }))
          }
        }

        if (bannerRes.ok) {
          const bannerData = await bannerRes.json()
          if (bannerData.success) {
            setContent(prev => ({ ...prev, banner: bannerData.data }))
          }
        }

      } catch (error) {
        console.error('Error loading content:', error)
        // В случае ошибки показываем fallback контент
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [])

  // Fallback данные если CMS недоступен
  const fallbackStories: Story[] = [
    {
      id: 'story_001',
      type: 'DAILY_TIPS',
      title: 'Совет дня',
      category: 'ЛЮБОВЬ',
      slides: [
        {
          id: 'slide_001',
          kind: 'text',
          title: 'Любовь',
          text: "Не считайте ошибки. Вместо этого благодарите людей, которых любите.",
          backgroundImage: 'https://images.unsplash.com/photo-1519120944692-1a8d8cfc1056?q=80&w=1200&auto=format&fit=crop',
          backgroundColor: '#1a1a2e',
          textColor: '#ffffff',
          durationMs: 5000
        }
      ],
      publishedAt: new Date().toISOString()
    },
    {
      id: 'story_002',
      type: 'DO_DONT',
      title: 'Делай / Не делай',
      category: 'БАЛАНС',
      slides: [
        {
          id: 'slide_002',
          kind: 'text',
          title: 'Баланс',
          text: 'Делай: Практикуй осознанность. Не делай: Торопись с решениями.',
          backgroundImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
          backgroundColor: '#16213e',
          textColor: '#ffffff',
          durationMs: 5000
        }
      ],
      publishedAt: new Date().toISOString()
    },
    {
      id: 'story_003',
      type: 'TODAYS_LUCK',
      title: 'Удача сегодня',
      category: 'ФОРТУНА',
      slides: [
        {
          id: 'slide_003',
          kind: 'text',
          title: 'Фортуна',
          text: 'Ваше счастливое число 7. Фокусируйтесь на новых начинаниях.',
          backgroundImage: 'https://images.unsplash.com/photo-1520248730239-095647cc37f1?q=80&w=1200&auto=format&fit=crop',
          backgroundColor: '#0f3460',
          textColor: '#ffffff',
          durationMs: 5000
        }
      ],
      publishedAt: new Date().toISOString()
    }
  ]

  const fallbackForecast: ForecastData = {
    id: 'forecast_001',
    title: 'Навигация через перемены',
    transitsCount: 5,
    transits: [
      {
        planet: 'МАРС',
        sign: 'ВЕСЫ',
        house: 7,
        aspect: 'ТРИН'
      },
      {
        planet: 'ЮПИТЕР',
        sign: 'ТЕЛЕЦ',
        house: 2,
        aspect: 'КВАДРАТ'
      }
    ],
    focus: [
      {
        category: 'РЕШИМОСТЬ',
        description: 'Ваша сила воли сильна сегодня'
      },
      {
        category: 'ТВОРЧЕСТВО',
        description: 'Художественное вдохновение течет свободно'
      },
      {
        category: 'ОБЩЕНИЕ',
        description: 'Выражайте свои мысли ясно'
      }
    ],
    troubles: [
      {
        category: 'КОНФЛИКТ',
        description: 'Избегайте ненужных споров'
      },
      {
        category: 'НЕДОРАЗУМЕНИЕ',
        description: 'Дважды проверяйте важные сообщения'
      },
      {
        category: 'СТРЕСС',
        description: 'Делайте перерывы при необходимости'
      }
    ],
    emotionalShifts: {
      title: 'Эмоциональные изменения впереди',
      description: 'Ваши эмоции могут чувствоваться усиленными сегодня, когда луна выравнивается со Скорпионом. Это благоприятное время для самоанализа, но будьте осторожны с потенциальными разногласиями, особенно в личных отношениях.'
    },
    careerDynamics: {
      title: 'Карьерная динамика',
      description: 'Марс в Весах указывает на потенциальные конфликты на работе. Оставайтесь спокойными и выбирайте свои битвы мудро. Понимание различных перспектив будет жизненно важным для избежания ненужного напряжения.'
    },
    publishedAt: new Date().toISOString()
  }

  const fallbackLunar: LunarData = {
    currentPhase: {
      name: 'Растущий серп',
      percentage: 25,
      sign: 'СКОРПИОН',
      date: new Date().toISOString()
    },
    monthRange: {
      start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString()
    },
    phases: [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        phase: 'НОВОЛУНИЕ',
        sign: 'КОЗЕРОГ',
        icon: '🌑'
      },
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        phase: 'ПЕРВАЯ ЧЕТВЕРТЬ',
        sign: 'ОВЕН',
        icon: '🌓'
      },
      {
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        phase: 'ПОЛНОЛУНИЕ',
        sign: 'ЛЕВ',
        icon: '🌕'
      },
      {
        date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        phase: 'ПОСЛЕДНЯЯ ЧЕТВЕРТЬ',
        sign: 'СКОРПИОН',
        icon: '🌗'
      }
    ]
  }

  const fallbackBanner: BannerData = {
    id: 'banner_001',
    type: 'CHAT_ASTROLOGER',
    title: 'Астрокартография',
    subtitle: 'Где на Земле я найду любовь, деньги и карьерный успех?',
    backgroundImage: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop',
    ctaText: 'Получить ответ',
    ctaAction: 'CHAT_ADVISOR',
    ctaLink: '/chat'
  }

  // Используем данные из CMS или fallback
  const stories = content.stories.length > 0 ? content.stories : fallbackStories
  const forecast = content.forecast || fallbackForecast
  const lunar = content.lunar || fallbackLunar
  const banner = content.banner || fallbackBanner

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем контент...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header 
        name={profile.name} 
        tags={["☉ Virgo", "↑ Libra", "☾ Scorpio"]}
        onOpenSettings={() => window.location.href = "/settings"}
        onOpenPremium={() => window.location.href = "/profile"}
      />
      <div className="p-4 space-y-6 pb-24">
        {/* 1. Stories - перемещены наверх */}
        <Stories stories={stories} />
        
        {/* 2. Forecast */}
        <Forecast forecast={forecast} />
        
        {/* 3. Lunar Calendar */}
        <LunarCalendar lunarData={lunar} />
        
        {/* 4. Banner */}
        <Banner banner={banner} />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </>
  )
}


