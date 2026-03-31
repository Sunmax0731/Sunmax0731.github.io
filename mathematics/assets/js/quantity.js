// ===== 複素数平面の可視化 =====
(function() {
  const container = document.getElementById('complex-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  const angleSlider = document.getElementById('complex-angle');
  const rSlider = document.getElementById('complex-r');
  const angleVal = document.getElementById('complex-angle-val');
  const rVal = document.getElementById('complex-r-val');

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const θ = parseFloat(angleSlider.value) * Math.PI / 180;
    const r = parseFloat(rSlider.value);

    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) * 0.38;

    // グリッド
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale / 2, 0);
      ctx.lineTo(cx + i * scale / 2, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cy + i * scale / 2);
      ctx.lineTo(W, cy + i * scale / 2);
      ctx.stroke();
    }

    // 軸
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // 軸ラベル
    ctx.fillStyle = '#555577';
    ctx.font = '12px monospace';
    ctx.fillText('Re', W - 24, cy - 8);
    ctx.fillText('Im', cx + 8, 18);

    // 単位円
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(124,108,248,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 角度弧
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 0.25, -θ, 0, θ > 0);
    ctx.strokeStyle = 'rgba(248,112,108,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // θ ラベル
    const θLabelR = scale * 0.35;
    ctx.fillStyle = '#f8706c';
    ctx.font = '13px serif';
    ctx.fillText('θ', cx + θLabelR * Math.cos(-θ/2) - 4, cy - θLabelR * Math.sin(-θ/2) + 4);

    // r·e^(iθ) ベクトル
    const zx = cx + r * scale * Math.cos(θ);
    const zy = cy - r * scale * Math.sin(θ);

    const grad = ctx.createLinearGradient(cx, cy, zx, zy);
    grad.addColorStop(0, 'rgba(124,108,248,0.3)');
    grad.addColorStop(1, 'rgba(124,108,248,1)');
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(zx, zy);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 矢印
    const arrowAngle = Math.atan2(zy - cy, zx - cx);
    const arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(zx, zy);
    ctx.lineTo(zx - arrowSize * Math.cos(arrowAngle - 0.4), zy - arrowSize * Math.sin(arrowAngle - 0.4));
    ctx.lineTo(zx - arrowSize * Math.cos(arrowAngle + 0.4), zy - arrowSize * Math.sin(arrowAngle + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#7c6cf8';
    ctx.fill();

    // 点
    ctx.beginPath();
    ctx.arc(zx, zy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#a78bfa';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 座標ラベル
    const re = (r * Math.cos(θ)).toFixed(2);
    const im = (r * Math.sin(θ)).toFixed(2);
    ctx.fillStyle = '#e8e8f8';
    ctx.font = 'bold 13px monospace';
    const labelX = zx + (zx > cx ? 10 : -80);
    const labelY = zy + (zy > cy ? 20 : -10);
    ctx.fillText(`${re} + ${im}i`, Math.max(4, Math.min(W-80, labelX)), Math.max(16, Math.min(H-4, labelY)));

    // 実軸・虚軸への射影
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(zx, zy); ctx.lineTo(zx, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(zx, zy); ctx.lineTo(cx, zy); ctx.stroke();
    ctx.setLineDash([]);
  }

  angleSlider.addEventListener('input', () => {
    angleVal.textContent = angleSlider.value + '°';
    draw();
  });
  rSlider.addEventListener('input', () => {
    rVal.textContent = parseFloat(rSlider.value).toFixed(2);
    draw();
  });
  draw();
  window.addEventListener('resize', draw);
})();

// ===== エラトステネスの篩 =====
(function() {
  const container = document.getElementById('sieve-viz');
  const nSlider = document.getElementById('sieve-n');
  const nVal = document.getElementById('sieve-n-val');
  const stepBtn = document.getElementById('sieve-step-btn');
  const resetBtn = document.getElementById('sieve-reset-btn');

  let N = 100;
  let sieve = [];
  let currentP = 2;
  let done = false;

  function init() {
    N = parseInt(nSlider.value);
    sieve = Array(N + 1).fill(true);
    sieve[0] = sieve[1] = false;
    currentP = 2;
    done = false;
    render();
  }

  function step() {
    if (done) return;
    while (currentP <= N && !sieve[currentP]) currentP++;
    if (currentP * currentP > N) { done = true; render(); return; }
    for (let j = currentP * currentP; j <= N; j += currentP) sieve[j] = false;
    currentP++;
    render();
  }

  function render() {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
      gap: 3px;
    `;
    const primes = [];
    for (let i = 2; i <= N; i++) {
      const cell = document.createElement('div');
      cell.textContent = i;
      cell.style.cssText = `
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 10px;
        font-family: monospace;
        font-weight: 600;
        transition: background 0.2s;
      `;
      if (sieve[i]) {
        primes.push(i);
        cell.style.background = 'rgba(124,108,248,0.3)';
        cell.style.color = '#a78bfa';
        cell.style.border = '1px solid rgba(124,108,248,0.5)';
      } else {
        cell.style.background = 'rgba(255,255,255,0.03)';
        cell.style.color = '#333355';
        cell.style.border = '1px solid rgba(255,255,255,0.05)';
      }
      grid.appendChild(cell);
    }
    container.appendChild(grid);

    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 0; font-size: 0.8rem; color: var(--text-muted);';
    info.textContent = `${primes.length} 個の素数が見つかりました${done ? '（完了）' : `（現在 p=${currentP}）`}`;
    container.appendChild(info);
  }

  nSlider.addEventListener('input', () => { nVal.textContent = nSlider.value; init(); });
  stepBtn.addEventListener('click', step);
  resetBtn.addEventListener('click', init);
  init();
})();

// ===== 数の包含関係 =====
(function() {
  const container = document.getElementById('number-sets-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');

    const sets = [
      { label: 'ℂ 複素数', r: 0.48, color: 'rgba(124,108,248,' },
      { label: 'ℝ 実数',   r: 0.38, color: 'rgba(74,184,216,' },
      { label: 'ℚ 有理数', r: 0.28, color: 'rgba(62,207,202,' },
      { label: 'ℤ 整数',   r: 0.19, color: 'rgba(109,204,152,' },
      { label: 'ℕ 自然数', r: 0.11, color: 'rgba(245,200,66,' },
    ];

    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.45;

    sets.forEach((s, i) => {
      const r = s.r * maxR * 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.65, 0, 0, Math.PI * 2);
      ctx.strokeStyle = s.color + '0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = s.color + '0.04)';
      ctx.fill();

      ctx.fillStyle = s.color + '0.9)';
      ctx.font = `${11 + i}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.label, cx, cy - r * 0.6 + 14);
    });

    // 例示
    const examples = [
      { text: '2+3i', x: 0.78, y: 0.5 },
      { text: 'π', x: 0.65, y: 0.45 },
      { text: '½', x: 0.57, y: 0.42 },
      { text: '-3', x: 0.5, y: 0.4 },
      { text: '5', x: 0.5, y: 0.55 },
    ];
    examples.forEach(e => {
      ctx.fillStyle = 'rgba(200,200,230,0.6)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(e.text, W * e.x, H * e.y);
    });
  }
  draw();
  window.addEventListener('resize', draw);
})();

