import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Slot from './Slot.jsx'
import { useLang, LangToggle } from './lang.jsx'

// Bilingual copy. Pull EVERY visible string from t = STR[lang].
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
    studio: 'Студия',
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
    studio: 'Studiya',
  },
}

// DIRECTION A — "TYPOGRAPHIC SPLIT".
// The hollowed words ARE the heroes. Full-height 50/50 split; each half is
// dominated by an enormous outlined word that bleeds edge-to-edge and is
// clipped by the pane. Personal = warm amber ground, amber-stroked word,
// handwritten/playful. Business = ink/charcoal ground, cream-stroked word,
// structured/sharp. Magazine-cover energy, strong warm-vs-dark contrast.
export default function Entrance() {
  const { lang } = useLang()
  const t = STR[lang]
  const [hover, setHover] = useState(null) // 'p' | 'b' | null

  return (
    <>
      <style>{`
        .v1-root{box-sizing:border-box; position:relative; min-height:100vh; width:100%; overflow:hidden; background:#15120D; font-family:'Manrope',sans-serif}
        .v1-root *{box-sizing:border-box}

        /* Header sits above both panes */
        .v1-head{position:absolute; top:0; left:0; right:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:26px 40px; pointer-events:none}
        .v1-head a, .v1-head button, .v1-head .v1-headctl{pointer-events:auto}
        .v1-tagline{font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; letter-spacing:.14em; font-size:11.5px; color:#857B69; white-space:nowrap}
        .v1-studio{font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; letter-spacing:.12em; font-size:11.5px; color:#988E7B; text-decoration:none; border-bottom:1px solid rgba(152,142,123,.4); padding-bottom:1px; transition:color .25s, border-color .25s}
        .v1-studio:hover{color:#FCAC45; border-color:#FCAC45}
        .v1-head-logo{background:#F5EFE5; border-radius:10px; padding:7px 12px; box-shadow:0 6px 18px rgba(0,0,0,.18)}

        /* Split */
        .v1-split{position:absolute; inset:0; display:flex; z-index:1}
        .v1-pane{position:relative; flex:1 1 50%; display:flex; flex-direction:column; justify-content:flex-end; overflow:hidden; text-decoration:none; min-height:100vh; transition:flex-grow .6s cubic-bezier(.5,0,.15,1)}
        .v1-pane:hover{flex-grow:1.16}

        .v1-personal{background:radial-gradient(120% 130% at 18% 12%, #FBE7C4 0%, #F4D79E 38%, #F0BC63 100%)}
        .v1-business{background:radial-gradient(120% 130% at 82% 88%, #211C13 0%, #181410 55%, #100D09 100%)}

        /* faint dotted print-grid texture per pane */
        .v1-personal::before{content:''; position:absolute; inset:0; background-image:radial-gradient(rgba(201,122,20,.16) 1px, transparent 1px); background-size:22px 22px; opacity:.6; pointer-events:none}
        .v1-business::before{content:''; position:absolute; inset:0; background-image:radial-gradient(rgba(252,172,69,.10) 1px, transparent 1px); background-size:26px 26px; opacity:.5; pointer-events:none}

        /* GIANT hollow hero word */
        .v1-hollow{position:absolute; font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase; color:transparent; line-height:.78; margin:0; user-select:none; white-space:nowrap; pointer-events:none; letter-spacing:-.01em; transition:transform .7s cubic-bezier(.4,0,.15,1)}
        .v1-hollow-p{left:-.06em; bottom:.30em; font-size:clamp(82px, 17vw, 200px); -webkit-text-stroke:2.5px #C97A14; transform:rotate(-2.5deg)}
        .v1-hollow-b{right:-.06em; bottom:.30em; text-align:right; font-size:clamp(62px, 12.5vw, 168px); -webkit-text-stroke:2px #FCAC45}
        .v1-personal:hover .v1-hollow-p{transform:rotate(-2.5deg) translateY(-8px) scale(1.015)}
        .v1-business:hover .v1-hollow-b{transform:translateY(-8px) scale(1.015)}

        /* solid ghost echo behind the hollow word for depth */
        .v1-echo-p{position:absolute; left:-.05em; bottom:.275em; font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase; font-size:clamp(82px, 17vw, 200px); line-height:.78; color:rgba(201,122,20,.10); transform:rotate(-2.5deg); white-space:nowrap; pointer-events:none; user-select:none}
        .v1-echo-b{position:absolute; right:-.05em; bottom:.275em; font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase; font-size:clamp(62px, 12.5vw, 168px); line-height:.78; color:rgba(252,172,69,.06); white-space:nowrap; pointer-events:none; user-select:none; text-align:right}

        /* optional photo placeholder, dimmed behind copy */
        .v1-photo{position:absolute; pointer-events:none; box-shadow:0 24px 60px rgba(0,0,0,.28)}
        .v1-photo-p{top:9vh; right:6%; width:min(30%, 240px); height:min(38vh, 320px); transform:rotate(3deg); border:6px solid #fff; border-radius:4px; overflow:hidden}
        .v1-photo-b{top:8vh; left:6%; width:min(28%, 220px); height:min(36vh, 300px); transform:rotate(-3deg); border:1px solid rgba(252,172,69,.28); border-radius:4px; overflow:hidden; opacity:.92}

        /* foreground content block — soft scrim keeps copy legible over the hero word */
        .v1-content{position:relative; z-index:5; margin:0 clamp(20px, 4vw, 52px) clamp(40px, 6.5vh, 70px); padding:18px 20px; border-radius:14px}
        .v1-content-p{align-self:flex-start; max-width:440px; background:linear-gradient(180deg, rgba(251,231,196,0) 0%, rgba(250,223,168,.55) 36%, rgba(248,216,150,.78) 100%)}
        .v1-content-b{align-self:flex-end; text-align:right; max-width:440px; background:linear-gradient(180deg, rgba(16,13,9,0) 0%, rgba(16,13,9,.55) 36%, rgba(16,13,9,.82) 100%)}

        .v1-eyebrow{display:inline-flex; align-items:center; gap:9px; font-family:'Oswald',sans-serif; font-weight:600; letter-spacing:.18em; font-size:13px; text-transform:uppercase}
        .v1-eyebrow-p{color:#5C3C0A}
        .v1-eyebrow-b{flex-direction:row-reverse; color:#FCAC45}
        .v1-dot{width:9px; height:9px; border-radius:999px; flex:none}
        .v1-dot-p{background:#C97A14}
        .v1-dot-b{background:#FCAC45; box-shadow:0 0 0 4px rgba(252,172,69,.18)}

        .v1-tick{font-family:'Caveat',cursive; font-weight:700; font-size:24px; display:block; margin-top:14px}
        .v1-tick-p{color:#B36C0E; transform:rotate(-3deg)}

        .v1-body{font-family:'Manrope',sans-serif; font-size:15.5px; line-height:1.5; margin:13px 0 0}
        .v1-body-p{color:#5E4A29}
        .v1-body-b{color:#B8AC95; margin-left:auto}

        .v1-cta{display:inline-flex; align-items:center; gap:12px; margin-top:22px; font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; letter-spacing:.05em; font-size:16.5px}
        .v1-cta-p{color:#15120D}
        .v1-cta-b{flex-direction:row-reverse; color:#F5EFE5}
        .v1-arrow{display:inline-grid; place-items:center; width:40px; height:40px; border-radius:999px; font-size:18px; transition:transform .4s cubic-bezier(.3,.1,.2,1)}
        .v1-arrow-p{background:#15120D; color:#FCAC45}
        .v1-arrow-b{background:#FCAC45; color:#15120D}
        .v1-pane:hover .v1-arrow-p{transform:translateX(7px)}
        .v1-pane:hover .v1-arrow-b{transform:translateX(-7px)}

        /* center seam: a torn amber thread */
        .v1-seam{position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%); width:3px; z-index:20; background:repeating-linear-gradient(#FCAC45 0 9px, transparent 9px 17px); opacity:.85; pointer-events:none; transition:opacity .4s}
        .v1-root:hover .v1-seam{opacity:.4}

        /* dim the non-hovered pane slightly to sharpen the choice */
        .v1-split.h-p .v1-business{filter:brightness(.82)}
        .v1-split.h-b .v1-personal{filter:brightness(.94) saturate(.9)}

        @media (max-width:860px){
          .v1-root{overflow-x:hidden}
          .v1-head{position:absolute; flex-wrap:wrap; padding:18px 20px; gap:14px}
          .v1-tagline{font-size:10.5px; white-space:normal; flex:1 1 100%; order:3}
          .v1-split{position:static; flex-direction:column}
          .v1-pane{min-height:62vh; flex:none; justify-content:flex-end}
          .v1-pane:hover{flex-grow:1}
          .v1-personal{padding-top:96px}
          .v1-hollow-p{font-size:clamp(76px, 30vw, 150px); bottom:.34em}
          .v1-hollow-b{font-size:clamp(56px, 22vw, 120px); bottom:.34em}
          .v1-echo-p{font-size:clamp(76px, 30vw, 150px); bottom:.32em}
          .v1-echo-b{font-size:clamp(56px, 22vw, 120px); bottom:.32em}
          .v1-content{padding:0 22px 38px}
          .v1-content-p, .v1-content-b{max-width:none}
          .v1-photo-p, .v1-photo-b{display:none}
          .v1-seam{top:auto; left:0; right:0; width:auto; height:3px; top:62vh; transform:none; background:repeating-linear-gradient(90deg,#FCAC45 0 9px, transparent 9px 17px)}
          .v1-split.h-p .v1-business, .v1-split.h-b .v1-personal{filter:none}
        }
      `}</style>

      <div className="v1-root">

        <header className="v1-head">
          <span className="v1-head-logo"><Logo variant="black" height={34} /></span>
          <span className="v1-tagline">{t.tagline}</span>
          <span className="v1-headctl" style={{ display: 'inline-flex', alignItems: 'center', gap: '18px' }}>
            <Link className="v1-studio" to="/studio">{t.studio}</Link>
            <LangToggle tone="dark" />
          </span>
        </header>

        <div className={'v1-split' + (hover === 'p' ? ' h-p' : hover === 'b' ? ' h-b' : '')}>

          {/* PERSONAL — warm, amber, playful, handwritten */}
          <Link
            className="v1-pane v1-personal"
            to="/lichnoe"
            onMouseEnter={() => setHover('p')}
            onMouseLeave={() => setHover(null)}
          >
            <div className="v1-photo v1-photo-p">
              <Slot label={t.personalEyebrow} radius={2} style={{ position: 'absolute', inset: 0 }} />
            </div>

            <span className="v1-echo-p" aria-hidden="true">{t.hollowPersonal}</span>
            <span className="v1-hollow v1-hollow-p" aria-hidden="true">{t.hollowPersonal}</span>

            <div className="v1-content v1-content-p">
              <span className="v1-eyebrow v1-eyebrow-p"><span className="v1-dot v1-dot-p" />{t.personalEyebrow}</span>
              <p className="v1-body v1-body-p">{t.personalBody}</p>
              <span className="v1-cta v1-cta-p">{t.personalCta}<span className="v1-arrow v1-arrow-p">→</span></span>
            </div>
          </Link>

          {/* BUSINESS — cool, ink, structured, sharp */}
          <Link
            className="v1-pane v1-business"
            to="/biznesu"
            onMouseEnter={() => setHover('b')}
            onMouseLeave={() => setHover(null)}
          >
            <div className="v1-photo v1-photo-b">
              <Slot label={t.businessEyebrow} radius={2} style={{ position: 'absolute', inset: 0 }} />
            </div>

            <span className="v1-echo-b" aria-hidden="true">{t.hollowBusiness}</span>
            <span className="v1-hollow v1-hollow-b" aria-hidden="true">{t.hollowBusiness}</span>

            <div className="v1-content v1-content-b">
              <span className="v1-eyebrow v1-eyebrow-b"><span className="v1-dot v1-dot-b" />{t.businessEyebrow}</span>
              <p className="v1-body v1-body-b">{t.businessBody}</p>
              <span className="v1-cta v1-cta-b">{t.businessCta}<span className="v1-arrow v1-arrow-b">→</span></span>
            </div>
          </Link>

        </div>

        <div className="v1-seam" aria-hidden="true" />
      </div>
    </>
  )
}
