import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Slot from './Slot.jsx'
import { useLang, LangToggle } from './lang.jsx'

// EntranceV2 — DIRECTION B · "TWO WORLDS".
// Personal pane = scrapbook / sticker energy: washi tape, tilted polaroid,
// Caveat handwriting, warm cream, a playful tilted hollowed watermark.
// Business pane = corporate / structured: faint grid, sharp rectangular card,
// ink palette, a "B2B" badge, an upright precise hollowed word.
// They share the Folk Print palette but read as two different design systems.

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
    pickScript: 'выбирай настроение',
    studio: 'студия',
    photoSlot: 'фото · футболка с принтом',
    forYou: 'для тебя',
    b2b: 'B2B',
    docs: 'договор · закрывающие документы',
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
    pickScript: 'kayfiyatni tanlang',
    studio: 'studiya',
    photoSlot: 'foto · printli futbolka',
    forYou: 'sen uchun',
    b2b: 'B2B',
    docs: 'shartnoma · hujjatlar',
  },
}

export default function EntranceV2() {
  const { lang } = useLang()
  const t = STR[lang]
  const [hover, setHover] = useState(null) // 'p' | 'b' | null

  return (
    <>
      <style>{`
        .ev2-root{box-sizing:border-box;min-height:100vh;width:100%;overflow:hidden;
          font-family:'Manrope',sans-serif;display:flex;flex-direction:column;background:#F5EFE5}
        .ev2-root *,.ev2-root *::before,.ev2-root *::after{box-sizing:border-box}

        /* ----- header ----- */
        .ev2-head{display:flex;justify-content:space-between;align-items:center;
          gap:24px;padding:26px 40px;flex:none;position:relative;z-index:6}
        .ev2-head-r{display:flex;align-items:center;gap:20px}
        .ev2-studio{font-family:'Oswald',sans-serif;font-weight:600;font-size:11px;
          letter-spacing:.18em;text-transform:uppercase;color:#857B69;text-decoration:none;
          padding-bottom:2px;border-bottom:1.5px solid transparent;transition:border-color .25s,color .25s}
        .ev2-studio:hover{color:#15120D;border-color:#FCAC45}

        /* ----- split ----- */
        .ev2-split{flex:1;display:flex;min-height:0;position:relative}
        .ev2-pane{flex:1;position:relative;display:flex;flex-direction:column;
          text-decoration:none;overflow:hidden;min-height:560px;
          transition:flex-grow .55s cubic-bezier(.4,0,.15,1)}
        .ev2-split:hover .ev2-pane{flex-grow:.86}
        .ev2-split:hover .ev2-pane:hover{flex-grow:1.28}

        /* ----- PERSONAL (scrapbook) ----- */
        .ev2-p{background:
            radial-gradient(120% 80% at 20% 0%, #FBF5EA 0%, #F5EFE5 55%, #EFE7D6 100%);
          padding:40px 46px 46px}
        .ev2-p::before{content:'';position:absolute;inset:0;pointer-events:none;
          background-image:radial-gradient(rgba(201,122,20,.10) 1px, transparent 1.4px);
          background-size:13px 13px;opacity:.7;mix-blend-mode:multiply}
        .ev2-p-hollow{position:absolute;left:-4%;bottom:-6%;margin:0;z-index:0;
          font-family:'Oswald',sans-serif;font-weight:700;text-transform:uppercase;
          font-size:clamp(96px,17vw,210px);line-height:.8;letter-spacing:-.01em;
          color:transparent;-webkit-text-stroke:2px #C97A14;
          transform:rotate(-7deg);opacity:.9;white-space:nowrap;
          transition:transform .6s cubic-bezier(.3,.1,.2,1)}
        .ev2-p:hover .ev2-p-hollow{transform:rotate(-7deg) translateY(-10px) scale(1.04)}
        .ev2-tape{position:absolute;width:122px;height:30px;z-index:3;
          background:repeating-linear-gradient(45deg,rgba(252,172,69,.62) 0 9px,rgba(252,172,69,.42) 9px 18px);
          border-left:1px dashed rgba(201,122,20,.4);border-right:1px dashed rgba(201,122,20,.4);
          box-shadow:0 2px 6px rgba(21,18,13,.10)}
        .ev2-polaroid{position:relative;z-index:2;align-self:flex-start;
          background:#fff;padding:12px 12px 20px;border-radius:3px;border:1px solid #ECE3D2;
          box-shadow:0 20px 44px rgba(21,18,13,.16);transform:rotate(-3.2deg);
          transition:transform .5s cubic-bezier(.3,.1,.2,1);width:min(330px,72%)}
        .ev2-p:hover .ev2-polaroid{transform:rotate(-1.4deg) translateY(-4px)}
        .ev2-polaroid-img{position:relative;height:230px;overflow:hidden;border-radius:2px;background:#EBE2D2}
        .ev2-polaroid-cap{font-family:'Caveat',cursive;font-weight:700;font-size:23px;
          color:#C97A14;text-align:center;margin-top:7px;transform:rotate(-1.5deg)}

        /* ----- BUSINESS (corporate) ----- */
        .ev2-b{background:#15120D;padding:40px 46px 46px;color:#F5EFE5}
        .ev2-b::before{content:'';position:absolute;inset:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(245,239,229,.05) 1px,transparent 1px),
            linear-gradient(90deg,rgba(245,239,229,.05) 1px,transparent 1px);
          background-size:46px 46px}
        .ev2-b-hollow{position:absolute;right:5%;top:46%;margin:0;z-index:0;
          font-family:'Oswald',sans-serif;font-weight:700;text-transform:uppercase;
          font-size:clamp(80px,12.5vw,168px);line-height:.84;letter-spacing:-.005em;
          color:transparent;-webkit-text-stroke:2px #4A4334;text-align:right;
          opacity:.95;white-space:nowrap;transition:-webkit-text-stroke-color .4s}
        .ev2-b:hover .ev2-b-hollow{-webkit-text-stroke:2px #C97A14}
        .ev2-b-card{position:relative;z-index:2;background:rgba(34,29,21,.66);
          border:1px solid rgba(245,239,229,.16);border-radius:2px;padding:22px;
          width:min(340px,74%);backdrop-filter:blur(2px);
          transition:border-color .4s,transform .5s cubic-bezier(.3,.1,.2,1)}
        .ev2-b:hover .ev2-b-card{border-color:rgba(252,172,69,.45);transform:translateY(-4px)}
        .ev2-b-card-img{position:relative;height:230px;overflow:hidden;border-radius:1px;
          background:#221D15;filter:grayscale(.35) brightness(.92)}
        .ev2-badge{display:inline-flex;align-items:center;gap:7px;
          font-family:'Oswald',sans-serif;font-weight:700;font-size:12px;letter-spacing:.22em;
          text-transform:uppercase;color:#15120D;background:#FCAC45;
          padding:5px 11px;border-radius:2px}
        .ev2-docs{font-family:'Manrope',sans-serif;font-size:11.5px;letter-spacing:.04em;
          color:#857B69;margin-top:9px;display:flex;align-items:center;gap:8px}
        .ev2-docs::before{content:'';width:18px;height:1px;background:#857B69;display:inline-block}

        /* ----- shared eyebrow + cta ----- */
        .ev2-eyebrow{display:inline-flex;align-items:center;gap:10px;
          font-family:'Oswald',sans-serif;font-weight:600;letter-spacing:.16em;
          text-transform:uppercase;font-size:14px;position:relative;z-index:4}
        .ev2-eyebrow .dot{width:9px;height:9px;border-radius:999px}
        .ev2-bodytext{font-size:15px;line-height:1.55;max-width:380px;position:relative;z-index:4}
        .ev2-cta{display:inline-flex;align-items:center;gap:12px;
          font-family:'Oswald',sans-serif;font-weight:600;text-transform:uppercase;
          letter-spacing:.05em;font-size:16px;position:relative;z-index:4}
        .ev2-cta .arr{display:inline-grid;place-items:center;width:36px;height:36px;
          transition:transform .35s cubic-bezier(.3,.1,.2,1)}
        .ev2-pane:hover .ev2-cta .arr{transform:translateX(6px)}

        /* ----- center divider ----- */
        .ev2-seam{position:absolute;left:50%;top:0;bottom:0;width:0;z-index:5;
          transform:translateX(-50%);pointer-events:none}
        .ev2-seam-line{position:absolute;left:0;top:0;bottom:0;width:1px;
          background:linear-gradient(#C97A14,#15120D)}
        .ev2-seam-or{position:absolute;left:0;top:50%;transform:translate(-50%,-50%);
          width:46px;height:46px;border-radius:999px;background:#FCAC45;color:#15120D;
          display:grid;place-items:center;font-family:'Oswald',sans-serif;font-weight:700;
          font-size:16px;box-shadow:0 8px 22px rgba(21,18,13,.3)}

        @media (max-width:860px){
          .ev2-head{padding:20px 20px;flex-wrap:wrap}
          .ev2-split{flex-direction:column}
          .ev2-pane{min-height:auto;transition:none}
          .ev2-split:hover .ev2-pane,.ev2-split:hover .ev2-pane:hover{flex-grow:1}
          .ev2-p,.ev2-b{padding:120px 22px 40px}
          .ev2-p-hollow{font-size:clamp(76px,30vw,140px);left:-2%;bottom:auto;top:18px;transform:rotate(-5deg)}
          .ev2-b-hollow{font-size:clamp(64px,26vw,120px);right:auto;left:4%;top:18px;text-align:left}
          .ev2-polaroid,.ev2-b-card{width:min(330px,90%)}
          .ev2-seam{left:0;right:0;width:100%;top:50%;bottom:auto;height:0;transform:translateY(-50%)}
          .ev2-seam-line{left:0;right:0;top:0;width:100%;height:1px;
            background:linear-gradient(90deg,#C97A14,#15120D)}
          .ev2-seam-or{left:50%}
        }
        @media (max-width:480px){
          .ev2-polaroid-img,.ev2-b-card-img{height:190px}
          .ev2-cta{font-size:15px}
        }
      `}</style>

      <div className="ev2-root">

        <header className="ev2-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <Logo variant="black" height={34} />
            <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '11px', color: '#857B69', borderLeft: '1px solid #D8CDB8', paddingLeft: '16px' }}>{t.tagline}</span>
          </div>
          <div className="ev2-head-r">
            <Link to="/studio" className="ev2-studio">{t.studio}</Link>
            <span style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: '22px', color: '#C97A14', transform: 'rotate(-3deg)', display: 'inline-block' }}>{t.pickScript}</span>
            <LangToggle />
          </div>
        </header>

        <div className="ev2-split" onMouseLeave={() => setHover(null)}>

          {/* ===== PERSONAL — scrapbook ===== */}
          <Link to="/lichnoe" className="ev2-pane ev2-p" onMouseEnter={() => setHover('p')}>
            <span className="ev2-p-hollow">{t.hollowPersonal}</span>

            <div className="ev2-eyebrow" style={{ color: '#15120D' }}>
              <span className="dot" style={{ background: '#FCAC45' }} />{t.personalEyebrow}
            </div>

            <div style={{ position: 'relative', marginTop: '30px', marginBottom: '28px' }}>
              <div className="ev2-tape" style={{ top: '-14px', left: '22%', transform: 'rotate(-5deg)' }} />
              <div className="ev2-polaroid">
                <div className="ev2-polaroid-img">
                  <Slot label={t.photoSlot} radius={2} style={{ position: 'absolute', inset: 0, borderRadius: 2 }} />
                </div>
                <div className="ev2-polaroid-cap">{t.forYou}</div>
              </div>
            </div>

            <p className="ev2-bodytext" style={{ color: '#6F6655', margin: '0 0 4px' }}>{t.personalBody}</p>

            <span className="ev2-cta" style={{ color: '#15120D', marginTop: 'auto', paddingTop: '22px' }}>
              {t.personalCta}
              <span className="arr" style={{ borderRadius: '999px', background: '#FCAC45', color: '#15120D' }}>→</span>
            </span>
          </Link>

          {/* ===== BUSINESS — corporate ===== */}
          <Link to="/biznesu" className="ev2-pane ev2-b" onMouseEnter={() => setHover('b')}>
            <span className="ev2-b-hollow">{t.hollowBusiness}</span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 4 }}>
              <div className="ev2-eyebrow" style={{ color: '#F5EFE5' }}>
                <span className="dot" style={{ background: '#FCAC45' }} />{t.businessEyebrow}
              </div>
              <span className="ev2-badge">{t.b2b}</span>
            </div>

            <div className="ev2-b-card" style={{ marginTop: '30px', marginBottom: '28px' }}>
              <div className="ev2-b-card-img">
                <Slot label={t.photoSlot} radius={1} style={{ position: 'absolute', inset: 0, borderRadius: 1 }} />
              </div>
              <div className="ev2-docs">{t.docs}</div>
            </div>

            <p className="ev2-bodytext" style={{ color: '#B7AE9B', margin: '0 0 4px' }}>{t.businessBody}</p>

            <span className="ev2-cta" style={{ color: '#F5EFE5', marginTop: 'auto', paddingTop: '22px' }}>
              {t.businessCta}
              <span className="arr" style={{ borderRadius: '2px', border: '1.5px solid #FCAC45', color: '#FCAC45' }}>→</span>
            </span>
          </Link>

          <div className="ev2-seam" aria-hidden="true">
            <span className="ev2-seam-line" />
            <span className="ev2-seam-or" style={{ transition: 'transform .4s cubic-bezier(.3,.1,.2,1)', transform: `translate(-50%,-50%) rotate(${hover === 'p' ? -14 : hover === 'b' ? 14 : 0}deg)` }}>/</span>
          </div>

        </div>
      </div>
    </>
  )
}
