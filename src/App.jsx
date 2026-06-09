import { useState, useEffect, useCallback } from "react";
import { FaTwitter, FaInstagram, FaDiscord, FaYoutube } from "react-icons/fa";
import "./App.css";

const PLAYERS = [
  { 
    id: 9, name: "Cristiano Ronaldo", short: "RONALDO", pos: "ST", nat: "PORTUGAL", rating: 95, pac: 87, sho: 96, pas: 82, dri: 88, def: 35, phy: 80, tier: "ICN", cat: "striker",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/20801.png",
    flagUrl: "https://flagcdn.com/w80/pt.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Al-Nassr_FC_logo.svg",
    accent: "#D4AF37"
  },
  { 
    id: 1, name: "Kylian Mbappé", short: "MBAPPÉ", pos: "ST", nat: "FRANCE", rating: 96, pac: 99, sho: 95, pas: 86, dri: 97, def: 43, phy: 85, tier: "TOTY", cat: "striker",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/231747.png",
    flagUrl: "https://flagcdn.com/w80/fr.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Real_Madrid_CF_logo.svg",
    accent: "#0a3d2e"
  },
  { 
    id: 4, name: "Lionel Messi", short: "MESSI", pos: "RW", nat: "ARGENTINA", rating: 94, pac: 78, sho: 90, pas: 94, dri: 95, def: 38, phy: 65, tier: "ICN", cat: "forward",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/158023.png",
    flagUrl: "https://flagcdn.com/w80/ar.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Inter_Miami_CF_logo.svg",
    accent: "#D4AF37"
  },
  { 
    id: 2, name: "Erling Haaland", short: "HAALAND", pos: "ST", nat: "NORWAY", rating: 97, pac: 89, sho: 98, pas: 65, dri: 80, def: 45, phy: 88, tier: "TOTY", cat: "striker",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/239085.png",
    flagUrl: "https://flagcdn.com/w80/no.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Manchester_City_FC_badge.svg",
    accent: "#0a3d2e"
  },
  { 
    id: 3, name: "Vinícius Jr.", short: "VINI JR.", pos: "LW", nat: "BRAZIL", rating: 97, pac: 99, sho: 91, pas: 90, dri: 98, def: 38, phy: 78, tier: "TOTY", cat: "forward",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/238794.png",
    flagUrl: "https://flagcdn.com/w80/br.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Real_Madrid_CF_logo.svg",
    accent: "#0a3d2e"
  },
  { 
    id: 6, name: "Jude Bellingham", short: "BELLINGHAM", pos: "CM", nat: "ENGLAND", rating: 94, pac: 85, sho: 88, pas: 90, dri: 92, def: 82, phy: 88, tier: "TOTY", cat: "midfielder",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/252371.png",
    flagUrl: "https://flagcdn.com/w80/gb-eng.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Real_Madrid_CF_logo.svg",
    accent: "#0a3d2e"
  },
  { 
    id: 5, name: "Mohamed Salah", short: "SALAH", pos: "RW", nat: "EGYPT", rating: 93, pac: 92, sho: 91, pas: 88, dri: 92, def: 45, phy: 80, tier: "GOLD", cat: "forward",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/209331.png",
    flagUrl: "https://flagcdn.com/w80/eg.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Liverpool_FC.svg",
    accent: "#ffffff"
  },
  { 
    id: 7, name: "Harry Kane", short: "KANE", pos: "ST", nat: "ENGLAND", rating: 91, pac: 72, sho: 94, pas: 83, dri: 82, def: 47, phy: 83, tier: "GOLD", cat: "striker",
    imageUrl: "https://cdn.futbin.com/content/fifa24/img/players/202126.png", 
    flagUrl: "https://flagcdn.com/w80/gb-eng.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    accent: "#ffffff"
  },
  { 
    id: 10, name: "Lamine Yamal", short: "YAMAL", pos: "RW", nat: "SPAIN", rating: 92, pac: 93, sho: 89, pas: 91, dri: 94, def: 35, phy: 68, tier: "GOLD", cat: "forward",
    imageUrl: "https://cdn.futbin.com/content/fifa25/img/players/277643.png", 
    flagUrl: "https://flagcdn.com/w80/es.png",
    clubUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/FC_Barcelona_%28crest%29.svg",
    accent: "#ffffff"
  }
];

