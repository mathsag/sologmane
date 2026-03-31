import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_SVC = process.env.SUPABASE_SERVICE_KEY!

const headers = {
  apikey: SB_SVC,
  Authorization: `Bearer ${SB_SVC}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

export async function POST(req: NextRequest) {
  const tabell = req.nextUrl.searchParams.get('tabell')
  if (!tabell) return NextResponse.json({ error: 'Mangler tabell' }, { status: 400 })
  const body = await req.json()
  const r = await fetch(`${SB_URL}/rest/v1/${tabell}`, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await r.json()
  return NextResponse.json(data, { status: r.status })
}

export async function PATCH(req: NextRequest) {
  const tabell = req.nextUrl.searchParams.get('tabell')
  const id     = req.nextUrl.searchParams.get('id')
  if (!tabell || !id) return NextResponse.json({ error: 'Mangler tabell eller id' }, { status: 400 })
  const body = await req.json()
  const r = await fetch(`${SB_URL}/rest/v1/${tabell}?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
  return NextResponse.json({ ok: r.ok }, { status: r.status })
}

export async function DELETE(req: NextRequest) {
  const tabell = req.nextUrl.searchParams.get('tabell')
  const id     = req.nextUrl.searchParams.get('id')
  if (!tabell || !id) return NextResponse.json({ error: 'Mangler tabell eller id' }, { status: 400 })
  const r = await fetch(`${SB_URL}/rest/v1/${tabell}?id=eq.${id}`, { method: 'DELETE', headers })
  return NextResponse.json({ ok: r.ok }, { status: r.status })
}