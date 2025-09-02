import type { AltHoroscope, LunarPhase } from '../../data/today'

export default function LunarAlt({ lunar, alts }: { lunar: LunarPhase[]; alts: AltHoroscope[] }) {
  const icon = (p: LunarPhase['phase']) => p==='new'?'🌑':p==='full'?'🌕':p==='waxing'?'🌓':'🌗'
  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold opacity-90 mb-2">Lunar calendar</div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {lunar.map(x => (
            <div key={x.dateISO} className="card min-w-28 text-center">
              <div className="text-2xl">{icon(x.phase)}</div>
              <div className="opacity-80 text-sm">{x.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold opacity-90 mb-2">Alternative horoscopes</div>
        <div className="grid grid-cols-3 gap-3">
          {alts.map(a => (
            <button key={a.id} className="card aspect-square overflow-hidden">
              <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
              <div className="mt-2 text-sm">{a.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


















