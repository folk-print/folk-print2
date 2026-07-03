import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Slot from './Slot.jsx'
import { useLang, LangToggle } from './lang.jsx'

const STR = {
  ru: {
    tagline: 'Печать на одежде · Ташкент · с 2014',
    personalEyebrow: 'ЛИЧНОЕ',
    businessEyebrow: 'БИЗНЕСУ',
    personalBody: 'DTF-печать и вышивка на футболках, худи и шопперах — от 1 штуки.',
    businessBody: 'Форма, промо и мерч с вашим логотипом — любой тираж, по договору.',
    personalCta: 'Заказать для себя',
    businessCta: 'Получить КП',
    hollowPersonal: 'СЕБЕ',
    hollowBusiness: 'КОМПАНИИ',
    studio: 'студия',
  },
  uz: {
    tagline: 'Kiyimga bosma · Toshkent · 2014-yildan',
    personalEyebrow: 'OʻZINGIZ UCHUN',
    businessEyebrow: 'BIZNES UCHUN',
    personalBody: 'Futbolka, xudi va shopperlarga DTF-bosma va tikuv — 1 donadan.',
    businessBody: 'Logotipingiz bilan forma, promo va merch — istalgan tirajda, shartnoma asosida.',
    personalCta: 'Oʻzim uchun',
    businessCta: 'Tijoriy taklif',
    hollowPersonal: 'OZIMGA',
    hollowBusiness: 'KOMPANIYAGA',
    studio: 'studiya',
  },
}

