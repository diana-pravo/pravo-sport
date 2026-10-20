import { useState, useEffect } from "react";
import { STORAGE_KEYS, DATA_MODE, readData, writeData, createAnalyticsEvent, sendAnalyticsEvent, flushAnalyticsQueue } from "./dataClient";
const colors=["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#DB2777","#0891B2"];
const colFor=s=>colors[Math.abs([...String(s||"x")].reduce((a,c)=>a+c.charCodeAt(0),0))%colors.length];
const BP="#8C26EA",BD="#10052F";
const lg=(opacity=.9)=>({
  background:`rgba(255,255,255,${opacity})`,
  border:"1px solid #E9E1EF",
  boxShadow:"0 10px 30px rgba(50,25,80,.055)"
});
const fmtDate=value=>{
  if(!value)return "";
  const d=new Date(value+"T12:00:00");
  if(Number.isNaN(d.getTime()))return value;
  return d.toLocaleDateString("ru-RU",{day:"numeric",month:"short"}).replace(".","");
};
const CHALLENGES=[
  {id:"c1",emoji:"👟",title:"Шаговый май",desc:"10 дней — 6 000 шагов",participants:24,status:"active",statusLabel:"Активный",color:"#7C3AED",daysLeft:14,startDate:"2026-10-12",endDate:"2026-10-31",type:"steps",bg:"linear-gradient(135deg,#1a0533 0%,#2D1B69 50%,#4C1D95 100%)"},
  {id:"c2",emoji:"🏃",title:"Бег — Этап 1",desc:"Максимум км за июнь",participants:18,status:"soon",statusLabel:"Скоро",color:"#059669",daysLeft:30,startDate:"2026-11-19",endDate:"2026-12-19",type:"run",bg:"linear-gradient(135deg,#052e16 0%,#064e3b 50%,#065f46 100%)"},
  {id:"c3",emoji:"🚴",title:"Велогонка",desc:"Корп. велопробег — июль",participants:12,status:"soon",statusLabel:"Скоро",color:"#D97706",daysLeft:44,startDate:"2026-12-03",endDate:"2026-12-10",type:"bike",bg:"linear-gradient(135deg,#292524 0%,#431407 50%,#78350f 100%)"},
  {id:"c4",emoji:"🏊",title:"Плавание",desc:"Открытая вода — август",participants:9,status:"soon",statusLabel:"Анонс",color:"#0891B2",daysLeft:72,startDate:"2027-01-05",endDate:"2027-01-19",type:"swim",bg:"linear-gradient(135deg,#0c1445 0%,#0e3a5e 50%,#164e63 100%)"},
];

const DEFAULT_EVENTS=[
  {id:"e1",date:"17",day:"СБ",title:"Утренний забег",place:"Парк Горького",kind:"Офлайн",stream:"offline",meta:"Лёгкий темп · 5 км"},
  {id:"e2",date:"20",day:"ВТ",title:"Йога онлайн",place:"Zoom",kind:"Видеовстреча",stream:"meetups",meta:"Мягкая практика · 45 минут"},
  {id:"e3",date:"24",day:"СБ",title:"Велопрогулка",place:"Воробьёвы горы",kind:"Офлайн",stream:"offline",meta:"15–20 км · любой уровень"},
  {id:"start-1",date:"25",day:"СБ",title:"Московский полумарафон",place:"Москва",kind:"Забег",stream:"starts",meta:"21,1 км · регистрация до 10 мая"},
  {id:"start-2",date:"07",day:"ВС",title:"Белые ночи",place:"Санкт-Петербург",kind:"Забег",stream:"starts",meta:"10 км / 42,2 км"},
  {id:"start-3",date:"14",day:"ВС",title:"Летний заплыв право(спорт)",place:"Серебряный Бор",kind:"Заплыв",stream:"starts",meta:"500 м / 1 км"},
  {id:"off-1",date:"23",day:"ПТ",title:"Вечерняя пробежка",place:"Парк Горького",kind:"Офлайн",stream:"offline",meta:"Лёгкий темп · 5 км"},
  {id:"off-2",date:"30",day:"ПТ",title:"Велопрогулка по набережной",place:"Москва",kind:"Офлайн",stream:"offline",meta:"15–20 км · любой уровень"},
  {id:"off-3",date:"06",day:"СБ",title:"Йога в парке",place:"Музеон",kind:"Офлайн",stream:"offline",meta:"Коврик с собой"},
  {id:"meet-1",date:"27",day:"ВТ",title:"Как подготовиться к первому забегу",place:"Онлайн",kind:"Лекторий",stream:"meetups",meta:"Спикер: амбассадор бега"},
  {id:"meet-2",date:"03",day:"ВТ",title:"Сон и восстановление спортсмена",place:"Онлайн",kind:"Митап",stream:"meetups",meta:"Вопросы тренеру в прямом эфире"},
  {id:"meet-3",date:"12",day:"ЧТ",title:"История: от нуля до триатлона",place:"Офис / онлайн",kind:"История",stream:"meetups",meta:"Герой встречи — коллега из Product"}
];
const INIT_NEWS=[
  {id:1,title:"Старт Шагового мая!",cat:"Анонс",date:"1 мая 2025",text:"Открываем сезон! 10 дней — 6 000 шагов ежедневно.",bg:"linear-gradient(160deg,#1a0533,#2D1B69)",emoji:"👟"},
  {id:2,title:"Алексей К. — лидер недели",cat:"Результаты",date:"8 мая 2025",text:"87 000 шагов за неделю — рекорд сезона!",bg:"linear-gradient(160deg,#0d2200,#1a4000)",emoji:"🥇"},
  {id:3,title:"Анонс: Велогонка — июль",cat:"Анонс",date:"20 мая 2025",text:"Маршрут — Парк Горького → Воробьёвы горы.",bg:"linear-gradient(160deg,#1a0e00,#3d2000)",emoji:"🚴"},
  {id:4,title:"PravoRun 2025",cat:"Мероприятие",date:"15 мая 2025",text:"7 июня, Парк Горького. Участие бесплатное!",bg:"linear-gradient(160deg,#001520,#002840)",emoji:"🏅"},
  {id:5,title:"Итоги фотовызова",cat:"Итоги",date:"1 мая 2025",text:"22 участника, 180 фотографий!",bg:"linear-gradient(160deg,#200010,#400030)",emoji:"📸"},
  {id:6,title:"Рекорд: 1 240 000 шагов",cat:"Результаты",date:"31 мая 2025",text:"Вместе прошли ~930 км за май!",bg:"linear-gradient(160deg,#0a0a20,#1a1a40)",emoji:"🎉"},
];
// Photo scenes (CSS art simulating real photos)
const BASE="https://nvrdogfulmifrgjjpxcy.supabase.co/storage/v1/object/public/sport-photos/";
const IMG1=BASE+"1.jpeg";
const IMG2=BASE+"1408_385_resized.jpg";
const IMG3=BASE+"IMG_6064.JPG";
const IMG4=BASE+"IMG_6068.JPG";
const LIGHT_SWIM="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Swimmer_splashing_water_%28Unsplash%29.jpg/960px-Swimmer_splashing_water_%28Unsplash%29.jpg";
const LIGHT_SURF="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Surfer_carrying_his_board_%28Unsplash%29.jpg/960px-Surfer_carrying_his_board_%28Unsplash%29.jpg";
const LIGHT_RUN=LIGHT_SURF;
const LIGHT_CYCLE=LIGHT_SWIM;
const MVP_HERO=IMG2;
const MVP_ICE="/assets/challenge-ice.webp";
const MVP_SURF="/assets/team-surf.webp";
const MVP_SPLASH=IMG4;

