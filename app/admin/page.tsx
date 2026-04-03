'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Aktivitet, KalenderRad, Tjeneste, Referanse, GalleriBilde } from '@/lib/types'

// ── API-KALL (client-side med anon for read, service for write via API-ruter) ──
const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function sbGet(tabell: string) {
  const r = await fetch(`${SB_URL}/rest/v1/${tabell}?order=sortering.asc`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` },
    cache: 'no-store',
  })
  return r.ok ? r.json() : []
}

async function apiKall(metode: string, tabell: string, body?: object, id?: string) {
  const url = id ? `/api/admin?tabell=${tabell}&id=${id}` : `/api/admin?tabell=${tabell}`
  const r = await fetch(url, {
    method: metode,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return r.ok ? (metode === 'DELETE' ? true : r.json()) : null
}

// ── SHA-256 ──
async function sha256(tekst: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

type Panel = 'galleri' | 'aktiviteter' | 'kalender' | 'tjenester' | 'referanser'
type ModalType = 'aktivitet' | 'kalender' | 'tjeneste' | 'referanse' | null

interface ModalState {
  type: ModalType
  id: string | null
  idx: number | null
  tittel: string
  felter: Record<string, string>
}

const PANEL_TITLER: Record<Panel, string> = {
  galleri: 'Bildegalleri', aktiviteter: 'Aktiviteter',
  kalender: 'Kalender', tjenester: 'Tjenester', referanser: 'Referanser',
}

export default function AdminPage() {
  const [innlogget, setInnlogget]   = useState(false)
  const [passord, setPassord]       = useState('')
  const [passordFeil, setPassordFeil] = useState('')
  const [panel, setPanel]           = useState<Panel>('galleri')
  const [laster, setLaster]         = useState(false)

  const [galleri,     setGalleri]     = useState<GalleriBilde[]>([])
  const [aktiviteter, setAktiviteter] = useState<Aktivitet[]>([])
  const [kalender,    setKalender]    = useState<KalenderRad[]>([])
  const [tjenester,   setTjenester]   = useState<Tjeneste[]>([])
  const [referanser,  setReferanser]  = useState<Referanse[]>([])

  const [modal, setModal] = useState<ModalState | null>(null)
  const [toast, setToast] = useState<{ melding: string; type: 'ok' | 'feil' } | null>(null)

  // ── SJEKK SESJON ──
  useEffect(() => {
    if (sessionStorage.getItem('sm_innlogget') === 'ja') setInnlogget(true)
  }, [])

  // ── TOAST ──
  const visToast = (melding: string, type: 'ok' | 'feil' = 'ok') => {
    setToast({ melding, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ── LOGG INN ──
  const loggInn = async () => {
    if (!passord) { setPassordFeil('Skriv inn passord'); return }
    if (passord !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setPassordFeil('Feil passord, prøv igjen'); return
    }
    sessionStorage.setItem('sm_innlogget', 'ja')
    setInnlogget(true)
  }

  // ── LAST DATA ──
  const lastAlt = useCallback(async () => {
    setLaster(true)
    const [g, a, k, t, r] = await Promise.all([
      sbGet('sm_galleri'), sbGet('sm_aktiviteter'), sbGet('sm_kalender'),
      sbGet('sm_tjenester'), sbGet('sm_referanser'),
    ])
    setGalleri(g); setAktiviteter(a); setKalender(k); setTjenester(t); setReferanser(r)
    setLaster(false)
  }, [])

  useEffect(() => { if (innlogget) lastAlt() }, [innlogget, lastAlt])

  // ── MODAL ──
  const apneModal = (type: ModalType, idx: number | null, felter: Record<string, string>) => {
    const tittel = idx !== null
      ? `Rediger ${type}`
      : `Ny ${type}`
    const id = idx !== null ? (
      type === 'aktivitet' ? aktiviteter[idx].id :
      type === 'kalender'  ? kalender[idx].id :
      type === 'tjeneste'  ? tjenester[idx].id :
      referanser[idx].id
    ) : null
    setModal({ type, id, idx, tittel, felter })
  }
  const lukkModal = () => setModal(null)
  const oppdaterFelt = (key: string, val: string) =>
    setModal(m => m ? { ...m, felter: { ...m.felter, [key]: val } } : null)

  // ── LAGRE ──
  const lagre = async () => {
    if (!modal) return
    const { type, id, felter, idx } = modal
    const sortering = idx ?? 999

    let obj: Record<string, unknown> = { sortering }
    if (type === 'aktivitet') obj = { ...obj, tag: felter.tag, tittel: felter.tittel, beskrivelse: felter.beskrivelse, d1: felter.d1, d2: felter.d2, d3: felter.d3 }
    else if (type === 'kalender') obj = { ...obj, dag: felter.dag, mnd: felter.mnd, tittel: felter.tittel, beskrivelse: felter.beskrivelse, pris: felter.pris, pristype: felter.pristype }
    else if (type === 'tjeneste') obj = { ...obj, navn: felter.navn, pris: felter.pris, varighet: felter.varighet, beskrivelse: felter.beskrivelse, ekstra: felter.ekstra }
    else if (type === 'referanse') obj = { ...obj, navn: felter.navn, tekst: felter.tekst }

    const tabell = type === 'aktivitet' ? 'sm_aktiviteter' : type === 'kalender' ? 'sm_kalender' : type === 'tjeneste' ? 'sm_tjenester' : 'sm_referanser'
    const res = id ? await apiKall('PATCH', tabell, obj, id) : await apiKall('POST', tabell, obj)
    if (res) { visToast(id ? 'Oppdatert!' : 'Lagt til!'); lukkModal(); await lastAlt() }
    else visToast('Feil ved lagring', 'feil')
  }

  // ── SLETT ──
  const slett = async () => {
    if (!modal?.id || !confirm('Er du sikker?')) return
    const { type, id } = modal
    const tabell = type === 'aktivitet' ? 'sm_aktiviteter' : type === 'kalender' ? 'sm_kalender' : type === 'tjeneste' ? 'sm_tjenester' : 'sm_referanser'
    const ok = await apiKall('DELETE', tabell, undefined, id)
    if (ok) { visToast('Slettet'); lukkModal(); await lastAlt() }
    else visToast('Feil ved sletting', 'feil')
  }

  // ── BILDE-OPPLASTING ──
  const lastOppBilde = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fil = e.target.files?.[0]; if (!fil) return
    visToast('Laster opp...')
    const fd = new FormData(); fd.append('fil', fil); fd.append('sortering', String(galleri.length))
    const r = await fetch('/api/admin-bilde', { method: 'POST', body: fd })
    if (r.ok) { visToast('Bilde lagt til!'); await lastAlt() }
    else visToast('Feil ved opplasting', 'feil')
    e.target.value = ''
  }

  const slettBilde = async (id: string, url: string) => {
    if (!confirm('Slett bildet?')) return
    const ok = await apiKall('DELETE', 'sm_galleri', undefined, id)
    if (ok) {
      // Slett også fra Storage
      await fetch(`/api/admin-bilde?url=${encodeURIComponent(url)}`, { method: 'DELETE' })
      visToast('Bilde slettet'); await lastAlt()
    }
  }

  // ── INNLOGGING-SKJERM ──
  if (!innlogget) return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="login-wrap">
        <div className="login-boks">
          <div className="login-logo">☀ Sol &amp; Måne ☽</div>
          <div className="login-sub">Admin-panel</div>
          <input
            type="password" placeholder="Passord"
            value={passord} onChange={e => setPassord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loggInn()}
            className="login-input"
          />
          {passordFeil && <div className="login-feil">{passordFeil}</div>}
          <button className="login-btn" onClick={loggInn}>Logg inn</button>
        </div>
      </div>
    </>
  )

  // ── ADMIN-APP ──
  return (
    <>
      <style>{ADMIN_CSS}</style>

      <div className="adm-app">
        {/* SIDEBAR */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <span className="adm-sol">☀</span> Sol &amp; Måne
            <small>Admin</small>
          </div>
          <nav className="adm-nav">
            {(['galleri','aktiviteter','kalender','tjenester','referanser'] as Panel[]).map(p => (
              <div key={p} className={`adm-nav-item${panel === p ? ' active' : ''}`} onClick={() => setPanel(p)}>
                <span className="adm-ico">{p === 'galleri' ? '🖼' : p === 'aktiviteter' ? '✦' : p === 'kalender' ? '📅' : p === 'tjenester' ? '◈' : '"'}</span>
                <span>{PANEL_TITLER[p]}</span>
              </div>
            ))}
          </nav>
          <div className="adm-sidebar-footer">
            <a href="/" target="_blank">↗ Se nettside</a>
            <button onClick={() => { sessionStorage.removeItem('sm_innlogget'); setInnlogget(false) }} className="adm-logg-ut">Logg ut</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="adm-main">
          <div className="adm-panel-header">
            <h2>{PANEL_TITLER[panel]}</h2>
            {laster && <span className="adm-laster">Laster...</span>}
          </div>
          <div className="adm-content">

            {/* GALLERI */}
            {panel === 'galleri' && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Bilder i karusellen</h3>
                  <label className="btn btn-prim btn-sm" style={{ cursor: 'pointer' }}>
                    + Legg til bilde
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={lastOppBilde} />
                  </label>
                </div>
                <div className="adm-card-body">
                  <div className="galleri-adm-grid">
                    {galleri.length === 0 && <div className="adm-empty">Ingen bilder ennå</div>}
                    {galleri.map(b => (
                      <div key={b.id} className="galleri-adm-slot">
                        <img src={b.url} alt="Bilde" />
                        <div className="galleri-adm-overlay">
                          <button className="btn btn-danger btn-sm" onClick={() => slettBilde(b.id, b.url)}>Slett</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AKTIVITETER */}
            {panel === 'aktiviteter' && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Alle aktiviteter</h3>
                  <button className="btn btn-prim btn-sm" onClick={() => apneModal('aktivitet', null, { tag:'', tittel:'', beskrivelse:'', d1:'', d2:'', d3:'' })}>+ Ny aktivitet</button>
                </div>
                <div className="adm-card-body">
                  {aktiviteter.length === 0 && <div className="adm-empty">Ingen aktiviteter</div>}
                  {aktiviteter.map((a, i) => (
                    <div key={a.id} className="adm-item" onClick={() => apneModal('aktivitet', i, { tag: a.tag, tittel: a.tittel, beskrivelse: a.beskrivelse, d1: a.d1, d2: a.d2, d3: a.d3 })}>
                      <div className="adm-item-txt"><strong>{a.tittel}</strong><span>{a.tag}</span></div>
                      <div className="adm-item-actions">
                        <button className="btn btn-sec btn-sm btn-icon" onClick={e => { e.stopPropagation(); apneModal('aktivitet', i, { tag: a.tag, tittel: a.tittel, beskrivelse: a.beskrivelse, d1: a.d1, d2: a.d2, d3: a.d3 }) }}>✏</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={async e => { e.stopPropagation(); if(!confirm('Slette?')) return; await apiKall('DELETE', 'sm_aktiviteter', undefined, a.id); await lastAlt(); }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KALENDER */}
            {panel === 'kalender' && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Alle arrangementer</h3>
                  <button className="btn btn-prim btn-sm" onClick={() => apneModal('kalender', null, { dag:'', mnd:'', tittel:'', beskrivelse:'', pris:'', pristype:'' })}>+ Nytt arrangement</button>
                </div>
                <div className="adm-card-body">
                  {kalender.length === 0 && <div className="adm-empty">Ingen arrangementer</div>}
                  {kalender.map((k, i) => (
                    <div key={k.id} className="adm-item" onClick={() => apneModal('kalender', i, { dag: k.dag, mnd: k.mnd, tittel: k.tittel, beskrivelse: k.beskrivelse, pris: k.pris, pristype: k.pristype })}>
                      <div className="adm-item-txt"><strong>{k.tittel}</strong><span>{k.dag} {k.mnd}</span></div>
                      <div className="adm-item-actions">
                        <button className="btn btn-sec btn-sm btn-icon" onClick={e => { e.stopPropagation(); apneModal('kalender', i, { dag: k.dag, mnd: k.mnd, tittel: k.tittel, beskrivelse: k.beskrivelse, pris: k.pris, pristype: k.pristype }) }}>✏</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={async e => { e.stopPropagation(); if(!confirm('Slette?')) return; await apiKall('DELETE', 'sm_kalender', undefined, k.id); await lastAlt(); }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TJENESTER */}
            {panel === 'tjenester' && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Alle tjenester</h3>
                  <button className="btn btn-prim btn-sm" onClick={() => apneModal('tjeneste', null, { navn:'', pris:'', varighet:'', beskrivelse:'', ekstra:'' })}>+ Ny tjeneste</button>
                </div>
                <div className="adm-card-body">
                  {tjenester.length === 0 && <div className="adm-empty">Ingen tjenester</div>}
                  {tjenester.map((t, i) => (
                    <div key={t.id} className="adm-item" onClick={() => apneModal('tjeneste', i, { navn: t.navn, pris: t.pris, varighet: t.varighet, beskrivelse: t.beskrivelse, ekstra: t.ekstra })}>
                      <div className="adm-item-txt"><strong>{t.navn}</strong><span>{t.pris} · {t.varighet}</span></div>
                      <div className="adm-item-actions">
                        <button className="btn btn-sec btn-sm btn-icon" onClick={e => { e.stopPropagation(); apneModal('tjeneste', i, { navn: t.navn, pris: t.pris, varighet: t.varighet, beskrivelse: t.beskrivelse, ekstra: t.ekstra }) }}>✏</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={async e => { e.stopPropagation(); if(!confirm('Slette?')) return; await apiKall('DELETE', 'sm_tjenester', undefined, t.id); await lastAlt(); }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REFERANSER */}
            {panel === 'referanser' && (
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Alle referanser</h3>
                  <button className="btn btn-prim btn-sm" onClick={() => apneModal('referanse', null, { navn:'', tekst:'' })}>+ Ny referanse</button>
                </div>
                <div className="adm-card-body">
                  {referanser.length === 0 && <div className="adm-empty">Ingen referanser</div>}
                  {referanser.map((r, i) => (
                    <div key={r.id} className="adm-item" onClick={() => apneModal('referanse', i, { navn: r.navn, tekst: r.tekst })}>
                      <div className="adm-item-txt"><strong>{r.navn}</strong><span>{r.tekst.substring(0, 60)}…</span></div>
                      <div className="adm-item-actions">
                        <button className="btn btn-sec btn-sm btn-icon" onClick={e => { e.stopPropagation(); apneModal('referanse', i, { navn: r.navn, tekst: r.tekst }) }}>✏</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={async e => { e.stopPropagation(); if(!confirm('Slette?')) return; await apiKall('DELETE', 'sm_referanser', undefined, r.id); await lastAlt(); }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* POPUP-MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) lukkModal() }}>
          <div className="modal-popup">
            <div className="modal-head">
              <div className="modal-head-left">
                <span className="modal-badge">{modal.type}</span>
                <h3>{modal.tittel}</h3>
              </div>
              <div className="modal-head-right">
                {modal.id && <button className="btn btn-danger btn-sm" onClick={slett}>Slett</button>}
                <button className="btn btn-prim btn-sm" onClick={lagre}>Lagre</button>
                <button className="modal-lukk" onClick={lukkModal}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {/* SKJEMA */}
              <div className="modal-skjema">
                {modal.type === 'aktivitet' && <>
                  <Felt label="Tag" id="tag" verdi={modal.felter.tag} onChange={v => oppdaterFelt('tag', v)} />
                  <Felt label="Tittel" id="tittel" verdi={modal.felter.tittel} onChange={v => oppdaterFelt('tittel', v)} />
                  <Felt label="Beskrivelse" id="beskrivelse" verdi={modal.felter.beskrivelse} onChange={v => oppdaterFelt('beskrivelse', v)} textarea />
                  <Felt label="Detalj 1" id="d1" verdi={modal.felter.d1} onChange={v => oppdaterFelt('d1', v)} />
                  <Felt label="Detalj 2" id="d2" verdi={modal.felter.d2} onChange={v => oppdaterFelt('d2', v)} />
                  <Felt label="Detalj 3" id="d3" verdi={modal.felter.d3} onChange={v => oppdaterFelt('d3', v)} />
                </>}
                {modal.type === 'kalender' && <>
                  <div className="felt-rad">
                    <Felt label="Dag" id="dag" verdi={modal.felter.dag} onChange={v => oppdaterFelt('dag', v)} placeholder="10 eller 19–20" />
                    <Felt label="Måned og år" id="mnd" verdi={modal.felter.mnd} onChange={v => oppdaterFelt('mnd', v)} placeholder="Mai 2026" />
                  </div>
                  <Felt label="Tittel" id="tittel" verdi={modal.felter.tittel} onChange={v => oppdaterFelt('tittel', v)} />
                  <Felt label="Beskrivelse" id="beskrivelse" verdi={modal.felter.beskrivelse} onChange={v => oppdaterFelt('beskrivelse', v)} />
                  <div className="felt-rad">
                    <Felt label="Pris" id="pris" verdi={modal.felter.pris} onChange={v => oppdaterFelt('pris', v)} placeholder="kr 150" />
                    <Felt label="Pristype" id="pristype" verdi={modal.felter.pristype} onChange={v => oppdaterFelt('pristype', v)} placeholder="per gang" />
                  </div>
                </>}
                {modal.type === 'tjeneste' && <>
                  <Felt label="Navn" id="navn" verdi={modal.felter.navn} onChange={v => oppdaterFelt('navn', v)} />
                  <div className="felt-rad">
                    <Felt label="Pris" id="pris" verdi={modal.felter.pris} onChange={v => oppdaterFelt('pris', v)} placeholder="kr 1 200" />
                    <Felt label="Varighet" id="varighet" verdi={modal.felter.varighet} onChange={v => oppdaterFelt('varighet', v)} placeholder="90 minutter" />
                  </div>
                  <Felt label="Beskrivelse" id="beskrivelse" verdi={modal.felter.beskrivelse} onChange={v => oppdaterFelt('beskrivelse', v)} textarea />
                  <Felt label="Ekstrapris (valgfri)" id="ekstra" verdi={modal.felter.ekstra} onChange={v => oppdaterFelt('ekstra', v)} placeholder="kr 750 / 45 min" />
                </>}
                {modal.type === 'referanse' && <>
                  <Felt label="Navn" id="navn" verdi={modal.felter.navn} onChange={v => oppdaterFelt('navn', v)} />
                  <Felt label="Sitat" id="tekst" verdi={modal.felter.tekst} onChange={v => oppdaterFelt('tekst', v)} textarea />
                </>}
              </div>
              {/* PREVIEW */}
              <div className="modal-preview">
                <div className="preview-head"><span className="preview-dot" />Live forhåndsvisning</div>
                <div className="preview-innhold">
                  {modal.type === 'aktivitet' && (
                    <div className="prev-wrap-akt">
                      <div className="prev-akt">
                        {modal.felter.tag && <span className="prev-tag">{modal.felter.tag}</span>}
                        <h4>{modal.felter.tittel || <em>Tittel...</em>}</h4>
                        <p>{modal.felter.beskrivelse || <em>Beskrivelse...</em>}</p>
                        <div className="prev-detaljer">
                          {modal.felter.d1 && <div className="prev-linje"><b>◈</b> {modal.felter.d1}</div>}
                          {modal.felter.d2 && <div className="prev-linje"><b>◈</b> {modal.felter.d2}</div>}
                          {modal.felter.d3 && <div className="prev-linje"><b>◈</b> {modal.felter.d3}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                  {modal.type === 'kalender' && (
                    <div className="prev-wrap-kal">
                      <div className="prev-kal">
                        <div className="prev-kal-row">
                          <div className="prev-kal-dato">
                            <span className="prev-kal-dag">{modal.felter.dag || '–'}</span>
                            <span className="prev-kal-mnd">{modal.felter.mnd}</span>
                          </div>
                          <div className="prev-kal-info">
                            <h5>{modal.felter.tittel || <em>Tittel...</em>}</h5>
                            <p>{modal.felter.beskrivelse}</p>
                          </div>
                          <div className="prev-kal-pris">
                            <span className="prev-kal-beloep">{modal.felter.pris}</span>
                            <span className="prev-kal-type">{modal.felter.pristype}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {modal.type === 'tjeneste' && (
                    <div className="prev-wrap-tj">
                      <div className="prev-tj">
                        <h4>{modal.felter.navn || <em>Navn...</em>}</h4>
                        <span className="prev-pris">{modal.felter.pris || '–'}</span>
                        <span className="prev-var">{modal.felter.varighet}</span>
                        <div className="prev-tj-linje" />
                        <p>{modal.felter.beskrivelse}</p>
                        {modal.felter.ekstra && <span className="prev-ekstra">{modal.felter.ekstra}</span>}
                      </div>
                    </div>
                  )}
                  {modal.type === 'referanse' && (
                    <div className="prev-wrap-ref">
                      <div className="prev-ref">
                        <span className="prev-ref-anf">&ldquo;</span>
                        <p>{modal.felter.tekst || <em>Sitat...</em>}</p>
                        <span className="prev-ref-navn">— {modal.felter.navn || <em>Navn...</em>}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`adm-toast ${toast.type}`}>{toast.melding}</div>
      )}
    </>
  )
}

// ── FELT-KOMPONENT ──
function Felt({ label, id, verdi, onChange, textarea, placeholder }: {
  label: string; id: string; verdi: string
  onChange: (v: string) => void; textarea?: boolean; placeholder?: string
}) {
  return (
    <div className="adm-felt">
      <label>{label}</label>
      {textarea
        ? <textarea id={id} value={verdi} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type="text" id={id} value={verdi} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

// ── CSS ──
const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Nunito:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;font-family:'Nunito',sans-serif;font-size:15px}

/* LOGIN */
.login-wrap{min-height:100vh;background:linear-gradient(135deg,#1C1228,#4A3570);display:flex;align-items:center;justify-content:center;padding:1rem}
.login-boks{background:white;border-radius:20px;padding:2.5rem;width:360px;max-width:100%;box-shadow:0 24px 80px rgba(0,0,0,.4);text-align:center}
.login-logo{font-family:'Cinzel',serif;font-size:1.2rem;color:#1C1228;margin-bottom:.3rem}
.login-sub{font-size:.7rem;color:#8A7A9A;letter-spacing:.15em;text-transform:uppercase;margin-bottom:2rem}
.login-input{width:100%;padding:.85rem 1rem;border:1.5px solid rgba(123,94,167,.2);border-radius:10px;font-family:'Nunito',sans-serif;font-size:.95rem;outline:none;margin-bottom:.8rem}
.login-input:focus{border-color:#7B5EA7}
.login-feil{color:#d94f4f;font-size:.78rem;margin-bottom:.8rem}
.login-btn{background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);color:white;border:none;padding:.85rem 2rem;border-radius:30px;font-family:'Nunito',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;width:100%}

/* APP */
.adm-app{display:flex;height:100vh;overflow:hidden;background:#f4f0fb}
.adm-sidebar{width:220px;flex-shrink:0;background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);display:flex;flex-direction:column}
.adm-logo{padding:1.5rem 1.4rem 1.2rem;font-family:'Cinzel',serif;font-size:.95rem;color:white;border-bottom:1px solid rgba(255,255,255,.15);line-height:1.4}
.adm-logo .adm-sol{color:#E8A830}
.adm-logo small{display:block;font-family:'Nunito',sans-serif;font-size:.62rem;color:rgba(255,255,255,.6);letter-spacing:.14em;text-transform:uppercase;margin-top:.3rem}
.adm-nav{padding:.5rem 0;flex:1}
.adm-nav-item{display:flex;align-items:center;gap:.65rem;padding:.7rem 1.4rem;cursor:pointer;font-size:.84rem;color:rgba(255,255,255,.65);font-weight:600;transition:all .18s;border-left:3px solid transparent}
.adm-nav-item:hover{color:white;background:rgba(255,255,255,.1)}
.adm-nav-item.active{color:white;background:rgba(255,255,255,.18);border-left-color:white}
.adm-ico{font-size:.95rem;width:1.1rem;text-align:center;flex-shrink:0}
.adm-sidebar-footer{padding:1rem 1.4rem;border-top:1px solid rgba(255,255,255,.15);display:flex;flex-direction:column;gap:.5rem}
.adm-sidebar-footer a{font-size:.75rem;color:rgba(255,255,255,.7);text-decoration:none}
.adm-sidebar-footer a:hover{color:white}
.adm-logg-ut{background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.6);font-family:'Nunito',sans-serif;font-size:.72rem;cursor:pointer;padding:.3rem .6rem;border-radius:6px;text-align:left}
.adm-logg-ut:hover{background:rgba(255,255,255,.2);color:white}
.adm-main{flex:1;overflow-y:auto;display:flex;flex-direction:column}
.adm-panel-header{padding:1.6rem 2rem .5rem;display:flex;align-items:center;gap:1rem}
.adm-panel-header h2{font-family:'Cinzel',serif;font-size:1.2rem;color:#1C1228;font-weight:500}
.adm-laster{font-size:.75rem;color:#8A7A9A}
.adm-content{padding:.5rem 2rem 2rem;max-width:820px}
.adm-card{background:white;border-radius:16px;border:1px solid rgba(123,94,167,.1);box-shadow:0 2px 16px rgba(123,94,167,.07);overflow:hidden}
.adm-card-head{padding:.9rem 1.3rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(123,94,167,.08);background:rgba(250,245,255,.6)}
.adm-card-head h3{font-family:'Cinzel',serif;font-size:.88rem;color:#3A2D4A;font-weight:500}
.adm-card-body{padding:1.2rem}
.adm-item{background:#FAF5FF;border:1px solid rgba(123,94,167,.1);border-radius:10px;padding:.75rem 1rem;display:flex;align-items:center;gap:.8rem;cursor:pointer;transition:all .18s;margin-bottom:.55rem}
.adm-item:hover{border-color:rgba(123,94,167,.35);background:rgba(123,94,167,.04)}
.adm-item-txt{flex:1;min-width:0}
.adm-item-txt strong{display:block;font-size:.83rem;color:#1C1228;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.adm-item-actions{display:flex;gap:.4rem;flex-shrink:0}
.adm-item-txt span{font-size:.73rem;color:#8A7A9A}
.adm-empty{text-align:center;padding:2rem;color:#8A7A9A;font-size:.83rem}
.galleri-adm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.8rem}
.galleri-adm-slot{aspect-ratio:4/3;border-radius:10px;overflow:hidden;position:relative;background:rgba(123,94,167,.08);border:1px solid rgba(123,94,167,.15)}
.galleri-adm-slot img{width:100%;height:100%;object-fit:cover}
.galleri-adm-overlay{position:absolute;inset:0;background:rgba(28,18,40,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}
.galleri-adm-slot:hover .galleri-adm-overlay{opacity:1}

/* KNAPPER */
.btn{padding:.45rem 1rem;border-radius:8px;border:none;cursor:pointer;font-family:'Nunito',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.04em;transition:all .18s;display:inline-flex;align-items:center;gap:.35rem}
.btn-prim{background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);color:white;box-shadow:0 3px 12px rgba(123,94,167,.3)}
.btn-prim:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(123,94,167,.4)}
.btn-sec{background:rgba(123,94,167,.1);color:#7B5EA7;border:1px solid rgba(123,94,167,.2)}
.btn-sec:hover{background:rgba(123,94,167,.18)}
.btn-danger{background:rgba(217,79,79,.1);color:#d94f4f;border:1px solid rgba(217,79,79,.2)}
.btn-danger:hover{background:rgba(217,79,79,.2)}
.btn-sm{padding:.3rem .7rem;font-size:.72rem;border-radius:6px}
.btn-icon{padding:.3rem .5rem;font-size:.9rem}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(28,18,40,.5);backdrop-filter:blur(4px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.modal-popup{background:white;border-radius:20px;width:900px;max-width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(28,18,40,.3);overflow:hidden;animation:popIn .22s cubic-bezier(.34,1.56,.64,1)}
@keyframes popIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.5rem;border-bottom:1px solid rgba(123,94,167,.1);background:rgba(250,245,255,.7);flex-shrink:0}
.modal-head-left{display:flex;align-items:center;gap:.8rem}
.modal-badge{font-size:.63rem;letter-spacing:.16em;text-transform:uppercase;color:#7B5EA7;font-weight:700;background:rgba(123,94,167,.1);padding:.22rem .75rem;border-radius:20px}
.modal-head h3{font-family:'Cinzel',serif;font-size:.97rem;color:#1C1228;font-weight:500}
.modal-head-right{display:flex;align-items:center;gap:.6rem}
.modal-lukk{background:rgba(123,94,167,.08);border:none;color:#8A7A9A;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .18s}
.modal-lukk:hover{background:rgba(123,94,167,.18);color:#3A2D4A}
.modal-body{display:grid;grid-template-columns:1fr 1fr;flex:1;overflow:hidden;min-height:0}
.modal-skjema{padding:1.5rem;overflow-y:auto;border-right:1px solid rgba(123,94,167,.1)}
.modal-preview{padding:0;overflow-y:auto;background:#1C1228;display:flex;flex-direction:column}
.preview-head{display:flex;align-items:center;gap:.5rem;font-size:.63rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.35);font-weight:700;padding:1rem 1.5rem .5rem;flex-shrink:0}
.preview-dot{width:7px;height:7px;border-radius:50%;background:#3d9e5f;animation:blink 1.5s infinite}
@keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
.preview-innhold{flex:1}
.adm-felt{margin-bottom:1rem}
.adm-felt label{display:block;font-size:.7rem;font-weight:700;color:#8A7A9A;text-transform:uppercase;letter-spacing:.12em;margin-bottom:.4rem}
.adm-felt input,.adm-felt textarea{width:100%;padding:.72rem .95rem;border:1.5px solid rgba(123,94,167,.15);border-radius:10px;font-family:'Nunito',sans-serif;font-size:.88rem;color:#3A2D4A;background:#FAF5FF;outline:none;transition:all .2s}
.adm-felt input:focus,.adm-felt textarea:focus{border-color:#7B5EA7;background:white;box-shadow:0 0 0 3px rgba(123,94,167,.08)}
.adm-felt textarea{resize:vertical;min-height:86px}
.felt-rad{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}

/* PREVIEW-KORT */
.prev-wrap-akt{background:#4A3570;padding:1.5rem;min-height:100%;position:relative;overflow:hidden}
.prev-wrap-akt::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 0% 100%,rgba(160,124,197,.25) 0%,transparent 50%),radial-gradient(ellipse at 100% 0%,rgba(196,123,160,.18) 0%,transparent 50%)}
.prev-akt{background:rgba(250,245,255,.09);border:1px solid rgba(250,245,255,.16);border-radius:16px;padding:1.4rem;position:relative}
.prev-tag{display:inline-block;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(232,168,48,.95);border:1px solid rgba(232,168,48,.35);padding:.18rem .7rem;border-radius:20px;margin-bottom:.75rem;font-weight:700}
.prev-akt h4{font-family:'Cinzel',serif;font-size:.97rem;color:white;margin-bottom:.65rem}
.prev-akt p{font-size:.82rem;color:rgba(250,245,255,.7);margin-bottom:1rem;line-height:1.7}
.prev-detaljer{border-top:1px solid rgba(250,245,255,.12);padding-top:.9rem;display:flex;flex-direction:column;gap:.4rem}
.prev-linje{display:flex;gap:.55rem;font-size:.79rem;color:rgba(250,245,255,.75)}
.prev-linje b{color:rgba(232,168,48,.8)}
.prev-wrap-kal{background:#FAF5FF;padding:1.5rem;min-height:100%}
.prev-kal{background:white;border:1px solid rgba(123,94,167,.12);border-radius:14px;overflow:hidden}
.prev-kal-row{display:grid;grid-template-columns:80px 1fr auto;gap:1rem;align-items:center;padding:1rem 1.2rem}
.prev-kal-dato{text-align:center;background:linear-gradient(135deg,rgba(123,94,167,.08),rgba(196,123,160,.06));border-radius:10px;padding:.7rem .4rem;border:1px solid rgba(123,94,167,.1)}
.prev-kal-dag{font-family:'Cinzel',serif;font-size:1.3rem;background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;line-height:1.1}
.prev-kal-mnd{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:#8A7A9A}
.prev-kal-info h5{font-family:'Cinzel',serif;font-size:.85rem;color:#3A2D4A;margin-bottom:.18rem}
.prev-kal-info p{font-size:.73rem;color:#8A7A9A}
.prev-kal-pris{text-align:right;white-space:nowrap}
.prev-kal-beloep{font-family:'Cinzel',serif;font-size:.95rem;color:#4A3570;display:block}
.prev-kal-type{font-size:.6rem;color:#8A7A9A;text-transform:uppercase}
.prev-wrap-tj{background:white;padding:1.5rem;min-height:100%}
.prev-tj{background:#FAF5FF;border:1px solid rgba(123,94,167,.13);border-radius:16px;padding:1.6rem;text-align:center;position:relative;overflow:hidden}
.prev-tj::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0)}
.prev-tj h4{font-family:'Cinzel',serif;font-size:.95rem;color:#3A2D4A;margin-bottom:.9rem}
.prev-pris{font-family:'Cinzel',serif;font-size:1.8rem;background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block}
.prev-var{font-size:.68rem;color:#8A7A9A;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.9rem;display:block}
.prev-tj-linje{height:1px;background:rgba(123,94,167,.1);margin:.9rem 0}
.prev-tj p{font-size:.81rem;color:#8A7A9A;line-height:1.6}
.prev-ekstra{display:inline-block;margin-top:.6rem;font-size:.78rem;color:#7B5EA7;font-weight:700}
.prev-wrap-ref{background:#1C1228;padding:1.5rem;min-height:100%;position:relative;overflow:hidden}
.prev-wrap-ref::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(123,94,167,.22) 0%,transparent 65%)}
.prev-ref{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.11);border-radius:14px;padding:1.4rem;position:relative;z-index:1}
.prev-ref-anf{font-family:'Lora',serif;font-size:3.5rem;line-height:1;background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:.45;display:block;margin-bottom:.4rem}
.prev-ref p{font-style:italic;font-size:.88rem;color:rgba(255,255,255,.82);line-height:1.85;margin-bottom:.9rem}
.prev-ref-navn{font-size:.68rem;letter-spacing:.13em;text-transform:uppercase;background:linear-gradient(135deg,#4A3570,#7B5EA7,#C47BA0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700}

/* TOAST */
.adm-toast{position:fixed;bottom:2rem;right:2rem;background:#1C1228;color:white;padding:.8rem 1.4rem;border-radius:10px;font-size:.82rem;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);border-left:3px solid #A07CC5;z-index:9999;animation:slideUp .3s ease}
.adm-toast.ok{border-left-color:#3d9e5f}
.adm-toast.feil{border-left-color:#d94f4f}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@media(max-width:800px){.modal-body{grid-template-columns:1fr}.modal-preview{display:none}}
@media(max-width:700px){.adm-sidebar{width:58px}.adm-nav-item span,.adm-logo small,.adm-sidebar-footer span{display:none}.adm-nav-item{padding:.75rem;justify-content:center}.adm-content{padding:1rem}}
`