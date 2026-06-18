import { useState } from "react";

const P="#7C3AED",PL="#EDE9FE",PD="#4C1D95",SB="#1A1333",SA="#2D1B69";
const SPORT_COLORS={steps:"#7C3AED",run:"#059669",swim:"#0891B2",bike:"#D97706",photo:"#DB2777",custom:"#6B7280"};
const COLORS=["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#DB2777","#0891B2"];
const colFor=s=>COLORS[Math.abs([...String(s||"x")].reduce((a,c)=>a+c.charCodeAt(0),0))%COLORS.length];
const ini=n=>String(n||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

const TYPES=[{id:"steps",e:"👟",label:"Шаги"},{id:"swim",e:"🏊",label:"Плавание"},{id:"bike",e:"🚴",label:"Велогонка"},{id:"run",e:"🏃",label:"Бег"},{id:"photo",e:"📸",label:"Фото"},{id:"custom",e:"✏️",label:"Свой"}];
const FORMATS=[{id:"norm",label:"Норма — X дней подряд"},{id:"unlimited",label:"Безлимит — общая сумма"}];

const ALL_COLLEAGUES=[
  {id:"u1",name:"Алексей Ковалёв",role:"Backend",gender:"m"},
  {id:"u2",name:"Мария Петрова",role:"HR",gender:"f"},
  {id:"u3",name:"Иван Сидоров",role:"Frontend",gender:"m"},
  {id:"u4",name:"Ольга Смирнова",role:"Design",gender:"f"},
  {id:"u5",name:"Дмитрий Волков",role:"QA",gender:"m"},
  {id:"u6",name:"Анна Фёдорова",role:"PM",gender:"f"},
];

const CHALLENGES=[
  {id:"c1",title:"Шаговый май",emoji:"👟",type:"steps",format:"norm",norm:6000,duration:10,
   points_pool:30,points_per_day:3,bonus_top1:10,bonus_top3:5,
   status:"active",end_at:"2025-05-31",
   description:"10 дней подряд — минимум 6 000 шагов ежедневно",
   rules:"Загружай скриншот шагов каждый день. Засчитывается от 6 000 шагов.",
   entries:[
     {uid:"u1",days:8,total:87000,gender:"m",merchi:24,delta:1},
     {uid:"u2",days:7,total:74000,gender:"f",merchi:21,delta:0},
     {uid:"u3",days:6,total:68000,gender:"m",merchi:18,delta:-1},
     {uid:"me",days:5,total:42000,gender:"f",merchi:15,delta:2},
     {uid:"u4",days:4,total:38000,gender:"f",merchi:12,delta:0},
   ]},
  {id:"c2",title:"Бег — Этап 1",emoji:"🏃",type:"run",format:"unlimited",
   points_pool:50,points_per_day:0,bonus_top1:15,bonus_top3:8,
   status:"active",end_at:"2025-06-30",
   description:"Набери максимальное количество км за июнь",
   rules:"Загружай дистанцию и скриншот тренировки. Рейтинг по км, м/ж отдельно.",
   entries:[
     {uid:"u3",days:0,total:82,gender:"m",merchi:0,km:82,delta:0},
     {uid:"u5",days:0,total:67,gender:"m",merchi:0,km:67,delta:1},
     {uid:"u1",days:0,total:55,gender:"m",merchi:0,km:55,delta:-1},
     {uid:"u2",days:0,total:48,gender:"f",merchi:0,km:48,delta:0},
   ]},
];

const SEASON=[
  {uid:"u1",name:"Алексей К.",merchi:87,gender:"m",prev:2},
  {uid:"u3",name:"Иван С.",merchi:74,gender:"m",prev:1},
  {uid:"u2",name:"Мария П.",merchi:68,gender:"f",prev:3},
  {uid:"me",name:"Диана",merchi:42,gender:"f",prev:6},
  {uid:"u5",name:"Дмитрий В.",merchi:38,gender:"m",prev:4},
];

const ANNOUNCEMENTS=[
  {id:"an1",month:"Июнь",title:"Плавание / Вело / Бег — Этап 1",emoji:"🏊",type:"swim",desc:"Три дисциплины, рейтинг по км.",date:"1 июня",registered:false,reminded:false,days_to:14},
  {id:"an2",month:"Июль",title:"Шаговый челлендж",emoji:"👟",type:"steps",desc:"10 дней подряд, 6 000 шагов в день.",date:"1 июля",registered:false,reminded:false,days_to:44},
  {id:"an3",month:"Август",title:"Благотворительный забег",emoji:"❤️",type:"run",desc:"Шаги в пользу доброго дела.",date:"1 августа",registered:false,reminded:false,days_to:75},
  {id:"an4",month:"Сентябрь",title:"Челлендж по планке",emoji:"💪",type:"custom",desc:"Ежедневная планка на время.",date:"1 сентября",registered:false,reminded:false,days_to:106},
];

const ARCHIVE=[
  {id:"ar1",title:"Шаговый март",emoji:"👟",type:"steps",end_at:"31 марта 2025",winner_m:"Иван С.",winner_f:"Мария П.",participants:18,total_steps:"1 240 000"},
  {id:"ar2",title:"Фото-апрель",emoji:"📸",type:"photo",end_at:"30 апреля 2025",winner_m:"Алексей К.",winner_f:"Ольга С.",participants:22,total_steps:"—"},
];

const INIT_FEED=[
  {id:"f1",uid:"u1",chid:"ch1",cid:"c1",ts:"10:42",txt:"8 200 шагов — день 8! 🔥",metric:"8 200",unit:"шагов",likes:3,liked:false},
  {id:"f2",uid:"u2",chid:"ch1",cid:"c1",ts:"11:15",txt:"7 800 шагов — день 7 выполнен! Чуть не уснула но дошла 😅",metric:"7 800",unit:"шагов",likes:5,liked:false},
  {id:"f3",uid:"u3",chid:"ch1",cid:"c1",ts:"12:03",txt:"11 200 шагов — личный рекорд! Обошёл весь парк Горького 🏃",metric:"11 200",unit:"шагов",likes:7,liked:false},
  {id:"f4",uid:"me",chid:"ch1",cid:"c1",ts:"15:00",txt:"8 100 шагов — дошла до офиса пешком через набережную!",metric:"8 100",unit:"шагов",likes:4,liked:false},
];

const INIT_CHANNELS=[
  {id:"ch1",name:"pravo_sport",emoji:"🏃",desc:"Главный канал",members:["me","u1","u2","u3","u4"],isDefault:true},
  {id:"ch2",name:"runners",emoji:"🏃",desc:"Любители бега",members:["me","u1","u3"]},
];

const getUser=id=>{
  if(id==="me")return{name:"Диана",id:"me",gender:"f"};
  return ALL_COLLEAGUES.find(c=>c.id===id)||{name:id,id};
};

const Av=({uid,size=32})=>{
  const u=getUser(uid);
  return <div style={{width:size,height:size,borderRadius:"50%",background:colFor(uid),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.33,fontWeight:600,color:"#fff",flexShrink:0}}>{ini(u.name)}</div>;
};

const Medal=({r})=>r<=3?<span style={{fontSize:15}}>{"🥇🥈🥉"[r-1]}</span>:<span style={{fontSize:12,color:"#9CA3AF",width:22,textAlign:"center",display:"inline-block"}}>{r}</span>;

const Delta=({d})=>{
  if(!d)return null;
  return <span style={{fontSize:10,fontWeight:500,color:d>0?"#059669":"#DC2626",background:d>0?"#D1FAE5":"#FEE2E2",borderRadius:4,padding:"1px 5px"}}>{d>0?`↑${d}`:`↓${Math.abs(d)}`}</span>;
};

const SportTag=({type})=>{
  const t=TYPES.find(x=>x.id===type)||TYPES[0];
  const c=SPORT_COLORS[type]||"#6B7280";
  return <span style={{fontSize:10,background:c+"18",color:c,padding:"2px 8px",borderRadius:999,fontWeight:500,border:`1px solid ${c}30`}}>{t.e} {t.label}</span>;
};

const Merchi=({n,size="sm"})=>(
  <span style={{display:"inline-flex",alignItems:"center",gap:3,background:"#FEF9C3",color:"#854D0E",borderRadius:999,padding:size==="sm"?"2px 8px":"4px 12px",fontSize:size==="sm"?11:14,fontWeight:600,border:"1px solid #FDE047"}}>
    ⭐ {n}
  </span>
);

const CircleProgress=({value,max,size=64,color=P})=>{
  const r=26,circ=2*Math.PI*r;
  const pct=Math.min(value/max,1);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#EDE9FE" strokeWidth="6"/>
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
        strokeLinecap="round" transform="rotate(-90 32 32)"/>
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={color}>{value}</text>
      <text x="32" y="44" textAnchor="middle" fontSize="8" fill="#9CA3AF">из {max}</text>
    </svg>
  );
};

