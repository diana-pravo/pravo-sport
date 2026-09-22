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

// ============ MINIMAL VARIANT (editorial redesign) ============
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
  const [page,setPage]=useState("home");
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
      {page!=="minimal"&&(
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
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPage("minimal")} className="hov-btn" style={{background:"transparent",color:"#666",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>Минимал-версия</button>
          <button onClick={()=>setIsAdmin(!isAdmin)} className="hov-btn" style={{background:"transparent",color:isAdmin?"#A78BFA":"#444",border:`1px solid ${isAdmin?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>{isAdmin?"✓ Автор":"Режим автора"}</button>
          <button onClick={()=>setPage("challenges")} className="hov-btn" style={{background:P,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 14px ${P}50`}}>Участвовать →</button>
        </div>
      </nav>
      )}

      {/* ── MINIMAL VARIANT — редакционный минимализм, для сравнения ── */}
      {page==="minimal"&&<MinimalHome setPage={setPage}/>}

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
