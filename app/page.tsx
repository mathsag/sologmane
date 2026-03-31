import { supabase } from '@/lib/supabase'
import type { Aktivitet, KalenderRad, Tjeneste, Referanse, GalleriBilde } from '@/lib/types'
import OrbitalCanvas from './components/OrbitalCanvas'
import GalleriKarusell from './components/GalleriKarusell'
import Stjerner from './components/Stjerner'

async function hentData() {
  const [akt, kal, tj, ref, gal] = await Promise.all([
    supabase.from('sm_aktiviteter').select('*').order('sortering'),
    supabase.from('sm_kalender').select('*').order('sortering'),
    supabase.from('sm_tjenester').select('*').order('sortering'),
    supabase.from('sm_referanser').select('*').order('sortering'),
    supabase.from('sm_galleri').select('*').order('sortering'),
  ])
  return {
    aktiviteter: (akt.data ?? []) as Aktivitet[],
    kalender:    (kal.data ?? []) as KalenderRad[],
    tjenester:   (tj.data  ?? []) as Tjeneste[],
    referanser:  (ref.data ?? []) as Referanse[],
    galleri:     (gal.data ?? []) as GalleriBilde[],
  }
}

export default async function Home() {
  const { aktiviteter, kalender, tjenester, referanser, galleri } = await hentData()

  return (
    <>
      <style>{CSS}</style>

      <Stjerner />

      {/* NAV */}
      <nav id="nav">
        <a href="#" className="nav-logo">
          <span className="sol-ic">☀</span> Sol &amp; Måne <span className="mane-ic">☽</span>
        </a>
        <ul className="nav-links">
          <li><a href="#om">Om senteret</a></li>
          <li><a href="#aktiviteter">Aktiviteter</a></li>
          <li><a href="#kalender">Kalender</a></li>
          <li><a href="#priser">Tjenester</a></li>
          <li><a href="#kontakt" className="nav-cta">Kontakt</a></li>
        </ul>
        <button className="hamburger" id="hamburger" aria-label="Åpne meny">
          <span /><span /><span />
        </button>
      </nav>
      <div className="mobil-meny" id="mobilMeny">
        <a href="#om">Om senteret</a>
        <a href="#aktiviteter">Aktiviteter</a>
        <a href="#kalender">Kalender</a>
        <a href="#priser">Tjenester</a>
        <a href="#kontakt">Kontakt</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <p className="hero-eyebrow">Heggen · Vikersund · Norge</p>
        <h1>
          <span className="sol">Sol</span>{' '}
          <span className="og">&amp;</span>{' '}
          <span className="mane">Måne</span>
        </h1>
        <p className="hero-tagline">Senter for selvutvikling og indre reiser</p>
        <p className="hero-intro">
          Yoga, mindfulness, drømmetydning, tarot og astrologi — i trygge og intime omgivelser på Heggen. Alltid maks seks deltakere.
        </p>
        <div className="hero-buttons">
          <a href="#kalender" className="btn-primary">Se kommende kurs</a>
          <a href="#kontakt" className="btn-secondary">Ta kontakt</a>
        </div>
        <div className="orbital-wrap">
          <OrbitalCanvas />
        </div>
      </section>

      <Wave fra="#1C1228" til="#FAF5FF" />

      {/* OM */}
      <section className="om-section" id="om">
        <div className="om-inner">
          <div className="fade-in">
            <span className="seksjon-label">Om senteret</span>
            <h2 className="seksjon-tittel">Et sted for dybde,<br />vekst og indre ro</h2>
            <div className="om-tekst">
              <p>Sol og Månesenteret drives av Kristin Grønnes, og tilbyr kurs i selvutvikling i trygge, intime grupper på maks seks personer.</p>
              <p>Senteret har et <strong>Månerom</strong> med en magisk stemning, og et <strong>Solrom</strong> som stråler av energi — begge inviterer til nærvær og refleksjon.</p>
              <p>Det tilbys også livsveiledning én til én — på senteret eller via Zoom.</p>
            </div>
            <div className="om-fakta">
              <div className="fakta-boks"><span className="fakta-tall">Maks 6</span><span className="fakta-label">per kurs</span></div>
              <div className="fakta-boks"><span className="fakta-tall">2 rom</span><span className="fakta-label">Sol &amp; Måne</span></div>
              <div className="fakta-boks"><span className="fakta-tall">Zoom</span><span className="fakta-label">tilgjengelig</span></div>
              <div className="fakta-boks"><span className="fakta-tall">10+</span><span className="fakta-label">utdanninger</span></div>
            </div>
          </div>
          <div className="kristin-kort fade-in">
            <h3>Kristin Grønnes</h3>
            <p className="kristin-tittel">Kursholder &amp; livsveileder</p>
            <ul className="utd-liste">
              {[
                'Integrativ terapi, Universitetet i Sørøst-Norge',
                'Kjemi og kjemisk teknologi, NTNU',
                'Bachelor i næringsmiddelteknologi, HiST',
                'Adjunkt i matematikk og fysikk, HiHm',
                'Astronomi, Universitetet i Oslo',
                'Astrologiutdanning ved Per Henrik Gullfoss',
                'Tarotutdanning ved Per Henrik Gullfoss',
                'Mindfulnessinstruktør, Jesper Juuls Familylab',
                'Mindfulnessinstruktør, Norsk Yoga- og Meditasjonsskole',
                'Drømmetyder/terapeut ved Nini Marie Torp, Høvik Kurssenter',
                'Utdanning i samisk sjamanisme ved Øyvind Martinsens sjamanskole',
              ].map((u, i) => <li key={i}>{u}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* GALLERI */}
      {galleri.length > 0 && (
        <section className="galleri" id="galleri">
          <div className="galleri-header fade-in">
            <span className="seksjon-label" style={{color:'rgba(232,168,48,.85)'}}>Senteret</span>
            <h2 className="seksjon-tittel">Bilder fra Sol og Måne</h2>
          </div>
          <GalleriKarusell bilder={galleri} />
        </section>
      )}

      <WaveDobbel />

      {/* AKTIVITETER */}
      <section className="aktiviteter" id="aktiviteter">
        <div className="seksjon-header fade-in">
          <span className="seksjon-label">Hva tilbys</span>
          <h2 className="seksjon-tittel">Aktiviteter ved senteret</h2>
        </div>
        <div className="akt-grid">
          {aktiviteter.map(a => (
            <div key={a.id} className="akt-kort fade-in">
              {a.tag && <span className="akt-tag">{a.tag}</span>}
              <h3>{a.tittel}</h3>
              <p>{a.beskrivelse}</p>
              <div className="akt-detaljer">
                {a.d1 && <div className="akt-linje"><i className="ic">◈</i> {a.d1}</div>}
                {a.d2 && <div className="akt-linje"><i className="ic">◈</i> {a.d2}</div>}
                {a.d3 && <div className="akt-linje"><i className="ic">◈</i> {a.d3}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <WaveAkt />

      {/* KALENDER */}
      <section className="kalender" id="kalender">
        <div className="kalender-inner">
          <div className="fade-in">
            <span className="seksjon-label">Oversikt</span>
            <h2 className="seksjon-tittel">Kommende kurs og arrangementer</h2>
          </div>
          <div className="kalender-liste">
            {kalender.map(k => (
              <div key={k.id} className="kal-rad fade-in">
                <div className="kal-dato">
                  <span className="kal-dag">{k.dag}</span>
                  <span className="kal-mnd">{k.mnd}</span>
                </div>
                <div className="kal-info">
                  <h4>{k.tittel}</h4>
                  <p>{k.beskrivelse}</p>
                </div>
                <div className="kal-pris">
                  <span className="kal-beloep">{k.pris}</span>
                  <span className="kal-type">{k.pristype}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="kalender-bunntekst fade-in">
            Påmelding og info:{' '}
            <a href="mailto:kristingronnes@protonmail.com">kristingronnes@protonmail.com</a>
            &nbsp;·&nbsp;
            <a href="tel:40225996">402 25 996</a>
          </div>
        </div>
      </section>

      {/* TJENESTER */}
      <section className="priser" id="priser">
        <div className="priser-inner">
          <div className="seksjon-header fade-in">
            <span className="seksjon-label">Tjenester</span>
            <h2 className="seksjon-tittel">Individuelle tjenester</h2>
          </div>
          <div className="priser-grid">
            {tjenester.map(t => (
              <div key={t.id} className="pris-kort fade-in">
                <h3>{t.navn}</h3>
                <span className="pris-beloep">{t.pris}</span>
                <span className="pris-varighet">{t.varighet}</span>
                <div className="pris-linje" />
                <p>{t.beskrivelse}</p>
                {t.ekstra && <span className="pris-extra">{t.ekstra}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveRef />

      {/* REFERANSER */}
      <section className="referanser" id="referanser">
        <div className="seksjon-header fade-in">
          <span className="seksjon-label">Hva folk sier</span>
          <h2 className="seksjon-tittel">Referanser</h2>
        </div>
        <div className="ref-grid">
          {referanser.map(r => (
            <div key={r.id} className="ref-kort fade-in">
              <span className="ref-anf">&ldquo;</span>
              <p className="ref-tekst">{r.tekst}</p>
              <span className="ref-navn">— {r.navn}</span>
            </div>
          ))}
        </div>
      </section>

      <WaveKontakt />

      {/* KONTAKT */}
      <section className="kontakt" id="kontakt">
        <div className="kontakt-inner">
          <div className="kontakt-info fade-in">
            <span className="seksjon-label">Kom i kontakt</span>
            <h2 className="seksjon-tittel">Ta kontakt</h2>
            <p>Meld deg på kurs, bestill time til livsveiledning, eller ta kontakt for mer informasjon. Kristin svarer gjerne.</p>
            <ul className="kontakt-liste">
              <li>
                <div className="k-ikon">📞</div>
                <div className="k-detalj"><small>Telefon</small><a href="tel:40225996">402 25 996</a></div>
              </li>
              <li>
                <div className="k-ikon">✉️</div>
                <div className="k-detalj"><small>E-post</small><a href="mailto:kristingronnes@protonmail.com">kristingronnes@protonmail.com</a></div>
              </li>
              <li>
                <div className="k-ikon">📍</div>
                <div className="k-detalj"><small>Adresse</small><a href="https://maps.google.com/?q=Heggenveien+188,3370+Vikersund" target="_blank" rel="noreferrer">Heggenveien 188, 3370 Vikersund</a></div>
              </li>
            </ul>
          </div>
          <div className="kontakt-skjema fade-in">
            <h3>Send en melding</h3>
            <KontaktSkjema />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span className="footer-logo">☀ Sol &amp; Måne ☽</span>
        <p>Kristin Grønnes · Heggenveien 188, 3370 Vikersund</p>
        <p>
          <a href="tel:40225996">402 25 996</a>
          {' · '}
          <a href="mailto:kristingronnes@protonmail.com">kristingronnes@protonmail.com</a>
        </p>
        <p className="footer-copy">© Sol &amp; Måne · Alle rettigheter forbeholdt</p>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: CLIENT_SCRIPT }} />
    </>
  )
}

// ── HJELPEKOMPOMENTER ──
function Wave({ fra, til }: { fra: string; til: string }) {
  return (
    <div className="wave" style={{ background: fra }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d={`M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z`} fill={til} />
      </svg>
    </div>
  )
}
function WaveDobbel() {
  return (
    <>
      <div className="wave" style={{ background: '#1C1228' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,20 C480,60 960,0 1440,35 L1440,60 L0,60 Z" fill="#4A3570" />
        </svg>
      </div>
    </>
  )
}
function WaveAkt() {
  return (
    <div className="wave" style={{ background: '#4A3570' }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,40 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill="#FAF5FF" />
      </svg>
    </div>
  )
}
function WaveRef() {
  return (
    <div className="wave" style={{ background: 'white' }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,20 C720,60 1080,0 1440,40 L1440,60 L0,60 Z" fill="#1C1228" />
      </svg>
    </div>
  )
}
function WaveKontakt() {
  return (
    <div className="wave" style={{ background: '#1C1228' }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,40 C480,0 960,60 1440,20 L1440,60 L0,60 Z" fill="#FAF5FF" />
      </svg>
    </div>
  )
}

function KontaktSkjema() {
  return (
    <div className="skjema-felt">
      <select id="skjema-emne">
        <option value="" disabled>Hva gjelder henvendelsen?</option>
        <option>Yoga</option>
        <option>Drømmetydning – heldagskurs</option>
        <option>Drømmetydningsutdanning 2026–2027</option>
        <option>Tarot</option>
        <option>Livsveiledning</option>
        <option>Horoskop</option>
        <option>Lydbad / samling</option>
        <option>Annet</option>
      </select>
      <textarea id="skjema-melding" placeholder="Din melding..." />
      <button type="button" onClick={undefined} id="skjema-btn">Send melding</button>
    </div>
  )
}

// ── CLIENT-SIDE SCRIPT ──
const CLIENT_SCRIPT = `
(function() {
  // Nav
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30));

  // Hamburger
  const hb = document.getElementById('hamburger');
  const mm = document.getElementById('mobilMeny');
  if (hb && mm) {
    hb.addEventListener('click', () => { hb.classList.toggle('open'); mm.classList.toggle('open'); });
    mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hb.classList.remove('open'); mm.classList.remove('open');
    }));
  }

  // Fade-in
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('synlig'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  // Kontaktskjema
  const btn = document.getElementById('skjema-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const emne = document.getElementById('skjema-emne').value;
      const melding = document.getElementById('skjema-melding').value.trim();
      if (!melding) { alert('Vennligst skriv en melding.'); return; }
      const emneTekst = emne || 'Henvendelse fra nettside';
      window.location.href = 'mailto:kristingronnes@protonmail.com?subject=' + encodeURIComponent(emneTekst) + '&body=' + encodeURIComponent(melding);
    });
  }
})();
`

// ── CSS ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Nunito:wght@300;400;500;600;700&display=swap');
:root{--sol:#E8A830;--lilla:#7B5EA7;--lilla-lys:#A07CC5;--lilla-dyp:#4A3570;--rose:#C47BA0;--lys:#FAF5FF;--mork:#1C1228;--tekst:#3A2D4A;--graa:#8A7A9A;--gradient:linear-gradient(135deg,#4A3570 0%,#7B5EA7 50%,#C47BA0 100%)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:'Nunito',sans-serif;background:var(--lys);color:var(--tekst);font-weight:400;font-size:16px;line-height:1.75;overflow-x:hidden}
.stars{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.star{position:absolute;background:white;border-radius:50%;animation:twinkle var(--d,3s) ease-in-out infinite var(--delay,0s);opacity:0}
@keyframes twinkle{0%,100%{opacity:0;transform:scale(.8)}50%{opacity:var(--o,.6);transform:scale(1.2)}}
nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:rgba(28,18,40,.9);backdrop-filter:blur(14px);border-bottom:1px solid rgba(123,94,167,.22);transition:all .3s}
nav.scrolled{background:rgba(28,18,40,.98);box-shadow:0 4px 30px rgba(123,94,167,.2)}
.nav-logo{font-family:'Cinzel',serif;font-size:1.1rem;font-weight:500;letter-spacing:.08em;color:white;text-decoration:none}
.nav-logo .sol-ic{color:var(--sol)}.nav-logo .mane-ic{color:var(--lilla-lys)}
.nav-links{display:flex;gap:2rem;list-style:none;align-items:center}
.nav-links a{text-decoration:none;color:rgba(255,255,255,.65);font-size:.77rem;letter-spacing:.1em;text-transform:uppercase;transition:color .2s;font-weight:600}
.nav-links a:hover{color:var(--lilla-lys)}
.nav-cta{background:var(--gradient)!important;color:white!important;padding:.45rem 1.3rem;border-radius:20px}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}
.hamburger span{display:block;width:24px;height:2px;background:white;border-radius:2px;transition:all .3s}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.open span:nth-child(2){opacity:0}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mobil-meny{display:none;position:fixed;top:58px;left:0;right:0;background:rgba(28,18,40,.98);backdrop-filter:blur(16px);z-index:199;padding:1.5rem 2rem 2rem;flex-direction:column;border-bottom:1px solid rgba(123,94,167,.3)}
.mobil-meny.open{display:flex}
.mobil-meny a{color:rgba(255,255,255,.85);text-decoration:none;font-size:1rem;font-family:'Cinzel',serif;letter-spacing:.05em;padding:1rem 0;border-bottom:1px solid rgba(123,94,167,.15)}
.mobil-meny a:last-child{border-bottom:none;color:var(--lilla-lys)}
.hero{min-height:100vh;background:var(--mork);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 1.5rem 5rem;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 15% 55%,rgba(123,94,167,.38) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(196,123,160,.28) 0%,transparent 50%),radial-gradient(ellipse at 60% 85%,rgba(232,168,48,.14) 0%,transparent 45%)}
.hero-eyebrow{font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;color:var(--lilla-lys);margin-bottom:1.5rem;position:relative;z-index:1;font-weight:600}
.hero h1{font-family:'Cinzel',serif;font-size:clamp(2.8rem,8vw,6rem);font-weight:400;line-height:1.1;color:white;margin-bottom:1rem;position:relative;z-index:1}
.hero h1 .sol{color:var(--sol)}.hero h1 .og{color:var(--lilla-lys);font-size:.55em;display:inline-block;margin:0 .3em;vertical-align:middle}.hero h1 .mane{color:var(--lilla-lys)}
.hero-tagline{font-family:'Lora',serif;font-style:italic;font-size:clamp(1rem,2.5vw,1.3rem);color:rgba(255,255,255,.7);margin-bottom:1.5rem;position:relative;z-index:1}
.hero-intro{font-size:.97rem;color:rgba(255,255,255,.55);max-width:520px;margin:0 auto 2.5rem;position:relative;z-index:1;line-height:1.85}
.hero-buttons{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;position:relative;z-index:1}
.btn-primary{background:var(--gradient);color:white;padding:.9rem 2.2rem;text-decoration:none;font-size:.82rem;letter-spacing:.08em;text-transform:uppercase;border-radius:30px;transition:transform .2s,box-shadow .2s;font-weight:700;box-shadow:0 4px 20px rgba(123,94,167,.4)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(123,94,167,.55)}
.btn-secondary{background:transparent;color:rgba(255,255,255,.8);padding:.9rem 2.2rem;text-decoration:none;font-size:.82rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,.25);border-radius:30px;transition:all .2s;font-weight:600}
.btn-secondary:hover{border-color:var(--lilla-lys);color:var(--lilla-lys)}
.orbital-wrap{position:relative;z-index:1;margin:3rem auto 0;width:220px;height:220px}
.wave{width:100%;overflow:hidden;line-height:0;margin-top:-1px}.wave svg{display:block;width:100%}
.seksjon-label{display:inline-block;font-size:.68rem;letter-spacing:.25em;text-transform:uppercase;color:var(--lilla);font-weight:700;margin-bottom:.8rem}
.seksjon-tittel{font-family:'Cinzel',serif;font-size:clamp(1.7rem,3.5vw,2.5rem);font-weight:400;color:var(--mork);line-height:1.25;margin-bottom:1.2rem}
.seksjon-header{text-align:center;margin-bottom:3rem;position:relative;z-index:1}
.fade-in{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease}
.fade-in.synlig{opacity:1;transform:translateY(0)}
.om-section{background:var(--lys);padding:5rem 2rem}
.om-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:start}
.om-tekst p{color:var(--graa);margin-bottom:1rem;font-size:.97rem}
.om-fakta{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem}
.fakta-boks{background:white;border:1px solid rgba(123,94,167,.14);border-radius:12px;padding:1.2rem;text-align:center;box-shadow:0 2px 12px rgba(123,94,167,.07)}
.fakta-tall{font-family:'Cinzel',serif;font-size:1.7rem;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block}
.fakta-label{font-size:.7rem;color:var(--graa);letter-spacing:.08em;text-transform:uppercase}
.kristin-kort{background:white;border-radius:16px;padding:2.5rem;border:1px solid rgba(123,94,167,.14);box-shadow:0 8px 40px rgba(123,94,167,.09);position:relative;overflow:hidden}
.kristin-kort::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:var(--gradient)}
.kristin-kort h3{font-family:'Cinzel',serif;font-size:1.1rem;color:var(--mork);margin-bottom:.2rem}
.kristin-tittel{font-size:.78rem;color:var(--lilla);letter-spacing:.08em;margin-bottom:1.5rem;font-style:italic}
.utd-liste{list-style:none;display:flex;flex-direction:column;gap:.5rem}
.utd-liste li{font-size:.84rem;color:var(--tekst);padding-left:1.4rem;position:relative;line-height:1.5}
.utd-liste li::before{content:'✦';position:absolute;left:0;color:var(--lilla-lys);font-size:.55rem;top:.35rem}
.galleri{background:var(--mork);padding:4rem 0;overflow:hidden;position:relative}
.galleri::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(123,94,167,.18) 0%,transparent 70%);pointer-events:none}
.galleri-header{text-align:center;padding:0 2rem;margin-bottom:2.5rem;position:relative;z-index:1}
.galleri-header .seksjon-tittel{color:white}
.galleri-track-wrap{overflow:hidden;position:relative}
.galleri-track-wrap::before,.galleri-track-wrap::after{content:'';position:absolute;top:0;bottom:0;width:120px;z-index:2;pointer-events:none}
.galleri-track-wrap::before{left:0;background:linear-gradient(to right,var(--mork),transparent)}
.galleri-track-wrap::after{right:0;background:linear-gradient(to left,var(--mork),transparent)}
.galleri-track{display:flex;gap:1.5rem;animation:galleri-scroll 30s linear infinite;width:max-content;padding:.5rem 0}
.galleri-track:hover{animation-play-state:paused}
@keyframes galleri-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.galleri-bilde{width:280px;height:200px;border-radius:14px;overflow:hidden;flex-shrink:0;border:1px solid rgba(160,124,197,.2);background:rgba(74,53,112,.5)}
.galleri-bilde img{width:100%;height:100%;object-fit:cover}
.aktiviteter{background:var(--lilla-dyp);padding:5rem 2rem;position:relative;overflow:hidden}
.aktiviteter::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 0% 100%,rgba(160,124,197,.25) 0%,transparent 50%),radial-gradient(ellipse at 100% 0%,rgba(196,123,160,.18) 0%,transparent 50%)}
.aktiviteter .seksjon-tittel{color:white}.aktiviteter .seksjon-label{color:rgba(232,168,48,.9)}
.akt-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;position:relative;z-index:1}
.akt-kort{background:rgba(250,245,255,.09);border:1px solid rgba(250,245,255,.16);border-radius:16px;padding:1.8rem;transition:all .3s;position:relative;overflow:hidden}
.akt-kort:hover{background:rgba(250,245,255,.14);border-color:rgba(232,168,48,.4);transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.25)}
.akt-kort::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--sol),var(--rose));opacity:0;transition:opacity .3s}
.akt-kort:hover::after{opacity:1}
.akt-tag{display:inline-block;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(232,168,48,.95);border:1px solid rgba(232,168,48,.35);padding:.18rem .7rem;border-radius:20px;margin-bottom:.8rem;font-weight:700}
.akt-kort h3{font-family:'Cinzel',serif;font-size:1rem;color:white;margin-bottom:.7rem;line-height:1.3}
.akt-kort p{font-size:.83rem;color:rgba(250,245,255,.7);margin-bottom:1.2rem;line-height:1.7}
.akt-detaljer{border-top:1px solid rgba(250,245,255,.12);padding-top:1rem;display:flex;flex-direction:column;gap:.45rem}
.akt-linje{display:flex;gap:.6rem;font-size:.8rem;color:rgba(250,245,255,.75);align-items:flex-start}
.akt-linje .ic{flex-shrink:0;color:rgba(232,168,48,.8);font-style:normal}
.kalender{background:var(--lys);padding:5rem 2rem}
.kalender-inner{max-width:900px;margin:0 auto}
.kalender-inner .seksjon-tittel{color:var(--mork)}.kalender-inner .seksjon-label{color:var(--lilla)}
.kalender-liste{display:flex;flex-direction:column;gap:1rem;margin-top:2.5rem}
.kal-rad{background:white;border:1px solid rgba(123,94,167,.12);border-radius:14px;display:grid;grid-template-columns:90px 1fr auto;gap:1.5rem;align-items:center;padding:1.2rem 1.8rem;transition:all .25s}
.kal-rad:hover{border-color:rgba(123,94,167,.35);box-shadow:0 6px 24px rgba(123,94,167,.1);transform:translateX(3px)}
.kal-dato{text-align:center;background:linear-gradient(135deg,rgba(123,94,167,.08),rgba(196,123,160,.06));border-radius:10px;padding:.8rem .5rem;border:1px solid rgba(123,94,167,.1)}
.kal-dag{font-family:'Cinzel',serif;font-size:1.5rem;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;line-height:1.1}
.kal-mnd{font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--graa);display:block;margin-top:.2rem}
.kal-info h4{font-family:'Cinzel',serif;font-size:.92rem;color:var(--mork);margin-bottom:.2rem;font-weight:500}
.kal-info p{font-size:.78rem;color:var(--graa)}
.kal-pris{text-align:right;white-space:nowrap}
.kal-beloep{font-family:'Cinzel',serif;font-size:1.05rem;color:var(--lilla-dyp);display:block}
.kal-type{font-size:.63rem;color:var(--graa);text-transform:uppercase;letter-spacing:.08em}
.kalender-bunntekst{margin-top:2rem;padding:1.5rem;background:linear-gradient(135deg,rgba(123,94,167,.07),rgba(196,123,160,.05));border-radius:12px;border:1px solid rgba(123,94,167,.12);font-size:.85rem;color:var(--graa);text-align:center}
.kalender-bunntekst a{color:var(--lilla);text-decoration:none;font-weight:700}
.priser{background:white;padding:5rem 2rem;position:relative;overflow:hidden}
.priser::before{content:'';position:absolute;bottom:-100px;right:-100px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(123,94,167,.06) 0%,transparent 70%);pointer-events:none}
.priser-inner{max-width:1100px;margin:0 auto}
.priser .seksjon-tittel{color:var(--mork)}.priser .seksjon-label{color:var(--lilla)}
.priser-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;margin-top:2.5rem}
.pris-kort{background:var(--lys);border:1px solid rgba(123,94,167,.13);border-radius:16px;padding:2rem 1.5rem;text-align:center;transition:all .3s;position:relative;overflow:hidden}
.pris-kort:hover{transform:translateY(-5px);box-shadow:0 16px 50px rgba(123,94,167,.15);border-color:rgba(123,94,167,.3)}
.pris-kort::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gradient)}
.pris-kort h3{font-family:'Cinzel',serif;font-size:.92rem;color:var(--mork);margin-bottom:1rem;font-weight:500}
.pris-beloep{font-family:'Cinzel',serif;font-size:1.8rem;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;margin-bottom:.25rem}
.pris-varighet{font-size:.68rem;color:var(--graa);text-transform:uppercase;letter-spacing:.08em}
.pris-linje{height:1px;background:rgba(123,94,167,.1);margin:1.2rem 0}
.pris-kort p{font-size:.82rem;color:var(--graa);line-height:1.6}
.pris-extra{display:inline-block;margin-top:.7rem;font-size:.78rem;color:var(--lilla);font-weight:700}
.referanser{background:var(--mork);padding:5rem 2rem;position:relative;overflow:hidden}
.referanser::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(123,94,167,.22) 0%,transparent 65%);pointer-events:none}
.referanser .seksjon-tittel{color:white}.referanser .seksjon-label{color:var(--lilla-lys)}
.ref-grid{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;position:relative;z-index:1}
.ref-kort{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.11);border-radius:16px;padding:2rem;transition:all .3s}
.ref-kort:hover{background:rgba(255,255,255,.09);border-color:rgba(123,94,167,.4)}
.ref-anf{font-family:'Lora',serif;font-size:4rem;line-height:1;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:.45;display:block;margin-bottom:.5rem}
.ref-tekst{font-family:'Lora',serif;font-style:italic;font-size:.9rem;color:rgba(255,255,255,.82);line-height:1.85;margin-bottom:1.2rem}
.ref-navn{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700}
.kontakt{background:var(--lys);padding:5rem 2rem}
.kontakt-inner{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
.kontakt-info .seksjon-tittel{color:var(--mork)}.kontakt-info .seksjon-label{color:var(--lilla)}
.kontakt-info>p{color:var(--graa);font-size:.95rem;margin-bottom:2rem}
.kontakt-liste{list-style:none;display:flex;flex-direction:column;gap:1.2rem}
.kontakt-liste li{display:flex;align-items:flex-start;gap:1rem}
.k-ikon{width:42px;height:42px;background:linear-gradient(135deg,rgba(123,94,167,.12),rgba(196,123,160,.08));border:1px solid rgba(123,94,167,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.k-detalj small{display:block;font-size:.67rem;color:var(--lilla);text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:.15rem}
.k-detalj a{color:var(--mork);text-decoration:none;font-size:.92rem;transition:color .2s}
.k-detalj a:hover{color:var(--lilla)}
.kontakt-skjema{background:white;border-radius:20px;padding:2.5rem;border:1px solid rgba(123,94,167,.13);box-shadow:0 8px 40px rgba(123,94,167,.09);position:relative;overflow:hidden}
.kontakt-skjema::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:var(--gradient)}
.kontakt-skjema h3{font-family:'Cinzel',serif;font-size:1rem;color:var(--mork);margin-bottom:1.5rem;font-weight:500}
.skjema-felt{display:flex;flex-direction:column;gap:.9rem}
.skjema-felt select,.skjema-felt textarea{background:var(--lys);border:1.5px solid rgba(123,94,167,.13);border-radius:10px;padding:.85rem 1.1rem;color:var(--tekst);font-family:'Nunito',sans-serif;font-size:.88rem;outline:none;transition:border-color .2s;width:100%}
.skjema-felt select:focus,.skjema-felt textarea:focus{border-color:var(--lilla);background:white}
.skjema-felt textarea{resize:vertical;min-height:110px}
.skjema-felt button{background:var(--gradient);color:white;border:none;padding:.9rem 2rem;font-family:'Nunito',sans-serif;font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;border-radius:30px;cursor:pointer;transition:all .2s;font-weight:700;box-shadow:0 4px 15px rgba(123,94,167,.3)}
.skjema-felt button:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(123,94,167,.45)}
footer{background:var(--mork);padding:2.5rem 2rem;text-align:center;border-top:1px solid rgba(123,94,167,.2)}
.footer-logo{font-family:'Cinzel',serif;font-size:1.2rem;color:white;margin-bottom:.6rem;display:block}
footer p{font-size:.78rem;color:rgba(255,255,255,.55);line-height:2}
footer a{color:var(--lilla-lys);text-decoration:none}
.footer-copy{color:rgba(255,255,255,.35)!important;font-size:.7rem!important}
@media(max-width:900px){
  nav{padding:.9rem 1.3rem}.nav-links{display:none}.hamburger{display:flex}
  .hero{padding:6rem 1.5rem 4rem}.hero-buttons{flex-direction:column;align-items:center}
  .btn-primary,.btn-secondary{width:100%;max-width:280px;text-align:center}
  .orbital-wrap{width:160px;height:160px}
  .om-inner{grid-template-columns:1fr;gap:2.5rem}.om-fakta{grid-template-columns:1fr 1fr}
  .akt-grid{grid-template-columns:1fr;max-width:480px;margin-left:auto;margin-right:auto}
  .kal-rad{grid-template-columns:75px 1fr;padding:1rem 1.2rem;gap:1rem}.kal-pris{display:none}
  .priser-grid{grid-template-columns:1fr 1fr;gap:1rem}
  .ref-grid{grid-template-columns:1fr}
  .kontakt-inner{grid-template-columns:1fr;gap:2.5rem}
  .galleri-bilde{width:220px;height:160px}
}
@media(max-width:500px){
  .priser-grid{grid-template-columns:1fr;max-width:340px;margin:2rem auto 0}
  .kal-rad{grid-template-columns:1fr;gap:.7rem}
  .hero h1{font-size:2.4rem}.seksjon-tittel{font-size:1.6rem}
}
`