function PravoHeader({setPage,signedIn=true,onLogin,isAdmin=false,activeGroup:activeGroupProp=""}){
  const [activeGroup,setActiveGroup]=useState(activeGroupProp);
  useEffect(()=>setActiveGroup(activeGroupProp),[activeGroupProp]);
  const go=(id,target)=>{
    setActiveGroup(id);
    setPage(target);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const account=()=>{
    if(!signedIn){onLogin?.();return;}
    setPage(isAdmin?"admin":"cabinet-light");
  };
  const groups=[
    {id:"block-participate",label:"Участвовать",target:"challenges"},
    {id:"block-community",label:"Сообщество",target:"module:city-sport"},
    {id:"block-motivation",label:"Прогресс",target:"module:ratings"},
    {id:"block-support",label:"Поддержка",target:"module:trainer"},
    {id:"news",label:"Новости",target:"news"}
  ];
  return(
    <div className="pravo-header-wrap" style={{position:"sticky",top:0,zIndex:50,padding:"10px 28px 0",background:"linear-gradient(180deg,rgba(250,247,255,.98) 0%,rgba(250,247,255,.88) 72%,rgba(250,247,255,0) 100%)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)"}}>
      <div className="pravo-header-inner" style={{height:72,maxWidth:1450,margin:"0 auto",background:"rgba(255,255,255,.96)",border:"1px solid rgba(29,15,58,.065)",borderRadius:26,display:"flex",alignItems:"center",padding:"0 12px 0 26px",boxShadow:"0 12px 34px rgba(55,25,92,.075)",fontFamily:"'Open Sans',Arial,sans-serif"}}>
        <button className="pravo-logo" onClick={()=>setPage("light")} style={{border:0,background:"transparent",fontSize:25,fontWeight:800,letterSpacing:"-1.25px",color:"#10052F",cursor:"pointer",marginRight:34,whiteSpace:"nowrap"}}>
          право<span style={{color:"#8D27EE"}}>(спорт)</span>
        </button>

        <nav className="pravo-nav pravo-group-nav" aria-label="Основные разделы" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flex:1,minWidth:0}}>
          {groups.map(item=>{
            const active=activeGroup===item.id;
            return <button key={item.id} type="button" onClick={()=>go(item.id,item.target)} className={active?"group-nav-btn is-active":"group-nav-btn"} style={{position:"relative",border:0,background:active?"#F5EEFC":"transparent",color:active?"#5F17B8":"#5F5869",borderRadius:16,padding:"10px 14px",fontSize:13.5,fontWeight:active?800:700,cursor:"pointer",whiteSpace:"nowrap"}}>
              {item.label}
              {active&&<span aria-hidden="true" style={{position:"absolute",left:"50%",bottom:3,width:22,height:2,borderRadius:2,background:"#8D27EE",transform:"translateX(-50%)"}}/>}
            </button>;
          })}
        </nav>

        <button className="pravo-mobile-menu" onClick={()=>setPage("light")} type="button" style={{display:"none",border:0,background:"#F6F0FB",color:"#6D2BC1",borderRadius:16,padding:"9px 12px",fontSize:12,fontWeight:800,cursor:"pointer",marginLeft:"auto"}}>Главная</button>
        <button className="pravo-participate" onClick={()=>signedIn?setPage("cabinet-light"):onLogin?.()} style={{height:44,border:0,borderRadius:20,background:"#10052F",color:"#fff",fontWeight:800,fontSize:13.5,padding:"0 19px",cursor:"pointer",marginLeft:9,boxShadow:"0 8px 18px rgba(16,5,47,.13)"}}>
          Мой спорт <span style={{marginLeft:6,opacity:.8}}>↗</span>
        </button>
        {signedIn
          ? <button className="pravo-avatar" onClick={account} style={{width:42,height:42,borderRadius:"50%",border:"3px solid #fff",boxShadow:"0 0 0 1px #E6D9F0",background:"#D90A78",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer",marginLeft:9}}>Д</button>
          : <button className="pravo-avatar" onClick={onLogin} style={{width:42,height:42,borderRadius:"50%",border:"1px solid #E6D9F0",background:"#fff",color:"#8D27EE",fontWeight:800,fontSize:11,cursor:"pointer",marginLeft:9}}>Войти</button>}
      </div>
    </div>
  );
}

const lightPageBg="radial-gradient(circle at 0% 8%,#F0DEFF 0,transparent 25%),radial-gradient(circle at 100% 42%,#FFE8EF 0,transparent 24%),linear-gradient(180deg,#FAF7FF 0%,#FBF9FF 100%)";

const PLATFORM_BLOCKS=[
  {
    id:"participate",n:"01",title:"Участвовать",eyebrow:"ВКЛЮЧАЙСЯ В ДВИЖЕНИЕ",
    description:"Выбирай формат, регистрируйся и участвуй — от челленджей до живых встреч.",
    accent:"#8D27EE",soft:"#F3EAFE",image:MVP_SURF,
    modules:[
      {id:"challenges",icon:"🏆",title:"Челленджи",text:"Активные, будущие и прошедшие челленджи.",target:"challenges",features:["Активные челленджи","Будущие анонсы","Прошедшие челленджи","Рейтинг"]},
      {id:"starts",icon:"🏃",title:"Забеги / старты",text:"Твои старты, календарь и заявки.",features:["Твои старты","Календарь ПравоТех","Заявка на компенсацию","Новости стартов"]},
      {id:"offline",icon:"📍",title:"Офлайн-активности",text:"Предложения коллег и встречи рядом.",features:["Предложения коллег","Анонсы мероприятий","Отчёты об активностях"]},
      {id:"meetups",icon:"🎙",title:"Митапы / лектории",text:"Встречи, темы и истории коллег.",features:["Календарь встреч","Предложить тему","Стать героем лектория"]}
    ]
  },
  {
    id:"community",n:"02",title:"Люди и сообщество",eyebrow:"НАХОДИ СВОИХ",
    description:"Ищи коллег по интересам, присоединяйся к командам и находи спортивного партнёра.",
    accent:"#1699C4",soft:"#EAF7FB",image:MVP_SURF,
    modules:[
      {id:"city-sport",icon:"⌖",title:"Спорт по городам",text:"Поиск по городу и виду спорта.",features:["Поиск по городу и виду спорта","Добавление своей активности","Присоединиться к коллеге"]},
      {id:"ambassadors",icon:"★",title:"Амбассадоры спорта",text:"Лидеры сообщества и новые инициативы.",features:["Наши амбассадоры","Стать амбассадором","Инициировать мероприятие"]},
      {id:"athlete-card",icon:"◉",title:"Карточка спортсмена",text:"Истории, интервью и спортивный профиль.",features:["Интервью коллег","История спортсмена","Заявка «Хочу стать героем»"]},
      {id:"teams",icon:"👥",title:"Команды",text:"Составы команд и заявки на вступление.",features:["Действующие команды","Текущие составы","Заявка на присоединение"]},
      {id:"buddy",icon:"♥",title:"Спортивный бадди",text:"Найди партнёра для совместной активности.",features:["Поиск партнёра","Онлайн и офлайн формат","Заявки и подтверждения"]}
    ]
  },
  {
    id:"motivation",n:"03",title:"Прогресс и награды",eyebrow:"МОТИВАЦИЯ И ПРИЗНАНИЕ",
    description:"Участие превращается в результат, признание и понятную систему наград.",
    accent:"#D97706",soft:"#FFF4E5",image:MVP_ICE,
    modules:[
      {id:"ratings",icon:"▥",title:"Рейтинги",text:"Сравнивай прогресс и следи за результатами.",features:["Рейтинг челленджей","Спортивные соревнования","Рейтинг амбассадоров"]},
      {id:"coins",icon:"◉",title:"Коины",text:"Начисления за спортивную активность.",features:["Баланс коинов","История начислений","Начисления за активности"]},
      {id:"benefits",icon:"🎁",title:"Бенефиты",text:"Спортивные сервисы и доступные преимущества.",features:["Спортивные сервисы","Fitmost","Корпоративные предложения"]},
      {id:"achievement",icon:"⚑",title:"Заяви о достижении",text:"Поделись результатом и получи признание.",features:["Заявка о достижении","Подтверждение результата","Публикация достижения"]}
    ]
  },
  {
    id:"support",n:"04",title:"Поддержка и информация",eyebrow:"ВСЁ НУЖНОЕ В ОДНОМ МЕСТЕ",
    description:"Получай помощь, читай новости и не пропускай будущие спортивные события.",
    accent:"#159B66",soft:"#EAF8F2",image:LIGHT_SWIM,
    modules:[
      {id:"trainer",icon:"💬",title:"Консультации с тренером",text:"Задай вопрос корпоративному тренеру.",features:["Задать вопрос","Перечень тем","Ответ корпоративного тренера"]},
      {id:"sport-news",icon:"▤",title:"Новости спорта",text:"Сводка спортивной жизни компании.",features:["Новости компании","Истории коллег","Добавить новость","Модерация"]},
      {id:"announcements",icon:"📣",title:"Анонсы",text:"Единая лента будущих событий.",features:["Будущие события","Календарь","Переход в нужный раздел"]}
    ]
  }
];

const PLATFORM_MODULES=PLATFORM_BLOCKS.flatMap(block=>block.modules.map(module=>({...module,blockId:block.id,blockTitle:block.title,accent:block.accent,soft:block.soft,image:block.image})));

const COMMUNITY_PEOPLE=[
  {id:"p1",name:"Алексей К.",city:"Москва",sports:["Бег","Велосипед"],level:"Регулярно",about:"Готовлюсь к полумарафону и люблю длинные велопрогулки.",role:"Амбассадор бега",avatar:"АК"},
  {id:"p2",name:"Мария П.",city:"Москва",sports:["Йога","Бег"],level:"Начинаю",about:"Ищу компанию для лёгких пробежек после работы.",role:"",avatar:"МП"},
  {id:"p3",name:"Иван С.",city:"Санкт-Петербург",sports:["Плавание","Бег"],level:"Регулярно",about:"Плаваю на открытой воде, иногда бегаю трейлы.",role:"Амбассадор плавания",avatar:"ИС"},
  {id:"p4",name:"Ольга С.",city:"Казань",sports:["Велосипед","Йога"],level:"Регулярно",about:"Люблю городские веломаршруты и утреннюю йогу.",role:"",avatar:"ОС"},
  {id:"p5",name:"Никита Р.",city:"Новосибирск",sports:["Бег","Лыжи"],level:"Продвинутый",about:"Могу помочь с планом подготовки к первому старту.",role:"Амбассадор бега",avatar:"НР"},
  {id:"p6",name:"Анна В.",city:"Санкт-Петербург",sports:["Йога","Плавание"],level:"Начинаю",about:"Хочу найти бадди для бассейна 1–2 раза в неделю.",role:"",avatar:"АВ"}
];

const COMMUNITY_TEAMS=[
  {id:"t1",name:"Pravo Runners · Москва",city:"Москва",sport:"Бег",members:34,desc:"Совместные тренировки по вторникам и субботам.",emoji:"🏃"},
  {id:"t2",name:"Open Water Crew",city:"Санкт-Петербург",sport:"Плавание",members:18,desc:"Бассейн зимой, открытая вода летом.",emoji:"🏊"},
  {id:"t3",name:"Velo Weekend",city:"Казань",sport:"Велосипед",members:21,desc:"Неспешные городские и загородные маршруты.",emoji:"🚴"},
  {id:"t4",name:"Yoga Morning",city:"Москва",sport:"Йога",members:27,desc:"Короткие утренние практики онлайн и офлайн.",emoji:"🧘"}
];

const DEFAULT_COMMUNITY_ACTIVITIES=[
  {id:"a1",title:"Лёгкая пробежка 5 км",city:"Москва",sport:"Бег",when:"Среда · 19:30",author:"Мария П.",people:6},
  {id:"a2",title:"Веломаршрут вдоль набережной",city:"Казань",sport:"Велосипед",when:"Суббота · 10:00",author:"Ольга С.",people:9},
  {id:"a3",title:"Бассейн после работы",city:"Санкт-Петербург",sport:"Плавание",when:"Четверг · 20:00",author:"Анна В.",people:4},
  {id:"a4",title:"Йога перед рабочим днём",city:"Москва",sport:"Йога",when:"Пятница · 08:00",author:"Мария П.",people:11}
];

function LightChallengeCard({c,i,onOpen}){
  const isDaily=c.title==="Движение каждый день";
  const fallbackPhoto=
    c.title==="Километры лета"?MVP_ICE:
    c.title==="Шаг за шагом"?MVP_SURF:
    c.type==="steps"?MVP_SURF:
    c.type==="run"?MVP_SPLASH:
    c.type==="bike"?LIGHT_CYCLE:
    c.type==="swim"?MVP_SPLASH:null;
  const photo=c.attachmentData&&String(c.attachmentType||"").startsWith("image/")?c.attachmentData:(isDaily?null:fallbackPhoto);
  const soon=c.status!=="active";
  return(
    <article className="light-challenge-card" onClick={onOpen} style={{borderRadius:28,overflow:"hidden",background:"#fff",border:"1px solid #E9E1EF",minHeight:470,cursor:"pointer",boxShadow:"0 8px 24px rgba(50,25,80,.04)"}}>
      <div className="light-challenge-media" style={{height:290,position:"relative",background:photo?"#DDEBF0":"#E9FF1F",overflow:"hidden"}}>
        {photo
          ? <img src={photo} alt={c.title||"Спортивный челлендж"} onError={e=>{e.currentTarget.style.display="none";}} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          : <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#10052F"}}><div style={{fontSize:118,lineHeight:.8}}>15<span style={{fontSize:21,display:"inline-block",lineHeight:1.05}}> МИНУТ<br/> В ДЕНЬ</span></div></div>}
        <span style={{position:"absolute",top:18,left:18,background:soon?"#E9FF1F":"#8D27EE",color:soon?"#10052F":"#fff",borderRadius:20,padding:"8px 14px",fontSize:12,fontWeight:800}}>{soon?"Скоро":"Идёт сейчас"}</span>
        <span style={{position:"absolute",top:18,right:18,background:"#fff",borderRadius:20,padding:"8px 14px",fontSize:12,fontWeight:800}}>{c.daysLeft?((soon?"через ":"ещё ")+c.daysLeft+" дн."):(i===2?"15 минут":"сезон")}</span>
      </div>
      <div style={{padding:"25px 25px 28px",position:"relative"}}>
        <div style={{fontSize:12,fontWeight:800,letterSpacing:"1.4px",color:"#8D27EE",marginBottom:9}}>{c.type==="steps"?"КОМАНДНЫЙ МАРАФОН":c.type==="run"?"ВЫНОСЛИВОСТЬ":c.type==="bike"?"ДВИЖЕНИЕ":"ЗДОРОВАЯ ПРИВЫЧКА"}</div>
        <h3 style={{fontSize:27,letterSpacing:"-1.2px",margin:"0 0 8px",fontWeight:800}}>{c.title}</h3>
        <p style={{fontSize:14,color:"#746D7E",margin:0,maxWidth:"82%"}}>{c.desc}</p>
        <div className="challenge-dates" style={{display:"flex",alignItems:"center",gap:8,marginTop:15,fontSize:11.5,fontWeight:700,color:"#665F71"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"#F7F2FA",borderRadius:999,padding:"7px 10px"}}>📅 {fmtDate(c.startDate)||"Дата уточняется"}{c.endDate?` — ${fmtDate(c.endDate)}`:""}</span>
        </div>
        {c.attachmentName&&<div style={{fontSize:11,color:"#8D27EE",marginTop:10}}>📎 {c.attachmentName}</div>}
        <button type="button" aria-label={`Открыть ${c.title}`} onClick={e=>{e.stopPropagation();onOpen?.();}} style={{position:"absolute",right:20,top:22,width:46,height:46,border:0,borderRadius:"50%",background:"#F5EDFC",color:"#8D27EE",fontSize:25,cursor:"pointer"}}>{i===1?"≈":"↗"}</button>
      </div>
    </article>
  );
}

function LightHome({setPage,challenges=CHALLENGES,news=INIT_NEWS,signedIn=false,isAdmin=false,onLogin}){
  const [challengeFilter,setChallengeFilter]=useState("all");
  const participate=()=>setPage("challenges");
  const challengeData=[
    {...CHALLENGES[0],title:"Шаг за шагом",desc:"Общая цель: 70 000 шагов",daysLeft:14},
    {...CHALLENGES[1],title:"Километры лета",desc:"Бег, плавание и движение",daysLeft:30},
    {...CHALLENGES[3],title:"Движение каждый день",desc:"15 минут активности ежедневно",daysLeft:44}
  ];
  const filtered=challengeData.filter(c=>challengeFilter==="all"||(challengeFilter==="active"?c.status==="active":c.status!=="active"));
  const homeNews=[
    {type:"ИСТОРИЯ",title:"Как спорт помогает решать сложные задачи",text:"Коллеги рассказывают, почему короткая тренировка иногда полезнее ещё одной встречи.",mode:"split"},
    {type:"РЕЗУЛЬТАТЫ",date:"20 мая 2026",title:"Команда продукта первой прошла 500 км",mode:"white"},
    {type:"АНОНС",date:"18 мая 2026",title:"Открываем регистрацию на летний заплыв",mode:"purple"}
  ];
  const rewards=[
    {n:"01",emoji:"🏆",title:"Лидер сезона",text:"Сертификат 5 000 ₽ и фирменный мерч",bg:"#11052F",fg:"#fff"},
    {n:"02",emoji:"⚡",title:"Серия 14 дней",text:"Эксклюзивный дроп право(спорт)",bg:"#8D27EE",fg:"#fff"},
    {n:"03",emoji:"♥",title:"Командный игрок",text:"Бонусные баллы за поддержку коллег",bg:"#E9FF1F",fg:"#10052F"},
    {n:"+",emoji:"↗",title:"Новые награды",text:"Открывай достижения в каждом челлендже",bg:"#fff",fg:"#10052F"}
  ];
  const steps=[
    {n:"01",icon:"◎",title:"Выбери челлендж",text:"Личный или командный — какой подходит сейчас."},
    {n:"02",icon:"↗",title:"Фиксируй результат",text:"Добавляй активность и следи за прогрессом."},
    {n:"03",icon:"✦",title:"Поддерживай своих",text:"Реакции коллег помогают не останавливаться."},
    {n:"04",icon:"⌁",title:"Получай награды",text:"Баллы, достижения и приятные спортивные бонусы."}
  ];
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin}/>
      <main className="light-main light-home-main" style={{maxWidth:1450,margin:"0 auto",padding:"38px 42px 54px"}}>
        <section className="light-hero" style={{display:"grid",gridTemplateColumns:"0.9fr 1.15fr",gap:34,alignItems:"center",minHeight:555}}>
          <div className="light-hero-copy" style={{padding:"20px 0 20px"}}>
            <h1 className="light-hero-title" style={{fontSize:"clamp(58px,6.1vw,92px)",lineHeight:.94,letterSpacing:"-5px",margin:"0 0 34px",fontWeight:800,maxWidth:600}}>
              Движение<br/>делает нас<br/><span style={{color:"#8D27EE"}}>сильнее</span>
            </h1>
            <button onClick={participate} style={{border:0,borderRadius:28,background:"#8D27EE",color:"#fff",fontSize:16,fontWeight:800,padding:"15px 27px",cursor:"pointer"}}>Начать участвовать&nbsp;&nbsp;→</button>
          </div>
          <div className="light-hero-image" style={{position:"relative",height:530}}>
            <img src={MVP_HERO} alt="Пловец в открытой воде" onError={e=>{if(e.currentTarget.src!==LIGHT_SWIM)e.currentTarget.src=LIGHT_SWIM;}} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 48%",borderRadius:"48% 13% 12% 13% / 22% 15% 15% 15%",display:"block",background:"#DCECF2"}}/>
          </div>
        </section>

        <section className="scenario-section" id="possibilities" style={{padding:"16px 0 78px",scrollMarginTop:110}}>
          <div className="light-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:22,marginBottom:30}}>
            <div>
              <h2 className="light-section-title" style={{fontSize:58,lineHeight:1,letterSpacing:"-3px",margin:"0 0 12px",fontWeight:800}}>Что ты хочешь сделать?</h2>
              <p style={{fontSize:15,color:"#746D7E",margin:0,maxWidth:760,lineHeight:1.55}}>Не каталог сервисов, а четыре понятных маршрута: участвовать, находить людей, видеть свой прогресс и получать поддержку.</p>
            </div>
          </div>
          <div className="platform-block-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}}>
            {PLATFORM_BLOCKS.map(block=><article key={block.id} id={`block-${block.id}`} className="platform-block-card" style={{position:"relative",overflow:"hidden",border:"1px solid #E7E0EC",borderRadius:30,background:"#fff",boxShadow:"0 14px 38px rgba(50,25,80,.06)",scrollMarginTop:190}}>
              <div className="platform-block-hero" style={{position:"relative",minHeight:190,padding:"26px 28px",background:`linear-gradient(105deg,${block.soft} 0%,${block.soft}F2 52%,rgba(255,255,255,.12) 100%)`,overflow:"hidden"}}>
                <img src={block.image} alt="" onError={e=>{e.currentTarget.style.display="none";}} style={{position:"absolute",right:0,top:0,width:"48%",height:"100%",objectFit:"cover",objectPosition:"center",opacity:.94,filter:"saturate(.92) contrast(.98)",maskImage:"linear-gradient(90deg,transparent 0%,#000 30%)",WebkitMaskImage:"linear-gradient(90deg,transparent 0%,#000 30%)"}}/>
                <div style={{position:"relative",zIndex:2,maxWidth:"64%"}}>
                  <div style={{fontSize:10,fontWeight:900,letterSpacing:"1.4px",color:block.accent,marginBottom:7}}>{block.eyebrow}</div>
                  <h3 style={{fontSize:31,lineHeight:1.02,letterSpacing:"-1.4px",margin:"0 0 10px",fontWeight:800}}>{block.title}</h3>
                  <p style={{fontSize:13,lineHeight:1.5,color:"#6F687A",margin:0}}>{block.description}</p>
                </div>
              </div>
              <div className="platform-module-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,padding:14}}>
                {block.modules.map((module,moduleIndex)=><button key={module.id} type="button" className="platform-module-btn" onClick={()=>module.target?setPage(module.target):setPage(`module:${module.id}`)} style={{appearance:"none",border:"1px solid #EEE8F2",borderRadius:18,background:"#fff",padding:"15px 14px",display:"grid",gridTemplateColumns:"38px 1fr 18px",gap:10,alignItems:"center",textAlign:"left",color:"#10052F",cursor:"pointer",minHeight:88,gridColumn:block.modules.length%2===1&&moduleIndex===block.modules.length-1?"1/-1":undefined}}>
                  <span style={{width:38,height:38,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:block.soft,color:block.accent,fontSize:19,fontWeight:900}}>{module.icon}</span>
                  <span>
                    <b style={{display:"block",fontSize:14,lineHeight:1.25,marginBottom:4}}>{module.title}</b>
                    <small style={{display:"block",fontSize:11,lineHeight:1.35,color:"#7A7383"}}>{module.text}</small>
                  </span>
                  <span style={{fontSize:18,color:block.accent}}>›</span>
                </button>)}
              </div>
            </article>)}
          </div>
        </section>

        <section id="challenges" style={{padding:"42px 0 76px",scrollMarginTop:110}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:"2px",color:"#8D27EE",marginBottom:16}}>ВЫБИРАЙ СВОЙ ТЕМП</div>
          <div className="light-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:20}}>
            <h2 className="light-section-title" style={{fontSize:66,lineHeight:1,letterSpacing:"-3.5px",margin:0,fontWeight:800}}>Активные челленджи</h2>
            <button onClick={()=>setPage("challenges")} style={{border:0,background:"transparent",color:"#8D27EE",fontSize:16,fontWeight:800,cursor:"pointer"}}>Все челленджи ↗</button>
          </div>
          <div className="light-filters" style={{display:"flex",gap:10,margin:"38px 0 18px"}}>
            {[["all","Все"],["active","Идут сейчас"],["soon","Скоро"]].map(([id,label])=>{
              const active=challengeFilter===id;
              return <button key={id} onClick={()=>setChallengeFilter(id)} type="button" style={{border:active?0:"1px solid #DED6E6",background:active?"#10052F":"transparent",color:active?"#fff":"#10052F",borderRadius:24,padding:"11px 20px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{label}</button>;
            })}
          </div>
          <div className="light-challenge-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {filtered.map((c,i)=><LightChallengeCard key={c.id} c={c} i={challengeData.indexOf(c)} onOpen={()=>setPage("challenges")}/>)}
          </div>
        </section>

        <section id="company-progress" style={{padding:"0 0 76px",scrollMarginTop:110}}>
          <button type="button" onClick={()=>setPage("module:ratings")} className="company-progress-card company-progress-link" style={{width:"100%",textAlign:"left",appearance:"none",background:"#fff",border:"1px solid #E9E1EF",borderRadius:28,padding:"30px 34px",display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:34,alignItems:"center",boxShadow:"0 8px 24px rgba(50,25,80,.04)",cursor:"pointer",color:"#10052F"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:9,fontSize:12,fontWeight:800,letterSpacing:"1.7px",color:"#8D27EE",marginBottom:10}}>ОБЩИЙ ПРОГРЕСС <span aria-hidden="true">↗</span></div>
              <h2 style={{fontSize:40,lineHeight:1.06,letterSpacing:"-1.8px",margin:"0 0 12px",fontWeight:800}}>Вместе мы прошли <span style={{color:"#8D27EE"}}>1 240 000 шагов</span></h2>
              <p style={{fontSize:14,color:"#746D7E",margin:"0 0 20px"}}>Командный результат сезона. Нажми, чтобы открыть рейтинг и свой прогресс.</p>
              <div style={{height:9,background:"#F1EBF6",borderRadius:999,overflow:"hidden",maxWidth:560}}><div style={{width:"62%",height:"100%",background:"linear-gradient(90deg,#8D27EE,#B86BFA)",borderRadius:999}}/></div>
              <div style={{fontSize:11,color:"#81798B",marginTop:7}}>62% сезонной цели</div>
            </div>
            <div className="company-progress-stats" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
              {[["930 км","общая дистанция"],["200+","участников"],["4","активных направления"],["+18%","к прошлому месяцу"]].map(([v,l])=><div key={l} style={{border:"1px solid #ECE5F0",borderRadius:20,padding:"18px",background:"#FCFAFD"}}><strong style={{display:"block",fontSize:25,letterSpacing:"-.8px"}}>{v}</strong><span style={{fontSize:11,color:"#81798B"}}>{l}</span></div>)}
            </div>
          </button>
        </section>

        <section id="rewards" style={{padding:"0 0 78px",scrollMarginTop:110}}>
          <div className="rewards-head" style={{display:"grid",gridTemplateColumns:"1fr 330px",alignItems:"end",gap:30,marginBottom:32}}>
            <div><div style={{fontSize:13,fontWeight:800,letterSpacing:"2px",color:"#8D27EE",marginBottom:12}}>НЕ ТОЛЬКО МЕДАЛИ</div><h2 className="light-section-title" style={{fontSize:64,lineHeight:1,letterSpacing:"-3.5px",margin:0,fontWeight:800}}>Двигайся. Копи. Выбирай.</h2></div>
            <p style={{fontSize:16,lineHeight:1.55,color:"#716A7E",margin:0}}>Баллы начисляются за регулярность, результат и поддержку команды.</p>
          </div>
          <div className="rewards-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {rewards.map((r,i)=><div key={r.n} style={{height:350,borderRadius:28,background:r.bg,color:r.fg,border:r.bg==="#fff"?"1px solid #DED8E3":"none",padding:"27px",display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:12,fontWeight:800}}>{r.n}</div>
              <div style={{fontSize:i===3?64:50,textAlign:"center",margin:"65px 0 0"}}>{r.emoji}</div>
              <div style={{marginTop:"auto"}}><h3 style={{fontSize:23,margin:"0 0 8px",fontWeight:800}}>{r.title}</h3><p style={{fontSize:13,lineHeight:1.45,opacity:.75,margin:0}}>{r.text}</p></div>
            </div>)}
          </div>
        </section>

        <section id="how" className="how-grid" style={{background:"#fff",borderRadius:32,padding:"64px 74px",display:"grid",gridTemplateColumns:"0.78fr 1.22fr",gap:80,marginBottom:78,boxShadow:"0 10px 30px rgba(50,25,80,.035)"}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:"2px",color:"#8D27EE",marginBottom:14}}>ВСЁ ПРОСТО</div>
            <h2 className="how-title" style={{fontSize:66,lineHeight:1.06,letterSpacing:"-3.5px",margin:"0 0 16px",fontWeight:800}}>От идеи до<br/><span style={{color:"#8D27EE"}}>общего<br/>результата</span></h2>
            <p style={{fontSize:17,lineHeight:1.55,color:"#716A7E",maxWidth:430,margin:0}}>Никаких сложных правил: выбирай активность и двигайся в своём темпе.</p>
          </div>
          <div>
            {steps.map(s=><div key={s.n} style={{display:"grid",gridTemplateColumns:"40px 58px 1fr",gap:18,alignItems:"center",padding:"20px 0",borderBottom:"1px solid #E8E4EA"}}>
              <div style={{fontSize:12,color:"#8D27EE",fontWeight:800}}>{s.n}</div>
              <div style={{width:56,height:56,borderRadius:18,background:"#F5EDFC",display:"flex",alignItems:"center",justifyContent:"center",color:"#8D27EE",fontSize:24}}>{s.icon}</div>
              <div><h3 style={{fontSize:21,margin:"0 0 4px",fontWeight:800}}>{s.title}</h3><p style={{fontSize:14,color:"#7B7483",margin:0}}>{s.text}</p></div>
            </div>)}
          </div>
        </section>

        <section id="news" style={{padding:"0 0 58px",scrollMarginTop:110}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:"2px",color:"#8D27EE",marginBottom:15}}>БУДЬ В КУРСЕ</div>
          <div className="light-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36}}>
            <button type="button" onClick={()=>setPage("news")} className="section-title-link" style={{border:0,background:"transparent",padding:0,color:"#10052F",cursor:"pointer",textAlign:"left"}}><h2 className="light-section-title" style={{fontSize:52,lineHeight:1.02,letterSpacing:"-2.5px",margin:0,fontWeight:800}}>Новости движения <span style={{color:"#8D27EE",fontSize:28}}>↗</span></h2></button>
            <button onClick={()=>setPage("news")} style={{border:0,background:"transparent",color:"#8D27EE",fontSize:16,fontWeight:800,cursor:"pointer"}}>Все новости ↗</button>
          </div>
          <div className="home-news-grid" style={{display:"grid",gridTemplateColumns:"1.45fr .78fr .78fr",gap:16}}>
            {homeNews.map((n,i)=>{
              if(n.mode==="split") return <article className="home-news-split" key={i} onClick={()=>setPage("news")} style={{height:350,borderRadius:28,overflow:"hidden",display:"grid",gridTemplateColumns:"1.03fr .97fr",background:"#10052F",color:"#fff",cursor:"pointer"}}>
                <div style={{padding:"32px",display:"flex",flexDirection:"column"}}><span style={{alignSelf:"flex-start",background:"#8D27EE",borderRadius:18,padding:"7px 12px",fontSize:11,fontWeight:800}}>{n.type}</span><h3 style={{fontSize:31,lineHeight:1.05,letterSpacing:"-1.3px",margin:"30px 0 14px",fontWeight:800}}>{n.title}</h3><p style={{fontSize:13,lineHeight:1.55,color:"#BDB5CC",margin:0}}>{n.text}</p><b style={{fontSize:15,marginTop:"auto"}}>Читать историю →</b></div>
                <img src={MVP_SPLASH} alt="Спортивная история" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 48%",background:"#DCECF2"}}/>
              </article>;
              if(n.mode==="white") return <article key={i} style={{height:350,borderRadius:28,background:"#fff",border:"1px solid #DED8E3",padding:"30px",display:"flex",flexDirection:"column"}}>
                <span style={{alignSelf:"flex-start",background:"#E9FF1F",borderRadius:18,padding:"7px 12px",fontSize:11,fontWeight:800}}>{n.type}</span><div style={{fontSize:12,color:"#81798B",marginTop:23}}>{n.date}</div><h3 style={{fontSize:25,lineHeight:1.08,letterSpacing:"-.9px",margin:"28px 0 0",fontWeight:800}}>{n.title}</h3><button type="button" onClick={()=>setPage("news")} style={{marginTop:"auto",width:48,height:48,borderRadius:"50%",border:0,background:"#10052F",color:"#fff",fontSize:24,cursor:"pointer"}}>↗</button>
              </article>;
              return <article key={i} style={{height:350,borderRadius:28,background:"#8D27EE",color:"#fff",padding:"30px",display:"flex",flexDirection:"column"}}>
                <span style={{fontSize:11,fontWeight:800}}>{n.type}</span><div style={{fontSize:12,color:"#DCC5F8",marginTop:26}}>{n.date}</div><h3 style={{fontSize:25,lineHeight:1.08,letterSpacing:"-.9px",margin:"28px 0 0",fontWeight:800}}>{n.title}</h3><button type="button" onClick={()=>setPage("news")} style={{marginTop:"auto",width:48,height:48,borderRadius:"50%",border:0,background:"#E9FF1F",color:"#10052F",fontSize:24,cursor:"pointer"}}>↗</button>
              </article>;
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function CommunityModulePage({setPage,moduleId,signedIn=false,onLogin,isAdmin=false}){
  const module=PLATFORM_MODULES.find(item=>item.id===moduleId);
  const [city,setCity]=useState("Все города");
  const [sport,setSport]=useState("Все виды");
  const [query,setQuery]=useState("");
  const [activities,setActivities]=useState(()=>readData(STORAGE_KEYS.communityActivities,DEFAULT_COMMUNITY_ACTIVITIES));
  const [joinedTeams,setJoinedTeams]=useState(()=>readData(STORAGE_KEYS.communityTeams,[]));
  const [buddyRequests,setBuddyRequests]=useState(()=>readData(STORAGE_KEYS.communityBuddyRequests,[]));
  const [applications,setApplications]=useState(()=>readData(STORAGE_KEYS.communityApplications,[]));
  const [showActivityForm,setShowActivityForm]=useState(false);
  const [activityForm,setActivityForm]=useState({title:"",city:"Москва",sport:"Бег",when:""});
  const [joinedActivities,setJoinedActivities]=useState(()=>readData(STORAGE_KEYS.communityActivityJoins,[]));
  const [showAmbassadorForm,setShowAmbassadorForm]=useState(false);
  const [ambassadorForm,setAmbassadorForm]=useState({sport:"Бег",experience:"",idea:"",city:"Москва"});
  const [ambassadorApplications,setAmbassadorApplications]=useState(()=>readData(STORAGE_KEYS.ambassadorApplications,[]));
  const [selectedAthlete,setSelectedAthlete]=useState(null);
  const communityTabs=[
    ["city-sport","Спорт по городам"],
    ["teams","Команды"],
    ["buddy","Спортивный бадди"],
    ["ambassadors","Амбассадоры"],
    ["athlete-card","Карточки спортсменов"]
  ];
  const requireLogin=fn=>{if(!signedIn){onLogin?.();return;} fn();};
  const save=(key,value)=>{writeData(key,value);return value;};
  const track=(name,id,meta={})=>sendAnalyticsEvent(createAnalyticsEvent(name,id,meta));
  const toggleTeam=id=>requireLogin(()=>{
    setJoinedTeams(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      save(STORAGE_KEYS.communityTeams,next);
      track(prev.includes(id)?"community_team_leave":"community_team_join",id);
      return next;
    });
  });
  const toggleBuddy=id=>requireLogin(()=>{
    setBuddyRequests(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      save(STORAGE_KEYS.communityBuddyRequests,next);
      track(prev.includes(id)?"community_buddy_cancel":"community_buddy_request",id);
      return next;
    });
  });
  const toggleApplication=id=>requireLogin(()=>{
    setApplications(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      save(STORAGE_KEYS.communityApplications,next);
      track(prev.includes(id)?"community_application_cancel":"community_application_submit",id);
      return next;
    });
  });
  const addActivity=()=>requireLogin(()=>{
    if(!activityForm.title.trim()||!activityForm.when.trim())return;
    const item={id:`a${Date.now()}`,...activityForm,author:"Вы",people:1};
    const next=[item,...activities];
    setActivities(next);save(STORAGE_KEYS.communityActivities,next);
    track("community_activity_create",item.id,{city:item.city,sport:item.sport});
    setActivityForm({title:"",city:"Москва",sport:"Бег",when:""});
    setShowActivityForm(false);
  });
  const toggleActivity=id=>requireLogin(()=>{
    setJoinedActivities(prev=>{
      const joined=prev.includes(id);
      const next=joined?prev.filter(x=>x!==id):[...prev,id];
      writeData(STORAGE_KEYS.communityActivityJoins,next);
      setActivities(items=>items.map(x=>x.id===id?{...x,people:Math.max(0,Number(x.people||0)+(joined?-1:1))}:x));
      track(joined?"community_activity_leave":"community_activity_join",id);
      return next;
    });
  });
  const submitAmbassador=()=>requireLogin(()=>{
    if(!ambassadorForm.idea.trim())return;
    const item={id:`amb-${Date.now()}`,...ambassadorForm,status:"На рассмотрении",date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long"})};
    const next=[item,...ambassadorApplications];
    setAmbassadorApplications(next);
    writeData(STORAGE_KEYS.ambassadorApplications,next);
    track("ambassador_application_submit",item.id,{sport:item.sport,city:item.city});
    setAmbassadorForm({sport:"Бег",experience:"",idea:"",city:"Москва"});
    setShowAmbassadorForm(false);
  });
  const filteredPeople=COMMUNITY_PEOPLE.filter(p=>(city==="Все города"||p.city===city)&&(sport==="Все виды"||p.sports.includes(sport))&&(!query||(`${p.name} ${p.city} ${p.sports.join(" ")}`).toLowerCase().includes(query.toLowerCase())));
  const filteredActivities=activities.filter(a=>(city==="Все города"||a.city===city)&&(sport==="Все виды"||a.sport===sport)&&(!query||(`${a.title} ${a.city} ${a.sport}`).toLowerCase().includes(query.toLowerCase())));
  const ambassadors=COMMUNITY_PEOPLE.filter(p=>p.role);
  const cities=["Все города","Москва","Санкт-Петербург","Казань","Новосибирск"];
  const sports=["Все виды","Бег","Плавание","Велосипед","Йога","Лыжи"];
  const cardStyle={background:"#fff",border:"1px solid #E7E0EC",borderRadius:24,boxShadow:"0 10px 28px rgba(50,25,80,.045)"};
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} activeGroup="block-community"/>
      <main className="light-main community-main" style={{maxWidth:1450,margin:"0 auto",padding:"38px 42px 80px"}}>
        <section className="community-hero" style={{...cardStyle,position:"relative",overflow:"hidden",padding:"38px",background:"linear-gradient(115deg,#EAF7FB 0%,#F7F3FC 58%,#fff 100%)"}}>
          <img src={MVP_SURF} alt="" style={{position:"absolute",right:0,top:0,width:"39%",height:"100%",objectFit:"cover",opacity:.86,maskImage:"linear-gradient(90deg,transparent,#000 32%)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 32%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:760}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:"1.6px",color:"#1699C4",marginBottom:10}}>ЛЮДИ И СООБЩЕСТВО</div>
            <h1 className="light-page-title" style={{fontSize:58,lineHeight:1,letterSpacing:"-2.8px",margin:"0 0 12px",fontWeight:800}}>Находи своих в право(спорт)</h1>
            <p style={{fontSize:16,lineHeight:1.55,color:"#6E6877",margin:0,maxWidth:650}}>Команды, спортивные партнёры, амбассадоры и активности коллег — без ручного поиска по чатам.</p>
          </div>
        </section>

        <nav className="community-tabs" style={{display:"flex",gap:8,overflowX:"auto",padding:"18px 0 8px",scrollbarWidth:"none"}}>
          {communityTabs.map(([id,label])=><button key={id} type="button" onClick={()=>setPage(`module:${id}`)} style={{flex:"0 0 auto",border:moduleId===id?0:"1px solid #E5DCEB",background:moduleId===id?"#10052F":"#fff",color:moduleId===id?"#fff":"#554C62",borderRadius:18,padding:"10px 15px",fontSize:12.5,fontWeight:800,cursor:"pointer"}}>{label}</button>)}
        </nav>

        {["city-sport","buddy"].includes(moduleId)&&<div className="community-filters" style={{...cardStyle,padding:"16px",margin:"12px 0 18px",display:"grid",gridTemplateColumns:"1.4fr .8fr .8fr",gap:10}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по людям, спорту или активности" style={{border:"1px solid #E5DCEB",borderRadius:14,padding:"11px 13px",font:"inherit",outline:"none"}}/>
          <select value={city} onChange={e=>setCity(e.target.value)} style={{border:"1px solid #E5DCEB",borderRadius:14,padding:"11px 13px",font:"inherit",background:"#fff"}}>{cities.map(x=><option key={x}>{x}</option>)}</select>
          <select value={sport} onChange={e=>setSport(e.target.value)} style={{border:"1px solid #E5DCEB",borderRadius:14,padding:"11px 13px",font:"inherit",background:"#fff"}}>{sports.map(x=><option key={x}>{x}</option>)}</select>
        </div>}

        {moduleId==="city-sport"&&<>
          <div className="community-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}>
            <div><div style={{fontSize:11,fontWeight:900,color:"#1699C4",letterSpacing:"1.3px"}}>РЯДОМ С ТОБОЙ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Активности коллег</h2></div>
            <button type="button" onClick={()=>requireLogin(()=>setShowActivityForm(true))} style={{border:0,borderRadius:18,background:"#8D27EE",color:"#fff",padding:"11px 16px",fontWeight:800,cursor:"pointer"}}>+ Предложить активность</button>
          </div>
          <div className="community-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14}}>
            {filteredActivities.map(a=><article key={a.id} style={{...cardStyle,padding:"22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:18}}><span style={{background:"#EAF7FB",color:"#1484A9",padding:"6px 10px",borderRadius:999,fontSize:10,fontWeight:800}}>{a.sport}</span><span style={{fontSize:11,color:"#7D7587"}}>{a.city}</span></div>
              <h3 style={{fontSize:22,margin:"0 0 8px"}}>{a.title}</h3><p style={{fontSize:13,color:"#756E7E",margin:"0 0 18px"}}>{a.when} · организатор {a.author}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#756E7E"}}>👥 {a.people} уже идут</span><button onClick={()=>toggleActivity(a.id)} type="button" style={{border:joinedActivities.includes(a.id)?0:"1px solid #DCCDEA",background:joinedActivities.includes(a.id)?"#E9F8EF":"#fff",color:joinedActivities.includes(a.id)?"#08783F":"#7C2BD0",borderRadius:14,padding:"8px 12px",fontWeight:800,cursor:"pointer"}}>{joinedActivities.includes(a.id)?"✓ Вы идёте":"Присоединиться"}</button></div>
            </article>)}
          </div>
        </>}

        {moduleId==="teams"&&<>
          <div className="community-section-head" style={{margin:"28px 0 16px"}}><div style={{fontSize:11,fontWeight:900,color:"#1699C4",letterSpacing:"1.3px"}}>КОМАНДЫ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Найди команду по интересам</h2></div>
          <div className="community-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14}}>
            {COMMUNITY_TEAMS.map(t=>{const joined=joinedTeams.includes(t.id);return <article key={t.id} style={{...cardStyle,padding:"22px",display:"grid",gridTemplateColumns:"58px 1fr auto",gap:16,alignItems:"center"}}>
              <div style={{width:58,height:58,borderRadius:18,background:"#F2E9FC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{t.emoji}</div>
              <div><h3 style={{fontSize:18,margin:"0 0 5px"}}>{t.name}</h3><div style={{fontSize:12,color:"#756E7E"}}>{t.city} · {t.sport} · {t.members+(joined?1:0)} участников</div><p style={{fontSize:12,color:"#756E7E",margin:"8px 0 0"}}>{t.desc}</p></div>
              <button type="button" onClick={()=>toggleTeam(t.id)} style={{border:joined?0:"1px solid #DCCDEA",background:joined?"#E9F8EF":"#fff",color:joined?"#08783F":"#7C2BD0",borderRadius:14,padding:"9px 12px",fontWeight:800,cursor:"pointer"}}>{joined?"✓ В команде":"Вступить"}</button>
            </article>})}
          </div>
        </>}

        {moduleId==="buddy"&&<>
          <div className="community-section-head" style={{margin:"28px 0 16px"}}><div style={{fontSize:11,fontWeight:900,color:"#1699C4",letterSpacing:"1.3px"}}>СПОРТИВНЫЙ БАДДИ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Найди партнёра для тренировок</h2></div>
          <div className="community-people-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
            {filteredPeople.map(p=>{const sent=buddyRequests.includes(p.id);return <article key={p.id} style={{...cardStyle,padding:"22px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{width:48,height:48,borderRadius:"50%",background:colFor(p.id),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>{p.avatar}</div><div><b>{p.name}</b><div style={{fontSize:11,color:"#7D7587"}}>{p.city} · {p.level}</div></div></div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{p.sports.map(s=><span key={s} style={{background:"#F4EEF8",color:"#6B2BB4",padding:"5px 8px",borderRadius:999,fontSize:10,fontWeight:800}}>{s}</span>)}</div>
              <p style={{fontSize:12.5,lineHeight:1.5,color:"#756E7E",minHeight:56}}>{p.about}</p>
              <button type="button" onClick={()=>toggleBuddy(p.id)} style={{width:"100%",border:sent?0:"1px solid #DCCDEA",background:sent?"#E9F8EF":"#fff",color:sent?"#08783F":"#7C2BD0",borderRadius:14,padding:"9px 12px",fontWeight:800,cursor:"pointer"}}>{sent?"✓ Запрос отправлен":"Предложить тренировку"}</button>
            </article>})}
          </div>
        </>}

        {moduleId==="ambassadors"&&<>
          <div className="community-section-head" style={{margin:"28px 0 16px"}}><div style={{fontSize:11,fontWeight:900,color:"#1699C4",letterSpacing:"1.3px"}}>АМБАССАДОРЫ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Люди, которые двигают сообщество</h2></div>
          <div className="community-people-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
            {ambassadors.map(p=>{const applied=applications.includes(`amb-${p.id}`);return <article key={p.id} style={{...cardStyle,padding:"22px",background:"linear-gradient(160deg,#fff,#F6F1FB)"}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:colFor(p.id),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,marginBottom:16}}>{p.avatar}</div>
              <div style={{fontSize:10,fontWeight:900,color:"#8D27EE",letterSpacing:"1px"}}>{p.role.toUpperCase()}</div><h3 style={{fontSize:22,margin:"7px 0"}}>{p.name}</h3><p style={{fontSize:12.5,lineHeight:1.5,color:"#756E7E",minHeight:58}}>{p.about}</p>
              <button type="button" onClick={()=>toggleApplication(`amb-${p.id}`)} style={{border:0,background:applied?"#E9F8EF":"#10052F",color:applied?"#08783F":"#fff",borderRadius:14,padding:"9px 12px",fontWeight:800,cursor:"pointer"}}>{applied?"✓ Заявка отправлена":"Предложить инициативу"}</button>
            </article>})}
          </div>
          <div style={{...cardStyle,marginTop:16,padding:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,background:"#E9FF1F"}}><div><div style={{fontSize:11,fontWeight:900,letterSpacing:"1.2px"}}>ХОЧЕШЬ БОЛЬШЕ?</div><h3 style={{fontSize:24,margin:"6px 0 0"}}>Стань амбассадором своего вида спорта</h3><p style={{fontSize:12.5,margin:"7px 0 0",color:"#514A57"}}>Расскажи, какой спорт развиваешь и что готов предложить коллегам.</p></div><button type="button" onClick={()=>requireLogin(()=>setShowAmbassadorForm(true))} style={{border:0,background:"#10052F",color:"#fff",borderRadius:16,padding:"11px 15px",fontWeight:800,cursor:"pointer"}}>Подать заявку</button></div>
          {ambassadorApplications.length>0&&<section style={{...cardStyle,marginTop:14,padding:"20px"}}><h3 style={{margin:"0 0 10px"}}>Моя заявка</h3>{ambassadorApplications.slice(0,2).map(x=><div key={x.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,padding:"10px 0",borderTop:"1px solid #EEE7F2"}}><div><b style={{fontSize:13}}>{x.sport} · {x.city}</b><div style={{fontSize:11,color:"#7B7484",marginTop:3}}>{x.idea}</div></div><span style={{fontSize:10,fontWeight:800,color:"#8D27EE",background:"#F4EEF8",borderRadius:999,padding:"6px 9px",alignSelf:"start"}}>{x.status}</span></div>)}</section>}
        </>}

        {moduleId==="athlete-card"&&<>
          <div className="community-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}><div><div style={{fontSize:11,fontWeight:900,color:"#1699C4",letterSpacing:"1.3px"}}>ИСТОРИИ КОЛЛЕГ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Карточки спортсменов</h2></div><button type="button" onClick={()=>toggleApplication("athlete-story")} style={{border:0,background:"#8D27EE",color:"#fff",borderRadius:16,padding:"10px 14px",fontWeight:800,cursor:"pointer"}}>{applications.includes("athlete-story")?"✓ Заявка отправлена":"Хочу стать героем"}</button></div>
          <div className="community-people-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
            {COMMUNITY_PEOPLE.slice(0,6).map((p,i)=><article key={p.id} style={{...cardStyle,overflow:"hidden"}}>
              <div style={{height:120,background:i%2===0?"linear-gradient(135deg,#E7D7F9,#D7EFF7)":"linear-gradient(135deg,#FFF0D9,#F3E3FA)",display:"flex",alignItems:"flex-end",padding:"18px"}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:colFor(p.id),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,border:"4px solid #fff"}}>{p.avatar}</div>
              </div>
              <div style={{padding:"18px"}}><h3 style={{fontSize:20,margin:"0 0 5px"}}>{p.name}</h3><div style={{fontSize:11,color:"#7D7587"}}>{p.city} · {p.sports.join(" · ")}</div><p style={{fontSize:12.5,lineHeight:1.5,color:"#756E7E",minHeight:58}}>{p.about}</p><button type="button" onClick={()=>{setSelectedAthlete(p);track("profile_view",p.id);}} style={{border:0,background:"transparent",color:"#8D27EE",padding:0,fontWeight:800,cursor:"pointer"}}>Открыть историю ↗</button></div>
            </article>)}
          </div>
        </>}
      </main>

      {showAmbassadorForm&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowAmbassadorForm(false)}><div className="light-modal">
        <button className="modal-close" onClick={()=>setShowAmbassadorForm(false)}>×</button>
        <h2>Стать амбассадором спорта</h2>
        <p className="muted" style={{marginTop:-4}}>Расскажи, какую спортивную инициативу ты готов развивать внутри компании.</p>
        <label>Вид спорта<select value={ambassadorForm.sport} onChange={e=>setAmbassadorForm(p=>({...p,sport:e.target.value}))} style={{border:"1px solid #e3d9ed",borderRadius:11,padding:"11px 12px",font:"inherit",background:"#fff"}}>{sports.filter(x=>x!=="Все виды").map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Город<select value={ambassadorForm.city} onChange={e=>setAmbassadorForm(p=>({...p,city:e.target.value}))} style={{border:"1px solid #e3d9ed",borderRadius:11,padding:"11px 12px",font:"inherit",background:"#fff"}}>{cities.filter(x=>x!=="Все города").map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Опыт<textarea value={ambassadorForm.experience} onChange={e=>setAmbassadorForm(p=>({...p,experience:e.target.value}))} placeholder="Например: бегаю 5 лет, организовывал совместные старты"/></label>
        <label>Что ты можешь предложить? <textarea value={ambassadorForm.idea} onChange={e=>setAmbassadorForm(p=>({...p,idea:e.target.value}))} placeholder="Тренировки, встречи, помощь новичкам, организацию команды..." required/></label>
        <button className="primary-btn" onClick={submitAmbassador}>Отправить заявку</button>
      </div></div>}

      {selectedAthlete&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSelectedAthlete(null)}><div className="light-modal" style={{maxWidth:560}}>
        <button className="modal-close" onClick={()=>setSelectedAthlete(null)}>×</button>
        <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:64,height:64,borderRadius:"50%",background:colFor(selectedAthlete.id),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900}}>{selectedAthlete.avatar}</div><div><h2 style={{margin:0}}>{selectedAthlete.name}</h2><div className="muted">{selectedAthlete.city} · {selectedAthlete.sports.join(" · ")}</div></div></div>
        <div style={{background:"#F8F4FB",borderRadius:18,padding:"18px"}}><div style={{fontSize:10,fontWeight:900,color:"#8D27EE",letterSpacing:"1px",marginBottom:8}}>СПОРТИВНАЯ ИСТОРИЯ</div><p style={{fontSize:14,lineHeight:1.6,margin:0,color:"#5F5869"}}>{selectedAthlete.about} Спорт для меня — способ переключаться, находить единомышленников и постепенно видеть собственный прогресс.</p></div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{selectedAthlete.sports.map(s=><span key={s} style={{background:"#F4EEF8",color:"#6B2BB4",padding:"6px 9px",borderRadius:999,fontSize:11,fontWeight:800}}>{s}</span>)}</div>
        {selectedAthlete.role&&<div style={{fontSize:12,fontWeight:800,color:"#159B66"}}>★ {selectedAthlete.role}</div>}
      </div></div>}

      {showActivityForm&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowActivityForm(false)}><div className="light-modal">
        <button className="modal-close" onClick={()=>setShowActivityForm(false)}>×</button><h2>Предложить активность</h2>
        <label>Название<input value={activityForm.title} onChange={e=>setActivityForm(p=>({...p,title:e.target.value}))} placeholder="Например, пробежка 5 км"/></label>
        <label>Город<select value={activityForm.city} onChange={e=>setActivityForm(p=>({...p,city:e.target.value}))} style={{border:"1px solid #e3d9ed",borderRadius:11,padding:"11px 12px",font:"inherit"}}>{cities.filter(x=>x!=="Все города").map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Вид спорта<select value={activityForm.sport} onChange={e=>setActivityForm(p=>({...p,sport:e.target.value}))} style={{border:"1px solid #e3d9ed",borderRadius:11,padding:"11px 12px",font:"inherit"}}>{sports.filter(x=>x!=="Все виды").map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Когда<input value={activityForm.when} onChange={e=>setActivityForm(p=>({...p,when:e.target.value}))} placeholder="Суббота · 10:00"/></label>
        <button className="primary-btn" onClick={addActivity}>Опубликовать</button>
      </div></div>}
    </div>
  );
}

function ProgressModulePage({setPage,moduleId,signedIn=false,onLogin,isAdmin=false}){
  const tabs=[["ratings","Рейтинги"],["coins","Коины"],["benefits","Бенефиты"],["achievement","Достижения"]];
  const [redemptions,setRedemptions]=useState(()=>readData(STORAGE_KEYS.rewardRedemptions,[]));
  const [claims,setClaims]=useState(()=>readData(STORAGE_KEYS.achievementClaims,[]));
  const [claimTitle,setClaimTitle]=useState("");
  const [claimText,setClaimText]=useState("");
  const requireLogin=fn=>{if(!signedIn){onLogin?.();return;}fn();};
  const track=(name,id,meta={})=>sendAnalyticsEvent(createAnalyticsEvent(name,id,meta));
  const leaderboard=[
    {rank:1,name:"Алексей К.",team:"Backend",value:"87 000 шагов",delta:"+2",avatar:"АК"},
    {rank:2,name:"Мария П.",team:"HR",value:"74 000 шагов",delta:"+1",avatar:"МП"},
    {rank:3,name:"Иван С.",team:"Frontend",value:"68 000 шагов",delta:"—",avatar:"ИС"},
    {rank:4,name:"Вы",team:"HR",value:"42 000 шагов",delta:"+3",avatar:"Я"},
    {rank:5,name:"Ольга С.",team:"Design",value:"38 000 шагов",delta:"-1",avatar:"ОС"},
    {rank:6,name:"Никита Р.",team:"Product",value:"36 500 шагов",delta:"+1",avatar:"НР"}
  ];
  const rewards=[
    {id:"fitmost",title:"Fitmost",text:"Доступ к спортивным студиям и тренировкам.",cost:120,emoji:"🏋️"},
    {id:"merch",title:"Спортивный мерч",text:"Футболка или аксессуар право(спорт).",cost:90,emoji:"👕"},
    {id:"consult",title:"Персональная консультация",text:"30 минут с корпоративным тренером.",cost:70,emoji:"💬"},
    {id:"start",title:"Компенсация старта",text:"Часть стоимости участия в согласованном старте.",cost:180,emoji:"🏁"}
  ];
  const earned=[
    {id:"streak",icon:"⚡",title:"Серия 14 дней",text:"Активность 14 дней подряд",done:true},
    {id:"team",icon:"♥",title:"Командный игрок",text:"Поддержка коллег и командные активности",done:true},
    {id:"starter",icon:"🏁",title:"Первый старт",text:"Первый подтверждённый результат",done:true},
    {id:"leader",icon:"🏆",title:"Топ-3 сезона",text:"Попади в тройку рейтинга",done:false}
  ];
  const coinBalance=145-redemptions.reduce((sum,id)=>sum+(rewards.find(r=>r.id===id)?.cost||0),0);
  const redeem=reward=>requireLogin(()=>{
    if(redemptions.includes(reward.id)||coinBalance<reward.cost)return;
    const next=[...redemptions,reward.id];
    setRedemptions(next);writeData(STORAGE_KEYS.rewardRedemptions,next);
    track("reward_redeem",reward.id,{cost:reward.cost});
  });
  const submitClaim=()=>requireLogin(()=>{
    if(!claimTitle.trim()||!claimText.trim())return;
    const item={id:`ach-${Date.now()}`,title:claimTitle.trim(),text:claimText.trim(),status:"На модерации",date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long"})};
    const next=[item,...claims];
    setClaims(next);writeData(STORAGE_KEYS.achievementClaims,next);
    track("achievement_claim_submit",item.id);
    setClaimTitle("");setClaimText("");
  });
  const card={background:"#fff",border:"1px solid #E8E1ED",borderRadius:24,boxShadow:"0 10px 28px rgba(50,25,80,.045)"};
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} activeGroup="block-motivation"/>
      <main className="light-main progress-main" style={{maxWidth:1450,margin:"0 auto",padding:"38px 42px 80px"}}>
        <section className="progress-hero" style={{...card,position:"relative",overflow:"hidden",padding:"38px",background:"linear-gradient(115deg,#FFF4E5 0%,#F7F1FC 56%,#fff 100%)"}}>
          <img src={MVP_ICE} alt="" style={{position:"absolute",right:0,top:0,width:"38%",height:"100%",objectFit:"cover",opacity:.78,maskImage:"linear-gradient(90deg,transparent,#000 35%)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 35%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:760}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:"1.6px",color:"#D97706",marginBottom:10}}>ПРОГРЕСС И НАГРАДЫ</div>
            <h1 className="light-page-title" style={{fontSize:58,lineHeight:1,letterSpacing:"-2.8px",margin:"0 0 12px",fontWeight:800}}>Делай прогресс видимым</h1>
            <p style={{fontSize:16,lineHeight:1.55,color:"#6E6877",margin:0,maxWidth:650}}>Рейтинг, коины, достижения и спортивные бенефиты — в одном месте и с понятной логикой.</p>
          </div>
        </section>

        <nav className="progress-tabs" style={{display:"flex",gap:8,overflowX:"auto",padding:"18px 0 8px",scrollbarWidth:"none"}}>
          {tabs.map(([id,label])=><button key={id} type="button" onClick={()=>setPage(`module:${id}`)} style={{flex:"0 0 auto",border:moduleId===id?0:"1px solid #E5DCEB",background:moduleId===id?"#10052F":"#fff",color:moduleId===id?"#fff":"#554C62",borderRadius:18,padding:"10px 15px",fontSize:12.5,fontWeight:800,cursor:"pointer"}}>{label}</button>)}
        </nav>

        {moduleId==="ratings"&&<>
          <div className="progress-kpis" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,margin:"16px 0"}}>
            {[["4","место сейчас"],["42 000","шагов в сезоне"],["+3","позиции за неделю"],["7","активных дней"]].map(([v,l])=><div key={l} style={{...card,padding:"20px"}}><strong style={{display:"block",fontSize:30,letterSpacing:"-1.3px"}}>{v}</strong><span style={{fontSize:11,color:"#7B7484"}}>{l}</span></div>)}
          </div>
          <section style={{...card,padding:"8px 22px 14px",marginTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,padding:"18px 0 12px"}}><div><div style={{fontSize:11,fontWeight:900,color:"#D97706",letterSpacing:"1.2px"}}>СЕЗОН 2026</div><h2 style={{fontSize:28,margin:"4px 0 0"}}>Общий рейтинг</h2></div><span style={{fontSize:11,color:"#7B7484"}}>обновлено недавно</span></div>
            {leaderboard.map(r=><div key={r.rank} className="rating-row" style={{display:"grid",gridTemplateColumns:"36px 44px 1fr 140px 80px",gap:12,alignItems:"center",padding:"13px 0",borderTop:"1px solid #EEE7F2",background:r.name==="Вы"?"#FBF7FF":"transparent",borderRadius:r.name==="Вы"?12:0}}>
              <b style={{fontSize:13,textAlign:"center"}}>{r.rank}</b><div style={{width:38,height:38,borderRadius:"50%",background:colFor(r.name),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900}}>{r.avatar}</div>
              <div><b style={{fontSize:13}}>{r.name}</b><div style={{fontSize:10.5,color:"#847C8C"}}>{r.team}</div></div><div style={{fontSize:12,fontWeight:800,textAlign:"right"}}>{r.value}</div><div style={{fontSize:11,color:r.delta.startsWith("+")?"#159B66":"#8A8491",textAlign:"right"}}>{r.delta}</div>
            </div>)}
          </section>
        </>}

        {moduleId==="coins"&&<>
          <section style={{...card,marginTop:16,padding:"28px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"center",background:"linear-gradient(135deg,#10052F,#2D1260)",color:"#fff"}}>
            <div><div style={{fontSize:11,fontWeight:900,letterSpacing:"1.2px",color:"#DCC4F8"}}>ТВОЙ БАЛАНС</div><div style={{fontSize:64,fontWeight:800,letterSpacing:"-3px",marginTop:8}}>{coinBalance}</div><div style={{fontSize:13,color:"#D6C8E4"}}>коинов доступно</div></div>
            <div style={{fontSize:13,lineHeight:1.6,color:"#E8DEF1"}}>Коины начисляются за участие, регулярность, результаты и поддержку сообщества. Правила начисления будут синхронизироваться автоматически с корпоративной системой.</div>
          </section>
          <div className="coin-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14,marginTop:16}}>
            {[["Челлендж завершён","+40"],["7 дней активности","+25"],["Помощь команде","+15"],["Новый результат","+10"],["Участие в старте","+30"],["Инициатива сообщества","+20"]].map(([t,v])=><div key={t} style={{...card,padding:"20px"}}><span style={{fontSize:11,color:"#7B7484"}}>{t}</span><strong style={{display:"block",fontSize:23,color:"#D97706",marginTop:8}}>{v}</strong></div>)}
          </div>
        </>}

        {moduleId==="benefits"&&<>
          <div className="progress-section-head" style={{margin:"28px 0 16px"}}><div style={{fontSize:11,fontWeight:900,color:"#D97706",letterSpacing:"1.3px"}}>БЕНЕФИТЫ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>На что можно потратить коины</h2></div>
          <div className="benefit-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14}}>
            {rewards.map(r=>{const used=redemptions.includes(r.id);const disabled=used||coinBalance<r.cost;return <article key={r.id} style={{...card,padding:"22px",display:"grid",gridTemplateColumns:"58px 1fr auto",gap:16,alignItems:"center"}}>
              <div style={{width:58,height:58,borderRadius:18,background:"#FFF4E5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:27}}>{r.emoji}</div>
              <div><h3 style={{fontSize:18,margin:"0 0 5px"}}>{r.title}</h3><p style={{fontSize:12,color:"#756E7E",margin:0,lineHeight:1.45}}>{r.text}</p><div style={{fontSize:11,fontWeight:900,color:"#D97706",marginTop:8}}>{r.cost} коинов</div></div>
              <button onClick={()=>redeem(r)} disabled={disabled} type="button" style={{border:0,background:used?"#E9F8EF":disabled?"#F2EEF4":"#10052F",color:used?"#08783F":disabled?"#9991A0":"#fff",borderRadius:14,padding:"9px 12px",fontWeight:800,cursor:disabled?"default":"pointer"}}>{used?"✓ Выбрано":coinBalance<r.cost?"Не хватает":"Выбрать"}</button>
            </article>})}
          </div>
        </>}

        {moduleId==="achievement"&&<>
          <div className="achievement-layout" style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:16,marginTop:16}}>
            <section style={{...card,padding:"24px"}}>
              <div style={{fontSize:11,fontWeight:900,color:"#D97706",letterSpacing:"1.3px"}}>МОИ ДОСТИЖЕНИЯ</div><h2 style={{fontSize:28,margin:"5px 0 20px"}}>Открытые бейджи</h2>
              <div className="achievement-showcase" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
                {earned.map(a=><div key={a.id} style={{border:"1px solid #EEE7F2",borderRadius:18,padding:"18px",opacity:a.done?1:.45,background:a.done?"#fff":"#FAF8FB"}}>
                  <div style={{fontSize:32}}>{a.icon}</div><b style={{display:"block",fontSize:14,margin:"10px 0 4px"}}>{a.title}</b><span style={{fontSize:11,color:"#7B7484"}}>{a.text}</span>
                </div>)}
              </div>
            </section>
            <section style={{...card,padding:"24px"}}>
              <div style={{fontSize:11,fontWeight:900,color:"#D97706",letterSpacing:"1.3px"}}>ЗАЯВИ О ДОСТИЖЕНИИ</div><h2 style={{fontSize:25,margin:"5px 0 8px"}}>Поделись результатом</h2><p style={{fontSize:12.5,color:"#756E7E",lineHeight:1.5,margin:"0 0 16px"}}>Например: первый полумарафон, личный рекорд или спортивный результат вне корпоративного челленджа.</p>
              <input value={claimTitle} onChange={e=>setClaimTitle(e.target.value)} placeholder="Название достижения" style={{width:"100%",border:"1px solid #E4DCE9",borderRadius:12,padding:"11px 12px",font:"inherit",marginBottom:9}}/>
              <textarea value={claimText} onChange={e=>setClaimText(e.target.value)} placeholder="Расскажи коротко о результате" style={{width:"100%",minHeight:92,border:"1px solid #E4DCE9",borderRadius:12,padding:"11px 12px",font:"inherit",resize:"vertical",marginBottom:10}}/>
              <button className="primary-btn" onClick={submitClaim}>Отправить на модерацию</button>
            </section>
          </div>
          {claims.length>0&&<section style={{...card,padding:"22px",marginTop:16}}><h3 style={{margin:"0 0 12px"}}>Мои заявки</h3>{claims.map(x=><div key={x.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:14,padding:"12px 0",borderTop:"1px solid #EEE7F2"}}><div><b style={{fontSize:13}}>{x.title}</b><div style={{fontSize:11,color:"#7B7484",marginTop:3}}>{x.text}</div></div><span style={{fontSize:10,fontWeight:800,color:"#8D27EE",background:"#F4EEF8",borderRadius:999,padding:"6px 9px",alignSelf:"start"}}>{x.status}</span></div>)}</section>}
        </>}
      </main>
    </div>
  );
}

function SupportModulePage({setPage,moduleId,signedIn=false,onLogin,isAdmin=false,news=INIT_NEWS,events=[]}){
  const tabs=[["trainer","Тренер"],["sport-news","Новости спорта"],["announcements","Анонсы"]];
  const [questions,setQuestions]=useState(()=>readData(STORAGE_KEYS.trainerQuestions,[]));
  const [bookmarks,setBookmarks]=useState(()=>readData(STORAGE_KEYS.supportBookmarks,[]));
  const [topic,setTopic]=useState("Тренировки");
  const [question,setQuestion]=useState("");
  const [search,setSearch]=useState("");
  const requireLogin=fn=>{if(!signedIn){onLogin?.();return;}fn();};
  const track=(name,id,meta={})=>sendAnalyticsEvent(createAnalyticsEvent(name,id,meta));
  const save=(key,value)=>{writeData(key,value);return value;};
  const card={background:"#fff",border:"1px solid #E8E1ED",borderRadius:24,boxShadow:"0 10px 28px rgba(50,25,80,.045)"};
  const trainerTopics=[
    {icon:"🏃",title:"Подготовка к старту",text:"Как построить план и не перегореть."},
    {icon:"🧘",title:"Восстановление",text:"Сон, мобилити и нагрузка между тренировками."},
    {icon:"💪",title:"Силовые тренировки",text:"Базовые рекомендации для новичков."},
    {icon:"❤️",title:"Самочувствие",text:"Как понять, когда нагрузку лучше снизить."}
  ];
  const visibleNews=(news||[]).filter(n=>!n.archived).filter(n=>!search||(`${n.title||""} ${n.text||""} ${n.cat||""}`).toLowerCase().includes(search.toLowerCase()));
  const visibleEvents=(events||[]).filter(e=>!e.archived).filter(e=>!search||(`${e.title||""} ${e.place||""} ${e.kind||""}`).toLowerCase().includes(search.toLowerCase()));
  const ask=()=>requireLogin(()=>{
    if(!question.trim())return;
    const item={id:`q-${Date.now()}`,topic,text:question.trim(),status:"Отправлен тренеру",date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long"})};
    const next=[item,...questions];setQuestions(next);save(STORAGE_KEYS.trainerQuestions,next);track("trainer_question_submit",item.id,{topic});setQuestion("");
  });
  const toggleBookmark=id=>{
    setBookmarks(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];save(STORAGE_KEYS.supportBookmarks,next);track(prev.includes(id)?"support_bookmark_remove":"support_bookmark_add",id);return next;});
  };
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} activeGroup="block-support"/>
      <main className="light-main support-main" style={{maxWidth:1450,margin:"0 auto",padding:"38px 42px 80px"}}>
        <section className="support-hero" style={{...card,position:"relative",overflow:"hidden",padding:"38px",background:"linear-gradient(115deg,#EAF8F2 0%,#F7F3FC 56%,#fff 100%)"}}>
          <img src={LIGHT_SWIM} alt="" style={{position:"absolute",right:0,top:0,width:"39%",height:"100%",objectFit:"cover",opacity:.8,maskImage:"linear-gradient(90deg,transparent,#000 35%)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 35%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:760}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:"1.6px",color:"#159B66",marginBottom:10}}>ПОДДЕРЖКА И ИНФОРМАЦИЯ</div>
            <h1 className="light-page-title" style={{fontSize:58,lineHeight:1,letterSpacing:"-2.8px",margin:"0 0 12px",fontWeight:800}}>Помощь, новости и важные события</h1>
            <p style={{fontSize:16,lineHeight:1.55,color:"#6E6877",margin:0,maxWidth:650}}>Один раздел для вопросов тренеру, спортивных новостей и ближайших анонсов.</p>
          </div>
        </section>

        <nav className="support-tabs" style={{display:"flex",gap:8,overflowX:"auto",padding:"18px 0 8px",scrollbarWidth:"none"}}>
          {tabs.map(([id,label])=><button key={id} type="button" onClick={()=>setPage(`module:${id}`)} style={{flex:"0 0 auto",border:moduleId===id?0:"1px solid #E5DCEB",background:moduleId===id?"#10052F":"#fff",color:moduleId===id?"#fff":"#554C62",borderRadius:18,padding:"10px 15px",fontSize:12.5,fontWeight:800,cursor:"pointer"}}>{label}</button>)}
        </nav>

        {moduleId==="trainer"&&<>
          <div className="trainer-layout" style={{display:"grid",gridTemplateColumns:"1.05fr .95fr",gap:16,marginTop:16}}>
            <section style={{...card,padding:"24px"}}>
              <div style={{fontSize:11,fontWeight:900,color:"#159B66",letterSpacing:"1.3px"}}>ЗАДАТЬ ВОПРОС</div><h2 style={{fontSize:28,margin:"5px 0 8px"}}>Корпоративный тренер</h2>
              <p style={{fontSize:12.5,lineHeight:1.5,color:"#756E7E",margin:"0 0 16px"}}>Выбери тему и опиши ситуацию. После отправки вопрос появится в очереди тренера.</p>
              <select value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%",border:"1px solid #E4DCE9",borderRadius:12,padding:"11px 12px",font:"inherit",background:"#fff",marginBottom:9}}>{["Тренировки","Подготовка к старту","Восстановление","Самочувствие","Питание"].map(x=><option key={x}>{x}</option>)}</select>
              <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Напиши свой вопрос..." style={{width:"100%",minHeight:130,border:"1px solid #E4DCE9",borderRadius:12,padding:"11px 12px",font:"inherit",resize:"vertical",marginBottom:10}}/>
              <button className="primary-btn" onClick={ask}>Отправить тренеру</button>
              {questions.length>0&&<div style={{marginTop:18}}><h3 style={{fontSize:15,margin:"0 0 8px"}}>Мои вопросы</h3>{questions.slice(0,4).map(q=><div key={q.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,padding:"10px 0",borderTop:"1px solid #EEE7F2"}}><div><b style={{fontSize:12}}>{q.topic}</b><div style={{fontSize:11,color:"#7B7484",marginTop:3}}>{q.text}</div></div><span style={{fontSize:10,fontWeight:800,color:"#159B66",background:"#EAF8F2",borderRadius:999,padding:"6px 9px",alignSelf:"start"}}>{q.status}</span></div>)}</div>}
            </section>
            <section style={{...card,padding:"24px"}}>
              <div style={{fontSize:11,fontWeight:900,color:"#159B66",letterSpacing:"1.3px"}}>ЧАСТЫЕ ТЕМЫ</div><h2 style={{fontSize:25,margin:"5px 0 16px"}}>С чего начать</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
                {trainerTopics.map(x=><div key={x.title} style={{border:"1px solid #EEE7F2",borderRadius:18,padding:"16px"}}><div style={{fontSize:25}}>{x.icon}</div><b style={{display:"block",fontSize:13,margin:"9px 0 4px"}}>{x.title}</b><span style={{fontSize:11,color:"#7B7484",lineHeight:1.45}}>{x.text}</span></div>)}
              </div>
            </section>
          </div>
        </>}

        {moduleId==="sport-news"&&<>
          <div className="support-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}>
            <div><div style={{fontSize:11,fontWeight:900,color:"#159B66",letterSpacing:"1.3px"}}>НОВОСТИ СПОРТА</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Что происходит в сообществе</h2></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по новостям" style={{width:280,border:"1px solid #E4DCE9",borderRadius:14,padding:"10px 12px",font:"inherit",outline:"none"}}/>
          </div>
          <div className="support-news-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
            {visibleNews.map((n,i)=>{const id=String(n.id||i);const saved=bookmarks.includes(id);return <article key={id} style={{...card,overflow:"hidden"}}>
              <div style={{height:145,background:i%2===0?"linear-gradient(135deg,#DDF4EC,#EDE1FA)":"linear-gradient(135deg,#FFF0DA,#E7EFFB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:54}}>{n.emoji||"🏃"}</div>
              <div style={{padding:"18px"}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><span style={{fontSize:10,fontWeight:900,color:"#159B66"}}>{(n.cat||"Новость").toUpperCase()}</span><button onClick={()=>toggleBookmark(id)} style={{border:0,background:"transparent",cursor:"pointer",color:saved?"#8D27EE":"#A49CAB",fontSize:18}}>{saved?"★":"☆"}</button></div><h3 style={{fontSize:19,lineHeight:1.15,margin:"9px 0 8px"}}>{n.title}</h3><p style={{fontSize:12,lineHeight:1.5,color:"#756E7E",margin:0}}>{n.text}</p><button onClick={()=>track("news_view",id)} style={{border:0,background:"transparent",padding:0,color:"#8D27EE",fontWeight:800,cursor:"pointer",marginTop:14}}>Читать ↗</button></div>
            </article>})}
          </div>
        </>}

        {moduleId==="announcements"&&<>
          <div className="support-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}>
            <div><div style={{fontSize:11,fontWeight:900,color:"#159B66",letterSpacing:"1.3px"}}>АНОНСЫ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Что скоро будет</h2></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по событиям" style={{width:280,border:"1px solid #E4DCE9",borderRadius:14,padding:"10px 12px",font:"inherit",outline:"none"}}/>
          </div>
          <div className="announcement-list" style={{display:"grid",gap:12}}>
            {visibleEvents.map((e,i)=><article key={e.id||i} style={{...card,padding:"18px 20px",display:"grid",gridTemplateColumns:"74px 1fr auto",gap:18,alignItems:"center"}}>
              <div style={{width:62,height:62,borderRadius:18,background:"#EAF8F2",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><b style={{fontSize:23,lineHeight:1}}>{e.date||"—"}</b><span style={{fontSize:10,color:"#159B66",fontWeight:800,marginTop:4}}>{e.day||""}</span></div>
              <div><div style={{fontSize:10,fontWeight:900,color:"#159B66"}}>{(e.kind||"СОБЫТИЕ").toUpperCase()}</div><h3 style={{fontSize:18,margin:"5px 0 4px"}}>{e.title}</h3><div style={{fontSize:11,color:"#7B7484"}}>{e.place||"Онлайн"}</div></div>
              <button onClick={()=>track("event_view",String(e.id||i))} type="button" style={{border:"1px solid #D8CDE2",background:"#fff",color:"#7C2BD0",borderRadius:14,padding:"9px 12px",fontWeight:800,cursor:"pointer"}}>Подробнее</button>
            </article>)}
          </div>
          {visibleEvents.length===0&&<div style={{...card,padding:"28px",textAlign:"center",color:"#7B7484"}}>По этому запросу событий пока нет.</div>}
        </>}
      </main>
    </div>
  );
}

function ParticipateModulePage({setPage,moduleId,signedIn=false,onLogin,isAdmin=false,events=[],registeredEvents=[],onToggleEvent}){
  const tabs=[["challenges","Челленджи"],["starts","Забеги / старты"],["offline","Офлайн-активности"],["meetups","Митапы / лектории"]];
  const [reimbursements,setReimbursements]=useState(()=>readData(STORAGE_KEYS.startReimbursements,[]));
  const [offlineProposals,setOfflineProposals]=useState(()=>readData(STORAGE_KEYS.offlineProposals,[]));
  const [meetupTopics,setMeetupTopics]=useState(()=>readData(STORAGE_KEYS.meetupTopicProposals,[]));
  const [heroApplications,setHeroApplications]=useState(()=>readData(STORAGE_KEYS.meetupHeroApplications,[]));
  const [showForm,setShowForm]=useState("");
  const [form,setForm]=useState({title:"",date:"",place:"",comment:""});
  const requireLogin=fn=>{if(!signedIn){onLogin?.();return;}fn();};
  const track=(name,id,meta={})=>sendAnalyticsEvent(createAnalyticsEvent(name,id,meta));
  const save=(key,value)=>{writeData(key,value);return value;};
  const card={background:"#fff",border:"1px solid #E8E1ED",borderRadius:24,boxShadow:"0 10px 28px rgba(50,25,80,.045)"};
  const normalizedEvents=(events||[]).filter(e=>!e.archived);
  const starts=normalizedEvents.filter(e=>e.stream==="starts"||/забег|старт|заплыв|марафон/i.test(`${e.kind||""} ${e.title||""}`));
  const offline=normalizedEvents.filter(e=>e.stream==="offline"||/офлайн|вел|йога/i.test(`${e.kind||""} ${e.title||""}`));
  const meetups=normalizedEvents.filter(e=>e.stream==="meetups"||/митап|лектор|видео|встреч|история/i.test(`${e.kind||""} ${e.title||""}`));
  const isRegistered=id=>registeredEvents.includes(id);
  const register=e=>requireLogin(()=>{onToggleEvent?.(e.id);});
  const submitForm=()=>requireLogin(()=>{
    if(!form.title.trim())return;
    const item={id:`${showForm}-${Date.now()}`,...form,status:"На рассмотрении",dateCreated:new Date().toISOString()};
    if(showForm==="reimbursement"){const next=[item,...reimbursements];setReimbursements(next);save(STORAGE_KEYS.startReimbursements,next);track("start_reimbursement_submit",item.id);}
    if(showForm==="offline"){const next=[item,...offlineProposals];setOfflineProposals(next);save(STORAGE_KEYS.offlineProposals,next);track("offline_proposal_submit",item.id);}
    if(showForm==="topic"){const next=[item,...meetupTopics];setMeetupTopics(next);save(STORAGE_KEYS.meetupTopicProposals,next);track("meetup_topic_submit",item.id);}
    if(showForm==="hero"){const next=[item,...heroApplications];setHeroApplications(next);save(STORAGE_KEYS.meetupHeroApplications,next);track("meetup_hero_apply",item.id);}
    setForm({title:"",date:"",place:"",comment:""});setShowForm("");
  });
  const EventCard=({e,accent="#8D27EE"})=><article style={{...card,padding:"18px 20px",display:"grid",gridTemplateColumns:"72px 1fr auto",gap:16,alignItems:"center"}}>
    <div style={{width:60,height:60,borderRadius:18,background:"#F4EEF9",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><b style={{fontSize:22,lineHeight:1}}>{e.date||"—"}</b><span style={{fontSize:10,color:accent,fontWeight:900,marginTop:4}}>{e.day||""}</span></div>
    <div><div style={{fontSize:10,fontWeight:900,color:accent,letterSpacing:".8px"}}>{String(e.kind||"СОБЫТИЕ").toUpperCase()}</div><h3 style={{fontSize:18,margin:"5px 0 4px"}}>{e.title}</h3><div style={{fontSize:11,color:"#7B7484"}}>{e.place||"Онлайн"}{e.meta?` · ${e.meta}`:""}</div></div>
    <button type="button" onClick={()=>register(e)} style={{border:isRegistered(e.id)?0:"1px solid #D9CCE5",background:isRegistered(e.id)?"#E9F8EF":"#fff",color:isRegistered(e.id)?"#08783F":"#7C2BD0",borderRadius:14,padding:"9px 12px",fontWeight:800,cursor:"pointer"}}>{isRegistered(e.id)?"✓ Записан":"Записаться"}</button>
  </article>;
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} activeGroup="block-participate"/>
      <main className="light-main participate-main" style={{maxWidth:1450,margin:"0 auto",padding:"38px 42px 80px"}}>
        <section className="participate-hero" style={{...card,position:"relative",overflow:"hidden",padding:"38px",background:"linear-gradient(115deg,#F2E7FD 0%,#F9F6FC 58%,#fff 100%)"}}>
          <img src={MVP_SPLASH} alt="" style={{position:"absolute",right:0,top:0,width:"40%",height:"100%",objectFit:"cover",opacity:.82,maskImage:"linear-gradient(90deg,transparent,#000 34%)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 34%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:760}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:"1.6px",color:"#8D27EE",marginBottom:10}}>УЧАСТВОВАТЬ</div>
            <h1 className="light-page-title" style={{fontSize:58,lineHeight:1,letterSpacing:"-2.8px",margin:"0 0 12px",fontWeight:800}}>Выбирай формат и включайся</h1>
            <p style={{fontSize:16,lineHeight:1.55,color:"#6E6877",margin:0,maxWidth:650}}>Челленджи, старты, офлайн-встречи и лектории — теперь собраны в одном понятном маршруте.</p>
          </div>
        </section>
        <nav className="participate-tabs" style={{display:"flex",gap:8,overflowX:"auto",padding:"18px 0 8px",scrollbarWidth:"none"}}>
          {tabs.map(([id,label])=><button key={id} type="button" onClick={()=>id==="challenges"?setPage("challenges"):setPage(`module:${id}`)} style={{flex:"0 0 auto",border:moduleId===id?0:"1px solid #E5DCEB",background:moduleId===id?"#10052F":"#fff",color:moduleId===id?"#fff":"#554C62",borderRadius:18,padding:"10px 15px",fontSize:12.5,fontWeight:800,cursor:"pointer"}}>{label}</button>)}
        </nav>

        {moduleId==="starts"&&<>
          <div className="participate-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}>
            <div><div style={{fontSize:11,fontWeight:900,color:"#8D27EE",letterSpacing:"1.3px"}}>ЗАБЕГИ И СТАРТЫ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Календарь ПравоТех</h2></div>
            <button type="button" onClick={()=>requireLogin(()=>setShowForm("reimbursement"))} style={{border:0,background:"#8D27EE",color:"#fff",borderRadius:16,padding:"10px 14px",fontWeight:800,cursor:"pointer"}}>Заявка на компенсацию</button>
          </div>
          <div className="participate-list" style={{display:"grid",gap:12}}>{starts.map(e=><EventCard key={e.id} e={e}/>)}</div>
          {reimbursements.length>0&&<section style={{...card,padding:"20px",marginTop:16}}><h3 style={{margin:"0 0 10px"}}>Мои заявки на компенсацию</h3>{reimbursements.map(x=><div key={x.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,padding:"10px 0",borderTop:"1px solid #EEE7F2"}}><div><b style={{fontSize:12}}>{x.title}</b><div style={{fontSize:11,color:"#7B7484"}}>{x.date||"Дата не указана"} · {x.comment||"Без комментария"}</div></div><span style={{fontSize:10,fontWeight:800,color:"#8D27EE",background:"#F4EEF8",padding:"6px 9px",borderRadius:999,alignSelf:"start"}}>{x.status}</span></div>)}</section>}
        </>}

        {moduleId==="offline"&&<>
          <div className="participate-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}>
            <div><div style={{fontSize:11,fontWeight:900,color:"#8D27EE",letterSpacing:"1.3px"}}>ОФЛАЙН-АКТИВНОСТИ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Встречайся и двигайся вместе</h2></div>
            <button type="button" onClick={()=>requireLogin(()=>setShowForm("offline"))} style={{border:0,background:"#8D27EE",color:"#fff",borderRadius:16,padding:"10px 14px",fontWeight:800,cursor:"pointer"}}>+ Предложить активность</button>
          </div>
          <div className="participate-list" style={{display:"grid",gap:12}}>{offline.map(e=><EventCard key={e.id} e={e}/>)}</div>
          {offlineProposals.length>0&&<section style={{...card,padding:"20px",marginTop:16}}><h3 style={{margin:"0 0 10px"}}>Мои предложения</h3>{offlineProposals.map(x=><div key={x.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,padding:"10px 0",borderTop:"1px solid #EEE7F2"}}><div><b style={{fontSize:12}}>{x.title}</b><div style={{fontSize:11,color:"#7B7484"}}>{x.place||"Место не указано"} · {x.date||"Дата не указана"}</div></div><span style={{fontSize:10,fontWeight:800,color:"#159B66",background:"#EAF8F2",padding:"6px 9px",borderRadius:999,alignSelf:"start"}}>{x.status}</span></div>)}</section>}
        </>}

        {moduleId==="meetups"&&<>
          <div className="participate-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,margin:"28px 0 16px"}}>
            <div><div style={{fontSize:11,fontWeight:900,color:"#8D27EE",letterSpacing:"1.3px"}}>МИТАПЫ И ЛЕКТОРИИ</div><h2 style={{fontSize:31,margin:"5px 0 0",letterSpacing:"-1.2px"}}>Встречи, знания и истории коллег</h2></div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" onClick={()=>requireLogin(()=>setShowForm("topic"))} style={{border:"1px solid #D9CCE5",background:"#fff",color:"#7C2BD0",borderRadius:16,padding:"10px 14px",fontWeight:800,cursor:"pointer"}}>Предложить тему</button><button type="button" onClick={()=>requireLogin(()=>setShowForm("hero"))} style={{border:0,background:"#10052F",color:"#fff",borderRadius:16,padding:"10px 14px",fontWeight:800,cursor:"pointer"}}>Стать героем</button></div>
          </div>
          <div className="participate-list" style={{display:"grid",gap:12}}>{meetups.map(e=><EventCard key={e.id} e={e}/>)}</div>
          {(meetupTopics.length>0||heroApplications.length>0)&&<section style={{...card,padding:"20px",marginTop:16}}><h3 style={{margin:"0 0 10px"}}>Мои заявки</h3>{[...meetupTopics,...heroApplications].map(x=><div key={x.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,padding:"10px 0",borderTop:"1px solid #EEE7F2"}}><div><b style={{fontSize:12}}>{x.title}</b><div style={{fontSize:11,color:"#7B7484"}}>{x.comment||"Заявка отправлена"}</div></div><span style={{fontSize:10,fontWeight:800,color:"#8D27EE",background:"#F4EEF8",padding:"6px 9px",borderRadius:999,alignSelf:"start"}}>{x.status}</span></div>)}</section>}
        </>}
      </main>

      {showForm&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowForm("")}><div className="light-modal">
        <button className="modal-close" onClick={()=>setShowForm("")}>×</button>
        <h2>{showForm==="reimbursement"?"Заявка на компенсацию":showForm==="offline"?"Предложить активность":showForm==="topic"?"Предложить тему":"Стать героем лектория"}</h2>
        <label>Название<input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder={showForm==="reimbursement"?"Название старта":"Короткое название"}/></label>
        {(showForm==="reimbursement"||showForm==="offline")&&<label>Дата<input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></label>}
        {showForm==="offline"&&<label>Место<input value={form.place} onChange={e=>setForm(p=>({...p,place:e.target.value}))} placeholder="Где встречаемся"/></label>}
        <label>{showForm==="hero"?"О чём хочешь рассказать":"Комментарий"}<textarea value={form.comment} onChange={e=>setForm(p=>({...p,comment:e.target.value}))} placeholder={showForm==="topic"?"Почему эта тема полезна коллегам":showForm==="hero"?"Коротко опиши свою спортивную историю":"Дополнительная информация"}/></label>
        <button className="primary-btn" onClick={submitForm}>Отправить</button>
      </div></div>}
    </div>
  );
}

function PlatformModulePage({setPage,moduleId,signedIn=false,onLogin,isAdmin=false,news=INIT_NEWS,events=[],registeredEvents=[],onToggleEvent}){
  if(["starts","offline","meetups"].includes(moduleId)) return <ParticipateModulePage setPage={setPage} moduleId={moduleId} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} events={events} registeredEvents={registeredEvents} onToggleEvent={onToggleEvent}/>;
  if(["trainer","sport-news","announcements"].includes(moduleId)) return <SupportModulePage setPage={setPage} moduleId={moduleId} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} news={news} events={events}/>;
  if(["ratings","coins","benefits","achievement"].includes(moduleId)) return <ProgressModulePage setPage={setPage} moduleId={moduleId} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin}/>;
  if(["city-sport","teams","buddy","ambassadors","athlete-card"].includes(moduleId)) return <CommunityModulePage setPage={setPage} moduleId={moduleId} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin}/>;
  const module=PLATFORM_MODULES.find(item=>item.id===moduleId);
  if(!module){setTimeout(()=>setPage("light"),0);return null;}
  const primary=()=>{
    if(module.target){setPage(module.target);return;}
    if(["athlete-card","coins","achievement"].includes(module.id)){
      if(!signedIn){onLogin?.();return;}
      setPage("cabinet-light");
      return;
    }
    setPage("light");
    setTimeout(()=>document.getElementById("possibilities")?.scrollIntoView({behavior:"smooth",block:"start"}),40);
  };
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin}/>
      <main className="light-main module-main" style={{maxWidth:1450,margin:"0 auto",padding:"48px 42px 80px"}}>
        <button type="button" onClick={()=>{setPage("light");setTimeout(()=>document.getElementById("possibilities")?.scrollIntoView({behavior:"smooth",block:"start"}),40);}} style={{border:0,background:"transparent",color:"#8D27EE",fontSize:13,fontWeight:800,padding:0,cursor:"pointer",marginBottom:26}}>← Все возможности</button>
        <section className="module-hero" style={{position:"relative",overflow:"hidden",minHeight:390,borderRadius:34,background:`linear-gradient(110deg,${module.soft} 0%,#fff 72%)`,border:"1px solid #E8E0EE",padding:"46px",display:"flex",alignItems:"center"}}>
          <img src={module.image} alt="" onError={e=>{e.currentTarget.style.display="none";}} style={{position:"absolute",right:0,top:0,width:"46%",height:"100%",objectFit:"cover",opacity:.88,maskImage:"linear-gradient(90deg,transparent,#000 35%)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 35%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:650}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:"1.7px",color:module.accent,marginBottom:14}}>{module.blockTitle.toUpperCase()}</div>
            <div style={{width:54,height:54,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",background:module.accent,color:"#fff",fontSize:25,fontWeight:900,marginBottom:22}}>{module.icon}</div>
            <h1 className="light-page-title" style={{fontSize:62,lineHeight:.98,letterSpacing:"-3.2px",margin:"0 0 16px",fontWeight:800}}>{module.title}</h1>
            <p style={{fontSize:17,lineHeight:1.55,color:"#6F687A",margin:"0 0 26px",maxWidth:560}}>{module.text}</p>
            <button type="button" onClick={primary} style={{border:0,borderRadius:25,background:module.accent,color:"#fff",padding:"13px 20px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
              {module.target?"Перейти в раздел":(["athlete-card","coins","achievement"].includes(module.id)?"Открыть личный кабинет":"Вернуться к возможностям")} ↗
            </button>
          </div>
        </section>

        <section style={{padding:"42px 0 0"}}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:"1.7px",color:module.accent,marginBottom:10}}>ВНУТРИ РАЗДЕЛА</div>
          <h2 style={{fontSize:38,lineHeight:1.02,letterSpacing:"-1.8px",margin:"0 0 24px",fontWeight:800}}>Что здесь можно сделать</h2>
          <div className="module-feature-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
            {module.features.map((feature,i)=><div key={feature} style={{minHeight:150,borderRadius:24,background:"#fff",border:"1px solid #E8E1ED",padding:"22px",display:"flex",flexDirection:"column",boxShadow:"0 9px 26px rgba(50,25,80,.04)"}}>
              <span style={{fontSize:11,fontWeight:900,color:module.accent}}>0{i+1}</span>
              <b style={{fontSize:17,lineHeight:1.25,marginTop:"auto"}}>{feature}</b>
            </div>)}
          </div>
          {!module.target&&<div style={{marginTop:22,borderRadius:22,background:"#fff",border:"1px dashed #D9CDE3",padding:"18px 20px",fontSize:13,lineHeight:1.5,color:"#756E7E"}}>
            Раздел уже доступен в навигации. Здесь будут собраны связанные действия и материалы.
          </div>}
        </section>
      </main>
    </div>
  );
}

function LightChallengesPage({setPage,challenges=CHALLENGES,signedIn=false,onLogin,isAdmin=false,joinedChallenges=[],onJoin}){
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const visible=challenges.filter(c=>filter==="all"||(filter==="active"?c.status==="active":c.status==="soon"));
  const isJoined=c=>joinedChallenges.includes(c.id);
  const openChallenge=c=>setSelected(c);
  const join=c=>{
    if(!signedIn){onLogin?.();return;}
    onJoin?.(c.id);
    setSelected(null);
    setPage("cabinet-light");
  };
  const goResult=c=>{
    if(!signedIn){onLogin?.();return;}
    if(!isJoined(c)){join(c);return;}
    setSelected(null);
    setPage("cabinet-light");
  };
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} activeGroup="block-participate"/>
      <main className="light-main light-list-main" style={{maxWidth:1450,margin:"0 auto",padding:"48px 42px 72px"}}>
        <div style={{fontSize:13,fontWeight:800,letterSpacing:"2px",color:"#8D27EE",marginBottom:16}}>ВЫБИРАЙ СВОЙ ТЕМП</div>
        <div className="light-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:20}}>
          <h1 className="light-page-title" style={{fontSize:68,lineHeight:1,letterSpacing:"-3.5px",margin:0,fontWeight:800}}>Активные челленджи</h1>
          <button onClick={()=>setPage("light")} style={{border:0,background:"transparent",color:"#8D27EE",fontSize:16,fontWeight:800,cursor:"pointer"}}>На главную ↗</button>
        </div>
        <div className="light-filters" style={{display:"flex",gap:10,margin:"38px 0 22px"}}>
          {[["all","Все"],["active","Идут сейчас"],["soon","Скоро"]].map(([id,label])=>{
            const active=filter===id;
            return <button key={id} onClick={()=>setFilter(id)} type="button" style={{border:active?0:"1px solid #DED6E6",background:active?"#10052F":"transparent",color:active?"#fff":"#10052F",borderRadius:24,padding:"12px 22px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{label}</button>;
          })}
        </div>
        <div className="light-challenge-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {visible.map((c,i)=><div className="challenge-page-item" key={c.id} style={{position:"relative"}}>
            <LightChallengeCard c={c} i={challenges.indexOf(c)} onOpen={()=>openChallenge(c)}/>
            <button onClick={()=>openChallenge(c)} type="button" style={{position:"absolute",left:24,bottom:22,border:0,borderRadius:22,background:c.status==="active"?"#8D27EE":"#F4EEF8",color:c.status==="active"?"#fff":"#756D7E",fontSize:12,fontWeight:800,padding:"9px 14px",cursor:"pointer"}}>
              {c.status==="active"?(isJoined(c)?"Внести результат":"Участвовать"):"Подробнее"}
            </button>
            {isJoined(c)&&<span style={{position:"absolute",right:22,bottom:26,fontSize:11,fontWeight:800,color:"#159B66"}}>✓ Вы участвуете</span>}
          </div>)}
        </div>
      </main>

      {selected&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
        <div className="light-modal challenge-detail-modal" style={{maxWidth:620}}>
          <button type="button" className="modal-close" onClick={()=>setSelected(null)}>×</button>
          <div style={{fontSize:12,fontWeight:800,color:selected.status==="active"?"#8D27EE":"#756D7E",marginBottom:10}}>{selected.statusLabel?.toUpperCase()}</div>
          <h2 style={{fontSize:32,lineHeight:1.05,letterSpacing:"-1.2px",margin:"0 0 10px"}}>{selected.emoji} {selected.title}</h2>
          <p className="muted" style={{fontSize:15,lineHeight:1.55,marginBottom:18}}>{selected.desc}</p>
          <div className="challenge-detail-meta" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            <div style={{background:"#F7F1FC",borderRadius:14,padding:"13px"}}><b>{selected.participants}</b><div className="muted" style={{fontSize:10,marginTop:3}}>участников</div></div>
            <div style={{background:"#F7F1FC",borderRadius:14,padding:"13px"}}><b>{selected.startDate&&selected.endDate?`${fmtDate(selected.startDate)} — ${fmtDate(selected.endDate)}`:selected.daysLeft}</b><div className="muted" style={{fontSize:10,marginTop:3}}>{selected.startDate?"период":"дней"}</div></div>
            <div style={{background:"#F7F1FC",borderRadius:14,padding:"13px"}}><b>{selected.type==="steps"?"Шаги":selected.type==="run"?"Километры":selected.type==="bike"?"Велосипед":"Плавание"}</b><div className="muted" style={{fontSize:10,marginTop:3}}>тип результата</div></div>
          </div>
          {selected.status==="active"?<button className="primary-btn" type="button" onClick={()=>isJoined(selected)?goResult(selected):join(selected)}>
            {!signedIn?"Войти и участвовать":isJoined(selected)?"Перейти к внесению результата":"Участвовать"}
          </button>:<button className="primary-btn" type="button" disabled style={{opacity:.45,cursor:"default"}}>Регистрация откроется позже</button>}
        </div>
      </div>}
    </div>
  );
}


function LightNewsPage({setPage,news=INIT_NEWS,signedIn=false,onLogin,isAdmin=false}){
  const visibleNews=news.filter(n=>!n.archived);
  return(
    <div style={{minHeight:"100vh",background:lightPageBg,color:"#10052F",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={signedIn} onLogin={onLogin} isAdmin={isAdmin} activeGroup="block-support"/>
      <main className="light-main light-list-main" style={{maxWidth:1450,margin:"0 auto",padding:"48px 42px 72px"}}>
        <div style={{fontSize:13,fontWeight:800,letterSpacing:"2px",color:"#8D27EE",marginBottom:16}}>БУДЬ В КУРСЕ</div>
        <div className="light-section-head" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:20,marginBottom:34}}>
          <h1 className="light-page-title" style={{fontSize:68,lineHeight:1,letterSpacing:"-3.5px",margin:0,fontWeight:800}}>Новости движения</h1>
          <button onClick={()=>setPage("light")} style={{border:0,background:"transparent",color:"#8D27EE",fontSize:16,fontWeight:800,cursor:"pointer"}}>На главную ↗</button>
        </div>
        <div className="news-page-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {visibleNews.map((n,i)=>{
            const hasImage=n.attachmentData&&String(n.attachmentType||"").startsWith("image/");
            const visual=hasImage?n.attachmentData:(i===0?MVP_SPLASH:i===2?MVP_SURF:i===3?MVP_ICE:i===5?MVP_SPLASH:null);
            const mode=i%3;
            if(visual) return <article key={n.id||i} style={{minHeight:330,borderRadius:28,overflow:"hidden",display:"grid",gridTemplateRows:"185px 1fr",background:"#fff",border:"1px solid #E4DDE9"}}>
              <img src={visual} alt="" style={{width:"100%",height:"100%",objectFit:"cover",background:"#DCECF2"}}/>
              <div style={{padding:"22px 24px 24px"}}><span style={{display:"inline-block",background:"#F5EDFC",color:"#8D27EE",borderRadius:18,padding:"6px 10px",fontSize:10,fontWeight:800}}>{n.cat||"Новость"}</span><div style={{fontSize:11,color:"#81798B",marginTop:13}}>{n.date}</div><h3 style={{fontSize:22,lineHeight:1.08,margin:"10px 0 7px",fontWeight:800}}>{n.title}</h3><p style={{fontSize:13,lineHeight:1.48,color:"#746D7E",margin:0}}>{n.text}</p>{n.imageName&&<div style={{fontSize:11,color:"#8D27EE",marginTop:10}}>📎 {n.imageName}</div>}</div>
            </article>;
            if(mode===1) return <article key={n.id||i} style={{minHeight:330,borderRadius:28,background:"#fff",border:"1px solid #DED8E3",padding:"28px",display:"flex",flexDirection:"column"}}>
              <span style={{alignSelf:"flex-start",background:"#E9FF1F",borderRadius:18,padding:"7px 12px",fontSize:11,fontWeight:800}}>{n.cat||"РЕЗУЛЬТАТЫ"}</span><div style={{fontSize:12,color:"#81798B",marginTop:23}}>{n.date}</div><h3 style={{fontSize:25,lineHeight:1.08,letterSpacing:"-.8px",margin:"28px 0 10px",fontWeight:800}}>{n.title}</h3><p style={{fontSize:13,color:"#746D7E",lineHeight:1.5,margin:0}}>{n.text}</p>
            </article>;
            return <article key={n.id||i} style={{minHeight:330,borderRadius:28,background:"#8D27EE",color:"#fff",padding:"28px",display:"flex",flexDirection:"column"}}>
              <span style={{fontSize:11,fontWeight:800}}>{n.cat||"АНОНС"}</span><div style={{fontSize:12,color:"#DCC5F8",marginTop:25}}>{n.date}</div><h3 style={{fontSize:25,lineHeight:1.08,letterSpacing:"-.8px",margin:"28px 0 10px",fontWeight:800}}>{n.title}</h3><p style={{fontSize:13,color:"#E7D7F8",lineHeight:1.5,margin:0}}>{n.text}</p>
            </article>;
          })}
        </div>
      </main>
    </div>
  );
}

