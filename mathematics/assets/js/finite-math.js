// ===== パスカルの三角形 =====
(function() {
  const container = document.getElementById('pascal-viz');
  const nSlider = document.getElementById('pascal-n');
  const nVal = document.getElementById('pascal-n-val');
  const modSel = document.getElementById('pascal-mod');

  const hues = { 0:'#7c6cf8',1:'#f8706c',2:'#3ecfca',3:'#4ab8d8',4:'#6dcc98',5:'#f5c842',6:'#a78bfa',7:'#fca5a5',8:'#5eead4',9:'#fde68a' };

  function render() {
    const n = parseInt(nSlider.value);
    const mod = parseInt(modSel.value);
    const tri = [[1]];
    for (let i = 1; i <= n; i++) {
      const row = [1];
      for (let j = 1; j < i; j++) row.push(tri[i-1][j-1]+tri[i-1][j]);
      row.push(1);
      tri.push(row);
    }

    let html = '';
    tri.forEach((row, i) => {
      html += `<div style="display:flex;justify-content:center;gap:2px;margin:1px 0;">`;
      row.forEach(val => {
        const m = mod > 0 ? val % mod : -1;
        const bg = mod > 0
          ? (m === 0 ? 'rgba(255,255,255,0.03)' : `${hues[m % 10]}33`)
          : 'rgba(109,204,152,0.1)';
        const color = mod > 0
          ? (m === 0 ? '#333355' : hues[m % 10])
          : '#86efac';
        html += `<div style="min-width:${Math.max(22,36-n*1.5)}px;height:${Math.max(18,30-n*1.5)}px;display:flex;align-items:center;justify-content:center;border-radius:3px;background:${bg};color:${color};font-size:${Math.max(8,12-n*0.5)}px;font-family:monospace;font-weight:600;">${n>11?'·':val}</div>`;
      });
      html += '</div>';
    });
    container.innerHTML = html;
  }

  nSlider.addEventListener('input', () => { nVal.textContent = nSlider.value; render(); });
  modSel.addEventListener('change', render);
  render();
})();

// ===== モンテカルロ =====
(function() {
  const container = document.getElementById('montecarlo-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const piSpan = document.getElementById('mc-pi-est');
  const stepBtn = document.getElementById('mc-step-btn');
  const resetBtn = document.getElementById('mc-reset-btn');

  let inside = 0, total = 0, pts = [];

  function addPoints(n) {
    for (let i = 0; i < n; i++) {
      const x = Math.random(), y = Math.random();
      const inCircle = x*x + y*y <= 1;
      if (inCircle) inside++;
      total++;
      pts.push({x, y, inCircle});
    }
    if (pts.length > 2000) pts = pts.slice(-2000);
    draw();
  }

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const pad = 20;
    const size = Math.min(W,H) - 2*pad;
    const ox = (W-size)/2, oy = (H-size)/2;

    ctx.strokeStyle='rgba(109,204,152,0.4)'; ctx.lineWidth=1;
    ctx.strokeRect(ox,oy,size,size);
    ctx.beginPath(); ctx.arc(ox, oy+size, size, -Math.PI/2, 0);
    ctx.strokeStyle='rgba(109,204,152,0.7)'; ctx.lineWidth=1.5; ctx.stroke();

    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(ox+p.x*size, oy+(1-p.y)*size, 2, 0, Math.PI*2);
      ctx.fillStyle = p.inCircle ? 'rgba(109,204,152,0.7)' : 'rgba(248,112,108,0.5)';
      ctx.fill();
    });

    const est = total > 0 ? (4 * inside / total).toFixed(5) : '—';
    piSpan.textContent = `π ≈ ${est}  (n=${total.toLocaleString()})`;
  }

  stepBtn.addEventListener('click', () => addPoints(100));
  resetBtn.addEventListener('click', () => { inside=0; total=0; pts=[]; draw(); piSpan.textContent=''; });
  addPoints(300);
  window.addEventListener('resize', draw);
})();

