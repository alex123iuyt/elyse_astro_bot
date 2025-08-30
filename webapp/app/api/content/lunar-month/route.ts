import { NextRequest, NextResponse } from 'next/server'
import * as AE from 'astronomy-engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getMoonPhaseIcon(phasePercent: number): string {
  if (phasePercent < 0.125) return '🌑' // New Moon
  if (phasePercent < 0.25) return '🌒' // Waxing Crescent
  if (phasePercent < 0.375) return '🌓' // First Quarter
  if (phasePercent < 0.5) return '🌔' // Waxing Gibbous
  if (phasePercent < 0.625) return '🌕' // Full Moon
  if (phasePercent < 0.75) return '🌖' // Waning Gibbous
  if (phasePercent < 0.875) return '🌗' // Last Quarter
  return '🌘' // Waning Crescent
}

function getMoonPhaseName(phasePercent: number): string {
  if (phasePercent < 0.125) return 'Новолуние'
  if (phasePercent < 0.25) return 'Растущий серп'
  if (phasePercent < 0.375) return 'Первая четверть'
  if (phasePercent < 0.5) return 'Растущая луна'
  if (phasePercent < 0.625) return 'Полнолуние'
  if (phasePercent < 0.75) return 'Убывающая луна'
  if (phasePercent < 0.875) return 'Последняя четверть'
  return 'Стареющий серп'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    
    const items = []
    
    // Get number of days in month
    const daysInMonth = new Date(year, month, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
      
      try {
        // Calculate moon phase for this date
        const phase = AE.MoonPhase(new AE.AstroTime(date))
        const phasePercent = (phase / 360) * 100
        
        // Calculate moon sign (simplified)
        const moonLongitude = AE.EclipticLongitude(AE.Body.Moon, new AE.AstroTime(date))
        const moonSign = Math.floor(moonLongitude / 30)
        const signNames = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы']
        
        items.push({
          dateISO: date.toISOString().split('T')[0],
          day: day,
          phasePercent: Math.round(phasePercent),
          phaseName: getMoonPhaseName(phasePercent),
          icon: getMoonPhaseIcon(phasePercent),
          moonSign: signNames[moonSign]
        })
      } catch (error) {
        // Fallback for calculation errors
        items.push({
          dateISO: date.toISOString().split('T')[0],
          day: day,
          phasePercent: 50,
          phaseName: 'Полнолуние',
          icon: '🌕',
          moonSign: 'Овен'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        items
      }
    })
    
  } catch (error) {
    console.error('Lunar month calculation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Ошибка расчёта лунного месяца'
    }, { status: 500 })
  }
}


