export interface Aktivitet {
  id: string
  sortering: number
  tag: string
  tittel: string
  beskrivelse: string
  d1: string
  d2: string
  d3: string
}

export interface KalenderRad {
  id: string
  sortering: number
  dag: string
  mnd: string
  tittel: string
  beskrivelse: string
  pris: string
  pristype: string
}

export interface Tjeneste {
  id: string
  sortering: number
  navn: string
  pris: string
  varighet: string
  beskrivelse: string
  ekstra: string
}

export interface Referanse {
  id: string
  sortering: number
  navn: string
  tekst: string
}

export interface GalleriBilde {
  id: string
  sortering: number
  url: string
}