// Светлый личный кабинет: результаты, подтверждения, активность и записи на события.
function LightCabinet({setPage,challenges=CHALLENGES,events=[],results=[],registeredEvents=[],joinedChallenges=[],onSubmitResult,onToggleEvent,isAdmin=false}){
  const [activeChallenge,setActiveChallenge]=useState(null);
  const [value,setValue]=useState("");
  const [comment,setComment]=useState("");
  const [proof,setProof]=useState(null);
  const myChallenges=challenges.filter(c=>joinedChallenges.includes(c.id));
  const visibleEvents=events.filter(e=>!e.archived);
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
    <div className="light-shell" style={{background:"radial-gradient(circle at 0% 8%,#F0DEFF 0,transparent 25%),radial-gradient(circle at 100% 42%,#FFE8EF 0,transparent 24%),linear-gradient(180deg,#FAF7FF 0%,#FBF9FF 100%)",color:BD,minHeight:"100vh",position:"relative",overflowX:"hidden",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={true} isAdmin={isAdmin}/>
      <div className="light-dashboard-content" style={{position:"relative",zIndex:2,maxWidth:1220,margin:"0 auto",padding:"34px 32px 64px"}}>
        {isAdmin&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:24}}>
          <button onClick={()=>setPage("admin")} className="plain-link">Панель администратора →</button>
        </div>}
        <div className="profile-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}><div className="avatar">Д</div><div><h1 style={{fontSize:26,margin:0}}>Добрый день! 👋</h1><div className="muted">Стабильность сегодня — большие победы завтра</div></div></div>
          <span className="role-pill">Сотрудник право(тех)</span>
        </div>
        <div className="metrics-grid">
          {[{v:5,l:"дней подряд",c:BP},{v:4,l:"место в рейтинге",c:"#0891B2"},{v:Math.round(totalSteps/1000),l:"тыс. шагов",c:BP},{v:results.length+3,l:"активности",c:"#0891B2"}].map((m,i)=><div key={i} style={card}><div style={{fontSize:30,fontWeight:800,color:m.c}}>{m.v}</div><div className="muted">{m.l}</div></div>)}
        </div>
        <div className="cabinet-grid">
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section style={card}><div className="section-title"><span>Мои челленджи</span><span style={{color:BP,fontSize:13}}>⭐ {totalPoints.toFixed(1)}</span></div>
              {myChallenges.length===0?<div className="empty-state"><div style={{marginBottom:12}}>Вы пока не участвуете ни в одном челлендже.</div><button className="mini-btn active" onClick={()=>setPage("challenges")}>Выбрать челлендж</button></div>:myChallenges.slice(0,6).map((c,i)=>{const own=results.filter(r=>r.challengeId===c.id).reduce((s,r)=>s+Number(r.value||0),0);const base=i===0?60:0;const progress=Math.min(100,base+own/1000);return <div key={c.id} className="challenge-row"><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{c.emoji} {c.title}</b><button className="mini-btn" onClick={()=>setActiveChallenge(c)}>+ Результат</button></div><div className="progress-track"><div style={{width:`${progress}%`}}/></div><div className="muted" style={{fontSize:11}}>{progress.toFixed(0)}% · внесено: {own.toLocaleString("ru-RU")}</div></div>})}
            </section>
            <section style={card}><div className="section-title">Последняя активность</div>{results.length===0?<div className="empty-state">После внесения результата здесь появится история активности.</div>:results.slice().reverse().slice(0,6).map(r=><div key={r.id} className="activity-row"><div className="activity-icon">✓</div><div style={{flex:1}}><b>{r.challengeTitle}</b><div className="muted" style={{fontSize:11}}>{r.date}{r.proofName?` · 📎 ${r.proofName}`:""}</div></div><strong style={{color:BP}}>{Number(r.value).toLocaleString("ru-RU")}</strong></div>)}</section>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section style={card}><div className="section-title">Ближайшие события</div>{visibleEvents.map((e,i)=>{const joined=registeredEvents.includes(e.id);return <div key={e.id} className="event-row" style={{borderTop:i?"1px solid #ece4f5":"none"}}><div className="event-date"><small>{e.day}</small><b>{e.date}</b></div><div style={{flex:1}}><b>{e.title}</b><div className="muted" style={{fontSize:11}}>{e.place} · {e.kind||"Событие"}{e.attachmentName?" · 📎 "+e.attachmentName:""}</div></div><button className={joined?"mini-btn active":"mini-btn"} onClick={()=>onToggleEvent(e.id)}>{joined?"Вы записаны ✓":"Записаться"}</button></div>})}</section>
            <section style={card}><div className="section-title">Достижения</div><div className="achievement-grid">{[{e:"🔥",l:"7 дней подряд"},{e:"🏊",l:"10 км плавания"},{e:"👟",l:"Первый результат"},{e:"🚴",l:"Велопрогулка"}].map((a,i)=><div key={i} className="achievement"><span>{a.e}</span><small>{a.l}</small></div>)}</div></section>
          </div>
        </div>
      </div>
      {activeChallenge&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setActiveChallenge(null)}><form className="light-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setActiveChallenge(null)}>×</button><h2>{activeChallenge.emoji} {activeChallenge.title}</h2><p className="muted">Внесите результат — прогресс и баллы пересчитаются автоматически.</p><label>Результат<input type="number" min="1" required value={value} onChange={e=>setValue(e.target.value)} placeholder="Например, 8500"/></label><label>Комментарий<textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Как прошла активность?"/></label><label className="upload-box">📎 {proof?proof.name:"Прикрепить фото или файл"}<input type="file" accept="image/*,.pdf" onChange={e=>setProof(e.target.files?.[0]||null)}/></label><div className="points-preview">Будет начислено: +{Math.max(0,Math.min(20,Number(value||0)/1000)).toFixed(1)} ⭐</div><button className="primary-btn" type="submit">Сохранить результат</button></form></div>}
    </div>
  );
}


