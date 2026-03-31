'use client'
import { useEffect } from 'react'

export default function Stjerner() {
  useEffect(() => {
    const sc = document.getElementById('stars')
    if (!sc) return
    for (let i = 0; i < 55; i++) {
      const s = document.createElement('div')
      s.className = 'star'
      const sz = Math.random() * 2.5 + 0.5
      s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*45}%;left:${Math.random()*100}%;--d:${Math.random()*4+2}s;--delay:${Math.random()*6}s;--o:${Math.random()*0.45+0.15}`
      sc.appendChild(s)
    }
  }, [])

  return <div className="stars" id="stars" />
}