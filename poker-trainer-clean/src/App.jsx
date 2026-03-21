import { useState } from "react";

// ─── THEMES ──────────────────────────────────────────────────────────────────
const DARK_THEME = {
  bg:"#0C0C10", surface:"#141418", surface2:"#1a1a20",
  border:"rgba(255,255,255,0.07)", borderMid:"rgba(255,255,255,0.12)",
  text:"#EAE6DE", muted:"#6B6560", faint:"#3a3830",
  orange:"#FF914D", font:"-apple-system,'SF Pro Display','Segoe UI',sans-serif",
  tipBg:"#1e1a14", inputBg:"#0C0C10", scoreBg:"rgba(255,255,255,0.06)",
};
const LIGHT_THEME = {
  bg:"#F2EDE4", surface:"#FDFAF4", surface2:"#EAE4D8",
  border:"rgba(0,0,0,0.09)", borderMid:"rgba(0,0,0,0.16)",
  text:"#1A1410", muted:"#7A7068", faint:"#DDD8CE",
  orange:"#D06820", font:"-apple-system,'SF Pro Display','Segoe UI',sans-serif",
  tipBg:"#231c10", inputBg:"#EDE8DC", scoreBg:"rgba(0,0,0,0.06)",
};
let G = DARK_THEME;

// ─── XP / RANKS ───────────────────────────────────────────────────────────────
const RANKS = [
  {name:"Novato",     minXP:0,     icon:"🂠", color:"#94a3b8"},
  {name:"Amateur",    minXP:500,   icon:"♣",  color:"#4ade80"},
  {name:"Regular",    minXP:1500,  icon:"♦",  color:"#60a5fa"},
  {name:"Competidor", minXP:3500,  icon:"♥",  color:"#f472b6"},
  {name:"Avanzado",   minXP:7000,  icon:"♠",  color:"#facc15"},
  {name:"Shark",      minXP:13000, icon:"🃏", color:"#fb923c"},
  {name:"Pro",        minXP:25000, icon:"👑", color:"#e879f9"},
];
const getRank = xp => { for(let i=RANKS.length-1;i>=0;i--) if(xp>=RANKS[i].minXP) return {...RANKS[i],index:i}; return {...RANKS[0],index:0}; };
const xpProgress = xp => {
  const r=getRank(xp), next=RANKS[r.index+1];
  if(!next) return {pct:100,current:xp-r.minXP,needed:0,rank:r};
  const cur=xp-r.minXP, need=next.minXP-r.minXP;
  return {pct:Math.min(100,Math.round(cur/need*100)),current:cur,needed:need,rank:r};
};
const xpForScore = (score,streak) => (score>=80?120:score>=60?80:score>=40?50:20)+(streak>=3?30:0);

  { term:"Pot Odds",         def:"Relación entre lo que cuesta el call y el tamaño del pot." },
  { term:"Check-Raise",      def:"Primero pasas, y cuando el oponente apuesta, subes. Una trampa." },
  { term:"All-In",           def:"Apostar todas tus fichas disponibles en una sola mano." },
  { term:"Flush Draw",       def:"4 cartas del mismo palo — necesitas una más para completar el color." },
  { term:"Open-Ender",       def:"Proyecto de escalera que puede completarse por ambos extremos. 8 outs." },
  { term:"Outs",             def:"Las cartas que quedan en el mazo que pueden mejorar tu mano." },
  { term:"GTO",              def:"Game Theory Optimal — estrategia equilibrada y difícil de explotar." },
  { term:"Equity",           def:"Tu probabilidad de ganar la mano en ese momento." },
  { term:"Showdown",         def:"Al final todos muestran sus cartas y el mejor juego gana el pot." },
  { term:"Continuation Bet", def:"Apostar en el flop después de haber subido antes del flop." },
  { term:"Steal",            def:"Subir desde posición tardía intentando robar los ciegos." },
];

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────
function Card({ card, hidden = false, sm = false }) {
  const W = sm ? 36 : 46, H = sm ? 52 : 66;
  if (hidden) return (
    <div style={{ width:W, height:H, borderRadius:6, background:"linear-gradient(145deg,#1c1c2e,#12122a)", border:"1px solid #2a2a44", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>
      <div style={{ width:W*0.55, height:H*0.6, borderRadius:3, background:"repeating-linear-gradient(45deg,#1e1e35,#1e1e35 3px,#252540 3px,#252540 6px)", opacity:0.8 }} />
    </div>
  );
  if (!card) return <div style={{ width:W, height:H, borderRadius:6, border:"1px dashed rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)", flexShrink:0 }} />;
  const rank = card.slice(0,-1), suit = card.slice(-1), col = SUIT_COL[suit]||"#111";
  return (
    <div style={{ width:W, height:H, borderRadius:6, background:"linear-gradient(160deg,#faf6ee,#ede8de)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", userSelect:"none", fontFamily:"Georgia,serif", boxShadow:"0 3px 12px rgba(0,0,0,0.55)", flexShrink:0 }}>
      <div style={{ position:"absolute", top:2, left:4, color:col, fontSize:sm?8:10, fontWeight:900, lineHeight:1.15, textAlign:"center" }}>{rank}<br/>{SUIT_SYM[suit]}</div>
      <div style={{ color:col, fontSize:sm?16:20, lineHeight:1 }}>{SUIT_SYM[suit]}</div>
      <div style={{ position:"absolute", bottom:2, right:4, color:col, fontSize:sm?8:10, fontWeight:900, lineHeight:1.15, textAlign:"center", transform:"rotate(180deg)" }}>{rank}<br/>{SUIT_SYM[suit]}</div>
    </div>
  );
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tip({ word, children }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY.find(g => g.term.toLowerCase() === word.toLowerCase());
  if (!entry) return <span>{children||word}</span>;
  return (
    <span style={{ position:"relative", display:"inline" }}>
      <span onClick={()=>setOpen(o=>!o)} style={{ color:G.orange, borderBottom:`1px dashed ${G.orange}88`, cursor:"pointer", fontWeight:600 }}>{children||word}</span>
      {open && <span onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98 }} />}
      {open && <span style={{ position:"absolute", bottom:"130%", left:"50%", transform:"translateX(-50%)", background:"#1e1a14", border:`1px solid ${G.orange}55`, borderRadius:10, padding:"10px 14px", width:210, zIndex:99, fontSize:12, color:"#c8c0b0", lineHeight:1.6, boxShadow:"0 10px 30px rgba(0,0,0,0.8)", whiteSpace:"normal", display:"block" }}>
        <strong style={{ color:G.orange }}>{entry.term}:</strong> {entry.def}
      </span>}
    </span>
  );
}

// ─── DIFF BADGE ───────────────────────────────────────────────────────────────
function DiffBadge({ mode, small=false }) {
  const c = DC[mode] || DC.intermediate;
  const dots = mode==="beginner"?1 : mode==="intermediate"?2 : mode==="advanced"?3 : null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:c.bg, border:`1px solid ${c.border}`, borderRadius:20, padding:small?"3px 8px":"4px 10px", flexShrink:0 }}>
      {dots ? <>
        <span style={{ display:"flex", gap:2 }}>
          {[0,1,2].map(i=><span key={i} style={{ width:small?4:5, height:small?4:5, borderRadius:"50%", background:i<dots?c.text:`${c.text}20`, display:"block" }}/>)}
        </span>
        <span style={{ color:c.text, fontSize:small?9:10, fontWeight:700, letterSpacing:0.3 }}>{c.label.toUpperCase()}</span>
      </> : <span style={{ color:c.text, fontSize:small?9:10, fontWeight:700, letterSpacing:0.5 }}>{c.label.toUpperCase()}</span>}
    </span>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size=64 }) {
  const r = (size-8)/2, circ = 2*Math.PI*r;
  const col = score>=80?"#4ade80":score>=60?"#facc15":"#fb923c";
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} style={{ transition:"stroke-dashoffset 0.8s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fill:col, fontSize:size*0.28, fontWeight:800, fontFamily:G.font, transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px` }}>{score}</text>
    </svg>
  );
}

// ─── 75 CURATED SCENARIOS ────────────────────────────────────────────────────
const GLOSSARY = [
  { term:"Hole Cards",       def:"Tus dos cartas privadas que solo tú puedes ver." },
  { term:"Board",            def:"Las cartas comunitarias en el centro que todos pueden usar." },
  { term:"Flop",             def:"Las primeras 3 cartas comunitarias que se revelan." },
  { term:"Turn",             def:"La 4ª carta comunitaria." },
  { term:"River",            def:"La 5ª y última carta comunitaria." },
  { term:"Pot",              def:"El total de fichas apostadas. El ganador se lo lleva todo." },
  { term:"Stack",            def:"Tus fichas disponibles para apostar en esta mano." },
  { term:"BTN",              def:"Button — la mejor posición. Actúas de último." },
  { term:"SB",               def:"Small Blind — apuesta forzada pequeña. Actúas primero." },
  { term:"BB",               def:"Big Blind — apuesta forzada doble del SB." },
  { term:"UTG",              def:"Under The Gun — el primero en actuar preflop." },
  { term:"CO",               def:"Cutoff — posición justo antes del Button." },
  { term:"Check",            def:"Pasar sin apostar. Solo si nadie apostó antes." },
  { term:"Call",             def:"Igualar la apuesta del oponente para seguir." },
  { term:"Raise",            def:"Subir la apuesta. El oponente debe pagar más o retirarse." },
  { term:"Fold",             def:"Retirarse. Pierdes lo apostado pero no arriesgas más." },
  { term:"Bluff",            def:"Apostar con mano mala esperando que el oponente se retire." },
  { term:"Value Bet",        def:"Apostar con mano fuerte para que el oponente pague." },
  { term:"Pot Odds",         def:"Relación entre lo que cuesta el call y el tamaño del pot." },
  { term:"Check-Raise",      def:"Primero pasas, y cuando el oponente apuesta, subes. Una trampa." },
  { term:"All-In",           def:"Apostar todas tus fichas disponibles en una sola mano." },
  { term:"Flush Draw",       def:"4 cartas del mismo palo — necesitas una más para completar el color." },
  { term:"Open-Ender",       def:"Proyecto de escalera que puede completarse por ambos extremos. 8 outs." },
  { term:"Outs",             def:"Las cartas que quedan en el mazo que pueden mejorar tu mano." },
  { term:"GTO",              def:"Game Theory Optimal — estrategia equilibrada y difícil de explotar." },
  { term:"Equity",           def:"Tu probabilidad de ganar la mano en ese momento." },
  { term:"Showdown",         def:"Al final todos muestran sus cartas y el mejor juego gana el pot." },
  { term:"Continuation Bet", def:"Apostar en el flop después de haber subido antes del flop." },
  { term:"Steal",            def:"Subir desde posición tardía intentando robar los ciegos." },
];

// ─── AUTO GLOSSARY PARSER ─────────────────────────────────────────────────────
const GLOSSARY_TERMS = GLOSSARY.map(g => g.term);
const TERM_REGEX = new RegExp(
  `\\b(${[...GLOSSARY_TERMS].sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\b`,
  'gi'
);
function GlossaryWord({ word }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY.find(g => g.term.toLowerCase() === word.toLowerCase());
  if (!entry) return <span>{word}</span>;
  return (
    <span style={{ position:"relative", display:"inline" }}>
      <span onClick={()=>setOpen(o=>!o)} style={{ color:G.orange, borderBottom:`1.5px dotted ${G.orange}`, cursor:"pointer", fontWeight:600 }}>{word}</span>
      {open && <span onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:198 }} />}
      {open && (
        <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:G.tipBg||"#1e1a14", border:`1px solid ${G.orange}55`, borderRadius:14, padding:"18px 20px", width:280, zIndex:199, boxShadow:"0 20px 60px rgba(0,0,0,0.85)", fontFamily:G.font }}>
          <div style={{ color:G.orange, fontWeight:800, fontSize:15, marginBottom:8 }}>{entry.term}</div>
          <div style={{ color:"#c8c0b0", fontSize:14, lineHeight:1.7 }}>{entry.def}</div>
          <div style={{ marginTop:10, textAlign:"center", color:"#6b6560", fontSize:11 }}>Tap fuera para cerrar</div>
        </div>
      )}
    </span>
  );
}
function ParsedText({ text, style }) {
  if (!text) return null;
  const parts = text.split(TERM_REGEX);
  return (
    <span style={style}>
      {parts.map((p,i) =>
        GLOSSARY_TERMS.some(t => t.toLowerCase() === p.toLowerCase())
          ? <GlossaryWord key={i} word={p} />
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}
function Tip({ word, children }) { return <GlossaryWord word={word||children} />; }

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────
function Card({ card, hidden = false, sm = false }) {
  const W = sm ? 36 : 46, H = sm ? 52 : 66;
  if (hidden) return (
    <div style={{ width:W, height:H, borderRadius:6, background:"linear-gradient(145deg,#1c1c2e,#12122a)", border:"1px solid #2a2a44", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>
      <div style={{ width:W*0.55, height:H*0.6, borderRadius:3, background:"repeating-linear-gradient(45deg,#1e1e35,#1e1e35 3px,#252540 3px,#252540 6px)", opacity:0.8 }} />
    </div>
  );
  if (!card) return <div style={{ width:W, height:H, borderRadius:6, border:"1px dashed rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)", flexShrink:0 }} />;
  const rank = card.slice(0,-1), suit = card.slice(-1), col = SUIT_COL[suit]||"#111";
  return (
    <div style={{ width:W, height:H, borderRadius:6, background:"linear-gradient(160deg,#faf6ee,#ede8de)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", userSelect:"none", fontFamily:"Georgia,serif", boxShadow:"0 3px 12px rgba(0,0,0,0.55)", flexShrink:0 }}>
      <div style={{ position:"absolute", top:2, left:4, color:col, fontSize:sm?8:10, fontWeight:900, lineHeight:1.15, textAlign:"center" }}>{rank}<br/>{SUIT_SYM[suit]}</div>
      <div style={{ color:col, fontSize:sm?16:20, lineHeight:1 }}>{SUIT_SYM[suit]}</div>
      <div style={{ position:"absolute", bottom:2, right:4, color:col, fontSize:sm?8:10, fontWeight:900, lineHeight:1.15, textAlign:"center", transform:"rotate(180deg)" }}>{rank}<br/>{SUIT_SYM[suit]}</div>
    </div>
  );
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tip({ word, children }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY.find(g => g.term.toLowerCase() === word.toLowerCase());
  if (!entry) return <span>{children||word}</span>;
  return (
    <span style={{ position:"relative", display:"inline" }}>
      <span onClick={()=>setOpen(o=>!o)} style={{ color:G.orange, borderBottom:`1px dashed ${G.orange}88`, cursor:"pointer", fontWeight:600 }}>{children||word}</span>
      {open && <span onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98 }} />}
      {open && <span style={{ position:"absolute", bottom:"130%", left:"50%", transform:"translateX(-50%)", background:"#1e1a14", border:`1px solid ${G.orange}55`, borderRadius:10, padding:"10px 14px", width:210, zIndex:99, fontSize:12, color:"#c8c0b0", lineHeight:1.6, boxShadow:"0 10px 30px rgba(0,0,0,0.8)", whiteSpace:"normal", display:"block" }}>
        <strong style={{ color:G.orange }}>{entry.term}:</strong> {entry.def}
      </span>}
    </span>
  );
}

// ─── DIFF BADGE ───────────────────────────────────────────────────────────────
function DiffBadge({ mode, small=false }) {
  const c = DC[mode] || DC.intermediate;
  const dots = mode==="beginner"?1 : mode==="intermediate"?2 : mode==="advanced"?3 : null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:c.bg, border:`1px solid ${c.border}`, borderRadius:20, padding:small?"3px 8px":"4px 10px", flexShrink:0 }}>
      {dots ? <>
        <span style={{ display:"flex", gap:2 }}>
          {[0,1,2].map(i=><span key={i} style={{ width:small?4:5, height:small?4:5, borderRadius:"50%", background:i<dots?c.text:`${c.text}20`, display:"block" }}/>)}
        </span>
        <span style={{ color:c.text, fontSize:small?9:10, fontWeight:700, letterSpacing:0.3 }}>{c.label.toUpperCase()}</span>
      </> : <span style={{ color:c.text, fontSize:small?9:10, fontWeight:700, letterSpacing:0.5 }}>{c.label.toUpperCase()}</span>}
    </span>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size=64 }) {
  const r = (size-8)/2, circ = 2*Math.PI*r;
  const col = score>=80?"#4ade80":score>=60?"#facc15":"#fb923c";
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} style={{ transition:"stroke-dashoffset 0.8s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fill:col, fontSize:size*0.28, fontWeight:800, fontFamily:G.font, transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px` }}>{score}</text>
    </svg>
  );
}

// ─── 75 CURATED SCENARIOS ────────────────────────────────────────────────────

// ─── XP BAR ──────────────────────────────────────────────────────────────────
function XPBar({ xp, showLabel=true }) {
  const {pct, current, needed, rank} = xpProgress(xp);
  return (
    <div style={{ width:"100%" }}>
      {showLabel && (
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ color:rank.color, fontSize:11, fontWeight:700 }}>{rank.icon} {rank.name}</span>
          <span style={{ color:G.muted, fontSize:11 }}>{current} / {needed||"MAX"} XP</span>
        </div>
      )}
      <div style={{ height:6, background:G.border, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:rank.color, borderRadius:3, transition:"width 1s ease" }}/>
      </div>
    </div>
  );
}

