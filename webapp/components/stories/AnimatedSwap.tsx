"use client";

import { motion, AnimatePresence } from 'framer-motion'

export default function AnimatedSwap({ index, direction, children }: {
  index: number; direction: 'forward'|'backward'|'none'; children: React.ReactNode
}) {
  const isStoryTransition = direction !== 'none'
  
  if (isStoryTransition) {
    // 3D flip animation for story transitions
    const rotateY = direction === 'forward' ? -90 : 90
    
    return (
      <div className="flip-stage" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="flip-face w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ 
              opacity: 0, 
              rotateY: rotateY,
              scale: 0.95
            }}
            animate={{ 
              opacity: 1, 
              rotateY: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              rotateY: -rotateY,
              scale: 0.95
            }}
            transition={{ 
              duration: 0.35, 
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  } else {
    // Simple slide transition for slides within same story
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ 
            opacity: 0, 
            x: 20,
            scale: 0.98
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            x: -20,
            scale: 0.98
          }}
          transition={{ 
            duration: 0.25, 
            ease: [0.4, 0.0, 0.2, 1]
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }
}


