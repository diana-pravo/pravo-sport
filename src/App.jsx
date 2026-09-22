import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
const P="#7C3AED",PL="#A78BFA",NEON_GREEN="#39FF88",BG_DEEP="#0B0B0F";
const HERO_WORDS=["эмоциями","азартом","энергией","драйвом","командой"];
// Glassmorphism helper — тонкая светящаяся обводка + блюр
const glass=(color=P,opacity=0.08)=>({
  background:`rgba(255,255,255,${opacity})`,
  backdropFilter:"blur(16px)",
  WebkitBackdropFilter:"blur(16px)",
  border:`1px solid ${color}55`,
  boxShadow:`0 0 0 1px ${color}22, 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
});
const colors=["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#DB2777","#0891B2"];
const colFor=s=>colors[Math.abs([...String(s||"x")].reduce((a,c)=>a+c.charCodeAt(0),0))%colors.length];
const ini=n=>String(n||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

const LEADERBOARD=[
  {uid:"u1",name:"Алексей Ковалёв",merchi:87,delta:1},
  {uid:"u2",name:"Мария Петрова",merchi:74,delta:0},
  {uid:"u3",name:"Иван Сидоров",merchi:68,delta:-1},
  {uid:"me",name:"Диана",merchi:42,delta:2},
  {uid:"u4",name:"Ольга Смирнова",merchi:38,delta:0},
];
const CHALLENGES=[
  {id:"c1",emoji:"👟",title:"Шаговый май",desc:"10 дней — 6 000 шагов",participants:24,status:"active",statusLabel:"Активный",color:"#7C3AED",daysLeft:14,type:"steps",bg:"linear-gradient(135deg,#1a0533 0%,#2D1B69 50%,#4C1D95 100%)"},
  {id:"c2",emoji:"🏃",title:"Бег — Этап 1",desc:"Максимум км за июнь",participants:18,status:"soon",statusLabel:"Скоро",color:"#059669",daysLeft:30,type:"run",bg:"linear-gradient(135deg,#052e16 0%,#064e3b 50%,#065f46 100%)"},
  {id:"c3",emoji:"🚴",title:"Велогонка",desc:"Корп. велопробег — июль",participants:12,status:"soon",statusLabel:"Скоро",color:"#D97706",daysLeft:44,type:"bike",bg:"linear-gradient(135deg,#292524 0%,#431407 50%,#78350f 100%)"},
  {id:"c4",emoji:"🏊",title:"Плавание",desc:"Открытая вода — август",participants:9,status:"soon",statusLabel:"Анонс",color:"#0891B2",daysLeft:72,type:"swim",bg:"linear-gradient(135deg,#0c1445 0%,#0e3a5e 50%,#164e63 100%)"},
];
const INIT_NEWS=[
  {id:1,title:"Старт Шагового мая!",cat:"Анонс",date:"1 мая 2025",text:"Открываем сезон! 10 дней — 6 000 шагов ежедневно.",bg:"linear-gradient(160deg,#1a0533,#2D1B69)",emoji:"👟"},
  {id:2,title:"Алексей К. — лидер недели",cat:"Результаты",date:"8 мая 2025",text:"87 000 шагов за неделю — рекорд сезона!",bg:"linear-gradient(160deg,#0d2200,#1a4000)",emoji:"🥇"},
  {id:3,title:"Анонс: Велогонка — июль",cat:"Анонс",date:"20 мая 2025",text:"Маршрут — Парк Горького → Воробьёвы горы.",bg:"linear-gradient(160deg,#1a0e00,#3d2000)",emoji:"🚴"},
  {id:4,title:"PravoRun 2025",cat:"Мероприятие",date:"15 мая 2025",text:"7 июня, Парк Горького. Участие бесплатное!",bg:"linear-gradient(160deg,#001520,#002840)",emoji:"🏅"},
  {id:5,title:"Итоги фотовызова",cat:"Итоги",date:"1 мая 2025",text:"22 участника, 180 фотографий!",bg:"linear-gradient(160deg,#200010,#400030)",emoji:"📸"},
  {id:6,title:"Рекорд: 1 240 000 шагов",cat:"Результаты",date:"31 мая 2025",text:"Вместе прошли ~930 км за май!",bg:"linear-gradient(160deg,#0a0a20,#1a1a40)",emoji:"🎉"},
];
const LIVE_FEED=[
  {uid:"u1",name:"Алексей К.",action:"9 200 шагов 👟",ago:"2 мин",pts:9.2},
  {uid:"u2",name:"Мария П.",action:"7 800 шагов 👟",ago:"14 мин",pts:7.8},
  {uid:"u3",name:"Иван С.",action:"11 200 шагов 👟",ago:"38 мин",pts:11.2},
  {uid:"u4",name:"Ольга С.",action:"Велопрогулка 🚴",ago:"1 ч",pts:5},
];
// Photo scenes (CSS art simulating real photos)
const BASE="https://nvrdogfulmifrgjjpxcy.supabase.co/storage/v1/object/public/sport-photos/";
const IMG1=BASE+"1.jpeg";
const IMG2=BASE+"1408_385_resized.jpg";
const IMG3=BASE+"IMG_6064.JPG";
const IMG4=BASE+"IMG_6068.JPG";
const PHOTO_SCENES=[
  {label:"Серфинг",    sub:"Командный дух",  img:IMG1, emoji:"🏄",bg:"linear-gradient(160deg,#0a3d5c,#0e6b8a)",shapes:[]},
  {label:"Плавание",   sub:"Открытая вода",  img:IMG2, emoji:"🏊",bg:"linear-gradient(180deg,#c8dde8,#2a6b8a)",shapes:[]},
  {label:"Финиш",      sub:"Каждый день",    img:IMG3, emoji:"🏃",bg:"linear-gradient(135deg,#1a0533,#c07040)",shapes:[]},
  {label:"Баттерфляй", sub:"Закат на воде",  img:IMG4, emoji:"🌅",bg:"linear-gradient(160deg,#2d1b00,#d4a030)",shapes:[]},
];
const navItems=[{id:"home",label:"Главная"},{id:"challenges",label:"Челленджи"},{id:"news",label:"Новости"},{id:"leaderboard",label:"Рейтинг"}];

const Av=({uid,size=36})=>{
  const u=LEADERBOARD.find(x=>x.uid===uid);
  return <div style={{width:size,height:size,borderRadius:"50%",background:colFor(uid),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.33,fontWeight:700,color:"#fff",flexShrink:0}}>{ini(u?.name||uid)}</div>;
};

// 3D Tilt card — реагирует на движение мыши, наклон + смещение "голограммного" градиента
const TiltCard=({children,style,onClick,glowColor=P,className=""})=>{
  const ref=useRef(null);
  const rx=useMotionValue(0),ry=useMotionValue(0);
  const srx=useSpring(rx,{stiffness:300,damping:22}),sry=useSpring(ry,{stiffness:300,damping:22});
  const glowX=useMotionValue(50),glowY=useMotionValue(50);
  const handleMove=e=>{
    const r=ref.current.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    ry.set((px-0.5)*16); rx.set((0.5-py)*12);
    glowX.set(px*100); glowY.set(py*100);
  };
  const reset=()=>{rx.set(0);ry.set(0);glowX.set(50);glowY.set(50);};
  return(
    <motion.div ref={ref} onClick={onClick} onMouseMove={handleMove} onMouseLeave={reset} className={className}
      style={{...style,rotateX:srx,rotateY:sry,transformPerspective:800,cursor:onClick?"pointer":"default"}}>
      <motion.div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:useTransform([glowX,glowY],([x,y])=>`radial-gradient(circle at ${x}% ${y}%,${glowColor}35,transparent 60%)`)}}/>
      {children}
    </motion.div>
  );
};

// Simulated photo card component
const PhotoCard=({scene,style,children})=>(
  <div style={{position:"relative",overflow:"hidden",background:scene.bg,...style}}>
    {/* Simulated photo elements */}
    {scene.shapes?.map((sh,i)=>(
      <div key={i} style={{position:"absolute",
        ...(sh.type==="wave"?{bottom:"-10%",left:"-10%",right:"-10%",height:"40%",borderRadius:"60% 60% 0 0",background:sh.c,transform:"scaleX(1.2)"}:{}),
        ...(sh.type==="wave2"?{bottom:"5%",left:"-20%",right:"-20%",height:"30%",borderRadius:"50% 50% 0 0",background:sh.c,transform:"scaleX(1.3)"}:{}),
        ...(sh.type==="iceberg"?{top:"20%",right:"15%",width:"30%",height:"45%",borderRadius:"40% 40% 10% 10%",background:sh.c,transform:"rotate(-5deg)"}:{}),
        ...(sh.type==="iceberg2"?{top:"35%",right:"45%",width:"18%",height:"30%",borderRadius:"40% 40% 10% 10%",background:sh.c,transform:"rotate(8deg)"}:{}),
        ...(sh.type==="track"?{top:"60%",left:0,right:0,height:"5%",background:sh.c,borderRadius:4}:{}),
        ...(sh.type==="road"?{top:"55%",left:"30%",right:"30%",bottom:0,background:sh.c,borderRadius:"4px 4px 0 0"}:{}),
      }}/>
    ))}
    {children}
  </div>
);

// Анимированная карта маршрута: линия заполняется по мере роста прогресса компании
const RouteMap=({progress=0.62})=>{
  const path="M 40 170 C 120 60, 220 200, 300 90 S 460 40, 560 110";
  const pathRef=useRef(null);
  const [len,setLen]=useState(0);
  useEffect(()=>{ if(pathRef.current) setLen(pathRef.current.getTotalLength()); },[]);
  return(
    <svg viewBox="0 0 600 220" style={{width:"100%",height:220,overflow:"visible"}}>
      <defs>
        <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={P}/>
          <stop offset="100%" stopColor={NEON_GREEN}/>
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeLinecap="round"/>
      <motion.path ref={pathRef} d={path} fill="none" stroke="url(#routeGrad)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={len} initial={{strokeDashoffset:len}} animate={{strokeDashoffset:len*(1-progress)}}
        transition={{duration:1.8,ease:"easeInOut"}}/>
      <circle cx="40" cy="170" r="7" fill="#fff"/>
      <text x="40" y="196" fill="#888" fontSize="12" textAnchor="middle">Москва</text>
      <circle cx="560" cy="110" r="7" fill="#fff" opacity="0.5"/>
      <text x="560" y="136" fill="#888" fontSize="12" textAnchor="middle">СПб</text>
      {len>0&&(
        <motion.g initial={{offsetDistance:"0%"}} animate={{offsetDistance:`${progress*100}%`}} transition={{duration:1.8,ease:"easeInOut"}}
          style={{offsetPath:`path('${path}')`,offsetRotate:"0deg"}}>
          <circle r="8" fill={NEON_GREEN} stroke="#0B0B0F" strokeWidth="2"/>
        </motion.g>
      )}
    </svg>
  );
};

// ============ ЛИЧНЫЙ КАБИНЕТ ============
const CircleProgress=({value,max,size=72,color=P,label,sub})=>{
  const r=(size-10)/2,circ=2*Math.PI*r,pct=Math.min(value/max,1);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dashoffset 1s ease"}}/>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fontSize={size*0.22} fontWeight="800" fill="#fff">{value}</text>
        <text x="50%" y="68%" textAnchor="middle" fontSize={size*0.11} fill="rgba(255,255,255,0.4)">из {max}</text>
      </svg>
      {label&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600}}>{label}</div>{sub&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{sub}</div>}</div>}
    </div>
  );
};

const MY_ACHIEVEMENTS=[
  {e:"🔥",label:"7 дней подряд",done:true},
  {e:"🏊",label:"10 км плавания",done:true},
  {e:"👟",label:"Первое место",done:false},
  {e:"🚴",label:"Велопрогулка",done:true},
];
const MY_EVENTS=[
  {date:"17 июн",day:"СБ",title:"Утренний забег",place:"Парк Горького",n:32},
  {date:"20 июн",day:"ВТ",title:"Йога онлайн",place:"Zoom",n:45},
  {date:"24 июн",day:"СБ",title:"Велопрогулка",place:"Воробьёвы горы",n:28},
];

function CabinetHome({setPage}){
  const reveal=id=>({});
  const me=LEADERBOARD.find(u=>u.uid==="me")||{name:"Диана",merchi:42,delta:2};
  const myRank=LEADERBOARD.slice().sort((a,b)=>b.merchi-a.merchi).findIndex(u=>u.uid==="me")+1;
  return(
    <div style={{padding:"96px 32px 48px",maxWidth:1240,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,marginBottom:28}}>
        <div>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.6px"}}>Добрый вечер, {me.name}! 👋</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:4}}>Стабильность сегодня — большие победы завтра</div>
        </div>
        <span style={{...glass(P,0.08),borderRadius:999,padding:"6px 16px",fontSize:12,fontWeight:600,color:PL}}>Сотрудник право(тех)</span>
      </div>

      {/* Личная статистика — кольца прогресса */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32}}>
        <div style={{...glass(P,0.04),borderRadius:16,padding:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <CircleProgress value={5} max={7} color={P} label="Дней подряд" sub="стрик активности"/>
        </div>
        <div style={{...glass(NEON_GREEN,0.04),borderRadius:16,padding:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <CircleProgress value={myRank||4} max={LEADERBOARD.length} color={NEON_GREEN} label="Место" sub="в общем рейтинге"/>
        </div>
        <div style={{...glass(P,0.04),borderRadius:16,padding:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <CircleProgress value={8} max={12} color={P} label="Тыс. шагов" sub="на этой неделе"/>
        </div>
        <div style={{...glass(NEON_GREEN,0.04),borderRadius:16,padding:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <CircleProgress value={3} max={5} color={NEON_GREEN} label="Активности" sub="в этом месяце"/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:20}}>
        {/* Мои челленджи */}
        <div style={{...glass(P,0.03),borderRadius:16,padding:"20px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:16,fontWeight:700}}>Мои челленджи</div>
            <button onClick={()=>setPage("challenges")} style={{background:"transparent",color:P,border:"none",fontSize:12,cursor:"pointer"}}>Все →</button>
          </div>
          {CHALLENGES.slice(0,3).map(c=>{
            const progress=c.id==="c1"?60:c.id==="c2"?25:10;
            return(
              <div key={c.id} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                  <span style={{fontWeight:600}}>{c.emoji} {c.title}</span>
                  <span style={{color:"rgba(255,255,255,0.4)"}}>{progress}%</span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:4}}>
                  <div style={{height:4,width:`${progress}%`,background:c.color,borderRadius:4,transition:"width 1s ease"}}/>
                </div>
              </div>
            );
          })}

          <div style={{fontSize:16,fontWeight:700,margin:"22px 0 14px"}}>Достижения</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {MY_ACHIEVEMENTS.map((a,i)=>(
              <div key={i} style={{textAlign:"center",padding:"14px 8px",borderRadius:12,background:a.done?"rgba(124,58,237,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${a.done?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.05)"}`,opacity:a.done?1:0.4}}>
                <div style={{fontSize:22,marginBottom:6}}>{a.e}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",lineHeight:1.3}}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Рейтинг + события */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{...glass(P,0.03),borderRadius:16,padding:"20px 22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:16,fontWeight:700}}>Рейтинг</div>
              <button onClick={()=>setPage("leaderboard")} style={{background:"transparent",color:P,border:"none",fontSize:12,cursor:"pointer"}}>Все →</button>
            </div>
            {LEADERBOARD.slice().sort((a,b)=>b.merchi-a.merchi).slice(0,5).map((u,i)=>(
              <div key={u.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:8,marginBottom:2,background:u.uid==="me"?"rgba(124,58,237,0.12)":"transparent"}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.35)",width:14}}>{i+1}</span>
                <Av uid={u.uid} size={28}/>
                <span style={{flex:1,fontSize:13,fontWeight:u.uid==="me"?700:400,color:u.uid==="me"?PL:"#ddd"}}>{u.name}{u.uid==="me"&&" (вы)"}</span>
                <span style={{fontSize:12,color:NEON_GREEN,fontWeight:600}}>⭐ {u.merchi}</span>
              </div>
            ))}
          </div>

          <div style={{...glass(P,0.03),borderRadius:16,padding:"20px 22px"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:14}}>Ближайшие события</div>
            {MY_EVENTS.map((e,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"9px 0",borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <div style={{textAlign:"center",flexShrink:0,width:40}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{e.day}</div>
                  <div style={{fontSize:13,fontWeight:700}}>{e.date.split(" ")[0]}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{e.place} · {e.n} участников</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ LIGHT (production) — синтез референсов, фирменные цвета, 2026-стиль ============
const BP="#8C26EA", BL="#EEFF2D", BD="#0D0628";
const lg=(op=0.7,border="rgba(140,38,234,0.14)")=>({
  background:`rgba(255,255,255,${op})`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
  border:`1px solid ${border}`,boxShadow:"0 8px 32px rgba(140,38,234,0.08), 0 1px 2px rgba(13,6,40,0.04)",
});

const Blob=({top,left,right,bottom,size,color,delay=0})=>(
  <motion.div style={{position:"absolute",top,left,right,bottom,width:size,height:size,borderRadius:"50%",
    background:color,filter:"blur(60px)",opacity:0.55,zIndex:0,pointerEvents:"none"}}
    animate={{y:[0,-18,0],x:[0,12,0]}} transition={{duration:9,repeat:Infinity,ease:"easeInOut",delay}}/>
);

const RevealSection=({children,style,className,y=24})=>(
  <motion.div className={className} style={style} initial={{opacity:0,y}} whileInView={{opacity:1,y:0}}
    viewport={{once:true,margin:"-80px"}} transition={{duration:.7,ease:[0.16,1,0.3,1]}}>
    {children}
  </motion.div>
);

const MagButton=({children,onClick,primary,style})=>{
  const x=useMotionValue(0),y=useMotionValue(0);
  const sx=useSpring(x,{stiffness:300,damping:20}),sy=useSpring(y,{stiffness:300,damping:20});
  return(
    <motion.button onClick={onClick} style={{...style,x:sx,y:sy}}
      onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();x.set((e.clientX-r.left-r.width/2)*.25);y.set((e.clientY-r.top-r.height/2)*.4);}}
      onMouseLeave={()=>{x.set(0);y.set(0);}}
      whileTap={{scale:0.96}}>
      {children}
    </motion.button>
  );
};

function LightHome({setPage}){
  const [navSolid,setNavSolid]=useState(false);
  useEffect(()=>{const h=()=>setNavSolid(window.scrollY>40);window.addEventListener("scroll",h,{passive:true});h();return()=>window.removeEventListener("scroll",h);},[]);
  const heroPhoto=IMG4;
  const scrollTo=id=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  return(
    <div id="top" style={{background:"#FCFAFF",color:BD,minHeight:"100vh",position:"relative",overflowX:"hidden",fontFamily:"'Open Sans',-apple-system,system-ui,sans-serif"}}>
      <Blob top={-120} left={-100} size={420} color="#D9E8FB" delay={0}/>
      <Blob top={140} right={-140} size={380} color="#FBE1EC" delay={2}/>
      <Blob top={900} left={-80} size={340} color="#E1F3FB" delay={1}/>
      <Blob top={1500} right={-100} size={380} color="#F3E7FB" delay={3}/>

      {/* NAV — плавающая капсула, реальная скролл-навигация */}
      <div style={{position:"sticky",top:16,zIndex:40,display:"flex",justifyContent:"center",padding:"0 20px"}}>
        <div style={{...lg(navSolid?0.85:0.6),borderRadius:999,padding:"10px 12px 10px 22px",display:"flex",alignItems:"center",gap:6,width:"100%",maxWidth:1080,transition:"background .3s ease"}}>
          <div style={{fontSize:16,fontWeight:800,cursor:"pointer",marginRight:"auto"}} onClick={()=>scrollTo("top")}>
            право<span style={{color:BP}}>(тех)</span>
          </div>
          <button onClick={()=>scrollTo("top")} style={{background:"transparent",border:"none",color:BD,fontWeight:700,fontSize:13,padding:"8px 14px",cursor:"pointer"}}>Главная</button>
          <button onClick={()=>scrollTo("section-challenges")} style={{background:"transparent",border:"none",color:"#8a8494",fontWeight:500,fontSize:13,padding:"8px 14px",cursor:"pointer"}}>Челленджи</button>
          <button onClick={()=>scrollTo("section-news")} style={{background:"transparent",border:"none",color:"#8a8494",fontWeight:500,fontSize:13,padding:"8px 14px",cursor:"pointer"}}>Новости</button>
          <button onClick={()=>scrollTo("section-leaderboard")} style={{background:"transparent",border:"none",color:"#8a8494",fontWeight:500,fontSize:13,padding:"8px 14px",cursor:"pointer"}}>Рейтинг</button>
          <div onClick={()=>setPage("cabinet-light")} title="Личный кабинет" style={{width:34,height:34,borderRadius:"50%",background:BP,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginLeft:6}}>Д</div>
          <MagButton onClick={()=>scrollTo("section-challenges")} style={{background:BP,color:"#fff",border:"none",borderRadius:999,padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 18px rgba(140,38,234,0.35)"}}>Участвовать →</MagButton>
        </div>
      </div>

      {/* HERO — по референсу Sozidai: живая карточка слева, заголовок с пилюлями справа */}
      <div style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"48px 32px 40px",display:"grid",gridTemplateColumns:"1fr 1.05fr",gap:36,alignItems:"center"}}>
        <RevealSection style={{position:"relative"}}>
          <div style={{...lg(0.85),borderRadius:24,padding:18}}>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:colFor("u1"),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700,flexShrink:0}}>АК</div>
              <div style={{background:"#F3EEFA",borderRadius:"4px 16px 16px 16px",padding:"10px 14px",maxWidth:260}}>
                <div style={{fontSize:12.5,color:BD,lineHeight:1.5}}>Пробежал 10 км в утреннем забеге! 🏃 Отличный старт недели</div>
                <div style={{fontSize:10,color:"#a89bb8",marginTop:4,textAlign:"right"}}>11:30</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <div style={{background:BP,borderRadius:"16px 4px 16px 16px",padding:"10px 14px",maxWidth:200}}>
                <div style={{fontSize:12.5,color:"#fff"}}>Красавчик! Держим темп 💪</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",marginTop:4,textAlign:"right"}}>11:32</div>
              </div>
            </div>
            <div style={{borderRadius:16,overflow:"hidden",position:"relative"}}>
              <img src={IMG3} alt="Финиш забега" style={{width:"100%",height:170,objectFit:"cover",display:"block"}}/>
              <div style={{position:"absolute",bottom:10,left:10,...lg(0.9),borderRadius:999,padding:"5px 12px",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>❤️</span><span style={{fontSize:12,fontWeight:700}}>12</span>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection y={30}>
          <h1 style={{fontSize:"clamp(2rem,4vw,2.8rem)",fontWeight:800,lineHeight:1.15,letterSpacing:"-1px",margin:"0 0 18px"}}>
            <span style={{...lg(0.9),display:"inline-block",padding:"4px 16px",borderRadius:999,marginRight:8}}>Заряжаем.</span>{" "}
            <span style={{background:BP,color:"#fff",display:"inline-block",padding:"4px 16px",borderRadius:999}}>Вдохновляем.</span><br/>
            <span style={{...lg(0.9),display:"inline-block",padding:"4px 16px",borderRadius:999,marginTop:10,marginRight:8}}>Растём.</span>{" "}
            <span style={{...lg(0.9),display:"inline-block",padding:"4px 16px",borderRadius:999,marginTop:10}}>Вместе.</span>
          </h1>
          <p style={{fontSize:14,color:"#6a6472",lineHeight:1.7,maxWidth:420,margin:"0 0 16px"}}>
            Корпоративная спортивная платформа для сотрудников право(тех).
          </p>
          <div style={{marginBottom:26}}>
            <div style={{fontSize:13,color:"#6a6472",marginBottom:6}}>↓ Челленджи и командная поддержка</div>
            <div style={{fontSize:13,color:"#6a6472"}}>↑ Рейтинг, мерчи и общий результат</div>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
            <MagButton onClick={()=>scrollTo("section-challenges")} style={{background:BP,color:"#fff",border:"none",borderRadius:999,padding:"13px 26px",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 10px 28px rgba(140,38,234,0.3)"}}>Присоединиться →</MagButton>
            <button onClick={()=>scrollTo("section-steps")} style={{background:"transparent",border:"none",color:BD,fontWeight:700,fontSize:13,cursor:"pointer"}}>Узнать больше →</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:24}}>
            {["u1","u2","u3"].map((u,i)=>(
              <div key={i} style={{width:26,height:26,borderRadius:"50%",background:colFor(u),border:"2px solid #FCFAFF",marginLeft:i>0?-10:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>{ini(LEADERBOARD.find(x=>x.uid===u)?.name||u)}</div>
            ))}
            <span style={{fontSize:12,color:"#6a6472",marginLeft:6}}>Вместе мы можем больше 🚀</span>
          </div>
        </RevealSection>
      </div>

      {/* ПОМОГАЕМ СОТРУДНИКАМ — 3 карточки по референсу */}
      <div id="section-challenges" style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"56px 32px 0",scrollMarginTop:100}}>
        <RevealSection style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontSize:24,fontWeight:800,margin:0,letterSpacing:"-0.5px",maxWidth:520,lineHeight:1.3}}>
            Помогаем сотрудникам находить <span style={{background:BP,color:"#fff",padding:"2px 10px",borderRadius:8}}>свой ритм</span> в спорте
          </h2>
        </RevealSection>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
          {CHALLENGES.slice(0,3).map((c,i)=>{
            const photo=[IMG1,IMG2,IMG3][i%3];
            return(
              <RevealSection key={c.id} y={30}>
                <motion.div whileHover={{y:-6}} transition={{type:"spring",stiffness:300,damping:22}}
                  style={{borderRadius:22,overflow:"hidden",background:"#fff",boxShadow:"0 4px 20px rgba(13,6,40,0.06)",border:"1px solid #f0ebf7"}}>
                  <div style={{position:"relative",height:200}}>
                    <img src={photo} alt={c.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                    <span style={{position:"absolute",top:12,left:12,...lg(0.9),fontSize:10,color:BD,fontWeight:700,padding:"5px 12px",borderRadius:999}}>{c.emoji} {c.type}</span>
                    <div style={{position:"absolute",top:12,right:12,width:32,height:32,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:BP,fontSize:14,fontWeight:700}}>↗</div>
                  </div>
                  <div style={{padding:"16px 18px"}}>
                    <div style={{fontSize:10,color:BP,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>0{i+1} / {c.statusLabel}</div>
                    <div style={{fontSize:16,fontWeight:800,marginBottom:10}}>{c.title}</div>
                    <button onClick={()=>c.status==="active"?setSubmitChal(c):notify("Скоро!")} style={{background:"transparent",border:"1px solid #e6dcf2",borderRadius:999,padding:"7px 16px",fontSize:12,fontWeight:700,color:BD,cursor:"pointer"}}>Подробнее →</button>
                  </div>
                </motion.div>
              </RevealSection>
            );
          })}
        </div>
      </div>

      {/* КАК ЭТО РАБОТАЕТ — 5 шагов с иконками и пунктирной линией, по референсу */}
      <div id="section-steps" style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"64px 32px 0",scrollMarginTop:100}}>
        <RevealSection>
          <div style={{...lg(0.6),borderRadius:24,padding:"32px 36px"}}>
            <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 28px",letterSpacing:"-0.5px"}}>Как это работает</h2>
            <div style={{display:"flex",alignItems:"flex-start",position:"relative"}}>
              <div style={{position:"absolute",top:24,left:"10%",right:"10%",height:0,borderTop:"2px dashed #ddd0ec",zIndex:0}}/>
              {[{e:"🎯",t:"Идея",d:"Выбери челлендж"},{e:"📸",t:"Фиксация",d:"Загрузи результат"},{e:"👥",t:"Поддержка",d:"Коллеги болеют"},{e:"⭐",t:"Мерчи",d:"Получай баллы"},{e:"📈",t:"Рост",d:"Смотри рейтинг"}].map((s,i)=>(
                <div key={i} style={{flex:1,textAlign:"center",position:"relative",zIndex:1}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:"#fff",border:"1px solid #ece4f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,margin:"0 auto 12px",boxShadow:"0 4px 12px rgba(13,6,40,0.05)"}}>{s.e}</div>
                  <div style={{fontSize:11,color:BP,fontWeight:800,marginBottom:2}}>0{i+1}</div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{s.t}</div>
                  <div style={{fontSize:10.5,color:"#8a8494"}}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>

      {/* ИСТОРИИ / СТАТИСТИКА — иконки-кружки + фото-полоса, по референсу */}
      <div style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"64px 32px 0"}}>
        <RevealSection>
          <div style={{background:"linear-gradient(135deg,#F3EEFA,#E9F6EF)",borderRadius:24,padding:"32px 36px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:20,marginBottom:28}}>
              {[{e:"🏆",c:BP,v:"7",l:"активных челленджей"},{e:"❤️",c:"#E0568C",v:"200+",l:"участников"},{e:"🌍",c:"#0891B2",v:"3",l:"года платформы"},{e:"⭐",c:"#D97706",v:"1.24M",l:"шагов за май"}].map((s,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:s.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{s.e}</div>
                  <div style={{fontSize:22,fontWeight:800}}>{s.v}</div>
                  <div style={{fontSize:11,color:"#6a6472"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[IMG1,IMG2,IMG3,IMG4].map((im,i)=>(
                <div key={i} style={{borderRadius:14,overflow:"hidden",height:100}}>
                  <img src={im} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>

      {/* ROUTE — прогресс маршрута, светлая версия */}
      <RevealSection style={{position:"relative",zIndex:2,maxWidth:1240,margin:"56px auto 0",padding:"0 32px"}}>
        <div style={{...lg(0.75),borderRadius:24,padding:"36px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:32,flexWrap:"wrap"}}>
          <div style={{maxWidth:320}}>
            <div style={{fontSize:11,color:"#8a8494",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Сезон 2025</div>
            <div style={{fontSize:26,fontWeight:800,lineHeight:1.2,marginBottom:8}}>Вместе мы прошли <span style={{color:BP}}>1 240 000 шагов</span></div>
            <div style={{fontSize:13,color:"#6a6472"}}>Это около 930 км — от Москвы до Санкт-Петербурга и обратно</div>
          </div>
          <svg viewBox="0 0 400 140" style={{flex:1,minWidth:240,maxWidth:420,height:140}}>
            <path d="M 20 110 C 80 40, 150 130, 220 60 S 340 20, 380 70" fill="none" stroke="#ECE3F7" strokeWidth="4" strokeLinecap="round"/>
            <motion.path d="M 20 110 C 80 40, 150 130, 220 60 S 340 20, 380 70" fill="none" stroke={BP} strokeWidth="4" strokeLinecap="round"
              initial={{pathLength:0}} whileInView={{pathLength:0.62}} viewport={{once:true}} transition={{duration:1.6,ease:"easeInOut"}}/>
            <circle cx="20" cy="110" r="6" fill={BD}/>
            <circle cx="380" cy="70" r="6" fill="#d8cce8"/>
          </svg>
          <MagButton onClick={()=>scrollTo("section-leaderboard")} style={{background:BD,color:"#fff",border:"none",borderRadius:12,padding:"14px 24px",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>Смотреть рейтинг →</MagButton>
        </div>
      </RevealSection>

      {/* РЕЙТИНГ — топ участников, кликабельно ведёт в личный кабинет своей строкой */}
      <div id="section-leaderboard" style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"72px 32px 0",scrollMarginTop:100}}>
        <RevealSection style={{marginBottom:24}}>
          <h2 style={{fontSize:26,fontWeight:800,margin:0,letterSpacing:"-0.6px"}}>Рейтинг сезона</h2>
        </RevealSection>
        <RevealSection y={30}>
          <div style={{...lg(0.85),borderRadius:20,padding:"12px 8px"}}>
            {LEADERBOARD.slice().sort((a,b)=>b.merchi-a.merchi).map((u,i)=>(
              <div key={u.uid} onClick={()=>u.uid==="me"&&setPage("cabinet-light")}
                style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:12,cursor:u.uid==="me"?"pointer":"default",
                  background:u.uid==="me"?"rgba(140,38,234,0.08)":"transparent"}}>
                <span style={{fontSize:13,color:i<3?BP:"#8a8494",fontWeight:700,width:20}}>{i+1}</span>
                <div style={{width:32,height:32,borderRadius:"50%",background:colFor(u.uid),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{ini(u.name)}</div>
                <span style={{flex:1,fontSize:14,fontWeight:u.uid==="me"?700:500,color:u.uid==="me"?BP:BD}}>{u.name}{u.uid==="me"&&" (вы)"}</span>
                <span style={{fontSize:13,color:"#8a8494",fontWeight:700}}>⭐ {u.merchi}</span>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>

      {/* НОВОСТИ */}
      <div id="section-news" style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"72px 32px 0",scrollMarginTop:100}}>
        <RevealSection style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontSize:26,fontWeight:800,margin:0,letterSpacing:"-0.6px"}}>Новости</h2>
        </RevealSection>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18}}>
          {INIT_NEWS.slice(0,3).map(n=>(
            <RevealSection key={n.id} y={30}>
              <div style={{...lg(0.9),borderRadius:18,padding:"20px 22px",height:"100%"}}>
                <div style={{fontSize:11,color:BP,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>{n.cat} · {n.date}</div>
                <div style={{fontSize:16,fontWeight:800,marginBottom:8}}>{n.emoji} {n.title}</div>
                <div style={{fontSize:13,color:"#6a6472",lineHeight:1.6}}>{n.text}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <RevealSection style={{position:"relative",zIndex:2,maxWidth:1240,margin:"72px auto 0",padding:"32px",borderTop:"1px solid #ece4f5",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,fontSize:12,color:"#8a8494"}}>
        <span>право(спорт) — корпоративная спортивная платформа право(тех)</span>
        <span>Канал <b style={{color:BP}}>#pravo_sport</b> в Mattermost · HR-команда</span>
      </RevealSection>
      <div style={{height:60}}/>
    </div>
  );
}

// Светлый личный кабинет — доступен по клику на аватар/свою строку в рейтинге
function LightCabinet({setPage}){
  const me=LEADERBOARD.find(u=>u.uid==="me")||{name:"Диана",merchi:42};
  const myRank=LEADERBOARD.slice().sort((a,b)=>b.merchi-a.merchi).findIndex(u=>u.uid==="me")+1;
  const ring=(value,max,color,label,sub)=>{
    const size=88,r=(size-10)/2,circ=2*Math.PI*r,pct=Math.min(value/max,1);
    return(
      <div style={{...lg(0.85),borderRadius:18,padding:"18px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ece4f5" strokeWidth="7"/>
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} transform={`rotate(-90 ${size/2} ${size/2})`}
            initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:circ*(1-pct)}} transition={{duration:1,ease:"easeOut"}}/>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="800" fill={BD}>{value}</text>
        </svg>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700}}>{label}</div>
          <div style={{fontSize:10,color:"#8a8494"}}>{sub}</div>
        </div>
      </div>
    );
  };
  return(
    <div style={{background:"#FCFAFF",color:BD,minHeight:"100vh",position:"relative",overflowX:"hidden",fontFamily:"'Open Sans',-apple-system,system-ui,sans-serif"}}>
      <Blob top={-100} left={-100} size={380} color="#EDE1FB" delay={0}/>
      <Blob top={700} right={-120} size={340} color="#E1F3FB" delay={2}/>

      <div style={{position:"relative",zIndex:2,maxWidth:1000,margin:"0 auto",padding:"32px 32px 64px"}}>
        <button onClick={()=>setPage("light")} style={{background:"transparent",border:"none",color:BP,fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:24,padding:0}}>← На главную</button>

        <RevealSection style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:BP,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:800}}>Д</div>
            <div>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.5px"}}>Добрый день, {me.name}! 👋</div>
              <div style={{fontSize:13,color:"#6a6472",marginTop:2}}>Стабильность сегодня — большие победы завтра</div>
            </div>
          </div>
          <span style={{...lg(0.8),borderRadius:999,padding:"7px 16px",fontSize:12,fontWeight:700,color:BP}}>Сотрудник право(тех)</span>
        </RevealSection>

        <RevealSection y={30} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
          {ring(5,7,BP,"Дней подряд","стрик активности")}
          {ring(myRank||4,LEADERBOARD.length,"#0891B2","Место","в общем рейтинге")}
          {ring(8,12,BP,"Тыс. шагов","на этой неделе")}
          {ring(3,5,"#0891B2","Активности","в этом месяце")}
        </RevealSection>

        <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:20}}>
          <RevealSection y={30}>
            <div style={{...lg(0.85),borderRadius:18,padding:"22px 24px"}}>
              <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>Мои челленджи</div>
              {CHALLENGES.slice(0,3).map((c,i)=>{
                const progress=[60,25,10][i];
                return(
                  <div key={c.id} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                      <span style={{fontWeight:700}}>{c.emoji} {c.title}</span>
                      <span style={{color:"#8a8494"}}>{progress}%</span>
                    </div>
                    <div style={{height:5,background:"#ece4f5",borderRadius:4}}>
                      <div style={{height:5,width:`${progress}%`,background:BP,borderRadius:4,transition:"width 1s ease"}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{fontSize:16,fontWeight:800,margin:"24px 0 14px"}}>Достижения</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[{e:"🔥",l:"7 дней подряд",done:true},{e:"🏊",l:"10 км плавания",done:true},{e:"👟",l:"Первое место",done:false},{e:"🚴",l:"Велопрогулка",done:true}].map((a,i)=>(
                  <div key={i} style={{textAlign:"center",padding:"14px 8px",borderRadius:12,background:a.done?"rgba(140,38,234,0.08)":"#f5f2fa",border:`1px solid ${a.done?"rgba(140,38,234,0.25)":"#ece4f5"}`,opacity:a.done?1:0.4}}>
                    <div style={{fontSize:20,marginBottom:6}}>{a.e}</div>
                    <div style={{fontSize:9.5,color:"#6a6472",lineHeight:1.3}}>{a.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          <RevealSection y={30} style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{...lg(0.85),borderRadius:18,padding:"22px 24px"}}>
              <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>Рейтинг</div>
              {LEADERBOARD.slice().sort((a,b)=>b.merchi-a.merchi).slice(0,5).map((u,i)=>(
                <div key={u.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:8,background:u.uid==="me"?"rgba(140,38,234,0.08)":"transparent"}}>
                  <span style={{fontSize:12,color:"#8a8494",width:14}}>{i+1}</span>
                  <div style={{width:26,height:26,borderRadius:"50%",background:colFor(u.uid),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{ini(u.name)}</div>
                  <span style={{flex:1,fontSize:13,fontWeight:u.uid==="me"?700:400,color:u.uid==="me"?BP:BD}}>{u.name}{u.uid==="me"&&" (вы)"}</span>
                  <span style={{fontSize:12,color:"#8a8494",fontWeight:700}}>⭐ {u.merchi}</span>
                </div>
              ))}
            </div>
            <div style={{...lg(0.85),borderRadius:18,padding:"22px 24px"}}>
              <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>Ближайшие события</div>
              {[{date:"17",day:"СБ",title:"Утренний забег",place:"Парк Горького",n:32},{date:"20",day:"ВТ",title:"Йога онлайн",place:"Zoom",n:45},{date:"24",day:"СБ",title:"Велопрогулка",place:"Воробьёвы горы",n:28}].map((e,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"9px 0",borderTop:i>0?"1px solid #ece4f5":"none"}}>
                  <div style={{textAlign:"center",flexShrink:0,width:36}}>
                    <div style={{fontSize:9,color:"#8a8494"}}>{e.day}</div>
                    <div style={{fontSize:13,fontWeight:800}}>{e.date}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700}}>{e.title}</div>
                    <div style={{fontSize:11,color:"#8a8494"}}>{e.place} · {e.n} участников</div>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>
    </div>
  );
}


// Данные о фото для этого варианта — единый конфиг, чтобы фото менялись без правки вёрстки.
const MIN_PHOTOS=[
  {id:"hero",src:IMG4,alt:"Сотрудник плывёт баттерфляем на закате",focalPoint:"center 35%",consent:true,credit:""},
  {id:"surf",src:IMG1,alt:"Сотрудники на сёрф-сессии в команде",focalPoint:"center 50%",consent:true,credit:""},
  {id:"finish",src:IMG3,alt:"Финиш забега сотрудника",focalPoint:"center 40%",consent:true,credit:""},
];
const reduceMotion=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useReveal=()=>{
  const [seen,setSeen]=useState({});
  useEffect(()=>{
    if(reduceMotion){ // сразу всё видимо, без анимации
      const all={}; document.querySelectorAll("[data-mreveal]").forEach(el=>all[el.dataset.mreveal]=true); setSeen(all); return;
    }
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) setSeen(p=>({...p,[e.target.dataset.mreveal]:true})); });
    },{threshold:0.15});
    document.querySelectorAll("[data-mreveal]").forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);
  return {
    style:id=>({
      opacity:seen[id]?1:0,
      transform:seen[id]?"translateY(0)":"translateY(14px)",
      transition:reduceMotion?"none":"opacity .5s ease-out, transform .5s ease-out",
    }),
    seen,
  };
};

// Счётчик — анимируется от 0 один раз при появлении во вьюпорте
const CountUp=({to,seen,suffix=""}) =>{
  const [val,setVal]=useState(reduceMotion?to:0);
  const started=useRef(false);
  useEffect(()=>{
    if(!seen||started.current||reduceMotion)return;
    started.current=true;
    const dur=900,start=performance.now();
    const step=now=>{
      const t=Math.min(1,(now-start)/dur);
      setVal(Math.floor(to*(1-Math.pow(1-t,3))));
      if(t<1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  },[seen,to]);
  return <span style={{fontVariantNumeric:"tabular-nums"}}>{val.toLocaleString("ru")}{suffix}</span>;
};

function MinimalHome({setPage}){
  const {style:reveal,seen}=useReveal();
  const accent="#7C3AED";
  const CHAL=[
    {title:"Шаговый май",period:"10 дней · до 31 мая",progress:60,participants:24},
    {title:"Бег — Этап 1",period:"июнь",progress:20,participants:18},
    {title:"Корп. велогонка",period:"июль",progress:5,participants:12},
  ];
  const RATING=[
    {rank:1,name:"Алексей Ковалёв",team:"Backend",result:"87 000 шагов"},
    {rank:2,name:"Мария Петрова",team:"HR",result:"74 000 шагов"},
    {rank:3,name:"Иван Сидоров",team:"Frontend",result:"68 000 шагов"},
    {rank:4,name:"Диана",team:"HR",result:"42 000 шагов"},
    {rank:5,name:"Ольга Смирнова",team:"Design",result:"38 000 шагов"},
  ];
  const STEPS=[
    {n:"01",t:"Выбери челлендж",d:"В разделе «Челленджи» — активные или ближайшие."},
    {n:"02",t:"Фиксируй результат",d:"Загружай шаги, километры или фото каждый день."},
    {n:"03",t:"Смотри рейтинг",d:"Прогресс и место в общем зачёте — на странице «Рейтинг»."},
  ];
  return(
    <div style={{"--bg":"#FAFAF8","--fg":"#111111","--muted":"#6b6b6b","--accent":accent,background:"var(--bg)",color:"var(--fg)",fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif",minHeight:"100vh"}}>
      <style>{`
        .m-link{color:var(--fg);text-decoration:none;border-bottom:1px solid transparent;transition:${reduceMotion?"none":"border-color .2s ease"};}
        .m-link:hover{border-color:var(--accent);}
        .m-btn{display:inline-block;color:var(--fg);text-decoration:none;font-size:14px;letter-spacing:.02em;border-bottom:1px solid var(--fg);padding-bottom:2px;transition:${reduceMotion?"none":"opacity .2s ease"};cursor:pointer;background:none;border-top:none;border-left:none;border-right:none;}
        .m-btn:hover{opacity:.55;}
        @media (max-width:640px){ .m-hero-metric{font-size:clamp(2.2rem,11vw,3.4rem)!important;} }
      `}</style>

      {/* header — минимальный, ссылка назад */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 32px",fontSize:13}}>
        <span style={{fontWeight:600,letterSpacing:"-0.3px"}}>право(спорт)</span>
        <button onClick={()=>setPage("home")} className="m-btn">← Обычная версия</button>
      </div>

      {/* HERO — фото 100vh (90vh моб.), одна метрика */}
      <div style={{position:"relative",height:"90vh",minHeight:520}}>
        <img src={MIN_PHOTOS[0].src} alt={MIN_PHOTOS[0].alt} loading="eager" width={1920} height={1080}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:MIN_PHOTOS[0].focalPoint}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 45%,rgba(0,0,0,0.72) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 32px 56px"}}>
          <div className="m-hero-metric" style={{fontSize:"clamp(2.5rem,7vw,7rem)",fontWeight:700,lineHeight:0.98,letterSpacing:"-2px",color:"#fff"}}>
            1 240 000 <span style={{color:accent}}>шагов</span>
          </div>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.7)",margin:"14px 0 20px",maxWidth:480,lineHeight:1.6}}>
            Столько прошла компания за май — командой, шаг за шагом.
          </p>
          <button onClick={()=>setPage("challenges")} style={{background:"none",border:"none",color:"#fff",fontSize:14,letterSpacing:".02em",borderBottom:"1px solid #fff",paddingBottom:2,cursor:"pointer"}}>Смотреть челленджи →</button>
        </div>
      </div>

      {/* ЧЕЛЛЕНДЖИ — плотный блок данных, тонкая линия прогресса */}
      <div data-mreveal="chal" style={{...reveal("chal"),maxWidth:920,margin:"0 auto",padding:"96px 32px"}}>
        <div style={{fontSize:12,color:"var(--muted)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:36}}>Активные челленджи</div>
        {CHAL.map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"22px 0",borderTop:i===0?"1px solid #e4e2dc":"1px solid #e4e2dc"}}>
            <div>
              <div style={{fontSize:22,fontWeight:600,letterSpacing:"-0.3px",marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:13,color:"var(--muted)"}}>{c.period}</div>
            </div>
            <div style={{flex:1,margin:"0 32px",maxWidth:260}}>
              <div style={{height:1,background:"#e4e2dc",position:"relative"}}>
                <div style={{position:"absolute",left:0,top:0,height:1,width:`${c.progress}%`,background:accent}}/>
              </div>
            </div>
            <div style={{fontSize:13,color:"var(--muted)",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{c.participants} участников</div>
          </div>
        ))}
      </div>

      {/* ФОТО — на всю ширину, минимальная подпись */}
      <div data-mreveal="photo1" style={{...reveal("photo1"),position:"relative",height:"70vh",minHeight:380}}>
        <img src={MIN_PHOTOS[1].src} alt={MIN_PHOTOS[1].alt} loading="lazy" width={1920} height={1080}
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:MIN_PHOTOS[1].focalPoint,filter:"saturate(0.85)"}}/>
        <div style={{position:"absolute",bottom:24,left:32,fontSize:12,color:"rgba(255,255,255,0.75)",background:"rgba(0,0,0,0.35)",padding:"4px 10px",borderRadius:2}}>Серфинг · командный дух</div>
      </div>

      {/* РЕЙТИНГ — типографская таблица */}
      <div data-mreveal="rating" style={{...reveal("rating"),maxWidth:920,margin:"0 auto",padding:"96px 32px"}}>
        <div style={{fontSize:12,color:"var(--muted)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:36}}>Рейтинг сезона</div>
        {RATING.map(r=>(
          <div key={r.rank} style={{display:"grid",gridTemplateColumns:"32px 40px 1fr 120px 140px",gap:16,alignItems:"center",padding:"14px 0",borderTop:"1px solid #e4e2dc"}}>
            <div style={{fontSize:14,fontVariantNumeric:"tabular-nums",fontWeight:r.rank<=3?700:400,color:r.rank<=3?"var(--fg)":"var(--muted)"}}>{r.rank}</div>
            <div style={{width:32,height:32,borderRadius:4,background:"#111",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600}}>{ini(r.name)}</div>
            <div style={{fontSize:15,fontWeight:r.rank<=3?700:400}}>{r.name}</div>
            <div style={{fontSize:13,color:"var(--muted)"}}>{r.team}</div>
            <div style={{fontSize:13,fontVariantNumeric:"tabular-nums",textAlign:"right"}}>{r.result}</div>
          </div>
        ))}
      </div>

      {/* ЛИЧНЫЙ ПРОГРЕСС — крупные цифры в ряд */}
      <div data-mreveal="personal" style={{...reveal("personal"),maxWidth:920,margin:"0 auto",padding:"64px 32px 96px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,borderTop:"1px solid #e4e2dc"}}>
        {[{v:42,l:"мерчей набрано"},{v:5,l:"дней подряд"},{v:8100,l:"шагов сегодня"},{v:4,l:"место в рейтинге"}].map((s,i)=>(
          <div key={i}>
            <div style={{fontSize:"clamp(1.8rem,4vw,2.6rem)",fontWeight:700,letterSpacing:"-1px"}}><CountUp to={s.v} seen={!!seen.personal}/></div>
            <div style={{fontSize:11,color:"var(--muted)",letterSpacing:".05em",textTransform:"uppercase",marginTop:6}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ФОТО 2 */}
      <div data-mreveal="photo2" style={{...reveal("photo2"),position:"relative",height:"70vh",minHeight:380}}>
        <img src={MIN_PHOTOS[2].src} alt={MIN_PHOTOS[2].alt} loading="lazy" width={1920} height={1080}
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:MIN_PHOTOS[2].focalPoint,filter:"saturate(0.85)"}}/>
        <div style={{position:"absolute",bottom:24,left:32,fontSize:12,color:"rgba(255,255,255,0.75)",background:"rgba(0,0,0,0.35)",padding:"4px 10px",borderRadius:2}}>Финиш · каждый день</div>
      </div>

      {/* КАК УЧАСТВОВАТЬ */}
      <div data-mreveal="steps" style={{...reveal("steps"),maxWidth:920,margin:"0 auto",padding:"96px 32px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32}}>
        {STEPS.map(s=>(
          <div key={s.n}>
            <div style={{fontSize:32,fontWeight:700,color:accent,letterSpacing:"-1px",marginBottom:12}}>{s.n}</div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{s.t}</div>
            <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>{s.d}</div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{borderTop:"1px solid #e4e2dc",padding:"32px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,fontSize:12,color:"var(--muted)"}}>
        <span>Вопросы и предложения — канал <a href="#" className="m-link">#pravo_sport</a> в Mattermost, организатор: HR-команда</span>
        <span>© 2025 право(тех). Только для сотрудников PravoTech.</span>
      </div>
    </div>
  );
}

export default function App(){
  const [page,setPage]=useState("light");
  const [scrolled,setScrolled]=useState(false);
  const [mouse,setMouse]=useState({x:0,y:0});
  const [news,setNews]=useState(INIT_NEWS);
  const [isAdmin,setIsAdmin]=useState(false);
  const [showAddNews,setShowAddNews]=useState(false);
  const [newPost,setNewPost]=useState({title:"",cat:"Анонс",text:"",emoji:"📢"});
  const [submitChal,setSubmitChal]=useState(null);
  const [submitVal,setSubmitVal]=useState("");
  const [submitText,setSubmitText]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [toast,setToast]=useState(null);
  const [visible,setVisible]=useState({});
  const [stripIdx,setStripIdx]=useState(0);
  const [heroWordIdx]=useState(0); // оставлено для совместимости, больше не меняется
  const [liveFeed,setLiveFeed]=useState(LIVE_FEED);
  const observerRefs=useRef({});
  const stripRef=useRef();

  // Симуляция живой ленты — новые события "вталкивают" старые сверху
  useEffect(()=>{
    const names=[["Иван С.","u3"],["Ольга С.","u4"],["Мария П.","u2"],["Алексей К.","u1"]];
    const acts=["9 400 шагов 👟","6 км бега 🏃","Велопрогулка 🚴","10 100 шагов 👟"];
    const t=setInterval(()=>{
      const i=Math.floor(Math.random()*names.length);
      setLiveFeed(p=>[{uid:names[i][1],name:names[i][0],action:acts[i],ago:"только что",pts:+(Math.random()*10+2).toFixed(1),id:Date.now()},...p].slice(0,6));
    },5000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(page!=="home")return;
    const h=e=>{
      setMouse({x:(e.clientX/window.innerWidth-.5)*20,y:(e.clientY/window.innerHeight-.5)*12});
    };
    window.addEventListener("mousemove",h);
    return()=>window.removeEventListener("mousemove",h);
  },[page]);

  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting)setVisible(p=>({...p,[e.target.dataset.id]:true}));});
    },{threshold:0.1});
    document.querySelectorAll("[data-id]").forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[page]);

  // Навбар прозрачный поверх hero, затемняется при прокрутке
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>72);
    window.addEventListener("scroll",h,{passive:true});
    h();
    return()=>window.removeEventListener("scroll",h);
  },[]);

  const notify=msg=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  const addNews=()=>{
    if(!newPost.title.trim())return;
    const bgs=["linear-gradient(160deg,#1a0533,#2D1B69)","linear-gradient(160deg,#0d2200,#1a4000)","linear-gradient(160deg,#001520,#002840)"];
    setNews(p=>[{id:Date.now(),title:newPost.title,cat:newPost.cat,date:new Date().toLocaleDateString("ru",{day:"numeric",month:"long"}),text:newPost.text,bg:bgs[0],emoji:newPost.emoji},...p]);
    setNewPost({title:"",cat:"Анонс",text:"",emoji:"📢"});setShowAddNews(false);notify("Новость опубликована!");
  };
  const doSubmit=()=>{
    if(!submitVal&&!submitText)return;
    setSubmitted(true);notify(`+${Math.min(+(submitVal||0)/1000,20).toFixed(1)||5} мерчей ⭐`);
    setTimeout(()=>{setSubmitChal(null);setSubmitVal("");setSubmitText("");setSubmitted(false);},2000);
  };

  const fadeStyle=id=>({opacity:visible[id]?1:0,transform:visible[id]?"translateY(0)":"translateY(24px)",transition:"opacity .7s ease, transform .7s ease"});

  return(
    <div style={{background:"radial-gradient(ellipse 1200px 800px at 15% 0%,rgba(124,58,237,0.14),transparent 60%),radial-gradient(ellipse 1000px 700px at 90% 30%,rgba(57,255,136,0.08),transparent 55%),#131319",color:"#fff",fontFamily:"system-ui,-apple-system,sans-serif",minHeight:"100%",overflowY:"auto"}}>
      <style>{`
        @keyframes kenBurns{0%{transform:scale(1) translate(0,0)}50%{transform:scale(1.07) translate(-1%,-1%)}100%{transform:scale(1.03) translate(1%,0.5%)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hov-card{transition:transform .25s ease,box-shadow .25s ease;}
        .hov-card:hover{transform:translateY(-5px) scale(1.01);box-shadow:0 20px 40px rgba(0,0,0,0.4);}
        .hov-btn{transition:all .15s ease;}
        .hov-btn:hover{opacity:0.88;transform:scale(0.97);}
        .photo-hover{transition:transform .6s ease;}
        .photo-hover:hover .photo-inner{transform:scale(1.06);}
        .photo-inner{transition:transform .6s ease;width:100%;height:100%;}
      `}</style>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"#D1FAE5",color:"#065F46",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",whiteSpace:"nowrap",border:"1px solid #6EE7B7",animation:"slideIn .3s ease"}}>✓ {toast}</div>}

      {/* NAV — прозрачная поверх hero (вариант 1), затемняется при скролле/на других страницах */}
      {page!=="minimal"&&page!=="light"&&page!=="cabinet-light"&&(
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 32px",position:"fixed",top:0,left:0,right:0,zIndex:50,
        background:(page==="home"&&!scrolled)?"transparent":"rgba(19,19,25,0.97)",
        borderBottom:(page==="home"&&!scrolled)?"1px solid transparent":"1px solid rgba(255,255,255,0.05)",
        backdropFilter:(page==="home"&&!scrolled)?"none":"blur(16px)",
        transition:"background .3s ease, border-color .3s ease, backdrop-filter .3s ease"}}>
        <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.5px",cursor:"pointer"}} onClick={()=>setPage("home")}>
          право<span style={{color:PL}}>(спорт)</span>
        </div>
        <div style={{display:"flex",gap:2}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setPage(item.id)} className="hov-btn"
              style={{background:page===item.id?"rgba(124,58,237,0.15)":"transparent",color:page===item.id?"#fff":((page==="home"&&!scrolled)?"rgba(255,255,255,0.7)":"#555"),border:page===item.id?`1px solid rgba(124,58,237,0.3)`:"1px solid transparent",borderRadius:8,padding:"6px 14px",fontSize:13,cursor:"pointer",fontWeight:page===item.id?500:400}}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setPage("minimal")} className="hov-btn" style={{background:"transparent",color:"#666",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>Минимал-версия</button>
          <button onClick={()=>setPage("light")} className="hov-btn" style={{background:"transparent",color:"#8C26EA",border:"1px solid rgba(140,38,234,0.3)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>Светлая версия</button>
          <button onClick={()=>setIsAdmin(!isAdmin)} className="hov-btn" style={{background:"transparent",color:isAdmin?"#A78BFA":"#444",border:`1px solid ${isAdmin?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>{isAdmin?"✓ Автор":"Режим автора"}</button>
          <button onClick={()=>setPage("challenges")} className="hov-btn" style={{background:P,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 14px ${P}50`}}>Участвовать →</button>
          <div onClick={()=>setPage("cabinet")} className="hov-btn" title="Личный кабинет"
            style={{width:32,height:32,borderRadius:"50%",background:colFor("me"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",border:page==="cabinet"?`2px solid ${P}`:"2px solid transparent"}}>Д</div>
        </div>
      </nav>
      )}

      {/* ── MINIMAL VARIANT — редакционный минимализм, для сравнения ── */}
      {page==="minimal"&&<MinimalHome setPage={setPage}/>}

      {/* ── ЛИЧНЫЙ КАБИНЕТ ── */}
      {page==="cabinet"&&<CabinetHome setPage={setPage}/>}

      {/* ── СВЕТЛАЯ ВЕРСИЯ (продакшн-синтез референсов) ── */}
      {page==="light"&&<LightHome setPage={setPage}/>}
      {page==="cabinet-light"&&<LightCabinet setPage={setPage}/>}

      {/* ── HOME ── */}
      {page==="home"&&(
        <div>
          {/* HERO — реальное фото, left-aligned контент + встроенная карточка статистики (по референсам) */}
          <div style={{position:"relative",minHeight:560,overflow:"hidden",borderRadius:"0 0 24px 24px"}}>
            <div style={{position:"absolute",inset:0,animation:"kenBurns 18s ease-in-out infinite alternate",transformOrigin:"center center"}}>
              <img src={IMG4} alt="hero" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 68%",display:"block"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(100deg,rgba(19,19,25,0.9) 0%,rgba(19,19,25,0.5) 45%,rgba(19,19,25,0.2) 100%)"}}/>
            </div>

            <div style={{position:"relative",zIndex:2,padding:"56px 40px",display:"flex",justifyContent:"space-between",gap:32,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{maxWidth:560}}>
                <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.08,margin:"0 0 18px",letterSpacing:"-1.5px"}}>
                  Движение делает нас <span style={{background:"linear-gradient(135deg,#A78BFA,#7C3AED,#c084fc)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>сильнее</span>
                </h1>
                <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",margin:"0 0 28px",lineHeight:1.7,maxWidth:440}}>
                  Участвуй в корпоративных челленджах, соревнуйся с коллегами и становись лидером сезона
                </p>
                <div style={{display:"flex",gap:12}}>
                  <button onClick={()=>setPage("challenges")} className="hov-btn" style={{background:P,color:"#fff",border:"none",borderRadius:10,padding:"13px 26px",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${P}55`}}>Начать участвовать →</button>
                  <button onClick={()=>setPage("leaderboard")} className="hov-btn" style={{background:"rgba(255,255,255,0.06)",color:"#fff",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"13px 26px",fontSize:14,cursor:"pointer",backdropFilter:"blur(8px)"}}>Рейтинг сезона</button>
                </div>
              </div>
            </div>
          </div>

          {/* PHOTO STRIP — горизонтальная лента */}
          <div data-id="strip" style={{...fadeStyle("strip"),padding:"48px 0 0",overflowX:"hidden"}}>
            <div style={{padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:24,fontWeight:800,margin:0,letterSpacing:"-0.5px"}}>Жизнь в движении</h2>
              <div style={{display:"flex",gap:8}}>
                {PHOTO_SCENES.map((_,i)=>(
                  <div key={i} onClick={()=>setStripIdx(i)} style={{width:8,height:8,borderRadius:"50%",background:i===stripIdx?P:"rgba(255,255,255,0.15)",cursor:"pointer",transition:"all .2s"}}/>
                ))}
              </div>
            </div>
            <div ref={stripRef} style={{display:"flex",gap:0,transform:`translateX(${-stripIdx*25}%)`,transition:"transform .7s cubic-bezier(.4,0,.2,1)"}}>
              {PHOTO_SCENES.map((scene,i)=>(
                <div key={i} className="photo-hover" onClick={()=>setStripIdx(i)} style={{flex:"0 0 28%",marginRight:8,borderRadius:16,overflow:"hidden",height:320,cursor:"pointer",position:"relative",filter:i===stripIdx?"none":"brightness(0.5)",transition:"filter .4s ease",marginLeft:i===0?32:0}}>
                  {scene.img
                    ? <img src={scene.img} alt={scene.label} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .6s ease"}} className="photo-inner"/>
                    : <PhotoCard scene={scene} style={{width:"100%",height:"100%"}}><div className="photo-inner"/></PhotoCard>
                  }
                  {i===stripIdx&&<div style={{position:"absolute",top:14,right:14,background:P,borderRadius:999,padding:"3px 10px",fontSize:10,fontWeight:600}}>Активно</div>}
                </div>
              ))}
            </div>
          </div>

          {/* CHALLENGES — полноширинный ряд карточек по референсу: фото + бейдж + круглая стрелка + мета снизу */}
          <div data-id="chal" style={{...fadeStyle("chal"),padding:"48px 32px 0"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:24,fontWeight:800,margin:0,letterSpacing:"-0.5px"}}>Активные челленджи</h2>
              <button onClick={()=>setPage("challenges")} style={{background:"transparent",color:P,border:"none",fontSize:13,cursor:"pointer",fontWeight:500}}>Все →</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {CHALLENGES.map(c=>(
                <TiltCard key={c.id} glowColor={c.color} onClick={()=>c.status==="active"?setSubmitChal(c):notify("Скоро!")}
                  style={{borderRadius:16,overflow:"hidden",position:"relative",...glass(c.color,0.04),display:"flex",flexDirection:"column"}}>
                  <div style={{height:150,position:"relative"}}>
                    <PhotoCard scene={{bg:c.bg,shapes:[]}} style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
                      <div className="photo-inner"/>
                    </PhotoCard>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(0,0,0,0.35) 0%,transparent 55%)"}}/>
                    <span style={{position:"absolute",top:10,left:10,fontSize:10,background:c.color+"35",color:c.color,padding:"3px 9px",borderRadius:999,fontWeight:600,border:`1px solid ${c.color}55`,backdropFilter:"blur(4px)"}}>{c.statusLabel}</span>
                    <div style={{position:"absolute",top:10,right:10,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,backdropFilter:"blur(4px)"}}>→</div>
                  </div>
                  <div style={{padding:"14px 16px",flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:17}}>{c.emoji}</span>
                      <span style={{fontSize:14,fontWeight:700}}>{c.title}</span>
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:10,lineHeight:1.5}}>{c.desc}</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.35)"}}>
                      <span>👥 {c.participants} участника</span><span>⏱ {c.daysLeft}д</span>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>

          {/* ROUTE BANNER — горизонтальный баннер с реальным фото и светящимся маршрутом (по референсу) */}
          <div data-id="banner" style={{...fadeStyle("banner"),margin:"40px 32px 0",borderRadius:20,overflow:"hidden",position:"relative",minHeight:220,display:"flex",alignItems:"center"}}>
            <img src={IMG3} alt="Сотрудники на финише забега" width={1600} height={500} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.5)"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(100deg,rgba(19,19,25,0.8) 0%,rgba(19,19,25,0.35) 60%,rgba(19,19,25,0.65) 100%)"}}/>
            <div style={{position:"relative",zIndex:2,display:"flex",width:"100%",alignItems:"center",justifyContent:"space-between",padding:"32px 40px",gap:24,flexWrap:"wrap"}}>
              <div style={{maxWidth:280}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Сезон 2025</div>
                <h2 style={{fontSize:28,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.8px",lineHeight:1.15}}>Вместе мы прошли<br/><span style={{color:PL}}>1 240 000 шагов</span></h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:0}}>Это около 930 км — от Москвы до Санкт-Петербурга и обратно</p>
              </div>
              <div style={{flex:1,minWidth:260,maxWidth:420}}>
                <RouteMap progress={0.62}/>
              </div>
              <button onClick={()=>setPage("leaderboard")} style={{background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer",backdropFilter:"blur(8px)",flexShrink:0}}>Смотреть рейтинг →</button>
            </div>
          </div>


          {/* PRIZES */}
          <div data-id="prizes" style={{...fadeStyle("prizes"),padding:"0 32px 48px"}}>
            <div style={{...glass(P,0.03),borderRadius:20,padding:"36px 32px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
                <h2 style={{fontSize:26,fontWeight:800,margin:0,letterSpacing:"-0.6px"}}>Призы и награды</h2>
                <button onClick={()=>setPage("challenges")} className="hov-btn" style={{background:P,color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Участвовать →</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[{e:"🥇",p:"1 место",r:"Сертификат 5 000 ₽ + мерч",hi:true},{e:"🥈",p:"2 место",r:"Сертификат 3 000 ₽"},{e:"🥉",p:"3 место",r:"Фирменный мерч право(тех)"},{e:"✅",p:"Норма",r:"+3 мерча за каждый день"}].map((pr,i)=>(
                  <div key={i} style={{background:i===0?"rgba(124,58,237,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${i===0?"rgba(124,58,237,0.25)":"rgba(255,255,255,0.05)"}`,borderRadius:12,padding:"16px 14px"}}>
                    <div style={{fontSize:24,marginBottom:8}}>{pr.e}</div>
                    <div style={{fontSize:13,fontWeight:600,color:i===0?PL:"#aaa",marginBottom:6}}>{pr.p}</div>
                    <div style={{fontSize:12,color:"#444",lineHeight:1.5}}>{pr.r}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEWS PREVIEW */}
          <div data-id="newspreview" style={{...fadeStyle("newspreview"),padding:"0 32px 48px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:24,fontWeight:800,margin:0,letterSpacing:"-0.5px"}}>Новости</h2>
              <button onClick={()=>setPage("news")} style={{background:"transparent",color:P,border:"none",fontSize:13,cursor:"pointer",fontWeight:500}}>Все →</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
              {news.slice(0,3).map((n,i)=>(
                <div key={n.id} className="hov-card" style={{background:n.bg,borderRadius:14,padding:i===0?"28px":"18px",cursor:"pointer",minHeight:i===0?220:160,display:"flex",flexDirection:"column",justifyContent:"flex-end",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:i===0?14:10,left:i===0?14:10,right:14,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,background:"rgba(0,0,0,0.4)",color:"#aaa",padding:"3px 9px",borderRadius:999}}>{n.cat}</span>
                    <span style={{fontSize:i===0?28:20}}>{n.emoji}</span>
                  </div>
                  <div>
                    <div style={{fontSize:i===0?17:13,fontWeight:700,lineHeight:1.3,marginBottom:4}}>{n.title}</div>
                    {i===0&&<div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6,lineHeight:1.5}}>{n.text}</div>}
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>{n.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",padding:"32px 32px 24px"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:32,marginBottom:28}}>
              <div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>право<span style={{color:PL}}>(спорт)</span></div>
                <div style={{fontSize:13,color:"#333",lineHeight:1.7,maxWidth:240}}>Корпоративная спортивная платформа право(тех)</div>
              </div>
              {[{t:"Платформа",l:["Челленджи","Рейтинг","Архив"]},{t:"Участие",l:["Как участвовать","Мерчики","Призы"]},{t:"Связь",l:["#pravo_sport","HR-команда"]}].map(col=>(
                <div key={col.t}>
                  <div style={{fontSize:10,color:"#444",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>{col.t}</div>
                  {col.l.map(link=>(
                    <div key={link} onClick={()=>notify(link)} style={{fontSize:13,color:"#333",marginBottom:8,cursor:"pointer"}} onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#333"}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:20,display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:12,color:"#222"}}>© 2025 право(тех)</div>
              <div style={{fontSize:12,color:"#222"}}>7 активных челленджей · Сезон 2025</div>
            </div>
          </div>
        </div>
      )}

      {/* CHALLENGES PAGE */}
      {page==="challenges"&&(
        <div style={{padding:"96px 32px 32px"}}>
          <h2 style={{fontSize:32,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.8px"}}>Челленджи</h2>
          <p style={{color:"#555",fontSize:14,margin:"0 0 32px"}}>Выбери активность и отправь результат</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
            {CHALLENGES.map(c=>(
              <div key={c.id} style={{borderRadius:16,overflow:"hidden",position:"relative",height:240}}>
                <PhotoCard scene={{bg:c.bg,shapes:[]}} style={{width:"100%",height:"100%",position:"absolute",inset:0}}><div/></PhotoCard>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)"}}/>
                <div style={{position:"absolute",inset:0,padding:24,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <span style={{fontSize:24}}>{c.emoji}</span>
                    <span style={{fontSize:10,background:c.color+"30",color:c.color,padding:"3px 8px",borderRadius:999,fontWeight:600,border:`1px solid ${c.color}50`,alignSelf:"center"}}>{c.statusLabel}</span>
                  </div>
                  <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{c.title}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:12}}>{c.desc} · 👥 {c.participants} · ⏱ {c.daysLeft}д</div>
                  {c.status==="active"
                    ?<button onClick={()=>setSubmitChal(c)} className="hov-btn" style={{background:c.color,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontSize:14,fontWeight:600,cursor:"pointer",alignSelf:"flex-start",boxShadow:`0 4px 12px ${c.color}50`}}>Отправить результат</button>
                    :<button onClick={()=>notify("Скоро!")} style={{background:"rgba(255,255,255,0.08)",color:"#555",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 20px",fontSize:14,cursor:"pointer",alignSelf:"flex-start"}}>Скоро</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEWS PAGE */}
      {page==="news"&&(
        <div style={{padding:"96px 32px 32px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
            <div><h2 style={{fontSize:32,fontWeight:800,margin:"0 0 6px",letterSpacing:"-0.8px"}}>Новости</h2><p style={{color:"#555",fontSize:14,margin:0}}>Последние события</p></div>
            {isAdmin&&<button onClick={()=>setShowAddNews(!showAddNews)} className="hov-btn" style={{background:showAddNews?"rgba(124,58,237,0.15)":P,color:"#fff",border:showAddNews?`1px solid ${P}`:"none",borderRadius:10,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer"}}>{showAddNews?"Отмена":"+ Написать"}</button>}
          </div>
          {isAdmin&&showAddNews&&(
            <div style={{background:"rgba(124,58,237,0.07)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:16,padding:24,marginBottom:32}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 60px 120px",gap:10,marginBottom:10}}>
                <input value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))} placeholder="Заголовок..." style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#fff",outline:"none"}}/>
                <input value={newPost.emoji} onChange={e=>setNewPost(p=>({...p,emoji:e.target.value}))} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px",fontSize:20,color:"#fff",outline:"none",textAlign:"center"}}/>
                <select value={newPost.cat} onChange={e=>setNewPost(p=>({...p,cat:e.target.value}))} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 10px",fontSize:13,color:"#fff",outline:"none"}}>
                  {["Анонс","Результаты","Итоги","Мероприятие"].map(c=><option key={c} value={c} style={{background:"#1a1a2e"}}>{c}</option>)}
                </select>
              </div>
              <textarea value={newPost.text} onChange={e=>setNewPost(p=>({...p,text:e.target.value}))} placeholder="Текст..." style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#fff",outline:"none",resize:"none",height:70,marginBottom:10}}/>
              <button onClick={addNews} className="hov-btn" style={{background:P,color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Опубликовать</button>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {news.map((n,i)=>(
              <div key={n.id} className="hov-card" style={{background:n.bg,borderRadius:14,minHeight:220,padding:22,cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"flex-end",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,padding:"14px 16px",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,background:"rgba(0,0,0,0.5)",color:"#aaa",padding:"3px 9px",borderRadius:999}}>{n.cat}</span>
                  <span style={{fontSize:22}}>{n.emoji}</span>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,lineHeight:1.3,marginBottom:5}}>{n.title}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.5,marginBottom:6}}>{n.text}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>{n.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {page==="leaderboard"&&(
        <div style={{padding:"96px 32px 32px"}}>
          <h2 style={{fontSize:32,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.8px"}}>Рейтинг сезона</h2>
          <p style={{color:"#555",fontSize:14,margin:"0 0 40px"}}>Мерчики за все челленджи 2025</p>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:10,marginBottom:40}}>
            {[{i:1,h:70},{i:0,h:110},{i:2,h:50}].map(({i,h})=>{
              const r=LEADERBOARD[i];
              const pc=["#7C3AED","#059669","#DC2626"];
              return(
                <div key={r.uid} style={{textAlign:"center",width:160}}>
                  <div style={{fontSize:i===0?36:28,marginBottom:6,animation:i===0?"float 3s ease-in-out infinite":undefined}}>{"🥇🥈🥉"[i]}</div>
                  <div style={{width:i===0?52:44,height:i===0?52:44,borderRadius:"50%",background:pc[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:i===0?18:15,fontWeight:700,color:"#fff",margin:"0 auto 6px",boxShadow:i===0?`0 0 20px ${P}60`:undefined}}>{ini(r.name)}</div>
                  <div style={{fontSize:i===0?14:12,fontWeight:600,color:i===0?"#fff":"#aaa",marginBottom:2}}>{r.name.split(" ")[0]}</div>
                  <div style={{background:`linear-gradient(180deg,${pc[i]}20,${pc[i]}08)`,border:`1px solid ${pc[i]}30`,borderRadius:"10px 10px 0 0",height:h,display:"flex",alignItems:"center",justifyContent:"center",marginTop:8}}>
                    <div><div style={{fontSize:i===0?24:18,fontWeight:800,color:i===0?PL:["#34D399","#F87171"][i-1]}}>⭐ {r.merchi}</div></div>
                  </div>
                  <div style={{height:20,background:`linear-gradient(180deg,${pc[i]}08,transparent)`,border:`1px solid ${pc[i]}15`,borderTop:"none",borderRadius:"0 0 6px 6px"}}/>
                </div>
              );
            })}
          </div>
          <div style={{maxWidth:520,margin:"0 auto"}}>
            {LEADERBOARD.slice(3).map((r,i)=>(
              <div key={r.uid} style={{background:r.uid==="me"?"rgba(124,58,237,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${r.uid==="me"?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)"}`,borderRadius:10,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:14,fontWeight:700,color:"#333",width:20,textAlign:"center"}}>{i+4}</span>
                <div style={{width:32,height:32,borderRadius:"50%",background:colFor(r.uid),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{ini(r.name)}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:r.uid==="me"?700:400,color:r.uid==="me"?PL:"#aaa"}}>{r.name}{r.uid==="me"&&" (вы)"}</div></div>
                {r.delta!==0&&<span style={{fontSize:10,fontWeight:600,color:r.delta>0?"#34D399":"#F87171",background:r.delta>0?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)",padding:"2px 6px",borderRadius:4}}>{r.delta>0?`↑${r.delta}`:`↓${Math.abs(r.delta)}`}</span>}
                <span style={{fontSize:14,fontWeight:600,color:r.uid==="me"?PL:"#555"}}>⭐ {r.merchi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {page==="announcements"&&(
        <div style={{padding:"96px 32px 32px"}}>
          <h2 style={{fontSize:32,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.8px"}}>Анонсы</h2>
          <p style={{color:"#555",fontSize:14,margin:"0 0 32px"}}>Предстоящие мероприятия</p>
          {[{month:"Июнь",items:[{emoji:"🏊",title:"Плавание / Вело / Бег — Этап 1",date:"1 июня",desc:"Три дисциплины, рейтинг по км",days:14,color:"#0891B2"},{emoji:"👟",title:"Шаговый июнь",date:"15 июня",desc:"Ежедневные шаги, формат нормы",days:25,color:"#7C3AED"}]},{month:"Июль",items:[{emoji:"🚴",title:"Корп. велогонка",date:"5 июля",desc:"Парк Горького → Воробьёвы горы",days:45,color:"#D97706"},{emoji:"❤️",title:"Благотворительный забег",date:"20 июля",desc:"Шаги в пользу доброго дела",days:60,color:"#DC2626"}]}].map(sec=>(
            <div key={sec.month} style={{marginBottom:28}}>
              <div style={{display:"inline-flex",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.15)",borderRadius:999,padding:"4px 14px",fontSize:12,color:PL,fontWeight:600,marginBottom:14}}>{sec.month}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {sec.items.map((item,i)=>(
                  <div key={i} className="hov-card" style={{background:`linear-gradient(135deg,${item.color}12,${item.color}04)`,border:`1px solid ${item.color}22`,borderRadius:14,padding:20,display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:48,height:48,borderRadius:12,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{item.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{item.title}</div>
                      <div style={{fontSize:12,color:"#555",marginBottom:7}}>{item.desc}</div>
                      <div style={{display:"flex",gap:6}}>
                        <span style={{fontSize:11,color:"#444"}}>🗓 {item.date}</span>
                        <span style={{fontSize:10,background:item.color+"18",color:item.color,padding:"2px 7px",borderRadius:999}}>через {item.days}д</span>
                      </div>
                    </div>
                    <button onClick={()=>notify("Регистрация подтверждена! 🎉")} className="hov-btn" style={{background:item.color,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>Участвовать</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT MODAL */}
      {submitChal&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={e=>{if(e.target===e.currentTarget){setSubmitChal(null);setSubmitted(false);}}}>
          <div style={{background:"#111",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:32,width:420,maxWidth:"90%",boxShadow:"0 24px 64px rgba(0,0,0,0.7)",animation:"slideIn .3s ease"}}>
            {!submitted?(
              <>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
                  <span style={{fontSize:32}}>{submitChal.emoji}</span>
                  <div><div style={{fontSize:18,fontWeight:700}}>{submitChal.title}</div><div style={{fontSize:12,color:"#555",marginTop:2}}>Отправить результат</div></div>
                </div>
                {submitChal.type==="steps"&&(
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:"#555",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Количество шагов</div>
                    <input type="number" value={submitVal} onChange={e=>setSubmitVal(e.target.value)} placeholder="напр. 8500" style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:`1.5px solid ${submitChal.color}40`,borderRadius:10,padding:"12px 14px",fontSize:16,color:"#fff",outline:"none"}}/>
                    {submitVal&&+submitVal>0&&<div style={{fontSize:12,color:submitChal.color,marginTop:5,fontWeight:500}}>= +{Math.min(+submitVal/1000,20).toFixed(1)} мерчей ⭐</div>}
                  </div>
                )}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,color:"#555",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Комментарий</div>
                  <textarea value={submitText} onChange={e=>setSubmitText(e.target.value)} placeholder="Расскажи о результате..." style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fff",outline:"none",resize:"none",height:70}}/>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setSubmitChal(null);setSubmitted(false);}} style={{flex:1,background:"rgba(255,255,255,0.04)",color:"#555",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px",fontSize:14,cursor:"pointer"}}>Отмена</button>
                  <button onClick={doSubmit} disabled={!submitVal&&!submitText} className="hov-btn" style={{flex:2,background:submitChal.color,color:"#fff",border:"none",borderRadius:10,padding:"12px",fontSize:14,fontWeight:600,cursor:"pointer",opacity:(!submitVal&&!submitText)?0.4:1,boxShadow:`0 4px 14px ${submitChal.color}50`}}>Отправить результат</button>
                </div>
              </>
            ):(
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:52,marginBottom:16}}>🎉</div>
                <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>Принято!</div>
                <div style={{fontSize:14,color:"#555"}}>Мерчики начислены</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
