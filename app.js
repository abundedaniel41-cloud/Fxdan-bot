// ILEM V3 - public market-data demo. No account credentials or trade execution.
const APP_ID = "1089"; // Deriv public demo app id; replace with your own registered app id if required.
const $ = id => document.getElementById(id);
const state = {ws:null, ticks:[], count:0, symbol:"1HZ1000V", last:null, lastSignal:"", history:[], candleTimer:null};
const symbols = {BOOM1000:"Boom 1000",CRASH1000:"Crash 1000","1HZ1000V":"Volatility 1000 (1s)"};
function setStatus(ok,msg){$("statusDot").style.background=ok?"#4ce0a2":"#f3c66b";$("connectionText").textContent=msg;$("feedState").textContent=ok?"LIVE":"WAITING";}
function connect(){
  if(state.ws){try{state.ws.close()}catch(e){}}
  setStatus(false,"Connecting");
  const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`); state.ws=ws;
  ws.onopen=()=>{setStatus(true,"Connected");ws.send(JSON.stringify({ticks:state.symbol,subscribe:1}));};
  ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.error){setStatus(false,"Feed error");$("signalReason").textContent=d.error.message;return;}if(d.tick){const q=Number(d.tick.quote);if(!Number.isFinite(q))return;state.count++;state.last=q;state.ticks.push({p:q,t:d.tick.epoch*1000});if(state.ticks.length>500)state.ticks.shift();$("price").textContent=q.toFixed(d.tick.pip_size??2);$("quoteTime").textContent="Updated "+new Date(d.tick.epoch*1000).toLocaleTimeString();$("ticksCount").textContent=state.count+" ticks";if(state.ticks.length>1){const prev=state.ticks[state.ticks.length-2].p;const diff=q-prev;$("lastMove").textContent=(diff>=0?"+":"")+diff.toFixed(2);$("lastMove").style.color=diff>=0?"#4ce0a2":"#ff6b78";}draw();evaluate();}};
  ws.onclose=()=>{setStatus(false,"Disconnected");};ws.onerror=()=>setStatus(false,"Connection issue");
}
function draw(){const c=$("spark"),ctx=c.getContext("2d"),w=c.clientWidth,h=110,dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);const a=state.ticks.slice(-90).map(x=>x.p);if(a.length<2)return;const min=Math.min(...a),max=Math.max(...a),range=max-min||1;ctx.beginPath();a.forEach((v,i)=>{const x=i/(a.length-1)*w,y=h-8-(v-min)/range*(h-16);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle="#4ce0a2";ctx.lineWidth=2;ctx.stroke();}
function evaluate(){
 // Signal rules are deliberately conservative: 5-minute tick window, short/long mean trend,
 // and recent momentum confirmation. Tick aggregation is approximate, not exchange candles.
 const a=state.ticks;if(a.length<80){$("signalReason").textContent=`Collecting history: ${a.length}/80 ticks required.`;return;}
 const prices=a.slice(-60).map(x=>x.p), short=mean(prices.slice(-10)), long=mean(prices.slice(-40));
 const momentum=prices[prices.length-1]-prices[prices.length-6], volatility=Math.max(...prices.slice(-20))-Math.min(...prices.slice(-20));
 const up=short>long&&momentum>0, down=short<long&&momentum<0;
 $("trendRule").textContent=short>long?"Upward":short<long?"Downward":"Flat";
 $("momentumRule").textContent=momentum>0?"Positive":momentum<0?"Negative":"Flat";
 $("confirmRule").textContent=(up||down)?"Aligned":"Not aligned";
 let dir=up?"BUY":down?"SELL":"WAIT";
 if(dir==="WAIT"){setSignal("WAIT","No confirmed direction. Wait for trend and momentum to align.");return;}
 if(dir===state.lastSignal)return;
 state.lastSignal=dir;const entry=state.last,buffer=Math.max(volatility*.7,Math.abs(entry)*0.00015),sl=dir==="BUY"?entry-buffer:entry+buffer,tp=dir==="BUY"?entry+buffer*1.5:entry-buffer*1.5;
 setSignal(dir,`Trend and short-term momentum align. This is an experimental alert, not a verified M5 candle strategy.`,entry,sl,tp);
 const item={dir,price:entry,time:new Date().toLocaleTimeString()};state.history.unshift(item);state.history=state.history.slice(0,12);renderHistory();
}
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length}
function setSignal(dir,reason,entry,sl,tp){$("signalWord").textContent=dir;$("signalWord").style.color=dir==="BUY"?"#4ce0a2":dir==="SELL"?"#ff6b78":"#aebdca";$("signalPill").textContent=dir==="WAIT"?"NO SETUP":dir+" ALERT";$("signalPill").className="pill "+(dir==="WAIT"?"neutral":"");$("signalReason").textContent=reason;$("entry").textContent=entry?entry.toFixed(2):"—";$("stop").textContent=sl?sl.toFixed(2):"—";$("target").textContent=tp?tp.toFixed(2):"—";}
function renderHistory(){$("history").innerHTML=state.history.length?state.history.map(x=>`<div class="item"><span class="${x.dir.toLowerCase()}">${x.dir}</span><span>${x.price.toFixed(2)}</span><span class="muted">${x.time}</span></div>`).join(""):'<p class="muted">No signals recorded yet.</p>';}
$("market").addEventListener("change",e=>{state.symbol=e.target.value;state.ticks=[];state.count=0;state.lastSignal="";$("price").textContent="—";$("ticksCount").textContent="0 ticks";setSignal("WAIT","Switching market and collecting fresh data.");connect();});
$("refreshBtn").addEventListener("click",connect);$("clearHistory").addEventListener("click",()=>{state.history=[];renderHistory();});
window.addEventListener("resize",draw);if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));connect();