// ===== グラフ BFS =====
(function() {
  const container = document.getElementById('graph-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const stepBtn = document.getElementById('bfs-step-btn');
  const resetBtn = document.getElementById('bfs-reset-btn');
  const statusSpan = document.getElementById('bfs-status');

  const N = 8;
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[4,7],[5,6]];
  let visited, queue, visitOrder, step;

  function reset() {
    visited = new Array(N).fill(false);
    queue = [0];
    visited[0] = true;
    visitOrder = [0];
    step = 0;
    statusSpan.textContent = '頂点0からBFS開始';
    draw();
  }

  function bfsStep() {
    if (queue.length === 0) { statusSpan.textContent = '探索完了'; return; }
    const v = queue.shift();
    const neighbors = edges.filter(e => e[0]===v||e[1]===v).map(e => e[0]===v?e[1]:e[0]);
    neighbors.forEach(u => {
      if (!visited[u]) { visited[u]=true; queue.push(u); visitOrder.push(u); }
    });
    step++;
    statusSpan.textContent = `ステップ${step}: 頂点${v}を処理 → キュー:[${queue}]`;
    draw();
  }

  function getPositions(W, H) {
    const cx=W/2, cy=H/2, r=Math.min(W,H)*0.35;
    return Array.from({length:N},(_,i)=>({
      x: cx+r*Math.cos(i*2*Math.PI/N-Math.PI/2),
      y: cy+r*Math.sin(i*2*Math.PI/N-Math.PI/2),
    }));
  }

  function draw() {
    const W=canvas.width=container.offsetWidth;
    const H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const pos=getPositions(W,H);

    edges.forEach(([a,b]) => {
      const isVisited = visited[a]&&visited[b];
      ctx.beginPath(); ctx.moveTo(pos[a].x,pos[a].y); ctx.lineTo(pos[b].x,pos[b].y);
      ctx.strokeStyle = isVisited ? 'rgba(109,204,152,0.6)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isVisited ? 2 : 1; ctx.stroke();
    });

    pos.forEach((p,i) => {
      const isVisited=visited[i], inQueue=queue.includes(i);
      ctx.beginPath(); ctx.arc(p.x,p.y,16,0,Math.PI*2);
      ctx.fillStyle = isVisited ? 'rgba(109,204,152,0.3)' : 'rgba(30,30,60,0.8)';
      ctx.fill();
      ctx.strokeStyle = isVisited ? '#6dcc98' : inQueue ? '#f5c842' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=isVisited?'#86efac':inQueue?'#fde68a':'#9090b8';
      ctx.font='bold 12px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(i,p.x,p.y); ctx.textBaseline='alphabetic';
      if (isVisited) {
        const ord=visitOrder.indexOf(i);
        ctx.fillStyle='rgba(200,200,230,0.5)'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText(ord+1,p.x,p.y-20);
      }
    });
  }

  stepBtn.addEventListener('click', bfsStep);
  resetBtn.addEventListener('click', reset);
  reset();
  window.addEventListener('resize', draw);
})();

