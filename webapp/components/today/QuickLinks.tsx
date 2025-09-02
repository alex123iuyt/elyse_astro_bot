import Link from 'next/link'

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Link href="/tarot" className="card h-36 flex items-end justify-center text-lg hover:bg-white/10 transition" style={{backgroundImage:"url('https://images.unsplash.com/photo-1604882737930-3c9b5a0c0f37?q=80&w=1200&auto=format&fit=crop')", backgroundSize:'cover'}}>
        <span className="bg-black/50 rounded-xl px-4 py-2">Cards of the day</span>
      </Link>
      <Link href="/tarot" className="card h-36 flex items-end justify-center text-lg hover:bg-white/10 transition" style={{backgroundImage:"url('https://images.unsplash.com/photo-1519681390377-2be2b4a56f37?q=80&w=1200&auto=format&fit=crop')", backgroundSize:'cover'}}>
        <span className="bg-black/50 rounded-xl px-4 py-2">Get the Answer</span>
      </Link>
    </div>
  )
}


















