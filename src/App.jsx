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


function LightHome({setPage,challenges=CHALLENGES,news=INIT_NEWS,signedIn=false,isAdmin=false,onLogin}){
  const [navSolid,setNavSolid]=useState(false);
  useEffect(()=>{
    const h=()=>setNavSolid(window.scrollY>36);
    window.addEventListener("scroll",h,{passive:true});
    h();
    return()=>window.removeEventListener("scroll",h);
  },[]);

  const scrollTo=id=>{
    const el=document.getElementById(id);
    if(el)el.scrollIntoView({behavior:"smooth",block:"start"});
  };
  const participate=()=>signedIn?setPage("cabinet-light"):onLogin();

  const challengeImages=[IMG3,IMG1,IMG2,IMG4];
  const challengeCards=(challenges?.length?challenges:CHALLENGES).slice(0,4).map((c,i)=>({
    ...c,
    img:challengeImages[i%challengeImages.length],
    tag:c.status==="active"?"Активный":c.statusLabel||"Скоро",
    tone:[BP,"#D9FF35","#FFC24A","#FF8FC8"][i%4]
  }));

  const steps=[
    {n:"01",title:"Выберите челлендж",text:"Личный или командный — в своём темпе."},
    {n:"02",title:"Добавляйте результат",text:"Число, комментарий и подтверждающий файл."},
    {n:"03",title:"Поддерживайте коллег",text:"Следите за прогрессом команды и рейтингом."},
    {n:"04",title:"Приходите на события",text:"Забеги, тренировки и видео-встречи."}
  ];

  const homeNews=(news?.length?news:INIT_NEWS).slice(0,3).map((n,i)=>({
    ...n,
    accent:["#F0E3FF","#F3FFB7","#E6DCF8"][i%3],
    image:i===2?IMG3:null
  }));

  return(
    <div id="top" className="ps-home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
        .ps-home{--ink:#12092f;--purple:#8c26ea;--purple2:#7620d3;--lime:#eaff37;--paper:#fffaf4;min-height:100vh;background:radial-gradient(circle at 3% 1%,rgba(189,206,255,.48),transparent 28%),radial-gradient(circle at 90% 9%,rgba(255,206,228,.43),transparent 26%),linear-gradient(180deg,#fffaf5 0%,#fffdfa 44%,#fbf8ff 100%);color:var(--ink);font-family:'Open Sans',Arial,sans-serif;overflow-x:hidden}
        .ps-home button,.ps-home input,.ps-home textarea,.ps-home select{font-family:'Open Sans',Arial,sans-serif}
        .ps-home *{box-sizing:border-box}.ps-wrap{width:min(1240px,calc(100% - 48px));margin:0 auto}
        .ps-nav-wrap{position:sticky;top:0;z-index:50;padding:14px 0;transition:.25s ease}.ps-nav-wrap.solid{background:rgba(255,250,245,.78);backdrop-filter:blur(18px)}
        .ps-nav{display:flex;align-items:center;gap:8px}.ps-logo{font-size:24px;font-weight:800;letter-spacing:-1px;margin-right:auto;white-space:nowrap;cursor:pointer}.ps-logo span{color:var(--purple)}
        .ps-nav-links{display:flex;align-items:center;gap:4px}.ps-nav button{font:inherit}.ps-link{border:0;background:transparent;color:#665f72;font-size:13px;font-weight:700;padding:10px 13px;border-radius:999px;cursor:pointer;transition:.2s}.ps-link:hover,.ps-link.active{background:#f4eaff;color:var(--purple)}
        .ps-login{border:1px solid #e4d7ee;background:rgba(255,255,255,.75);color:var(--ink);font-size:12px;font-weight:800;padding:10px 16px;border-radius:999px;cursor:pointer}
        .ps-primary{border:0;background:linear-gradient(135deg,var(--purple),#9e2cff);color:#fff;font-weight:800;border-radius:999px;padding:13px 22px;cursor:pointer;box-shadow:0 12px 30px rgba(140,38,234,.24);transition:.2s;white-space:nowrap}.ps-primary:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(140,38,234,.31)}
        .ps-ghost{border:1px solid #dacbe7;background:rgba(255,255,255,.72);color:var(--ink);font-weight:800;border-radius:999px;padding:12px 18px;cursor:pointer}.ps-avatar{width:38px;height:38px;border-radius:50%;border:0;background:linear-gradient(135deg,#f0327f,#8c26ea);color:#fff;font-weight:900;cursor:pointer}
        .ps-hero{display:grid;grid-template-columns:.8fr 1.25fr;gap:40px;align-items:center;padding:44px 0 62px}.ps-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
        .ps-h1{font-size:clamp(48px,6.1vw,82px);line-height:.92;letter-spacing:-4px;margin:0 0 22px;font-weight:900}.ps-h1 em{font-style:normal;color:var(--purple)}.ps-sub{font-size:16px;line-height:1.55;color:#615a6d;max-width:480px;margin:0 0 26px}
        .ps-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.ps-people{display:flex;align-items:center;gap:12px;margin-top:26px}.ps-faces{display:flex}.ps-face{width:35px;height:35px;border-radius:50%;border:3px solid #fff;margin-left:-8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:900}.ps-face:first-child{margin-left:0}.ps-people strong{font-size:13px}.ps-people small{display:block;color:#8a8393;font-size:11px;margin-top:2px}
        .ps-visual{position:relative;min-height:470px}.ps-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;border-radius:42% 12% 39% 16% / 18% 28% 24% 32%;box-shadow:0 28px 70px rgba(43,20,82,.18)}.ps-hero-glow{position:absolute;inset:0;border-radius:42% 12% 39% 16% / 18% 28% 24% 32%;background:linear-gradient(130deg,rgba(139,38,234,.03),rgba(7,18,47,.12))}
        .ps-scribble{position:absolute;left:-52px;top:92px;color:#8c26ea;font-weight:800;font-size:26px;line-height:1.05;transform:rotate(-11deg);font-family:cursive;text-align:center}.ps-burst{position:absolute;left:-62px;top:22px;font-size:58px;color:#dfff42;transform:rotate(-18deg)}.ps-flower{position:absolute;left:-20px;bottom:20px;font-size:74px;color:#ff69ae;transform:rotate(12deg);line-height:1}
        .ps-result-card{position:absolute;right:-16px;bottom:30px;background:rgba(255,251,248,.93);backdrop-filter:blur(12px);border:1px solid rgba(140,38,234,.12);border-radius:22px;padding:17px 20px;box-shadow:0 14px 38px rgba(35,16,65,.13);min-width:190px}.ps-bars{display:flex;align-items:flex-end;gap:4px;height:30px;margin-bottom:8px}.ps-bars i{display:block;width:5px;border-radius:5px;background:var(--purple)}.ps-result-card small{color:#756e7f;font-size:10px}.ps-result-card b{display:block;font-size:13px;margin-top:2px}
        .ps-manifesto{display:grid;grid-template-columns:.72fr 1.28fr;gap:24px;align-items:center;padding:22px 26px;border-radius:28px;background:rgba(255,255,255,.64);border:1px solid #efe4f8;margin-bottom:62px}.ps-manifesto .label{font-size:11px;color:var(--purple);font-weight:900;letter-spacing:.12em}.ps-manifesto h2{font-size:36px;line-height:1;margin:6px 0 0;letter-spacing:-1.5px}.ps-manifesto p{font-size:18px;color:#625b6e;line-height:1.45;margin:0}.ps-manifesto p strong{color:var(--ink)}
        .ps-section{padding:10px 0 62px;scroll-margin-top:88px}.ps-section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:20px}.ps-section-head h2{font-size:31px;letter-spacing:-1.15px;margin:0;font-weight:800}.ps-section-head p{margin:7px 0 0;color:#7a7283;font-size:14px}.ps-text-link{border:0;background:transparent;color:var(--purple);font-weight:800;cursor:pointer}
        .ps-challenges{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.ps-ch-card{position:relative;min-height:292px;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(58,31,88,.07);cursor:pointer;background:#fff;border:1px solid rgba(140,38,234,.08);transition:transform .25s ease,box-shadow .25s ease}.ps-ch-card:hover{transform:translateY(-3px);box-shadow:0 14px 32px rgba(58,31,88,.12)}.ps-ch-photo{position:relative;height:166px;overflow:hidden;background:#eee}.ps-ch-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease}.ps-ch-card:hover .ps-ch-photo img{transform:scale(1.035)}.ps-tag{position:absolute;top:12px;left:12px;border-radius:999px;padding:6px 11px;font-size:10px;font-weight:800;z-index:2;box-shadow:0 3px 10px rgba(41,19,66,.08)}.ps-ch-body{position:relative;padding:14px 14px 13px;min-height:126px;background:linear-gradient(180deg,#fffafd 0%,#fff 100%)}.ps-ch-title{font-size:17px;font-weight:800;letter-spacing:-.35px;margin:0 42px 5px 0;color:var(--ink)}.ps-ch-desc{font-size:11px;color:#776f80;line-height:1.4;margin:0 42px 8px 0}.ps-ch-people{font-size:11px;font-weight:700;color:#665d72;margin:0}.ps-ch-people span{color:var(--purple)}.ps-round{position:absolute;right:12px;bottom:13px;width:34px;height:34px;border-radius:50%;border:1px solid #e5d8ef;background:#fff;color:var(--purple);font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 5px 14px rgba(80,42,118,.08)}
        .ps-season{position:relative;overflow:hidden;border-radius:30px;min-height:290px;padding:36px;background:#ece7ff;display:grid;grid-template-columns:.9fr 1.1fr;align-items:center;box-shadow:0 14px 40px rgba(53,30,91,.08)}.ps-season:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 88% 20%,rgba(255,255,255,.7),transparent 22%),linear-gradient(130deg,rgba(140,38,234,.08),rgba(223,255,66,.22));pointer-events:none}.ps-season-copy{position:relative;z-index:2}.ps-season-label{font-size:11px;font-weight:900;letter-spacing:.12em;color:#6d5d83;margin-bottom:8px}.ps-season h2{font-size:40px;line-height:1.02;letter-spacing:-1.6px;margin:0 0 12px}.ps-season h2 em{font-style:normal;color:var(--purple)}.ps-season p{font-size:14px;color:#625b6e;line-height:1.5;margin:0 0 18px;max-width:390px}
        .ps-route{position:relative;z-index:2;height:180px}.ps-route svg{width:100%;height:100%}.ps-route-note{position:absolute;right:12%;top:6px;background:#fff;border-radius:17px;padding:11px 16px;font-size:11px;font-weight:800;box-shadow:0 8px 24px rgba(61,32,104,.1)}
        .ps-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.ps-step{background:#fff;border:1px solid #eee4f6;border-radius:22px;padding:22px;min-height:180px;box-shadow:0 7px 22px rgba(51,24,87,.05)}.ps-step .num{font-size:38px;font-weight:900;color:var(--purple);letter-spacing:-2px}.ps-step h3{font-size:16px;margin:18px 0 7px}.ps-step p{font-size:13px;color:#756e7f;line-height:1.55;margin:0}
        .ps-news{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ps-news-card{border-radius:17px;padding:17px 18px;min-height:178px;position:relative;overflow:hidden;border:1px solid rgba(140,38,234,.08);background:#fff;box-shadow:0 7px 20px rgba(55,29,84,.05)}.ps-news-card.has-image{color:#fff;background:#6d42a2}.ps-news-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ps-news-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(44,20,74,.82) 0%,rgba(44,20,74,.46) 62%,rgba(44,20,74,.12) 100%)}.ps-news-tag{position:relative;z-index:2;display:inline-flex;border-radius:999px;padding:5px 9px;background:rgba(140,38,234,.10);color:#7a32c3;font-size:9px;font-weight:800;letter-spacing:.02em}.ps-news-card.has-image .ps-news-tag{background:rgba(121,42,218,.78);color:#fff}.ps-news-date{position:relative;z-index:2;margin-top:10px;font-size:9px;color:#8b8492}.ps-news-card.has-image .ps-news-date{color:rgba(255,255,255,.72)}.ps-news-card h3{position:relative;z-index:2;font-size:18px;max-width:78%;line-height:1.08;margin:5px 0 7px;letter-spacing:-.45px;font-weight:800}.ps-news-card p{position:relative;z-index:2;font-size:11px;color:#716a79;max-width:78%;line-height:1.45;margin:0}.ps-news-card.has-image p{color:rgba(255,255,255,.82)}.ps-news-arrow{position:absolute;z-index:3;right:14px;bottom:14px;width:32px;height:32px;border-radius:50%;border:1px solid #e6d7f0;background:rgba(255,255,255,.88);color:var(--purple);display:flex;align-items:center;justify-content:center;font-weight:900}.ps-news-icon{position:absolute;right:18px;top:18px;font-size:35px;z-index:2}
        .ps-cta{background:var(--lime);border-radius:28px;padding:32px 34px;display:flex;align-items:center;gap:25px;justify-content:space-between;margin:4px 0 42px;position:relative;overflow:hidden}.ps-cta h2{font-size:31px;letter-spacing:-1.2px;margin:0 0 4px}.ps-cta p{margin:0;color:#554f5b;font-size:13px}.ps-cta-doodle{font-size:34px;letter-spacing:8px;transform:rotate(-8deg);opacity:.75}
        .ps-footer{border-top:1px solid #eadff2;padding:25px 0 34px;display:grid;grid-template-columns:1.3fr 2fr auto;gap:30px;align-items:start;color:#837b8d;font-size:11px}.ps-footer .ps-logo{font-size:18px}.ps-footer-links{display:flex;gap:18px;flex-wrap:wrap}.ps-footer button{border:0;background:transparent;color:#837b8d;font-size:11px;cursor:pointer;padding:0}
        @media(max-width:900px){.ps-wrap{width:min(100% - 28px,760px)}.ps-nav-links{display:none}.ps-nav .ps-login{display:none}.ps-hero{grid-template-columns:1fr;padding-top:28px}.ps-visual{min-height:430px}.ps-h1{font-size:58px}.ps-scribble,.ps-burst,.ps-flower{display:none}.ps-manifesto{grid-template-columns:1fr}.ps-challenges{grid-template-columns:1fr 1fr}.ps-season{grid-template-columns:1fr}.ps-steps{grid-template-columns:1fr 1fr}.ps-news{grid-template-columns:1fr}.ps-footer{grid-template-columns:1fr}}
        @media(max-width:600px){.ps-wrap{width:calc(100% - 24px)}.ps-nav-wrap{padding:9px 0}.ps-logo{font-size:20px}.ps-primary{padding:11px 15px;font-size:12px}.ps-hero{padding:28px 0 42px;gap:24px}.ps-h1{font-size:46px;letter-spacing:-2.6px}.ps-sub{font-size:14px}.ps-visual{min-height:330px}.ps-result-card{right:8px;bottom:10px;min-width:160px;padding:13px 15px}.ps-manifesto{padding:20px;margin-bottom:44px}.ps-manifesto h2{font-size:30px}.ps-manifesto p{font-size:15px}.ps-section{padding-bottom:46px}.ps-section-head h2{font-size:28px}.ps-section-head .ps-text-link{display:none}.ps-challenges{grid-template-columns:1fr}.ps-season{padding:24px}.ps-season h2{font-size:32px}.ps-route{height:135px}.ps-steps{grid-template-columns:1fr}.ps-step{min-height:150px}.ps-news-card h3{font-size:18px}.ps-cta{align-items:flex-start;flex-direction:column}.ps-cta-doodle{display:none}.ps-footer{gap:18px}}
      `}</style>

      <div className={"ps-nav-wrap"+(navSolid?" solid":"")}>
        <div className="ps-wrap ps-nav">
          <div className="ps-logo" onClick={()=>scrollTo("top")}>право<span>(спорт)</span></div>
          <div className="ps-nav-links">
            <button className="ps-link active" onClick={()=>scrollTo("top")}>Главная</button>
            <button className="ps-link" onClick={()=>scrollTo("challenges")}>Челленджи</button>
            <button className="ps-link" onClick={()=>scrollTo("season")}>Рейтинг</button>
            <button className="ps-link" onClick={()=>scrollTo("news")}>Новости</button>
          </div>
          {isAdmin&&<button className="ps-link" onClick={()=>setPage("admin")}>Админ</button>}
          {!signedIn?<button className="ps-login" onClick={onLogin}>Войти</button>:<button className="ps-avatar" onClick={()=>setPage("cabinet-light")} title="Личный кабинет">Д</button>}
          <button className="ps-primary" onClick={participate}>Участвовать →</button>
        </div>
      </div>

      <main className="ps-wrap">
        <section className="ps-hero">
          <div>
            <div className="ps-kicker">право (спорт)</div>
            <h1 className="ps-h1">Движение<br/>делает нас<br/><em>сильнее</em></h1>
            <p className="ps-sub">Корпоративные челленджи, команда и поддержка коллег — для энергии в работе и жизни.</p>
            <div className="ps-actions">
              <button className="ps-primary" onClick={participate}>Начать участвовать →</button>
              <button className="ps-ghost" onClick={()=>scrollTo("steps")}>Как это работает&nbsp; ▶</button>
            </div>
            <div className="ps-people">
              <div className="ps-faces">
                <span className="ps-face" style={{background:"#e82972"}}>АК</span>
                <span className="ps-face" style={{background:"#169cb0"}}>МП</span>
                <span className="ps-face" style={{background:"#7641d8"}}>ИС</span>
                <span className="ps-face" style={{background:"#23143d"}}>+18</span>
              </div>
              <div><strong>1 240 участников</strong><small>Уже в движении с нами</small></div>
            </div>
          </div>

          <div className="ps-visual">
            <img className="ps-hero-img" src={IMG2} alt="Пловец на открытой воде"/>
            <div className="ps-hero-glow"/>
            <div className="ps-burst">✦</div>
            <div className="ps-scribble">Больше<br/>энергии<br/>для любимых<br/>дел ♡</div>
            <div className="ps-flower">✣</div>
            <div className="ps-result-card">
              <div className="ps-bars"><i style={{height:10}}/><i style={{height:17}}/><i style={{height:25}}/><i style={{height:30}}/></div>
              <small>Маленькие шаги</small>
              <b>Большие результаты</b>
            </div>
          </div>
        </section>

        <section className="ps-manifesto">
          <div><div className="label">КОРПОРАТИВНЫЙ СПОРТ</div><h2>Вместе — дальше</h2></div>
          <p><strong>Больше энергии</strong> для любимых дел, поддержки друг друга и привычки двигаться каждый день. ♡</p>
        </section>

        <section id="challenges" className="ps-section">
          <div className="ps-section-head">
            <div><div className="ps-kicker" style={{marginBottom:7}}>ВЫБИРАЙ СВОЙ ТЕМП</div><h2>Активные челленджи</h2><p>Личные и командные активности — присоединяйтесь в любой момент.</p></div>
            <button className="ps-text-link" onClick={()=>setPage("challenges")}>Все челленджи →</button>
          </div>
          <div className="ps-challenges">
            {challengeCards.map((c,i)=>(
              <article className="ps-ch-card" key={c.id||i} onClick={()=>setPage("challenges")}>
                <div className="ps-ch-photo">
                  <img src={c.img} alt={c.title}/>
                  <div className="ps-tag" style={{background:i===0?BP:i===1?"#E9FF68":i===2?"#FFD36A":"#FFB7DD",color:i===0?"#fff":"#3d3150"}}>{c.tag}</div>
                </div>
                <div className="ps-ch-body">
                  <h3 className="ps-ch-title">{c.title}</h3>
                  <p className="ps-ch-desc">{c.desc||"Корпоративный спортивный челлендж"}</p>
                  <p className="ps-ch-people"><span>♟</span> {c.participants||0} участников</p>
                  <button className="ps-round" aria-label="Открыть челлендж">→</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="season" className="ps-section">
          <div className="ps-season">
            <div className="ps-season-copy">
              <div className="ps-season-label">СЕЗОН 2026</div>
              <h2>Вместе мы прошли<br/><em>1 240 000 шагов</em></h2>
              <p>Это около 930 км — от Москвы до Санкт-Петербурга и обратно.</p>
              <button className="ps-primary" onClick={()=>setPage("leaderboard")}>Смотреть рейтинг →</button>
            </div>
            <div className="ps-route">
              <div className="ps-route-note">930 км<br/><span style={{fontWeight:500,color:"#746c7e"}}>уже позади!</span></div>
              <svg viewBox="0 0 520 180" role="img" aria-label="Маршрут Москва — Санкт-Петербург">
                <path d="M30 142 C95 75 155 148 215 102 S325 48 392 72 S452 45 490 32" fill="none" stroke="#8C26EA" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="30" cy="142" r="8" fill="#eaff37" stroke="#8C26EA" strokeWidth="4"/>
                <circle cx="490" cy="32" r="8" fill="#fff" stroke="#8C26EA" strokeWidth="4"/>
                <text x="18" y="170" fontSize="12" fill="#5f5770">Москва</text>
                <text x="454" y="20" fontSize="12" fill="#5f5770">СПб</text>
              </svg>
            </div>
          </div>
        </section>

        <section id="steps" className="ps-section">
          <div className="ps-section-head"><div><div className="ps-kicker" style={{marginBottom:7}}>ВСЁ ПРОСТО</div><h2>От первого шага до общей победы</h2></div></div>
          <div className="ps-steps">
            {steps.map(s=><div className="ps-step" key={s.n}><div className="num">{s.n}</div><h3>{s.title}</h3><p>{s.text}</p></div>)}
          </div>
        </section>

        <section id="news" className="ps-section">
          <div className="ps-section-head">
            <div><div className="ps-kicker" style={{marginBottom:7}}>НОВОСТИ ДВИЖЕНИЯ</div><h2>Что происходит</h2></div>
            <button className="ps-text-link" onClick={()=>setPage("news")}>Все новости →</button>
          </div>
          <div className="ps-news">
            {homeNews.map((n,i)=><article key={n.id||i} className={"ps-news-card"+(n.image?" has-image":"")} style={{background:n.image?undefined:i===0?"linear-gradient(135deg,#F1E5FF,#F8F2FF)":i===1?"linear-gradient(135deg,#FBF5F0,#F3F7D3)":"#fff"}}>
              {n.image&&<><img className="ps-news-image" src={n.image} alt=""/><div className="ps-news-shade"/></>}
              {!n.image&&i===1&&<div className="ps-news-icon">🏆</div>}
              <div className="ps-news-tag">{n.cat||n.tag||"Новость"}</div>
              <div className="ps-news-date">{n.date||"Сегодня"}</div>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
              <div className="ps-news-arrow">→</div>
            </article>)}
          </div>
        </section>

        <section className="ps-cta">
          <div><h2>Готовы к новому челленджу?</h2><p>Присоединяйтесь и найдите свою команду.</p></div>
          <div className="ps-cta-doodle">👟 ♡ ☺</div>
          <button className="ps-primary" onClick={participate}>Участвовать →</button>
        </section>

        <footer className="ps-footer">
          <div><div className="ps-logo">право<span>(спорт)</span></div><div style={{marginTop:8}}>Корпоративная спортивная платформа право(тех)</div></div>
          <div className="ps-footer-links">
            <button onClick={()=>scrollTo("challenges")}>Челленджи</button>
            <button onClick={()=>scrollTo("news")}>Новости</button>
            <button onClick={()=>scrollTo("season")}>Рейтинг</button>
            <button onClick={()=>scrollTo("steps")}>О платформе</button>
          </div>
          <div>#pravo_sport · HR-команда</div>
        </footer>
      </main>
    </div>
  );
}

// Светлый личный кабинет: результаты, подтверждения, активность и записи на события.
function LightCabinet({setPage,challenges=CHALLENGES,events=[],results=[],registeredEvents=[],onSubmitResult,onToggleEvent}){
  const [activeChallenge,setActiveChallenge]=useState(null);
  const [value,setValue]=useState("");
  const [comment,setComment]=useState("");
  const [proof,setProof]=useState(null);
  const totalSteps=results.filter(r=>r.type==="steps").reduce((sum,r)=>sum+Number(r.value||0),8100);
  const totalPoints=42+results.reduce((sum,r)=>sum+Number(r.points||0),0);
  const submit=e=>{
    e.preventDefault();
    if(!value||!activeChallenge)return;
    onSubmitResult({id:Date.now(),challengeId:activeChallenge.id,challengeTitle:activeChallenge.title,type:activeChallenge.type,value:Number(value),comment,proofName:proof?.name||"",date:new Date().toLocaleString("ru-RU"),points:Math.max(1,Math.min(20,Number(value)/1000))});
    setValue("");setComment("");setProof(null);setActiveChallenge(null);
  };
  const card={...lg(0.88),borderRadius:20,padding:"22px 24px"};
  return(
    <div className="light-shell" style={{background:"#FCFAFF",color:BD,minHeight:"100vh",position:"relative",overflowX:"hidden",fontFamily:"'Open Sans',-apple-system,system-ui,sans-serif"}}>
      <Blob top={-100} left={-100} size={380} color="#EDE1FB" delay={0}/><Blob top={700} right={-120} size={340} color="#E1F3FB" delay={2}/>
      <div style={{position:"relative",zIndex:2,maxWidth:1120,margin:"0 auto",padding:"32px 32px 64px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
          <button onClick={()=>setPage("light")} className="plain-link">← На главную</button>
          <button onClick={()=>setPage("admin")} className="plain-link">Панель администратора →</button>
        </div>
        <div className="profile-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}><div className="avatar">Д</div><div><h1 style={{fontSize:26,margin:0}}>Добрый день, Диана! 👋</h1><div className="muted">Стабильность сегодня — большие победы завтра</div></div></div>
          <span className="role-pill">Сотрудник право(тех)</span>
        </div>
        <div className="metrics-grid">
          {[{v:5,l:"дней подряд",c:BP},{v:4,l:"место в рейтинге",c:"#0891B2"},{v:Math.round(totalSteps/1000),l:"тыс. шагов",c:BP},{v:results.length+3,l:"активности",c:"#0891B2"}].map((m,i)=><div key={i} style={card}><div style={{fontSize:30,fontWeight:800,color:m.c}}>{m.v}</div><div className="muted">{m.l}</div></div>)}
        </div>
        <div className="cabinet-grid">
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section style={card}><div className="section-title"><span>Мои челленджи</span><span style={{color:BP,fontSize:13}}>⭐ {totalPoints.toFixed(1)}</span></div>
              {challenges.slice(0,4).map((c,i)=>{const own=results.filter(r=>r.challengeId===c.id).reduce((s,r)=>s+Number(r.value||0),0);const base=[60,25,10,5][i]||0;const progress=Math.min(100,base+own/1000);return <div key={c.id} className="challenge-row"><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{c.emoji} {c.title}</b><button className="mini-btn" onClick={()=>setActiveChallenge(c)}>+ Результат</button></div><div className="progress-track"><div style={{width:`${progress}%`}}/></div><div className="muted" style={{fontSize:11}}>{progress.toFixed(0)}% · внесено: {own.toLocaleString("ru-RU")}</div></div>})}
            </section>
            <section style={card}><div className="section-title">Последняя активность</div>{results.length===0?<div className="empty-state">После внесения результата здесь появится история активности.</div>:results.slice().reverse().slice(0,6).map(r=><div key={r.id} className="activity-row"><div className="activity-icon">✓</div><div style={{flex:1}}><b>{r.challengeTitle}</b><div className="muted" style={{fontSize:11}}>{r.date}{r.proofName?` · 📎 ${r.proofName}`:""}</div></div><strong style={{color:BP}}>{Number(r.value).toLocaleString("ru-RU")}</strong></div>)}</section>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section style={card}><div className="section-title">Ближайшие события</div>{events.map((e,i)=>{const joined=registeredEvents.includes(e.id);return <div key={e.id} className="event-row" style={{borderTop:i?"1px solid #ece4f5":"none"}}><div className="event-date"><small>{e.day}</small><b>{e.date}</b></div><div style={{flex:1}}><b>{e.title}</b><div className="muted" style={{fontSize:11}}>{e.place} · {e.kind||"Событие"}</div></div><button className={joined?"mini-btn active":"mini-btn"} onClick={()=>onToggleEvent(e.id)}>{joined?"Записана ✓":"Записаться"}</button></div>})}</section>
            <section style={card}><div className="section-title">Достижения</div><div className="achievement-grid">{[{e:"🔥",l:"7 дней подряд"},{e:"🏊",l:"10 км плавания"},{e:"👟",l:"Первый результат"},{e:"🚴",l:"Велопрогулка"}].map((a,i)=><div key={i} className="achievement"><span>{a.e}</span><small>{a.l}</small></div>)}</div></section>
          </div>
        </div>
      </div>
      {activeChallenge&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setActiveChallenge(null)}><form className="light-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setActiveChallenge(null)}>×</button><h2>{activeChallenge.emoji} {activeChallenge.title}</h2><p className="muted">Внесите результат — прогресс и баллы пересчитаются автоматически.</p><label>Результат<input type="number" min="1" required value={value} onChange={e=>setValue(e.target.value)} placeholder="Например, 8500"/></label><label>Комментарий<textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Как прошла активность?"/></label><label className="upload-box">📎 {proof?proof.name:"Прикрепить фото или файл"}<input type="file" accept="image/*,.pdf" onChange={e=>setProof(e.target.files?.[0]||null)}/></label><div className="points-preview">Будет начислено: +{Math.max(0,Math.min(20,Number(value||0)/1000)).toFixed(1)} ⭐</div><button className="primary-btn" type="submit">Сохранить результат</button></form></div>}
    </div>
  );
}

function AdminPanel({setPage,challenges,events,news,onAddChallenge,onAddEvent,onAddNews}){
  const [tab,setTab]=useState("challenge");
  const [form,setForm]=useState({title:"",desc:"",date:"",place:"",kind:"Челлендж",emoji:"🏃",text:"",image:""});
  const change=(k,v)=>setForm(p=>({...p,[k]:v}));
  const submit=e=>{e.preventDefault();if(!form.title.trim())return;if(tab==="challenge")onAddChallenge(form);if(tab==="event")onAddEvent(form);if(tab==="news")onAddNews(form);setForm({title:"",desc:"",date:"",place:"",kind:"Челлендж",emoji:"🏃",text:"",image:""});};
  return <div className="light-shell" style={{background:"#F8F5FC",color:BD,minHeight:"100vh",padding:"32px",fontFamily:"'Open Sans',system-ui,sans-serif"}}><div style={{maxWidth:1120,margin:"0 auto"}}><div className="admin-head"><div><button onClick={()=>setPage("light")} className="plain-link">← На главную</button><h1>Панель администратора</h1><p className="muted">Управление контентом и спортивной программой</p></div><div className="role-pill">Администратор</div></div><div className="admin-stats">{[{v:challenges.length,l:"челленджей"},{v:events.length,l:"событий"},{v:news.length,l:"публикаций"},{v:"200+",l:"участников"}].map((s,i)=><div key={i} className="stat-card"><strong>{s.v}</strong><span>{s.l}</span></div>)}</div><div className="admin-grid"><form className="admin-form" onSubmit={submit}><div className="admin-tabs">{[["challenge","Челлендж"],["event","Событие"],["news","Новость / анонс"]].map(([id,l])=><button type="button" key={id} onClick={()=>setTab(id)} className={tab===id?"active":""}>{l}</button>)}</div><h2>{tab==="challenge"?"Запустить новый челлендж":tab==="event"?"Добавить событие":"Опубликовать новость"}</h2><label>Название<input value={form.title} onChange={e=>change("title",e.target.value)} required/></label>{tab!=="news"&&<><label>Описание<textarea value={form.desc} onChange={e=>change("desc",e.target.value)}/></label><div className="form-row"><label>Дата<input type="date" value={form.date} onChange={e=>change("date",e.target.value)}/></label><label>Место / ссылка<input value={form.place} onChange={e=>change("place",e.target.value)} placeholder="Zoom или адрес"/></label></div></>}{tab==="news"&&<><label>Текст<textarea value={form.text} onChange={e=>change("text",e.target.value)}/></label><label>Фото<input type="file" accept="image/*" onChange={e=>change("image",e.target.files?.[0]?.name||"")}/></label></>}<button className="primary-btn" type="submit">{tab==="news"?"Опубликовать":"Сохранить и запустить"}</button></form><aside className="admin-list"><h2>Последние изменения</h2>{[...news.slice(0,3).map(x=>({e:x.emoji||"📢",t:x.title,s:"Публикация"})),...challenges.slice(0,3).map(x=>({e:x.emoji,t:x.title,s:x.statusLabel}))].slice(0,6).map((x,i)=><div key={i} className="admin-list-row"><span>{x.e}</span><div><b>{x.t}</b><small>{x.s}</small></div></div>)}</aside></div></div></div>;
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
  const load=(key,fallback)=>{try{const saved=localStorage.getItem(key);return saved?JSON.parse(saved):fallback;}catch{return fallback;}};
  const [news,setNews]=useState(()=>load("pravo-sport-news",INIT_NEWS));
  const [appChallenges,setAppChallenges]=useState(()=>load("pravo-sport-challenges",CHALLENGES));
  const [events,setEvents]=useState(()=>load("pravo-sport-events",[
    {id:"e1",date:"17",day:"СБ",title:"Утренний забег",place:"Парк Горького",kind:"Офлайн"},
    {id:"e2",date:"20",day:"ВТ",title:"Йога онлайн",place:"Zoom",kind:"Видеовстреча"},
    {id:"e3",date:"24",day:"СБ",title:"Велопрогулка",place:"Воробьёвы горы",kind:"Челлендж"},
  ]));
  const [results,setResults]=useState(()=>load("pravo-sport-results",[]));
  const [registeredEvents,setRegisteredEvents]=useState(()=>load("pravo-sport-registered",["e1","e2"]));
  const [signedIn,setSignedIn]=useState(()=>load("pravo-sport-signed",false));
  const [showLogin,setShowLogin]=useState(false);
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

  useEffect(()=>{localStorage.setItem("pravo-sport-news",JSON.stringify(news));},[news]);
  useEffect(()=>{localStorage.setItem("pravo-sport-challenges",JSON.stringify(appChallenges));},[appChallenges]);
  useEffect(()=>{localStorage.setItem("pravo-sport-events",JSON.stringify(events));},[events]);
  useEffect(()=>{localStorage.setItem("pravo-sport-results",JSON.stringify(results));},[results]);
  useEffect(()=>{localStorage.setItem("pravo-sport-registered",JSON.stringify(registeredEvents));},[registeredEvents]);
  useEffect(()=>{localStorage.setItem("pravo-sport-signed",JSON.stringify(signedIn));},[signedIn]);

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
  const login=role=>{setSignedIn(true);setIsAdmin(role==="admin");setShowLogin(false);setPage(role==="admin"?"admin":"cabinet-light");};
  const addResult=result=>{setResults(p=>[...p,result]);notify("Результат сохранён, прогресс обновлён");};
  const toggleEvent=id=>setRegisteredEvents(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const adminAddChallenge=form=>{setAppChallenges(p=>[{id:`c${Date.now()}`,emoji:form.emoji||"🏃",title:form.title,desc:form.desc||"Новый корпоративный челлендж",participants:0,status:"active",statusLabel:"Активный",color:BP,daysLeft:30,type:"steps",bg:"linear-gradient(135deg,#EDE1FB,#D9E8FB)"},...p]);notify("Челлендж запущен");};
  const adminAddEvent=form=>{const d=form.date?new Date(`${form.date}T12:00:00`):new Date();setEvents(p=>[{id:`e${Date.now()}`,date:String(d.getDate()).padStart(2,"0"),day:d.toLocaleDateString("ru-RU",{weekday:"short"}).toUpperCase(),title:form.title,place:form.place||"Онлайн",kind:form.kind||"Событие"},...p]);notify("Событие добавлено");};
  const adminAddNews=form=>{setNews(p=>[{id:Date.now(),title:form.title,cat:"Анонс",date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),text:form.text||"Новая публикация",emoji:form.emoji||"📢",imageName:form.image,bg:"linear-gradient(160deg,#F3EEFA,#E9F6EF)"},...p]);notify("Публикация добавлена");};

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
        .light-shell *{box-sizing:border-box}.plain-link{background:none;border:0;padding:0;color:#8C26EA;font-weight:700;cursor:pointer}.muted{color:#756f7e;margin-top:4px}.avatar{width:58px;height:58px;border-radius:50%;background:#8C26EA;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}.role-pill{background:#fff;border:1px solid #eadff5;border-radius:999px;padding:8px 16px;color:#8C26EA;font-size:12px;font-weight:800;box-shadow:0 8px 22px rgba(76,29,149,.08)}
        .metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}.cabinet-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:20px}.section-title{display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:800;margin-bottom:16px}.challenge-row{padding:13px 0;border-top:1px solid #eee7f5}.challenge-row:first-of-type{border-top:0}.progress-track{height:6px;background:#eee7f5;border-radius:99px;margin:9px 0 6px;overflow:hidden}.progress-track>div{height:100%;background:linear-gradient(90deg,#8C26EA,#A78BFA);border-radius:99px}.mini-btn{border:1px solid #e4d5f1;background:#fff;color:#8C26EA;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer}.mini-btn.active{background:#8C26EA;color:#fff}.activity-row,.event-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid #eee7f5}.activity-icon{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#e9f8ef;color:#08783f;font-weight:900}.event-date{width:38px;text-align:center;display:flex;flex-direction:column}.event-date small{color:#8a8494}.achievement-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.achievement{background:#f5edfc;border:1px solid #e4cff7;border-radius:12px;padding:12px 6px;text-align:center}.achievement span{display:block;font-size:20px}.achievement small{font-size:9px;color:#6a6472}.empty-state{padding:20px;border:1px dashed #d8cae6;border-radius:14px;color:#8a8494;font-size:13px;text-align:center}
        .modal-backdrop{position:fixed;inset:0;background:rgba(13,6,40,.48);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(7px)}.light-modal{position:relative;width:min(480px,100%);background:#fff;border-radius:24px;padding:28px;box-shadow:0 30px 90px rgba(13,6,40,.25);display:flex;flex-direction:column;gap:14px}.light-modal h2{margin:0}.light-modal label,.admin-form label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700}.light-modal input,.light-modal textarea,.admin-form input,.admin-form textarea{width:100%;border:1px solid #e3d9ed;border-radius:11px;padding:11px 12px;font:inherit;outline:none}.light-modal textarea,.admin-form textarea{min-height:86px;resize:vertical}.modal-close{position:absolute;top:14px;right:16px;border:0;background:none;font-size:25px;cursor:pointer;color:#817989}.upload-box{border:1px dashed #cdb8df!important;border-radius:12px;padding:13px;color:#8C26EA;cursor:pointer}.upload-box input{display:none}.points-preview{background:#f5edfc;border-radius:10px;padding:10px;color:#8C26EA;font-size:12px;font-weight:700}.primary-btn{border:0;border-radius:12px;background:#8C26EA;color:#fff;padding:12px 18px;font-weight:800;cursor:pointer;box-shadow:0 8px 22px rgba(140,38,234,.25)}
        .admin-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}.admin-head h1{margin:18px 0 4px;font-size:32px}.admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}.stat-card,.admin-form,.admin-list{background:#fff;border:1px solid #eadff5;border-radius:20px;padding:22px;box-shadow:0 10px 35px rgba(76,29,149,.06)}.stat-card strong{display:block;color:#8C26EA;font-size:29px}.stat-card span{font-size:12px;color:#756f7e}.admin-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:20px}.admin-form{display:flex;flex-direction:column;gap:14px}.admin-form h2,.admin-list h2{margin:4px 0 8px}.admin-tabs{display:flex;gap:6px;flex-wrap:wrap}.admin-tabs button{border:0;border-radius:999px;padding:8px 12px;background:#f3eef8;color:#6d6476;font-weight:700;cursor:pointer}.admin-tabs button.active{background:#8C26EA;color:#fff}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.admin-list-row{display:flex;gap:12px;padding:12px 0;border-top:1px solid #eee7f5}.admin-list-row>span{font-size:23px}.admin-list-row b,.admin-list-row small{display:block}.admin-list-row small{margin-top:3px;color:#8a8494}.login-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.login-choice{border:1px solid #e3d9ed;border-radius:16px;background:#fff;padding:18px;text-align:left;cursor:pointer}.login-choice b{display:block;margin-bottom:5px}.login-choice span{font-size:12px;color:#756f7e}
        @media(max-width:820px){.metrics-grid,.admin-stats{grid-template-columns:repeat(2,1fr)}.cabinet-grid,.admin-grid{grid-template-columns:1fr}.profile-head,.admin-head{align-items:flex-start;flex-direction:column}.achievement-grid{grid-template-columns:repeat(2,1fr)}.form-row{grid-template-columns:1fr}.login-actions{grid-template-columns:1fr}}
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
      {page==="light"&&<LightHome setPage={setPage} challenges={appChallenges} news={news} signedIn={signedIn} isAdmin={isAdmin} onLogin={()=>setShowLogin(true)}/>}
      {page==="cabinet-light"&&<LightCabinet setPage={setPage} challenges={appChallenges} events={events} results={results} registeredEvents={registeredEvents} onSubmitResult={addResult} onToggleEvent={toggleEvent}/>}
      {page==="admin"&&<AdminPanel setPage={setPage} challenges={appChallenges} events={events} news={news} onAddChallenge={adminAddChallenge} onAddEvent={adminAddEvent} onAddNews={adminAddNews}/>}

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
      {showLogin&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowLogin(false)}><div className="light-modal"><button className="modal-close" onClick={()=>setShowLogin(false)}>×</button><h2>Вход в право(спорт)</h2><p className="muted">Выберите роль для демонстрации интерфейса.</p><div className="login-actions"><button className="login-choice" onClick={()=>login("employee")}><b>👤 Сотрудник</b><span>Челленджи, результаты и события</span></button><button className="login-choice" onClick={()=>login("admin")}><b>⚙️ Администратор</b><span>Контент и запуск активностей</span></button></div></div></div>}
    </div>
  );
}