const TIER_CONFIG = {
  ICN: { 
    label: "ICON", 
    bg: "bg-gradient-to-b from-[#fdfbfb] via-[#e2d1c3] to-[#d4af37]", 
    border: "border-[#d4af37]", 
    text: "text-black",
    accentBg: "bg-white/40",
    shadow: "shadow-[0_0_20px_rgba(212,175,55,0.4)]"
  },
  TOTY: { 
    label: "TOTY", 
    bg: "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]", 
    border: "border-[#38bdf8]", 
    text: "text-white",
    accentBg: "bg-[#38bdf8]/20",
    shadow: "shadow-[0_0_20px_rgba(56,189,248,0.4)]"
  },
  GOLD: { 
    label: "GOLD RARE", 
    bg: "bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728]", 
    border: "border-[#fbf5b7]", 
    text: "text-black",
    accentBg: "bg-white/40",
    shadow: "shadow-[0_0_15px_rgba(191,149,63,0.5)]"
  }
};

const TOKEN_PACKS = [
  { id: "bronze", name: "Standard Entry", badge: "TIER III", zar: "R5", usd: "$5", tokens: 5, entries: 5, colors: "from-white to-gray-200", text: "text-gray-800", perks: ["5 draw entries", "1 player pick", "Standard alert stream"] },
  { id: "silver", name: "Pro Access", badge: "TIER II", zar: "R25", usd: "$25", tokens: 25, entries: 25, colors: "from-[#0a3d2e] to-[#155d27]", text: "text-white", border: "border-white/30", perks: ["25 draw entries", "3 player picks", "Live stats board", "Prize updates"] },
  { id: "gold", name: "Premium VIP", badge: "TIER I", zar: "R60", usd: "$60", tokens: 60, entries: 60, colors: "from-[#bf953f] to-[#b38728]", text: "text-white", border: "border-[#fbf5b7]", perks: ["60 draw entries", "5 player picks", "Priority support access", "Match predictions analytics"], featured: true },
  { id: "platinum", name: "Ultimate Draft", badge: "ELITE", zar: "R150", usd: "$150", tokens: 150, entries: 150, colors: "from-gray-900 to-black", text: "text-[#d4af37]", border: "border-[#d4af37]", perks: ["150 draw entries", "Unlimited custom edits", "VIP draw entry pass", "Immediate host contact"] }
];

const PRIZES = [
  { tag: "GRAND PRIZE", title: "$100,000 Cash Drop", desc: "Deposited direct to winner's nominated checking or banking institute worldwide.", tagValue: "≈ R1,800,000", bg: "bg-gradient-to-br from-[#d4af37] to-[#997a15]", text: "text-white" },
  { tag: "RUNNER-UP", title: "Luxury Super Saloon", desc: "Awarded brand-new equivalent vehicle value, delivered to your residence.", tagValue: "Value ~$50,000", bg: "bg-white", text: "text-gray-900" },
  { tag: "VIP TRIP", title: "All-Expenses VIP Tour", desc: "Flight access, five-star hotel lodging, and premier access passes to tournament matches.", tagValue: "Premium VIP Tier", bg: "bg-[#0a3d2e]", text: "text-white" }
];

const SPONSORS_ID_LIST = ['adidas', 'cocacola', 'visa', 'hyundai', 'qatarairways', 'lenovo', 'mcdonalds'];

function SafeImage({ src, alt, className, style, fallbackType, initials }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackType === 'portrait') {
      return (
        <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #111 0%, #252525 100%)', borderRadius: '10%' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#D4AF37', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>
            {initials || "FC"}
          </span>
        </div>
      );
    }
    if (fallbackType === 'crest') {
      return (
        <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid #D4AF37' }}>
          <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#FFF' }}>
            {initials || "C"}
          </span>
        </div>
      );
    }
    if (fallbackType === 'flag') {
      return (
        <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '16px', background: '#333', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: '8px', fontWeight: 'black', color: '#FFF' }}>
            {initials || "N"}
          </span>
        </div>
      );
    }
    return <div className={className} style={style} />;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={() => setError(true)} 
    />
  );
}