// ===== 正規分布 =====
(function() {
  const container = document.getElementById('normal-dist-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const muSlider=document.getElementById('norm-mu');
  const sigmaSlider=document.getElementById('norm-sigma');
  const muVal=document.getElementById('norm-mu-val');
  const sigmaVal=document.getElementById('norm-sigma-val');

  function draw() {
    const W=canvas.width=container.offsetWidth;
    const H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    const mu=parseFloat(muSlider.value), sigma=parseFloat(sigmaSlider.value);
    const pad=35;
    const xMin=-5, xMax=5, yMax=0.85;

    function sx(x){return pad+(x-xMin)/(xMax-xMin)*(W-2*pad);}
    function sy(y){return (H-pad)-(y/yMax)*(H-2*pad);}

    // グリッド
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [-4,-3,-2,-1,0,1,2,3,4].forEach(x=>{
      ctx.beginPath(); ctx.moveTo(sx(x),pad); ctx.lineTo(sx(x),H-pad); ctx.stroke();
    });
    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad,sy(0)); ctx.lineTo(W-pad,sy(0)); ctx.stroke();

    // μ±σ の影
    const shadeRegions = [{lo:mu-sigma,hi:mu+sigma,alpha:0.25},{lo:mu-2*sigma,hi:mu+2*sigma,alpha:0.12}];
    shadeRegions.forEach(({lo,hi,alpha})=>{
      ctx.beginPath();
      for(let i=0;i<=200;i++){
        const x=lo+(hi-lo)*i/200;
        const y=MathUtils.stats.normalPDF(x,mu,sigma);
        if(i===0) ctx.moveTo(sx(x),sy(y)); else ctx.lineTo(sx(x),sy(y));
      }
      ctx.lineTo(sx(hi),sy(0)); ctx.lineTo(sx(lo),sy(0)); ctx.closePath();
      ctx.fillStyle=`rgba(109,204,152,${alpha})`; ctx.fill();
    });

    // 曲線
    ctx.beginPath();
    for(let i=0;i<=400;i++){
      const x=xMin+(xMax-xMin)*i/400;
      const y=MathUtils.stats.normalPDF(x,mu,sigma);
      const s={x:sx(x),y:sy(y)};
      if(i===0) ctx.moveTo(s.x,s.y); else ctx.lineTo(s.x,s.y);
    }
    ctx.strokeStyle='#6dcc98'; ctx.lineWidth=2.5; ctx.stroke();

    // μの縦線
    ctx.strokeStyle='rgba(245,200,66,0.8)'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(sx(mu),pad); ctx.lineTo(sx(mu),sy(0)); ctx.stroke();
    ctx.setLineDash([]);

    // ラベル
    ctx.fillStyle='#fde68a'; ctx.font='11px monospace'; ctx.textAlign='center';
    ctx.fillText('μ',sx(mu),pad+12);
    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.textAlign='left';
    ctx.fillText(`N(μ=${mu.toFixed(1)}, σ=${sigma.toFixed(1)})`,pad+4,pad+14);
    [-4,-3,-2,-1,0,1,2,3,4].forEach(x=>{
      ctx.fillStyle='rgba(150,150,180,0.6)'; ctx.font='10px monospace'; ctx.textAlign='center';
      ctx.fillText(x,sx(x),sy(0)+14);
    });
  }

  muSlider.addEventListener('input', ()=>{ muVal.textContent=parseFloat(muSlider.value).toFixed(1); draw(); });
  sigmaSlider.addEventListener('input', ()=>{ sigmaVal.textContent=parseFloat(sigmaSlider.value).toFixed(1); draw(); });
  draw();
  window.addEventListener('resize',draw);
})();
// ===== 有限オートマトン (DFA) =====
(function() {
  const container = document.getElementById('dfa-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const typeSel=document.getElementById('dfa-type');
  const inputEl=document.getElementById('dfa-input');
  const runBtn=document.getElementById('dfa-run-btn');
  const stepBtn=document.getElementById('dfa-step-btn');
  const resetBtn=document.getElementById('dfa-reset-btn');
  const statusSpan=document.getElementById('dfa-status');

  // DFA定義
  const dfas = {
    even0: {
      states:['q0','q1'], start:'q0', accept:['q0'],
      delta:{'q0':{'0':'q1','1':'q0'}, 'q1':{'0':'q0','1':'q1'}},
      desc:'0の個数が偶数 (0={odd}, 1={even})',
      layout:{q0:{x:0.25,y:0.5}, q1:{x:0.75,y:0.5}},
      alphabet:['0','1']
    },
    ab: {
      states:['q0','q1','q2'], start:'q0', accept:['q2'],
      delta:{'q0':{'a':'q1','b':'q0'}, 'q1':{'a':'q1','b':'q2'}, 'q2':{'a':'q1','b':'q0'}},
      desc:'"ab"で終わる文字列',
      layout:{q0:{x:0.2,y:0.5}, q1:{x:0.5,y:0.5}, q2:{x:0.8,y:0.5}},
      alphabet:['a','b']
    },
    div3: {
      states:['q0','q1','q2'], start:'q0', accept:['q0'],
      delta:{'q0':{'0':'q0','1':'q1'}, 'q1':{'0':'q2','1':'q0'}, 'q2':{'0':'q1','1':'q2'}},
      desc:'2進数で3の倍数を認識',
      layout:{q0:{x:0.5,y:0.2}, q1:{x:0.8,y:0.7}, q2:{x:0.2,y:0.7}},
      alphabet:['0','1']
    },
  };

  let current, stepIdx, tape;

  function reset() {
    const dfa=dfas[typeSel.value];
    current=dfa.start;
    tape=inputEl.value.split('');
    stepIdx=0;
    statusSpan.textContent=`入力: "${inputEl.value}"  現在: ${current}`;
    draw();
  }

  function step() {
    const dfa=dfas[typeSel.value];
    if(stepIdx>=tape.length){
      const accepted=dfa.accept.includes(current);
      statusSpan.textContent=`入力完了 → ${accepted?'✓ 受理':'✗ 拒否'} (状態: ${current})`;
      statusSpan.style.color=accepted?'#86efac':'#fca5a5';
      draw();
      return;
    }
    const sym=tape[stepIdx];
    const next=dfa.delta[current]?.[sym];
    if(next===undefined){
      statusSpan.textContent=`✗ 未定義遷移 δ(${current},${sym})`;
      statusSpan.style.color='#fca5a5';
      return;
    }
    statusSpan.textContent=`δ(${current}, ${sym}) = ${next}  [${stepIdx+1}/${tape.length}]`;
    statusSpan.style.color='rgba(200,200,230,0.8)';
    current=next;
    stepIdx++;
    draw();
  }

  function runAll() {
    reset();
    const dfa=dfas[typeSel.value];
    for(const sym of tape){
      const next=dfa.delta[current]?.[sym];
      if(!next && next!=='q0') break;
      current=next;
    }
    stepIdx=tape.length;
    const accepted=dfa.accept.includes(current);
    statusSpan.textContent=`"${inputEl.value}" → ${accepted?'✓ 受理':'✗ 拒否'} (最終状態: ${current})`;
    statusSpan.style.color=accepted?'#86efac':'#fca5a5';
    draw();
  }

  function drawArrow(ctx,x1,y1,x2,y2,label,curved=0,color='rgba(200,200,230,0.5)') {
    ctx.strokeStyle=color; ctx.lineWidth=1.8;
    if(Math.abs(curved)<0.01){
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      const ang=Math.atan2(y2-y1,x2-x1);
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2-10*Math.cos(ang-0.4),y2-10*Math.sin(ang-0.4));
      ctx.lineTo(x2-10*Math.cos(ang+0.4),y2-10*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fillStyle=color; ctx.fill();
      ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='center';
      ctx.fillText(label, mx, my-6);
    } else {
      const mx=(x1+x2)/2+curved*(y2-y1)*0.4;
      const my=(y1+y2)/2-curved*(x2-x1)*0.4;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(mx,my,x2,y2); ctx.stroke();
      const ang=Math.atan2(y2-my,x2-mx);
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2-10*Math.cos(ang-0.4),y2-10*Math.sin(ang-0.4));
      ctx.lineTo(x2-10*Math.cos(ang+0.4),y2-10*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fillStyle=color; ctx.fill();
      ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='center';
      ctx.fillText(label, mx, my-6);
    }
  }

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const dfa=dfas[typeSel.value];
    const R=22;

    function pos(s){return {x:dfa.layout[s].x*W, y:dfa.layout[s].y*H};}

    // 遷移を描画（グループ化）
    const drawnPairs=new Set();
    dfa.states.forEach(s=>{
      dfa.alphabet.forEach(sym=>{
        const t=dfa.delta[s]?.[sym];
        if(!t) return;
        const key=`${s}-${t}`;
        const rkey=`${t}-${s}`;
        const ps=pos(s), pt=pos(t);
        // 自己ループ
        if(s===t){
          const loopR=20;
          ctx.beginPath(); ctx.arc(ps.x,ps.y-R-loopR,loopR,0,Math.PI*2);
          ctx.strokeStyle='rgba(200,200,230,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
          ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='center';
          ctx.fillText(sym,ps.x,ps.y-R-loopR*2-2);
          return;
        }
        const curved=drawnPairs.has(rkey)?1:0;
        // 向きに合わせ端点を調整
        const ang=Math.atan2(pt.y-ps.y,pt.x-ps.x);
        const color=s===current&&stepIdx>0&&dfa.delta[s]?.[tape[stepIdx-1]]===t?'rgba(109,204,152,0.9)':'rgba(200,200,230,0.4)';
        drawArrow(ctx,
          ps.x+R*Math.cos(ang), ps.y+R*Math.sin(ang),
          pt.x-R*Math.cos(ang), pt.y-R*Math.sin(ang),
          sym, curved, color
        );
        drawnPairs.add(key);
      });
    });

    // 状態を描画
    dfa.states.forEach(s=>{
      const p=pos(s);
      const isCurrent=s===current;
      const isAccept=dfa.accept.includes(s);

      ctx.beginPath(); ctx.arc(p.x,p.y,R,0,Math.PI*2);
      ctx.fillStyle=isCurrent?'rgba(109,204,152,0.3)':isAccept?'rgba(74,184,216,0.15)':'rgba(30,30,60,0.8)';
      ctx.fill();
      ctx.strokeStyle=isCurrent?'#6dcc98':isAccept?'#4ab8d8':'rgba(200,200,230,0.3)';
      ctx.lineWidth=isCurrent?3:2; ctx.stroke();

      if(isAccept){
        ctx.beginPath(); ctx.arc(p.x,p.y,R-5,0,Math.PI*2);
        ctx.strokeStyle=isCurrent?'#6dcc98':'rgba(74,184,216,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
      }

      ctx.fillStyle=isCurrent?'#86efac':'rgba(200,200,230,0.8)';
      ctx.font=`bold 12px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(s,p.x,p.y); ctx.textBaseline='alphabetic';
    });

    // 開始矢印
    const ps=pos(dfa.start);
    const ang=dfa.layout[dfa.start].x<0.5?Math.PI:0;
    ctx.strokeStyle='rgba(200,200,230,0.5)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(ps.x+Math.cos(ang)*55,ps.y); ctx.lineTo(ps.x+Math.cos(ang)*(R+2),ps.y); ctx.stroke();
    ctx.fillStyle='rgba(200,200,230,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('開始',ps.x+Math.cos(ang)*60,ps.y+14);

    // テープ表示
    const tapeY=H-32, tapeX=W/2-(tape.length*20)/2;
    tape.forEach((sym,i)=>{
      const x=tapeX+i*22;
      const isPast=i<stepIdx, isCur=i===stepIdx-1;
      ctx.fillStyle=isCur?'rgba(245,200,66,0.3)':isPast?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.08)';
      ctx.fillRect(x,tapeY,20,20);
      ctx.strokeStyle=isCur?'#fde68a':'rgba(255,255,255,0.2)'; ctx.lineWidth=isCur?1.5:1;
      ctx.strokeRect(x,tapeY,20,20);
      ctx.fillStyle=isCur?'#fde68a':isPast?'rgba(150,150,180,0.5)':'rgba(200,200,230,0.8)';
      ctx.font='12px monospace'; ctx.textAlign='center';
      ctx.fillText(sym,x+10,tapeY+14);
    });
  }

  typeSel.addEventListener('change',reset);
  runBtn.addEventListener('click',runAll);
  stepBtn.addEventListener('click',step);
  resetBtn.addEventListener('click',reset);
  inputEl.addEventListener('input',reset);
  reset();
  window.addEventListener('resize',draw);
})();

// ===== ベン図 =====
(function() {
  const container = document.getElementById('venn-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const opSel = document.getElementById('venn-op');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const op=opSel.value;
    const r=Math.min(W,H)*0.3, cy=H/2;
    const ax=W/2-r*0.5, bx=W/2+r*0.5;
    const color='rgba(109,204,152,0.55)';

    // 背景 (全体集合)
    ctx.fillStyle='rgba(255,255,255,0.03)';
    ctx.fillRect(W*0.05, cy-r*1.1, W*0.9, r*2.2);
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    ctx.strokeRect(W*0.05, cy-r*1.1, W*0.9, r*2.2);

    const fillCircle=(cx,cy,col)=>{
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.fillStyle=col; ctx.fill();
    };

    // クリッピングで共通部分・差集合を描画
    if(op==='union') {
      fillCircle(ax,cy,color); fillCircle(bx,cy,color);
    } else if(op==='inter') {
      ctx.save(); ctx.beginPath(); ctx.arc(ax,cy,r,0,Math.PI*2); ctx.clip();
      fillCircle(bx,cy,color); ctx.restore();
    } else if(op==='diff') {
      ctx.save(); ctx.beginPath(); ctx.arc(bx,cy,r,0,Math.PI*2);
      // 差集合: A から B を除く
      ctx.save(); fillCircle(ax,cy,color); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(bx,cy,r,0,Math.PI*2); ctx.clip();
      fillCircle(bx,cy,'rgba(13,13,26,1)'); ctx.restore();
      ctx.restore();
    } else if(op==='symdiff') {
      fillCircle(ax,cy,color); fillCircle(bx,cy,color);
      ctx.save(); ctx.beginPath(); ctx.arc(ax,cy,r,0,Math.PI*2); ctx.clip();
      fillCircle(bx,cy,'rgba(13,13,26,1)'); ctx.restore();
    } else if(op==='comp') {
      ctx.fillStyle=color;
      ctx.fillRect(W*0.05, cy-r*1.1, W*0.9, r*2.2);
      fillCircle(ax,cy,'rgba(13,13,26,1)');
    }

    // A, B の輪郭
    ['A','B'].forEach((label,i)=>{
      const cx2=i===0?ax:bx;
      ctx.beginPath(); ctx.arc(cx2,cy,r,0,Math.PI*2);
      ctx.strokeStyle=i===0?'rgba(74,184,216,0.8)':'rgba(109,204,152,0.8)';
      ctx.lineWidth=2.5; ctx.stroke();
      ctx.fillStyle=i===0?'#7dd3fc':'#86efac';
      ctx.font='bold 18px sans-serif'; ctx.textAlign='center';
      ctx.fillText(label, cx2+(i===0?-r*0.55:r*0.55), cy+6);
    });

    // 演算名
    const labels={union:'A ∪ B',inter:'A ∩ B',diff:'A − B',symdiff:'A △ B',comp:'Aᶜ'};
    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='13px monospace'; ctx.textAlign='center';
    ctx.fillText(labels[op], W/2, H-10);
  }

  opSel.addEventListener('change', draw);
  draw();
  window.addEventListener('resize', draw);
})();

// ===== マルコフ連鎖 =====
(function() {
  const container = document.getElementById('markov-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const pSlider=document.getElementById('markov-p'), qSlider=document.getElementById('markov-q');
  const pVal=document.getElementById('markov-p-val'), qVal=document.getElementById('markov-q-val');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const p=parseFloat(pSlider.value), q=parseFloat(qSlider.value);
    // 遷移行列 [[1-p, p],[q, 1-q]]
    // 定常分布: π₁=q/(p+q), π₂=p/(p+q)
    const π1=q/(p+q), π2=p/(p+q);

    // 収束のシミュレーション
    const steps=50;
    const series1=[π1], series2=[π2]; // 定常
    let x1=1.0, x2=0.0; // 初期: 状態1 から
    const traj1=[x1], traj2=[x2];
    for(let i=0;i<steps;i++){
      const nx1=x1*(1-p)+x2*q;
      const nx2=x1*p+x2*(1-q);
      x1=nx1; x2=nx2;
      traj1.push(x1); traj2.push(x2);
    }

    const pad=40;
    function sx(i){return pad+i/steps*(W-2*pad);}
    function sy(v){return pad+(1-v)*(H-2*pad);}

    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [0,0.25,0.5,0.75,1].forEach(v=>{ctx.beginPath();ctx.moveTo(pad,sy(v));ctx.lineTo(W-pad,sy(v));ctx.stroke();});
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(W-pad,sy(0));ctx.stroke();

    // 定常分布（破線）
    ctx.setLineDash([6,4]);
    ctx.strokeStyle='rgba(74,184,216,0.5)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,sy(π1));ctx.lineTo(W-pad,sy(π1));ctx.stroke();
    ctx.strokeStyle='rgba(109,204,152,0.5)';
    ctx.beginPath();ctx.moveTo(pad,sy(π2));ctx.lineTo(W-pad,sy(π2));ctx.stroke();
    ctx.setLineDash([]);

    // 軌跡
    [[traj1,'#4ab8d8','状態1'],[traj2,'#6dcc98','状態2']].forEach(([data,color,label])=>{
      ctx.beginPath();
      data.forEach((v,i)=>{
        const s={x:sx(i),y:sy(v)};
        if(i===0) ctx.moveTo(s.x,s.y); else ctx.lineTo(s.x,s.y);
      });
      ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();
    });

    // Y軸ラベル
    ctx.fillStyle='rgba(150,150,180,0.6)'; ctx.font='10px monospace'; ctx.textAlign='right';
    [0,0.25,0.5,0.75,1].forEach(v=>{ctx.fillText(v.toFixed(2),pad-4,sy(v)+4);});

    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`p=${p.toFixed(2)}, q=${q.toFixed(2)}`, pad+4, pad+14);
    ctx.fillStyle='rgba(200,200,230,0.5)';
    ctx.fillText(`定常分布: π₁=${π1.toFixed(3)}, π₂=${π2.toFixed(3)}`, pad+4, pad+28);
  }

  pSlider.addEventListener('input',()=>{pVal.textContent=parseFloat(pSlider.value).toFixed(2);draw();});
  qSlider.addEventListener('input',()=>{qVal.textContent=parseFloat(qSlider.value).toFixed(2);draw();});
  draw();
  window.addEventListener('resize',draw);
})();

// ===== ダイクストラ法 =====
(function() {
  const container = document.getElementById('dijkstra-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const stepBtn=document.getElementById('dijk-step-btn');
  const resetBtn=document.getElementById('dijk-reset-btn');
  const statusSpan=document.getElementById('dijk-status');

  const verts=[{x:0.15,y:0.5},{x:0.35,y:0.15},{x:0.35,y:0.85},{x:0.6,y:0.15},{x:0.6,y:0.85},{x:0.85,y:0.5}];
  const edges=[[0,1,7],[0,2,9],[1,2,10],[1,3,15],[2,4,11],[3,4,6],[3,5,5],[4,5,2]];
  let dist, prev, visited, queue, step;

  function reset() {
    const N=verts.length;
    dist=Array(N).fill(Infinity); dist[0]=0;
    prev=Array(N).fill(-1);
    visited=Array(N).fill(false);
    queue=[0];
    step=0;
    statusSpan.textContent='頂点0から開始 (辺の重みはエッジのラベル)';
    draw();
  }

  function dijkStep() {
    if(queue.length===0){statusSpan.textContent='完了！';return;}
    // 未訪問で最小のdistの頂点
    queue.sort((a,b)=>dist[a]-dist[b]);
    const u=queue.shift();
    if(visited[u]){dijkStep();return;}
    visited[u]=true;
    step++;
    edges.forEach(([a,b,w])=>{
      const v=a===u?b:b===u?a:-1;
      if(v<0) return;
      if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u;if(!visited[v])queue.push(v);}
    });
    statusSpan.textContent=`頂点${u}を確定 dist=[${dist.map(d=>d===Infinity?'∞':d).join(',')}]`;
    draw();
  }

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    function pos(i){return {x:verts[i].x*W, y:verts[i].y*H};}

    edges.forEach(([a,b,w])=>{
      const pa=pos(a), pb=pos(b);
      const isPath=visited[a]&&visited[b]&&(prev[b]===a||prev[a]===b);
      ctx.strokeStyle=isPath?'rgba(109,204,152,0.7)':'rgba(255,255,255,0.12)';
      ctx.lineWidth=isPath?2.5:1.5;
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
      // 重みラベル
      ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='center';
      ctx.fillText(w,(pa.x+pb.x)/2+6,(pa.y+pb.y)/2-4);
    });

    verts.forEach((_,i)=>{
      const p=pos(i);
      ctx.beginPath(); ctx.arc(p.x,p.y,16,0,Math.PI*2);
      ctx.fillStyle=visited[i]?'rgba(109,204,152,0.3)':queue.includes(i)?'rgba(245,200,66,0.2)':'rgba(30,30,60,0.8)';
      ctx.fill();
      ctx.strokeStyle=visited[i]?'#6dcc98':queue.includes(i)?'#f5c842':'rgba(255,255,255,0.2)';
      ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=visited[i]?'#86efac':'#e8e8f8';
      ctx.font='bold 12px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(i,p.x,p.y); ctx.textBaseline='alphabetic';
      // 距離
      if(dist[i]!==Infinity){
        ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='10px monospace'; ctx.textAlign='center';
        ctx.fillText(dist[i],p.x,p.y-20);
      }
    });
  }

  stepBtn.addEventListener('click', dijkStep);
  resetBtn.addEventListener('click', reset);
  reset();
  window.addEventListener('resize', draw);
})();

// ===== チューリング機械 =====
(()=>{
  const container=document.getElementById('tm-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const progSel=document.getElementById('tm-prog');
  const stepBtn=document.getElementById('tm-step-btn');
  const runBtn=document.getElementById('tm-run-btn');
  const resetBtn=document.getElementById('tm-reset-btn');
  const infoEl=document.getElementById('tm-info');
  let tape,head,state,halted,runTimer;

  // 単項加算: 111 0 11 → 11111
  // 状態: q0=移動右, q1=末尾0を1に変換, q2=最後1をブランクに, qHalt
  const programs={
    unary_add:{
      tape:['1','1','1','0','1','1','_','_','_','_','_','_'],
      head:0, initState:'q0',
      trans:{
        q0:{'1':['1','R','q0'],'0':['1','R','q1'],'_':['_','L','halt']},
        q1:{'1':['1','R','q1'],'_':['_','L','q2'],'0':['0','R','q1']},
        q2:{'1':['_','L','halt'],'_':['_','L','halt']}
      }
    },
    palindrome:{
      tape:['a','b','b','a','_','_','_','_','_','_'],
      head:0, initState:'q0',
      trans:{
        q0:{'a':['_','R','q1'],'b':['_','R','q3'],'_':['_','N','qY']},
        q1:{'a':['a','R','q1'],'b':['b','R','q1'],'_':['_','L','q2']},
        q2:{'a':['_','L','q5'],'b':['_','L','qN'],'_':['_','L','q5']},
        q3:{'a':['a','R','q3'],'b':['b','R','q3'],'_':['_','L','q4']},
        q4:{'a':['_','L','qN'],'b':['_','L','q5'],'_':['_','L','qN']},
        q5:{'a':['a','L','q5'],'b':['b','L','q5'],'_':['_','R','q0']},
        qY:{}, qN:{}, halt:{}
      }
    }
  };

  function reset(){
    clearInterval(runTimer); runBtn.textContent='▶▶ 実行';
    const prog=programs[progSel.value];
    tape=[...prog.tape]; head=prog.head; state=prog.initState; halted=false;
    infoEl.textContent=`状態: ${state}  ヘッド位置: ${head}`;
    draw();
  }

  function step(){
    if(halted) return;
    const prog=programs[progSel.value];
    const sym=tape[head]||'_';
    const rule=(prog.trans[state]||{})[sym];
    if(!rule||state==='halt'||state==='qY'||state==='qN'){
      halted=true;
      const accept=state==='qY'||(state==='halt'&&progSel.value==='unary_add');
      infoEl.textContent=`停止! 状態: ${state}  ${accept?'✓ 受理':'✗ 拒否'}`;
      draw(); return;
    }
    const [write,dir,next]=rule;
    tape[head]=write;
    if(dir==='R') head=Math.min(head+1,tape.length-1);
    else if(dir==='L') head=Math.max(head-1,0);
    state=next;
    infoEl.textContent=`状態: ${state}  ヘッド: ${head}  書き込み: '${write}'`;
    draw();
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||220;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const cellW=44, cellH=44, tapeY=H/2-10;
    const startX=W/2-(head*cellW);
    const nCells=Math.ceil(W/cellW)+2;

    // テープ
    for(let i=0;i<tape.length;i++){
      const x=startX+i*cellW, y=tapeY;
      const isHead=i===head;
      ctx.fillStyle=isHead?'rgba(109,204,152,0.3)':'rgba(255,255,255,0.04)';
      ctx.fillRect(x-cellW/2,y-cellH/2,cellW,cellH);
      ctx.strokeStyle=isHead?'rgba(109,204,152,0.8)':'rgba(255,255,255,0.15)';
      ctx.lineWidth=isHead?2:0.5; ctx.strokeRect(x-cellW/2,y-cellH/2,cellW,cellH);
      ctx.fillStyle=isHead?'rgba(109,204,152,1)':'rgba(255,255,255,0.7)';
      ctx.font=`bold ${cellW*0.4}px monospace`; ctx.textAlign='center';
      ctx.fillText(tape[i]||'_',x,y+6);
    }

    // ヘッド矢印
    const hx=startX+head*cellW;
    ctx.beginPath(); ctx.moveTo(hx,tapeY-cellH/2-14); ctx.lineTo(hx,tapeY-cellH/2-4);
    ctx.strokeStyle='rgba(245,200,66,0.9)'; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx,tapeY-cellH/2-4);
    ctx.lineTo(hx-6,tapeY-cellH/2-12); ctx.lineTo(hx+6,tapeY-cellH/2-12); ctx.closePath();
    ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fill();

    // 状態表示
    ctx.fillStyle=halted?'rgba(248,112,108,0.9)':'rgba(245,200,66,0.9)';
    ctx.font='bold 13px monospace'; ctx.textAlign='center';
    ctx.fillText(`q = ${state}`, hx, tapeY-cellH/2-22);

    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px sans-serif';
    ctx.fillText('テープ', W/2, tapeY+cellH/2+16);
  }

  stepBtn.addEventListener('click',()=>{if(!halted)step();});
  runBtn.addEventListener('click',()=>{
    if(runTimer){ clearInterval(runTimer); runTimer=null; runBtn.textContent='▶▶ 実行'; return; }
    runBtn.textContent='⏸ 停止';
    runTimer=setInterval(()=>{step();if(halted){clearInterval(runTimer);runTimer=null;runBtn.textContent='▶▶ 実行';}},350);
  });
  resetBtn.addEventListener('click',reset);
  progSel.addEventListener('change',reset);
  reset(); window.addEventListener('resize',draw);
})();

// ===== ハミング(7,4)符号 =====
(()=>{
  const container=document.getElementById('hamming-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const dataSel=document.getElementById('ham-data');
  const errSl=document.getElementById('ham-err'), errVal=document.getElementById('ham-err-val');

  // ハミング(7,4)符号器 (非系統符号)
  // 生成行列 G の各行 [p1,p2,d1,p3,d2,d3,d4] で d1..d4が情報ビット
  // 簡易実装: 系統符号 d1d2d3d4p1p2p3
  function encode(bits){ // bits: 4要素[0,1]配列
    const [d1,d2,d3,d4]=bits;
    const p1=(d1^d2^d4)&1;
    const p2=(d1^d3^d4)&1;
    const p3=(d2^d3^d4)&1;
    return [d1,d2,d3,d4,p1,p2,p3];
  }
  function syndrome(cw){
    const [d1,d2,d3,d4,p1,p2,p3]=cw;
    const s1=(d1^d2^d4^p1)&1;
    const s2=(d1^d3^d4^p2)&1;
    const s3=(d2^d3^d4^p3)&1;
    return s1|s2<<1|s3<<2; // 0=no error
  }
  const errPosMap=[0,4,5,1,6,2,3,0]; // syndrome→bit index (1-indexed)

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||260;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const data=dataSel.value.split('').map(Number);
    const errBit=parseInt(errSl.value);
    errVal.textContent=errBit===0?'なし':`ビット${errBit}`;

    const cw=[...encode(data)];
    // エラーを注入
    if(errBit>0&&errBit<=7) cw[errBit-1]^=1;
    const syn=syndrome(cw);
    const errDetected=syn>0;
    const errPos=errDetected?errPosMap[syn]:0;

    const bW=50, bH=44, startX=(W-7*bW)/2, y=H*0.35;
    const labels=['d₁','d₂','d₃','d₄','p₁','p₂','p₃'];
    const original=[...encode(data)];

    // ビット表示
    for(let i=0;i<7;i++){
      const x=startX+i*bW;
      const isErr=errBit>0&&i===errBit-1;
      const isDetected=errPos===i+1;
      ctx.fillStyle=isErr?'rgba(248,112,108,0.3)':i<4?'rgba(109,204,152,0.15)':'rgba(74,184,216,0.15)';
      ctx.fillRect(x,y-bH/2,bW-4,bH);
      ctx.strokeStyle=isDetected?'rgba(245,200,66,0.9)':isErr?'rgba(248,112,108,0.7)':i<4?'rgba(109,204,152,0.4)':'rgba(74,184,216,0.4)';
      ctx.lineWidth=isDetected?2.5:1; ctx.strokeRect(x,y-bH/2,bW-4,bH);
      // ビット値
      ctx.fillStyle=cw[i]!==original[i]?'rgba(248,112,108,1)':'rgba(255,255,255,0.85)';
      ctx.font='bold 18px monospace'; ctx.textAlign='center';
      ctx.fillText(cw[i],x+(bW-4)/2,y+7);
      // ラベル
      ctx.fillStyle=i<4?'rgba(109,204,152,0.8)':'rgba(74,184,216,0.8)'; ctx.font='10px sans-serif';
      ctx.fillText(labels[i],x+(bW-4)/2,y+bH/2+14);
      // 訂正マーク
      if(isDetected){
        ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='bold 14px sans-serif';
        ctx.fillText('↑修正',x+(bW-4)/2,y-bH/2-6);
      }
    }

    // シンドローム
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='12px monospace'; ctx.textAlign='center';
    ctx.fillText(`シンドローム: ${syn.toString(2).padStart(3,'0')} (${syn})  → ${errDetected?`ビット${errPos}に誤り → 自動訂正`:'誤りなし'}`, W/2, y+bH/2+34);

    // 凡例
    ctx.fillStyle='rgba(109,204,152,0.7)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('■ 情報ビット(d)', startX, H-16);
    ctx.fillStyle='rgba(74,184,216,0.7)';
    ctx.fillText('■ パリティビット(p)', startX+100, H-16);
    ctx.fillStyle='rgba(248,112,108,0.7)';
    ctx.fillText('■ 誤りビット', startX+220, H-16);
  }

  dataSel.addEventListener('change',draw);
  errSl.addEventListener('input',draw);
  draw(); window.addEventListener('resize',draw);
})();

// ===== Nim ゲーム =====
(()=>{
  const container=document.getElementById('nim-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const aSl=document.getElementById('nim-a'), aVal=document.getElementById('nim-a-val');
  const bSl=document.getElementById('nim-b'), bVal=document.getElementById('nim-b-val');

  // ニム和(XOR)でP/N局面を判定
  function isP(a,b){ return (a^b)===0; }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||260;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const maxA=parseInt(aSl.value), maxB=parseInt(bSl.value);
    aVal.textContent=maxA; bVal.textContent=maxB;

    const cellW=Math.min(52,(W-80)/(maxA+1));
    const cellH=Math.min(52,(H-80)/(maxB+1));
    const ox=W/2-(maxA*cellW)/2, oy=H/2+(maxB*cellH)/2;

    // ゲーム木 (グリッド形式: x=山1, y=山2)
    for(let a=0;a<=maxA;a++) for(let b=0;b<=maxB;b++){
      const p=isP(a,b);
      const cx=ox+a*cellW, cy=oy-b*cellH;
      ctx.fillStyle=p?'rgba(248,112,108,0.3)':'rgba(109,204,152,0.2)';
      ctx.fillRect(cx-cellW/2+2,cy-cellH/2+2,cellW-4,cellH-4);
      ctx.strokeStyle=p?'rgba(248,112,108,0.6)':'rgba(109,204,152,0.5)';
      ctx.lineWidth=(a===maxA&&b===maxB)?2.5:0.7; ctx.strokeRect(cx-cellW/2+2,cy-cellH/2+2,cellW-4,cellH-4);
      ctx.fillStyle=p?'rgba(248,112,108,0.9)':'rgba(109,204,152,0.9)';
      ctx.font=`bold ${Math.min(13,cellW*0.3)}px sans-serif`; ctx.textAlign='center';
      ctx.fillText(p?'P':'N',cx,cy+4);
    }

    // 軸ラベル
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    for(let a=0;a<=maxA;a++) ctx.fillText(a,ox+a*cellW,oy+cellH/2+14);
    ctx.textAlign='right';
    for(let b=0;b<=maxB;b++) ctx.fillText(b,ox-cellW/2-4,oy-b*cellH+4);
    ctx.fillText('山1→',ox+maxA*cellW+cellW/2+20,oy+cellH/2+14);
    ctx.save(); ctx.translate(ox-cellW/2-16,oy-maxB*cellH-10);
    ctx.rotate(-Math.PI/2); ctx.textAlign='center';
    ctx.fillText('←山2',0,0); ctx.restore();

    // 現在局面のハイライト
    const cx=ox+maxA*cellW, cy=oy-maxB*cellH;
    ctx.strokeStyle='rgba(245,200,66,0.9)'; ctx.lineWidth=2.5;
    ctx.strokeRect(cx-cellW/2+2,cy-cellH/2+2,cellW-4,cellH-4);

    // ニム和
    const nim=maxA^maxB;
    ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
    ctx.fillText(`現局面(${maxA},${maxB}): ニム和=${maxA}^${maxB}=${nim}  → ${isP(maxA,maxB)?'P局面（後手勝ち）':'N局面（先手勝ち）'}`,W/2,H-10);
  }

  aSl.addEventListener('input',draw); bSl.addEventListener('input',draw);
  draw(); window.addEventListener('resize',draw);
})();
