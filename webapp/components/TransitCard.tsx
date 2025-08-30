export function TransitCard({ title, description, leftIcon, rightIcon }: { title: string; description: string; leftIcon: string; rightIcon: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{leftIcon}</div>
        <div className="text-2xl">{rightIcon}</div>
      </div>
      <div className="mt-3 text-xl font-semibold">{title}</div>
      <div className="opacity-80 mt-1 text-sm">{description}</div>
      <div className="mt-3">
        <button className="btn">See more</button>
      </div>
    </div>
  )
}