const ALL_CURATED = [
  // BEGINNER 25
  {id:"b1",mode:"beginner",cat:"value",title:"Tu primer Top Pair",holeCards:["Ah","Kd"],board:["Ks","7c","2h"],street:"flop",position:"BTN",pot:180,stack:820,villainAction:"Pasó sin apostar",context:"Tienes pareja de Reyes con As — la mejor mano posible aquí. El oponente pasó y tú tienes la mejor posición. Board tranquilo.",actions:[{id:"ck",label:"Pasar (Check)",desc:"Ves la siguiente carta gratis",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$60 — apuesta pequeña de valor",icon:"💰",amount:60},{id:"m",label:"Apostar 66%",desc:"$120 — apuesta estándar y sólida",icon:"💰💰",amount:120},{id:"b",label:"Apostar pot",desc:"$180 — apuesta agresiva",icon:"🔥",amount:180}]},
  {id:"b2",mode:"beginner",cat:"preflop",title:"Ases — La mejor mano",holeCards:["Ah","As"],board:[],street:"preflop",position:"UTG",pot:15,stack:985,villainAction:"Nadie ha actuado aún",context:"Tienes la mejor mano posible: pareja de Ases. Eres el primero en actuar con 6 jugadores más. ¿Cuánto subes?",actions:[{id:"limp",label:"Entrar callado",desc:"$10 — aparentas debilidad para atrapar",icon:"🤫",amount:10},{id:"s",label:"Subir a $25",desc:"Subida pequeña, invitas a más rivales",icon:"📈",amount:25},{id:"m",label:"Subir a $35",desc:"Subida estándar (3.5x el ciego)",icon:"💰",amount:35},{id:"b",label:"Subir a $60",desc:"Subida grande para aislar",icon:"🔥",amount:60}]},
  {id:"b3",mode:"beginner",cat:"preflop",title:"Reinas vs un raise",holeCards:["Qh","Qs"],board:[],street:"preflop",position:"CO",pot:35,stack:965,villainAction:"Abrió apostando $30",context:"Tienes pareja de Reinas — excelente mano. Un jugador ya subió a $30. ¿Pagas, te vas, o subes?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras las Reinas — muy conservador",icon:"🗑️"},{id:"call",label:"Igualar $30",desc:"Pagas sin subir para ver el flop",icon:"📞",amount:30},{id:"r85",label:"Subir a $85",desc:"Re-subes mostrando fuerza",icon:"⬆️",amount:85},{id:"r110",label:"Subir a $110",desc:"Subida más grande",icon:"🚀",amount:110}]},
  {id:"b4",mode:"beginner",cat:"bluff",title:"Mano basura en Button",holeCards:["7c","2d"],board:[],street:"preflop",position:"BTN",pot:15,stack:985,villainAction:"Todos pasaron hasta ti",context:"Tienes la peor mano posible: 7-2. PERO eres el último y todos pasaron. ¿Intentas robar los ciegos?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras la mano mala",icon:"🗑️"},{id:"limp",label:"Entrar barato",desc:"$10 — entras sin subir",icon:"😐",amount:10},{id:"steal",label:"Subir a $30",desc:"Intentas robar los ciegos con posición",icon:"🎯",amount:30}]},
  {id:"b5",mode:"beginner",cat:"value",title:"Trío en el Flop",holeCards:["Jd","Jh"],board:["Jc","5h","2d"],street:"flop",position:"BTN",pot:120,stack:880,villainAction:"Pasó sin apostar",context:"Tienes trío de Jotas — mano muy fuerte. Board tranquilo. El oponente pasó. ¿Apuestas o finges debilidad?",actions:[{id:"ck",label:"Fingir debilidad",desc:"Pasas para atrapar al oponente después",icon:"🐢"},{id:"s",label:"Apostar 33%",desc:"$40 — apuesta pequeña de valor",icon:"💰",amount:40},{id:"m",label:"Apostar 66%",desc:"$80 — apuesta estándar",icon:"💰💰",amount:80},{id:"b",label:"Apostar pot",desc:"$120 — maximizas valor ahora",icon:"🔥",amount:120}]},
  {id:"b6",mode:"beginner",cat:"preflop",title:"¿Defiendes el Big Blind?",holeCards:["Kd","7h"],board:[],street:"preflop",position:"BB",pot:50,stack:990,villainAction:"Subió a $30 desde el Button",context:"Ya pagaste $10 de ciego. El Button subió a $30. Tienes K-7. Si igualas solo pagas $20 más. ¿Vale la pena?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Pierdes tus $10 de ciego",icon:"🗑️"},{id:"call",label:"Igualar ($20 más)",desc:"Pagas $20 adicionales para ver el flop",icon:"📞",amount:20},{id:"3bet",label:"Re-subir a $90",desc:"Contraatacas con K-7",icon:"🚀",amount:90}]},
  {id:"b7",mode:"beginner",cat:"value",title:"Full House — ¿cuánto cobras?",holeCards:["Ac","As"],board:["Ad","7h","7d"],street:"flop",position:"EP",pot:200,stack:800,villainAction:"Pasó sin apostar",context:"Tienes full house de Ases — una de las mejores manos. El oponente pasó. ¿Lo atrapas o cobras directo?",actions:[{id:"ck",label:"Fingir debilidad",desc:"Pasas para atrapar al oponente",icon:"🐢"},{id:"s",label:"Apostar 33%",desc:"$66 — apuesta de invitación",icon:"💰",amount:66},{id:"m",label:"Apostar 66%",desc:"$132 — apuesta estándar",icon:"💰💰",amount:132},{id:"b",label:"Apostar pot",desc:"$200 — cobras máximo ahora",icon:"🔥",amount:200}]},
  {id:"b8",mode:"beginner",cat:"bluff",title:"A-K sin conectar",holeCards:["Ac","Kh"],board:["9d","5c","2s"],street:"flop",position:"BTN",pot:160,stack:840,villainAction:"Pasó sin apostar",context:"Tienes A-K pero el flop no te ayudó. El oponente pasó. ¿Apuestas de todas formas o esperas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Ves la siguiente carta gratis",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$53 — apuesta para tomar control",icon:"💰",amount:53},{id:"m",label:"Apostar 66%",desc:"$106 — apuesta de continuación",icon:"💰💰",amount:106}]},
  {id:"b9",mode:"beginner",cat:"value",title:"Escalera completa",holeCards:["Th","9h"],board:["8d","7c","6s","2h","Jd"],street:"river",position:"CO",pot:350,stack:650,villainAction:"Apostó $120",context:"Tienes una escalera completa (6-7-8-9-10). El oponente apostó $120. ¿Solo pagas o subes?",actions:[{id:"call",label:"Igualar $120",desc:"Pagas y ganas con tu escalera",icon:"📞",amount:120},{id:"raise",label:"Subir a $300",desc:"Subes para sacar más valor",icon:"⬆️",amount:300},{id:"shove",label:"Ir con todo",desc:"$650 — apuestas todo",icon:"💥",amount:650}]},
  {id:"b10",mode:"beginner",cat:"value",title:"Color completo",holeCards:["Kh","8h"],board:["Ah","5h","Jc","2h","7d"],street:"river",position:"SB",pot:280,stack:720,villainAction:"Pasó sin apostar",context:"Tienes color de corazones — mano muy fuerte. El oponente checkeó. ¿Cuánto cobras?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No cobras nada",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$92 — apuesta pequeña",icon:"💰",amount:92},{id:"m",label:"Apostar 66%",desc:"$185 — apuesta fuerte",icon:"💰💰",amount:185},{id:"b",label:"Apostar pot",desc:"$280 — cobras al máximo",icon:"🔥",amount:280}]},
  {id:"b11",mode:"beginner",cat:"value",title:"Top Pair vs apuesta",holeCards:["Ad","Qc"],board:["Ah","9c","3s"],street:"flop",position:"CO",pot:200,stack:800,villainAction:"Apostó $80",context:"Tienes pareja de Ases con Reina — mano sólida. El oponente apostó $80. Board tranquilo. ¿Qué haces?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras top pair — probablemente error",icon:"🗑️"},{id:"call",label:"Igualar $80",desc:"Pagas para ver la siguiente carta",icon:"📞",amount:80},{id:"raise",label:"Subir a $220",desc:"Subes con tu pareja de Ases",icon:"⬆️",amount:220}]},
  {id:"b12",mode:"beginner",cat:"value",title:"Doble pareja en Turn",holeCards:["Kh","Jd"],board:["Ks","Jc","4h","8d"],street:"turn",position:"BTN",pot:260,stack:740,villainAction:"Pasó sin apostar",context:"Tienes dos parejas: Reyes y Jotas. Sin amenazas. El oponente pasó. ¿Cómo cobras?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Intentas atrapar al oponente en river",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$86 — apuesta pequeña de valor",icon:"💰",amount:86},{id:"m",label:"Apostar 66%",desc:"$172 — apuesta fuerte",icon:"💰💰",amount:172},{id:"b",label:"Apostar pot",desc:"$260 — presión máxima",icon:"🔥",amount:260}]},
  {id:"b13",mode:"beginner",cat:"value",title:"Trío vs apuesta",holeCards:["9h","9d"],board:["Kc","9s","3h"],street:"flop",position:"SB",pot:180,stack:820,villainAction:"Apostó $90",context:"Tienes trío de Nueves. El Rey puede dar miedo pero tu mano es fortísima. El oponente apostó $90. ¿Pagas o subes?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras un trío — definitivamente error",icon:"🗑️"},{id:"call",label:"Igualar $90",desc:"Pagas para ver la siguiente carta",icon:"📞",amount:90},{id:"raise",label:"Subir a $250",desc:"Subes con tu trío para sacar valor",icon:"⬆️",amount:250}]},
  {id:"b14",mode:"beginner",cat:"value",title:"Color en River vs apuesta",holeCards:["Qd","Jd"],board:["Ad","Kd","5h","9c","Td"],street:"river",position:"BTN",pot:400,stack:600,villainAction:"Apostó $150",context:"Completaste color de diamantes. El oponente apostó $150. Mano muy fuerte. ¿Solo pagas o subes?",actions:[{id:"call",label:"Igualar $150",desc:"Pagas y ganas con tu color",icon:"📞",amount:150},{id:"raise",label:"Subir a $380",desc:"Subes para sacar más valor",icon:"⬆️",amount:380},{id:"shove",label:"Ir con todo",desc:"$600 — todo in con mano fortísima",icon:"💥",amount:600}]},
  {id:"b15",mode:"beginner",cat:"preflop",title:"Dieces desde CO",holeCards:["Th","Tc"],board:[],street:"preflop",position:"CO",pot:15,stack:985,villainAction:"Todos pasaron antes",context:"Tienes pareja de Dieces. Todos pasaron hasta ti. Quedan Button, SB y BB. ¿Abres?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras mano decente — muy pasivo",icon:"🗑️"},{id:"limp",label:"Entrar barato",desc:"$10 — entras sin subir",icon:"😐",amount:10},{id:"raise",label:"Subir a $30",desc:"Subida estándar",icon:"⬆️",amount:30},{id:"raise_b",label:"Subir a $45",desc:"Subida más grande para aislar",icon:"🔥",amount:45}]},
  {id:"b16",mode:"beginner",cat:"bluff",title:"Trío en Board — sin pareja",holeCards:["Ah","Kc"],board:["Qd","Qh","Qs"],street:"flop",position:"BTN",pot:150,stack:850,villainAction:"Pasó sin apostar",context:"El board tiene trío de Damas. Tú tienes A-K sin pareja. Cualquier jugador con Dama tiene cuatro de un tipo. ¿Apuestas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No arriesgas fichas en board peligroso",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$50 — bluff pequeño para tomar control",icon:"🎭",amount:50},{id:"m",label:"Apostar 66%",desc:"$100 — bluff más fuerte",icon:"💰",amount:100}]},
  {id:"b17",mode:"beginner",cat:"draw",title:"Proyecto de color K alto",holeCards:["Kh","3h"],board:["Ah","7h","Jd"],street:"flop",position:"SB",pot:200,stack:800,villainAction:"Pasó sin apostar",context:"Tienes 4 corazones — si sale otro corazón completas color con Rey. El As en el board haría tu color el más alto. El oponente pasó.",actions:[{id:"ck",label:"Pasar (Check)",desc:"Ves la siguiente carta gratis",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$66 — apuesta pequeña con tu proyecto",icon:"💰",amount:66},{id:"m",label:"Apostar 66%",desc:"$132 — sembluff (proyecto + presión)",icon:"💰💰",amount:132}]},
  {id:"b18",mode:"beginner",cat:"value",title:"Escalera vs apuesta",holeCards:["5h","4d"],board:["8c","6d","7h","9s","2c"],street:"river",position:"CO",pot:320,stack:680,villainAction:"Apostó $100",context:"Tienes escalera completa (4-5-6-7-8). El oponente apostó $100. Mano difícil de perder. ¿Pagas o subes?",actions:[{id:"call",label:"Igualar $100",desc:"Pagas y ganas con tu escalera",icon:"📞",amount:100},{id:"raise",label:"Subir a $280",desc:"Subes para sacar más fichas",icon:"⬆️",amount:280},{id:"shove",label:"Ir con todo",desc:"$680 — todo in",icon:"💥",amount:680}]},
  {id:"b19",mode:"beginner",cat:"preflop",title:"¿Abres con A-J?",holeCards:["Ah","Jc"],board:[],street:"preflop",position:"MP",pot:15,stack:985,villainAction:"Todos pasaron",context:"Tienes A-J. Todos pasaron hasta ti. Quedan CO, BTN y ciegos. ¿Subes?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras A-J — muy conservador",icon:"🗑️"},{id:"limp",label:"Entrar barato",desc:"$10 — entras sin subir",icon:"😐",amount:10},{id:"raise",label:"Subir a $30",desc:"Subida estándar con mano fuerte",icon:"⬆️",amount:30},{id:"raise_b",label:"Subir a $40",desc:"Subida más agresiva",icon:"🔥",amount:40}]},
  {id:"b20",mode:"beginner",cat:"value",title:"Reyes en Board seguro",holeCards:["Kd","Kc"],board:["Th","7d","2c"],street:"flop",position:"BTN",pot:220,stack:780,villainAction:"Pasó sin apostar",context:"Tienes pareja de Reyes y el board no amenaza. El oponente pasó. ¿Cómo cobras?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Intentas atrapar al oponente",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$73 — apuesta pequeña de valor",icon:"💰",amount:73},{id:"m",label:"Apostar 66%",desc:"$145 — apuesta estándar",icon:"💰💰",amount:145},{id:"b",label:"Apostar pot",desc:"$220 — cobras máximo",icon:"🔥",amount:220}]},
  {id:"b21",mode:"beginner",cat:"preflop",title:"¿Llamas All-In con A-K?",holeCards:["Ah","Kd"],board:[],street:"preflop",position:"BB",pot:100,stack:900,villainAction:"Fue All-In con $350",context:"Tienes A-K. El oponente fue all-in con $350. A-K pierde contra parejas altas pero gana contra muchas otras manos. ¿Pagas?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras A-K",icon:"🗑️"},{id:"call",label:"Igualar All-In ($350)",desc:"Arriesgas $350 con mano fortísima",icon:"💥",amount:350}]},
  {id:"b22",mode:"beginner",cat:"bluff",title:"Bluff pequeño en River",holeCards:["6c","5c"],board:["Ah","Kd","Jh","9s","2d"],street:"river",position:"BTN",pot:180,stack:820,villainAction:"Pasó sin apostar",context:"Tus cartas no conectaron — tienes 6 alta. El oponente pasó. ¿Intentas un bluff pequeño?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No bluffeas, probablemente pierdes",icon:"✋"},{id:"s",label:"Bluff $60",desc:"Pequeño bluff — bajo riesgo",icon:"🎭",amount:60},{id:"m",label:"Bluff $120",desc:"Bluff más grande, más presión",icon:"🎭🎭",amount:120}]},
  {id:"b23",mode:"beginner",cat:"draw",title:"Proyecto de escalera abierta",holeCards:["Jh","Td"],board:["9s","8c","2h"],street:"flop",position:"CO",pot:200,stack:800,villainAction:"Apostó $80",context:"Tienes J-10 con proyecto de escalera abierta — necesitas 7 o Dama (8 posibilidades). El oponente apostó $80.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras tu proyecto",icon:"🗑️"},{id:"call",label:"Igualar $80",desc:"Pagas para ver si llega tu carta",icon:"📞",amount:80},{id:"raise",label:"Subir a $220",desc:"Subes con tu proyecto para generar presión",icon:"⬆️",amount:220}]},
  {id:"b24",mode:"beginner",cat:"value",title:"Color vs apuesta fuerte",holeCards:["Th","8h"],board:["Ah","5h","Jh","2c","Kd"],street:"river",position:"SB",pot:450,stack:550,villainAction:"Apostó $200",context:"Tienes color de corazones. El oponente apostó $200. Solo pierdes contra color más alto. ¿Subes?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras un color — definitivamente error",icon:"🗑️"},{id:"call",label:"Igualar $200",desc:"Pagas y ganas con tu color",icon:"📞",amount:200},{id:"raise",label:"Subir a $450",desc:"Subes para sacar más fichas",icon:"⬆️",amount:450}]},
  {id:"b25",mode:"beginner",cat:"position",title:"Pareja alta, Board peligroso",holeCards:["Ah","Qd"],board:["Ac","Jh","Tc"],street:"flop",position:"BTN",pot:240,stack:760,villainAction:"Pasó sin apostar",context:"Tienes pareja de Ases, pero el board tiene J y T conectados — alguien con K-Q ya tiene escalera. ¿Apuestas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No arriesgas, el board es peligroso",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$79 — apuesta pequeña para sondar",icon:"💰",amount:79},{id:"m",label:"Apostar 66%",desc:"$158 — apuesta más fuerte",icon:"💰💰",amount:158}]},
  // INTERMEDIATE 25
  {id:"i1",mode:"intermediate",cat:"bluff",title:"Bluff grande en River",holeCards:["5h","4h"],board:["Ah","Kc","8d","3s","Jc"],street:"river",position:"SB",pot:420,stack:580,villainAction:"Pasó sin apostar",context:"Tus cartas no conectaron — tienes 5 alta. El proyecto de color no llegó. El oponente checkeó. ¿Bluffeas o aceptas la derrota?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No bluffeas, muestras tu mano mala",icon:"✋"},{id:"s",label:"Bluff 33% ($140)",desc:"Bluff pequeño — menos riesgo",icon:"🎭",amount:140},{id:"m",label:"Bluff 75% ($315)",desc:"Bluff grande — más presión",icon:"🎭🎭",amount:315},{id:"ob",label:"Overbet ($500)",desc:"Apuestas más del pot — presión máxima",icon:"💣",amount:500}]},
  {id:"i2",mode:"intermediate",cat:"value",title:"Check-Raise con color",holeCards:["7h","6h"],board:["Ah","5h","Jh"],street:"flop",position:"BB",pot:240,stack:760,villainAction:"Apostó $120",context:"Tienes color completo en el flop. El oponente apostó $120. Pasaste antes. Ahora puedes hacer check-raise para sacar más fichas.",actions:[{id:"call",label:"Igualar $120",desc:"Pagas sin revelar tu fuerza",icon:"📞",amount:120},{id:"r_s",label:"Subir a $300",desc:"Check-raise moderado",icon:"⬆️",amount:300},{id:"r_b",label:"Subir a $500",desc:"Check-raise grande — extraes máximo",icon:"🔥",amount:500}]},
  {id:"i3",mode:"intermediate",cat:"position",title:"Pareja baja en board alto",holeCards:["6h","6d"],board:["Ks","Qh","9c"],street:"flop",position:"SB",pot:150,stack:850,villainAction:"Pasó sin apostar",context:"Tienes pareja de Seises, pero el board tiene K, Q, 9. Cualquier pareja con esas cartas te gana. ¿Apuestas o te cuidas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No arriesgas fichas con pareja pequeña",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$50 — apuesta para proteger tu pareja",icon:"💰",amount:50},{id:"m",label:"Apostar 66%",desc:"$99 — apuesta más fuerte",icon:"💰💰",amount:99}]},
  {id:"i4",mode:"intermediate",cat:"value",title:"Dos Parejas en Turn",holeCards:["Jh","9c"],board:["Js","4d","2c","9h"],street:"turn",position:"CO",pot:300,stack:700,villainAction:"Apostó $150",context:"Tienes dos parejas: Jotas y Nueves. El oponente apostó $150. Sin amenazas de color. ¿Cuánto le cobras?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras dos parejas — probablemente error",icon:"🗑️"},{id:"call",label:"Igualar $150",desc:"Pagas para ver el river",icon:"📞",amount:150},{id:"raise",label:"Subir a $400",desc:"Subes con tus dos parejas",icon:"⬆️",amount:400},{id:"shove",label:"Ir con todo",desc:"$700 — presión máxima",icon:"💥",amount:700}]},
  {id:"i5",mode:"intermediate",cat:"draw",title:"Sembluff con Flush Draw",holeCards:["Kh","8h"],board:["Ah","5h","Jc"],street:"flop",position:"CO",pot:240,stack:760,villainAction:"Apostó $120",context:"Tienes proyecto de color que si llega es fortísimo. El oponente apostó $120. Puedes pagar y esperar, o subir (sembluff).",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras tu proyecto de color",icon:"🗑️"},{id:"call",label:"Igualar $120",desc:"Pagas para ver la siguiente carta",icon:"📞",amount:120},{id:"raise",label:"Subir a $300",desc:"Sembluff — presionas con tu draw",icon:"⬆️",amount:300}]},
  {id:"i6",mode:"intermediate",cat:"bluff",title:"C-Bet en Board peligroso",holeCards:["Ad","Kc"],board:["8h","7h","6h"],street:"flop",position:"BTN",pot:200,stack:800,villainAction:"Pasó sin apostar",context:"Subiste preflop con A-K pero el flop no te ayudó. Board con tres corazones y cartas conectadas — muy peligroso. El oponente pasó.",actions:[{id:"ck",label:"Pasar (Check)",desc:"No arriesgas en board tan peligroso",icon:"✋"},{id:"s",label:"Apostar 25%",desc:"$50 — apuesta pequeña para sondar",icon:"💰",amount:50},{id:"m",label:"Apostar 66%",desc:"$132 — c-bet estándar",icon:"💰💰",amount:132}]},
  {id:"i7",mode:"intermediate",cat:"preflop",title:"¿Pagas All-In con A-Q?",holeCards:["Ah","Qd"],board:[],street:"preflop",position:"BB",pot:200,stack:800,villainAction:"Fue All-In con $400",context:"Tienes A-Q — mano muy buena. El oponente fue all-in con $400. A-Q pierde contra Ases, Reyes, Damas y A-K pero gana contra muchas otras manos.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras A-Q, evitas el riesgo",icon:"🗑️"},{id:"call",label:"Igualar All-In ($400)",desc:"Arriesgas $400 — mano buena, riesgo calculado",icon:"💥",amount:400}]},
  {id:"i8",mode:"intermediate",cat:"bluff",title:"Bluff en River sin proyecto",holeCards:["Th","6d"],board:["9s","8c","4h","Ah","2d"],street:"river",position:"SB",pot:500,stack:500,villainAction:"Pasó sin apostar",context:"Necesitabas el 7 para la escalera — no llegó. Tienes 10 alta sin valor. El oponente checkeó. ¿Bluffeas o aceptas la derrota?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No bluffeas, muestras tu mano sin valor",icon:"✋"},{id:"s",label:"Bluff 33% ($165)",desc:"Bluff pequeño — poco riesgo",icon:"🎭",amount:165},{id:"m",label:"Bluff 66% ($330)",desc:"Bluff grande para forzar fold",icon:"🎭🎭",amount:330},{id:"shove",label:"Bluff All-In ($500)",desc:"Todo in para máxima presión",icon:"💣",amount:500}]},
  {id:"i9",mode:"intermediate",cat:"value",title:"Trío — Slow Play o Value",holeCards:["Qd","Qh"],board:["Qs","7c","2d"],street:"flop",position:"EP",pot:200,stack:800,villainAction:"Pasó sin apostar",context:"Tienes trío de Damas — mano enorme. Board tranquilo. El oponente pasó. ¿Finges debilidad o cobras directo?",actions:[{id:"ck",label:"Fingir debilidad",desc:"Pasas para atrapar al oponente después",icon:"🐢"},{id:"s",label:"Apostar 33%",desc:"$66 — apuesta pequeña de valor",icon:"💰",amount:66},{id:"m",label:"Apostar 66%",desc:"$132 — apuesta estándar",icon:"💰💰",amount:132},{id:"b",label:"Apostar pot",desc:"$200 — cobras máximo ahora",icon:"🔥",amount:200}]},
  {id:"i10",mode:"intermediate",cat:"position",title:"Board con Escalera completa",holeCards:["Kh","Kc"],board:["Js","Ts","9c","8d","Qh"],street:"river",position:"EP",pot:600,stack:400,villainAction:"Apostó $300",context:"Tienes pareja de Reyes pero el board tiene escalera completa (8-9-10-J-Q). Cualquier jugador con 7 o As la tiene hecha. El oponente apostó $300.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras los Reyes — board muy peligroso",icon:"🗑️"},{id:"call",label:"Igualar $300",desc:"Pagas apostando que no tiene la escalera",icon:"📞",amount:300},{id:"shove",label:"Ir con todo ($400)",desc:"Subes todo in con tus Reyes",icon:"💥",amount:400}]},
  {id:"i11",mode:"intermediate",cat:"preflop",title:"3-Bet con Jotas",holeCards:["Jh","Js"],board:[],street:"preflop",position:"BTN",pot:35,stack:965,villainAction:"Abrió a $30 desde CO",context:"Tienes pareja de Jotas. El CO abrió a $30. Estás en el Button. ¿Re-subes (3-bet) o pagas para ver el flop?",actions:[{id:"call",label:"Igualar $30",desc:"Pagas y ves el flop sin revelar tu fuerza",icon:"📞",amount:30},{id:"3b_s",label:"3-Bet a $85",desc:"Re-subes moderado",icon:"⬆️",amount:85},{id:"3b_b",label:"3-Bet a $110",desc:"3-Bet más grande para aislar",icon:"🚀",amount:110}]},
  {id:"i12",mode:"intermediate",cat:"value",title:"Dos Parejas vs River Bet",holeCards:["Ah","Jd"],board:["As","Jc","4h","7d","Kh"],street:"river",position:"CO",pot:400,stack:600,villainAction:"Apostó $180",context:"Tienes dos parejas: Ases y Jotas. El Rey en el river podría ayudar al oponente. El oponente apostó $180. ¿Pagas o subes?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras dos parejas fuertes — probablemente error",icon:"🗑️"},{id:"call",label:"Igualar $180",desc:"Pagas y ves qué tiene",icon:"📞",amount:180},{id:"raise",label:"Subir a $450",desc:"Subes con tus dos parejas top",icon:"⬆️",amount:450}]},
  {id:"i13",mode:"intermediate",cat:"position",title:"Robo de ciegos desde SB",holeCards:["Kd","8h"],board:[],street:"preflop",position:"SB",pot:15,stack:985,villainAction:"Todos pasaron",context:"Todos pasaron y solo quedan tú (SB) y el BB. Tienes K-8. ¿Subes para robar el ciego o entras barato?",actions:[{id:"limp",label:"Entrar barato",desc:"$5 adicionales para ver el flop barato",icon:"😐",amount:5},{id:"r_s",label:"Subir a $25",desc:"Subida pequeña para robar el ciego",icon:"⬆️",amount:25},{id:"r_b",label:"Subir a $40",desc:"Subida grande para máxima presión",icon:"🔥",amount:40}]},
  {id:"i14",mode:"intermediate",cat:"value",title:"Trío vs Apuesta en River",holeCards:["8d","8h"],board:["8s","Kc","3h","Jd","5c"],street:"river",position:"BTN",pot:380,stack:620,villainAction:"Apostó $160",context:"Tienes trío de Ochos. El oponente apostó $160. Pocas manos te ganan. ¿Solo pagas o subes para más valor?",actions:[{id:"call",label:"Igualar $160",desc:"Pagas y ganas en casi todos los casos",icon:"📞",amount:160},{id:"raise",label:"Subir a $400",desc:"Subes para sacar más valor",icon:"⬆️",amount:400},{id:"shove",label:"Ir con todo ($620)",desc:"All-in — confías en que tu trío gana",icon:"💥",amount:620}]},
  {id:"i15",mode:"intermediate",cat:"draw",title:"Flush Draw en Turn",holeCards:["Qh","9h"],board:["Ah","7h","Jc","2s"],street:"turn",position:"CO",pot:300,stack:700,villainAction:"Apostó $150",context:"Tienes proyecto de color de corazones — una carta más y completas. El oponente apostó $150 en el turn. Una carta por salir.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras tu proyecto antes del river",icon:"🗑️"},{id:"call",label:"Igualar $150",desc:"Pagas para ver el river con tu proyecto",icon:"📞",amount:150},{id:"raise",label:"Subir a $400",desc:"Sembluff — presionas con tu draw",icon:"⬆️",amount:400}]},
  {id:"i16",mode:"intermediate",cat:"position",title:"Facing Check-Raise",holeCards:["Ad","Tc"],board:["As","9h","5d"],street:"flop",position:"BTN",pot:280,stack:720,villainAction:"Checkeó y luego subió a $200",context:"Apostaste $100 con pareja de Ases. El oponente te hizo check-raise a $200 — pasó y cuando apostaste, subió. ¿Trampa o mano fuerte?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras top pair ante el check-raise",icon:"🗑️"},{id:"call",label:"Igualar $200",desc:"Pagas para ver el turn",icon:"📞",amount:200},{id:"shove",label:"Ir con todo ($720)",desc:"Re-subes all-in con tu pareja de Ases",icon:"💥",amount:720}]},
  {id:"i17",mode:"intermediate",cat:"position",title:"Board muy coordinado",holeCards:["Td","9s"],board:["8h","7d","6c"],street:"flop",position:"SB",pot:180,stack:820,villainAction:"Pasó sin apostar",context:"Tienes 10-9 y el flop es muy coordinado donde todos tienen chances. El oponente pasó. ¿Apuestas o te cuidas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No arriesgas en board donde todos tienen draw",icon:"✋"},{id:"s",label:"Apostar 33%",desc:"$60 — apuesta pequeña para ver la reacción",icon:"💰",amount:60},{id:"m",label:"Apostar 66%",desc:"$119 — apuesta fuerte con tu mano",icon:"💰💰",amount:119}]},
  {id:"i18",mode:"intermediate",cat:"value",title:"Over Pair en Flop bajo",holeCards:["Kh","Kd"],board:["9c","5h","2d"],street:"flop",position:"CO",pot:220,stack:780,villainAction:"Apostó $110",context:"Tienes pareja de Reyes — la más alta del board. Nadie puede tener pareja mayor. El oponente apostó $110. Board bajo y tranquilo.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras over pair — definitivamente error",icon:"🗑️"},{id:"call",label:"Igualar $110",desc:"Pagas para ver la siguiente carta",icon:"📞",amount:110},{id:"raise",label:"Subir a $300",desc:"Subes con tu over pair para sacar valor",icon:"⬆️",amount:300}]},
  {id:"i19",mode:"intermediate",cat:"position",title:"Robo desde Button",holeCards:["Ah","4c"],board:[],street:"preflop",position:"BTN",pot:15,stack:985,villainAction:"Todos pasaron hasta ti",context:"Tienes A-4 — mano mediana con un As. Todos pasaron hasta ti en el Button. Solo quedan los ciegos. ¿Cuánto subes?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras A-4 desde posición de ventaja",icon:"🗑️"},{id:"r_s",label:"Subir a $25",desc:"Subida pequeña para robar ciegos",icon:"⬆️",amount:25},{id:"r_m",label:"Subir a $35",desc:"Subida estándar desde el Button",icon:"💰",amount:35},{id:"r_b",label:"Subir a $50",desc:"Subida grande para eliminar a los ciegos",icon:"🔥",amount:50}]},
  {id:"i20",mode:"intermediate",cat:"bluff",title:"Bluff en Turn coordinado",holeCards:["Kc","Qd"],board:["Js","Th","7d","8c"],street:"turn",position:"BTN",pot:340,stack:660,villainAction:"Pasó sin apostar",context:"Tienes proyecto de escalera (necesitas 9 o As). El oponente pasó. Tienes posición. ¿Apostás para tomar control?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Ves el river gratis con tu proyecto",icon:"✋"},{id:"s",label:"Apostar 33% ($112)",desc:"Apuesta pequeña de presión",icon:"💰",amount:112},{id:"m",label:"Apostar 66% ($224)",desc:"Apuesta fuerte con posición",icon:"💰💰",amount:224}]},
  {id:"i21",mode:"intermediate",cat:"preflop",title:"Responder al 3-Bet",holeCards:["Ah","Js"],board:[],street:"preflop",position:"CO",pot:85,stack:915,villainAction:"Re-subió a $85 desde BTN",context:"Abriste a $30 con A-J. El Button re-subió (3-bet) a $85. A-J puede estar dominada si él tiene A-Q, A-K o parejas altas. ¿Qué haces?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras A-J ante el 3-bet",icon:"🗑️"},{id:"call",label:"Igualar $85",desc:"Pagas y ves el flop en posición desfavorable",icon:"📞",amount:85},{id:"4bet",label:"4-Bet a $220",desc:"Re-subes agresivamente con A-J",icon:"💥",amount:220}]},
  {id:"i22",mode:"intermediate",cat:"value",title:"Value Bet con kicker dudoso",holeCards:["Kd","Qc"],board:["Kh","7s","3d","Jc","2h"],street:"river",position:"SB",pot:320,stack:680,villainAction:"Pasó sin apostar",context:"Tienes pareja de Reyes. El oponente checkeó. Puedes cobrar pero si él tiene Rey con mejor kicker te gana. ¿Vale la pena apostar?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Evitas perder ante Rey con mejor kicker",icon:"✋"},{id:"s",label:"Apostar 25% ($80)",desc:"Apuesta pequeña de valor con algo de riesgo",icon:"💰",amount:80},{id:"m",label:"Apostar 50% ($160)",desc:"Apuesta media para cobrar más",icon:"💰💰",amount:160}]},
  {id:"i23",mode:"intermediate",cat:"preflop",title:"Poco Stack con Mano Fuerte",holeCards:["Qh","Qd"],board:["Jc","8s","3d"],street:"flop",position:"BTN",pot:600,stack:300,villainAction:"Apostó $200",context:"Tienes pareja de Damas y poco stack. El oponente apostó $200. Tu stack es solo $300 — si pagas quedas con $100. Casi siempre es mejor ir all-in.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras over pair con poco stack",icon:"🗑️"},{id:"call",label:"Igualar $200",desc:"Pagas y te quedas con $100 de stack",icon:"📞",amount:200},{id:"shove",label:"Ir con todo ($300)",desc:"All-in con tu over pair",icon:"💥",amount:300}]},
  {id:"i24",mode:"intermediate",cat:"draw",title:"Combo Draw en Flop",holeCards:["Jh","Th"],board:["9h","8d","Kh"],street:"flop",position:"CO",pot:260,stack:740,villainAction:"Pasó sin apostar",context:"Tienes proyecto de escalera abierta Y proyecto de color. Dos draws al mismo tiempo. El oponente pasó. ¿Apuestas fuerte?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Ves la siguiente carta gratis",icon:"✋"},{id:"s",label:"Apostar 33% ($86)",desc:"Apuesta pequeña con tus proyectos",icon:"💰",amount:86},{id:"m",label:"Apostar 66% ($172)",desc:"Apuesta fuerte — tus proyectos valen mucho",icon:"💰💰",amount:172},{id:"b",label:"Apostar pot ($260)",desc:"Máxima presión con combo draw",icon:"🔥",amount:260}]},
  {id:"i25",mode:"intermediate",cat:"position",title:"Pareja media vs Raise en Turn",holeCards:["Th","9d"],board:["Ts","4c","2d","Jh"],street:"turn",position:"SB",pot:280,stack:720,villainAction:"Subió a $240",context:"Tienes pareja de Dieces pero la Jota en el turn le pudo ayudar al oponente. Él subió fuertemente a $240. ¿Tu pareja justifica pagar?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras pareja media ante la subida fuerte",icon:"🗑️"},{id:"call",label:"Igualar $240",desc:"Pagas y ves el river",icon:"📞",amount:240},{id:"shove",label:"Ir con todo ($720)",desc:"All-in con tu pareja de Dieces",icon:"💥",amount:720}]},
  // ADVANCED 25
  {id:"a1",mode:"advanced",cat:"draw",title:"Check-Raise con Draw",holeCards:["Jh","Td"],board:["9s","8c","2h"],street:"flop",position:"BTN",pot:480,stack:720,villainAction:"Pasó y luego subió a $220",context:"Tienes proyecto de escalera abierta (8 outs). Apostaste $120 y el oponente te hizo check-raise a $220. ¿Fold, call, o all-in?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras tu proyecto ante el check-raise",icon:"🗑️"},{id:"call",label:"Igualar $220",desc:"Pagas con tus 8 outs para ver el turn",icon:"📞",amount:220},{id:"shove",label:"Ir con todo ($720)",desc:"Re-subes all-in — fold equity + draw",icon:"💥",amount:720}]},
  {id:"a2",mode:"advanced",cat:"bluff",title:"Triple Barrel Bluff",holeCards:["Ac","3c"],board:["Kd","Qh","5s","8c","2d"],street:"river",position:"BTN",pot:580,stack:420,villainAction:"Pagó flop y turn, ahora checkeó river",context:"Apostaste en el flop y turn como bluff, el oponente pagó ambas veces. En el river él checkeó. Tienes As alto sin valor. ¿Sigues con el bluff?",actions:[{id:"ck",label:"Parar el Bluff (Check)",desc:"Aceptas que tu bluff no funcionó",icon:"✋"},{id:"s",label:"Bluff pequeño ($140)",desc:"Apuesta pequeña para terminar la historia",icon:"🎭",amount:140},{id:"b",label:"Bluff grande ($380)",desc:"Apuesta grande — ya invertiste mucho",icon:"🎭🎭",amount:380}]},
  {id:"a3",mode:"advanced",cat:"preflop",title:"4-Bet o Fold preflop",holeCards:["Kh","Qh"],board:[],street:"preflop",position:"CO",pot:85,stack:915,villainAction:"4-bet a $250 desde BTN",context:"Hiciste 3-bet a $85 con K-Q suited. El Button re-subió (4-bet) a $250. Con K-Q puedes estar muy detrás si tiene Ases, Reyes, Damas o A-K.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras K-Q ante el 4-bet",icon:"🗑️"},{id:"call",label:"Igualar $250",desc:"Pagas el 4-bet para ver el flop",icon:"📞",amount:250},{id:"5bet",label:"5-Bet All-In ($915)",desc:"Todo in — o bluff o mano premium",icon:"💥",amount:915}]},
  {id:"a4",mode:"advanced",cat:"bluff",title:"Bluff polarizado en River",holeCards:["7d","6d"],board:["Ah","Kc","Qd","5s","2c"],street:"river",position:"BTN",pot:520,stack:480,villainAction:"Pasó sin apostar",context:"Tienes 7 alta sin valor pero el oponente checkeó tres veces. Su rango parece débil. ¿Intentas un bluff grande?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No bluffeas, el board es muy alto",icon:"✋"},{id:"s",label:"Bluff 33% ($172)",desc:"Bluff pequeño — bajo riesgo",icon:"🎭",amount:172},{id:"m",label:"Bluff 75% ($390)",desc:"Bluff grande — alto riesgo, alta recompensa",icon:"🎭🎭",amount:390},{id:"ob",label:"Overbet ($480)",desc:"Overbet bluff — representas mano fortísima",icon:"💣",amount:480}]},
  {id:"a5",mode:"advanced",cat:"position",title:"Escalera vs Board de Color",holeCards:["Jh","Td"],board:["9h","8h","7h","2c","Kd"],street:"river",position:"SB",pot:460,stack:540,villainAction:"Apostó $280",context:"Tienes escalera pero el board tiene tres corazones. Si el oponente tiene un corazón, tiene color y te gana. Apostó $280. ¿Tu escalera vale pagar?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras tu escalera — el board de color da miedo",icon:"🗑️"},{id:"call",label:"Igualar $280",desc:"Pagas apostando que no tiene el color",icon:"📞",amount:280},{id:"raise",label:"Subir a $540",desc:"Subes con tu escalera",icon:"⬆️",amount:540}]},
  {id:"a6",mode:"advanced",cat:"value",title:"Trío — Value Bet Sizing",holeCards:["8h","8d"],board:["Ac","Kd","8s","5h","2c"],street:"river",position:"EP",pot:480,stack:520,villainAction:"Pasó sin apostar",context:"Tienes trío de Ochos. El board de As y Rey hace que él checkeé con muchas manos también. ¿Cómo maximizas el valor?",actions:[{id:"ck",label:"Inducing (Check)",desc:"Intentas que él bluffee con manos débiles",icon:"🐢"},{id:"s",label:"Value Bet 25% ($120)",desc:"Apuesta pequeña para que pague manos medias",icon:"💰",amount:120},{id:"m",label:"Value Bet 60% ($290)",desc:"Apuesta grande para extraer máximo valor",icon:"💰💰",amount:290},{id:"b",label:"Overbet ($520)",desc:"Overbet — representas mano muy específica",icon:"🔥",amount:520}]},
  {id:"a7",mode:"advanced",cat:"preflop",title:"Squeeze preflop",holeCards:["Ah","Kd"],board:[],street:"preflop",position:"BTN",pot:95,stack:905,villainAction:"Abrió a $30 (EP) + 1 caller",context:"Un jugador abrió a $30 y otro igualó. Tienes A-K en el Button. Puedes hacer squeeze — subir grande para sacar a los dos.",actions:[{id:"call",label:"Igualar $30",desc:"Pagas y ves el flop con 3 jugadores",icon:"📞",amount:30},{id:"sq_s",label:"Squeeze a $110",desc:"Squeeze moderado para aislar",icon:"⬆️",amount:110},{id:"sq_b",label:"Squeeze a $150",desc:"Squeeze grande para sacar a ambos",icon:"🚀",amount:150},{id:"shove",label:"Ir con todo ($905)",desc:"All-in — A-K merece todo el stack",icon:"💥",amount:905}]},
  {id:"a8",mode:"advanced",cat:"position",title:"Defender BB vs Steal",holeCards:["9h","8h"],board:[],street:"preflop",position:"BB",pot:50,stack:990,villainAction:"Subió a $30 desde BTN (posible robo)",context:"El Button subió a $30 — podría ser un robo. Tienes 9-8 suited, mano conectada. ¿Defiendes con 3-bet o solo pagas?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras 9-8s ante la subida del Button",icon:"🗑️"},{id:"call",label:"Igualar ($20 más)",desc:"Defiendes el BB pagando $20 adicionales",icon:"📞",amount:20},{id:"3bet",label:"3-Bet a $95",desc:"Contraatacas — representas mano fuerte",icon:"🚀",amount:95}]},
  {id:"a9",mode:"advanced",cat:"bluff",title:"Donk Bet con Escalera de Acero",holeCards:["5s","4s"],board:["6h","3d","2c"],street:"flop",position:"SB",pot:180,stack:820,villainAction:"Todavía no actuó en el flop (él subió preflop)",context:"Completaste escalera de Acero (A-2-3-4-5) en el flop. El Button subió preflop y ahora actúas primero. ¿Haces un donk bet o checkeas?",actions:[{id:"ck",label:"Checkear (Check)",desc:"Dejas que él apueste — más común con mano fuerte",icon:"✋"},{id:"donk_s",label:"Donk Bet 33% ($60)",desc:"Apuesta inesperada — lo confundes",icon:"💰",amount:60},{id:"donk_b",label:"Donk Bet 75% ($135)",desc:"Donk bet grande — representas mano específica",icon:"💰💰",amount:135}]},
  {id:"a10",mode:"advanced",cat:"position",title:"Facing River Overbet",holeCards:["Kd","Qd"],board:["Ks","Qh","5c","8d","Jh"],street:"river",position:"CO",pot:420,stack:580,villainAction:"Apostó todo ($580 — overbet del pot)",context:"Tienes dos parejas (Reyes y Damas). El oponente apostó MÁS que el pot ($580) en el river. Esto normalmente significa mano muy fuerte o bluff total.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras dos parejas top ante el overbet",icon:"🗑️"},{id:"call",label:"Igualar $580",desc:"Pagas el overbet con tus dos parejas top",icon:"📞",amount:580}]},
  {id:"a11",mode:"advanced",cat:"value",title:"Thin Value con Kicker bajo",holeCards:["Ah","7d"],board:["As","Tc","3h","9d","2c"],street:"river",position:"BTN",pot:380,stack:620,villainAction:"Pasó sin apostar",context:"Tienes pareja de Ases con 7 de kicker. Si él tiene As con kicker más alto te gana. El oponente checkeó. ¿Apuestas de todas formas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"Evitas perder ante un As con mejor kicker",icon:"✋"},{id:"s",label:"Apostar 25% ($95)",desc:"Thin value — apuesta pequeña con algo de riesgo",icon:"💰",amount:95},{id:"m",label:"Apostar 50% ($190)",desc:"Apuesta media — confías en que tu kicker es suficiente",icon:"💰💰",amount:190}]},
  {id:"a12",mode:"advanced",cat:"bluff",title:"Float en Flop alto",holeCards:["9d","8d"],board:["Ah","Kc","4s"],street:"flop",position:"BTN",pot:200,stack:800,villainAction:"Apostó $80",context:"Tienes 9-8 sin pareja pero el oponente puede estar haciendo una c-bet sin tener nada. Con posición puedes 'flotar' (call) y ganar el pot en el turn.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras tu mano débil ante la apuesta",icon:"🗑️"},{id:"call",label:"Flotar (Call $80)",desc:"Pagas para ver si debilita en el turn",icon:"📞",amount:80},{id:"raise",label:"Subir a $220",desc:"Bluff raise — representas As o Rey",icon:"⬆️",amount:220}]},
  {id:"a13",mode:"advanced",cat:"value",title:"Escalera en Flop — Sizing",holeCards:["Qh","Jh"],board:["Ks","Tc","9d"],street:"flop",position:"CO",pot:260,stack:740,villainAction:"Pasó sin apostar",context:"Tienes escalera completa en el flop. El oponente es agresivo y pasó. ¿Lento juegas para inducir un bluff, o apuestas para cobrar?",actions:[{id:"ck",label:"Slow Play — inducir bluff",desc:"Esperas que él bluffee con su rango amplio",icon:"🐢"},{id:"s",label:"Apostar 33% ($86)",desc:"Value bet pequeña para empezar a cobrar",icon:"💰",amount:86},{id:"m",label:"Apostar 66% ($172)",desc:"Value bet estándar con tu escalera",icon:"💰💰",amount:172},{id:"b",label:"Apostar pot ($260)",desc:"Cobras máximo ahora",icon:"🔥",amount:260}]},
  {id:"a14",mode:"advanced",cat:"bluff",title:"River Probe Bet",holeCards:["As","Qs"],board:["Ah","Jd","4c","8s","Kc"],street:"river",position:"BB",pot:340,stack:660,villainAction:"Checkeó en flop y turn",context:"El oponente checkeó tanto en el flop como en el turn. Ahora actúas antes que él en el river. Tienes pareja de Ases con Dama. ¿Apuestas o checkeas?",actions:[{id:"ck",label:"Checkear (Check)",desc:"Intentas que él apueste con su rango",icon:"✋"},{id:"s",label:"Probe Bet 33% ($112)",desc:"Apuesta para cobrar manos medias",icon:"💰",amount:112},{id:"m",label:"Probe Bet 66% ($224)",desc:"Apuesta grande para extraer valor máximo",icon:"💰💰",amount:224}]},
  {id:"a15",mode:"advanced",cat:"preflop",title:"Defender vs 3-Bet OOP",holeCards:["Kc","Jd"],board:[],street:"preflop",position:"EP",pot:85,stack:915,villainAction:"3-bet a $85 desde BTN",context:"Abriste a $30 con K-J. El Button hizo 3-bet a $85. K-J fuera de posición es difícil. ¿Pagas sin posición o te retiras?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras K-J ante el 3-bet OOP",icon:"🗑️"},{id:"call",label:"Igualar $85",desc:"Pagas, juegas sin posición (OOP)",icon:"📞",amount:85},{id:"4bet",label:"4-Bet a $220",desc:"4-bet — K-J puede ser bluff aquí",icon:"💥",amount:220}]},
  {id:"a16",mode:"advanced",cat:"bluff",title:"Doble Barrel Bluff",holeCards:["Kd","Qd"],board:["Ah","9c","3s","Jd"],street:"turn",position:"BTN",pot:380,stack:620,villainAction:"Pagó tu c-bet del flop, ahora checkeó turn",context:"Apostaste en el flop como bluff y él pagó. En el turn él checkeó. Tienes proyecto de escalera (K-Q-J-9, necesitas T). ¿Sigues apostando (doble barrel)?",actions:[{id:"ck",label:"Parar el bluff (Check)",desc:"Ves el river gratis con tu proyecto",icon:"✋"},{id:"s",label:"2nd Barrel 40% ($152)",desc:"Sigues apostando — semi-bluff con draw",icon:"💰",amount:152},{id:"b",label:"2nd Barrel 75% ($285)",desc:"Barrel grande para máxima presión",icon:"💰💰",amount:285}]},
  {id:"a17",mode:"advanced",cat:"position",title:"Pot Control con Pareja Media",holeCards:["Td","9s"],board:["Th","8c","3d","Kh"],street:"turn",position:"SB",pot:300,stack:700,villainAction:"Apostó $180",context:"Tienes pareja de Dieces pero el Rey en el turn le pudo dar top pair al oponente. Él apostó $180. ¿Vale la pena pagar?",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras pareja media ante el betting del turn",icon:"🗑️"},{id:"call",label:"Igualar $180 (Pot Control)",desc:"Pagas para ver el river — evitas el all-in",icon:"📞",amount:180},{id:"raise",label:"Subir a $500",desc:"Re-subes con tu pareja de Dieces",icon:"⬆️",amount:500}]},
  {id:"a18",mode:"advanced",cat:"value",title:"Escalera en Flop vs Apostador",holeCards:["8s","7s"],board:["9d","6h","5c"],street:"flop",position:"BB",pot:200,stack:800,villainAction:"Apostó $120",context:"Tienes escalera completa en el flop. El oponente apostó $120. ¿Pagas para invitarlo a seguir, o haces check-raise para extraer todo?",actions:[{id:"call",label:"Igualar $120",desc:"Pagas — lo invitas a seguir apostando",icon:"📞",amount:120},{id:"r_s",label:"Check-Raise a $300",desc:"Subes moderado con tu escalera",icon:"⬆️",amount:300},{id:"r_b",label:"Check-Raise a $520",desc:"Check-raise grande para extraer todo",icon:"🔥",amount:520},{id:"shove",label:"Ir con todo ($800)",desc:"All-in con escalera en el flop",icon:"💥",amount:800}]},
  {id:"a19",mode:"advanced",cat:"bluff",title:"Block Bet para controlar sizing",holeCards:["Ac","6h"],board:["As","Kd","7c","2h","Jc"],street:"river",position:"BB",pot:360,stack:640,villainAction:"Checkeó en flop y turn",context:"Tienes pareja de Ases con kicker bajo. El oponente checkeó dos veces. Si él apuesta fuerte no puedes pagar fácil. ¿Haces un block bet pequeño?",actions:[{id:"ck",label:"Checkear (Check)",desc:"Le das la iniciativa al oponente",icon:"✋"},{id:"s",label:"Block Bet 25% ($90)",desc:"Apuesta pequeña para controlar el sizing",icon:"💰",amount:90},{id:"m",label:"Value Bet 60% ($216)",desc:"Apuesta más grande para cobrar valor real",icon:"💰💰",amount:216}]},
  {id:"a20",mode:"advanced",cat:"preflop",title:"ICM en Torneo",holeCards:["Qd","Js"],board:[],street:"preflop",position:"SB",pot:900,stack:3200,villainAction:"Fue All-In con $1800 (short stack)",context:"Estás en un torneo cerca del dinero. El short stack fue all-in. Tienes Q-J. En torneos, el riesgo de eliminación (ICM) cambia las decisiones vs cash game.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Evitas el riesgo de eliminación cerca del dinero",icon:"🗑️"},{id:"call",label:"Igualar All-In ($1800)",desc:"Arriesgas fichas con Q-J — si ganas eliminas un rival",icon:"💥",amount:1800}]},
  {id:"a21",mode:"advanced",cat:"value",title:"Range Advantage en Board seco",holeCards:["Ac","Ad"],board:["7s","4d","2h"],street:"flop",position:"EP",pot:220,stack:780,villainAction:"Pasó sin apostar",context:"Tienes pareja de Ases en un board muy bajo y seco. Tu ventaja de rango es enorme. ¿Cómo extraes el máximo aprovechando esa ventaja?",actions:[{id:"ck",label:"Checkear (Check)",desc:"Dejas que él llene su rango apostando",icon:"✋"},{id:"s",label:"Bet 25% ($55)",desc:"Apuesta pequeña — invitas a calls con manos medias",icon:"💰",amount:55},{id:"m",label:"Bet 75% ($165)",desc:"Apuesta grande — maximizas con mano monstruo",icon:"💰💰",amount:165},{id:"b",label:"Overbet ($280)",desc:"Overbet — con ventaja de rango puedes apostar mucho",icon:"🔥",amount:280}]},
  {id:"a22",mode:"advanced",cat:"draw",title:"Combo Draw fuera de posición",holeCards:["Kh","Qh"],board:["Jd","Th","4c"],street:"flop",position:"SB",pot:240,stack:760,villainAction:"Apostó $120",context:"Tienes proyecto de escalera (K-Q-J-T) Y proyecto de color de corazones. Pero estás fuera de posición — actúas primero. El oponente apostó $120.",actions:[{id:"fold",label:"Retirarse (Fold)",desc:"Tiras dos proyectos — quizás demasiado",icon:"🗑️"},{id:"call",label:"Igualar $120",desc:"Pagas — realizas equity aunque estés OOP",icon:"📞",amount:120},{id:"raise",label:"Check-Raise a $340",desc:"Check-raise con tu combo draw OOP",icon:"⬆️",amount:340},{id:"shove",label:"Ir con todo ($760)",desc:"All-in con tu combo draw",icon:"💥",amount:760}]},
  {id:"a23",mode:"advanced",cat:"value",title:"Póker — ¿cuánto cobras?",holeCards:["5h","5d"],board:["5s","5c","Ah","Kd","Qh"],street:"river",position:"BTN",pot:500,stack:500,villainAction:"Apostó $250",context:"Tienes PÓKER DE CINCOS — la cuarta mejor mano posible. El oponente apostó $250. Solo el Royal Flush, escalera de color y póker de Ases te ganan.",actions:[{id:"call",label:"Igualar $250",desc:"Pagas con tu mano casi invencible",icon:"📞",amount:250},{id:"raise",label:"Subir a $500",desc:"Subes con tu póker para extraer todo",icon:"⬆️",amount:500}]},
  {id:"a24",mode:"advanced",cat:"bluff",title:"Triple Barrel con Backdoor",holeCards:["Kc","Qc"],board:["Jc","Th","4d","2c","8s"],street:"river",position:"BTN",pot:600,stack:400,villainAction:"Pagó flop, pagó turn, checkeó river",context:"Apostaste en flop y turn con proyectos. No llegó nada y el river tampoco ayudó. Tienes K alta sin valor. El oponente checkeó el river. ¿Sigues con el bluff final?",actions:[{id:"ck",label:"Parar el bluff (Check)",desc:"Aceptas la derrota",icon:"✋"},{id:"s",label:"River Barrel 33% ($198)",desc:"Barrel pequeño para terminar el bluff",icon:"🎭",amount:198},{id:"b",label:"River Barrel All-In ($400)",desc:"All-in en el river — fold equity o showdown",icon:"💣",amount:400}]},
  {id:"a25",mode:"advanced",cat:"position",title:"Board con Escalera Real",holeCards:["2d","2c"],board:["Ah","Kd","Qc","Jh","Ts"],street:"river",position:"SB",pot:480,stack:520,villainAction:"Pasó sin apostar",context:"El board tiene la escalera más alta posible (A-K-Q-J-T). Tú tienes pareja de Doses — prácticamente sin valor. El oponente checkeó. ¿Bluffeas?",actions:[{id:"ck",label:"Pasar (Check)",desc:"No arriesgas en board tan extremo",icon:"✋"},{id:"s",label:"Bluff pequeño ($120)",desc:"Representas una mano específica en el board",icon:"🎭",amount:120},{id:"b",label:"Bluff grande ($380)",desc:"Bluff grande — el board favorece manos específicas",icon:"🎭🎭",amount:380}]},
];