// ===== 黄金比の可視化（黄金矩形の分割） =====
(function() {
  const container = document.getElementById('golden-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  let t = 0;

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const phi = (1 + Math.sqrt(5)) / 2;
    const colors = ['#7c6cf8','#4ab8d8','#3ecfca','#6dcc98','#f5c842','#f8706c'];

    // 黄金矩形の繰り返し分割
    const margin = 30;
    let x = margin, y = margin;
    let w = W - 2 * margin, h = H - 2 * margin;

    for (let i = 0; i < 8; i++) {
      const c = colors[i % colors.length];
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // 四分の一円
      ctx.beginPath();
      if (w > h) {
        const sq = h;
        ctx.arc(x + sq, y + sq, sq, Math.PI, Math.PI * 1.5);
        x += sq; w -= sq;
      } else {
        const sq = w;
        ctx.arc(x, y + sq, sq, -Math.PI/2, 0);
        y += sq; h -= sq;
      }
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (w < 4 || h < 4) break;
    }

    // ラベル
    ctx.fillStyle = 'rgba(200,200,230,0.6)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`φ = ${phi.toFixed(8)}...`, margin, H - 10);
  }

  draw();
  window.addEventListener('resize', draw);
})();
// ===== 四元数の3D回転 =====
(function() {
  const container = document.getElementById('quat-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const xSl=document.getElementById('quat-x'), ySl=document.getElementById('quat-y'), zSl=document.getElementById('quat-z');
  const xVal=document.getElementById('quat-x-val'), yVal=document.getElementById('quat-y-val'), zVal=document.getElementById('quat-z-val');
  const animBtn=document.getElementById('quat-anim-btn');
  let angle=0, animating=false, animId;

  // 四元数による回転: q = cos(θ/2) + sin(θ/2)(xi+yj+zk)
  function quatRotate(v, ax, ay, az, θ) {
    const len = Math.sqrt(ax*ax+ay*ay+az*az)||1;
    ax/=len; ay/=len; az/=len;
    const s=Math.sin(θ/2), c=Math.cos(θ/2);
    const qw=c, qi=s*ax, qj=s*ay, qk=s*az;
    // v' = q * v * q^-1  (純四元数として)
    const vx=v[0], vy=v[1], vz=v[2];
    // 展開式
    const rx = vx*(qw*qw+qi*qi-qj*qj-qk*qk) + 2*vy*(qi*qj-qw*qk) + 2*vz*(qi*qk+qw*qj);
    const ry = 2*vx*(qi*qj+qw*qk) + vy*(qw*qw-qi*qi+qj*qj-qk*qk) + 2*vz*(qj*qk-qw*qi);
    const rz = 2*vx*(qi*qk-qw*qj) + 2*vy*(qj*qk+qw*qi) + vz*(qw*qw-qi*qi-qj*qj+qk*qk);
    return [rx, ry, rz];
  }

  // 立方体の頂点と辺
  const cubeVerts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const cubeEdges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const faceColors = ['#7c6cf8','#4ab8d8','#f8706c','#6dcc98','#f5c842','#a78bfa'];
  const cubeFaces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[0,3,7,4]];

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const ax=parseFloat(xSl.value), ay=parseFloat(ySl.value), az=parseFloat(zSl.value);
    const cx=W/2, cy=H/2, scale=Math.min(W,H)*0.22;

    // 回転後の頂点
    const rotVerts = cubeVerts.map(v => quatRotate(v, ax, ay, az, angle));

    // 等角投影
    function project([x,y,z]) {
      const cosA=Math.cos(0.4), sinA=Math.sin(0.4);
      const cosB=Math.cos(0.3), sinB=Math.sin(0.3);
      const x2=x*cosA-z*sinA, z2=x*sinA+z*cosA;
      const y2=y*cosB-z2*sinB, z3=y*sinB+z2*cosB;
      return {x: cx+x2*scale, y: cy-y2*scale, z: z3};
    }
    const pts = rotVerts.map(project);

    // 面（奥から順に描画）
    const facesWithDepth = cubeFaces.map((f,i) => ({
      face:f, color:faceColors[i],
      depth: f.reduce((s,v)=>s+pts[v].z,0)/f.length
    })).sort((a,b)=>a.depth-b.depth);

    facesWithDepth.forEach(({face,color,depth})=>{
      ctx.beginPath();
      face.forEach((v,i)=>{ if(i===0) ctx.moveTo(pts[v].x,pts[v].y); else ctx.lineTo(pts[v].x,pts[v].y); });
      ctx.closePath();
      ctx.fillStyle = color+'22'; ctx.fill();
      ctx.strokeStyle = color+'aa'; ctx.lineWidth=1.5; ctx.stroke();
    });

    // 頂点
    pts.forEach((p,i)=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2);
      ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.fill();
    });

    // 回転軸ベクトル表示
    const len=Math.sqrt(ax*ax+ay*ay+az*az)||1;
    const [arx,ary,arz]=[ax/len,ay/len,az/len];
    const axPt=project([arx*1.6,ary*1.6,arz*1.6]);
    ctx.strokeStyle='rgba(245,200,66,0.8)'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(axPt.x,axPt.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#fde68a'; ctx.font='bold 11px monospace'; ctx.textAlign='left';
    ctx.fillText('回転軸', axPt.x+4, axPt.y);

    // 四元数の値
    const θ=angle;
    const s2=Math.sin(θ/2), c2=Math.cos(θ/2);
    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`q = ${c2.toFixed(3)} + ${(s2*arx).toFixed(3)}i`, 8, H-52);
    ctx.fillText(`    + ${(s2*ary).toFixed(3)}j + ${(s2*arz).toFixed(3)}k`, 8, H-36);
    ctx.fillText(`θ = ${(θ*180/Math.PI%360).toFixed(1)}°`, 8, H-20);
  }

  animBtn.addEventListener('click', ()=>{
    animating=!animating;
    animBtn.textContent=animating?'⏸ 停止':'▶ 回転';
    if(animating){ (function loop(){draw();angle+=0.025;animId=requestAnimationFrame(loop);})(); }
    else cancelAnimationFrame(animId);
  });
  [xSl,ySl,zSl].forEach((sl,i)=>{
    sl.addEventListener('input',()=>{
      [xVal,yVal,zVal][i].textContent=parseFloat(sl.value).toFixed(2);
      if(!animating) draw();
    });
  });
  draw();
  window.addEventListener('resize',()=>{ if(!animating) draw(); });
})();