function AdminPanel({setPage,challenges,events,news,results=[],registeredEvents=[],joinedChallenges=[],onAddChallenge,onAddEvent,onAddNews,onUpdateChallenge,onUpdateEvent,onUpdateNews}){
  const [tab,setTab]=useState("challenge");
  const [section,setSection]=useState("content");
  const [analyticsPeriod,setAnalyticsPeriod]=useState("30");
  const [manageKind,setManageKind]=useState("challenge");
  const [manageEventId,setManageEventId]=useState(null);
  const [manageEventDraft,setManageEventDraft]=useState(null);
  const [manageNewsId,setManageNewsId]=useState(null);
  const [manageNewsDraft,setManageNewsDraft]=useState(null);
  const [manageId,setManageId]=useState(null);
  const [manageDraft,setManageDraft]=useState(null);
  const openManage=challenge=>{
    setManageId(challenge.id);
    setManageDraft({
      title:challenge.title||"",
      desc:challenge.desc||"",
      status:challenge.status||"active",
      daysLeft:Number(challenge.daysLeft||0),
      type:challenge.type||"steps"
    });
  };
  const closeManage=()=>{setManageId(null);setManageDraft(null);};
  const saveManage=e=>{
    e.preventDefault();
    if(!manageId||!manageDraft)return;
    const labels={active:"Активный",soon:"Скоро",completed:"Завершён"};
    onUpdateChallenge?.(manageId,{...manageDraft,statusLabel:labels[manageDraft.status]||manageDraft.status});
    closeManage();
  };
  const managedChallenge=manageId?challenges.find(x=>x.id===manageId):null;
  const managedResults=manageId?results.filter(r=>r.challengeId===manageId):[];
  const openEventManage=event=>{
    setManageEventId(event.id);
    setManageEventDraft({
      title:event.title||"",
      place:event.place||"",
      kind:event.kind||"Событие",
      dateISO:event.dateISO||"",
      archived:!!event.archived
    });
  };
  const closeEventManage=()=>{setManageEventId(null);setManageEventDraft(null);};
  const saveEventManage=e=>{
    e.preventDefault();
    if(!manageEventId||!manageEventDraft)return;
    let patch={...manageEventDraft};
    if(manageEventDraft.dateISO){
      const d=new Date(manageEventDraft.dateISO+"T12:00:00");
      patch={...patch,date:String(d.getDate()).padStart(2,"0"),day:d.toLocaleDateString("ru-RU",{weekday:"short"}).toUpperCase()};
    }
    onUpdateEvent?.(manageEventId,patch);
    closeEventManage();
  };
  const managedEvent=manageEventId?events.find(x=>x.id===manageEventId):null;
  const openNewsManage=item=>{
    setManageNewsId(item.id);
    setManageNewsDraft({
      title:item.title||"",
      text:item.text||"",
      cat:item.cat||"Анонс",
      archived:!!item.archived
    });
  };
  const closeNewsManage=()=>{setManageNewsId(null);setManageNewsDraft(null);};
  const saveNewsManage=e=>{
    e.preventDefault();
    if(!manageNewsId||!manageNewsDraft)return;
    onUpdateNews?.(manageNewsId,{...manageNewsDraft});
    closeNewsManage();
  };
  const managedNews=manageNewsId?news.find(x=>x.id===manageNewsId):null;
  const [form,setForm]=useState({title:"",desc:"",date:"",startDate:"",endDate:"",place:"",kind:"Челлендж",emoji:"🏃",text:"",fileName:"",fileType:"",fileData:""});
  const change=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleFile=e=>{
    const file=e.target.files?.[0];
    if(!file){setForm(p=>({...p,fileName:"",fileType:"",fileData:""}));return;}
    if(file.size>2*1024*1024){alert("Выберите файл до 2 МБ.");e.target.value="";return;}
    if(file.type.startsWith("image/")){
      const reader=new FileReader();
      reader.onload=()=>setForm(p=>({...p,fileName:file.name,fileType:file.type,fileData:String(reader.result||"")}));
      reader.readAsDataURL(file);
    }else{
      setForm(p=>({...p,fileName:file.name,fileType:file.type||"application/octet-stream",fileData:""}));
    }
  };
  const submit=e=>{
    e.preventDefault();
    if(!form.title.trim())return;
    if(tab==="challenge")onAddChallenge(form);
    if(tab==="event")onAddEvent(form);
    if(tab==="news")onAddNews(form);
    setForm({title:"",desc:"",date:"",startDate:"",endDate:"",place:"",kind:"Челлендж",emoji:"🏃",text:"",fileName:"",fileType:"",fileData:""});
  };

  // MVP demo until central event tracking / backend analytics is connected.
  const analyticsByPeriod={
    "7":{visitors:118,views:92,joins:36,submits:22,active:49,returning:31,eventSignups:18,trend:[36,49,44,58,62,71,76]},
    "30":{visitors:327,views:222,joins:100,submits:62,active:129,returning:41,eventSignups:74,trend:[118,136,151,174,191,205,222]},
    "90":{visitors:684,views:458,joins:181,submits:112,active:246,returning:47,eventSignups:163,trend:[216,248,285,319,356,407,458]}
  };
  const a=analyticsByPeriod[analyticsPeriod];
  const conversion=a.visitors?Math.round(a.joins/a.visitors*1000)/10:0;
  const resultConversion=a.joins?Math.round(a.submits/a.joins*1000)/10:0;
  const funnel=[
    {label:"Посетили платформу",value:a.visitors,color:"#10052F"},
    {label:"Открыли челлендж",value:a.views,color:"#5D21B6"},
    {label:"Начали участвовать",value:a.joins,color:"#8D27EE"},
    {label:"Внесли результат",value:a.submits,color:"#B86BFA"}
  ];
  const topChallenges=[
    {title:"Шаг за шагом",views:164,participants:62,conv:38},
    {title:"Километры лета",views:121,participants:31,conv:26},
    {title:"Движение каждый день",views:94,participants:25,conv:27}
  ];

  return(
    <div className="light-shell" style={{background:"radial-gradient(circle at 0% 8%,#F0DEFF 0,transparent 25%),radial-gradient(circle at 100% 42%,#FFE8EF 0,transparent 24%),linear-gradient(180deg,#FAF7FF 0%,#FBF9FF 100%)",color:BD,minHeight:"100vh",fontFamily:"'Open Sans',Arial,sans-serif"}}>
      <PravoHeader setPage={setPage} signedIn={true} isAdmin={true}/>
      <div className="light-dashboard-content" style={{maxWidth:1220,margin:"0 auto",padding:"36px 32px 70px"}}>
        <div className="admin-head">
          <div><h1 style={{margin:"0 0 5px",fontSize:38,letterSpacing:"-1.5px"}}>Панель администратора</h1><p className="muted">Управление контентом, спортивной программой и эффективностью платформы · {DATA_MODE==="local-demo"?"локальный MVP":"API ready"}</p></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><button className="plain-link" onClick={()=>setPage("cabinet-light")}>Личный кабинет →</button><div className="role-pill">Администратор</div></div>
        </div>

        <div className="admin-section-tabs" style={{display:"flex",gap:8,marginBottom:22}}>
          {[["content","Контент"],["manage","Управление"],["analytics","Аналитика"]].map(([id,label])=><button key={id} type="button" onClick={()=>setSection(id)} style={{border:section===id?0:"1px solid #E2D7EC",background:section===id?"#10052F":"#fff",color:section===id?"#fff":"#10052F",borderRadius:24,padding:"11px 18px",fontWeight:800,cursor:"pointer"}}>{label}</button>)}
        </div>

        {section==="content"?<>
          <div className="admin-stats">
            {[{v:challenges.length,l:"челленджей"},{v:events.filter(x=>!x.archived).length,l:"событий"},{v:news.filter(x=>!x.archived).length,l:"публикаций"},{v:"200+",l:"участников"}].map((s,i)=><div key={i} className="stat-card"><strong>{s.v}</strong><span>{s.l}</span></div>)}
          </div>
          <div className="admin-grid">
            <form className="admin-form" onSubmit={submit}>
              <div className="admin-tabs">{[["challenge","Челлендж"],["event","Событие"],["news","Новость / анонс"]].map(([id,l])=><button type="button" key={id} onClick={()=>setTab(id)} className={tab===id?"active":""}>{l}</button>)}</div>
              <h2>{tab==="challenge"?"Запустить новый челлендж":tab==="event"?"Добавить событие":"Опубликовать новость"}</h2>
              <label>Название<input value={form.title} onChange={e=>change("title",e.target.value)} required/></label>
              {tab!=="news"&&<><label>Описание<textarea value={form.desc} onChange={e=>change("desc",e.target.value)}/></label>{tab==="challenge"
                ? <div className="form-row"><label>Дата начала<input type="date" value={form.startDate} onChange={e=>change("startDate",e.target.value)}/></label><label>Дата окончания<input type="date" value={form.endDate} onChange={e=>change("endDate",e.target.value)}/></label></div>
                : <div className="form-row"><label>Дата<input type="date" value={form.date} onChange={e=>change("date",e.target.value)}/></label><label>Место / ссылка<input value={form.place} onChange={e=>change("place",e.target.value)} placeholder="Zoom или адрес"/></label></div>}</>}
              {tab==="news"&&<label>Текст<textarea value={form.text} onChange={e=>change("text",e.target.value)}/></label>}
              <label>Фото / файл
                <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" onChange={handleFile}/>
                {form.fileName&&<span style={{fontSize:11,color:"#756f7e",fontWeight:600}}>Прикреплено: {form.fileName}</span>}
                {form.fileData&&<img src={form.fileData} alt="Предпросмотр" style={{marginTop:6,width:"100%",maxHeight:180,objectFit:"cover",borderRadius:12,border:"1px solid #E7DDED"}}/>}
              </label>
              <button className="primary-btn" type="submit">{tab==="news"?"Опубликовать":"Сохранить и запустить"}</button>
            </form>
            <aside className="admin-list"><h2>Последние изменения</h2>{[...news.slice(0,3).map(x=>({e:x.emoji||"📢",t:x.title,s:"Публикация"})),...challenges.slice(0,3).map(x=>({e:x.emoji,t:x.title,s:x.statusLabel}))].slice(0,6).map((x,i)=><div key={i} className="admin-list-row"><span>{x.e}</span><div><b>{x.t}</b><small>{x.s}</small></div></div>)}</aside>
          </div>
        </>:section==="manage"?<>
          <div className="manage-toolbar" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:16,marginBottom:18}}>
            <div>
              <h2 style={{fontSize:28,letterSpacing:"-1px",margin:"0 0 5px"}}>Управление</h2>
              <p className="muted" style={{fontSize:12,margin:0}}>Редактирование, статусы, архив и текущая активность по контенту.</p>
            </div>
            <button type="button" className="primary-btn" style={{width:"auto",padding:"10px 16px"}} onClick={()=>{setSection("content");setTab(manageKind==="challenge"?"challenge":manageKind==="event"?"event":"news");}}>+ Добавить</button>
          </div>

          <div className="manage-kind-tabs" style={{display:"flex",gap:8,marginBottom:16}}>
            {[["challenge","Челленджи"],["event","События"],["news","Новости"]].map(([id,label])=><button key={id} type="button" onClick={()=>setManageKind(id)} style={{border:manageKind===id?0:"1px solid #E2D7EC",background:manageKind===id?"#8D27EE":"#fff",color:manageKind===id?"#fff":"#756D7E",borderRadius:20,padding:"9px 14px",fontSize:12,fontWeight:800,cursor:"pointer"}}>{label}</button>)}
          </div>

          {manageKind==="challenge"?<div className="challenge-admin-list" style={{display:"flex",flexDirection:"column",gap:12}}>
            {challenges.map(ch=>{
              const ownResults=results.filter(r=>r.challengeId===ch.id);
              const joinedHere=joinedChallenges.includes(ch.id);
              const statusColor=ch.status==="active"?"#159B66":ch.status==="completed"?"#81798B":"#C88A00";
              const statusBg=ch.status==="active"?"#EAF8F1":ch.status==="completed"?"#F1EEF3":"#FFF6D8";
              return <section key={ch.id} className="admin-form challenge-admin-row" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18,alignItems:"center",padding:"20px 22px"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                    <span style={{fontSize:20}}>{ch.emoji}</span>
                    <h3 style={{fontSize:18,margin:0}}>{ch.title}</h3>
                    <span style={{background:statusBg,color:statusColor,borderRadius:999,padding:"5px 9px",fontSize:10,fontWeight:800}}>{ch.statusLabel||ch.status}</span>
                  </div>
                  <p className="muted" style={{fontSize:12,lineHeight:1.45,margin:"0 0 12px"}}>{ch.desc}</p>
                  <div className="challenge-admin-metrics" style={{display:"flex",gap:18,flexWrap:"wrap",fontSize:11,color:"#756D7E"}}>
                    <span><b style={{color:"#10052F"}}>{ch.participants||0}</b> участников*</span>
                    <span><b style={{color:"#10052F"}}>{ownResults.length}</b> результатов в MVP</span>
                    <span><b style={{color:"#10052F"}}>{ch.daysLeft||0}</b> дней</span>
                    {joinedHere&&<span style={{color:"#159B66",fontWeight:800}}>✓ текущий пользователь участвует</span>}
                  </div>
                  <div style={{fontSize:9.5,color:"#AAA2B2",marginTop:8}}>* Общий счётчик пока демо/исторический — реальные участники появятся после подключения backend или импорта Mattermost.</div>
                </div>
                <button type="button" className="mini-btn active" onClick={()=>openManage(ch)}>Управлять</button>
              </section>;
            })}
          </div>:manageKind==="event"?<div className="challenge-admin-list" style={{display:"flex",flexDirection:"column",gap:12}}>
            {events.map(ev=>{
              const registeredHere=registeredEvents.includes(ev.id);
              return <section key={ev.id} className="admin-form challenge-admin-row" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18,alignItems:"center",padding:"20px 22px",opacity:ev.archived?.62:1}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                    <span style={{fontSize:20}}>📅</span>
                    <h3 style={{fontSize:18,margin:0}}>{ev.title}</h3>
                    <span style={{background:ev.archived?"#F1EEF3":"#EAF8F1",color:ev.archived?"#81798B":"#159B66",borderRadius:999,padding:"5px 9px",fontSize:10,fontWeight:800}}>{ev.archived?"В архиве":"Опубликовано"}</span>
                  </div>
                  <p className="muted" style={{fontSize:12,lineHeight:1.45,margin:"0 0 12px"}}>{ev.date} {ev.day} · {ev.place} · {ev.kind||"Событие"}</p>
                  <div className="challenge-admin-metrics" style={{display:"flex",gap:18,flexWrap:"wrap",fontSize:11,color:"#756D7E"}}>
                    <span><b style={{color:"#10052F"}}>{registeredHere?1:0}</b> регистраций в текущем MVP</span>
                    {registeredHere&&<span style={{color:"#159B66",fontWeight:800}}>✓ текущий пользователь записан</span>}
                    {ev.attachmentName&&<span>📎 {ev.attachmentName}</span>}
                  </div>
                  <div style={{fontSize:9.5,color:"#AAA2B2",marginTop:8}}>Полный список регистраций появится после подключения общей базы и корпоративной авторизации.</div>
                </div>
                <button type="button" className="mini-btn active" onClick={()=>openEventManage(ev)}>Управлять</button>
              </section>;
            })}
          </div>:<div className="challenge-admin-list" style={{display:"flex",flexDirection:"column",gap:12}}>
            {news.map(item=><section key={item.id} className="admin-form challenge-admin-row" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18,alignItems:"center",padding:"20px 22px",opacity:item.archived?.62:1}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                  <span style={{fontSize:20}}>{item.emoji||"📢"}</span>
                  <h3 style={{fontSize:18,margin:0}}>{item.title}</h3>
                  <span style={{background:item.archived?"#F1EEF3":"#EAF8F1",color:item.archived?"#81798B":"#159B66",borderRadius:999,padding:"5px 9px",fontSize:10,fontWeight:800}}>{item.archived?"Снято с публикации":"Опубликовано"}</span>
                </div>
                <p className="muted" style={{fontSize:12,lineHeight:1.45,margin:"0 0 10px"}}>{item.text}</p>
                <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#756D7E"}}><span>{item.cat||"Новость"}</span><span>{item.date}</span>{item.imageName&&<span>📎 {item.imageName}</span>}</div>
              </div>
              <button type="button" className="mini-btn active" onClick={()=>openNewsManage(item)}>Управлять</button>
            </section>)}
          </div>}
        </>:<>
          <div className="analytics-toolbar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,marginBottom:18,flexWrap:"wrap"}}>
            <div>
              <h2 style={{fontSize:28,letterSpacing:"-1px",margin:"0 0 5px"}}>Аналитика платформы</h2>
              <div style={{fontSize:12,color:"#81798B"}}><span style={{color:"#8D27EE",fontWeight:800}}>MVP · демо-данные</span> — реальные показатели появятся после подключения централизованного трекинга.</div>
            </div>
            <div className="analytics-periods" style={{display:"flex",gap:6}}>
              {[["7","7 дней"],["30","30 дней"],["90","90 дней"]].map(([id,label])=><button key={id} type="button" onClick={()=>setAnalyticsPeriod(id)} style={{border:analyticsPeriod===id?0:"1px solid #E2D7EC",background:analyticsPeriod===id?"#8D27EE":"#fff",color:analyticsPeriod===id?"#fff":"#756D7E",borderRadius:20,padding:"9px 13px",fontSize:12,fontWeight:800,cursor:"pointer"}}>{label}</button>)}
            </div>
          </div>

          <div className="analytics-kpis" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
            {[
              {v:a.visitors,l:"уникальных посетителей",sub:"за период"},
              {v:conversion+"%",l:"конверсия в участие",sub:a.joins+" участников"},
              {v:a.active,l:"активных пользователей",sub:"совершили действие"},
              {v:a.returning+"%",l:"возвращаемость",sub:"повторные визиты"}
            ].map((x,i)=><div key={i} className="stat-card analytics-kpi"><strong>{x.v}</strong><span>{x.l}</span><small style={{display:"block",marginTop:8,color:"#AAA2B2",fontSize:10}}>{x.sub}</small></div>)}
          </div>

          <div className="analytics-main-grid" style={{display:"grid",gridTemplateColumns:"1.05fr .95fr",gap:18,marginBottom:18}}>
            <section className="admin-form analytics-card">
              <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div><h2 style={{margin:"0 0 4px"}}>Воронка участия</h2><p className="muted" style={{fontSize:12}}>Где сотрудники теряются на пути до результата</p></div><div style={{fontSize:12,color:"#8D27EE",fontWeight:800}}>Посещение → результат</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:8}}>
                {funnel.map((f,i)=>{const pct=Math.max(8,Math.round(f.value/a.visitors*100));return <div key={f.label}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}><span style={{fontSize:12,fontWeight:700}}>{f.label}</span><b style={{fontSize:18}}>{f.value}</b></div>
                  <div style={{height:12,background:"#F0EAF4",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:f.color,borderRadius:99}}/></div>
                  {i<funnel.length-1&&<div style={{fontSize:10,color:"#9B93A4",marginTop:4}}>↓ {Math.round(funnel[i+1].value/f.value*100)}% переходят дальше</div>}
                </div>})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
                <div style={{background:"#F7F1FC",borderRadius:14,padding:"14px"}}><b style={{fontSize:22,color:"#8D27EE"}}>{conversion}%</b><div style={{fontSize:11,color:"#756D7E",marginTop:3}}>визит → участие</div></div>
                <div style={{background:"#F7F1FC",borderRadius:14,padding:"14px"}}><b style={{fontSize:22,color:"#8D27EE"}}>{resultConversion}%</b><div style={{fontSize:11,color:"#756D7E",marginTop:3}}>участие → результат</div></div>
              </div>
            </section>

            <section className="admin-list analytics-card">
              <h2 style={{margin:"0 0 4px"}}>Динамика интереса</h2>
              <p className="muted" style={{fontSize:12,marginBottom:18}}>Открытия челленджей в течение периода</p>
              <div style={{height:210,display:"flex",alignItems:"flex-end",gap:9,padding:"8px 4px 24px",borderBottom:"1px solid #EDE6F1"}}>
                {a.trend.map((v,i)=>{const max=Math.max(...a.trend);return <div key={i} style={{flex:1,height:"100%",display:"flex",alignItems:"flex-end"}}><div title={String(v)} style={{width:"100%",height:Math.max(12,Math.round(v/max*100))+"%",background:i===a.trend.length-1?"#8D27EE":"#E5CDF8",borderRadius:"8px 8px 3px 3px"}}/></div>})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginTop:16}}>
                <div><b style={{fontSize:21}}>{a.eventSignups}</b><div className="muted" style={{fontSize:10}}>регистраций на события</div></div>
                <div><b style={{fontSize:21}}>{Math.max(results.length,a.submits)}</b><div className="muted" style={{fontSize:10}}>внесённых результатов</div></div>
              </div>
            </section>
          </div>

          <div className="analytics-main-grid" style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:18}}>
            <section className="admin-form analytics-card">
              <h2 style={{margin:"0 0 4px"}}>Популярность челленджей</h2>
              <p className="muted" style={{fontSize:12,marginBottom:8}}>Сравнение просмотров и реального участия</p>
              {topChallenges.map((x,i)=><div key={x.title} style={{display:"grid",gridTemplateColumns:"1fr 80px 90px 62px",gap:12,alignItems:"center",padding:"13px 0",borderTop:i?"1px solid #EEE7F3":"none"}}>
                <b style={{fontSize:13}}>{x.title}</b><span style={{fontSize:12,color:"#756D7E"}}>{x.views} просм.</span><span style={{fontSize:12,color:"#756D7E"}}>{x.participants} участ.</span><strong style={{fontSize:13,color:"#8D27EE",textAlign:"right"}}>{x.conv}%</strong>
              </div>)}
            </section>
            <section className="admin-list analytics-card">
              <h2 style={{margin:"0 0 8px"}}>Что отслеживать</h2>
              {[
                ["page_view","Посещение страницы"],
                ["challenge_view","Открытие челленджа"],
                ["challenge_join","Нажатие «Участвовать»"],
                ["result_submit","Внесение результата"],
                ["event_signup","Запись на событие"]
              ].map(([event,label],i)=><div key={event} className="admin-list-row" style={{alignItems:"center"}}><span style={{fontSize:15,color:"#8D27EE"}}>●</span><div><b style={{fontSize:12}}>{label}</b><small>{event}</small></div></div>)}
              <div style={{background:"#F7F1FC",borderRadius:12,padding:"12px",fontSize:11,lineHeight:1.5,color:"#756D7E",marginTop:10}}>Для общей статистики по сотрудникам события должны отправляться в централизованное хранилище. Данные только из localStorage не подходят для продуктовой аналитики.</div>
            </section>
          </div>
        </>}
      </div>

      {managedChallenge&&manageDraft&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&closeManage()}>
        <form className="light-modal manage-challenge-modal" style={{maxWidth:700}} onSubmit={saveManage}>
          <button type="button" className="modal-close" onClick={closeManage}>×</button>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:"1.5px",color:"#8D27EE",marginBottom:8}}>УПРАВЛЕНИЕ ЧЕЛЛЕНДЖЕМ</div>
          <h2 style={{fontSize:28,letterSpacing:"-1px",margin:"0 0 18px"}}>{managedChallenge.emoji} {managedChallenge.title}</h2>

          <div className="manage-form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <label style={{gridColumn:"1/-1"}}>Название<input value={manageDraft.title} onChange={e=>setManageDraft(p=>({...p,title:e.target.value}))}/></label>
            <label style={{gridColumn:"1/-1"}}>Описание<textarea value={manageDraft.desc} onChange={e=>setManageDraft(p=>({...p,desc:e.target.value}))}/></label>
            <label>Статус
              <select value={manageDraft.status} onChange={e=>setManageDraft(p=>({...p,status:e.target.value}))}>
                <option value="active">Активный</option>
                <option value="soon">Скоро</option>
                <option value="completed">Завершён</option>
              </select>
            </label>
            <label>Дней до завершения<input type="number" min="0" value={manageDraft.daysLeft} onChange={e=>setManageDraft(p=>({...p,daysLeft:Number(e.target.value)}))}/></label>
            <label style={{gridColumn:"1/-1"}}>Тип результата
              <select value={manageDraft.type} onChange={e=>setManageDraft(p=>({...p,type:e.target.value}))}>
                <option value="steps">Шаги</option>
                <option value="run">Бег / километры</option>
                <option value="bike">Велосипед</option>
                <option value="swim">Плавание</option>
              </select>
            </label>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"20px 0"}}>
            <div style={{background:"#F7F1FC",borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#8D27EE",letterSpacing:"1px",marginBottom:8}}>УЧАСТНИКИ</div>
              <div style={{fontSize:24,fontWeight:800}}>{managedChallenge.participants||0}</div>
              <div className="muted" style={{fontSize:11}}>общий демо-счётчик</div>
              {joinedChallenges.includes(managedChallenge.id)&&<div style={{marginTop:10,fontSize:11,fontWeight:700,color:"#159B66"}}>✓ Текущий пользователь участвует</div>}
              <div style={{marginTop:8,fontSize:9.5,lineHeight:1.4,color:"#AAA2B2"}}>Полный список сотрудников появится после корпоративной авторизации и backend.</div>
            </div>
            <div style={{background:"#F7F1FC",borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#8D27EE",letterSpacing:"1px",marginBottom:8}}>РЕЗУЛЬТАТЫ</div>
              <div style={{fontSize:24,fontWeight:800}}>{managedResults.length}</div>
              <div className="muted" style={{fontSize:11}}>сохранено в этом браузере</div>
              {managedResults.slice(-3).reverse().map(x=><div key={x.id} style={{fontSize:10,marginTop:8,paddingTop:8,borderTop:"1px solid #E6DAEF"}}><b>{Number(x.value||0).toLocaleString("ru-RU")}</b> · {x.date}</div>)}
            </div>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button type="button" className="mini-btn" onClick={closeManage}>Отмена</button>
            <button type="submit" className="primary-btn" style={{width:"auto",padding:"10px 18px"}}>Сохранить изменения</button>
          </div>
        </form>
      </div>}

      {managedEvent&&manageEventDraft&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&closeEventManage()}>
        <form className="light-modal manage-challenge-modal" style={{maxWidth:650}} onSubmit={saveEventManage}>
          <button type="button" className="modal-close" onClick={closeEventManage}>×</button>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:"1.5px",color:"#8D27EE",marginBottom:8}}>УПРАВЛЕНИЕ СОБЫТИЕМ</div>
          <h2 style={{fontSize:28,letterSpacing:"-1px",margin:"0 0 18px"}}>📅 {managedEvent.title}</h2>
          <div className="manage-form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <label style={{gridColumn:"1/-1"}}>Название<input value={manageEventDraft.title} onChange={e=>setManageEventDraft(p=>({...p,title:e.target.value}))}/></label>
            <label>Дата<input type="date" value={manageEventDraft.dateISO} onChange={e=>setManageEventDraft(p=>({...p,dateISO:e.target.value}))}/></label>
            <label>Формат / тип<input value={manageEventDraft.kind} onChange={e=>setManageEventDraft(p=>({...p,kind:e.target.value}))}/></label>
            <label style={{gridColumn:"1/-1"}}>Место / ссылка<input value={manageEventDraft.place} onChange={e=>setManageEventDraft(p=>({...p,place:e.target.value}))}/></label>
          </div>
          <div style={{background:"#F7F1FC",borderRadius:16,padding:"16px",margin:"18px 0"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#8D27EE",letterSpacing:"1px",marginBottom:8}}>РЕГИСТРАЦИИ</div>
            <div style={{fontSize:24,fontWeight:800}}>{registeredEvents.includes(managedEvent.id)?1:0}</div>
            <div className="muted" style={{fontSize:11}}>видно в текущем MVP-браузере</div>
            {registeredEvents.includes(managedEvent.id)&&<div style={{marginTop:10,fontSize:11,fontWeight:700,color:"#159B66"}}>✓ Текущий пользователь зарегистрирован</div>}
            <div style={{marginTop:8,fontSize:9.5,lineHeight:1.4,color:"#AAA2B2"}}>После backend здесь будет полный список сотрудников, дата регистрации и выгрузка участников.</div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"space-between",alignItems:"center"}}>
            <button type="button" className="mini-btn" style={{color:manageEventDraft.archived?"#159B66":"#A44747"}} onClick={()=>setManageEventDraft(p=>({...p,archived:!p.archived}))}>{manageEventDraft.archived?"Вернуть из архива":"Архивировать"}</button>
            <div style={{display:"flex",gap:10}}><button type="button" className="mini-btn" onClick={closeEventManage}>Отмена</button><button type="submit" className="primary-btn" style={{width:"auto",padding:"10px 18px"}}>Сохранить</button></div>
          </div>
        </form>
      </div>}

      {managedNews&&manageNewsDraft&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&closeNewsManage()}>
        <form className="light-modal manage-challenge-modal" style={{maxWidth:650}} onSubmit={saveNewsManage}>
          <button type="button" className="modal-close" onClick={closeNewsManage}>×</button>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:"1.5px",color:"#8D27EE",marginBottom:8}}>УПРАВЛЕНИЕ ПУБЛИКАЦИЕЙ</div>
          <h2 style={{fontSize:28,letterSpacing:"-1px",margin:"0 0 18px"}}>{managedNews.emoji||"📢"} {managedNews.title}</h2>
          <div className="manage-form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <label style={{gridColumn:"1/-1"}}>Заголовок<input value={manageNewsDraft.title} onChange={e=>setManageNewsDraft(p=>({...p,title:e.target.value}))}/></label>
            <label>Категория
              <select value={manageNewsDraft.cat} onChange={e=>setManageNewsDraft(p=>({...p,cat:e.target.value}))}>
                <option value="Анонс">Анонс</option>
                <option value="Новости">Новости</option>
                <option value="Результаты">Результаты</option>
                <option value="Итоги">Итоги</option>
                <option value="Мероприятие">Мероприятие</option>
              </select>
            </label>
            <div/>
            <label style={{gridColumn:"1/-1"}}>Текст<textarea value={manageNewsDraft.text} onChange={e=>setManageNewsDraft(p=>({...p,text:e.target.value}))}/></label>
          </div>
          <div style={{background:"#F7F1FC",borderRadius:16,padding:"14px",margin:"18px 0",fontSize:11,lineHeight:1.45,color:"#756D7E"}}>
            Статус: <b style={{color:manageNewsDraft.archived?"#81798B":"#159B66"}}>{manageNewsDraft.archived?"снято с публикации":"опубликовано"}</b>. Снятая публикация остаётся в админке, но исчезает из раздела новостей сотрудников.
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"space-between",alignItems:"center"}}>
            <button type="button" className="mini-btn" style={{color:manageNewsDraft.archived?"#159B66":"#A44747"}} onClick={()=>setManageNewsDraft(p=>({...p,archived:!p.archived}))}>{manageNewsDraft.archived?"Опубликовать снова":"Снять с публикации"}</button>
            <div style={{display:"flex",gap:10}}><button type="button" className="mini-btn" onClick={closeNewsManage}>Отмена</button><button type="submit" className="primary-btn" style={{width:"auto",padding:"10px 18px"}}>Сохранить</button></div>
          </div>
        </form>
      </div>}
    </div>
  );
}


