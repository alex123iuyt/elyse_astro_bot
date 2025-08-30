export default function ProgressBars({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex gap-1.5 px-4 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/20">
          <div 
            className={`h-full bg-emerald-200 transition-all duration-300 ease-out ${
              i < active ? 'w-full' : i === active ? 'w-1/2' : 'w-0'
            }`} 
          />
        </div>
      ))}
    </div>
  )
}


