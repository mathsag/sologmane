import type { GalleriBilde } from '@/lib/types'

export default function GalleriKarusell({ bilder }: { bilder: GalleriBilde[] }) {
  const dobbel = [...bilder, ...bilder]
  return (
    <div className="galleri-track-wrap">
      <div className="galleri-track">
        {dobbel.map((b, i) => (
          <div key={i} className="galleri-bilde">
            <img src={b.url} alt={`Bilde ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  )
}