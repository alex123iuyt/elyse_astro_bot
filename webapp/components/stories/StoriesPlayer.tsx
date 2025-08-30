"use client";

import { useCallback, useMemo, useState } from 'react'
import AnimatedSwap from './AnimatedSwap'
import StoryHeader from './StoryHeader'
import StorySlide, { Slide } from './StorySlide'

type Story = { id: string; label: string; icon: string; slides: Slide[] }

export default function StoriesPlayer({ stories, onClose }: { stories: Story[]; onClose: () => void }) {
  const [storyIndex, setStoryIndex] = useState(0)
  const [slideIndex, setSlideIndex] = useState(0)
  const [flipDir, setFlipDir] = useState<'forward'|'backward'|'none'>('none')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const story = stories[storyIndex]
  const slide = story.slides[slideIndex]

  const goNext = useCallback(() => {
    if (isTransitioning) return
    
    if (slideIndex < story.slides.length - 1) {
      // Next slide within same story
      setSlideIndex(s => s + 1)
    } else if (storyIndex < stories.length - 1) {
      // Next story - trigger 3D flip
      setIsTransitioning(true)
      setFlipDir('forward')
      const nextIdx = storyIndex + 1
      setTimeout(() => { 
        setStoryIndex(nextIdx)
        setSlideIndex(0)
        setFlipDir('none')
        setIsTransitioning(false)
      }, 350) // Match animation duration
    } else {
      // End of all stories
      onClose()
    }
  }, [slideIndex, story.slides.length, storyIndex, stories.length, onClose, isTransitioning])

  const goPrev = useCallback(() => {
    if (isTransitioning) return
    
    if (slideIndex > 0) {
      // Previous slide within same story
      setSlideIndex(s => s - 1)
    } else if (storyIndex > 0) {
      // Previous story - trigger 3D flip
      setIsTransitioning(true)
      setFlipDir('backward')
      const prevIdx = storyIndex - 1
      const lastSlide = stories[prevIdx].slides.length - 1
      setTimeout(() => { 
        setStoryIndex(prevIdx)
        setSlideIndex(lastSlide)
        setFlipDir('none')
        setIsTransitioning(false)
      }, 350) // Match animation duration
    }
  }, [slideIndex, storyIndex, stories, isTransitioning])

  const TapZones = useMemo(() => (
    <>
      <div 
        className="absolute inset-y-0 left-0 w-[35%] cursor-pointer" 
        onClick={goPrev}
        style={{ cursor: isTransitioning ? 'default' : 'pointer' }}
      />
      <div 
        className="absolute inset-y-0 right-0 w-[65%] cursor-pointer" 
        onClick={goNext}
        style={{ cursor: isTransitioning ? 'default' : 'pointer' }}
      />
    </>
  ), [goNext, goPrev, isTransitioning])

  return (
    <div className="fixed inset-0 bg-[#11181b] text-white z-50 overflow-hidden">
      <StoryHeader 
        label={story.label} 
        icon={story.icon} 
        total={story.slides.length} 
        active={slideIndex} 
        onClose={onClose} 
      />
      <div className="relative flex-1">
        <AnimatedSwap 
          index={storyIndex * 100 + slideIndex} 
          direction={flipDir}
        >
          <StorySlide slide={slide} />
        </AnimatedSwap>
        {TapZones}
      </div>
    </div>
  )
}