// ─── AI FUNCTIONS ────────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens=800) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens, messages:[{role:"user",content:prompt}] })
  });
  const d = await r.json();
  return JSON.parse((d.content?.map(b=>b.text||"").join("")||"").replace(/```json|```/g,"").trim());
}

async function generateScenario(mode, n) {
  const diffMap={beginner:"principiante (situaciones básicas, manos fuertes evidentes)",intermediate:"intermedio (estrategia y razonamiento)",advanced:"avanzado (conceptos complejos, sizing, GTO)",random:"cualquier dificultad"};
  return callClaude(`Genera un escenario único #${n} de Texas Hold'em nivel ${diffMap[mode]||"intermedio"} en español. SOLO JSON sin markdown:
{"title":"Título corto (max 5 palabras)","difficulty":"beginner","position":"BTN","street":"flop","pot":200,"stack":800,"holeCards":["Ah","Kd"],"board":["Ks","7c","2h"],"villainAction":"Descripción corta","context":"2-3 oraciones simples","cat":"value","actions":[{"id":"a1","label":"Nombre acción","desc":"Descripción simple","icon":"emoji","amount":null},{"id":"a2","label":"Nombre","desc":"Descripción","icon":"emoji","amount":80},{"id":"a3","label":"Nombre","desc":"Descripción","icon":"emoji","amount":180}]}
cat puede ser: value, bluff, draw, preflop, position. Cartas: valor+palo (Ah,Kd,Tc,2s). No repitas cartas. board vacío si preflop; flop=3,turn=4,river=5. amount es número o null.`,900)
  .then(p=>({...p,id:`ai_${Date.now()}`,curated:false,mode}));
}

