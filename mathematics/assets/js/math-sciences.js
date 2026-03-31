// ===== ライフゲーム =====
(function() {
  const container = document.getElementById('life-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const startBtn = document.getElementById('life-start-btn');
  const stepBtn = document.getElementById('life-step-btn');
  const resetBtn = document.getElementById('life-reset-btn');
  const genSpan = document.getElementById('life-gen');

  const CELL = 12;
  let COLS, ROWS, grid, gen = 0, running = false, animId;

  function init() {
    const W = container.offsetWidth;
    const H = container.offsetHeight;
    COLS = Math.floor(W / CELL);
    ROWS = Math.floor(H / CELL);
    grid = Array.from({length:ROWS}, () => Array.from({length:COLS}, () => Math.random() < 0.3 ? 1 : 0));
    gen = 0;
    genSpan.textContent = '世代: 0';
    draw();
  }

  function step() {
    const next = Array.from({length:ROWS}, (_,r) => Array.from({length:COLS}, (_,c) => {
      let n = 0;
      for (let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
        if(dr===0&&dc===0) continue;
        const nr=(r+dr+ROWS)%ROWS, nc=(c+dc+COLS)%COLS;
        n += grid[nr][nc];
      }
      const alive = grid[r][c];
      return (alive && (n===2||n===3)) || (!alive && n===3) ? 1 : 0;
    }));
    grid = next;
    gen++;
    genSpan.textContent = `世代: ${gen}`;
    draw();
  }

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    if (!grid) return;
    grid.forEach((row,r) => row.forEach((cell,c) => {
      if(cell) {
        ctx.fillStyle = 'rgba(245,200,66,0.8)';
        ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
      }
    }));
    // グリッド線
    ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=0.5;
    for(let i=0;i<=COLS;i++){ctx.beginPath();ctx.moveTo(i*CELL,0);ctx.lineTo(i*CELL,H);ctx.stroke();}
    for(let i=0;i<=ROWS;i++){ctx.beginPath();ctx.moveTo(0,i*CELL);ctx.lineTo(W,i*CELL);ctx.stroke();}
  }

  function loop() { step(); animId = requestAnimationFrame(loop); }

  startBtn.addEventListener('click', () => {
    running = !running;
    startBtn.textContent = running ? '⏸ 停止' : '▶ 開始';
    if (running) loop(); else cancelAnimationFrame(animId);
  });
  stepBtn.addEventListener('click', () => { if(!running) step(); });
  resetBtn.addEventListener('click', () => { if(running){running=false;startBtn.textContent='▶ 開始';cancelAnimationFrame(animId);} init(); });
  init();
  window.addEventListener('resize', init);
})();

// ===== ゲーム理論 =====
(function() {
  const table = document.getElementById('payoff-table');
  const nashInfo = document.getElementById('nash-info');
  const rSlider = document.getElementById('gt-r');
  const tSlider = document.getElementById('gt-t');
  const rVal = document.getElementById('gt-r-val');
  const tVal = document.getElementById('gt-t-val');

  function render() {
    const R = parseFloat(rSlider.value); // 相互協調
    const T = parseFloat(tSlider.value); // 裏切り利得
    const P = 1; // 相互裏切り
    const S = 0; // 吸い取られ損失
    // 行=プレイヤーA (協調/裏切り), 列=プレイヤーB
    const payoffs = [
      [R,R, S,T],
      [T,S, P,P],
    ];
    // ナッシュ均衡検索: 列固定でAが最大, 行固定でBが最大
    const isNash = (r,c) => {
      const aAtCol = [payoffs[0][c*2], payoffs[1][c*2]]; // Bをc固定でAの利得
      const bAtRow = [payoffs[r][1], payoffs[r][3]]; // Aをr固定でBの利得
      return payoffs[r][c*2] >= Math.max(...aAtCol) && payoffs[r][1+c*2] >= Math.max(...bAtRow);
    };

    const labels = ['協調','裏切り'];
    let html = '<tr><th></th><th>B: 協調</th><th>B: 裏切り</th></tr>';
    for(let r=0;r<2;r++){
      html += `<tr><th>A: ${labels[r]}</th>`;
      for(let c=0;c<2;c++){
        const nash = isNash(r,c);
        html += `<td class="${nash?'nash':''}">(${payoffs[r][c*2]}, ${payoffs[r][1+c*2]})</td>`;
      }
      html += '</tr>';
    }
    table.innerHTML = html;

    const R0 = R;
    if (T > R0 && P > S) {
      nashInfo.innerHTML = `ナッシュ均衡: <span style="color:#86efac">(裏切り, 裏切り) = (${P}, ${P})</span><br>T=${T}>R=${R0}>P=${P}>S=${S} → 囚人のジレンマの条件成立`;
    } else {
      nashInfo.textContent = 'パラメータを変更してください';
    }
  }

  rSlider.addEventListener('input', ()=>{ rVal.textContent=rSlider.value; render(); });
  tSlider.addEventListener('input', ()=>{ tVal.textContent=tSlider.value; render(); });
  render();
})();

