export type Slide = { title: string; text: string; image: string }

export default function StorySlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Text content section */}
      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
          {slide.title}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed opacity-90 max-w-[46ch]">
          {slide.text}
        </p>
      </div>
      
      {/* Image section */}
      <div className="flex-shrink-0">
        <img 
          src={slide.image} 
          alt={slide.title} 
          className="w-full h-auto max-h-[60vh] object-cover object-center"
        />
      </div>
    </div>
  )
}