export default function App(){
  const [page,setPage]=useState("light");
  const load=(key,fallback)=>readData(key,fallback);
  const [news,setNews]=useState(()=>load(STORAGE_KEYS.news,INIT_NEWS));
  const [appChallenges,setAppChallenges]=useState(()=>load(STORAGE_KEYS.challenges,CHALLENGES));
  const [events,setEvents]=useState(()=>{
    const saved=load(STORAGE_KEYS.events,[]);
    const current=Array.isArray(saved)?saved:[];
    return [...current,...DEFAULT_EVENTS.filter(base=>!current.some(item=>item.id===base.id))];
  });
  const [results,setResults]=useState(()=>load(STORAGE_KEYS.results,[]));
  const [joinedChallenges,setJoinedChallenges]=useState(()=>load(STORAGE_KEYS.joinedChallenges,["c1"]));
  const [eventLog,setEventLog]=useState(()=>load(STORAGE_KEYS.eventLog,[]));
  const [registeredEvents,setRegisteredEvents]=useState(()=>load(STORAGE_KEYS.registeredEvents,["e1","e2"]));
  const [signedIn,setSignedIn]=useState(()=>load(STORAGE_KEYS.signedIn,false));
  const [showLogin,setShowLogin]=useState(false);
  const [isAdmin,setIsAdmin]=useState(false);
  const [toast,setToast]=useState(null);

  useEffect(()=>{writeData(STORAGE_KEYS.news,news);},[news]);
  useEffect(()=>{writeData(STORAGE_KEYS.challenges,appChallenges);},[appChallenges]);
  useEffect(()=>{writeData(STORAGE_KEYS.events,events);},[events]);
  useEffect(()=>{writeData(STORAGE_KEYS.results,results);},[results]);
  useEffect(()=>{writeData(STORAGE_KEYS.joinedChallenges,joinedChallenges);},[joinedChallenges]);
  useEffect(()=>{writeData(STORAGE_KEYS.eventLog,eventLog.slice(-500));},[eventLog]);
  useEffect(()=>{writeData(STORAGE_KEYS.registeredEvents,registeredEvents);},[registeredEvents]);
  useEffect(()=>{writeData(STORAGE_KEYS.signedIn,signedIn);},[signedIn]);

  const notify=msg=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  const trackEvent=(eventName,entityId="",meta={})=>{const event=createAnalyticsEvent(eventName,entityId,meta);setEventLog(p=>[...p,event].slice(-500));sendAnalyticsEvent(event);};
  const joinChallenge=id=>{
    setJoinedChallenges(p=>p.includes(id)?p:[...p,id]);
    setAppChallenges(p=>p.map(c=>c.id===id?{...c,participants:Number(c.participants||0)+1}:c));
    trackEvent("challenge_join",id);
    notify("Вы участвуете в челлендже");
  };
  const login=role=>{setSignedIn(true);setIsAdmin(role==="admin");setShowLogin(false);setPage(role==="admin"?"admin":"cabinet-light");};
  const addResult=result=>{setResults(p=>[...p,result]);setJoinedChallenges(p=>p.includes(result.challengeId)?p:[...p,result.challengeId]);trackEvent("result_submit",result.challengeId,{value:result.value});notify("Результат сохранён, прогресс обновлён");};
  const toggleEvent=id=>setRegisteredEvents(p=>{const joined=!p.includes(id);trackEvent(joined?"event_signup":"event_unregister",id,{source:"user_action"});return joined?[...p,id]:p.filter(x=>x!==id);});
  const adminAddChallenge=form=>{setAppChallenges(p=>[{id:`c${Date.now()}`,emoji:form.emoji||"🏃",title:form.title,desc:form.desc||"Новый корпоративный челлендж",participants:0,status:"active",statusLabel:"Активный",color:BP,daysLeft:30,startDate:form.startDate||"",endDate:form.endDate||"",type:"steps",attachmentName:form.fileName||"",attachmentType:form.fileType||"",attachmentData:form.fileData||"",bg:"linear-gradient(135deg,#EDE1FB,#D9E8FB)"},...p]);notify("Челлендж запущен");};
  const adminUpdateChallenge=(id,patch)=>{
    setAppChallenges(p=>p.map(ch=>ch.id===id?{...ch,...patch}:ch));
    trackEvent("admin_challenge_update",id,{status:patch.status});
    notify("Изменения челленджа сохранены");
  };
  const adminAddEvent=form=>{const d=form.date?new Date(`${form.date}T12:00:00`):new Date();setEvents(p=>[{id:`e${Date.now()}`,date:String(d.getDate()).padStart(2,"0"),day:d.toLocaleDateString("ru-RU",{weekday:"short"}).toUpperCase(),dateISO:form.date||"",title:form.title,place:form.place||"Онлайн",kind:form.kind||"Событие",archived:false,attachmentName:form.fileName||"",attachmentType:form.fileType||"",attachmentData:form.fileData||""},...p]);notify("Событие добавлено");};
  const adminUpdateEvent=(id,patch)=>{
    setEvents(p=>p.map(ev=>ev.id===id?{...ev,...patch}:ev));
    trackEvent("admin_event_update",id,{archived:!!patch.archived});
    notify(patch.archived?"Событие перемещено в архив":"Изменения события сохранены");
  };
  const adminAddNews=form=>{setNews(p=>[{id:Date.now(),title:form.title,cat:"Анонс",date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),text:form.text||"Новая публикация",emoji:form.emoji||"📢",archived:false,imageName:form.fileName||"",attachmentType:form.fileType||"",attachmentData:form.fileData||"",bg:"linear-gradient(160deg,#F3EEFA,#E9F6EF)"},...p]);notify("Публикация добавлена");};
  const adminUpdateNews=(id,patch)=>{
    setNews(p=>p.map(item=>item.id===id?{...item,...patch}:item));
    trackEvent("admin_news_update",String(id),{archived:!!patch.archived});
    notify(patch.archived?"Публикация снята":"Публикация обновлена");
  };

  useEffect(()=>{trackEvent("page_view",page);},[page]);
  useEffect(()=>{
    flushAnalyticsQueue();
    const onOnline=()=>flushAnalyticsQueue();
    window.addEventListener("online",onOnline);
    return()=>window.removeEventListener("online",onOnline);
  },[]);

  return(
    <div style={{minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
        @keyframes kenBurns{0%{transform:scale(1) translate(0,0)}50%{transform:scale(1.07) translate(-1%,-1%)}100%{transform:scale(1.03) translate(1%,0.5%)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid rgba(141,39,238,.22);outline-offset:2px}
        html,body,button,input,textarea,select{font-family:'Open Sans',Arial,sans-serif}
        .light-section-title,.light-page-title{font-size:52px!important;line-height:1.02!important;letter-spacing:-2.4px!important}
        .light-hero-title{font-size:clamp(56px,5.4vw,78px)!important;letter-spacing:-3.8px!important}
        .platform-block-hero{min-height:168px!important}
        .platform-block-hero h3{font-size:28px!important}
        .company-progress-link:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(50,25,80,.08)!important}
        .section-title-link:hover h2{color:#5F17B8}
        button:disabled{cursor:not-allowed}
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
        .group-nav-btn,.platform-block-card,.platform-module-btn{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease,color .18s ease}
        .group-nav-btn:hover{background:#FAF7FD!important;color:#5F17B8!important}
        .group-nav-btn.is-active:hover{background:#F5EEFC!important}
        .platform-block-card,.platform-module-btn{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
        .platform-block-card:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(50,25,80,.08)!important}
        .platform-module-btn:hover{transform:translateY(-2px);border-color:#D8CBE3!important;box-shadow:0 10px 24px rgba(50,25,80,.07)}
        .module-feature-grid>div{transition:transform .18s ease}.module-feature-grid>div:hover{transform:translateY(-2px)}
        .community-tabs::-webkit-scrollbar{display:none}.community-main select,.community-main input,.community-main textarea{color:#10052F}.community-main button{transition:transform .15s ease,box-shadow .15s ease}.community-main button:active{transform:scale(.98)}
        .progress-tabs::-webkit-scrollbar{display:none}.progress-main input,.progress-main textarea{color:#10052F;outline:none}
        .support-tabs::-webkit-scrollbar{display:none}.support-main input,.support-main textarea,.support-main select{color:#10052F;outline:none}
        .participate-tabs::-webkit-scrollbar{display:none}.participate-main input,.participate-main textarea{color:#10052F;outline:none}
        @media(max-width:760px){.participate-section-head{align-items:flex-start!important;flex-direction:column!important}.participate-list article{grid-template-columns:58px 1fr!important}.participate-list article>button{grid-column:1/-1!important;width:100%!important}}
        @media(max-width:620px){.participate-main{padding-top:24px!important}.participate-hero{padding:26px!important}.participate-hero>img{width:58%!important;opacity:.5!important}.participate-hero>div{max-width:80%!important}}
        @media(max-width:1000px){.trainer-layout{grid-template-columns:1fr!important}.support-news-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:620px){.support-main{padding-top:24px!important}.support-hero{padding:26px!important}.support-hero>img{width:58%!important;opacity:.5!important}.support-hero>div{max-width:80%!important}.support-section-head{align-items:flex-start!important;flex-direction:column!important}.support-section-head input{width:100%!important}.support-news-grid{grid-template-columns:1fr!important}.announcement-list article{grid-template-columns:58px 1fr!important}.announcement-list article>button{grid-column:1/-1!important;width:100%!important}}
        @media(max-width:1000px){.progress-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}.coin-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.benefit-grid{grid-template-columns:1fr!important}.achievement-layout{grid-template-columns:1fr!important}}
        @media(max-width:620px){.progress-main{padding-top:24px!important}.progress-hero{padding:26px!important}.progress-hero>img{width:58%!important;opacity:.5!important}.progress-hero>div{max-width:78%!important}.progress-kpis,.coin-grid{grid-template-columns:1fr!important}.rating-row{grid-template-columns:28px 38px 1fr auto!important}.rating-row>div:nth-child(4){grid-column:3/5;text-align:left!important}.rating-row>div:nth-child(5){display:none}.benefit-grid article{grid-template-columns:52px 1fr!important}.benefit-grid article>button{grid-column:1/-1!important;width:100%!important}.achievement-showcase{grid-template-columns:1fr!important}}
        @media(max-width:1000px){.community-people-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.community-filters{grid-template-columns:1fr 1fr!important}.community-filters input{grid-column:1/-1}.community-grid{grid-template-columns:1fr!important}}
        @media(max-width:620px){.community-main{padding-top:24px!important}.community-hero{padding:26px!important}.community-hero>img{width:58%!important;opacity:.55!important}.community-hero>div{max-width:78%!important}.community-people-grid{grid-template-columns:1fr!important}.community-filters{grid-template-columns:1fr!important}.community-filters input{grid-column:auto}.community-section-head{align-items:flex-start!important;flex-direction:column!important}.community-grid article[style*="grid-template-columns"]{grid-template-columns:52px 1fr!important}.community-grid article[style*="grid-template-columns"]>button{grid-column:1/-1!important;width:100%!important}}
        @media(max-width:1100px){.module-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:760px){.pravo-group-nav{display:none!important}.pravo-mobile-menu{display:block!important}.pravo-search{display:none!important}.platform-block-grid{grid-template-columns:1fr!important}.platform-block-hero{min-height:190px!important;padding:24px!important}.platform-block-hero>div{max-width:70%!important}.module-hero{min-height:330px!important;padding:30px!important}.module-hero>div{max-width:72%!important}.module-feature-grid{grid-template-columns:1fr!important}}
        @media(max-width:520px){.platform-module-grid{grid-template-columns:1fr!important}.platform-block-hero{min-height:220px!important}.platform-block-hero>img{width:48%!important;opacity:.72!important}.platform-block-hero>div{max-width:78%!important}.platform-module-btn{min-height:82px!important;padding:14px!important}.module-hero{min-height:390px!important;padding:24px!important;align-items:flex-end!important}.module-hero>img{width:100%!important;height:48%!important;mask-image:linear-gradient(180deg,#000,transparent)!important;-webkit-mask-image:linear-gradient(180deg,#000,transparent)!important}.module-hero>div{max-width:100%!important}.module-hero h1{font-size:42px!important}}
        /* Responsive production layout: desktop/tablet/mobile. */
        .scenario-card{transition:transform .18s ease,box-shadow .18s ease}.scenario-card:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(50,25,80,.08)!important}.analytics-card{min-width:0}
        @media(max-width:1100px){
          .scenario-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
          .analytics-main-grid{grid-template-columns:1fr!important}
          .analytics-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}

          .pravo-header-wrap{padding:14px 20px 0!important}
          .pravo-header-inner{padding-left:20px!important;padding-right:14px!important}
          .pravo-nav{gap:10px!important}
          .pravo-participate{padding:0 18px!important}
          .light-main{padding-left:24px!important;padding-right:24px!important}
          .light-hero{grid-template-columns:1fr 1fr!important;gap:24px!important;min-height:500px!important}
          .light-hero-image{height:460px!important}
          .light-challenge-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
          .rewards-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
          .rewards-head{grid-template-columns:1fr!important;gap:12px!important}
          .company-progress-card{grid-template-columns:1fr!important}
          .how-grid{grid-template-columns:1fr!important;gap:34px!important;padding:46px!important}
          .home-news-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
          .home-news-split{grid-column:1/-1!important}
          .news-page-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        }
        @media(max-width:900px){
          .pravo-header-wrap{padding:12px 16px 0!important}
          .pravo-header-inner{height:auto!important;min-height:72px!important;flex-wrap:wrap!important;row-gap:8px!important;padding:12px 16px!important}
          .pravo-nav{order:5;width:100%;gap:4px!important;padding-top:8px;border-top:1px solid #F0EAF4;overflow-x:auto;justify-content:flex-start;scrollbar-width:none}
          .pravo-nav::-webkit-scrollbar{display:none}
          .pravo-nav button{flex:0 0 auto;padding:7px 10px!important}
          .pravo-account-dot{margin-left:12px!important}
        }
        @media(max-width:760px){
          html,body,#root{max-width:100%;overflow-x:hidden}
          .pravo-header-wrap{padding:10px 12px 0!important}
          .pravo-header-inner{height:auto!important;min-height:68px!important;border-radius:28px!important;padding:12px 14px!important;flex-wrap:wrap!important;row-gap:8px!important}
          .pravo-logo{font-size:20px!important;letter-spacing:-.9px!important}
          .pravo-nav{order:5;width:100%;gap:2px!important;padding-top:8px;border-top:1px solid #F0EAF4;overflow-x:auto;justify-content:flex-start;scrollbar-width:none}
          .pravo-nav::-webkit-scrollbar{display:none}
          .pravo-nav button{flex:0 0 auto;padding:7px 10px!important;font-size:12px!important}
          .pravo-account-dot{display:none!important}
          .pravo-participate{height:42px!important;padding:0 14px!important;font-size:12px!important;margin-left:8px!important}
          .pravo-avatar{width:42px!important;height:42px!important;font-size:15px!important;margin-left:8px!important}
          .light-main{padding:24px 16px 44px!important}
          .light-hero{grid-template-columns:1fr!important;gap:18px!important;min-height:0!important;align-items:stretch!important}
          .light-hero-copy{padding:10px 0 0!important}
          .light-hero-title{font-size:clamp(46px,14vw,62px)!important;line-height:.92!important;letter-spacing:-3px!important;margin-bottom:22px!important}
          .light-hero-image{height:320px!important}
          .light-hero-image img{border-radius:36% 12% 12% 12% / 22% 14% 14% 14%!important}
          .light-section-head{align-items:flex-start!important;flex-direction:column!important;gap:12px!important}
          .light-section-title,.light-page-title{font-size:clamp(38px,11vw,48px)!important;line-height:.98!important;letter-spacing:-2.2px!important}
          .light-filters{overflow-x:auto;white-space:nowrap;padding-bottom:3px;scrollbar-width:none}
          .light-filters::-webkit-scrollbar{display:none}
          .light-filters button{flex:0 0 auto}
          .light-challenge-grid,.rewards-grid,.home-news-grid,.news-page-grid{grid-template-columns:1fr!important}
          .light-challenge-card{min-height:0!important}
          .challenge-page-item .light-challenge-card>div:last-child{padding-bottom:72px!important}
          .light-challenge-media{height:230px!important}
          .company-progress-card{padding:22px!important;gap:12px!important}
          .company-progress-card h2{font-size:34px!important;letter-spacing:-1.6px!important}
          .rewards-head{margin-bottom:22px!important}
          .rewards-grid>div{height:260px!important}
          .rewards-grid>div>div:nth-child(2){margin-top:28px!important}
          .how-grid{padding:30px 20px!important;border-radius:24px!important;gap:24px!important;margin-bottom:52px!important}
          .how-title{font-size:42px!important;letter-spacing:-2px!important}
          .how-grid>div:last-child>div{grid-template-columns:30px 48px 1fr!important;gap:10px!important;padding:16px 0!important}
          .how-grid>div:last-child>div>div:nth-child(2){width:46px!important;height:46px!important;border-radius:14px!important}
          .home-news-split{height:auto!important;grid-template-columns:1fr!important;grid-template-rows:auto 220px!important}
          .home-news-grid article{height:auto!important;min-height:300px}
          .news-page-grid article{min-height:0!important}
          .light-dashboard-content{padding:24px 16px 48px!important}
          .profile-head h1{font-size:22px!important}
          .event-row{align-items:flex-start!important;flex-wrap:wrap!important}
          .event-row .mini-btn{margin-left:auto}
          .light-modal{padding:24px 18px!important;border-radius:20px!important;max-height:92vh;overflow-y:auto}
          .admin-head h1{font-size:30px!important}
          .stat-card,.admin-form,.admin-list{padding:18px!important}
          .challenge-admin-row{grid-template-columns:1fr!important}
          .challenge-admin-row>button{justify-self:start}
          .manage-form-grid{grid-template-columns:1fr!important}
          .manage-form-grid label{grid-column:1!important}
        }
        @media(max-width:520px){
          body{padding-bottom:env(safe-area-inset-bottom)}
          .pravo-header-wrap{padding:8px 10px 0!important}
          .pravo-header-inner{min-height:62px!important;border-radius:26px!important;padding:10px 12px!important;row-gap:7px!important}
          .pravo-logo{font-size:19px!important;letter-spacing:-.8px!important}
          .pravo-avatar{width:40px!important;height:40px!important;font-size:14px!important;margin-left:6px!important}
          .pravo-nav{padding-top:7px!important;justify-content:space-between!important;overflow:visible!important}
          .pravo-nav button{padding:6px 3px!important;font-size:11.5px!important}
          .pravo-participate{display:none!important}
          .light-main{padding:20px 14px calc(40px + env(safe-area-inset-bottom))!important}
          .scenario-section{padding:10px 0 52px!important}
          .scenario-grid{grid-template-columns:1fr!important;gap:10px!important}
          .scenario-card{min-height:156px!important;padding:20px!important;border-radius:22px!important}
          .scenario-card h3{font-size:22px!important}
          .challenge-detail-modal h2{font-size:27px!important}
          .challenge-detail-meta{grid-template-columns:1fr!important}
          .admin-section-tabs{width:100%!important;overflow-x:auto!important;scrollbar-width:none}
          .admin-section-tabs::-webkit-scrollbar{display:none}
          .admin-section-tabs button{flex:0 0 auto!important}
          .manage-toolbar{align-items:flex-start!important;flex-direction:column!important}
          .manage-kind-tabs{width:100%!important;overflow-x:auto!important;scrollbar-width:none}
          .manage-kind-tabs::-webkit-scrollbar{display:none}
          .manage-kind-tabs button{flex:0 0 auto!important}
          .challenge-admin-metrics{gap:9px!important}
          .manage-challenge-modal>div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr!important}
          .analytics-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
          .analytics-toolbar{align-items:flex-start!important}
          .analytics-periods{width:100%!important;overflow-x:auto!important}
          .analytics-periods button{flex:1!important;white-space:nowrap!important}
          .analytics-main-grid{grid-template-columns:1fr!important}
          .analytics-card{padding:17px!important}
          .analytics-card>div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}

          .light-hero{gap:14px!important}
          .light-hero-copy{padding-top:6px!important}
          .light-hero-title{font-size:clamp(42px,13.2vw,55px)!important;line-height:.93!important;letter-spacing:-2.7px!important;margin-bottom:20px!important}
          .light-hero-copy>button{font-size:14px!important;padding:13px 21px!important}
          .light-hero-image{height:250px!important}
          .light-section-title,.light-page-title{font-size:clamp(36px,10.5vw,44px)!important;line-height:.98!important;letter-spacing:-2px!important}
          #challenges{padding-top:34px!important;padding-bottom:52px!important}
          #company-progress{padding-bottom:52px!important}
          #rewards{padding-bottom:52px!important}
          #news{padding-bottom:38px!important}
          .light-filters{margin:24px 0 16px!important}
          .light-filters button{padding:10px 17px!important;font-size:13px!important}
          .light-challenge-media{height:215px!important}
          .light-challenge-card>div:last-child{padding:22px 20px 24px!important}
          .light-challenge-card h3{font-size:24px!important;letter-spacing:-.9px!important}
          .company-progress-card{padding:22px 20px!important;border-radius:24px!important}
          .company-progress-card h2{font-size:32px!important;letter-spacing:-1.3px!important}
          .company-progress-card p{font-size:13px!important;line-height:1.45!important}
          .company-progress-card>div:last-child{height:118px!important}
          .rewards-head .light-section-title{font-size:40px!important;line-height:.98!important}
          .rewards-head p{font-size:14px!important;line-height:1.45!important}
          .rewards-grid>div{height:230px!important;padding:22px!important;border-radius:24px!important}
          .rewards-grid>div>div:nth-child(2){font-size:42px!important;margin-top:20px!important}
          .rewards-grid h3{font-size:21px!important}
          .how-grid{padding:26px 18px!important;border-radius:24px!important;gap:20px!important;margin-bottom:52px!important}
          .how-title{font-size:38px!important;letter-spacing:-1.8px!important}
          .how-grid>div:first-child p{font-size:15px!important}
          .how-grid>div:last-child>div{grid-template-columns:28px 46px 1fr!important;gap:9px!important;padding:15px 0!important}
          .how-grid>div:last-child h3{font-size:18px!important}
          .how-grid>div:last-child p{font-size:13px!important;line-height:1.4!important}
          .home-news-split{grid-template-rows:auto 190px!important;border-radius:24px!important}
          .home-news-split>div{padding:24px!important}
          .home-news-split h3{font-size:26px!important;line-height:1.04!important;margin:24px 0 12px!important}
          .home-news-grid article{min-height:230px!important;border-radius:24px!important}
          .home-news-grid article:not(.home-news-split){padding:24px!important}
          .home-news-grid article:not(.home-news-split) h3{font-size:22px!important;margin-top:22px!important}
          .news-page-grid article{border-radius:24px!important}
          .light-dashboard-content{padding:22px 14px calc(52px + env(safe-area-inset-bottom))!important}
          .admin-head{gap:10px!important;margin-bottom:22px!important}
          .admin-head h1{font-size:29px!important;letter-spacing:-1px!important}
          .admin-head>div:last-child{width:100%;justify-content:space-between!important;gap:8px!important}
          .admin-stats{gap:12px!important}
          .stat-card{padding:15px!important;border-radius:18px!important}
          .admin-form,.admin-list{padding:18px 16px!important;border-radius:20px!important}
          .admin-tabs{display:flex!important;gap:6px!important;overflow-x:auto!important;white-space:nowrap!important;scrollbar-width:none}
          .admin-tabs::-webkit-scrollbar{display:none}
          .admin-tabs button{flex:0 0 auto!important;padding:9px 12px!important;font-size:12px!important}
          .admin-form h2,.admin-list h2{font-size:24px!important}
          .profile-head{margin-bottom:22px!important}
          .profile-head>div:first-child{align-items:flex-start!important}
          .profile-head h1{font-size:23px!important;line-height:1.1!important}
          .role-pill{font-size:12px!important;padding:9px 13px!important}
          .cabinet-grid{gap:16px!important}
          .cabinet-grid section{padding:18px!important}
          .section-title{font-size:19px!important}
          .challenge-row .mini-btn{font-size:11px!important;padding:7px 10px!important}
          .event-row{gap:10px!important}
          .event-row .mini-btn{font-size:11px!important;padding:7px 10px!important}
        }


      `}</style>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"#D1FAE5",color:"#065F46",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",whiteSpace:"nowrap",border:"1px solid #6EE7B7",animation:"slideIn .3s ease"}}>✓ {toast}</div>}

      {/* ── СВЕТЛАЯ ВЕРСИЯ (продакшн-синтез референсов) ── */}
      {page==="light"&&<LightHome setPage={setPage} challenges={appChallenges} news={news} signedIn={signedIn} isAdmin={isAdmin} onLogin={()=>setShowLogin(true)}/>}
      {page.startsWith("module:")&&<PlatformModulePage setPage={setPage} moduleId={page.slice(7)} signedIn={signedIn} isAdmin={isAdmin} onLogin={()=>setShowLogin(true)} news={news} events={events} registeredEvents={registeredEvents} onToggleEvent={toggleEvent}/>}
      {page==="challenges"&&<LightChallengesPage setPage={setPage} challenges={appChallenges} signedIn={signedIn} isAdmin={isAdmin} joinedChallenges={joinedChallenges} onJoin={joinChallenge} onLogin={()=>setShowLogin(true)}/>}
      {page==="news"&&<LightNewsPage setPage={setPage} news={news} signedIn={signedIn} isAdmin={isAdmin} onLogin={()=>setShowLogin(true)}/>}
      {page==="cabinet-light"&&<LightCabinet setPage={setPage} challenges={appChallenges} events={events} results={results} registeredEvents={registeredEvents} joinedChallenges={joinedChallenges} onSubmitResult={addResult} onToggleEvent={toggleEvent} isAdmin={isAdmin}/>}
      {page==="admin"&&<AdminPanel setPage={setPage} challenges={appChallenges} events={events} news={news} results={results} registeredEvents={registeredEvents} joinedChallenges={joinedChallenges} onAddChallenge={adminAddChallenge} onAddEvent={adminAddEvent} onAddNews={adminAddNews} onUpdateChallenge={adminUpdateChallenge} onUpdateEvent={adminUpdateEvent} onUpdateNews={adminUpdateNews}/>}

      {showLogin&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowLogin(false)}><div className="light-modal"><button className="modal-close" onClick={()=>setShowLogin(false)}>×</button><h2>Вход в право(спорт)</h2><p className="muted">Выберите роль для демонстрации интерфейса.</p><div className="login-actions"><button className="login-choice" onClick={()=>login("employee")}><b>👤 Сотрудник</b><span>Челленджи, результаты и события</span></button><button className="login-choice" onClick={()=>login("admin")}><b>⚙️ Администратор</b><span>Контент и запуск активностей</span></button></div></div></div>}
    </div>
  );
}