// ===== SIRモデル =====
(function() {
  const container = document.getElementById('sir-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const betaSlider=document.getElementById('sir-beta');
  const gammaSlider=document.getElementById('sir-gamma');
  const betaVal=document.getElementById('sir-beta-val');
  const gammaVal=document.getElementById('sir-gamma-val');

  function draw() {
    const W=canvas.width=container.offsetWidth;
    const H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    const β=parseFloat(betaSlider.value), γ=parseFloat(gammaSlider.value);
    const N=1000, dt=0.5, steps=300;
    let S=N-1, I=1, R=0;
    const tS=[S/N], tI=[I/N], tR=[R/N];

    for(let i=0;i<steps;i++){
      const dS=-β*S*I/N, dI=β*S*I/N-γ*I, dR=γ*I;
      S+=dS*dt; I+=dI*dt; R+=dR*dt;
      tS.push(S/N); tI.push(I/N); tR.push(R/N);
    }

    const pad=35;
    function sx(i){return pad+i/(steps)*( W-2*pad);}
    function sy(v){return (H-pad)-(v*(H-2*pad));}

    // グリッド
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [0,0.25,0.5,0.75,1].forEach(v=>{
      ctx.beginPath(); ctx.moveTo(pad,sy(v)); ctx.lineTo(W-pad,sy(v)); ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad,sy(0)); ctx.lineTo(W-pad,sy(0)); ctx.stroke();

    // S,I,R 曲線
    [[tS,'#4ab8d8','S (感受性)'],[tI,'#f8706c','I (感染中)'],[tR,'#6dcc98','R (回復済)']].forEach(([data,color,label])=>{
      ctx.beginPath();
      data.forEach((v,i)=>{
        const s={x:sx(i),y:sy(v)};
        if(i===0) ctx.moveTo(s.x,s.y); else ctx.lineTo(s.x,s.y);
      });
      ctx.strokeStyle=color; ctx.lineWidth=2; ctx.stroke();
    });

    // 凡例
    ctx.font='10px monospace'; ctx.textAlign='left';
    [['#4ab8d8','S'],['#f8706c','I'],['#6dcc98','R']].forEach(([c,l],i)=>{
      ctx.fillStyle=c; ctx.fillRect(pad+i*60,H-22,10,10);
      ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.fillText(l,pad+12+i*60,H-12);
    });

    const R0=(β/γ).toFixed(2);
    ctx.fillStyle='rgba(245,200,66,0.8)'; ctx.textAlign='right';
    ctx.font='11px monospace';
    ctx.fillText(`R₀ = β/γ = ${R0}`,W-pad,pad+16);

    // Y軸ラベル
    ctx.fillStyle='rgba(150,150,180,0.6)'; ctx.textAlign='right'; ctx.font='10px monospace';
    [0,0.25,0.5,0.75,1.0].forEach(v=>{
      ctx.fillText(v.toFixed(2),pad-4,sy(v)+4);
    });
  }

  betaSlider.addEventListener('input',()=>{ betaVal.textContent=parseFloat(betaSlider.value).toFixed(2); draw(); });
  gammaSlider.addEventListener('input',()=>{ gammaVal.textContent=parseFloat(gammaSlider.value).toFixed(2); draw(); });
  draw();
  window.addEventListener('resize',draw);
})();

// ===== ニュートン法 =====
(function() {
  const container = document.getElementById('newton-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const x0Slider=document.getElementById('newton-x0');
  const x0Val=document.getElementById('newton-x0-val');
  const fnSel=document.getElementById('newton-fn');

  const fns = {
    x3x:  { f: x=>x**3-x,   df: x=>3*x**2-1, label:'f(x)=x³−x' },
    sin:  { f: x=>Math.sin(x), df: x=>Math.cos(x), label:'f(x)=sin(x)' },
    'x2-2': { f: x=>x**2-2,  df: x=>2*x, label:'f(x)=x²−2' },
  };

  function draw() {
    const W=canvas.width=container.offsetWidth;
    const H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    const fn=fns[fnSel.value];
    let x=parseFloat(x0Slider.value);
    const pad=40;
    const xMin=-3.5,xMax=3.5,yMin=-3,yMax=3;

    function sx(v){return pad+(v-xMin)/(xMax-xMin)*(W-2*pad);}
    function sy(v){return pad+(1-(v-yMin)/(yMax-yMin))*(H-2*pad);}

    // グリッド・軸
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [-3,-2,-1,0,1,2,3].forEach(i=>{
      ctx.beginPath(); ctx.moveTo(sx(i),pad); ctx.lineTo(sx(i),H-pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad,sy(i)); ctx.lineTo(W-pad,sy(i)); ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad,sy(0)); ctx.lineTo(W-pad,sy(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx(0),pad); ctx.lineTo(sx(0),H-pad); ctx.stroke();

    // 関数曲線
    ctx.beginPath();
    let first=true;
    for(let i=0;i<=400;i++){
      const gx=xMin+(xMax-xMin)*i/400;
      const gy=fn.f(gx);
      if(!isFinite(gy)||gy<yMin-1||gy>yMax+1){first=true;continue;}
      const p={x:sx(gx),y:sy(gy)};
      if(first){ctx.moveTo(p.x,p.y);first=false;} else ctx.lineTo(p.x,p.y);
    }
    ctx.strokeStyle='#f5c842'; ctx.lineWidth=2.5; ctx.stroke();

    // ニュートン反復のトレース
    const colors=['#f8706c','#7c6cf8','#4ab8d8','#6dcc98','#a78bfa','#fca5a5'];
    let curX=x;
    for(let iter=0;iter<6;iter++){
      const fy=fn.f(curX), dfy=fn.df(curX);
      if(Math.abs(dfy)<1e-10) break;

      // (x, f(x)) → 接線
      const nextX=curX-fy/dfy;
      const c=colors[iter%colors.length];

      // 垂直線
      ctx.strokeStyle=c+'99'; ctx.lineWidth=1.2; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(sx(curX),sy(0)); ctx.lineTo(sx(curX),sy(fy)); ctx.stroke();
      ctx.setLineDash([]);

      // 接線
      const tlo=Math.max(xMin,Math.min(curX,nextX)-1.5);
      const thi=Math.min(xMax,Math.max(curX,nextX)+1.5);
      ctx.strokeStyle=c; ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(sx(tlo), sy(fy+dfy*(tlo-curX)));
      ctx.lineTo(sx(thi), sy(fy+dfy*(thi-curX)));
      ctx.stroke();

      // 点
      ctx.beginPath(); ctx.arc(sx(curX),sy(fy),4,0,Math.PI*2);
      ctx.fillStyle=c; ctx.fill();

      curX=nextX;
      if(Math.abs(fn.f(curX))<1e-10) break;
    }

    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(fn.label+`  x₀=${parseFloat(x0Slider.value).toFixed(1)}`, pad+4, pad+16);
    ctx.fillStyle='rgba(245,200,66,0.8)';
    ctx.fillText(`→ 収束値 ≈ ${curX.toFixed(6)}`, pad+4, pad+30);
  }

  x0Slider.addEventListener('input',()=>{ x0Val.textContent=parseFloat(x0Slider.value).toFixed(1); draw(); });
  fnSel.addEventListener('change', draw);
  draw();
  window.addEventListener('resize',draw);
})();
// ===== ロトカ・ヴォルテラ =====
(function() {
  const container = document.getElementById('lotka-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const aSlider=document.getElementById('lv-alpha'), gSlider=document.getElementById('lv-gamma');
  const aVal=document.getElementById('lv-alpha-val'), gVal=document.getElementById('lv-gamma-val');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const α=parseFloat(aSlider.value), γ=parseFloat(gSlider.value);
    const β=0.5, δ=0.5; // 固定パラメータ

    // RK4で解く
    const dt=0.05, T=100;
    let x=2, y=2; // x=被食者, y=捕食者
    const xs=[x], ys=[y];
    for(let i=0;i<T/dt;i++){
      const dx1=α*x-β*x*y, dy1=δ*x*y-γ*y;
      const dx2=α*(x+dx1*dt/2)-β*(x+dx1*dt/2)*(y+dy1*dt/2);
      const dy2=δ*(x+dx1*dt/2)*(y+dy1*dt/2)-γ*(y+dy1*dt/2);
      x+=dx2*dt; y+=dy2*dt;
      if(x<0)x=0; if(y<0)y=0;
      xs.push(x); ys.push(y);
    }

    const pad=40;
    const maxY=Math.max(...xs,...ys)*1.1||10;
    function st(i){return pad+i/xs.length*(W-2*pad);}
    function sy(v){return pad+(1-v/maxY)*(H-2*pad);}

    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [0.25,0.5,0.75,1].forEach(r=>{const y=pad+(1-r)*(H-2*pad);ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke();});
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,pad+(H-2*pad));ctx.lineTo(W-pad,pad+(H-2*pad));ctx.stroke();

    [[xs,'#6dcc98','被食者 x'],[ys,'#f8706c','捕食者 y']].forEach(([data,color,label])=>{
      ctx.beginPath();
      data.forEach((v,i)=>{
        const p={x:st(i),y:sy(v)};
        if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      });
      ctx.strokeStyle=color; ctx.lineWidth=2; ctx.stroke();
    });

    ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillStyle='#86efac'; ctx.fillText(`被食者 (α=${α.toFixed(2)})`, pad+4, pad+14);
    ctx.fillStyle='#fca5a5'; ctx.fillText(`捕食者 (γ=${γ.toFixed(2)})`, pad+4, pad+28);
  }

  aSlider.addEventListener('input',()=>{aVal.textContent=parseFloat(aSlider.value).toFixed(2);draw();});
  gSlider.addEventListener('input',()=>{gVal.textContent=parseFloat(gSlider.value).toFixed(2);draw();});
  draw();
  window.addEventListener('resize',draw);
})();

// ===== ソートアルゴリズム =====
(function() {
  const container = document.getElementById('sort-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const algoSel=document.getElementById('sort-algo');
  const startBtn=document.getElementById('sort-start-btn');
  const resetBtn=document.getElementById('sort-reset-btn');

  const N=40;
  let arr, steps, stepIdx, animId, comparing=[], swapping=[];

  function generateSteps(algo, a) {
    const arr=[...a]; const steps=[{arr:[...arr],comparing:[],swapping:[]}];
    if(algo==='bubble'){
      for(let i=0;i<arr.length;i++)
        for(let j=0;j<arr.length-1-i;j++){
          steps.push({arr:[...arr],comparing:[j,j+1],swapping:[]});
          if(arr[j]>arr[j+1]){[arr[j],arr[j+1]]=[arr[j+1],arr[j]];steps.push({arr:[...arr],comparing:[],swapping:[j,j+1]});}
        }
    } else if(algo==='selection'){
      for(let i=0;i<arr.length;i++){
        let mi=i;
        for(let j=i+1;j<arr.length;j++){steps.push({arr:[...arr],comparing:[mi,j],swapping:[]});if(arr[j]<arr[mi])mi=j;}
        if(mi!==i){[arr[i],arr[mi]]=[arr[mi],arr[i]];steps.push({arr:[...arr],comparing:[],swapping:[i,mi]});}
      }
    } else if(algo==='insertion'){
      for(let i=1;i<arr.length;i++){
        let j=i;
        while(j>0){steps.push({arr:[...arr],comparing:[j-1,j],swapping:[]});
          if(arr[j]<arr[j-1]){[arr[j],arr[j-1]]=[arr[j-1],arr[j]];steps.push({arr:[...arr],comparing:[],swapping:[j-1,j]});j--;}else break;}
      }
    } else { // merge sort (simplified iterative)
      function mergeStep(a,l,m,r){
        const tmp=[];let i=l,j=m;
        while(i<m&&j<r){steps.push({arr:[...a],comparing:[i,j],swapping:[]});if(a[i]<=a[j])tmp.push(a[i++]);else tmp.push(a[j++]);}
        while(i<m)tmp.push(a[i++]);while(j<r)tmp.push(a[j++]);
        for(let k=0;k<tmp.length;k++){a[l+k]=tmp[k];}
        steps.push({arr:[...a],comparing:[],swapping:[l,r-1]});
      }
      for(let size=1;size<arr.length;size*=2)
        for(let l=0;l<arr.length-size;l+=2*size)
          mergeStep(arr,l,l+size,Math.min(l+2*size,arr.length));
    }
    steps.push({arr:[...arr],comparing:[],swapping:[]});
    return steps;
  }

  function init() {
    arr=Array.from({length:N},(_,i)=>i+1).sort(()=>Math.random()-0.5);
    steps=null; stepIdx=0;
    cancelAnimationFrame(animId);
    startBtn.textContent='▶ 開始';
    draw(arr,[],[]);
  }

  function draw(a, comp, swap) {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const bw=Math.max(2,(W-20)/a.length-1);
    a.forEach((v,i)=>{
      const bh=(v/N)*(H-30);
      const x=10+i*(bw+1);
      const y=H-10-bh;
      ctx.fillStyle=comp.includes(i)?'#f8706c':swap.includes(i)?'#f5c842':'rgba(109,204,152,0.7)';
      ctx.fillRect(x,y,bw,bh);
    });
  }

  startBtn.addEventListener('click', ()=>{
    if(!steps){
      steps=generateSteps(algoSel.value, arr);
      stepIdx=0;
    }
    if(stepIdx>=steps.length){init();return;}
    startBtn.textContent='⏸ (実行中)'; startBtn.disabled=true;
    function run(){
      if(stepIdx>=steps.length){startBtn.textContent='完了';startBtn.disabled=false;return;}
      const s=steps[stepIdx++];
      draw(s.arr,s.comparing,s.swapping);
      animId=setTimeout(run, 30);
    }
    run();
  });
  resetBtn.addEventListener('click',()=>{cancelAnimationFrame(animId);clearTimeout(animId);startBtn.disabled=false;init();});
  algoSel.addEventListener('change',()=>{cancelAnimationFrame(animId);clearTimeout(animId);startBtn.disabled=false;init();});
  init();
  window.addEventListener('resize',()=>draw(arr,[],[]));
})();

// ===== 波動方程式 =====
(function() {
  const container = document.getElementById('wave-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const cSlider=document.getElementById('wave-c'), initSel=document.getElementById('wave-init');
  const cVal=document.getElementById('wave-c-val');

  const NX=200;
  let u, u_prev, animId;

  function initWave() {
    u=new Float64Array(NX); u_prev=new Float64Array(NX);
    const type=initSel.value;
    for(let i=0;i<NX;i++){
      const x=i/NX;
      if(type==='gaussian') u[i]=Math.exp(-((x-0.3)**2)/(2*0.02**2));
      else if(type==='sin') u[i]=Math.sin(4*Math.PI*x)*(x>0.1&&x<0.9?1:0);
      else u[i]=(x>0.2&&x<0.4?1:0);
      u_prev[i]=u[i];
    }
  }

  function step() {
    const c=parseFloat(cSlider.value);
    const dx=1/NX, dt=0.4*dx/c;
    const r=c*dt/dx;
    const u_next=new Float64Array(NX);
    for(let i=1;i<NX-1;i++)
      u_next[i]=2*u[i]-u_prev[i]+r*r*(u[i+1]-2*u[i]+u[i-1]);
    u_prev=u; u=u_next;
  }

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const cy=H/2, amp=H*0.38, pad=20;

    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,cy); ctx.lineTo(W-pad,cy); ctx.stroke();

    ctx.beginPath();
    for(let i=0;i<NX;i++){
      const x=pad+(i/NX)*(W-2*pad);
      const y=cy-u[i]*amp;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    const g=ctx.createLinearGradient(pad,0,W-pad,0);
    g.addColorStop(0,'rgba(245,200,66,0.9)'); g.addColorStop(0.5,'rgba(74,184,216,0.9)'); g.addColorStop(1,'rgba(245,200,66,0.9)');
    ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.stroke();

    for(let i=0;i<10;i++) step();
    animId=requestAnimationFrame(draw);
  }

  cSlider.addEventListener('input',()=>{cVal.textContent=parseFloat(cSlider.value).toFixed(1);initWave();});
  initSel.addEventListener('change',initWave);
  initWave(); draw();
  window.addEventListener('resize',()=>{cancelAnimationFrame(animId);draw();});
})();

// ===== 線型計画法 =====
(()=>{
  const container=document.getElementById('lp-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const result=document.getElementById('lp-result');

  const c1Sl=document.getElementById('lp-c1'), c1Val=document.getElementById('lp-c1-val');
  const c2Sl=document.getElementById('lp-c2'), c2Val=document.getElementById('lp-c2-val');
  const b1Sl=document.getElementById('lp-b1'), b1Val=document.getElementById('lp-b1-val');
  const b2Sl=document.getElementById('lp-b2'), b2Val=document.getElementById('lp-b2-val');

  function getParams(){
    return {
      c1:parseFloat(c1Sl.value), c2:parseFloat(c2Sl.value),
      b1:parseFloat(b1Sl.value), b2:parseFloat(b2Sl.value)
    };
  }

  // 頂点の列挙: x≥0, y≥0, x+2y≤b1, 3x+y≤b2 の実行可能領域頂点
  function computeVertices({b1,b2}){
    const candidates=[
      [0,0],
      [b2/3,0],       // 3x+y=b2, y=0
      [0,b1/2],       // x+2y=b1, x=0
      // 2直線交点: x+2y=b1, 3x+y=b2 → x=(2b2-b1)/5, y=(3b1-b2)/5
      [(2*b2-b1)/5, (3*b1-b2)/5]
    ];
    // 実行可能かチェック (x≥0, y≥0, 制約充足)
    return candidates.filter(([x,y])=>
      x>=-1e-9 && y>=-1e-9 &&
      x+2*y<=b1+1e-9 &&
      3*x+y<=b2+1e-9
    );
  }

  // 目的関数を最大化する頂点を探す
  function findOptimal(vertices,c1,c2){
    let best=null, bestVal=-Infinity;
    for(const v of vertices){
      const val=c1*v[0]+c2*v[1];
      if(val>bestVal){bestVal=val;best=v;}
    }
    return {vertex:best,value:bestVal};
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||380;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);

    const {c1,c2,b1,b2}=getParams();
    const pad=60, maxX=Math.max(b1,b2/3,4)+1, maxY=Math.max(b1/2,b2,4)+1;
    const scaleX=(W-2*pad)/maxX, scaleY=(H-2*pad)/maxY;

    const sx=(x)=>pad+x*scaleX;
    const sy=(y)=>H-pad-y*scaleY;

    // 背景
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    // 実行可能領域を塗りつぶし
    const verts=computeVertices({b1,b2});
    // 凸包順にソート (反時計回り: 角度でソート)
    const cx_=verts.reduce((a,v)=>a+v[0],0)/verts.length;
    const cy_=verts.reduce((a,v)=>a+v[1],0)/verts.length;
    const sorted=[...verts].sort((a,b)=>Math.atan2(a[1]-cy_,a[0]-cx_)-Math.atan2(b[1]-cy_,b[0]-cx_));

    if(sorted.length>=3){
      ctx.beginPath();
      ctx.moveTo(sx(sorted[0][0]),sy(sorted[0][1]));
      for(let i=1;i<sorted.length;i++) ctx.lineTo(sx(sorted[i][0]),sy(sorted[i][1]));
      ctx.closePath();
      ctx.fillStyle='rgba(245,200,66,0.12)'; ctx.fill();
      ctx.strokeStyle='rgba(245,200,66,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
    }

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='12px sans-serif';
    ctx.fillText('x',W-pad+6,H-pad+4); ctx.fillText('y',pad-4,pad-6);

    // グリッド目盛り
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5; ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px sans-serif';
    for(let v=0;v<=Math.floor(maxX);v++){
      ctx.beginPath(); ctx.moveTo(sx(v),pad); ctx.lineTo(sx(v),H-pad); ctx.stroke();
      if(v>0) ctx.fillText(v,sx(v)-3,H-pad+14);
    }
    for(let v=0;v<=Math.floor(maxY);v++){
      ctx.beginPath(); ctx.moveTo(pad,sy(v)); ctx.lineTo(W-pad,sy(v)); ctx.stroke();
      if(v>0) ctx.fillText(v,pad-20,sy(v)+4);
    }

    // 制約線: x+2y=b1
    const lx1=0, ly1=b1/2, lx2=b1, ly2=0;
    ctx.beginPath(); ctx.moveTo(sx(lx1),sy(ly1)); ctx.lineTo(sx(lx2),sy(ly2));
    ctx.strokeStyle='rgba(74,184,216,0.8)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(74,184,216,0.9)'; ctx.font='bold 11px sans-serif';
    ctx.fillText('x+2y='+b1, sx(b1*0.6)+4, sy(b1*(1-0.6)/2)-6);

    // 制約線: 3x+y=b2
    const rx1=0, ry1=b2, rx2=b2/3, ry2=0;
    ctx.beginPath(); ctx.moveTo(sx(rx1),sy(Math.min(ry1,maxY))); ctx.lineTo(sx(rx2),sy(ry2));
    ctx.strokeStyle='rgba(109,204,152,0.8)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(109,204,152,0.9)';
    ctx.fillText('3x+y='+b2, sx(rx2*0.5)+4, sy(ry2+(ry1-ry2)*0.5)-6);

    // 目的関数等高線 (z = c1·x + c2·y = const)
    const {vertex:opt,value:optVal}=findOptimal(verts,c1,c2);
    const levels=[-1,0,1,2].map(d=>optVal+d*(Math.abs(c1)+Math.abs(c2))*0.8);
    for(const z of levels){
      // c1·x + c2·y = z → y = (z - c1·x)/c2 または x = (z - c2·y)/c1
      ctx.beginPath();
      let drawn=false;
      if(Math.abs(c2)>1e-9){
        const x0=0, y0=(z)/c2;
        const x1=maxX, y1=(z-c1*maxX)/c2;
        if((y0>=0&&y0<=maxY)||(y1>=0&&y1<=maxY)||
           (y0<0&&y1>0)||(y0>maxY&&y1<maxY)||(y1<0&&y0>0)||(y1>maxY&&y0<maxY)){
          const clamp=(x,y)=>{
            if(y<0){x=x+(0-y)/(y1-y0)*(x1-x0);y=0;}
            if(y>maxY){x=x+(maxY-y)/(y1-y0)*(x1-x0);y=maxY;}
            return [x,y];
          };
          let [ax,ay]=clamp(x0,y0); let [bx,by]=clamp(x1,y1);
          ctx.moveTo(sx(ax),sy(ay)); ctx.lineTo(sx(bx),sy(by)); drawn=true;
        }
      } else if(Math.abs(c1)>1e-9){
        const xc=z/c1;
        if(xc>=0&&xc<=maxX){ ctx.moveTo(sx(xc),sy(0)); ctx.lineTo(sx(xc),sy(maxY)); drawn=true; }
      }
      if(drawn){ ctx.strokeStyle='rgba(245,200,66,0.25)'; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]); }
    }

    // 最適目的関数等高線 (太く)
    if(opt && Math.abs(c2)>1e-9){
      const z=optVal;
      const x0_=0, y0_=z/c2, x1_=maxX, y1_=(z-c1*maxX)/c2;
      ctx.beginPath(); ctx.moveTo(sx(x0_),sy(y0_)); ctx.lineTo(sx(x1_),sy(y1_));
      ctx.strokeStyle='rgba(245,200,66,0.7)'; ctx.lineWidth=2; ctx.setLineDash([6,3]); ctx.stroke(); ctx.setLineDash([]);
    }

    // 頂点をプロット
    for(const v of sorted){
      ctx.beginPath(); ctx.arc(sx(v[0]),sy(v[1]),5,0,2*Math.PI);
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fill();
    }

    // 最適頂点をハイライト
    if(opt){
      ctx.beginPath(); ctx.arc(sx(opt[0]),sy(opt[1]),9,0,2*Math.PI);
      ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fill();
      ctx.fillStyle='#0d0f14'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
      const ox=opt[0].toFixed(2), oy=opt[1].toFixed(2);
      ctx.fillText(`(${ox},${oy})`, sx(opt[0]), sy(opt[1])+4);
      ctx.textAlign='left';
      // 最適値表示
      result.innerHTML=`最大化: <strong style="color:var(--color-math-sciences)">z = ${c1}x + ${c2}y</strong> &nbsp;→&nbsp; 最適解: x=${ox}, y=${oy}, <strong style="color:#86efac">z* = ${optVal.toFixed(3)}</strong>`;
    } else {
      result.textContent='実行可能領域が空です';
    }
  }

  [c1Sl,c2Sl,b1Sl,b2Sl].forEach(sl=>{
    sl.addEventListener('input',()=>{
      c1Val.textContent=c1Sl.value; c2Val.textContent=c2Sl.value;
      b1Val.textContent=b1Sl.value; b2Val.textContent=b2Sl.value;
      draw();
    });
  });
  draw();
  window.addEventListener('resize',draw);
})();

// ===== 整数計画法 =====
(()=>{
  const container=document.getElementById('ilp-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const showLP=document.getElementById('ilp-show-lp');
  const c1Sl=document.getElementById('ilp-c1'), c1Val=document.getElementById('ilp-c1-val');
  const c2Sl=document.getElementById('ilp-c2'), c2Val=document.getElementById('ilp-c2-val');

  // 制約: x+2y≤6, 3x+y≤9, x≥0, y≥0
  const b1=6, b2=9;
  function feasible(x,y){ return x>=0&&y>=0&&x+2*y<=b1+1e-9&&3*x+y<=b2+1e-9; }
  function vertices(){
    const cands=[[0,0],[b2/3,0],[0,b1/2],[(2*b2-b1)/5,(3*b1-b2)/5]];
    return cands.filter(([x,y])=>feasible(x,y));
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||320;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const c1=parseFloat(c1Sl.value), c2=parseFloat(c2Sl.value);
    const maxX=4.5, maxY=4.5;
    const pad=55;
    const scX=(W-2*pad)/maxX, scY=(H-2*pad)/maxY;
    const sx=x=>pad+x*scX, sy=y=>H-pad-y*scY;

    // グリッド線
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=0.5;
    for(let i=0;i<=Math.floor(maxX);i++){ ctx.beginPath(); ctx.moveTo(sx(i),pad); ctx.lineTo(sx(i),H-pad); ctx.stroke(); }
    for(let j=0;j<=Math.floor(maxY);j++){ ctx.beginPath(); ctx.moveTo(pad,sy(j)); ctx.lineTo(W-pad,sy(j)); ctx.stroke(); }

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    for(let i=0;i<=4;i++){ ctx.fillText(i,sx(i),H-pad+14); ctx.fillText(i,pad-18,sy(i)+4); }
    ctx.fillText('x',W-pad+8,H-pad+4); ctx.textAlign='left'; ctx.fillText('y',pad-4,pad-6);

    // LP 可能領域
    if(showLP.checked){
      const verts=vertices();
      const cent_=[0,0]; verts.forEach(([x,y])=>{cent_[0]+=x;cent_[1]+=y;});
      cent_[0]/=verts.length; cent_[1]/=verts.length;
      const sorted=[...verts].sort((a,b)=>Math.atan2(a[1]-cent_[1],a[0]-cent_[0])-Math.atan2(b[1]-cent_[1],b[0]-cent_[0]));
      ctx.beginPath();
      sorted.forEach(([x,y],i)=>{ if(i===0) ctx.moveTo(sx(x),sy(y)); else ctx.lineTo(sx(x),sy(y)); });
      ctx.closePath(); ctx.fillStyle='rgba(245,200,66,0.08)'; ctx.fill();
      ctx.strokeStyle='rgba(245,200,66,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
    }

    // LP最適頂点
    const verts=vertices();
    let lpOpt=null, lpVal=-Infinity;
    verts.forEach(([x,y])=>{ const v=c1*x+c2*y; if(v>lpVal){lpVal=v;lpOpt=[x,y];} });
    if(lpOpt){
      ctx.beginPath(); ctx.arc(sx(lpOpt[0]),sy(lpOpt[1]),8,0,2*Math.PI);
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='10px monospace'; ctx.textAlign='left';
      ctx.fillText(`LP(${lpOpt[0].toFixed(1)},${lpOpt[1].toFixed(1)})`,sx(lpOpt[0])+10,sy(lpOpt[1])-6);
    }

    // 格子点
    let ilpOpt=null, ilpVal=-Infinity;
    for(let x=0;x<=Math.floor(maxX);x++) for(let y=0;y<=Math.floor(maxY);y++){
      if(!feasible(x,y)) continue;
      const v=c1*x+c2*y;
      ctx.beginPath(); ctx.arc(sx(x),sy(y),4,0,2*Math.PI);
      ctx.fillStyle='rgba(109,204,152,0.6)'; ctx.fill();
      if(v>ilpVal){ilpVal=v;ilpOpt=[x,y];}
    }

    // ILP最適頂点
    if(ilpOpt){
      ctx.beginPath(); ctx.arc(sx(ilpOpt[0]),sy(ilpOpt[1]),9,0,2*Math.PI);
      ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fill();
      ctx.fillStyle='#0d0f14'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      ctx.fillText('★',sx(ilpOpt[0]),sy(ilpOpt[1])+4);
      ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='bold 11px monospace';
      ctx.fillText(`ILP最適: (${ilpOpt[0]},${ilpOpt[1]})  z*=${ilpVal.toFixed(1)}`, W/2, H-10);
    }
  }

  showLP.addEventListener('change',draw);
  [c1Sl,c2Sl].forEach(sl=>sl.addEventListener('input',()=>{ c1Val.textContent=c1Sl.value; c2Val.textContent=c2Sl.value; draw(); }));
  draw(); window.addEventListener('resize',draw);
})();

// ===== 量子ウォーク =====
(()=>{
  const container=document.getElementById('qwalk-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const stepsSl=document.getElementById('qw-steps'), stepsVal=document.getElementById('qw-steps-val');
  const modeSel=document.getElementById('qw-mode');

  // 1次元量子ウォーク (Hadamardコイン)
  function quantumWalk(T){
    const N=2*T+1;
    // 振幅配列: psi[pos][coin] (coin: 0=up,1=down)
    let psi=Array.from({length:N},()=>[{re:0,im:0},{re:0,im:0}]);
    // 初期状態: 位置0, |↑⟩+i|↓⟩)/√2
    psi[T][0]={re:1/Math.SQRT2,im:0};
    psi[T][1]={re:0,im:1/Math.SQRT2};

    for(let t=0;t<T;t++){
      const next=Array.from({length:N},()=>[{re:0,im:0},{re:0,im:0}]);
      for(let x=0;x<N;x++){
        const [u,d]=psi[x];
        // Hadamard: H|↑⟩=(|↑⟩+|↓⟩)/√2, H|↓⟩=(|↑⟩-|↓⟩)/√2
        const hu={re:(u.re+d.re)/Math.SQRT2,im:(u.im+d.im)/Math.SQRT2};
        const hd={re:(u.re-d.re)/Math.SQRT2,im:(u.im-d.im)/Math.SQRT2};
        // シフト: ↑→右(x+1), ↓→左(x-1)
        if(x+1<N) { next[x+1][0].re+=hu.re; next[x+1][0].im+=hu.im; }
        if(x-1>=0){ next[x-1][1].re+=hd.re; next[x-1][1].im+=hd.im; }
      }
      psi=next;
    }
    return psi.map(([u,d])=>(u.re*u.re+u.im*u.im)+(d.re*d.re+d.im*d.im));
  }

  // 古典ランダムウォーク (二項分布で近似)
  function classicalWalk(T){
    const N=2*T+1;
    let prob=Array(N).fill(0); prob[T]=1;
    for(let t=0;t<T;t++){
      const next=Array(N).fill(0);
      for(let x=0;x<N;x++){
        if(prob[x]===0) continue;
        if(x+1<N) next[x+1]+=prob[x]*0.5;
        if(x-1>=0) next[x-1]+=prob[x]*0.5;
      }
      prob=next;
    }
    return prob;
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||320;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const T=parseInt(stepsSl.value); stepsVal.textContent=T;
    const mode=modeSel.value;
    const N=2*T+1;
    const qProb=quantumWalk(T);
    const cProb=classicalWalk(T);
    const maxQ=Math.max(...qProb)*1.1||1;
    const maxC=Math.max(...cProb)*1.1||1;
    const maxP=Math.max(maxQ,maxC);

    const pad=40, bW=Math.max(2,(W-2*pad)/N);
    const axY=H-pad;

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,axY); ctx.lineTo(W-pad,axY); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('位置 x',W/2,H-6);
    ctx.fillText('0',W/2,axY+14);
    ctx.fillText(-T,pad,axY+14);
    ctx.fillText(T,W-pad,axY+14);

    const toX=i=>pad+(i/(N-1))*(W-2*pad);
    const toY=p=>axY-p/maxP*(H-2*pad);

    if(mode==='both'||mode==='classical'){
      ctx.beginPath();
      cProb.forEach((p,i)=>{ if(i===0) ctx.moveTo(toX(i),toY(p)); else ctx.lineTo(toX(i),toY(p)); });
      ctx.strokeStyle='rgba(74,184,216,0.6)'; ctx.lineWidth=1.5; ctx.stroke();
      // 塗り
      ctx.beginPath(); ctx.moveTo(toX(0),axY);
      cProb.forEach((p,i)=>ctx.lineTo(toX(i),toY(p)));
      ctx.lineTo(toX(N-1),axY); ctx.closePath();
      ctx.fillStyle='rgba(74,184,216,0.1)'; ctx.fill();
    }
    if(mode==='both'||mode==='quantum'){
      ctx.beginPath();
      qProb.forEach((p,i)=>{ if(i===0) ctx.moveTo(toX(i),toY(p)); else ctx.lineTo(toX(i),toY(p)); });
      ctx.strokeStyle='rgba(245,200,66,0.9)'; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(toX(0),axY);
      qProb.forEach((p,i)=>ctx.lineTo(toX(i),toY(p)));
      ctx.lineTo(toX(N-1),axY); ctx.closePath();
      ctx.fillStyle='rgba(245,200,66,0.15)'; ctx.fill();
    }

    // 凡例
    ctx.font='11px sans-serif'; ctx.textAlign='left';
    if(mode!=='classical'){ ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fillText('━ 量子ウォーク',pad+4,pad+14); }
    if(mode!=='quantum'){ ctx.fillStyle='rgba(74,184,216,0.8)'; ctx.fillText('━ 古典ウォーク',pad+4,pad+(mode==='both'?28:14)); }
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif';
    ctx.fillText(`T=${T}ステップ`,W-pad-60,pad+14);
  }

  stepsSl.addEventListener('input',draw); modeSel.addEventListener('change',draw);
  draw(); window.addEventListener('resize',draw);
})();

// ===== 混合戦略ナッシュ均衡 =====
(()=>{
  const container=document.getElementById('mixed-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const gameSel=document.getElementById('mix-game');
  const pSl=document.getElementById('mix-p'), pVal=document.getElementById('mix-p-val');

  const games={
    matching_pennies:{
      name:'マッチングペニー',
      A:[[1,-1],[-1,1]], B:[[-1,1],[1,-1]],
      s1:['表','裏'], s2:['表','裏']
    },
    rps:{
      name:'じゃんけん (グー/チョキ/パー)',
      A:[[0,-1,1],[1,0,-1],[-1,1,0]],
      B:[[0,1,-1],[-1,0,1],[1,-1,0]],
      s1:['グー','チョキ','パー'], s2:['グー','チョキ','パー']
    },
    chicken:{
      name:'チキンゲーム',
      A:[[0,7],[2,6]], B:[[0,2],[7,6]],
      s1:['直進','回避'], s2:['直進','回避']
    }
  };

  function expectedPayoff(A,p,q){
    // p: P1の戦略(2要素の場合のみ簡易計算)
    if(A.length===2){
      return p*(q*A[0][0]+(1-q)*A[0][1])+(1-p)*(q*A[1][0]+(1-q)*A[1][1]);
    }
    // 3×3: 対称均衡 p=[1/3,1/3,1/3]
    return 0;
  }

  function nashMixed(A,B){
    // 2×2ゲームの混合戦略均衡を計算
    // P1のナッシュ: B[0][0]*q+B[0][1]*(1-q)=B[1][0]*q+B[1][1]*(1-q) → q*
    const dq=(B[0][0]-B[0][1]-B[1][0]+B[1][1]);
    const q=dq!==0?(B[1][1]-B[0][1])/dq:0.5;
    const dp=(A[0][0]-A[0][1]-A[1][0]+A[1][1]);
    const p=dp!==0?(A[1][1]-A[1][0])/dp:0.5;
    return {p:Math.max(0,Math.min(1,p)),q:Math.max(0,Math.min(1,q))};
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||320;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const game=games[gameSel.value];
    const p=parseInt(pSl.value)/100; pVal.textContent=p.toFixed(2);
    const {A,B}=game;

    if(A.length!==2){
      // 3×3: テキスト説明のみ
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='14px sans-serif'; ctx.textAlign='center';
      ctx.fillText('じゃんけん: 対称ナッシュ均衡は p=(1/3,1/3,1/3)',W/2,H/2-16);
      ctx.fillText('全戦略を等確率で選ぶ混合戦略均衡が唯一の均衡',W/2,H/2+8);
      ctx.fillStyle='rgba(245,200,66,0.8)'; ctx.font='bold 15px monospace';
      ctx.fillText('均衡: (1/3,1/3,1/3) vs (1/3,1/3,1/3)',W/2,H/2+36);
      return;
    }

    const pad=55, axW=W-2*pad, axH=H-2*pad-20;
    const sx=x=>pad+x*axW, sy=y=>H-pad-20-y*(axH/10);
    const eqRange=10.5;
    const toY=v=>H-pad-20-(v+eqRange/2)*axH/eqRange;

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    const zeroY=toY(0);
    ctx.beginPath(); ctx.moveTo(pad,zeroY); ctx.lineTo(W-pad,zeroY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad-20); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('p (P1が戦略1を選ぶ確率)',W/2,H-8);
    ctx.fillText('0',pad,zeroY+14); ctx.fillText('1',W-pad,zeroY+14);
    ctx.textAlign='right'; ctx.fillText('期待利得',pad-4,pad+10);

    // Nash均衡
    const nash=nashMixed(A,B);

    // P1の期待利得 (P2が均衡戦略q*を選ぶとき)
    const nSteps=100;
    ctx.beginPath();
    for(let i=0;i<=nSteps;i++){
      const pi=i/nSteps;
      const v=expectedPayoff(A,pi,nash.q);
      if(i===0) ctx.moveTo(sx(pi),toY(v)); else ctx.lineTo(sx(pi),toY(v));
    }
    ctx.strokeStyle='rgba(245,200,66,0.8)'; ctx.lineWidth=2; ctx.stroke();

    // P2の期待利得 (P1が均衡戦略p*を選ぶとき、P2のqに対して)
    ctx.beginPath();
    for(let i=0;i<=nSteps;i++){
      const qi=i/nSteps;
      const v=expectedPayoff(B.map(r=>[r[0]]),nash.p,qi)*0+B[0][0]*nash.p+B[1][0]*(1-nash.p);
      const v2=qi*(B[0][0]*nash.p+B[1][0]*(1-nash.p))+(1-qi)*(B[0][1]*nash.p+B[1][1]*(1-nash.p));
      if(i===0) ctx.moveTo(sx(qi),toY(v2)); else ctx.lineTo(sx(qi),toY(v2));
    }
    ctx.strokeStyle='rgba(74,184,216,0.8)'; ctx.lineWidth=2; ctx.stroke();

    // 現在の p でのP1期待利得
    const curV=expectedPayoff(A,p,nash.q);
    ctx.beginPath(); ctx.arc(sx(p),toY(curV),5,0,2*Math.PI);
    ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fill();
    ctx.strokeStyle='rgba(245,200,66,0.5)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(sx(p),zeroY); ctx.lineTo(sx(p),toY(curV)); ctx.stroke(); ctx.setLineDash([]);

    // Nash均衡点
    const nashV=expectedPayoff(A,nash.p,nash.q);
    ctx.beginPath(); ctx.arc(sx(nash.p),toY(nashV),8,0,2*Math.PI);
    ctx.fillStyle='rgba(109,204,152,0.9)'; ctx.fill();
    ctx.fillStyle='rgba(109,204,152,0.9)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='left';
    ctx.fillText(`Nash: p*=${nash.p.toFixed(2)}`,sx(nash.p)+10,toY(nashV)-6);

    // 凡例
    ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='rgba(245,200,66,0.8)'; ctx.fillText('━ P1の期待利得(q=q*)',pad+4,pad+16);
    ctx.fillStyle='rgba(74,184,216,0.8)'; ctx.fillText('━ P2の期待利得(p=p*)',pad+4,pad+30);
    ctx.fillStyle='rgba(109,204,152,0.8)'; ctx.fillText('● Nash均衡',pad+4,pad+44);
  }

  gameSel.addEventListener('change',draw); pSl.addEventListener('input',draw);
  draw(); window.addEventListener('resize',draw);
})();