// ===== 数直線上の有理数と無理数 =====
(function() {
  const container = document.getElementById('numline-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const qSl=document.getElementById('numline-q');
  const qVal=document.getElementById('numline-q-val');
  const modeSel=document.getElementById('numline-mode');

  const IRRATIONALS = [
    {v:Math.PI, label:'π', color:'#f8706c'},
    {v:Math.E,  label:'e', color:'#4ab8d8'},
    {v:Math.SQRT2, label:'√2', color:'#6dcc98'},
    {v:Math.sqrt(3), label:'√3', color:'#a78bfa'},
    {v:(1+Math.sqrt(5))/2, label:'φ', color:'#f5c842'},
    {v:Math.log(2), label:'ln2', color:'#fca5a5'},
    {v:Math.sqrt(5), label:'√5', color:'#5eead4'},
    {v:Math.PI/2, label:'π/2', color:'#fde68a'},
  ];

  function gcd(a,b){return b===0?a:gcd(b,a%b);}

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const maxQ=parseInt(qSl.value), mode=modeSel.value;
    const xMin=0, xMax=Math.PI+0.3;
    const padL=30, padR=20, lineY=H*0.45;
    const W2=W-padL-padR;
    function sx(v){return padL+((v-xMin)/(xMax-xMin))*W2;}

    // 数直線
    ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(padL,lineY); ctx.lineTo(W-padR,lineY); ctx.stroke();

    // 整数目盛り
    for(let n=0;n<=Math.floor(xMax);n++){
      const x=sx(n);
      ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(x,lineY-8); ctx.lineTo(x,lineY+8); ctx.stroke();
      ctx.fillStyle='rgba(200,200,230,0.8)'; ctx.font='12px monospace'; ctx.textAlign='center';
      ctx.fillText(n,x,lineY+22);
    }

    // 有理数
    if(mode==='both'||mode==='rational') {
      const rationals=[];
      for(let q=1;q<=maxQ;q++){
        for(let p=0;p<=Math.floor(xMax*q)+1;p++){
          const v=p/q;
          if(v>xMax) continue;
          if(gcd(p,q)===1) rationals.push({v,p,q});
        }
      }
      // 分母でグループ化し高さを変える
      rationals.forEach(({v,p,q})=>{
        const x=sx(v);
        const hue=((q-1)/maxQ)*240+180; // 分母小=青、大=紫
        const tickH=Math.max(4, 20*(1-(q-1)/maxQ));
        ctx.strokeStyle=`hsla(${hue},70%,65%,${0.3+0.7/q})`;
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x,lineY-tickH); ctx.lineTo(x,lineY+tickH); ctx.stroke();
        if(q<=4&&p>0){
          ctx.fillStyle=`hsla(${hue},70%,75%,0.9)`;
          ctx.font='9px monospace'; ctx.textAlign='center';
          ctx.fillText(`${p}/${q}`,x,lineY-tickH-2);
        }
      });
    }

    // 無理数
    if(mode==='both'||mode==='irrational') {
      IRRATIONALS.filter(ir=>ir.v<xMax).forEach(ir=>{
        const x=sx(ir.v);
        ctx.strokeStyle=ir.color; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(x,lineY-28); ctx.lineTo(x,lineY+28); ctx.stroke();
        ctx.beginPath(); ctx.arc(x,lineY,5,0,Math.PI*2);
        ctx.fillStyle=ir.color; ctx.fill();
        ctx.fillStyle=ir.color; ctx.font='bold 11px monospace'; ctx.textAlign='center';
        ctx.fillText(ir.label,x,lineY-32);
        ctx.fillStyle='rgba(200,200,230,0.5)'; ctx.font='9px monospace';
        ctx.fillText(ir.v.toFixed(3),x,lineY+40);
      });
    }

    // 凡例
    const legend=mode==='rational'?`有理数 p/q  (q ≤ ${maxQ})  色=分母の大きさ`:
                 mode==='irrational'?'主な無理数 (色付き縦線)':
                 `有理数 (q ≤ ${maxQ}) + 主な無理数`;
    ctx.fillStyle='rgba(200,200,230,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(legend, W/2, H-8);
  }

  qSl.addEventListener('input',()=>{qVal.textContent=qSl.value;draw();});
  modeSel.addEventListener('change',draw);
  draw();
  window.addEventListener('resize',draw);
})();

