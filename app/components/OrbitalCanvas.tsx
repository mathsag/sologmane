'use client'
import { useEffect, useRef } from 'react'

export default function OrbitalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = wrap.offsetWidth
      canvas.height = wrap.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let angle = 0
    let raf: number

    const draw = () => {
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2
      const R  = W * 0.4
      const br = W * 0.059
      ctx.clearRect(0, 0, W, H)

      // Ring
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(160,124,197,0.25)'; ctx.lineWidth = 1; ctx.stroke()

      // Glow senter
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.1)
      g.addColorStop(0, 'rgba(232,168,48,0.25)'); g.addColorStop(1, 'rgba(123,94,197,0.04)')
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.1, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()

      // Sol
      const sx = cx + Math.cos(angle) * R, sy = cy + Math.sin(angle) * R
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, br * 1.6)
      sg.addColorStop(0, 'rgba(232,168,48,0.45)'); sg.addColorStop(1, 'rgba(232,168,48,0)')
      ctx.beginPath(); ctx.arc(sx, sy, br * 1.6, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill()
      const sf = ctx.createRadialGradient(sx - br * 0.3, sy - br * 0.3, br * 0.15, sx, sy, br)
      sf.addColorStop(0, '#FFD980'); sf.addColorStop(1, '#E8A830')
      ctx.beginPath(); ctx.arc(sx, sy, br, 0, Math.PI * 2); ctx.fillStyle = sf; ctx.fill()
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(angle * 0.5)
      ctx.strokeStyle = 'rgba(232,168,48,0.6)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * (br + 2), Math.sin(a) * (br + 2))
        ctx.lineTo(Math.cos(a) * (br + 6), Math.sin(a) * (br + 6)); ctx.stroke()
      }
      ctx.restore()

      // Måne
      const ma = angle + Math.PI
      const mx = cx + Math.cos(ma) * R, my = cy + Math.sin(ma) * R
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, br * 1.6)
      mg.addColorStop(0, 'rgba(160,124,197,0.5)'); mg.addColorStop(1, 'rgba(160,124,197,0)')
      ctx.beginPath(); ctx.arc(mx, my, br * 1.6, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill()
      ctx.save(); ctx.translate(mx, my); ctx.rotate(ma + Math.PI / 4)
      ctx.save()
      ctx.beginPath(); ctx.arc(0, 0, br, 0, Math.PI * 2); ctx.clip()
      const mf = ctx.createLinearGradient(-br, -br, br, br)
      mf.addColorStop(0, '#D4BAEE'); mf.addColorStop(1, '#9B72CC')
      ctx.beginPath(); ctx.arc(0, 0, br, 0, Math.PI * 2); ctx.fillStyle = mf; ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath(); ctx.arc(br * 0.5, br * -0.25, br * 0.78, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath(); ctx.arc(-br * 0.1, br * 1.1, 1.4, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(br * 0.5, -br * 1.0, 1.0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      angle += 0.008
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}