export default function App(){
  const [view,setView]=useState("channel");
  const [activeC,setActiveC]=useState(CHALLENGES[0]);
  const [challenges,setChallenges]=useState(CHALLENGES);
  const [channels,setChannels]=useState(INIT_CHANNELS);
  const [activeCh,setActiveCh]=useState(INIT_CHANNELS[0]);
  const [feed,setFeed]=useState(INIT_FEED);
  const [announcements,setAnnouncements]=useState(ANNOUNCEMENTS);
  const [input,setInput]=useState("");
  const [adminTab,setAdminTab]=useState("challenges");
  const [adminSub,setAdminSub]=useState("list");
  const [boardTab,setBoardTab]=useState("current");
  const [genderFilter,setGenderFilter]=useState("all");
  const [newChal,setNewChal]=useState({title:"",emoji:"🏆",type:"steps",format:"norm",norm:6000,duration:10,points_pool:30,points_per_day:3,bonus_top1:10,bonus_top3:5,days:30,description:"",rules:"",zacet:"personal"});
  const [newCh,setNewCh]=useState({name:"",emoji:"💬",desc:""});
  const [selCh,setSelCh]=useState(null);
  const [memberSearch,setMemberSearch]=useState("");
  const [showAddMember,setShowAddMember]=useState(false);
  const [toast,setToast]=useState(null);

  const notify=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const myEntry=activeC.entries?.find(e=>e.uid==="me");
  const sportColor=SPORT_COLORS[activeC.type]||P;
  const daysLeft=Math.max(0,Math.ceil((new Date(activeC.end_at)-Date.now())/864e5));

  const submitResult=()=>{
    if(!input.trim())return;
    const isNum=/^\d+$/.test(input.trim().replace(/\s/g,""));
    const val=input.trim();
    setFeed(p=>[...p,{id:`f${Date.now()}`,uid:"me",chid:activeCh.id,cid:activeC.id,
      ts:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}),
      txt:val,metric:isNum?val:null,unit:activeC.type==="steps"?"шагов":"км",
      likes:0,liked:false}]);
    setInput("");
    if(isNum)notify("✓ Результат принят! +3 мерча 🌟");
  };

  const toggleLike=id=>setFeed(p=>p.map(m=>m.id===id?{...m,liked:!m.liked,likes:m.liked?m.likes-1:m.likes+1}:m));
  const toggleRegister=(id,type)=>{
    setAnnouncements(p=>p.map(a=>a.id===id?{...a,[type]:!a[type]}:a));
    notify(type==="registered"?"Зарегистрирован(а)! Ждём тебя 🎉":"Напомним за 3 дня до старта 🔔");
  };

  const createChallenge=()=>{
    if(!newChal.title){notify("Заполни название",false);return;}
    const c={...newChal,id:`c${Date.now()}`,status:"draft",entries:[],
      start_at:new Date().toISOString().slice(0,10),
      end_at:new Date(Date.now()+newChal.days*864e5).toISOString().slice(0,10)};
    setChallenges(p=>[...p,c]);
    notify(`Челлендж «${c.title}» создан!`);
    setAdminSub("list");
  };

  const navItems=[
    {id:"channel",icon:"ti-hash",label:"pravo_sport"},
    {id:"leaderboard",icon:"ti-trophy",label:"Рейтинг"},
    {id:"announcements",icon:"ti-calendar-event",label:"Анонсы"},
    {id:"archive",icon:"ti-archive",label:"Архив"},
    {id:"admin",icon:"ti-settings",label:"Администратор"},
  ];

  return(
    <div style={{display:"flex",height:620,background:"#F8F7FF",fontFamily:"system-ui,sans-serif",borderRadius:12,overflow:"hidden",border:"1px solid #E0DAF5"}}>
      {toast&&<div style={{position:"absolute",top:14,right:14,zIndex:99,background:toast.ok?"#D1FAE5":"#FEE2E2",color:toast.ok?"#065F46":"#991B1B",padding:"9px 16px",borderRadius:10,fontSize:13,fontWeight:500,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>{toast.msg}</div>}

      {/* SIDEBAR */}
      <div style={{width:216,background:SB,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-0.5px"}}>
            право<span style={{color:"#A78BFA"}}>(тех)</span>
          </div>
          <div style={{fontSize:10,color:"#6B5FA8",marginTop:2,letterSpacing:"0.04em"}}>КОРПОРАТИВНЫЙ СПОРТ</div>
        </div>

        <div style={{padding:"8px 0",flex:1,overflowY:"auto"}}>
          <div style={{fontSize:9,color:"#4B4570",fontWeight:600,padding:"10px 16px 4px",letterSpacing:".1em",textTransform:"uppercase"}}>Навигация</div>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>setView(item.id)}
              style={{display:"flex",alignItems:"center",gap:9,padding:"8px 14px 8px 16px",cursor:"pointer",
                borderLeft:`3px solid ${view===item.id?P:"transparent"}`,
                background:view===item.id?"rgba(124,58,237,0.12)":"transparent",
                color:view===item.id?"#C4B5FD":"#6B7280",fontSize:13,transition:"all .15s"}}>
              <i className={`ti ${item.icon}`} style={{fontSize:16,flexShrink:0}} aria-hidden="true"/>
              {item.label}
              {item.id==="announcements"&&<span style={{marginLeft:"auto",background:P,color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:999,fontWeight:600}}>{announcements.length}</span>}
            </div>
          ))}

          <div style={{fontSize:9,color:"#4B4570",fontWeight:600,padding:"12px 16px 4px",letterSpacing:".1em",textTransform:"uppercase"}}>Каналы</div>
          {channels.map(ch=>(
            <div key={ch.id} onClick={()=>{setActiveCh(ch);setView("channel");}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px 6px 16px",cursor:"pointer",
                borderLeft:`3px solid ${activeCh?.id===ch.id&&view==="channel"?P:"transparent"}`,
                background:activeCh?.id===ch.id&&view==="channel"?"rgba(124,58,237,0.12)":"transparent",
                color:activeCh?.id===ch.id&&view==="channel"?"#C4B5FD":"#6B7280",fontSize:12}}>
              <span style={{opacity:.7}}>#</span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{ch.name}</span>
              <span style={{fontSize:10,color:"#4B4570"}}>{ch.members.length}</span>
            </div>
          ))}

          <div style={{fontSize:9,color:"#4B4570",fontWeight:600,padding:"12px 16px 4px",letterSpacing:".1em",textTransform:"uppercase"}}>Челленджи</div>
          {challenges.map(c=>(
            <div key={c.id} onClick={()=>{setActiveC(c);setView("channel");}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px 6px 16px",cursor:"pointer",
                borderLeft:`3px solid ${activeC.id===c.id&&view==="channel"?(SPORT_COLORS[c.type]||P):"transparent"}`,
                background:activeC.id===c.id&&view==="channel"?"rgba(124,58,237,0.12)":"transparent",
                color:activeC.id===c.id&&view==="channel"?"#C4B5FD":"#6B7280",fontSize:12}}>
              <span>{c.emoji}</span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{c.title}</span>
              {c.status==="active"&&<span style={{width:6,height:6,borderRadius:"50%",background:"#34D399",flexShrink:0}}/>}
            </div>
          ))}
        </div>

        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:8}}>
          <Av uid="me" size={28}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:"#E2D9F3",fontWeight:600}}>Диана</div>
            {myEntry&&<Merchi n={myEntry.merchi}/>}
          </div>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#34D399"}}/>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ── CHANNEL ── */}
        {view==="channel"&&(
          <>
            {/* Hero header — Strava/Peloton style */}
            <div style={{background:PD,padding:"16px 20px 0",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:sportColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{activeC.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:700,color:"#fff"}}>{activeC.title}</div>
                  <div style={{fontSize:12,color:"#C4B5FD",marginTop:2}}>{activeC.description}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:26,fontWeight:700,color:"#fff",lineHeight:1}}>{daysLeft}</div>
                  <div style={{fontSize:10,color:"#8B7FC7"}}>дней</div>
                </div>
              </div>
              {/* Stats strip */}
              <div style={{display:"flex",gap:1,marginBottom:0}}>
                {[
                  {label:"Участников",val:activeC.entries?.length||0},
                  {label:"Фонд",val:`${activeC.points_pool} ⭐`},
                  {label:"Топ-1 бонус",val:`+${activeC.bonus_top1} ⭐`},
                  {label:activeC.format==="norm"?"Норма/день":"Тип",val:activeC.format==="norm"?`${activeC.norm?.toLocaleString("ru")} шагов`:TYPES.find(t=>t.id===activeC.type)?.label},
                ].map((s,i)=>(
                  <div key={i} style={{flex:1,background:"rgba(255,255,255,.08)",padding:"7px 10px",borderRadius:i===0?"8px 0 0 0":i===3?"0 8px 0 0":"0"}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#E9D5FF"}}>{s.val}</div>
                    <div style={{fontSize:10,color:"#8B7FC7"}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* My progress bar (norm format) */}
            {activeC.format==="norm"&&myEntry&&(
              <div style={{background:"#fff",padding:"10px 20px",borderBottom:"1px solid #EDE9FE",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
                <CircleProgress value={myEntry.days} max={activeC.duration} color={sportColor}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1F2937",marginBottom:2}}>Мой прогресс</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {Array.from({length:activeC.duration},(_,i)=>(
                      <div key={i} style={{width:18,height:18,borderRadius:4,background:i<myEntry.days?sportColor:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {i<myEntry.days&&<span style={{fontSize:9,color:"#fff"}}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <Merchi n={myEntry.merchi} size="md"/>
              </div>
            )}

            <div style={{display:"flex",flex:1,overflow:"hidden"}}>
              {/* Feed */}
              <div style={{flex:1,overflowY:"auto",padding:"12px 20px"}}>
                {feed.filter(f=>f.chid===activeCh.id).length===0&&(
                  <div style={{textAlign:"center",padding:"48px 20px",color:"#9CA3AF"}}>
                    <div style={{fontSize:36,marginBottom:10}}>{activeCh.emoji}</div>
                    <div style={{fontSize:14,fontWeight:500,color:"#6B7280"}}>Добро пожаловать в #{activeCh.name}</div>
                    <div style={{fontSize:12,marginTop:4}}>Поделись первым результатом!</div>
                  </div>
                )}
                {feed.filter(f=>f.chid===activeCh.id).map((msg,i,arr)=>{
                  const u=getUser(msg.uid);
                  const showHeader=i===0||arr[i-1].uid!==msg.uid;
                  return(
                    <div key={msg.id} style={{marginBottom:10}}>
                      {showHeader&&(
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                          <Av uid={msg.uid} size={30}/>
                          <span style={{fontSize:13,fontWeight:600,color:msg.uid==="me"?P:"#1F2937"}}>{u.name}</span>
                          <span style={{fontSize:11,color:"#9CA3AF"}}>{msg.ts}</span>
                        </div>
                      )}
                      {/* Activity card — Strava style */}
                      {msg.metric?(
                        <div style={{marginLeft:38,background:"#fff",border:`1.5px solid ${sportColor}30`,borderLeft:`3px solid ${sportColor}`,borderRadius:"0 10px 10px 10px",padding:"10px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{textAlign:"center",background:sportColor+"12",borderRadius:8,padding:"8px 14px"}}>
                              <div style={{fontSize:22,fontWeight:700,color:sportColor,lineHeight:1}}>{parseInt(msg.metric).toLocaleString("ru")}</div>
                              <div style={{fontSize:10,color:sportColor,fontWeight:500}}>{msg.unit}</div>
                            </div>
                            <div style={{flex:1,fontSize:13,color:"#374151",lineHeight:1.5}}>{msg.txt}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,paddingTop:6,borderTop:"1px solid #F5F3FF"}}>
                            <button onClick={()=>toggleLike(msg.id)}
                              style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:msg.liked?P:"#9CA3AF",display:"flex",alignItems:"center",gap:3,padding:"2px 6px",borderRadius:6}}>
                              {msg.liked?"❤️":"🤍"} {msg.likes}
                            </button>
                          </div>
                        </div>
                      ):(
                        <div style={{marginLeft:38,background:"#fff",border:"1px solid #EDE9FE",borderRadius:"0 10px 10px 10px",padding:"8px 12px"}}>
                          <div style={{fontSize:13,color:"#374151"}}>{msg.txt}</div>
                          <button onClick={()=>toggleLike(msg.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:msg.liked?P:"#9CA3AF",marginTop:4,padding:0,display:"flex",alignItems:"center",gap:3}}>
                            {msg.liked?"❤️":"🤍"} {msg.likes}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mini leaderboard */}
              <div style={{width:176,borderLeft:"1px solid #EDE9FE",padding:"12px 10px",overflowY:"auto",background:"#FAFAFA",flexShrink:0}}>
                <div style={{fontSize:10,fontWeight:600,color:"#9CA3AF",marginBottom:10,textTransform:"uppercase",letterSpacing:".08em"}}>Топ</div>
                {activeC.entries?.map((e,i)=>{
                  const u=getUser(e.uid);
                  const val=activeC.format==="norm"?`${e.days}д`:activeC.type==="steps"?`${(e.total/1000).toFixed(0)}k`:`${e.km}km`;
                  return(
                    <div key={e.uid} style={{display:"flex",alignItems:"center",gap:6,marginBottom:9,padding:"5px 6px",borderRadius:8,background:e.uid==="me"?PL:"transparent"}}>
                      <Medal r={i+1}/>
                      <Av uid={e.uid} size={22}/>
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontSize:11,fontWeight:e.uid==="me"?600:400,color:e.uid==="me"?P:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name.split(" ")[0]}</div>
                        <div style={{fontSize:10,color:"#9CA3AF"}}>{val}</div>
                      </div>
                      <Delta d={e.delta}/>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{padding:"10px 20px",background:"#fff",borderTop:"1px solid #EDE9FE",display:"flex",gap:8,flexShrink:0}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitResult()}
                placeholder={activeC.type==="steps"?"Введи шаги или напиши сообщение...":"Напиши результат или сообщение..."}
                style={{flex:1,border:"1.5px solid #DDD6FE",borderRadius:10,padding:"9px 14px",fontSize:13,outline:"none",background:"#F8F7FF"}}/>
              <button onClick={submitResult} disabled={!input.trim()}
                style={{background:sportColor,color:"#fff",border:"none",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",opacity:input.trim()?1:0.5}}>
                Отправить
              </button>
            </div>
          </>
        )}

        {/* ── LEADERBOARD ── */}
        {view==="leaderboard"&&(
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{padding:"12px 24px",background:"#fff",borderBottom:"1px solid #EDE9FE",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{fontSize:15,fontWeight:600,color:"#1F2937",flex:1}}>Рейтинги</div>
              <div style={{display:"flex",gap:4}}>
                {["current","season"].map(t=>(
                  <button key={t} onClick={()=>setBoardTab(t)}
                    style={{background:boardTab===t?P:"transparent",color:boardTab===t?"#fff":"#6B7280",border:`1px solid ${boardTab===t?P:"#E5E7EB"}`,borderRadius:7,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:boardTab===t?500:400}}>
                    {{current:"Текущий",season:"Сезон"}[t]}
                  </button>
                ))}
              </div>
              {boardTab==="current"&&(
                <div style={{display:"flex",gap:3}}>
                  {["all","m","f"].map(g=>(
                    <button key={g} onClick={()=>setGenderFilter(g)}
                      style={{background:genderFilter===g?PL:"transparent",color:genderFilter===g?P:"#9CA3AF",border:`1px solid ${genderFilter===g?P:"#E5E7EB"}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer"}}>
                      {{all:"Все",m:"♂ Мужчины",f:"♀ Женщины"}[g]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{padding:"16px 20px"}}>
              {boardTab==="current"&&activeC.entries?.filter(e=>genderFilter==="all"||e.gender===genderFilter).map((e,i)=>{
                const u=getUser(e.uid);
                const max=activeC.entries[0]?activeC.format==="norm"?activeC.entries[0].days:activeC.entries[0].km||activeC.entries[0].total||1:1;
                const val=activeC.format==="norm"?e.days:e.km||e.total||0;
                const pct=Math.round((val/max)*100);
                return(
                  <div key={e.uid} style={{background:"#fff",border:`1.5px solid ${e.uid==="me"?P:"#EDE9FE"}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <Medal r={i+1}/>
                      <Av uid={e.uid} size={38}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                          <span style={{fontSize:14,fontWeight:600,color:e.uid==="me"?P:"#1F2937"}}>{u.name}</span>
                          <span style={{fontSize:11,color:e.gender==="m"?"#2563EB":"#DB2777"}}>{e.gender==="m"?"♂":"♀"}</span>
                          <Delta d={e.delta}/>
                        </div>
                        <div style={{background:"#EDE9FE",borderRadius:4,height:6,position:"relative"}}>
                          <div style={{background:sportColor,height:6,borderRadius:4,width:`${pct}%`,transition:"width .6s"}}/>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:18,fontWeight:700,color:sportColor}}>{activeC.format==="norm"?`${val}/${activeC.duration}`:val.toLocaleString("ru")}</div>
                        <div style={{fontSize:10,color:"#9CA3AF"}}>{activeC.format==="norm"?"дней":"км"}</div>
                        <Merchi n={e.merchi}/>
                      </div>
                    </div>
                  </div>
                );
              })}
              {boardTab==="season"&&(
                <>
                  <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#92400E",display:"flex",alignItems:"center",gap:8}}>
                    ⭐ <span>Сквозной рейтинг сезона 2025 — сумма мерчей за все челленджи</span>
                  </div>
                  {SEASON.map((e,i)=>{
                    const max=SEASON[0].merchi;
                    const rankChange=e.prev-(i+1);
                    return(
                      <div key={e.uid} style={{background:"#fff",border:`1.5px solid ${e.uid==="me"?P:"#EDE9FE"}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <Medal r={i+1}/>
                          <Av uid={e.uid} size={38}/>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                              <span style={{fontSize:14,fontWeight:600,color:e.uid==="me"?P:"#1F2937"}}>{e.name}</span>
                              <Delta d={rankChange}/>
                            </div>
                            <div style={{background:"#FFFBEB",borderRadius:4,height:6}}>
                              <div style={{background:"#F59E0B",height:6,borderRadius:4,width:`${Math.round((e.merchi/max)*100)}%`}}/>
                            </div>
                          </div>
                          <Merchi n={e.merchi} size="md"/>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        {view==="announcements"&&(
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{padding:"14px 24px",background:"#fff",borderBottom:"1px solid #EDE9FE"}}>
              <div style={{fontWeight:600,fontSize:15,color:"#1F2937"}}>Анонсы мероприятий</div>
              <div style={{fontSize:12,color:"#6B7280"}}>Регистрируйся заранее — получи напоминание</div>
            </div>
            <div style={{padding:20}}>
              {Object.entries(announcements.reduce((acc,a)=>{(acc[a.month]=acc[a.month]||[]).push(a);return acc;},{})).map(([month,events])=>(
                <div key={month} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{background:PL,color:P,padding:"3px 12px",borderRadius:999,fontSize:12,fontWeight:600}}>{month}</span>
                  </div>
                  {events.map(a=>{
                    const c=SPORT_COLORS[a.type]||"#6B7280";
                    return(
                      <div key={a.id} style={{background:"#fff",border:`1px solid ${c}30`,borderTop:`3px solid ${c}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                          <div style={{width:44,height:44,borderRadius:10,background:c+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{a.emoji}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:600,color:"#1F2937",marginBottom:3}}>{a.title}</div>
                            <div style={{fontSize:12,color:"#6B7280",marginBottom:6}}>{a.desc}</div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                              <span style={{fontSize:11,color:"#9CA3AF"}}>🗓 {a.date}</span>
                              <span style={{fontSize:11,background:c+"15",color:c,padding:"2px 8px",borderRadius:999,fontWeight:500}}>через {a.days_to} дней</span>
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={()=>toggleRegister(a.id,"registered")}
                                style={{background:a.registered?P:"transparent",color:a.registered?"#fff":P,border:`1.5px solid ${P}`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                                {a.registered?"✓ Участвую":"Участвовать"}
                              </button>
                              {!a.registered&&(
                                <button onClick={()=>toggleRegister(a.id,"reminded")}
                                  style={{background:a.reminded?"#D1FAE5":"transparent",color:a.reminded?"#065F46":"#6B7280",border:`1px solid ${a.reminded?"#6EE7B7":"#E5E7EB"}`,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
                                  {a.reminded?"🔔 Напомним":"Напомнить"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ARCHIVE ── */}
        {view==="archive"&&(
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{padding:"14px 24px",background:"#fff",borderBottom:"1px solid #EDE9FE"}}>
              <div style={{fontWeight:600,fontSize:15,color:"#1F2937"}}>Архив мероприятий</div>
            </div>
            <div style={{padding:20}}>
              {ARCHIVE.map(a=>{
                const c=SPORT_COLORS[a.type]||"#6B7280";
                return(
                  <div key={a.id} style={{background:"#fff",border:`1px solid ${c}25`,borderLeft:`4px solid ${c}`,borderRadius:12,padding:"16px",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <span style={{fontSize:26}}>{a.emoji}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#1F2937"}}>{a.title}</div>
                        <div style={{fontSize:11,color:"#9CA3AF"}}>{a.end_at} · {a.participants} участников</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div style={{background:"#EDE9FE",borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:"#6B5FA8",marginBottom:3,fontWeight:500}}>🥇 Победитель ♂</div>
                        <div style={{fontSize:13,fontWeight:600,color:P}}>{a.winner_m}</div>
                      </div>
                      <div style={{background:"#FCE7F3",borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:"#9D174D",marginBottom:3,fontWeight:500}}>🥇 Победитель ♀</div>
                        <div style={{fontSize:13,fontWeight:600,color:"#BE185D"}}>{a.winner_f}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ADMIN ── */}
        {view==="admin"&&(
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{padding:"12px 24px",background:"#fff",borderBottom:"1px solid #EDE9FE",display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontWeight:600,fontSize:15,color:"#1F2937",flex:1}}>Администратор</div>
              <div style={{display:"flex",gap:4}}>
                {["challenges","channels"].map(t=>(
                  <button key={t} onClick={()=>{setAdminTab(t);setAdminSub("list");setSelCh(null);}}
                    style={{background:adminTab===t?P:"transparent",color:adminTab===t?"#fff":"#6B7280",border:`1px solid ${adminTab===t?P:"#E5E7EB"}`,borderRadius:7,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>
                    {{challenges:"Челленджи",channels:"Каналы"}[t]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{padding:20}}>
              {adminTab==="challenges"&&(
                <>
                  <div style={{display:"flex",gap:4,marginBottom:14}}>
                    {["list","new","submissions"].map(s=>(
                      <button key={s} onClick={()=>setAdminSub(s)}
                        style={{background:adminSub===s?P:"transparent",color:adminSub===s?"#fff":"#6B7280",border:`1px solid ${adminSub===s?P:"#E5E7EB"}`,borderRadius:7,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>
                        {{list:"Список",new:"Создать",submissions:"Заявки"}[s]}
                      </button>
                    ))}
                  </div>

                  {adminSub==="list"&&challenges.map(c=>(
                    <div key={c.id} style={{background:"#fff",border:`1px solid ${SPORT_COLORS[c.type]||P}25`,borderLeft:`3px solid ${SPORT_COLORS[c.type]||P}`,borderRadius:10,padding:"13px 16px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:22}}>{c.emoji}</span>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                            <span style={{fontWeight:600,fontSize:14}}>{c.title}</span>
                            <span style={{fontSize:10,background:c.status==="active"?"#D1FAE5":"#E5E7EB",color:c.status==="active"?"#065F46":"#374151",padding:"2px 8px",borderRadius:999,fontWeight:500}}>{c.status==="active"?"активный":"черновик"}</span>
                            <SportTag type={c.type}/>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:11,color:"#9CA3AF"}}>{c.end_at}</span>
                            <Merchi n={c.points_pool}/>
                          </div>
                        </div>
                        {c.status==="draft"&&<button onClick={()=>{setChallenges(p=>p.map(x=>x.id===c.id?{...x,status:"active"}:x));notify("Запущен!");}} style={{background:"#D1FAE5",color:"#065F46",border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,fontWeight:500,cursor:"pointer"}}>▶ Запустить</button>}
                        {c.status==="active"&&<button onClick={()=>{setChallenges(p=>p.map(x=>x.id===c.id?{...x,status:"finished"}:x));notify("Завершён!");}} style={{background:"#FEE2E2",color:"#991B1B",border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,fontWeight:500,cursor:"pointer"}}>■ Завершить</button>}
                      </div>
                    </div>
                  ))}

                  {adminSub==="new"&&(
                    <div style={{background:"#fff",border:"1px solid #EDE9FE",borderRadius:12,padding:18,maxWidth:540}}>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Новый челлендж</div>
                      {[{k:"title",l:"Название"},{k:"description",l:"Описание"},{k:"rules",l:"Правила"}].map(f=>(
                        <div key={f.k} style={{marginBottom:12}}>
                          <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{f.l}</label>
                          <input value={newChal[f.k]||""} onChange={e=>setNewChal(p=>({...p,[f.k]:e.target.value}))}
                            style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #EDE9FE",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/>
                        </div>
                      ))}

                      <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Тип активности</label>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:14}}>
                        {TYPES.map(t=>{
                          const tc=SPORT_COLORS[t.id]||"#6B7280";
                          const on=newChal.type===t.id;
                          return(
                            <div key={t.id} onClick={()=>setNewChal(p=>({...p,type:t.id}))}
                              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:8,cursor:"pointer",
                                border:`1.5px solid ${on?tc:"#EDE9FE"}`,background:on?tc+"15":"#FAFAFA"}}>
                              <span>{t.e}</span><span style={{fontSize:12,color:on?tc:"#374151",fontWeight:on?600:400}}>{t.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Формат</label>
                      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                        {FORMATS.map(f=>(
                          <div key={f.id} onClick={()=>setNewChal(p=>({...p,format:f.id}))}
                            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${newChal.format===f.id?P:"#EDE9FE"}`,background:newChal.format===f.id?PL:"#FAFAFA"}}>
                            <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${newChal.format===f.id?P:"#C4B5FD"}`,background:newChal.format===f.id?P:"transparent",flexShrink:0}}/>
                            <span style={{fontSize:13,color:newChal.format===f.id?P:"#374151",fontWeight:newChal.format===f.id?500:400}}>{f.label}</span>
                          </div>
                        ))}
                      </div>

                      {newChal.format==="norm"&&(
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                          {[{k:"norm",l:"Норма (шагов/км)"},{k:"duration",l:"Дней подряд"}].map(f=>(
                            <div key={f.k}>
                              <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{f.l}</label>
                              <input type="number" value={newChal[f.k]} onChange={e=>setNewChal(p=>({...p,[f.k]:+e.target.value}))}
                                style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #EDE9FE",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/>
                            </div>
                          ))}
                        </div>
                      )}

                      <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Зачёт</label>
                      <div style={{display:"flex",gap:6,marginBottom:14}}>
                        {["personal","team","combined"].map(z=>(
                          <button key={z} onClick={()=>setNewChal(p=>({...p,zacet:z}))}
                            style={{flex:1,background:newChal.zacet===z?P:"transparent",color:newChal.zacet===z?"#fff":"#6B7280",border:`1px solid ${newChal.zacet===z?P:"#E5E7EB"}`,borderRadius:7,padding:"7px",fontSize:11,cursor:"pointer",fontWeight:newChal.zacet===z?500:400}}>
                            {{personal:"Личный",team:"Командный",combined:"Комбо"}[z]}
                          </button>
                        ))}
                      </div>

                      <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#92400E",marginBottom:10,textTransform:"uppercase",letterSpacing:".05em"}}>⭐ Система мерчиков</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          {[{k:"points_pool",l:"Фонд мерчей"},{k:"points_per_day",l:"+мерч за день"},{k:"bonus_top1",l:"Бонус Топ-1"},{k:"bonus_top3",l:"Бонус Топ-3"}].map(f=>(
                            <div key={f.k}>
                              <label style={{fontSize:10,color:"#92400E",display:"block",marginBottom:3,fontWeight:500}}>{f.l}</label>
                              <input type="number" value={newChal[f.k]} onChange={e=>setNewChal(p=>({...p,[f.k]:+e.target.value}))}
                                style={{width:"100%",boxSizing:"border-box",border:"1px solid #FDE68A",borderRadius:7,padding:"7px 10px",fontSize:13,outline:"none",background:"#fff"}}/>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"52px 1fr",gap:10,marginBottom:14}}>
                        <div>
                          <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>Эмодзи</label>
                          <input value={newChal.emoji} onChange={e=>setNewChal(p=>({...p,emoji:e.target.value}))}
                            style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #EDE9FE",borderRadius:8,padding:"8px",fontSize:22,textAlign:"center",outline:"none"}}/>
                        </div>
                        <div>
                          <label style={{fontSize:11,color:"#6B7280",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>Длительность (дней)</label>
                          <input type="number" value={newChal.days} onChange={e=>setNewChal(p=>({...p,days:+e.target.value}))}
                            style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #EDE9FE",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/>
                        </div>
                      </div>
                      <button onClick={createChallenge} style={{width:"100%",background:P,color:"#fff",border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                        Создать челлендж →
                      </button>
                    </div>
                  )}

                  {adminSub==="submissions"&&feed.map(msg=>{
                    const u=getUser(msg.uid);
                    return(
                      <div key={msg.id} style={{background:"#fff",border:"1px solid #EDE9FE",borderRadius:10,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                        <Av uid={msg.uid} size={28}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500}}>{u.name}</div>
                          <div style={{fontSize:12,color:"#6B7280"}}>{msg.txt} · {msg.ts}</div>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>notify("Принято ✓")} style={{background:"#D1FAE5",color:"#065F46",border:"none",borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:500,cursor:"pointer"}}>✓ Принять</button>
                          <button onClick={()=>notify("Отклонено",false)} style={{background:"#FEE2E2",color:"#991B1B",border:"none",borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:500,cursor:"pointer"}}>✕ Откл.</button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {adminTab==="channels"&&!selCh&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                    {channels.map(ch=>(
                      <div key={ch.id} onClick={()=>setSelCh(ch)}
                        style={{background:"#fff",border:"1px solid #EDE9FE",borderRadius:12,padding:14,cursor:"pointer"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <span style={{fontSize:20}}>{ch.emoji}</span>
                          <div style={{fontSize:13,fontWeight:600}}>#{ch.name}</div>
                        </div>
                        <div style={{fontSize:11,color:"#9CA3AF"}}>{ch.members.length} участников →</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"#fff",border:"2px dashed #DDD6FE",borderRadius:12,padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>+ Новый канал</div>
                    <div style={{display:"grid",gridTemplateColumns:"48px 1fr",gap:8,marginBottom:10}}>
                      <input value={newCh.emoji} onChange={e=>setNewCh(p=>({...p,emoji:e.target.value}))} style={{border:"1.5px solid #EDE9FE",borderRadius:8,padding:"7px",fontSize:20,textAlign:"center",outline:"none"}}/>
                      <input value={newCh.name} onChange={e=>setNewCh(p=>({...p,name:e.target.value}))} placeholder="название" style={{border:"1.5px solid #EDE9FE",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/>
                    </div>
                    <button onClick={()=>{if(!newCh.name.trim()){notify("Введи название",false);return;}const ch={id:`ch${Date.now()}`,name:newCh.name.trim(),emoji:newCh.emoji,desc:"",members:["me"]};setChannels(p=>[...p,ch]);setSelCh(ch);notify(`Канал создан!`);setNewCh({name:"",emoji:"💬",desc:""}); }}
                      style={{width:"100%",background:P,color:"#fff",border:"none",borderRadius:8,padding:10,fontSize:13,fontWeight:600,cursor:"pointer"}}>Создать</button>
                  </div>
                </div>
              )}

              {adminTab==="channels"&&selCh&&(
                <div style={{maxWidth:520}}>
                  <button onClick={()=>{setSelCh(null);setShowAddMember(false);}} style={{background:"none",border:"none",color:P,fontSize:13,cursor:"pointer",marginBottom:12,padding:0,fontWeight:500}}>← Все каналы</button>
                  <div style={{background:"#fff",border:"1px solid #EDE9FE",borderRadius:12,padding:16,marginBottom:12}}>
                    <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>#{selCh.name}</div>
                    {selCh.members.map(mid=>{
                      const u=getUser(mid);
                      const col=ALL_COLLEAGUES.find(c=>c.id===mid);
                      return(
                        <div key={mid} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F8F7FF"}}>
                          <Av uid={mid} size={28}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13}}>{u.name}{mid==="me"&&" (вы)"}</div>
                            {col&&<div style={{fontSize:11,color:"#9CA3AF"}}>{col.role}</div>}
                          </div>
                          {mid!=="me"&&!selCh.isDefault&&<button onClick={()=>{const upd={...selCh,members:selCh.members.filter(m=>m!==mid)};setChannels(p=>p.map(c=>c.id===selCh.id?upd:c));setSelCh(upd);}} style={{background:"#FEE2E2",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,color:"#991B1B",cursor:"pointer"}}>удалить</button>}
                        </div>
                      );
                    })}
                    <button onClick={()=>setShowAddMember(!showAddMember)} style={{width:"100%",marginTop:12,background:showAddMember?"#F8F7FF":P,color:showAddMember?P:"#fff",border:`1.5px solid ${P}`,borderRadius:8,padding:10,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                      {showAddMember?"↑ Скрыть":"+ Добавить коллегу"}
                    </button>
                  </div>
                  {showAddMember&&(
                    <div style={{background:"#fff",border:"1px solid #EDE9FE",borderRadius:12,padding:14}}>
                      <input value={memberSearch} onChange={e=>setMemberSearch(e.target.value)} placeholder="Поиск..."
                        style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #EDE9FE",borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",marginBottom:10}}/>
                      {ALL_COLLEAGUES.filter(c=>!selCh.members.includes(c.id)&&(c.name.toLowerCase().includes(memberSearch.toLowerCase())||c.role.toLowerCase().includes(memberSearch.toLowerCase()))).map(c=>(
                        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F8F7FF"}}>
                          <Av uid={c.id} size={28}/>
                          <div style={{flex:1}}><div style={{fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{c.role}</div></div>
                          <button onClick={()=>{const upd={...selCh,members:[...selCh.members,c.id]};setChannels(p=>p.map(x=>x.id===selCh.id?upd:x));setSelCh(upd);notify(`${c.name} добавлен(а)`);}} style={{background:PL,border:"none",borderRadius:7,padding:"5px 12px",fontSize:12,color:P,fontWeight:600,cursor:"pointer"}}>+ Добавить</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}