async function evaluateAction(scenario, action) {
  const board = scenario.board?.length ? scenario.board.join(" ") : "Preflop (sin cartas)";
  return callClaude(`Coach de poker amigable en español simple. Evalúa esta jugada.
Cartas: ${scenario.holeCards?.join(" ")} | Mesa: ${board} | Posición: ${scenario.position} | Ronda: ${scenario.street} | Bote: $${scenario.pot} | Fichas: $${scenario.stack} | Oponente: ${scenario.villainAction}
Decisión: ${action.label}${action.amount?` ($${action.amount})`:""} — ${action.desc}
SOLO JSON: {"verdict":"EXCELENTE" o "BUENA JUGADA" o "SE PUEDE MEJORAR" o "ERROR","score":75,"headline":"Frase corta (max 8 palabras)","reasoning":"2-3 oraciones simples. Términos técnicos explicados entre paréntesis.","better_play":"1-2 oraciones sobre lo ideal.","lesson":"Una lección concreta en una oración.","cat":"value"}
cat igual que el escenario: value, bluff, draw, preflop, o position.`,600);
}

async function generateDuelHand(profile) {
  return callClaude(`Genera una mano completa de Texas Hold'em heads-up para modo duelo en español. El oponente tiene perfil: ${profile} (${VILLAIN_PROFILES[profile].desc}).
SOLO JSON sin markdown:
{"holeCards":["Ah","Kd"],"villainCards":["Qh","Jd"],"flop":["Ks","7c","2h"],"turn":"9d","river":"3s","position":"BTN","startingPot":30,"startingStack":970,"context":"2-3 oraciones describiendo el setup preflop de esta mano"}
Cartas: valor+palo (Ah,Kd,Tc,2s). No repitas cartas. Genera manos variadas e interesantes. El perfil del oponente debe influenciar sus cartas (agresivo puede tener manos especulativas, pasivo manos medias, equilibrado cualquier cosa).`,600);
}