function SponsorSVG({ id, color }) {
  const fill = color || "#ffffff";
  switch(id) {
    case 'adidas':
      return (
        <svg viewBox="0 0 100 60" width="80" height="40" fill={fill}>
          <path d="M15 45 L25 45 L50 15 L40 15 Z" />
          <path d="M30 45 L40 45 L65 15 L55 15 Z" />
          <path d="M45 45 L55 45 L80 15 L70 15 Z" />
          <text x="47" y="55" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">adidas</text>
        </svg>
      );
    case 'cocacola':
      return (
        <svg viewBox="0 0 100 40" width="100" height="40" fill={fill}>
          <text x="50" y="28" textAnchor="middle" fontSize="24" fontWeight="bold" fontStyle="italic" fontFamily="'Brush Script MT', cursive, sans-serif" letterSpacing="-1">Coca-Cola</text>
        </svg>
      );
    case 'visa':
      return (
        <svg viewBox="0 0 100 40" width="80" height="30" fill={fill}>
          <text x="50%" y="75%" textAnchor="middle" fontSize="28" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">VISA</text>
        </svg>
      );
    case 'hyundai':
      return (
        <svg viewBox="0 0 100 50" width="80" height="35" stroke={fill} strokeWidth="3" fill="none">
          <ellipse cx="50" cy="25" rx="35" ry="18" />
          <line x1="42" y1="14" x2="42" y2="36" strokeWidth="5" />
          <line x1="58" y1="14" x2="58" y2="36" strokeWidth="5" />
          <line x1="42" y1="25" x2="58" y2="25" strokeWidth="5" />
        </svg>
      );
    case 'qatarairways':
      return (
        <svg viewBox="0 0 100 40" width="100" height="30" fill={fill}>
          <text x="50" y="22" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">QATAR</text>
          <text x="50" y="34" textAnchor="middle" fontSize="9" fontFamily="sans-serif" letterSpacing="2">AIRWAYS</text>
        </svg>
      );
    case 'lenovo':
      return (
        <svg viewBox="0 0 100 40" width="80" height="28">
          <rect width="100" height="40" fill="#E2231A" rx="4" />
          <text x="50" y="26" fill="#FFF" textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Lenovo</text>
        </svg>
      );
    case 'mcdonalds':
      return (
        <svg viewBox="0 0 100 80" width="50" height="35" fill="#FFC72C">
          <path d="M20 75 Q20 15 40 15 Q60 15 60 75 M40 75 Q40 15 60 15 Q80 15 80 75" stroke="#FFC72C" strokeWidth="10" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function FIFACard({ player, selected, onClick }) {
  const config = TIER_CONFIG[player.tier];
  
  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[0.72] rounded-[10%/7%] border-2 overflow-hidden cursor-pointer select-none group transform-gpu transition-all duration-300
        ${config.bg} ${config.border} ${selected ? '-translate-y-4 scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.3)] ring-4 ring-white' : `hover:-translate-y-2 hover:scale-[1.02] ${config.shadow}`}`}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className={`absolute inset-1 border border-black/10 rounded-[inherit] pointer-events-none z-10 ${config.text === 'text-white' ? 'border-white/20' : ''}`} />

      <div className="absolute inset-0 top-[8%] h-[50%] flex items-center justify-center overflow-visible z-20">
        <SafeImage 
          src={player.imageUrl} 
          alt={player.name}
          fallbackType="portrait"
          initials={player.short.substring(0, 2)}
          className="h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] pointer-events-none transform transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
        />
      </div>

      <div className={`absolute top-[10%] left-[10%] z-30 flex flex-col items-center ${config.text}`}>
        <span className="font-bebas text-[clamp(28px,4.5vw,45px)] leading-none font-bold tracking-tighter">
          {player.rating}
        </span>
        <span className="text-[clamp(11px,1.6vw,14px)] font-black tracking-widest mt-[-2px]">
          {player.pos}
        </span>
        <div className="mt-1">
          <SafeImage 
            src={player.flagUrl} 
            alt={player.nat} 
            fallbackType="flag" 
            initials={player.nat.substring(0,2)} 
            className="w-6 h-4 object-cover rounded-[2px] shadow-sm" 
          />
        </div>
        <div className="mt-1">
          <SafeImage 
            src={player.clubUrl} 
            alt="Club logo" 
            fallbackType="crest" 
            initials={player.short.substring(0,1)} 
            className="w-5 h-5 object-contain filter drop-shadow-sm" 
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[42%] z-20 flex flex-col items-center justify-end pb-[6%]">
        <div className={`text-center w-[90%] px-1 border-b border-black/10 pb-1 mb-1.5 ${config.text === 'text-white' ? 'border-white/20' : ''}`}>
          <h3 className={`font-bebas text-[clamp(20px,3vw,28px)] tracking-wider whitespace-nowrap overflow-hidden text-ellipsis font-bold uppercase ${config.text}`}>
            {player.short}
          </h3>
        </div>

        <div className={`grid grid-cols-6 gap-x-[2px] w-[90%] text-center px-1 ${config.text}`}>
          {[
            { stat: "PAC", val: player.pac },
            { stat: "SHO", val: player.sho },
            { stat: "PAS", val: player.pas },
            { stat: "DRI", val: player.dri },
            { stat: "DEF", val: player.def },
            { stat: "PHY", val: player.phy }
          ].map(s => (
            <div key={s.stat} className="flex flex-col items-center">
              <span className="font-bebas text-[clamp(14px,2vw,20px)] font-bold leading-none">
                {s.val}
              </span>
              <span className={`text-[clamp(8px,1vw,10px)] font-bold tracking-tighter ${config.text === 'text-white' ? 'text-white/70' : 'text-black/60'}`}>
                {s.stat}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2 text-[10px] font-black tracking-widest uppercase opacity-60">
          <span className={`${config.text}`}>{config.label}</span>
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-40">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)]">
            <svg className="w-10 h-10 text-[#0a3d2e] stroke-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({ d: "000", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const calc = () => {
      const difference = Math.max(0, new Date(target) - Date.now());
      setTimeLeft({
        d: String(Math.floor(difference / 86400000)).padStart(3, "0"),
        h: String(Math.floor((difference % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((difference % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((difference % 60000) / 1000)).padStart(2, "0"),
      });
    };
    calc();
    const intervalId = setInterval(calc, 1000);
    return () => clearInterval(intervalId);
  }, [target]);

  return timeLeft;
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState(null);
  
  const countdown = useCountdown("2026-06-11T18:00:00Z");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const selectPlayer = useCallback((name) => {
    setSelectedPlayers(prev => {
      if (prev.includes(name)) {
        showToast(`${name} removed!`, "info");
        return prev.filter(p => p !== name);
      }
      if (prev.length >= 3) {
        showToast("Max 3 players selected.", "warn");
        return prev;
      }
      showToast(`${name} locked into squad!`, "success");
      return [...prev, name];
    });
  }, [showToast]);

  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredPlayers = filter === "all" ? PLAYERS : PLAYERS.filter(p => p.cat === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;800;900&display=swap');
        
        .font-bebas { font-family: 'Bebas Neue', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        html { scroll-behavior: smooth; background-color: #041a0f; }
        
        .stadium-bg {
          background-color: #052213;
          background-image: 
            radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
            url('https://www.transparenttextures.com/patterns/diagmonds-light.png');
        }

        .stadium-light-left {
          position: fixed;
          top: -20vh;
          left: -20vw;
          width: 70vw;
          height: 70vw;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: screen;
        }

        .stadium-light-right {
          position: fixed;
          top: -10vh;
          right: -30vw;
          width: 80vw;
          height: 80vw;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: screen;
        }

        .stadium-beam {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          height: 100vh;
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
          pointer-events: none;
          z-index: 1;
        }

        .glass-panel-stadium {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.4);
        }

        .btn-white {
          background: #ffffff;
          color: #0a3d2e;
          box-shadow: 0 4px 15px rgba(255,255,255,0.3);
          transition: all 0.3s ease;
        }
        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.5);
          background: #f8f9fa;
        }

        .btn-gold {
          background: linear-gradient(to right, #d4af37, #aa8529);
          color: white;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.6);
        }

        .text-gold {
          color: #d4af37;
        }

        .floating-trophy {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}</style>

      <div className="stadium-bg text-white min-h-screen selection:bg-[#d4af37]/50 font-sans flex flex-col overflow-x-hidden relative">
        
        <div className="stadium-light-left" />
        <div className="stadium-light-right" />
        
        {/* Toast Notifications */}
        {toast && (
          <div className="fixed top-24 right-6 z-[999] max-w-sm w-full animate-bounce pointer-events-auto">
            <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-l-8 border-[#0a3d2e]">
              <div className="w-8 h-8 rounded-full bg-[#0a3d2e] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-sm font-black tracking-wide uppercase text-gray-900">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav 
          style={{
            background: scrolled ? "rgba(5, 34, 19, 0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent"
          }}
          className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300"
        >
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bebas text-2xl text-[#0a3d2e] font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
              GK
            </div>
            <span className="font-bebas text-3xl tracking-wider text-white">
              GOAL<span className="text-gold">KING</span>
              <span className="text-white/60 text-sm tracking-normal ml-2 font-sans font-black">2026</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {["How It Works", "Draft Pool", "Token Packs", "Prize Pools"].map((l, i) => (
              <button 
                key={i} 
                onClick={() => smoothScrollTo(l.toLowerCase().replace(/ /g, "-"))}
                className="text-sm uppercase tracking-widest font-bold text-white/70 hover:text-white transition-all duration-300"
              >
                {l}
              </button>
            ))}
          </div>

          <div>
            <button 
              onClick={() => smoothScrollTo("draft-pool")}
              className="btn-white text-sm uppercase tracking-widest font-black px-8 py-3 rounded-full"
            >
              Enter Draft
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative w-full min-h-[100vh] flex items-center justify-between px-6 md:px-16 pt-24 overflow-hidden z-10">
          <div className="stadium-beam" />
          
          <div className="relative z-20 max-w-2xl flex flex-col items-start gap-6 pt-10">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-black text-white uppercase tracking-widest">
              The Official 2026 Fantasy Draft Arena
            </span>
            <h1 className="font-bebas text-[clamp(60px,9vw,120px)] leading-[0.9] font-bold tracking-tight text-white uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              Draft Your <br/>
              <span className="text-gold">Dream Trio</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed font-normal max-w-xl">
              Construct your ultimate starting setup featuring the world's most elite performers. Confirm your squad to secure verified entry tokens.
            </p>

            <div className="flex gap-4 md:gap-6 items-center mt-4">
              {[
                { label: "DAYS", value: countdown.d },
                { label: "HOURS", value: countdown.h },
                { label: "MINS", value: countdown.m },
                { label: "SECS", value: countdown.s }
              ].map((u, i) => (
                <div key={i} className="text-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                    <span className="font-bebas text-2xl md:text-3xl font-bold text-gold">{u.value}</span>
                  </div>
                  <span className="text-xs font-black text-white/60 mt-1 uppercase tracking-wider">{u.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center mt-8 w-full sm:w-auto">
              <button 
                onClick={() => smoothScrollTo("draft-pool")}
                className="btn-gold w-full sm:w-auto text-center text-sm md:text-base uppercase tracking-widest font-black px-10 py-4 rounded-full"
              >
                Start Drafting Now
              </button>
              <button 
                onClick={() => smoothScrollTo("how-it-works")}
                className="w-full sm:w-auto text-center text-sm md:text-base uppercase tracking-widest font-bold text-white hover:text-gold px-6 py-4 transition-all"
              >
                View Rules
              </button>
            </div>
          </div>

          {/* Trophy */}
          <div className="absolute right-[-5%] md:right-[5%] top-[15%] bottom-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="relative w-[300px] md:w-[450px] lg:w-[500px] h-auto">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/10 blur-[120px] rounded-full" />
              <div className="w-full h-auto object-contain floating-trophy drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)]">
                <svg viewBox="0 0 100 200" className="w-full h-full">
                  <path d="M50 20 L60 50 Q60 70 50 90 Q40 70 40 50 Z" fill="#d4af37" stroke="#aa8529" strokeWidth="2"/>
                  <ellipse cx="50" cy="30" rx="15" ry="8" fill="#f4d03f"/>
                  <path d="M40 90 L35 150 Q35 170 50 180 Q65 170 65 150 L60 90 Z" fill="#d4af37" stroke="#aa8529" strokeWidth="2"/>
                  <rect x="30" y="150" width="40" height="20" fill="#8b7500" stroke="#5d5200" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsors */}
        <section className="bg-white py-8 select-none relative z-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {SPONSORS_ID_LIST.map(id => (
              <div 
                key={id}
                className="flex items-center justify-center p-2 opacity-60 hover:opacity-100 transition-all duration-300"
                style={{ width: "110px" }}
              >
                <SponsorSVG id={id} color="#052213" />
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 relative z-20">
          <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center gap-4">
            <h2 className="font-bebas text-5xl md:text-7xl font-bold uppercase tracking-tight text-white">How To Play</h2>
            <div className="w-24 h-1 bg-gold rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "I", title: "Select Elite Players", desc: "Browse our premium football roster database and pick your optimal three-player group." },
              { num: "II", title: "Acquire Verification Tokens", desc: "Choose your preferred validation pack level to seal and authenticate your custom squad." },
              { num: "III", title: "Enter Global Sweepstakes", desc: "Your squad generates official sweepstake ticket keys. Track our tournament announcements live!" }
            ].map((step, idx) => (
              <div key={idx} className="glass-panel-stadium p-10 rounded-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="relative z-10">
                  <div className="font-bebas text-6xl font-bold text-gold/30 mb-4">{step.num}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/70 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Draft Pool */}
        <section id="draft-pool" className="py-24 relative z-20 bg-black/30 backdrop-blur-sm border-y border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <h2 className="font-bebas text-5xl md:text-7xl font-bold uppercase tracking-tight text-white mb-2">Draft Pool</h2>
                <p className="text-white/70">Select 3 players for your squad</p>
              </div>

              <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-full backdrop-blur-md border border-white/10">
                {["all", "striker", "forward", "midfielder"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full font-bold uppercase text-xs tracking-widest transition-all ${
                      filter === cat
                        ? "bg-gold text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {cat === "all" ? "All Players" : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-12 max-w-6xl mx-auto">
              {filteredPlayers.map(p => (
                <FIFACard 
                  key={p.id} 
                  player={p} 
                  selected={selectedPlayers.includes(p.name)}
                  onClick={() => selectPlayer(p.name)}
                />
              ))}
            </div>

            {/* Selection Bar */}
            <div 
              style={{
                transform: selectedPlayers.length > 0 ? "translateY(0)" : "translateY(150%)",
                transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
              className="fixed bottom-6 left-6 right-6 z-[100] max-w-5xl mx-auto"
            >
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-[#0a3d2e] rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="font-bebas text-white text-xl font-bold">{selectedPlayers.length}/3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Squad Selected</h3>
                    <p className="text-sm text-gray-600">{selectedPlayers.join(", ") || "No players selected"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => smoothScrollTo("token-packs")}
                  className="btn-gold w-full md:w-auto px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest"
                >
                  Continue
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Token Packs */}
        <section id="token-packs" className="py-24 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center gap-4">
              <h2 className="font-bebas text-5xl md:text-7xl font-bold uppercase tracking-tight text-white">Validation Packs</h2>
              <div className="w-24 h-1 bg-gold rounded-full" />
              <p className="text-base text-white/70 mt-2 font-medium">Verify your team placement using official draft tokens. Better validation increases sweepstakes slots.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TOKEN_PACKS.map(pk => (
                <div
                  key={pk.id}
                  className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-md border transition-all duration-300 hover:scale-[1.02] ${
                    pk.featured
                      ? `bg-gradient-to-br ${pk.colors} border-gold shadow-[0_0_30px_rgba(212,175,55,0.3)]`
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  {pk.featured && <div className="absolute top-0 left-0 right-0 bg-gold text-black text-center py-1 font-black text-xs tracking-widest">⭐ FEATURED</div>}
                  <div className={pk.featured ? "mt-8" : ""}>
                    <span className={`text-xs font-black tracking-widest ${pk.featured ? "text-black/60" : "text-white/50"}`}>{pk.badge}</span>
                    <h3 className={`font-bebas text-2xl font-bold mt-2 ${pk.featured ? "text-black" : "text-white"}`}>{pk.name}</h3>
                    <div className="mt-4 space-y-1">
                      <p className={`text-3xl font-black ${pk.featured ? "text-black" : "text-gold"}`}>{pk.usd}</p>
                      <p className={`text-xs ${pk.featured ? "text-black/60" : "text-white/60"}`}>{pk.zar}</p>
                    </div>
                    <button className={`w-full mt-6 py-3 rounded-lg font-black uppercase text-sm tracking-widest transition-all ${
                      pk.featured
                        ? "bg-black text-gold hover:bg-black/90"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}>
                      Select Pack
                    </button>
                    <ul className={`mt-6 space-y-2 text-sm font-medium ${pk.featured ? "text-black/80" : "text-white/70"}`}>
                      {pk.perks.map((perk, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span>✓</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Prize Pools */}
        <section id="prize-pools" className="py-24 relative z-20 bg-white text-[#0a3d2e]">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center gap-4">
              <h2 className="font-bebas text-5xl md:text-7xl font-bold uppercase tracking-tight text-[#0a3d2e]">Prize Targets</h2>
              <div className="w-24 h-1 bg-[#0a3d2e] rounded-full" />
              <p className="text-base text-gray-600 mt-2 font-medium">Win amazing rewards by selecting the perfect squad</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PRIZES.map((prize, idx) => (
                <div key={idx} className={`rounded-2xl p-8 ${prize.bg}`}>
                  <span className="text-xs font-black tracking-widest opacity-70">{prize.tag}</span>
                  <h3 className={`font-bebas text-3xl font-bold mt-3 ${prize.text}`}>{prize.title}</h3>
                  <p className={`mt-3 leading-relaxed ${prize.text === "text-white" ? "text-white/80" : "text-gray-700"}`}>{prize.desc}</p>
                  <div className={`mt-6 pt-6 border-t ${prize.text === "text-white" ? "border-white/20" : "border-gray-300"}`}>
                    <span className={`font-black text-sm tracking-widest ${prize.text}`}>{prize.tagValue}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#03140b] py-16 text-white/60 relative z-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center font-bebas text-lg text-[#0a3d2e] font-extrabold">GK</div>
                <div>
                  <div className="font-bebas text-lg text-white">GOALKING 2026</div>
                  <p className="text-xs text-white/50">Fantasy Football Arena</p>
                </div>
              </div>
              <p className="text-sm max-w-sm">The ultimate fantasy draft experience for the 2026 FIFA World Cup</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <a href="#" className="text-white hover:text-gold transition-colors">Privacy</a>
              <a href="#" className="text-white hover:text-gold transition-colors">Terms</a>
              <a href="#" className="text-white hover:text-gold transition-colors">Contact</a>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FaTwitter className="text-white" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FaInstagram className="text-white" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FaDiscord className="text-white" /></a>
              </div>
            </div>

          </div>

          <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-white/40 gap-4 uppercase tracking-widest">
            <span>© 2026 GoalKing Fantasy Sweepstake Network. All rights reserved.</span>
            <span>Made for football fans worldwide.</span>
          </div>
        </footer>

      </div>
    </>
  );
}