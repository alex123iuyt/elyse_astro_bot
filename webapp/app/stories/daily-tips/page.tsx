"use client";

import StoriesPlayer from '../../../components/stories/StoriesPlayer'

type Slide = { title: string; text: string; image: string }
type Story = { id: string; label: string; icon: string; slides: Slide[] }

const STORIES: Story[] = [
  {
    id: 'love', 
    label: 'Love', 
    icon: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=64&auto=format&fit=crop',
    slides: [
      { 
        title: 'Love', 
        text: "Don't be afraid to open up and be vulnerable. Vulnerability can bring you closer together and strengthen your love.", 
        image: 'https://images.unsplash.com/photo-1615716172518-c9a3e14f8b51?q=80&w=1200&auto=format&fit=crop' 
      },
      {
        title: 'Connection',
        text: 'True intimacy comes from sharing your authentic self. Let your partner see the real you.',
        image: 'https://images.unsplash.com/photo-1519120944692-1a8d8cfc1056?q=80&w=1200&auto=format&fit=crop'
      },
      {
        title: 'Trust',
        text: 'Building trust takes time and patience. Be consistent in your words and actions.',
        image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'warnings', 
    label: 'Warnings', 
    icon: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=64&auto=format&fit=crop',
    slides: [
      { 
        title: 'Warnings', 
        text: 'Your thoughts are often focused on other people. Take time to focus on your own life.', 
        image: 'https://images.unsplash.com/photo-1517346651511-022c64145e83?q=80&w=1200&auto=format&fit=crop' 
      },
      {
        title: 'Boundaries',
        text: 'Learn to say no without guilt. Your energy is precious and should be protected.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop'
      },
      {
        title: 'Self-Care',
        text: 'Neglecting yourself while helping others leads to burnout. Put on your oxygen mask first.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'work', 
    label: 'Work', 
    icon: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=64&auto=format&fit=crop',
    slides: [
      { 
        title: 'Work', 
        text: "Save the moment — don't let thoughts like 'I don't feel like I'm ready' get in your way.", 
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' 
      },
      {
        title: 'Preparation',
        text: 'Preparation breeds confidence. The more you prepare, the less you fear.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop'
      },
      {
        title: 'Action',
        text: 'Perfection is the enemy of progress. Start where you are, use what you have, do what you can.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'recommendations', 
    label: 'Recommendations', 
    icon: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=64&auto=format&fit=crop',
    slides: [
      { 
        title: 'Recommendations', 
        text: 'One of the best ways to develop a mindset for success is to train yourself never to hesitate to take on a challenge.', 
        image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop' 
      },
      {
        title: 'Growth Mindset',
        text: 'Embrace challenges as opportunities to grow. Every obstacle is a stepping stone to success.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop'
      },
      {
        title: 'Persistence',
        text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop'
      }
    ]
  }
]

export default function DailyTipsStories() {
  // Каждая история = 1 шаг; убираем полу-кадры: берём только первый слайд каждой истории
  const oneStepStories = STORIES.map(s => ({ ...s, slides: s.slides.slice(0,1) }));
  return <StoriesPlayer stories={oneStepStories} onClose={() => history.back()} />
}


