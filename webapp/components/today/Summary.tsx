import type { Summary } from '../../data/today'
import Link from 'next/link'

export default function SummaryCard({ data }: { data: Summary }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4">
        <div className="opacity-80">Horoscope</div>
        <div className="text-3xl font-serif mt-2">Navigating today's challenges</div>
        <div className="mt-3 inline-flex items-center gap-3 px-3 py-2 rounded-full bg-white/10">
          <span>🪐🪐🪐</span>
          <span className="opacity-90">Transits influencing: {data.transitsCount}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="text-emerald-400 text-xl mb-2">Focus</div>
            <ul className="space-y-1 opacity-90">
              {data.focus.map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-rose-400 text-xl mb-2">Troubles</div>
            <ul className="space-y-1 opacity-90">
              {data.troubles.map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
        </div>

        {data.leadTitle && <div className="mt-6 text-xl font-semibold">{data.leadTitle}</div>}
        <div className="space-y-3 opacity-90 mt-2">
          {data.leadParagraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      <div className="bg-white/5 p-4">
        <Link href="/forecasts" className="btn w-full text-center">More Insights for me</Link>
      </div>
    </div>
  )
}