// ===== フィボナッチ数列と黄金比 =====
(function() {
  const container = document.getElementById('fib-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const nSlider = document.getElementById('fib-n');
  const nVal = document.getElementById('fib-n-val');

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const n = parseInt(nSlider.value);
    const fibs = [1, 1];
    for (let i=2; i<n; i++) fibs.push(fibs[i-1]+fibs[i-2]);

    const ratios = fibs.slice(1).map((v,i) => v/fibs[i]);
    const phi = (1+Math.sqrt(5))/2;

    const padL=60, padR=20, padT=30, padB=50;
    const W2=W-padL-padR, H2=H-padT-padB;
    const yMin=1.3, yMax=2.0;

    // グリッド
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [1.4,1.5,1.6,1.7,1.8,1.9,2.0].forEach(v=>{
      const y=padT+H2*(1-(v-yMin)/(yMax-yMin));
      ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();
    });

    // φ の水平線
    const phiY = padT+H2*(1-(phi-yMin)/(yMax-yMin));
    ctx.strokeStyle='rgba(245,200,66,0.5)'; ctx.lineWidth=1.5; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(padL,phiY); ctx.lineTo(W-padR,phiY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#fde68a'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`φ≈${phi.toFixed(6)}`, padL+4, phiY-4);

    // 比率の折れ線
    ctx.beginPath();
    ratios.forEach((r,i)=>{
      const x=padL+W2*i/(ratios.length-1);
      const y=padT+H2*(1-(Math.min(yMax,Math.max(yMin,r))-yMin)/(yMax-yMin));
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle='#a78bfa'; ctx.lineWidth=2.5; ctx.stroke();

    // 点
    ratios.forEach((r,i)=>{
      const x=padL+W2*i/(ratios.length-1);
      const y=padT+H2*(1-(Math.min(yMax,Math.max(yMin,r))-yMin)/(yMax-yMin));
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fillStyle='#c4b5fd'; ctx.fill();
      // フィボナッチ値ラベル
      if(i<ratios.length-1){
        ctx.fillStyle='rgba(150,150,200,0.5)'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText(`F${i+2}=${fibs[i+1]}`,x,H-padB+14);
      }
    });

    // 軸ラベル
    ctx.fillStyle='rgba(150,150,180,0.7)'; ctx.font='10px monospace'; ctx.textAlign='right';
    [1.4,1.6,1.8,2.0].forEach(v=>{
      const y=padT+H2*(1-(v-yMin)/(yMax-yMin));
      ctx.fillText(v.toFixed(1), padL-4, y+4);
    });
    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.textAlign='center';
    ctx.fillText(`F(n+1)/F(n) の比率 → φ (n=${n})`, W/2, H-4);
  }

  nSlider.addEventListener('input', ()=>{ nVal.textContent=nSlider.value; draw(); });
  draw();
  window.addEventListener('resize', draw);
})();

// ===== 素因数分解の木 =====
(function() {
  const input = document.getElementById('factor-input');
  const btn = document.getElementById('factor-btn');
  const result = document.getElementById('factor-result');

  function factorize(n) {
    const factors = [];
    let d = 2;
    while (d*d <= n) {
      while (n%d===0) { factors.push(d); n=Math.floor(n/d); }
      d++;
    }
    if (n>1) factors.push(n);
    return factors;
  }

  function buildTree(n, factors, depth=0) {
    if (factors.length===0) return `<div style="display:inline-block;text-align:center;margin:0 6px;">
      <div style="width:44px;height:44px;border-radius:50%;background:rgba(124,108,248,0.3);border:2px solid var(--color-quantity);display:flex;align-items:center;justify-content:center;font-family:monospace;font-weight:700;color:#a78bfa;font-size:14px;">${n}</div>
    </div>`;

    const p = factors[0];
    const rest = n/p;
    const isPrime = (x) => {
      if(x<2) return false;
      for(let i=2;i*i<=x;i++) if(x%i===0) return false;
      return true;
    };
    const pColor = '#c4b5fd';
    const restFactors = factors.slice(1);
    const nodeColor = isPrime(n) ? 'rgba(124,108,248,0.3)' : 'rgba(62,207,202,0.15)';
    const borderColor = isPrime(n) ? 'var(--color-quantity)' : 'var(--color-structure)';
    const textColor = isPrime(n) ? '#a78bfa' : '#5eead4';

    return `
    <div style="display:inline-block;text-align:center;margin:0 4px;vertical-align:top;">
      <div style="width:44px;height:44px;border-radius:50%;background:${nodeColor};border:2px solid ${borderColor};display:flex;align-items:center;justify-content:center;font-family:monospace;font-weight:700;color:${textColor};font-size:13px;margin:0 auto;">${n}</div>
      <div style="display:flex;justify-content:center;gap:8px;margin-top:6px;">
        <div style="text-align:center;position:relative;">
          <div style="width:1px;height:16px;background:rgba(255,255,255,0.2);margin:0 auto;"></div>
          <div style="width:44px;height:44px;border-radius:50%;background:rgba(124,108,248,0.4);border:2px solid var(--color-quantity);display:flex;align-items:center;justify-content:center;font-family:monospace;font-weight:700;color:${pColor};font-size:13px;">${p}</div>
        </div>
        <div style="text-align:center;">
          <div style="width:1px;height:16px;background:rgba(255,255,255,0.2);margin:0 auto;"></div>
          ${buildTree(rest, restFactors, depth+1)}
        </div>
      </div>
    </div>`;
  }

  function render() {
    const n = parseInt(input.value);
    if (isNaN(n)||n<2||n>9999) { result.innerHTML='<p style="color:var(--color-change);padding:1rem;">2〜9999の整数を入力してください</p>'; return; }
    const factors = factorize(n);
    const grouped = {};
    factors.forEach(f=>{ grouped[f]=(grouped[f]||0)+1; });
    const expr = Object.entries(grouped).map(([p,e])=>e>1?`${p}^${e}`:p).join(' × ');

    result.innerHTML = `
      <div style="margin-bottom:1rem;">
        <span style="font-family:monospace;font-size:1.2rem;color:#e8e8f8;">${n}</span>
        <span style="color:var(--text-muted);margin:0 0.5rem;">=</span>
        <span style="font-family:monospace;font-size:1.2rem;color:#a78bfa;">${expr}</span>
      </div>
      <div style="overflow-x:auto;padding:0.5rem 0;">${buildTree(n, factors)}</div>
    `;
  }

  btn.addEventListener('click', render);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') render(); });
  render();
})();

// ===== カントールの対角線論法 =====
(function() {
  const container = document.getElementById('cantor-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const stepBtn = document.getElementById('cantor-step-btn');
  const resetBtn = document.getElementById('cantor-reset-btn');
  const statusSpan = document.getElementById('cantor-status');

  // [0,1] の実数リストを小数で表現（仮想的に）
  const ROWS = 8;
  let digits; // ROWS x COLS の数字グリッド
  let diag = []; // 対角成分
  let newNum = []; // 対角と異なる新しい数
  let step = 0;

  function reset() {
    digits = Array.from({length:ROWS}, (_,r) =>
      Array.from({length:ROWS}, (_,c) => Math.floor(Math.random()*10))
    );
    diag = [];
    newNum = [];
    step = 0;
    statusSpan.textContent = '「全ての実数をリストできる」と仮定する';
    draw();
  }

  function nextStep() {
    if (step < ROWS) {
      diag.push(digits[step][step]);
      newNum.push((digits[step][step]+1)%10);
      step++;
      if (step < ROWS) statusSpan.textContent = `対角成分 d${step} = ${diag[step-1]} → 新しい数の${step}桁目: ${newNum[step-1]}`;
      else statusSpan.textContent = `新しい数 0.${newNum.join('')}... はリストのどこにも存在しない！→ 矛盾`;
      draw();
    }
  }

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const cellW = Math.min(36, (W-120)/ROWS);
    const cellH = 28;
    const ox = 80, oy = 20;

    // ヘッダ
    ctx.fillStyle='rgba(150,150,200,0.6)'; ctx.font='11px monospace'; ctx.textAlign='right';
    ctx.fillText('番号', 70, oy+cellH*0.7);
    ctx.textAlign='center';
    ctx.fillText('0.', ox-10, oy+cellH*0.7);
    for(let c=0;c<ROWS;c++){
      ctx.fillText(c+1, ox+c*cellW+cellW/2, oy+cellH*0.7);
    }

    digits.forEach((row, r) => {
      // 行ラベル
      ctx.fillStyle='rgba(150,150,200,0.5)'; ctx.font='10px monospace'; ctx.textAlign='right';
      ctx.fillText(`r${r+1}`, 68, oy+(r+1)*cellH+cellH*0.7);
      ctx.fillText('0.', ox-10, oy+(r+1)*cellH+cellH*0.7);

      row.forEach((digit, c) => {
        const x=ox+c*cellW, y=oy+(r+1)*cellH;
        const isDiag = r===c;
        const isHighlighted = isDiag && r < step;

        ctx.fillStyle = isHighlighted ? 'rgba(248,112,108,0.25)' : isDiag ? 'rgba(124,108,248,0.1)' : 'rgba(255,255,255,0.02)';
        ctx.fillRect(x+1, y+1, cellW-2, cellH-2);
        if(isHighlighted){
          ctx.strokeStyle='rgba(248,112,108,0.7)'; ctx.lineWidth=1.5;
          ctx.strokeRect(x+1,y+1,cellW-2,cellH-2);
        }

        ctx.fillStyle = isHighlighted ? '#fca5a5' : isDiag ? '#c4b5fd' : 'rgba(200,200,230,0.7)';
        ctx.font=`${isHighlighted?'bold ':''}12px monospace`; ctx.textAlign='center';
        ctx.fillText(digit, x+cellW/2, y+cellH*0.72);
      });
    });

    // 新しい数
    if (newNum.length > 0) {
      const ny = oy+(ROWS+1.5)*cellH;
      ctx.fillStyle='rgba(109,204,152,0.6)'; ctx.font='11px monospace'; ctx.textAlign='right';
      ctx.fillText('新数→', 68, ny+cellH*0.7);
      ctx.fillText('0.', ox-10, ny+cellH*0.7);
      newNum.forEach((d,c)=>{
        const x=ox+c*cellW, y=ny;
        ctx.fillStyle='rgba(109,204,152,0.2)';
        ctx.fillRect(x+1,y+1,cellW-2,cellH-2);
        ctx.strokeStyle='rgba(109,204,152,0.5)'; ctx.lineWidth=1;
        ctx.strokeRect(x+1,y+1,cellW-2,cellH-2);
        ctx.fillStyle='#86efac'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
        ctx.fillText(d,x+cellW/2,y+cellH*0.72);
      });
      if(newNum.length<ROWS){
        ctx.fillStyle='rgba(150,150,200,0.4)'; ctx.font='12px monospace'; ctx.textAlign='center';
        ctx.fillText('...', ox+newNum.length*cellW+cellW/2, ny+cellH*0.72);
      }
    }
  }

  stepBtn.addEventListener('click', nextStep);
  resetBtn.addEventListener('click', reset);
  reset();
  window.addEventListener('resize', draw);
})();

// ===== p進数 =====
(()=>{
  const container=document.getElementById('padic-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const pSl=document.getElementById('padic-p'), pValEl=document.getElementById('padic-p-val');
  const nSl=document.getElementById('padic-n'), nValEl=document.getElementById('padic-n-val');

  // |x|_p = p^{-v_p(x)},  v_p(x) = p-adic valuation
  function valuation(x,p){
    if(x===0) return Infinity;
    x=Math.abs(x); let v=0;
    while(x%p===0){x/=p;v++;}
    return v;
  }
  function padicNorm(x,p){ if(x===0)return 0; return Math.pow(p,-valuation(x,p)); }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||220;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const p=parseInt(pSl.value), N=parseInt(nSl.value);
    const pad=50, axY=H*0.55;
    const range=N+1, scaleX=(W-2*pad)/range;

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,axY); ctx.lineTo(W-pad,axY); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('整数 n', W/2, H-8);

    // 各整数のp進ノルムを棒グラフ+数直線で表示
    const maxNorm=1.0;
    for(let n=1;n<=N;n++){
      const norm=padicNorm(n,p);
      const x=pad+n*scaleX;
      const barH=norm*(H*0.38);
      const v=valuation(n,p);
      // バーの色: pの倍数ほど小さいノルム → 明度を変える
      const bright=Math.min(255,80+Math.round(norm*175));
      ctx.fillStyle=`rgba(124,108,248,${0.3+norm*0.7})`;
      ctx.fillRect(x-scaleX*0.35, axY-barH, scaleX*0.7, barH);
      // ノルム値
      if(scaleX>18){
        ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText(norm.toFixed(2), x, axY-barH-4);
        ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='9px sans-serif';
        ctx.fillText(n, x, axY+14);
      }
      // p進距離で0に近い点は下側に●
      const dotR=Math.max(2,8-barH/10);
      ctx.beginPath(); ctx.arc(x, axY+35, Math.max(2,(1-norm)*14+2),0,2*Math.PI);
      ctx.fillStyle=`rgba(124,108,248,${0.2+norm*0.6})`; ctx.fill();
    }

    // 説明
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText(`p = ${p}  p進ノルム |n|_p = p^{-v_p(n)}`, pad, 20);
    ctx.fillStyle='rgba(124,108,248,0.9)';
    ctx.fillText(`pの倍数ほど |n|_p が小さく「0に近い」`, pad, 36);
  }

  [pSl,nSl].forEach(sl=>sl.addEventListener('input',()=>{
    pValEl.textContent=pSl.value; nValEl.textContent=nSl.value; draw();
  }));
  draw(); window.addEventListener('resize',draw);
})();

// ===== 超限順序数 =====
(()=>{
  const canvas=document.createElement('canvas');
  document.getElementById('ordinal-viz').appendChild(canvas);
  const ctx=canvas.getContext('2d');

  const ordinals=[
    {label:'0',color:'#aaa',group:0},{label:'1',color:'#aaa',group:0},{label:'2',color:'#aaa',group:0},
    {label:'3',color:'#aaa',group:0},{label:'…',color:'#555',group:0},
    {label:'ω',color:'#7c6cf8',group:1},{label:'ω+1',color:'#7c6cf8',group:1},{label:'ω+2',color:'#7c6cf8',group:1},
    {label:'…',color:'#555',group:1},
    {label:'ω·2',color:'#f8706c',group:2},{label:'ω·2+1',color:'#f8706c',group:2},{label:'…',color:'#555',group:2},
    {label:'ω²',color:'#3ecfca',group:3},{label:'ω²+1',color:'#3ecfca',group:3},{label:'…',color:'#555',group:3},
    {label:'ω³',color:'#4ab8d8',group:4},{label:'…',color:'#555',group:4},
    {label:'ωω',color:'#f5c842',group:5}
  ];

  function draw(){
    const cont=document.getElementById('ordinal-viz');
    const W=cont.clientWidth||600, H=cont.clientHeight||200;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const pad=20, axY=H*0.52;
    const totalW=W-2*pad;
    // 各グループに幅を割り当て (対数的圧縮)
    const groupWidths=[0.18,0.18,0.15,0.15,0.14,0.2];
    let gx=pad;
    let idx=0;
    const groups=[[], [], [], [], [], []];
    ordinals.forEach(o=>groups[o.group].push(o));

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,axY); ctx.lineTo(W-pad,axY); ctx.stroke();
    // 矢印
    ctx.beginPath(); ctx.moveTo(W-pad-8,axY-5); ctx.lineTo(W-pad,axY); ctx.lineTo(W-pad-8,axY+5); ctx.stroke();

    groups.forEach((grp,gi)=>{
      const gw=totalW*groupWidths[gi];
      const itemW=gw/grp.length;
      grp.forEach((o,ii)=>{
        const x=gx+ii*itemW+itemW/2;
        if(o.label==='…'){
          ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='bold 14px serif'; ctx.textAlign='center';
          ctx.fillText('…', x, axY+4);
        } else {
          // 点
          ctx.beginPath(); ctx.arc(x, axY, 5, 0, 2*Math.PI);
          ctx.fillStyle=o.color; ctx.fill();
          // ラベル
          ctx.fillStyle=o.color; ctx.font=`bold ${gi>=3?13:11}px serif`; ctx.textAlign='center';
          ctx.fillText(o.label, x, axY-12);
        }
      });
      // グループ区切り線
      if(gi<groups.length-1){
        const bx=gx+gw;
        ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
        ctx.beginPath(); ctx.moveTo(bx,axY-40); ctx.lineTo(bx,axY+20); ctx.stroke(); ctx.setLineDash([]);
      }
      gx+=gw;
    });

    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('自然数 ℕ', pad, axY+30);
    ctx.fillStyle='rgba(124,108,248,0.8)';
    ctx.fillText('ω以降は「無限」の先', pad+80, axY+30);
  }
  draw(); window.addEventListener('resize',draw);
})();

// ===== 濃度の比較（自然数→整数の全単射） =====
(()=>{
  const canvas=document.createElement('canvas');
  document.getElementById('cardinality-viz').appendChild(canvas);
  const ctx=canvas.getContext('2d');
  let step=0, animId=null, running=false;

  const startBtn=document.getElementById('card-start-btn');
  const resetBtn=document.getElementById('card-reset-btn');

  // N→Z の全単射: 0→0, 1→1, 2→-1, 3→2, 4→-2, ...
  function f(n){ return n%2===0 ? n/2 : -(n+1)/2; }

  function draw(){
    const cont=document.getElementById('cardinality-viz');
    const W=cont.clientWidth||600, H=cont.clientHeight||220;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const maxN=Math.min(step,12);
    const topY=55, botY=165, pad=40;
    const nRange=13, zRange=13;
    const nW=(W-2*pad)/nRange, zW=(W-2*pad)/zRange;
    const zOff=6; // Z表示の中心オフセット

    ctx.font='12px sans-serif'; ctx.textAlign='center';

    // 上列: 自然数 0..maxN
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px sans-serif';
    ctx.fillText('ℕ（自然数）', W/2, topY-30);
    for(let n=0;n<=12;n++){
      const x=pad+n*nW+nW/2;
      ctx.beginPath(); ctx.arc(x,topY,8,0,2*Math.PI);
      ctx.fillStyle=n<=maxN?'rgba(124,108,248,0.9)':'rgba(255,255,255,0.1)'; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='10px monospace';
      ctx.fillText(n, x, topY+4);
    }

    // 下列: 整数 -6..6
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px sans-serif';
    ctx.fillText('ℤ（整数）', W/2, botY+28);
    for(let z=-6;z<=6;z++){
      const x=pad+(z+zOff)*zW+zW/2;
      const mapped=Array.from({length:maxN+1},(_,n)=>f(n)).includes(z);
      ctx.beginPath(); ctx.arc(x,botY,8,0,2*Math.PI);
      ctx.fillStyle=mapped?'rgba(248,112,108,0.9)':'rgba(255,255,255,0.1)'; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='10px monospace';
      ctx.fillText(z, x, botY+4);
    }

    // 矢印
    for(let n=0;n<=maxN;n++){
      const nx=pad+n*nW+nW/2;
      const zn=f(n);
      const zx=pad+(zn+zOff)*zW+zW/2;
      ctx.beginPath(); ctx.moveTo(nx,topY+10); ctx.lineTo(zx,botY-10);
      const alpha=n===maxN?0.95:0.3;
      ctx.strokeStyle=`rgba(245,200,66,${alpha})`; ctx.lineWidth=n===maxN?2:1;
      ctx.stroke();
      // 矢印頭
      const dx=zx-nx, dy=botY-10-(topY+10), len=Math.sqrt(dx*dx+dy*dy);
      const ux=dx/len, uy=dy/len;
      ctx.beginPath();
      ctx.moveTo(zx,botY-10);
      ctx.lineTo(zx-ux*7-uy*4,botY-10-uy*7+ux*4);
      ctx.lineTo(zx-ux*7+uy*4,botY-10-uy*7-ux*4);
      ctx.closePath(); ctx.fillStyle=`rgba(245,200,66,${alpha})`; ctx.fill();
    }

    // ラベル
    if(maxN>0){
      const n=maxN, zn=f(n);
      ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      ctx.fillText(`f(${n}) = ${zn}`, W/2, H-8);
    }
  }

  function tick(){
    if(step<12){ step++; draw(); animId=setTimeout(tick,700); }
    else { running=false; startBtn.textContent='▶ 再生'; }
  }

  startBtn.addEventListener('click',()=>{
    if(running){ clearTimeout(animId); running=false; startBtn.textContent='▶ 再生'; }
    else { running=true; startBtn.textContent='⏸ 停止'; tick(); }
  });
  resetBtn.addEventListener('click',()=>{
    clearTimeout(animId); running=false; step=0; startBtn.textContent='▶ 再生'; draw();
  });
  draw(); window.addEventListener('resize',draw);
})();
