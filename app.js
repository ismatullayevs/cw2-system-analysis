/* Ikat Trips Mini App — complete prototype (frontend-only, Telegram-aware). */
(function(){
"use strict";
/* ---------- Telegram ---------- */
var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
var me = {id:1001, first_name:"Guest", username:"guest"};
var isMock = true;
function initTG(){
  if(tg){ try{ tg.ready(); tg.expand(); }catch(e){}
    var u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if(u && u.id){ me = u; isMock = false; }
    try{ applyTheme(tg.themeParams||{}); }catch(e){}
  }
  document.getElementById("mockBar").hidden = !isMock;
  document.getElementById("avatar").title = (me.first_name||"Guest") + (me.username?" @"+me.username:"");
}
function hx(s){ s = String(s==null?"":s).replace("#","");
  if(s.length===3) s = s.split("").map(function(c){ return c+c; }).join("");
  return /^[0-9a-fA-F]{6}$/.test(s) ? "#"+s.toLowerCase() : null; }
function mix(a,b,t){ var A = parseInt(a.slice(1),16), B = parseInt(b.slice(1),16);
  var r = Math.round(((A>>16)&255)*(1-t)+(((B>>16)&255)*t));
  var g = Math.round(((A>>8)&255)*(1-t)+(((B>>8)&255)*t));
  var bl = Math.round((A&255)*(1-t)+((B&255)*t));
  return "#"+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1); }
function lum(h){ var c = parseInt(h.slice(1),16);
  return (0.2126*((c>>16)&255)+0.7152*((c>>8)&255)+0.0722*(c&255))/255; }
/* Map the full Telegram theme to our palette so dark mode has no light leaks.
   Every surface, border and soft tint is derived; nothing stays light-only. */
function applyTheme(p){
  var r = document.documentElement.style;
  var bg = hx(p.bg_color) || "#edf1ea", dark = lum(bg) <= 0.5;
  var tx = hx(p.text_color) || (dark ? "#f2f5ef" : "#17211b");
  var hint = hx(p.hint_color) || hx(p.subtitle_text_color) || mix(tx, bg, 0.45);
  var acc = hx(p.button_color) || (dark ? "#5aa87f" : "#1c7a4d");
  var accInk = hx(p.button_text_color) || (lum(acc) > 0.5 ? "#10231a" : "#ffffff");
  var surf = hx(p.secondary_bg_color) || hx(p.section_bg_color) || (dark ? mix(bg, tx, 0.10) : "#ffffff");
  var sep = hx(p.section_separator_color) || mix(surf, tx, dark ? 0.22 : 0.14);
  var surf2 = mix(surf, tx, dark ? 0.10 : 0.05);
  var amb = dark ? "#d9a53a" : "#9a6b12";
  var dan = hx(p.destructive_text_color) || (dark ? "#e57a7a" : "#c93a3a");
  var set = function(k,v){ r.setProperty(k,v); };
  set("--bg", bg); set("--text", tx); set("--hint", hint);
  set("--surface", surf); set("--surface2", surf2); set("--line", sep);
  set("--accent", acc); set("--accent-ink", accInk);
  set("--accent-soft", mix(acc, bg, 0.85));
  set("--green-ink", dark ? "#a5dfbb" : "#156138");
  set("--amber", amb); set("--amber-soft", mix(amb, bg, 0.85));
  set("--danger", dan); set("--danger-soft", mix(dan, bg, 0.88));
  set("--topbar", hx(p.header_bg_color) || hx(p.bottom_bar_bg_color) || bg);
  set("--shadow", dark ? "0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.35)"
                       : "0 1px 2px rgba(23,33,27,.07),0 6px 20px rgba(23,33,27,.08)");
}
function buzz(){ try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred("light"); }catch(e){} }
function mainBtn(label, fn){
  try{ if(!tg || !tg.MainButton) return;
    tg.MainButton.setText(label); tg.MainButton.show();
    tg.MainButton.offClick(mainBtn._f||function(){}); mainBtn._f = fn;
    tg.MainButton.onClick(fn);
  }catch(e){}
}
function hideMain(){ try{ tg && tg.MainButton && tg.MainButton.hide(); }catch(e){} }
/* ---------- utils ---------- */
function $(s,r){ return (r||document).querySelector(s); }
function $all(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function money(n){ return Number(n||0).toLocaleString("en-US").replace(/,/g," ") + " som"; }
function uid(p){ return p+"-"+Math.random().toString(36).slice(2,7).toUpperCase(); }
function toast(msg){ var t=document.createElement("div"); t.className="toast"; t.textContent=msg;
  document.getElementById("toastRoot").appendChild(t); setTimeout(function(){ t.remove(); },3200); }
function sheet(html){
  var root = document.getElementById("sheetRoot");
  root.innerHTML = '<div class="scrim"></div><div class="sheet"><div class="grab"></div>'+html+"</div>";
  root.querySelector(".scrim").addEventListener("click", closeSheet);
  root.querySelector(".sheet").addEventListener("click", function(e){
    if(e.target.closest("[data-close]")) closeSheet();
  });
}
function closeSheet(){ document.getElementById("sheetRoot").innerHTML=""; }
function stars(n){ var s=""; for(var i=1;i<=5;i++) s += i<=n?"★":"☆"; return '<span class="stars">'+s+"</span>"; }
/* ---------- seed data ---------- */
var VEH = {plate:"01 S 418 VC", seats:18};
function seedTrips(){ return [
  {id:"sukok", theme:"sukok", title:"Sukok Waterfalls", date:"2026-12-06 08:00", back:"20:00",
   meet:"Amir Temur passage 2 (WIUT SHB)", price:240000, cap:54, pre:41,
   diff:"Medium", open:true, includes:"Transport, trekking poles, guide, photographer",
   desc:"Waterfalls, riverside picnic and a short ridge walk. Our most-booked route — good first trip."},
  {id:"campfire", theme:"campfire", title:"Campfire Night + Lake", date:"2026-12-13 16:00", back:"22:30",
   meet:"Amir Temur passage 2 (WIUT SHB)", price:290000, cap:36, pre:12,
   diff:"Easy", open:true, includes:"Transport, dinner, photographer, equipment",
   desc:"Evening lake, dinner and campfire songs. No hiking — bring a jacket."},
  {id:"chimgan", theme:"chimgan", title:"Chimgan Snow Day", date:"2026-12-20 07:00", back:"19:00",
   meet:"Amir Temur passage 2 (WIUT SHB)", price:360000, cap:72, pre:70,
   diff:"Hard", open:true, includes:"Transport, cable car, guide, photographer",
   desc:"Full mountain day in the snow. Needs warm boots and normal fitness."}
];}
/* ---------- store (v2 keys) ---------- */
var DB = {
  load:function(k,fb){ try{ var v=localStorage.getItem("itms2_"+k); return v?JSON.parse(v):fb; }catch(e){ return fb; } },
  save:function(k,v){ try{ localStorage.setItem("itms2_"+k, JSON.stringify(v)); }catch(e){} }
};
var trips = DB.load("trips", null) || seedTrips();
var bookings = DB.load("bookings", []);
var notices = DB.load("notices", []);
var feedback = DB.load("feedback", [
  {trip:"sukok", name:"Malika", rating:5, text:"Seats together with friends, photos same evening. Best trip this term."},
  {trip:"sukok", name:"Jasur", rating:4, text:"Great guide, bus left 10 min late."}
]);
var reviews_seen = function(){};
function persist(){ DB.save("trips",trips); DB.save("bookings",bookings); DB.save("notices",notices); DB.save("feedback",feedback); }
function trip(id){ return trips.filter(function(t){return t.id===id;})[0]; }
function left(t){ var held = bookings.filter(function(b){return b.tripId===t.id && b.status!=="cancelled";})
  .reduce(function(n,b){return n+b.trav.length;},0); return t.cap - t.pre - held; }
function pushNotice(text){ notices.unshift({t:Date.now(), text:text}); notices=notices.slice(0,25); persist();
  document.getElementById("bellDot").hidden = false; }
function myBookings(){ return bookings.filter(function(b){return b.uid===(me.username||me.first_name||"guest");}); }
/* ---------- router ---------- */
var nav = {tab:"trips", stack:[]};
function go(tab, arg){
  nav.tab = tab; buzz();
  $all("#tabbar button").forEach(function(b){ b.classList.toggle("on", b.dataset.tab===tab); });
  document.getElementById("backBtn").hidden = !(arg && arg.back);
  document.getElementById("backBtn").onclick = arg && arg.back ? arg.back : null;
  ({trips:renderTrips, tickets:renderTickets, checkin:renderCheckin, admin:renderAdmin, profile:renderProfile}[tab]||renderTrips)(arg);
  window.scrollTo(0,0);
}
$all("#tabbar button").forEach(function(b){ b.addEventListener("click", function(){ go(b.dataset.tab); hideMain(); }); });
document.getElementById("bellBtn").addEventListener("click", function(){
  document.getElementById("bellDot").hidden = true;
  var h = "<h2 class='page'>Notices</h2><p class='sub'>Booking, payment and trip updates.</p>";
  h += notices.length ? notices.map(function(n){ return "<div class='notice'>"+esc(n.text)+"<div class='t'>"+
    new Date(n.t).toLocaleString()+"</div></div>"; }).join("") : "<div class='empty'><b>Nothing yet</b>Book a trip and updates appear here.</div>";
  sheet(h + "<button class='btn ghost' data-close style='margin-top:8px'>Close</button>");
});
/* Inline cover illustrations (no network needed): valley waterfall, campfire dusk,
   snowy peaks, and a generic ridge for organiser-created trips. */
var SCENES = {
sukok: '<svg class="art" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"><circle cx="308" cy="34" r="17" fill="#ffe9a8" opacity=".95"/><path d="M0 96 70 44 130 82 200 30 270 78 330 48 400 92V140H0Z" fill="#ffffff" opacity=".16"/><path d="M0 112 90 66 170 100 260 58 340 92 400 74V140H0Z" fill="#0e2a20" opacity=".55"/><rect x="246" y="52" width="11" height="66" rx="5" fill="#ffffff" opacity=".8"/><ellipse cx="251" cy="122" rx="26" ry="7" fill="#ffffff" opacity=".35"/><path d="M52 128l12-26 12 26Z M74 130l10-21 10 21Z M322 126l13-28 13 28Z" fill="#123527"/><path d="M0 132 120 118 240 130 400 122V140H0Z" fill="#0a2018" opacity=".7"/></svg>',
campfire: '<svg class="art" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"><circle cx="52" cy="30" r="2" fill="#ffffff" opacity=".9"/><circle cx="110" cy="18" r="1.6" fill="#ffffff" opacity=".8"/><circle cx="200" cy="26" r="2" fill="#ffffff" opacity=".9"/><circle cx="300" cy="20" r="1.6" fill="#ffffff" opacity=".8"/><circle cx="360" cy="44" r="2" fill="#ffffff" opacity=".9"/><circle cx="322" cy="58" r="15" fill="#ffd98a" opacity=".95"/><path d="M0 100 110 62 220 96 320 66 400 94V140H0Z" fill="#241a18" opacity=".8"/><path d="M150 118 200 62 250 118Z" fill="#33231f"/><path d="M188 118 200 92 212 118Z" fill="#120d0c"/><ellipse cx="200" cy="122" rx="30" ry="9" fill="#ff9a3c" opacity=".45"/><path d="M200 122c-7-8-6-16 0-24 6 8 7 16 0 24Z" fill="#ff7b2e"/><path d="M200 122c-3.5-4-3-8.5 0-12.5 3 4 3.5 8.5 0 12.5Z" fill="#ffd23e"/><path d="M176 126l48-8M176 118l48 8" stroke="#4a332c" stroke-width="4" stroke-linecap="round"/></svg>',
chimgan: '<svg class="art" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"><circle cx="72" cy="32" r="13" fill="#f2f6fa" opacity=".95"/><path d="M0 110 80 40 150 92 230 24 310 90 400 50V140H0Z" fill="#33414f"/><path d="M80 40l22 28-14 6-12-8-12 8-14-6Z" fill="#eef3f7"/><path d="M230 24l26 32-16 7-14-9-13 9-15-7Z" fill="#eef3f7"/><circle cx="150" cy="40" r="1.8" fill="#ffffff" opacity=".9"/><circle cx="210" cy="66" r="1.8" fill="#ffffff" opacity=".9"/><circle cx="280" cy="40" r="1.8" fill="#ffffff" opacity=".9"/><circle cx="340" cy="70" r="1.8" fill="#ffffff" opacity=".9"/><circle cx="120" cy="70" r="1.8" fill="#ffffff" opacity=".9"/><path d="M0 128 140 112 280 126 400 116V140H0Z" fill="#dfe9f0" opacity=".9"/></svg>',
custom: '<svg class="art" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"><circle cx="320" cy="36" r="16" fill="#ffe9a8" opacity=".9"/><path d="M0 104 90 52 180 94 270 48 350 88 400 72V140H0Z" fill="#ffffff" opacity=".15"/><path d="M0 122 120 84 230 112 330 88 400 104V140H0Z" fill="#10241c" opacity=".65"/></svg>'
};
function artFor(theme){ return SCENES[theme] || SCENES.custom; }
/* ---------- trips home ---------- */
var q = {text:"", diff:"All"};
function renderTrips(){
  var v = document.getElementById("view");
  var h = "<h2 class='page'>Weekend trips</h2><p class='sub'>Live seats · friends sit together · e-ticket in Telegram</p>";
  h += "<div class='searchbar'><input id='fq' placeholder='Search trips' value='"+esc(q.text)+"'></div>";
  h += "<div class='chips'>" + ["All","Easy","Medium","Hard"].map(function(d){
    return "<button class='chip"+(q.diff===d?" on":"")+"' data-d='"+d+"'>"+d+"</button>"; }).join("") + "</div>";
  h += "<div class='list' id='tripList'></div>";
  v.innerHTML = h;
  var draw = function(){
    var list = trips.filter(function(t){
      return (q.diff==="All"||t.diff===q.diff) && (!q.text || (t.title+t.desc).toLowerCase().indexOf(q.text.toLowerCase())>=0);
    });
    document.getElementById("tripList").innerHTML = list.length ? list.map(tripCard).join("") :
      "<div class='empty'><b>No trips match</b>Try another search or difficulty.</div>";
    $all(".trip").forEach(function(el){ el.addEventListener("click", function(){ renderDetail(el.dataset.id); }); });
  };
  document.getElementById("fq").addEventListener("input", function(e){ q.text=e.target.value; draw(); });
  $all(".chip").forEach(function(c){ c.addEventListener("click", function(){ q.diff=c.dataset.d; buzz(); renderTrips(); }); });
  draw();
}
function tripCard(t){
  var l = left(t), pct = Math.round(100*(t.cap-l)/t.cap);
  var badge = !t.open ? "<span class='pill grey'>Closed</span>" : l<=0 ? "<span class='pill red'>Sold out</span>" :
    l<=6 ? "<span class='pill amber'>"+l+" left</span>" : "<span class='pill green'>"+l+" left</span>";
  return "<article class='card trip' data-id='"+t.id+"'><div class='cover "+(t.theme||"custom")+"'>"+artFor(t.theme||"custom")+
    "<div class='cap'><div class='t'>"+esc(t.title)+"</div><div class='d'>"+esc(t.date)+"</div></div></div>"+
    "<div class='tripbody'><div class='tripmeta'>"+badge+"<span class='pill grey'>"+esc(t.diff)+"</span></div>"+
    "<div class='seatline'><span class='seats"+(l<=6?" low":"")+"'>"+l+"</span><span class='per'>seats left · "+money(t.price)+"</span></div>"+
    "<div class='bar'><i class='"+(l<=6?"hot":"")+"' style='width:"+pct+"%'></i></div></div></article>";
}
/* ---------- trip detail ---------- */
function renderDetail(id){
  var t = trip(id); if(!t) return go("trips");
  var l = left(t), fb = feedback.filter(function(f){return f.trip===id;});
  var avg = fb.length ? (fb.reduce(function(n,f){return n+f.rating;},0)/fb.length).toFixed(1) : "New";
  var v = document.getElementById("view");
  v.innerHTML =
    "<div class='hero'><div class='cover "+(t.theme||"custom")+"'>"+artFor(t.theme||"custom")+"<div class='cap'><div class='t'>"+esc(t.title)+
    "</div><div class='d'>"+esc(t.date)+" → "+esc(t.back||"")+"</div></div></div>"+
    "<div class='detail card' style='border-radius:0'><dl class='kv'>"+
    "<dt>Meeting</dt><dd>"+esc(t.meet)+"</dd><dt>Difficulty</dt><dd>"+esc(t.diff)+"</dd>"+
    "<dt>Includes</dt><dd>"+esc(t.includes)+"</dd><dt>Rating</dt><dd>"+stars(Math.round(parseFloat(avg)||0))+" "+avg+" ("+fb.length+")</dd></dl>"+
    "<p class='small'>"+esc(t.desc||"")+"</p>"+
    "<div class='pricebox'><div class='price'><b>"+money(t.price)+"</b><span>per seat · one price for everyone</span></div></div>"+
    "<div class='seatline'><span class='seats"+(l<=6?" low":"")+"'>"+l+" / "+t.cap+"</span><span class='per'>seats left</span></div>"+
    "<div class='bar'><i class='"+(l<=6?"hot":"")+"' style='width:"+Math.round(100*(t.cap-l)/t.cap)+"%'></i></div>"+
    (fb.length ? "<div class='sec'>Traveller reviews</div>"+fb.map(function(f){
      return "<div class='review'>"+stars(f.rating)+" <b>"+esc(f.name)+"</b><div class='small'>"+esc(f.text)+"</div></div>"; }).join("") : "")+
    "</div></div>"+
    "<div class='stickycta'><button class='btn' id='bookNow' "+((!t.open||l<=0)?"disabled":"")+">"+(!t.open?"Trip closed":l<=0?"Sold out":"Book seats")+"</button></div>";
  document.getElementById("backBtn").hidden = false;
  document.getElementById("backBtn").onclick = function(){ go("trips"); };
  var bn = document.getElementById("bookNow");
  if(bn) bn.addEventListener("click", function(){ startBooking(t); });
  mainBtn("Book seats", function(){ startBooking(t); });
}
/* ---------- booking: seats -> travellers -> review ---------- */
var draft = null;
function startBooking(t){
  if(!t.open || left(t)<=0){ toast("This trip is not bookable."); return; }
  draft = {tripId:t.id, seats:[], trav:[], step:1};
  bookingSheet();
}
function bookingSheet(){
  var t = trip(draft.tripId), maxSel = Math.min(5, left(t));
  var taken = {};
  bookings.filter(function(b){return b.tripId===t.id && b.status!=="cancelled";}).forEach(function(b){
    (b.seats||[]).forEach(function(s){ taken[s]=1; }); });
  var h = "<h2 class='page' style='font-size:20px'>Book · "+esc(t.title)+"</h2>";
  h += "<div class='steps'><i class='"+(draft.step>=1?"done":"")+"'></i><i class='"+(draft.step>=2?"done":"")+"'></i><i class='"+(draft.step>=3?"done":"")+"'></i></div>";
  if(draft.step===1){
    h += "<p class='sub'>Pick up to "+maxSel+" seats in one vehicle — friends stay together.</p><div class='bus'><div class='wheel'>SPRINTER · "+esc(VEH.plate)+"</div><div class='seatgrid'>";
    for(var s=1;s<=VEH.seats;s++){
      var cls = taken[s] ? "taken" : (draft.seats.indexOf(s)>=0?"sel":"");
      h += "<button class='seat "+cls+"' data-s='"+s+"' "+(taken[s]?"disabled":"")+">"+s+"</button>";
    }
    h += "</div></div><button class='btn' id='sNext' "+(draft.seats.length?"":"disabled")+">Continue ("+draft.seats.length+" seat"+(draft.seats.length===1?"":"s")+")</button>";
  } else if(draft.step===2){
    h += "<p class='sub'>Name every traveller — one health line each, age 18+.</p>";
    draft.seats.forEach(function(s,i){
      var old = draft.trav[i]||{};
      h += "<div class='field'><label>Seat "+s+" — full name</label><input data-n='"+i+"' value='"+esc(old.name||"")+"' placeholder='Name Surname'></div>"+
        "<div class='field'><label>Health (allergies / conditions / none)</label><input data-h='"+i+"' value='"+esc(old.health||"")+"' placeholder='none'></div>"+
        "<div class='field'><label>Age</label><input data-a='"+i+"' type='number' min='1' max='99' value='"+esc(old.age||20)+"'></div>";
    });
    h += "<div class='row'><button class='btn ghost sm' id='sBack'>Back</button><button class='btn grow' id='sNext'>Review</button></div>";
  } else {
    var unit = t.price;
    h += "<p class='sub'>Check everything before payment.</p><div class='card' style='padding:12px'>";
    h += "<div class='row'><b class='grow'>"+esc(t.title)+"</b><span class='pill green'>"+money(unit*draft.seats.length)+"</span></div>";
    h += "<div class='small muted'>"+esc(t.date)+" · seats "+draft.seats.slice().sort(function(a,b){return a-b;}).join(", ")+"</div><div class='perf'></div>";
    h += draft.trav.map(function(x,i){ return "<div class='small'>Seat "+draft.seats[i]+" — <b>"+esc(x.name)+"</b> · "+x.age+" y/o · "+esc(x.health)+"</div>"; }).join("");
    h += "</div><div class='row' style='margin-top:10px'><button class='btn ghost sm' id='sBack'>Back</button><button class='btn grow' id='sPay'>Pay "+money(unit*draft.seats.length)+"</button></div>";
  }
  sheet(h);
  var nx = document.getElementById("sNext");
  $all(".seat").forEach(function(el){ el.addEventListener("click", function(){
    var s = +el.dataset.s, ix = draft.seats.indexOf(s);
    if(ix>=0) draft.seats.splice(ix,1);
    else { if(draft.seats.length>=maxSel){ toast("Max "+maxSel+" seats per booking."); return; } draft.seats.push(s); }
    buzz(); bookingSheet();
  });});
  if(nx && draft.step===1) nx.addEventListener("click", function(){ draft.step=2; bookingSheet(); });
  if(nx && draft.step===2) nx.addEventListener("click", function(){
    var names = $all("[data-n]").map(function(i){return i.value.trim();});
    var hl = $all("[data-h]").map(function(i){return i.value.trim()||"none";});
    var ag = $all("[data-a]").map(function(i){return parseInt(i.value,10);});
    if(names.some(function(x){return !x;})){ toast("Name every traveller."); return; }
    if(ag.some(function(a){return !(a>=18);})){ toast("Minimum age is 18."); return; }
    draft.trav = names.map(function(nm,i){return {name:nm, health:hl[i], age:ag[i]};});
    draft.step = 3; bookingSheet();
  });
  var bk = document.getElementById("sBack");
  if(bk) bk.addEventListener("click", function(){ draft.step--; bookingSheet(); });
  var pay = document.getElementById("sPay");
  if(pay) pay.addEventListener("click", function(){ paySheet(); });
}
/* ---------- payment ---------- */
function paySheet(){
  var t = trip(draft.tripId), unit = t.price;
  var total = unit*draft.seats.length;
  var h = "<h2 class='page' style='font-size:20px'>Payment · "+money(total)+"</h2>"+
    "<p class='sub'>Test payments — no real money moves. Card transfer goes to organiser confirmation.</p>"+
    "<div class='list'>"+
    "<button class='btn' data-p='Click'>Pay with Click</button>"+
    "<button class='btn' data-p='Payme'>Pay with Payme</button>"+
    "<button class='btn ghost' data-p='transfer'>Paid by card transfer — request confirmation</button></div>";
  sheet(h);
  $all("[data-p]").forEach(function(b){ b.addEventListener("click", function(){ settle(b.dataset.p); }); });
}
function settle(provider){
  var t = trip(draft.tripId), unit = t.price;
  var b = {id:uid("BK"), tripId:t.id, title:t.title, date:t.date, trav:draft.trav,
    seats:draft.seats.slice(), amount:unit*draft.seats.length,
    status: provider==="transfer" ? "pending" : "paid",
    provider:provider, txn:uid("TXN"), idem:uid("IDEM"),
    created:Date.now(), uid:(me.username||me.first_name||"guest")};
  bookings.push(b); persist();
  pushNotice("Booking "+b.id+" · "+b.status+" via "+provider+" · "+money(b.amount));
  try{ tg && tg.sendData && tg.sendData(JSON.stringify({event:"payment", booking:b.id, status:b.status})); }catch(e){}
  draft = null; closeSheet();
  toast(provider==="transfer" ? "Transfer sent — organiser will confirm." : "Payment confirmed — e-ticket issued.");
  go("tickets");
}
/* ---------- tickets ---------- */
function renderTickets(){
  var v = document.getElementById("view"), mine = myBookings().slice().reverse();
  var h = "<h2 class='page'>My tickets</h2><p class='sub'>Holds, payments and e-tickets on this device.</p>";
  if(!mine.length){ h += "<div class='empty'><b>No bookings yet</b>Find a trip and book seats with friends.</div>"; }
  h += "<div class='list'>" + mine.map(ticketCard).join("") + "</div>";
  v.innerHTML = h;
  $all("[data-cancel]").forEach(function(b){ b.addEventListener("click", function(){
    var bk = bookings.filter(function(x){return x.id===b.dataset.cancel;})[0];
    sheet("<h2 class='page' style='font-size:20px'>Cancel "+esc(bk.id)+"</h2>"+
      "<p class='sub'>Organiser-initiated changes are refunded in full; your own cancellation follows the trip rules — refunds on request.</p>"+
      "<div class='row'><button class='btn ghost sm' data-close>Keep</button><button class='btn danger grow' id='cfYes'>Cancel booking</button></div>");
    document.getElementById("cfYes").addEventListener("click", function(){
      bk.status = "cancelled"; bk.refund = bk.status==="paid"||bk.provider ? "ordered" : "n/a"; persist();
      pushNotice("Booking "+bk.id+" cancelled. Refund "+bk.refund+".");
      closeSheet(); renderTickets(); toast("Booking cancelled.");
    });
  });});
  $all("[data-fb]").forEach(function(b){ b.addEventListener("click", function(){ fbSheet(b.dataset.fb); }); });
}
function ticketCard(b){
  var pill = b.status==="paid" ? "<span class='pill green'>Paid</span>" :
    b.status==="pending" ? "<span class='pill amber'>Awaiting confirmation</span>" :
    b.status==="moved" ? "<span class='pill amber'>Moved — new date</span>" :
    b.status==="cancelled" ? "<span class='pill grey'>Cancelled</span>" : "<span class='pill grey'>"+esc(b.status)+"</span>";
  var h = "<div class='ticket'><div class='stub'><div><b>"+esc(b.id)+"</b><div class='small' style='opacity:.8'>"+esc(b.title)+" · "+esc(b.date)+"</div></div>"+pill+"</div>";
  h += "<div class='body'><div class='row'><div class='qr'>"+esc(b.id.slice(-5))+"</div><div class='grow'>";
  h += b.trav.map(function(x,i){ return "<div class='small'>Seat "+esc((b.seats&&b.seats[i])||"—")+" — <b>"+esc(x.name)+"</b></div>"; }).join("");
  h += "<div class='small muted'>"+money(b.amount)+" · "+esc(b.provider||"")+" · "+esc(b.txn||"")+"</div></div></div>";
  if(b.status==="paid"||b.status==="moved")
    h += "<div class='row' style='margin-top:10px'><button class='btn ghost sm' data-cancel='"+b.id+"'>Cancel</button><button class='btn sm grow' data-fb='"+b.id+"'>Rate trip</button></div>";
  h += "</div></div>";
  return h;
}
/* ---------- feedback ---------- */
function fbSheet(bid){
  var bk = bookings.filter(function(x){return x.id===bid;})[0];
  sheet("<h2 class='page' style='font-size:20px'>Rate · "+esc(bk.title)+"</h2>"+
    "<div class='field'><label>Rating</label><select id='fRate'><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div>"+
    "<div class='field'><label>Comment</label><textarea id='fText' rows='3' placeholder='What was good, what to fix?'></textarea></div>"+
    "<button class='btn' id='fSend'>Send feedback</button>");
  document.getElementById("fSend").addEventListener("click", function(){
    var tx = document.getElementById("fText").value.trim();
    if(!tx){ toast("Write one line — it goes to the organiser."); return; }
    feedback.unshift({trip:bk.tripId, name:(me.first_name||"Guest"), rating:+document.getElementById("fRate").value, text:tx});
    persist(); closeSheet(); toast("Thanks — feedback recorded.");
  });
}
/* ---------- admin ---------- */
var admTab = "dash";
function renderAdmin(){
  var v = document.getElementById("view");
  var paid = bookings.filter(function(b){return b.status==="paid";});
  var rev = paid.reduce(function(n,b){return n+b.amount;},0);
  var h = "<h2 class='page'>Organiser</h2><p class='sub'>One admin view — confirmations, trips, notices.</p>";
  h += "<div class='statgrid'><div class='stat'><b>"+bookings.filter(function(b){return b.status!=="cancelled";}).length+"</b><span>active bookings</span></div>"+
    "<div class='stat'><b>"+money(rev).replace(" som","")+"</b><span>som confirmed</span></div>"+
    "<div class='stat'><b>"+bookings.filter(function(b){return b.status==="pending";}).length+"</b><span>to confirm</span></div></div>";
  h += "<div class='chips'>" + [["dash","Dashboard"],["trips","Trips"],["transfers","Transfers"],["reviews","Reviews"]].map(function(t){
    return "<button class='chip"+(admTab===t[0]?" on":"")+"' data-a='"+t[0]+"'>"+t[1]+"</button>"; }).join("") + "</div><div id='admBody'></div>";
  v.innerHTML = h;
  $all("[data-a]").forEach(function(c){ c.addEventListener("click", function(){ admTab=c.dataset.a; buzz(); renderAdmin(); }); });
  var body = document.getElementById("admBody");
  if(admTab==="dash"){
    body.innerHTML = "<div class='sec'>Trips</div><div class='list'>" + trips.map(function(t){
      var l = left(t);
      return "<div class='card' style='padding:12px'><div class='row'><b class='grow'>"+esc(t.title)+"</b>"+
        (t.open?"<span class='pill green'>Open</span>":"<span class='pill grey'>Closed</span>")+"</div>"+
        "<div class='small muted'>"+esc(t.date)+" · "+l+" / "+t.cap+" seats left</div>"+
        "<div class='row' style='margin-top:8px'><button class='btn ghost sm' data-ed='"+t.id+"'>Edit</button>"+
        "<button class='btn ghost sm grow' data-pc='"+t.id+"'>Postpone / cancel</button></div></div>";
    }).join("") + "</div><button class='btn' id='newTrip' style='margin-top:10px'>New trip</button>";
    document.getElementById("newTrip").addEventListener("click", function(){ tripForm(null); });
    $all("[data-ed]").forEach(function(b){ b.addEventListener("click", function(){ tripForm(b.dataset.ed); }); });
    $all("[data-pc]").forEach(function(b){ b.addEventListener("click", function(){ pcSheet(b.dataset.pc); }); });
  } else if(admTab==="trips"){
    body.innerHTML = "<div class='list'>" + trips.map(function(t){
      return "<div class='card' style='padding:12px'><div class='row'><b class='grow'>"+esc(t.title)+"</b>"+
        "<button class='btn ghost sm' data-ed='"+t.id+"'>Edit</button></div>"+
        "<div class='small muted'>"+esc(t.date)+" · "+money(t.price)+"</div></div>";
    }).join("") + "</div><button class='btn' id='newTrip2' style='margin-top:10px'>New trip</button>";
    document.getElementById("newTrip2").addEventListener("click", function(){ tripForm(null); });
    $all("[data-ed]").forEach(function(b){ b.addEventListener("click", function(){ tripForm(b.dataset.ed); }); });
  } else if(admTab==="transfers"){
    var pend = bookings.filter(function(b){return b.status==="pending";});
    body.innerHTML = pend.length ? "<div class='list'>"+pend.map(function(b){
      return "<div class='card' style='padding:12px'><div class='row'><b class='grow'>"+esc(b.id)+" · "+money(b.amount)+"</b></div>"+
        "<div class='small muted'>"+esc(b.title)+" · "+b.trav.map(function(x){return esc(x.name);}).join(", ")+"</div>"+
        "<div class='row' style='margin-top:8px'><button class='btn sm grow' data-ok='"+b.id+"'>Confirm payment</button>"+
        "<button class='btn ghost sm' data-no='"+b.id+"'>Reject</button></div></div>";
    }).join("")+"</div>" : "<div class='empty'><b>Queue empty</b>Card transfers awaiting confirmation appear here.</div>";
    $all("[data-ok]").forEach(function(b){ b.addEventListener("click", function(){
      var bk = bookings.filter(function(x){return x.id===b.dataset.ok;})[0];
      bk.status="paid"; persist(); pushNotice("Booking "+bk.id+" confirmed — e-ticket sent.");
      renderAdmin(); toast("Payment confirmed.");
    });});
    $all("[data-no]").forEach(function(b){ b.addEventListener("click", function(){
      var bk = bookings.filter(function(x){return x.id===b.dataset.no;})[0];
      bk.status="cancelled"; persist(); pushNotice("Transfer for "+bk.id+" rejected — booking released.");
      renderAdmin(); toast("Transfer rejected.");
    });});
  } else {
    body.innerHTML = feedback.length ? feedback.map(function(f){
      var t = trip(f.trip);
      return "<div class='review'>"+stars(f.rating)+" <b>"+esc(f.name)+"</b> <span class='small muted'>· "+esc(t?t.title:f.trip)+"</span><div class='small'>"+esc(f.text)+"</div></div>";
    }).join("") : "<div class='empty'><b>No reviews yet</b></div>";
  }
}
function tripForm(id){
  var t = id ? trip(id) : {id:"t"+Date.now(), theme:"custom", title:"", date:"2026-12-27 08:00", back:"20:00",
    meet:"Amir Temur passage 2 (WIUT SHB)", price:250000, cap:40, pre:0, diff:"Medium", open:true, includes:"", desc:""};
  sheet("<h2 class='page' style='font-size:20px'>"+(id?"Edit trip":"New trip")+"</h2>"+
    "<div class='field'><label>Title</label><input id='tTitle' value='"+esc(t.title)+"'></div>"+
    "<div class='field'><label>Date + time</label><input id='tDate' value='"+esc(t.date)+"'></div>"+
    "<div class='field'><label>Price per seat (som) — one price for everyone</label><input id='tPrice' type='number' value='"+t.price+"'></div>"+
    "<div class='field'><label>Capacity</label><input id='tCap' type='number' value='"+t.cap+"'></div>"+
    "<div class='field'><label>Difficulty</label><select id='tDiff'><option"+(t.diff==="Easy"?" selected":"")+">Easy</option><option"+(t.diff==="Medium"?" selected":"")+">Medium</option><option"+(t.diff==="Hard"?" selected":"")+">Hard</option></select></div>"+
    "<div class='field'><label><input type='checkbox' id='tOpen' style='width:auto' "+(t.open?"checked":"")+"> Open for booking</label></div>"+
    "<button class='btn' id='tSave'>Save trip</button>");
  document.getElementById("tSave").addEventListener("click", function(){
    t.title = document.getElementById("tTitle").value.trim()||"Untitled trip";
    t.date = document.getElementById("tDate").value.trim()||t.date;
    t.price = +document.getElementById("tPrice").value||t.price;
    t.cap = +document.getElementById("tCap").value||t.cap;
    t.diff = document.getElementById("tDiff").value;
    t.open = document.getElementById("tOpen").checked;
    if(!id) trips.unshift(t);
    persist(); closeSheet(); renderAdmin(); toast("Trip saved.");
  });
}
function pcSheet(id){
  var t = trip(id);
  var aff = bookings.filter(function(b){return b.tripId===id && b.status!=="cancelled";}).length;
  sheet("<h2 class='page' style='font-size:20px'>"+esc(t.title)+"</h2>"+
    "<p class='sub'>"+aff+" active booking(s) will be notified automatically.</p>"+
    "<div class='field'><label>New date (postpone)</label><input id='pcDate' placeholder='2026-12-27 08:00'></div>"+
    "<div class='field'><label>Reason</label><input id='pcWhy' placeholder='Bad weather'></div>"+
    "<button class='btn' id='pcGo'>Postpone trip</button>"+
    "<button class='btn danger' id='pcKill' style='margin-top:8px'>Cancel trip + refund all</button>");
  document.getElementById("pcGo").addEventListener("click", function(){
    var nd = document.getElementById("pcDate").value.trim()||"(date TBC)";
    var rs = document.getElementById("pcWhy").value.trim()||"weather";
    t.date = nd; bookings.filter(function(b){return b.tripId===id&&b.status!=="cancelled";}).forEach(function(b){ b.status="moved"; });
    persist(); pushNotice("Trip "+t.title+" postponed to "+nd+" ("+rs+"). Tickets moved; full refund on request.");
    closeSheet(); renderAdmin(); toast("Postponed — "+aff+" booking(s) notified.");
  });
  document.getElementById("pcKill").addEventListener("click", function(){
    bookings.filter(function(b){return b.tripId===id&&b.status!=="cancelled";}).forEach(function(b){ b.status="cancelled"; b.refund="ordered"; });
    t.open = false; persist();
    pushNotice("Trip "+t.title+" cancelled. Refund orders raised for every paid booking.");
    closeSheet(); renderAdmin(); toast("Cancelled with full refunds.");
  });
}
/* ---------- check-in ---------- */
var ckTrip = null, ckQ = "";
function renderCheckin(){
  var v = document.getElementById("view");
  if(!ckTrip) ckTrip = (trips[0]||{}).id;
  var t = trip(ckTrip), paid = bookings.filter(function(b){return b.tripId===ckTrip && (b.status==="paid"||b.status==="moved");});
  var h = "<h2 class='page'>Check-in</h2><p class='sub'>Manifest stays on the phone — works with no signal.</p>";
  h += "<div class='chips'>" + trips.map(function(x){
    return "<button class='chip"+(ckTrip===x.id?" on":"")+"' data-t='"+x.id+"'>"+esc(x.title.split(" ")[0])+"</button>"; }).join("") + "</div>";
  h += "<div class='searchbar'><input id='ckQ' placeholder='Search traveller' value='"+esc(ckQ)+"'></div><div id='ckList'></div>";
  v.innerHTML = h;
  $all("[data-t]").forEach(function(c){ c.addEventListener("click", function(){ ckTrip=c.dataset.t; ckQ=""; buzz(); renderCheckin(); }); });
  var drawCk = function(){
    var box = document.getElementById("ckList"); if(!paid.length){ box.innerHTML = "<div class='empty'><b>Nobody to check in</b>No paid bookings for this trip.</div>"; return; }
    var done = 0, rows = "";
    paid.forEach(function(b){ b.trav.forEach(function(x,i){
      if(ckQ && (x.name+" "+b.id).toLowerCase().indexOf(ckQ.toLowerCase())<0) return;
      var key = "ck2_"+b.id+"_"+i, on = localStorage.getItem(key)==="1";
      if(on) done++;
      rows += "<div class='checkrow"+(on?" done":"")+"' data-k='"+key+"'><span class='box'>"+(on?"✓":"")+"</span>"+
        "<span class='grow nm'><b>"+esc(x.name)+"</b><div class='small muted'>"+esc(b.id)+(x.health&&x.health!=="none"?" · ⚕ "+esc(x.health):"")+"</div></span></div>";
    });});
    box.innerHTML = "<p class='sub'>"+done+" checked in · offline queue kept on device</p>" + (rows||"<div class='empty'><b>No match</b></div>");
    $all(".checkrow").forEach(function(r){ r.addEventListener("click", function(){
      var k = r.dataset.k, on = localStorage.getItem(k)==="1";
      localStorage.setItem(k, on?"0":"1"); buzz(); drawCk();
    });});
  };
  document.getElementById("ckQ").addEventListener("input", function(e){ ckQ=e.target.value; drawCk(); });
  drawCk();
}
/* ---------- profile ---------- */
function renderProfile(){
  var v = document.getElementById("view"), mine = myBookings();
  var spent = mine.filter(function(b){return b.status==="paid";}).reduce(function(n,b){return n+b.amount;},0);
  v.innerHTML = "<h2 class='page'>"+esc(me.first_name||"Guest")+"</h2>"+
    "<p class='sub'>"+(me.username?"@"+esc(me.username):"")+(isMock?" · preview mode":"")+"</p>"+
    "<div class='statgrid'><div class='stat'><b>"+mine.filter(function(b){return b.status!=="cancelled";}).length+"</b><span>trips booked</span></div>"+
    "<div class='stat'><b>"+money(spent).replace(" som","")+"</b><span>som spent</span></div>"+
    "<div class='stat'><b>"+feedback.filter(function(f){return f.name===(me.first_name||"Guest");}).length+"</b><span>reviews</span></div></div>"+
    "<div class='sec'>About this app</div>"+
    "<div class='card' style='padding:12px'><div class='small'>Official Ikat Events bookings: live seats, group booking in one vehicle, Click / Payme or card transfer, e-tickets, instant trip updates, and an offline check-in manifest. Your bookings stay on this device.</div></div>"+
    "<div class='sec'>Settings</div>"+
    "<button class='btn ghost' id='wipe'>Erase local data</button>";
  document.getElementById("wipe").addEventListener("click", function(){
    Object.keys(localStorage).filter(function(k){return k.indexOf("itms2_")===0||k.indexOf("ck2_")===0;}).forEach(function(k){localStorage.removeItem(k);});
    location.reload();
  });
}
/* ---------- init ---------- */
initTG(); persist(); go("trips"); hideMain();
})();
