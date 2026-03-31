import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const { tekst } = await req.json()
  const hash = createHash('sha256').update(tekst).digest('hex')
  return NextResponse.json({ hash })
}