// Entrance — DIRECTION C, "hover-fill interaction".
// Two calm panes at rest: muted outlined hero word, slim. On hover the pane
// flex-grows and its giant hollowed word FILLS SOLID (personal → amber,
// business → ink), the arrow slides, the photo wakes. Personal = warm/amber,
// business = cool/ink/structured. The fill is the differentiator.
export default function Entrance() {
  const { lang } = useLang()
  const t = STR[lang]
  // Drive which pane is "active" so touch/keyboard users (no :hover) also get
  // the grow + fill. CSS :hover still handles pointer for instant feedback.
  const [active, setActive] = useState(null) // 'p' | 'b' | null

  return (
    <>
      <style>{`
        .v3-root{ box-sizing:border-box; }
        .v3-root *{ box-sizing:border-box; }

        .v3-split{ display:flex; flex:1; min-height:0; }

        /* Rest = calm, equal-ish. Active pane grows. */
        .v3-pane{
          position:relative; flex:1 1 0; min-width:0; overflow:hidden;
          display:flex; flex-direction:column; justify-content:flex-end;
          text-decoration:none; isolation:isolate;
          transition:flex-grow .65s cubic-bezier(.22,1,.36,1),
                     background-color .55s ease, color .45s ease;
          will-change:flex-grow;
        }
        /* hover (pointer) + .is-on (touch/focus) both expand */
        .v3-split:hover .v3-pane{ flex-grow:.72; }
        .v3-pane:hover{ flex-grow:1.55 !important; }
        .v3-pane.is-on{ flex-grow:1.55; }
        .v3-split:has(.v3-pane.is-on) .v3-pane:not(.is-on){ flex-grow:.72; }
        .v3-pane:focus-visible{ outline:none; flex-grow:1.55; }

        /* ---- PERSONAL : warm, cream, playful ---- */
        .v3-p{ background:#F5EFE5; color:#15120D; border-right:1px solid #E3D9C6; }
        .v3-p:hover, .v3-p.is-on{ background:#FBF6EC; }

        /* ---- BUSINESS : cool, ink, structured ---- */
        .v3-b{ background:#1B1813; color:#F5EFE5; }
        .v3-b:hover, .v3-b.is-on{ background:#15120D; }

        /* GIANT HOLLOW WORD — the signature element */
        .v3-hollow{
          font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
          line-height:.78; letter-spacing:-.01em; margin:0;
          color:transparent; white-space:nowrap;
          transition:-webkit-text-stroke .5s ease, color .5s ease,
                     transform .65s cubic-bezier(.22,1,.36,1), opacity .5s ease;
        }
        .v3-hollow-p{
          font-size:clamp(78px,14vw,196px);
          -webkit-text-stroke:2px #C2B79E; /* muted at rest */
          transform:translateX(-2px);
        }
        .v3-p:hover .v3-hollow-p, .v3-p.is-on .v3-hollow-p{
          -webkit-text-stroke:0 transparent; color:#FCAC45;          /* fills AMBER */
          transform:translateX(0);
        }
        .v3-hollow-b{
          font-size:clamp(72px,13vw,182px);
          -webkit-text-stroke:2px #4A443A; /* muted at rest */
          transform:translateX(2px);
        }
        .v3-b:hover .v3-hollow-b, .v3-b.is-on .v3-hollow-b{
          -webkit-text-stroke:0 transparent; color:#F5EFE5;          /* fills INK→cream solid */
          transform:translateX(0);
        }

        /* photo wakes on activation */
        .v3-photo{ opacity:0; transform:scale(1.06); transition:opacity .6s ease, transform .9s cubic-bezier(.22,1,.36,1); }
        .v3-p:hover .v3-photo, .v3-p.is-on .v3-photo,
        .v3-b:hover .v3-photo, .v3-b.is-on .v3-photo{ opacity:1; transform:scale(1); }

        /* body copy + cta reveal a touch on activation */
        .v3-reveal{ opacity:.0; transform:translateY(8px); transition:opacity .5s ease .05s, transform .55s cubic-bezier(.22,1,.36,1) .05s; }
        .v3-pane:hover .v3-reveal, .v3-pane.is-on .v3-reveal, .v3-pane:focus-visible .v3-reveal{ opacity:1; transform:none; }

        .v3-arrow{ transition:transform .5s cubic-bezier(.22,1,.36,1), background-color .4s ease, color .4s ease; }
        .v3-pane:hover .v3-arrow, .v3-pane.is-on .v3-arrow, .v3-pane:focus-visible .v3-arrow{ transform:translateX(10px); }

        /* eyebrow accent dot */
        .v3-dot{ width:9px; height:9px; border-radius:999px; display:inline-block; }

        @media (prefers-reduced-motion: reduce){
          .v3-pane,.v3-hollow,.v3-photo,.v3-reveal,.v3-arrow{ transition:none !important; }
        }

        /* ---------- MOBILE STACK ---------- */
        @media (max-width:860px){
          .v3-header{ padding:20px 20px 0 !important; }
          .v3-split{ flex-direction:column; }
          .v3-pane{ flex:none !important; min-height:54vh; justify-content:flex-end; }
          .v3-split:hover .v3-pane{ flex-grow:0; }
          .v3-pane:hover, .v3-pane.is-on{ flex-grow:0 !important; }
          .v3-split:has(.v3-pane.is-on) .v3-pane:not(.is-on){ flex-grow:0; }
          .v3-p{ border-right:0; border-bottom:1px solid #E3D9C6; }
          .v3-inner{ padding:26px 20px 30px !important; }
          .v3-hollow-p{ font-size:clamp(64px,21vw,128px); }
          .v3-hollow-b{ font-size:clamp(60px,20vw,120px); }
          /* On mobile (no hover) keep words filled + copy visible so it reads. */
          .v3-hollow-p{ -webkit-text-stroke:0 transparent; color:#FCAC45; }
          .v3-hollow-b{ -webkit-text-stroke:0 transparent; color:#F5EFE5; }
          .v3-reveal{ opacity:1; transform:none; }
          .v3-photo{ opacity:1; transform:none; }
        }
      `}</style>

      <div
        className="v3-root"
        style={{
          minHeight: '100vh', width: '100%', overflowX: 'hidden',
          background: '#1B1813', fontFamily: "'Manrope',sans-serif",
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* HEADER — sits on cream so logo black reads; spans full bleed */}
        <header
          className="v3-header"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '20px', padding: '26px 40px', background: '#F5EFE5',
            borderBottom: '1px solid #E3D9C6', position: 'relative', zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <Logo variant="black" height={34} />
            <span
              style={{
                fontFamily: "'Oswald',sans-serif", fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '.14em', fontSize: '12px', color: '#857B69',
                borderLeft: '1px solid #DBD0BD', paddingLeft: '18px',
              }}
            >
              {t.tagline}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/studio"
              style={{
                fontFamily: "'Oswald',sans-serif", fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '.12em', fontSize: '12px', color: '#988E7B', textDecoration: 'none',
              }}
            >
              {t.studio}
            </Link>
            <LangToggle />
          </div>
        </header>

        {/* SPLIT */}
        <div className="v3-split">

          {/* ---------------- PERSONAL ---------------- */}
          <Link
            to="/lichnoe"
            className={'v3-pane v3-p' + (active === 'p' ? ' is-on' : '')}
            onMouseEnter={() => setActive('p')}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive('p')}
            onBlur={() => setActive(null)}
            aria-label={t.personalEyebrow}
          >
            {/* optional photo placeholder behind everything */}
            <Slot
              label={t.personalEyebrow}
              radius={0}
              className="v3-photo"
              style={{ position: 'absolute', inset: 0, borderRadius: 0, mixBlendMode: 'multiply', opacity: undefined }}
            />
            {/* warm wash so amber fill pops over photo */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(245,239,229,.0) 0%, rgba(245,239,229,.78) 62%, rgba(245,239,229,.95) 100%)', pointerEvents: 'none' }} />

            <div className="v3-inner" style={{ position: 'relative', padding: '46px 48px 50px', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px' }}>
                <span className="v3-dot" style={{ background: '#FCAC45' }} />
                <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, letterSpacing: '.16em', fontSize: '14px', color: '#15120D' }}>{t.personalEyebrow}</span>
                <span style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: '24px', color: '#C97A14', transform: 'rotate(-4deg)', marginLeft: '6px' }}>:)</span>
              </div>

              <h2 className="v3-hollow v3-hollow-p">{t.hollowPersonal}</h2>

              <p className="v3-reveal" style={{ margin: '20px 0 0', fontSize: '16px', lineHeight: 1.55, color: '#6F6655', maxWidth: '430px' }}>{t.personalBody}</p>

              <span
                className="v3-reveal"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '14px', marginTop: '24px',
                  fontFamily: "'Oswald',sans-serif", fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '.05em', fontSize: '16px', color: '#15120D',
                }}
              >
                {t.personalCta}
                <span
                  className="v3-arrow"
                  style={{
                    display: 'inline-grid', placeItems: 'center', width: '36px', height: '36px',
                    borderRadius: '999px', background: '#FCAC45', color: '#15120D', fontSize: '18px',
                  }}
                >→</span>
              </span>
            </div>
          </Link>

          {/* ---------------- BUSINESS ---------------- */}
          <Link
            to="/biznesu"
            className={'v3-pane v3-b' + (active === 'b' ? ' is-on' : '')}
            onMouseEnter={() => setActive('b')}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive('b')}
            onBlur={() => setActive(null)}
            aria-label={t.businessEyebrow}
          >
            <Slot
              label={t.businessEyebrow}
              radius={0}
              className="v3-photo"
              style={{ position: 'absolute', inset: 0, borderRadius: 0, opacity: undefined, filter: 'grayscale(1) contrast(1.05)' }}
            />
            {/* structured ink wash + faint grid for the "cool/corporate" tone */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(27,24,19,.35) 0%, rgba(21,18,13,.82) 60%, rgba(21,18,13,.96) 100%)', pointerEvents: 'none' }} />
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .5,
                backgroundImage: 'linear-gradient(rgba(245,239,229,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,239,229,.05) 1px, transparent 1px)',
                backgroundSize: '46px 46px',
              }}
            />

            <div className="v3-inner" style={{ position: 'relative', padding: '46px 48px 50px', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px' }}>
                <span className="v3-dot" style={{ background: '#FCAC45' }} />
                <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, letterSpacing: '.16em', fontSize: '14px', color: '#F5EFE5' }}>{t.businessEyebrow}</span>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, letterSpacing: '.16em', fontSize: '12px', color: '#857B69', marginLeft: '6px', border: '1px solid #4A443A', padding: '3px 8px', borderRadius: '4px' }}>B2B</span>
              </div>

              <h2 className="v3-hollow v3-hollow-b">{t.hollowBusiness}</h2>

              <p className="v3-reveal" style={{ margin: '20px 0 0', fontSize: '16px', lineHeight: 1.55, color: '#B8AE9B', maxWidth: '450px' }}>{t.businessBody}</p>

              <span
                className="v3-reveal"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '14px', marginTop: '24px',
                  fontFamily: "'Oswald',sans-serif", fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '.05em', fontSize: '16px', color: '#F5EFE5',
                }}
              >
                {t.businessCta}
                <span
                  className="v3-arrow"
                  style={{
                    display: 'inline-grid', placeItems: 'center', width: '36px', height: '36px',
                    borderRadius: '6px', background: 'transparent', border: '1.5px solid #FCAC45',
                    color: '#FCAC45', fontSize: '18px',
                  }}
                >→</span>
              </span>
            </div>
          </Link>

        </div>
      </div>
    </>
  )
}
