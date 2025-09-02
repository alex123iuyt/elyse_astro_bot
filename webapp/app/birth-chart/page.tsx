import { DatePickerRow } from '../../components/DatePickerRow'
import { TransitCard } from '../../components/TransitCard'

export default function BirthChartHome() {
  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-5">
      <div className="text-3xl font-serif">Birth Chart</div>

      <div className="grid grid-cols-2 gap-2">
        <button className="card bg-white/20">Daily Transits</button>
        <button className="card bg-white/5">Your Chart</button>
      </div>

      <DatePickerRow />

      <div className="card border-dashed">
        <div className="text-lg font-semibold">Why should you care about transits and aspects?</div>
      </div>

      <div className="space-y-3">
        <TransitCard
          title="Sun Sextile Your Moon"
          description="The Sun sextiles your natal Moon forming a delightfully balanced cosmic dance."
          leftIcon="☉"
          rightIcon="☾"
        />
        <TransitCard
          title="Sun Conjunction Your Mars"
          description="Vitality meets drive — channel the energy constructively."
          leftIcon="☉"
          rightIcon="♂"
        />
      </div>
    </div>
  )
}

















