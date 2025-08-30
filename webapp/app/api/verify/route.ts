import { NextRequest, NextResponse } from 'next/server'
import { verifyInitData } from '../../../lib/verifyInitData'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const botToken = process.env.BOT_TOKEN || ''
  const ok = botToken ? await verifyInitData(body, botToken) : false
  return NextResponse.json({ ok })
}


