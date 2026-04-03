import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_SVC = process.env.SUPABASE_SERVICE_KEY!
const BUCKET = 'sologmane-bilder'

export async function POST(req: NextRequest) {
  const form      = await req.formData()
  const fil       = form.get('fil') as File
  const sortering = form.get('sortering') as string
  if (!fil) return NextResponse.json({ error: 'Ingen fil' }, { status: 400 })

  const filnavn = `${Date.now()}-${fil.name.replace(/\s/g, '_')}`
  const buffer  = await fil.arrayBuffer()

  const uploadRes = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${filnavn}`, {
    method: 'POST',
    headers: {
      apikey: SB_SVC,
      Authorization: `Bearer ${SB_SVC}`,
      'Content-Type': fil.type,
    },
    body: buffer,
  })
  if (!uploadRes.ok) return NextResponse.json({ error: 'Opplasting feilet' }, { status: 500 })

  const url = `${SB_URL}/storage/v1/object/public/${BUCKET}/${filnavn}`

  const dbRes = await fetch(`${SB_URL}/rest/v1/sm_galleri`, {
    method: 'POST',
    headers: {
      apikey: SB_SVC,
      Authorization: `Bearer ${SB_SVC}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ url, sortering: Number(sortering) }),
  })
  const data = await dbRes.json()
  return NextResponse.json(data, { status: dbRes.status })
}

export async function DELETE(req: NextRequest) {
  const url     = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Mangler url' }, { status: 400 })
  const filnavn = url.split('/').pop()

  await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${filnavn}`, {
    method: 'DELETE',
    headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` },
  })
  return NextResponse.json({ ok: true })
}
