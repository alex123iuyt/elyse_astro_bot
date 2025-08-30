import ProgressBars from './ProgressBars'

export default function StoryHeader({ label, icon, total, active, onClose }: {
  label: string; icon: string; total: number; active: number; onClose: () => void
}) {
  return (
    <div className="relative">
      <ProgressBars total={total} active={active} />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={icon} alt="icon" className="w-8 h-8 rounded-full" />
          <div className="text-sm opacity-90">Daily Tips • <span className="font-medium">{label}</span></div>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xl">×</button>
      </div>
    </div>
  )
}