async function getDuelVillainAction(hand, street, heroActions, pot, stack, profile) {
  const board = street==="flop"?hand.flop.join(" "):street==="turn"?[...hand.flop,hand.turn].join(" "):[...hand.flop,hand.turn,hand.river].join(" ");
  return callClaude(`Jugador de poker (perfil: ${VILLAIN_PROFILES[profile].label} — ${VILLAIN_PROFILES[profile].desc}) decide qué hacer en ${street}.
Cartas del villain: ${hand.villainCards.join(" ")} | Mesa: ${board} | Bote: $${pot} | Stack: $${stack} | Posición: opuesto a BTN
Acciones del héroe esta mano: ${heroActions.map(a=>`${a.street}: ${a.label}${a.amount?` ($${a.amount})`:""}`).join(", ")||"ninguna aún"}
Responde SOLO JSON: {"action":"check" o "bet" o "call" o "fold" o "raise" o "allin","amount":null_o_numero,"reasoning":"1 oración explicando por qué (en primera persona, como el villain)"}
El amount debe ser coherente con el pot ($${pot}). Si es check o fold, amount es null.`,400);
}

async function evaluateDuelLine(hand, heroActions, result, profile) {
  const board = [...hand.flop, hand.turn, hand.river].join(" ");
  return callClaude(`Coach de poker evalúa la línea completa de decisiones del jugador en una mano de duelo en español simple.
Cartas del héroe: ${hand.holeCards.join(" ")} | Cartas del villain: ${hand.villainCards.join(" ")} | Board completo: ${board}
Perfil del oponente: ${VILLAIN_PROFILES[profile].label} — ${VILLAIN_PROFILES[profile].desc}
Decisiones del héroe: ${heroActions.map(a=>`${a.street}: ${a.label}${a.amount?` ($${a.amount})`:""}`).join(" → ")}
Resultado: ${result}
SOLO JSON: {"verdict":"EXCELENTE" o "BUENA JUGADA" o "SE PUEDE MEJORAR" o "ERROR","score":75,"headline":"Frase corta (max 8 palabras)","line_analysis":"Analiza la línea completa de decisiones en 3-4 oraciones. ¿Fueron consistentes? ¿Hubo errores específicos?","key_mistake":"El error más importante si lo hubo, o 'Ningún error significativo' si la línea fue buena.","lesson":"Una lección concreta sobre jugar contra este tipo de oponente."}`,700);
}


async function generateSessionInsight(playerName, recentHistory) {
  const summary = recentHistory.map(h=>`${h.title}: ${h.verdict} (${h.score}/100, cat:${h.cat})`).join(' | ');
  return callClaude(`Coach de poker. El jugador ${playerName} completó 5 manos. Genera insight personalizado breve en español.
Manos: ${summary}
SOLO JSON: {"insight":"1-2 oraciones sobre el patrón de juego con el nombre del jugador, motivador y específico","weakness":"categoría más débil (value/bluff/draw/preflop/position)","strength":"categoría más fuerte"}`, 300);
}


// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  // ── THEME ──────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pt_theme') !== 'light');
  G = isDark ? DARK_THEME : LIGHT_THEME;
  const toggleTheme = () => setIsDark(d => { const n=!d; localStorage.setItem('pt_theme',n?'dark':'light'); return n; });

  // ── PLAYER ─────────────────────────────────────────────────────────────────
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('pt_name')||'');
  const [nameInput,  setNameInput]  = useState('');
  const [xp,   setXp]    = useState(() => parseInt(localStorage.getItem('pt_xp')||'0'));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('pt_streak')||'0'));

  // ── NAVIGATION ─────────────────────────────────────────────────────────────
  const [view, setView] = useState(() => localStorage.getItem('pt_name') ? "menu" : "welcome");
  const [prevView, setPrevView] = useState("menu");

  // ── TRAINING MODE ──────────────────────────────────────────────────────────
  const [mode, setMode]           = useState(null);
  const [curated, setCurated]     = useState([]);
  const [aiList, setAiList]       = useState([]);
  const [idx, setIdx]             = useState(0);
  const [selAction, setSelAction] = useState(null);
  const [eval_, setEval]          = useState(null);

  // ── SESSION ────────────────────────────────────────────────────────────────
  const [history, setHistory] = useState([]);

  // ── DUEL MODE ──────────────────────────────────────────────────────────────
  const [duelProfile, setDuelProfile]           = useState("balanced");
  const [duelHand, setDuelHand]                 = useState(null);
  const [duelStreet, setDuelStreet]             = useState("flop");
  const [duelPot, setDuelPot]                   = useState(30);
  const [duelStack, setDuelStack]               = useState(970);
  const [duelHeroActions, setDuelHeroActions]   = useState([]);
  const [duelVillainAction, setDuelVillainAction] = useState(null);
  const [duelEval, setDuelEval]                 = useState(null);
  const [duelResult, setDuelResult]             = useState("");

  // ── LEVEL UP & MILESTONE ───────────────────────────────────────────────────
  const [levelUpData,      setLevelUpData]      = useState(null);
  const [milestoneData,    setMilestoneData]    = useState(null);
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const allScenarios = [...curated, ...aiList];
  const scenario     = allScenarios[idx];
  const avgScore     = history.length>0 ? Math.round(history.reduce((a,h)=>a+h.score,0)/history.length) : 0;
  const rank         = getRank(xp);

  // ── TRAINING ACTIONS ───────────────────────────────────────────────────────
  const startMode = (m) => {
    setMode(m);
    const pool = m==="random"
      ? [...ALL_CURATED].sort(()=>Math.random()-0.5)
      : [...ALL_CURATED.filter(s=>s.mode===m)].sort(()=>Math.random()-0.5);
    setCurated(pool); setAiList([]); setIdx(0); setSelAction(null); setEval(null); setView("play");
  };

  const doAction = async (action) => {
    setSelAction(action); setView("evaluating");
    try {
      const res = await evaluateAction(scenario, action);
      setEval(res);
      const score = res.score || 0;
      const newStreak = score >= 70 ? streak + 1 : 0;
      setStreak(newStreak); localStorage.setItem('pt_streak', String(newStreak));
      const earned = xpForScore(score, newStreak);
      const oldRankIdx = getRank(xp).index;
      const newXp = xp + earned;
      const newRankData = getRank(newXp);
      setXp(newXp); localStorage.setItem('pt_xp', String(newXp));
      const newHistory = [...history, {
        title: scenario.title, score, verdict: res.verdict,
        lesson: res.lesson, cat: scenario.cat||res.cat||"value",
        mode: scenario.mode||mode, xpEarned: earned
      }];
      setHistory(newHistory);
      if (newRankData.index > oldRankIdx) setLevelUpData({newRank:newRankData, earned, newXp});
      if (newHistory.length % 5 === 0) {
        const last5 = newHistory.slice(-5);
        setMilestoneLoading(true);
        const buildMilestone = (ins) => {
          const ct = {};
          last5.forEach(h=>{ if(!ct[h.cat]) ct[h.cat]={t:0,n:0}; ct[h.cat].t+=h.score; ct[h.cat].n++; });
          const sorted = Object.entries(ct).map(([cat,{t,n}])=>({cat,avg:Math.round(t/n)})).sort((a,b)=>a.avg-b.avg);
          setMilestoneData({
            scores: last5.map(h=>h.score),
            insight: ins?.insight || `¡Buen trabajo, ${playerName}! Sigue practicando.`,
            weakCat: sorted[0]?.cat, strongCat: sorted[sorted.length-1]?.cat,
            xpEarned: last5.reduce((a,h)=>a+(h.xpEarned||0),0), total: newHistory.length,
          });
          setMilestoneLoading(false);
        };
        generateSessionInsight(playerName, last5).then(buildMilestone).catch(()=>buildMilestone(null));
      }
      setView("result");
    } catch {
      setEval({verdict:"ERROR",score:0,headline:"Error de conexión",reasoning:"No se pudo analizar. Intenta de nuevo.",better_play:"—",lesson:"—"});
      setView("result");
    }
  };

  const next = async () => {
    const ni = idx+1; setSelAction(null); setEval(null);
    if (milestoneData) { setView("milestone"); return; }
    if (ni >= allScenarios.length) {
      setView("generating");
      try { const s = await generateScenario(mode, aiList.length+1); setAiList(p=>[...p,s]); setIdx(ni); setView("play"); }
      catch { setIdx(0); setView("play"); }
    } else { setIdx(ni); setView("play"); }
  };

  // ── DUEL ACTIONS ───────────────────────────────────────────────────────────
  const startDuel = async () => {
    setView("generating");
    try {
      const hand = await generateDuelHand(duelProfile);
      setDuelHand(hand); setDuelStreet("flop");
      setDuelPot(hand.startingPot||30); setDuelStack(hand.startingStack||970);
      setDuelHeroActions([]); setDuelVillainAction(null); setDuelEval(null);
      setView("duel_play");
    } catch { setView("duel_setup"); }
  };

  const duelHeroAction = async (action) => {
    const newActions = [...duelHeroActions,{street:duelStreet,...action}];
    setDuelHeroActions(newActions);
    let newPot = duelPot + (action.amount||0);
    let newStack = duelStack - (action.amount||0);
    setView("duel_villain");
    try {
      const va = await getDuelVillainAction(duelHand, duelStreet, newActions, newPot, newStack, duelProfile);
      setDuelVillainAction(va);
      newPot += (va.amount||0);
      setDuelPot(newPot); setDuelStack(newStack);
      if(action.id==="fold"){ setDuelResult("El oponente gana el pot — te retiraste"); endDuel(newActions,"Te retiraste — el oponente gana el pot"); return; }
      if(va.action==="fold"){ setDuelResult("¡Ganaste el pot! — el oponente se retiró"); endDuel(newActions,"¡Ganaste el pot! El oponente se retiró"); return; }
      const nextStreet = duelStreet==="flop"?"turn":duelStreet==="turn"?"river":"showdown";
      setDuelStreet(nextStreet);
      if(nextStreet==="showdown") { endDuel(newActions,"Llegaron al showdown"); }
      else setView("duel_play");
    } catch { setView("duel_play"); }
  };

  const endDuel = async (actions, result) => {
    setDuelResult(result); setView("duel_eval");
    try {
      const ev = await evaluateDuelLine(duelHand, actions, result, duelProfile);
      setDuelEval(ev);
      setHistory(h=>[...h,{title:`Duelo vs ${VILLAIN_PROFILES[duelProfile].label}`,score:ev.score||0,verdict:ev.verdict,lesson:ev.lesson,cat:"duel",mode:"duel",xpEarned:0}]);
    } catch { setDuelEval({verdict:"ERROR",score:0,headline:"Error de análisis",line_analysis:"No se pudo evaluar.",key_mistake:"—",lesson:"—"}); }
  };

  // ── NAV HELPERS ────────────────────────────────────────────────────────────
  const openGlossary = () => { setPrevView(view); setView("glossary"); };
  const closeGlossary = () => setView(prevView);
  const openHistory = () => { setPrevView(view); setView("history"); };
  const closeHistory = () => setView(prevView);

  // ── DERIVED UI ─────────────────────────────────────────────────────────────
  const vc       = eval_ ? (VC[eval_.verdict]||VC["ERROR"]) : null;
  const dvc      = duelEval ? (VC[duelEval.verdict]||VC["ERROR"]) : null;
  const scMode   = scenario?.mode||mode;
  const sc       = DC[scMode]||DC.intermediate;
  const isInCurated = idx<curated.length;
  const CAT_LABELS  = {value:"💰 Value",bluff:"🎭 Bluff",draw:"🎯 Draw",preflop:"🃏 Preflop",position:"📍 Posición",duel:"⚔️ Duelo"};
  const CAT_COLORS  = {value:"#4ade80",bluff:"#fb923c",draw:"#60a5fa",preflop:"#c084fc",position:"#facc15",duel:"#e879f9"};

  const Styles = () => <style>{`
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes hexPop{0%{transform:scale(0.2);opacity:0}65%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(720deg);opacity:0}}
    *{-webkit-tap-highlight-color:transparent}
  `}</style>;

  const ThemeBtn = () => (
    <button onClick={toggleTheme} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"7px 10px",cursor:"pointer",fontSize:15,lineHeight:1,WebkitTapHighlightColor:"transparent"}}>{isDark?"☀️":"🌙"}</button>
  );

  const Nav = ({onBack,backLabel="← Menú",right}) => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px",flexShrink:0}}>
      <button onClick={onBack} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"8px 14px",color:G.muted,cursor:"pointer",fontFamily:G.font,fontSize:13,fontWeight:600}}>{backLabel}</button>
      <div style={{display:"flex",alignItems:"center",gap:8}}>{right}</div>
    </div>
  );

  const Pill = ({label,color,bg,border}) => (
    <span style={{background:bg||"rgba(255,255,255,0.06)",border:`1px solid ${border||G.border}`,borderRadius:20,padding:"3px 10px",color:color||G.muted,fontSize:11,fontWeight:700}}>{label}</span>
  );

  const IB = ({label,children,accent,last}) => (
    <div style={{background:G.surface,border:`1px solid ${accent?`${G.orange}30`:G.border}`,borderRadius:12,padding:"13px 14px",marginBottom:last?0:8}}>
      <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{label}</div>
      {children}
    </div>
  );

  const pg = {minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text,WebkitFontSmoothing:"antialiased",transition:"background .25s,color .25s"};

  // ══════════════════════════════════════════════════════════════════════════
  // ── WELCOME ──────────────────────────────────────────────────────────────
  if(view==="welcome") return (
    <div style={{...pg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Styles/>
      <div style={{width:"100%",maxWidth:340,padding:"0 20px",textAlign:"center",animation:"fadeIn .4s ease"}}>
        <div style={{width:64,height:64,margin:"0 auto 18px",background:"linear-gradient(145deg,#1e1a12,#2a2416)",border:`2px solid ${G.orange}50`,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>🃏</div>
        <h1 style={{margin:"0 0 4px",fontSize:26,fontWeight:900,letterSpacing:-.5}}>Poker Trainer</h1>
        <p style={{margin:"0 0 36px",color:G.muted,fontSize:12,letterSpacing:2.5}}>TEXAS HOLD'EM</p>
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:16,padding:"22px 18px",marginBottom:12}}>
          <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:14,textAlign:"center"}}>¿CÓMO TE LLAMAS?</div>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&nameInput.trim()&&(localStorage.setItem('pt_name',nameInput.trim()),setPlayerName(nameInput.trim()),setView("menu"))}
            placeholder="Escribe tu nombre..." autoFocus
            style={{width:"100%",background:G.inputBg||G.bg,border:`1px solid ${G.borderMid}`,borderRadius:10,padding:"13px 16px",color:G.text,fontSize:16,fontFamily:G.font,outline:"none",boxSizing:"border-box",textAlign:"center"}}
          />
        </div>
        <button onClick={()=>{if(nameInput.trim()){localStorage.setItem('pt_name',nameInput.trim());setPlayerName(nameInput.trim());setView("menu");}}}
          disabled={!nameInput.trim()}
          style={{width:"100%",padding:"15px",background:nameInput.trim()?G.orange:"rgba(255,145,77,0.25)",border:"none",borderRadius:13,color:"#0a0a0f",fontSize:15,fontWeight:800,cursor:nameInput.trim()?"pointer":"default",fontFamily:G.font,marginBottom:16,transition:"background .2s"}}>
          Empezar a jugar →
        </button>
        <div style={{display:"flex",justifyContent:"center"}}><ThemeBtn/></div>
      </div>
    </div>
  );

  // ── LEVEL UP ─────────────────────────────────────────────────────────────
  if(levelUpData) {
    const {newRank, earned, newXp} = levelUpData;
    const confColors = ["#4ade80","#facc15","#fb923c","#e879f9","#60a5fa","#FF914D"];
    return (
      <div style={{...pg,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Styles/>
        <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
          {Array(22).fill(0).map((_,i)=>(
            <div key={i} style={{position:"absolute",left:`${5+Math.random()*90}%`,top:-15,width:7,height:7,borderRadius:"50%",background:confColors[i%confColors.length],animation:`confettiFall ${1.8+Math.random()*1.5}s ease-in ${Math.random()*1.2}s forwards`}}/>
          ))}
        </div>
        <div style={{maxWidth:480,margin:"0 auto",padding:"0 24px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",animation:"fadeIn .4s ease",position:"relative",zIndex:1}}>
          <div style={{color:G.muted,fontSize:11,fontWeight:700,letterSpacing:3,marginBottom:20}}>¡NUEVO NIVEL!</div>
          <div style={{marginBottom:20,animation:"hexPop .7s cubic-bezier(.175,.885,.32,1.275) forwards"}}>
            <svg viewBox="0 0 130 130" width="130" height="130">
              <polygon points="65,5 118,35 118,95 65,125 12,95 12,35" fill={`${newRank.color}18`} stroke={newRank.color} strokeWidth="2.5"/>
              <text x="65" y="60" textAnchor="middle" dominantBaseline="central" fill={newRank.color} fontSize="34" fontWeight="900">{newRank.icon}</text>
              <text x="65" y="92" textAnchor="middle" dominantBaseline="central" fill={newRank.color} fontSize="11" fontWeight="800" letterSpacing="1">{newRank.name.toUpperCase()}</text>
            </svg>
          </div>
          <h2 style={{margin:"0 0 4px",fontSize:28,fontWeight:900,color:newRank.color}}>¡{newRank.name}!</h2>
          <p style={{margin:"0 0 24px",color:G.muted,fontSize:14}}>Nivel desbloqueado, {playerName}</p>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${newRank.color}15`,border:`1px solid ${newRank.color}40`,borderRadius:20,padding:"8px 18px",marginBottom:28}}>
            <span style={{color:newRank.color,fontWeight:800,fontSize:18}}>+{earned} XP</span>
          </div>
          <div style={{width:"100%",maxWidth:300,marginBottom:32}}>
            <XPBar xp={newXp} showLabel/>
          </div>
          <button onClick={()=>{setLevelUpData(null); if(milestoneData) setView("milestone");}}
            style={{width:"100%",maxWidth:300,padding:"15px",background:newRank.color,border:"none",borderRadius:13,color:"#0a0a0f",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:G.font}}>
            ¡Seguir jugando! →
          </button>
        </div>
      </div>
    );
  }

  // ── MILESTONE (every 5 hands) ─────────────────────────────────────────────
  if(view==="milestone" && milestoneData) {
    const {scores, insight, weakCat, strongCat, xpEarned, total} = milestoneData;
    const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
    const avgCol = avg>=75?"#4ade80":avg>=55?"#facc15":"#fb923c";
    return (
      <div style={pg}>
        <Styles/>
        <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 48px",animation:"fadeIn .3s ease"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{color:G.muted,fontSize:11,fontWeight:700,letterSpacing:3,marginBottom:6}}>RONDA COMPLETADA</div>
            <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:900}}>¡Bien jugado, {playerName}!</h2>
            <p style={{margin:0,color:G.muted,fontSize:13}}>{total} manos totales</p>
          </div>
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:16,padding:"16px",marginBottom:10}}>
            <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:12}}>ÚLTIMAS 5 MANOS</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80,marginBottom:8}}>
              {scores.map((s,i)=>{
                const col=s>=80?"#4ade80":s>=60?"#facc15":"#fb923c";
                return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",background:col,borderRadius:"4px 4px 2px 2px",height:`${(s/100)*72}px`,minHeight:4,transition:"height 1s ease"}}/>
                  <span style={{color:G.muted,fontSize:10,fontWeight:700}}>{s}</span>
                </div>;
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-around",borderTop:`1px solid ${G.border}`,paddingTop:10}}>
              <div style={{textAlign:"center"}}><div style={{color:avgCol,fontSize:22,fontWeight:900}}>{avg}</div><div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1,marginTop:2}}>PROMEDIO</div></div>
              <div style={{textAlign:"center"}}><div style={{color:G.orange,fontSize:22,fontWeight:900}}>+{xpEarned}</div><div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1,marginTop:2}}>XP GANADO</div></div>
              <div style={{textAlign:"center"}}><div style={{color:rank.color,fontSize:18,fontWeight:900}}>{rank.icon}</div><div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1,marginTop:2}}>{rank.name.toUpperCase()}</div></div>
            </div>
          </div>
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"13px 14px",marginBottom:10}}>
            <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>PROGRESO DE NIVEL</div>
            <XPBar xp={xp} showLabel/>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{flex:1,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:12,padding:"12px"}}>
              <div style={{color:"#4ade80",fontSize:9,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>PUNTO FUERTE</div>
              <div style={{color:G.text,fontSize:13,fontWeight:700}}>{CAT_LABELS[strongCat]||"—"}</div>
            </div>
            <div style={{flex:1,background:"rgba(251,146,60,0.06)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:12,padding:"12px"}}>
              <div style={{color:"#fb923c",fontSize:9,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>A MEJORAR</div>
              <div style={{color:G.text,fontSize:13,fontWeight:700}}>{CAT_LABELS[weakCat]||"—"}</div>
            </div>
          </div>
          <div style={{background:`${G.orange}08`,border:`1px solid ${G.orange}25`,borderRadius:12,padding:"13px 14px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:8,background:`${G.orange}20`,border:`1px solid ${G.orange}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🧠</div>
            <div>
              <div style={{color:G.orange,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>ANÁLISIS DE TU JUEGO</div>
              {milestoneLoading
                ? <div style={{color:G.muted,fontSize:13,animation:"pulse 1.2s ease-in-out infinite"}}>Analizando tu sesión...</div>
                : <ParsedText text={insight} style={{color:"#d4c8b8",fontSize:13,lineHeight:1.65}}/>
              }
            </div>
          </div>
          <button onClick={()=>{ setMilestoneData(null); setView("play"); }}
            style={{width:"100%",padding:"15px",background:G.orange,border:"none",borderRadius:13,color:"#0a0a0f",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:G.font}}>
            Seguir entrenando →
          </button>
        </div>
      </div>
    );
  }


  // ── MENU ───────────────────────────────────────────────────────────────────
  if(view==="menu") return (
    <div style={pg}>
      <Styles/>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px 48px"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"28px 0 12px"}}>
          <div>
            <h1 style={{margin:"0 0 3px",fontSize:20,fontWeight:900}}>Hola, {playerName} 👋</h1>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{color:rank.color,fontSize:12,fontWeight:700}}>{rank.icon} {rank.name}</span>
              <span style={{color:G.muted,fontSize:12}}>· {xp} XP</span>
              {streak>=3&&<span style={{background:"rgba(251,146,60,0.15)",border:"1px solid rgba(251,146,60,0.3)",borderRadius:10,padding:"1px 7px",color:"#fb923c",fontSize:10,fontWeight:700}}>🔥 {streak}</span>}
            </div>
          </div>
          <ThemeBtn/>
        </div>

        {/* XP Bar */}
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"13px 14px",marginBottom:14}}>
          <XPBar xp={xp} showLabel/>
        </div>

        {/* Mode selector */}
        <div style={{marginBottom:10}}>
          <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>MODO ENTRENAMIENTO</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(DC).filter(([k])=>k!=="duel").map(([key,c])=>{
              const dots=key==="beginner"?1:key==="intermediate"?2:key==="advanced"?3:null;
              return(
                <button key={key} onClick={()=>startMode(key)} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"15px 16px",cursor:"pointer",textAlign:"left",fontFamily:G.font,display:"flex",alignItems:"center",gap:14,transition:"all 0.1s",WebkitTapHighlightColor:"transparent"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=c.bg;e.currentTarget.style.borderColor=c.border;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=G.surface;e.currentTarget.style.borderColor=G.border;}}>
                  <div style={{width:40,height:40,borderRadius:10,background:c.bg,border:`1px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {dots?<div style={{display:"flex",flexDirection:"column",gap:2.5,alignItems:"center"}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:i<dots?c.text:`${c.text}18`,display:"block"}}/>)}</div>:<span style={{fontSize:14}}>🎲</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:G.text,fontWeight:700,fontSize:15,marginBottom:2}}>{c.label}</div>
                    <div style={{color:G.muted,fontSize:12,lineHeight:1.4}}>
                      {key==="beginner"&&"Fundamentos — situaciones básicas y claras"}
                      {key==="intermediate"&&"Estrategia — razonamiento situacional"}
                      {key==="advanced"&&"Conceptos complejos — decisiones difíciles"}
                      {key==="random"&&"Mezcla de todo — cualquier dificultad"}
                    </div>
                  </div>
                  <div style={{color:c.text,opacity:0.4,fontSize:16}}>›</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duel mode */}
        <div style={{marginBottom:12}}>
          <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>MODO DUELO</div>
          <button onClick={()=>setView("duel_setup")} style={{width:"100%",background:"#1a0a28",border:`1px solid ${DC.duel.border}`,borderRadius:14,padding:"15px 16px",cursor:"pointer",textAlign:"left",fontFamily:G.font,display:"flex",alignItems:"center",gap:14,WebkitTapHighlightColor:"transparent"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#220e34";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#1a0a28";}}>
            <div style={{width:40,height:40,borderRadius:10,background:DC.duel.bg,border:`1px solid ${DC.duel.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>⚔️</div>
            <div style={{flex:1}}>
              <div style={{color:G.text,fontWeight:700,fontSize:15,marginBottom:2}}>Duelo vs IA</div>
              <div style={{color:G.muted,fontSize:12,lineHeight:1.4}}>Mano completa: Flop → Turn → River contra un oponente con personalidad</div>
            </div>
            <div style={{color:DC.duel.text,opacity:0.4,fontSize:16}}>›</div>
          </button>
        </div>

        {/* Bottom actions */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={openGlossary} style={{flex:1,padding:"11px",background:"transparent",border:`1px solid ${G.border}`,borderRadius:12,color:G.muted,fontSize:13,cursor:"pointer",fontFamily:G.font}}>📖 Glosario</button>
          {history.length>0&&<button onClick={openHistory} style={{flex:1,padding:"11px",background:"transparent",border:`1px solid ${G.border}`,borderRadius:12,color:G.muted,fontSize:13,cursor:"pointer",fontFamily:G.font}}>📊 Mi Sesión</button>}
        </div>

        <div style={{background:`${G.orange}0a`,border:`1px solid ${G.orange}20`,borderRadius:10,padding:"10px 13px"}}>
          <p style={{color:G.muted,fontSize:12,margin:0,lineHeight:1.6}}>Los términos en <span style={{color:G.orange,fontWeight:600}}>naranja</span> son clickeables — tócalos para ver su definición.</p>
        </div>
      </div>
    </div>
  );

  if(view==="glossary") return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px 48px"}}>
        <div style={{position:"sticky",top:0,background:G.bg,paddingTop:14,paddingBottom:10,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={closeGlossary} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"9px 14px",color:G.text,cursor:"pointer",fontFamily:G.font,fontSize:14,fontWeight:600}}>←</button>
            <h2 style={{margin:0,fontSize:17,fontWeight:700}}>Glosario de Poker</h2>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {GLOSSARY.map((it,i)=>(
            <div key={i} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{color:G.orange,fontWeight:700,fontSize:14,marginBottom:3}}>{it.term}</div>
              <div style={{color:"#b8b0a4",fontSize:13,lineHeight:1.6}}>{it.def}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── HISTORY / SESSION ─────────────────────────────────────────────────────
  if(view==="history") {
    const catStats = {};
    history.forEach(h=>{
      if(!catStats[h.cat]) catStats[h.cat]={total:0,count:0};
      catStats[h.cat].total+=h.score; catStats[h.cat].count++;
    });
    const worst = Object.entries(catStats).sort((a,b)=>(a[1].total/a[1].count)-(b[1].total/b[1].count))[0];
    const best  = Object.entries(catStats).sort((a,b)=>(b[1].total/b[1].count)-(a[1].total/a[1].count))[0];
    return(
      <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px 48px"}}>
          <div style={{position:"sticky",top:0,background:G.bg,paddingTop:14,paddingBottom:10,zIndex:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <button onClick={closeHistory} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"9px 14px",color:G.text,cursor:"pointer",fontFamily:G.font,fontSize:14,fontWeight:600}}>←</button>
                <h2 style={{margin:0,fontSize:17,fontWeight:700}}>Resumen de Sesión</h2>
              </div>
              <Pill label={`${history.length} manos`} />
            </div>
          </div>

          {/* Score overview */}
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:16,padding:"20px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:20}}>
            <ScoreRing score={avgScore} size={72}/>
            <div>
              <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>SCORE PROMEDIO</div>
              <div style={{color:G.text,fontSize:22,fontWeight:800,marginBottom:2}}>{avgScore} / 100</div>
              <div style={{color:G.muted,fontSize:13}}>{avgScore>=80?"Excelente sesión 🏆":avgScore>=65?"Buen progreso ✓":avgScore>=50?"Sigue practicando ⚠️":"Mucho por mejorar — sigue adelante"}</div>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
            <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:12}}>RENDIMIENTO POR CATEGORÍA</div>
            {Object.entries(catStats).map(([cat,{total,count}])=>{
              const avg=Math.round(total/count), col=CAT_COLORS[cat]||G.orange;
              return(
                <div key={cat} style={{marginBottom:12,lastChild:{marginBottom:0}}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <span style={{color:G.text,fontSize:13,fontWeight:600}}>{CAT_LABELS[cat]||cat}</span>
                    <span style={{color:col,fontSize:13,fontWeight:700}}>{avg}/100 <span style={{color:G.muted,fontWeight:400}}>({count} {count===1?"mano":"manos"})</span></span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${avg}%`,background:col,borderRadius:3,transition:"width 0.6s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insights */}
          {(best||worst)&&(
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {best&&<div style={{flex:1,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:12,padding:"12px 13px"}}>
                <div style={{color:"#4ade80",fontSize:10,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>MEJOR ÁREA</div>
                <div style={{color:G.text,fontSize:13,fontWeight:600}}>{CAT_LABELS[best[0]]||best[0]}</div>
                <div style={{color:G.muted,fontSize:12}}>{Math.round(best[1].total/best[1].count)}/100</div>
              </div>}
              {worst&&<div style={{flex:1,background:"rgba(251,146,60,0.06)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:12,padding:"12px 13px"}}>
                <div style={{color:"#fb923c",fontSize:10,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>A MEJORAR</div>
                <div style={{color:G.text,fontSize:13,fontWeight:600}}>{CAT_LABELS[worst[0]]||worst[0]}</div>
                <div style={{color:G.muted,fontSize:12}}>{Math.round(worst[1].total/worst[1].count)}/100</div>
              </div>}
            </div>
          )}

          {/* Hand list */}
          <div style={{marginBottom:0}}>
            <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>HISTORIAL DE MANOS</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...history].reverse().map((h,i)=>{
                const v=VC[h.verdict]||VC["ERROR"], col=CAT_COLORS[h.cat]||G.orange;
                return(
                  <div key={i} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:22,height:22,borderRadius:6,background:v.c,display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0f",fontSize:11,fontWeight:900,flexShrink:0}}>{v.icon}</div>
                        <span style={{color:G.text,fontSize:13,fontWeight:600}}>{h.title}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{background:`${col}15`,border:`1px solid ${col}40`,borderRadius:8,padding:"2px 7px",color:col,fontSize:10,fontWeight:700}}>{CAT_LABELS[h.cat]||h.cat}</span>
                        <span style={{color:v.c,fontSize:14,fontWeight:800,minWidth:28,textAlign:"right"}}>{h.score}</span>
                      </div>
                    </div>
                    {h.lesson&&<div style={{color:G.muted,fontSize:12,lineHeight:1.5,paddingLeft:30}}>{h.lesson}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GENERATING ────────────────────────────────────────────────────────────
  if(view==="generating") return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <Styles/>
      <div style={{width:60,height:60,borderRadius:18,background:G.surface,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,animation:"spin 2s linear infinite"}}>🎲</div>
      <div style={{textAlign:"center"}}>
        <div style={{color:G.text,fontSize:16,fontWeight:700,marginBottom:4}}>Generando nueva mano...</div>
        <div style={{color:G.muted,fontSize:13}}>La IA está creando un escenario único</div>
      </div>
    </div>
  );

  // ── DUEL SETUP ────────────────────────────────────────────────────────────
  if(view==="duel_setup") return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px 48px"}}>
        <Nav onBack={()=>setView("menu")} />
        <div style={{padding:"8px 0 24px"}}>
          <div style={{width:44,height:44,borderRadius:12,background:DC.duel.bg,border:`1px solid ${DC.duel.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:12}}>⚔️</div>
          <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>Modo Duelo</h2>
          <p style={{margin:0,color:G.muted,fontSize:14,lineHeight:1.5}}>Juega una mano completa contra una IA con personalidad propia. Flop, Turn y River en la misma mano.</p>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>ELIGE EL PERFIL DE TU OPONENTE</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(VILLAIN_PROFILES).map(([key,p])=>(
              <button key={key} onClick={()=>setDuelProfile(key)} style={{background:duelProfile===key?"rgba(232,121,249,0.1)":G.surface,border:`1px solid ${duelProfile===key?DC.duel.border:G.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",fontFamily:G.font,display:"flex",alignItems:"center",gap:12,WebkitTapHighlightColor:"transparent"}}>
                <div style={{width:36,height:36,borderRadius:10,background:duelProfile===key?"rgba(232,121,249,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${duelProfile===key?DC.duel.border:G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                  {key==="aggressive"?"🔥":key==="balanced"?"⚖️":"🧊"}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span style={{color:G.text,fontWeight:700,fontSize:14}}>{p.label}</span>
                    {duelProfile===key&&<span style={{background:DC.duel.bg,border:`1px solid ${DC.duel.border}`,borderRadius:8,padding:"1px 7px",color:DC.duel.text,fontSize:10,fontWeight:700}}>SELECCIONADO</span>}
                  </div>
                  <div style={{color:G.muted,fontSize:13}}>{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={startDuel} style={{width:"100%",padding:"15px",background:DC.duel.text,border:"none",borderRadius:14,color:"#0a0a0f",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:G.font,WebkitTapHighlightColor:"transparent"}}>
          Comenzar Duelo →
        </button>
      </div>
    </div>
  );

  // ── DUEL PLAY ─────────────────────────────────────────────────────────────
  if((view==="duel_play"||view==="duel_villain")&&duelHand) {
    const board = duelStreet==="flop"?duelHand.flop:duelStreet==="turn"?[...duelHand.flop,duelHand.turn]:[...duelHand.flop,duelHand.turn,duelHand.river];
    const streetLabel = duelStreet==="flop"?"Flop":duelStreet==="turn"?"Turn":duelStreet==="river"?"River":"Showdown";
    const duelActions = [
      {id:"check",label:"Pasar (Check)",desc:"No apuestas, pasas la acción",icon:"✋"},
      {id:"bet_s",label:"Apostar 33%",desc:`$${Math.round(duelPot*0.33)} — apuesta pequeña`,icon:"💰",amount:Math.round(duelPot*0.33)},
      {id:"bet_m",label:"Apostar 66%",desc:`$${Math.round(duelPot*0.66)} — apuesta estándar`,icon:"💰💰",amount:Math.round(duelPot*0.66)},
      {id:"bet_b",label:"Apostar pot",desc:`$${duelPot} — apuesta grande`,icon:"🔥",amount:duelPot},
      {id:"fold",label:"Retirarse (Fold)",desc:"Te retiras de la mano",icon:"🗑️"},
    ];
    return(
      <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text,WebkitFontSmoothing:"antialiased"}}>
        <Styles/>
        <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <Nav onBack={()=>setView("menu")} right={<DiffBadge mode="duel" small/>}/>
          <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px"}}>
            {/* Header */}
            <div style={{background:G.surface,border:`1px solid ${DC.duel.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{color:G.text,fontWeight:700,fontSize:16,marginBottom:2}}>Duelo vs IA</div>
                  <div style={{color:G.muted,fontSize:12}}>{VILLAIN_PROFILES[duelProfile].label} — {VILLAIN_PROFILES[duelProfile].desc}</div>
                </div>
                <Pill label={streetLabel} color={DC.duel.text} bg={DC.duel.bg} border={DC.duel.border}/>
              </div>
              <div style={{display:"flex",borderTop:`1px solid ${G.border}`,paddingTop:10,gap:0}}>
                {[["BOTE",`$${duelPot}`],["TU STACK",`$${duelStack}`],["POSICIÓN","BTN"]].map(([l,v],i)=>(
                  <div key={l} style={{flex:1,textAlign:"center",borderRight:i<2?`1px solid ${G.border}`:"none"}}>
                    <div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1.2,marginBottom:3}}>{l}</div>
                    <div style={{color:i===0?G.orange:G.text,fontSize:13,fontWeight:700}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Street progress */}
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {["flop","turn","river"].map(s=>{
                const done=["flop","turn","river"].indexOf(s)<["flop","turn","river"].indexOf(duelStreet);
                const active=s===duelStreet;
                return <div key={s} style={{flex:1,height:3,borderRadius:2,background:done?"#e879f9":active?"#e879f9":G.faint,opacity:done?0.4:1,transition:"all 0.3s"}}/>;
              })}
            </div>
            {/* Cards */}
            <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>TUS CARTAS</div><div style={{display:"flex",gap:6}}>{duelHand.holeCards.map((c,i)=><Card key={i} card={c}/>)}</div></div>
                <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>MESA ({streetLabel.toUpperCase()})</div><div style={{display:"flex",gap:6}}>{board.map((c,i)=><Card key={i} card={c}/>)}{Array(5-board.length).fill(null).map((_,i)=><Card key={`e${i}`} card={null}/>)}</div></div>
                <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>OPONENTE</div><div style={{display:"flex",gap:6}}><Card hidden/><Card hidden/></div></div>
              </div>
            </div>
            {/* Context (only in flop) */}
            {duelStreet==="flop"&&(
              <div style={{background:`${DC.duel.text}08`,border:`1px solid ${DC.duel.border}40`,borderRadius:12,padding:"11px 13px",marginBottom:10}}>
                <div style={{color:DC.duel.text,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5,opacity:0.8}}>SETUP DE LA MANO</div>
                <p style={{color:"#c8bfb0",fontSize:13,margin:0,lineHeight:1.6}}>{duelHand.context}</p>
              </div>
            )}
            {/* Previous actions */}
            {duelHeroActions.length>0&&(
              <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"11px 13px",marginBottom:10}}>
                <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>LÍNEA DE JUEGO</div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {duelHeroActions.map((a,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                      <span style={{color:G.muted}}>{a.street==="flop"?"Flop":a.street==="turn"?"Turn":"River"}</span>
                      <span style={{color:G.text,fontWeight:600}}>{a.label}{a.amount?` ($${a.amount})`:""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Villain action (while waiting) */}
            {view==="duel_villain"&&!duelVillainAction&&(
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{width:44,height:44,margin:"0 auto 10px",borderRadius:12,background:G.surface,border:`1px solid ${DC.duel.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,animation:"pulse 1.2s ease-in-out infinite"}}>🤔</div>
                <div style={{color:G.text,fontSize:14,fontWeight:600}}>El oponente está pensando...</div>
              </div>
            )}
            {/* Actions */}
            {view==="duel_play"&&(
              <div>
                <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>¿QUÉ DECIDES EN EL {streetLabel.toUpperCase()}?</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {duelActions.map(a=>(
                    <button key={a.id} onClick={()=>duelHeroAction(a)} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:13,padding:"13px 15px",cursor:"pointer",textAlign:"left",fontFamily:G.font,WebkitTapHighlightColor:"transparent"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=DC.duel.bg;e.currentTarget.style.borderColor=DC.duel.border;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=G.surface;e.currentTarget.style.borderColor=G.border;}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <span style={{fontSize:16}}>{a.icon}</span>
                          <span style={{color:G.text,fontWeight:700,fontSize:14}}>{a.label}</span>
                        </div>
                        {a.amount&&<span style={{background:`${DC.duel.text}15`,border:`1px solid ${DC.duel.border}`,borderRadius:8,padding:"2px 8px",color:DC.duel.text,fontSize:12,fontWeight:700}}>${a.amount}</span>}
                      </div>
                      <div style={{color:G.muted,fontSize:12,marginTop:4,paddingLeft:25}}>{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DUEL EVAL ────────────────────────────────────────────────────────────
  if(view==="duel_eval"&&duelHand) {
    return(
      <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text}}>
        <Styles/>
        <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <Nav onBack={()=>setView("menu")} right={<DiffBadge mode="duel" small/>}/>
          <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px",animation:"fadeIn 0.25s ease"}}>
            {/* Reveal cards */}
            <div style={{background:G.surface,border:`1px solid ${DC.duel.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{color:DC.duel.text,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>SHOWDOWN — CARTAS REVELADAS</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>TUS CARTAS</div><div style={{display:"flex",gap:6}}>{duelHand.holeCards.map((c,i)=><Card key={i} card={c}/>)}</div></div>
                <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>CARTAS DEL RIVAL</div><div style={{display:"flex",gap:6}}>{duelHand.villainCards.map((c,i)=><Card key={i} card={c}/>)}</div></div>
                <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>BOARD</div><div style={{display:"flex",gap:6}}>{[...duelHand.flop,duelHand.turn,duelHand.river].map((c,i)=><Card key={i} card={c} sm/>)}</div></div>
              </div>
            </div>
            {/* Result */}
            <div style={{background:`${DC.duel.text}0a`,border:`1px solid ${DC.duel.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10,textAlign:"center"}}>
              <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>RESULTADO</div>
              <div style={{color:DC.duel.text,fontSize:15,fontWeight:700}}>{duelResult}</div>
            </div>
            {/* Your line */}
            <IB label="TU LÍNEA DE JUEGO">
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {duelHeroActions.map((a,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <span style={{color:G.muted}}>{a.street==="flop"?"Flop":a.street==="turn"?"Turn":"River"}</span>
                    <span style={{color:G.orange,fontWeight:600}}>{a.label}{a.amount?` ($${a.amount})`:""}</span>
                  </div>
                ))}
              </div>
            </IB>
            {/* Eval */}
            {!duelEval&&(
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{width:48,height:48,margin:"0 auto 12px",borderRadius:14,background:G.surface,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,animation:"pulse 1.2s ease-in-out infinite"}}>🧠</div>
                <div style={{color:G.text,fontSize:14,fontWeight:600}}>Analizando tu línea completa...</div>
              </div>
            )}
            {duelEval&&dvc&&(
              <div style={{animation:"fadeIn 0.3s ease"}}>
                <div style={{background:dvc.bg,border:`1px solid ${dvc.c}30`,borderRadius:14,padding:"16px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>EVALUACIÓN DE LA LÍNEA</div>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <div style={{width:24,height:24,borderRadius:7,background:dvc.c,display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0f",fontSize:13,fontWeight:900}}>{dvc.icon}</div>
                      <span style={{color:dvc.c,fontSize:15,fontWeight:800}}>{duelEval.verdict}</span>
                    </div>
                    <div style={{color:"#c8bfb0",fontSize:13}}>{duelEval.headline}</div>
                  </div>
                  <ScoreRing score={duelEval.score} size={60}/>
                </div>
                <IB label="ANÁLISIS DE LA LÍNEA"><p style={{color:"#c8bfb0",fontSize:14,margin:0,lineHeight:1.7}}>{duelEval.line_analysis}</p></IB>
                <IB label="ERROR CLAVE"><p style={{color:"#c8bfb0",fontSize:14,margin:0,lineHeight:1.7}}>{duelEval.key_mistake}</p></IB>
                <div style={{background:`${G.orange}08`,border:`1px solid ${G.orange}25`,borderRadius:12,padding:"12px 13px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:26,height:26,borderRadius:7,background:`${G.orange}20`,border:`1px solid ${G.orange}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>💡</div>
                  <div><div style={{color:G.orange,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>LECCIÓN</div><p style={{color:"#d4c8b8",fontSize:13,margin:0,fontWeight:500,lineHeight:1.6}}>{duelEval.lesson}</p></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setView("duel_setup")} style={{flex:1,padding:"14px",background:G.surface,border:`1px solid ${DC.duel.border}`,borderRadius:13,color:DC.duel.text,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:G.font}}>Nuevo Duelo</button>
                  <button onClick={()=>setView("menu")} style={{flex:1,padding:"14px",background:DC.duel.text,border:"none",borderRadius:13,color:"#0a0a0f",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:G.font}}>Menú →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── TRAINING PLAY / EVALUATING / RESULT ───────────────────────────────────
  if(!scenario) return null;
  const progressLabel = isInCurated ? `${idx+1}/${curated.length}` : `IA #${idx-curated.length+1}`;

  return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:G.text,WebkitFontSmoothing:"antialiased"}}>
      <Styles/>
      <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <Nav
          onBack={()=>setView("menu")}
          right={<>
            {history.length>0&&<div style={{textAlign:"center"}}><div style={{color:avgScore>=75?"#4ade80":avgScore>=55?"#facc15":"#fb923c",fontSize:15,fontWeight:800,lineHeight:1}}>{avgScore}</div><div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1}}>AVG</div></div>}
            <button onClick={openHistory} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"7px 11px",color:G.muted,cursor:"pointer",fontFamily:G.font,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}>📊</button>
            <button onClick={openGlossary} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"7px 11px",color:G.muted,cursor:"pointer",fontFamily:G.font,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}>📖</button><ThemeBtn/>
          </>}
        />
        <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px",animation:"fadeIn 0.2s ease"}}>
          {/* Header card */}
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 16px",marginBottom:9}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,lineHeight:1.3}}>{scenario.title}</h2>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <DiffBadge mode={scMode} small/>
                <span style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:0.5}}>{isInCurated?"📚":"♾️"} {progressLabel}</span>
              </div>
            </div>
            <div style={{display:"flex",borderTop:`1px solid ${G.border}`,paddingTop:10}}>
              {[["POS",scenario.position],["RONDA",scenario.street?.toUpperCase()],["BOTE",`$${scenario.pot}`],["STACK",`$${scenario.stack}`]].map(([l,v],i)=>(
                <div key={l} style={{flex:1,textAlign:"center",borderRight:i<3?`1px solid ${G.border}`:"none"}}>
                  <div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1,marginBottom:2}}>{l}</div>
                  <div style={{color:l==="BOTE"?G.orange:G.text,fontSize:12,fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Cards */}
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"13px 15px",marginBottom:9}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>TUS CARTAS</div><div style={{display:"flex",gap:6}}>{scenario.holeCards?.map((c,i)=><Card key={i} card={c}/>)}</div></div>
              {scenario.board?.length>0&&<div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>MESA</div><div style={{display:"flex",gap:6}}>{scenario.board.map((c,i)=><Card key={i} card={c}/>)}{Array(5-scenario.board.length).fill(null).map((_,i)=><Card key={`e${i}`} card={null}/>)}</div></div>}
              <div><div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:7}}>OPONENTE</div><div style={{display:"flex",gap:6}}><Card hidden/><Card hidden/></div></div>
            </div>
          </div>
          {/* Villain action */}
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"11px 13px",marginBottom:9,display:"flex",alignItems:"flex-start",gap:9}}>
            <div style={{width:26,height:26,borderRadius:7,background:"rgba(255,255,255,0.04)",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>👤</div>
            <div><div style={{color:G.muted,fontSize:9,fontWeight:700,letterSpacing:1.2,marginBottom:3}}>ACCIÓN DEL OPONENTE</div><div style={{color:G.text,fontSize:13}}>{scenario.villainAction}</div></div>
          </div>
          {/* Context */}
          <div style={{background:`${G.orange}08`,border:`1px solid ${G.orange}22`,borderRadius:12,padding:"11px 13px",marginBottom:11}}>
            <div style={{color:G.orange,fontSize:9,fontWeight:700,letterSpacing:1.5,marginBottom:5,opacity:0.8}}>SITUACIÓN</div>
            <p style={{color:"#c8bfb0",fontSize:14,margin:0,lineHeight:1.65}}>{scenario.context}</p>
          </div>
          {/* PLAY */}
          {view==="play"&&(
            <div>
              <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:9}}>¿QUÉ DECIDES?</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {scenario.actions?.map(a=>(
                  <button key={a.id} onClick={()=>doAction(a)} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:13,padding:"13px 15px",cursor:"pointer",textAlign:"left",fontFamily:G.font,WebkitTapHighlightColor:"transparent",transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=sc.bg;e.currentTarget.style.borderColor=sc.border;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=G.surface;e.currentTarget.style.borderColor=G.border;}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:17}}>{a.icon}</span><span style={{color:G.text,fontWeight:700,fontSize:14}}>{a.label}</span></div>
                      {a.amount!=null&&<span style={{background:`${sc.text}15`,border:`1px solid ${sc.border}`,borderRadius:8,padding:"2px 8px",color:sc.text,fontSize:12,fontWeight:700}}>${a.amount}</span>}
                    </div>
                    <div style={{color:G.muted,fontSize:12,marginTop:4,paddingLeft:26,lineHeight:1.4}}>{a.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* EVALUATING */}
          {view==="evaluating"&&(
            <div style={{textAlign:"center",padding:"28px 0"}}>
              <div style={{width:50,height:50,margin:"0 auto 12px",borderRadius:14,background:G.surface,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,animation:"pulse 1.2s ease-in-out infinite"}}>🧠</div>
              <div style={{color:G.text,fontSize:14,fontWeight:600,marginBottom:3}}>Analizando tu decisión...</div>
              <div style={{color:G.muted,fontSize:12}}>El coach de IA está evaluando tu jugada</div>
            </div>
          )}
          {/* RESULT */}
          {view==="result"&&eval_&&vc&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{background:vc.bg,border:`1px solid ${vc.c}30`,borderRadius:14,padding:"16px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{color:G.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>RESULTADO</div>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                    <div style={{width:24,height:24,borderRadius:7,background:vc.c,display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0f",fontSize:13,fontWeight:900}}>{vc.icon}</div>
                    <span style={{color:vc.c,fontSize:15,fontWeight:800}}>{eval_.verdict}</span>
                  </div>
                  <div style={{color:"#c8bfb0",fontSize:13,lineHeight:1.4}}>{eval_.headline}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  <ScoreRing score={eval_.score} size={60}/>
                  <div style={{background:`${G.orange}15`,border:`1px solid ${G.orange}30`,borderRadius:10,padding:"2px 9px"}}>
                    <span style={{color:G.orange,fontSize:11,fontWeight:800}}>+{history[history.length-1]?.xpEarned||0} XP</span>
                  </div>
                </div>
              </div>
              <IB label="TU DECISIÓN" accent><div style={{color:G.orange,fontWeight:700,fontSize:13}}>{selAction?.label}{selAction?.amount?` — $${selAction.amount}`:""}</div></IB>
              <IB label="¿POR QUÉ?"><p style={{color:"#c8bfb0",fontSize:14,margin:0,lineHeight:1.7}}><ParsedText text={eval_.reasoning} /></p></IB>
              <IB label="LO IDEAL HUBIERA SIDO"><p style={{color:"#c8bfb0",fontSize:14,margin:0,lineHeight:1.7}}><ParsedText text={eval_.better_play} /></p></IB>
              <div style={{background:`${G.orange}08`,border:`1px solid ${G.orange}25`,borderRadius:12,padding:"12px 13px",marginBottom:14,display:"flex",gap:9,alignItems:"flex-start"}}>
                <div style={{width:26,height:26,borderRadius:7,background:`${G.orange}20`,border:`1px solid ${G.orange}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>💡</div>
                <div><div style={{color:G.orange,fontSize:9,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>LECCIÓN</div><p style={{color:"#d4c8b8",fontSize:13,margin:0,fontWeight:500,lineHeight:1.6}}><ParsedText text={eval_.lesson} /></p></div>
              </div>
              <button onClick={next} style={{width:"100%",padding:"15px",background:sc.text,border:"none",borderRadius:13,color:"#0a0a0f",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:G.font,WebkitTapHighlightColor:"transparent"}}>
                {milestoneData?"Ver resumen →":idx+1>=allScenarios.length?"Generar nueva mano →":"Siguiente mano →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
