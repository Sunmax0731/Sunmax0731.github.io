// ===== ケイリー表 =====
(function() {
  const groups = {
    z4: {
      elements: ['0','1','2','3'],
      op: (a,b) => (a+b)%4,
      desc: 'ℤ₄: 加法 mod 4。巡回群。位数4。',
    },
    z6: {
      elements: ['0','1','2','3','4','5'],
      op: (a,b) => (a+b)%6,
      desc: 'ℤ₆: 加法 mod 6。巡回群。位数6。',
    },
    s3: {
      elements: ['e','r','r²','s','sr','sr²'],
      op: (a,b) => {
        // 3次対称群の乗法表
        const table = [
          [0,1,2,3,4,5],
          [1,2,0,4,5,3],
          [2,0,1,5,3,4],
          [3,5,4,0,2,1],
          [4,3,5,1,0,2],
          [5,4,3,2,1,0],
        ];
        return table[a][b];
      },
      desc: 'S₃: 3つの要素の置換群。非可換。位数6。',
    },
    k4: {
      elements: ['e','a','b','c'],
      op: (x,y) => [[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]][x][y],
      desc: 'V₄: Kleinの四元群。全ての非単位元の位数が2。位数4。',
    },
  };

  const select = document.getElementById('group-select');
  const container = document.getElementById('cayley-table-container');
  const desc = document.getElementById('group-desc');

  function renderTable() {
    const g = groups[select.value];
    const n = g.elements.length;
    let html = '<table class="cayley-table"><tr><th>∘</th>';
    g.elements.forEach(e => { html += `<th>${e}</th>`; });
    html += '</tr>';
    for (let i = 0; i < n; i++) {
      html += `<tr><th>${g.elements[i]}</th>`;
      for (let j = 0; j < n; j++) {
        const result = typeof g.op(i,j) === 'number' ? g.elements[g.op(i,j)] : g.op(g.elements[i], g.elements[j]);
        const isIdentity = result === g.elements[0];
        html += `<td${isIdentity ? ' class="highlight-identity"' : ''}>${result}</td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    container.innerHTML = html;
    desc.textContent = g.desc;
  }

  select.addEventListener('change', renderTable);
  renderTable();
})();

// ===== 合同算術の可視化 (円形) =====
(function() {
  const container = document.getElementById('modular-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const nSlider = document.getElementById('mod-n');
  const kSlider = document.getElementById('mod-k');
  const nVal = document.getElementById('mod-n-val');
  const kVal = document.getElementById('mod-k-val');

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const n = parseInt(nSlider.value);
    const k = parseInt(kSlider.value);
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H) * 0.38;

    // 点を円周上に配置
    const pts = Array.from({length: n}, (_,i) => ({
      x: cx + R * Math.cos(i * 2*Math.PI/n - Math.PI/2),
      y: cy + R * Math.sin(i * 2*Math.PI/n - Math.PI/2),
    }));

    // 弦を描く (i → k*i mod n)
    ctx.lineWidth = 1.2;
    for (let i = 0; i < n; i++) {
      const j = (k * i) % n;
      const hue = (i / n) * 360;
      ctx.strokeStyle = `hsla(${hue},70%,60%,0.6)`;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
    }

    // 点
    pts.forEach((p,i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
      const hue = (i/n)*360;
      ctx.fillStyle = `hsl(${hue},70%,60%)`;
      ctx.fill();
      ctx.fillStyle = '#e8e8f8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const labelR = R + 16;
      ctx.fillText(i, cx + labelR*Math.cos(i*2*Math.PI/n - Math.PI/2),
                      cy + labelR*Math.sin(i*2*Math.PI/n - Math.PI/2) + 4);
    });

    ctx.fillStyle = 'rgba(200,200,230,0.6)'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`i → ${k}·i (mod ${n})`, cx, H-10);
  }

  nSlider.addEventListener('input', () => { nVal.textContent = nSlider.value; draw(); });
  kSlider.addEventListener('input', () => { kVal.textContent = kSlider.value; draw(); });
  draw();
  window.addEventListener('resize', draw);
})();

// ===== 線型変換 =====
(function() {
  const container = document.getElementById('linear-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const sliders = {
    a: document.getElementById('mat-a'), b: document.getElementById('mat-b'),
    c: document.getElementById('mat-c'), d: document.getElementById('mat-d'),
  };
  const vals = {
    a: document.getElementById('mat-a-val'), b: document.getElementById('mat-b-val'),
    c: document.getElementById('mat-c-val'), d: document.getElementById('mat-d-val'),
  };

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const a = parseFloat(sliders.a.value), b = parseFloat(sliders.b.value);
    const c = parseFloat(sliders.c.value), d = parseFloat(sliders.d.value);
    const det = a*d - b*c;

    const cx = W/2, cy = H/2;
    const scale = Math.min(W,H) * 0.15;

    // 元のグリッド（グレー）
    ctx.strokeStyle = 'rgba(100,100,160,0.3)'; ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i*scale, cy - 4*scale);
      ctx.lineTo(cx + i*scale, cy + 4*scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 4*scale, cy + i*scale);
      ctx.lineTo(cx + 4*scale, cy + i*scale);
      ctx.stroke();
    }

    // 変換後のグリッド
    function transform(px, py) {
      return { x: cx + (a*px + b*py)*scale, y: cy - (c*px + d*py)*scale };
    }

    ctx.strokeStyle = 'rgba(62,207,202,0.4)'; ctx.lineWidth = 1.5;
    for (let i = -4; i <= 4; i++) {
      const s1 = transform(i, -4), e1 = transform(i, 4);
      ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(e1.x, e1.y); ctx.stroke();
      const s2 = transform(-4, i), e2 = transform(4, i);
      ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(e2.x, e2.y); ctx.stroke();
    }

    // 変換後の軸ベクトル
    const ex = transform(1, 0), ey_end = transform(0, 1);
    ctx.strokeStyle = '#f8706c'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex.x, ex.y); ctx.stroke();
    ctx.strokeStyle = '#4ab8d8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ey_end.x, ey_end.y); ctx.stroke();

    // 行列と行列式の表示
    ctx.fillStyle = '#e8e8f8'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`[${a.toFixed(1)}, ${b.toFixed(1)}]`, 8, 18);
    ctx.fillText(`[${c.toFixed(1)}, ${d.toFixed(1)}]`, 8, 34);
    ctx.fillStyle = det > 0 ? '#6dcc98' : det < 0 ? '#f8706c' : '#f5c842';
    ctx.fillText(`det = ${det.toFixed(2)}`, 8, 56);
  }

  Object.entries(sliders).forEach(([k, sl]) => {
    sl.addEventListener('input', () => {
      vals[k].textContent = parseFloat(sl.value).toFixed(1);
      draw();
    });
  });
  draw();
  window.addEventListener('resize', draw);
})();

// ===== 圏論の可換図式 =====
(function() {
  const container = document.getElementById('category-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  let t = 0;

  function drawArrow(ctx, x1, y1, x2, y2, color, label, offset=0) {
    const dx = x2-x1, dy = y2-y1;
    const len = Math.sqrt(dx*dx+dy*dy);
    const nx = dx/len, ny = dy/len;
    // 少しオフセット
    const ox = -ny * offset, oy = nx * offset;
    const sx = x1+nx*20+ox, sy = y1+ny*20+oy;
    const ex = x2-nx*20+ox, ey = y2-ny*20+oy;

    ctx.strokeStyle = color; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

    // 矢印
    const angle = Math.atan2(ey-sy, ex-sx);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex-10*Math.cos(angle-0.4), ey-10*Math.sin(angle-0.4));
    ctx.lineTo(ex-10*Math.cos(angle+0.4), ey-10*Math.sin(angle+0.4));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();

    // ラベル
    const mx = (sx+ex)/2 - ny*14 + ox;
    const my = (sy+ey)/2 + nx*14 + oy;
    ctx.fillStyle = color; ctx.font = 'italic 12px serif'; ctx.textAlign = 'center';
    ctx.fillText(label, mx, my);
  }

  function drawObject(ctx, x, y, label, color) {
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = color; ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
    ctx.textBaseline = 'alphabetic';
  }

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const mx = W/2, my = H/2;
    const r = Math.min(W,H) * 0.28;

    // 4つの対象
    const A = {x: mx-r, y: my-r*0.6, label:'A', color:'#7c6cf8'};
    const B = {x: mx+r, y: my-r*0.6, label:'B', color:'#4ab8d8'};
    const C = {x: mx-r, y: my+r*0.6, label:'C', color:'#3ecfca'};
    const D = {x: mx+r, y: my+r*0.6, label:'D', color:'#6dcc98'};

    drawArrow(ctx, A.x, A.y, B.x, B.y, '#a78bfa', 'f');
    drawArrow(ctx, A.x, A.y, C.x, C.y, '#5eead4', 'g');
    drawArrow(ctx, B.x, B.y, D.x, D.y, '#7dd3fc', 'k');
    drawArrow(ctx, C.x, C.y, D.x, D.y, '#86efac', 'h');
    // 合成
    drawArrow(ctx, A.x, A.y, D.x, D.y, 'rgba(245,200,66,0.5)', 'h∘g = k∘f', -18);

    // 可換ラベル
    ctx.fillStyle = 'rgba(200,200,230,0.5)'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('可換図式: h∘g = k∘f', mx, H-10);

    [A,B,C,D].forEach(o => drawObject(ctx, o.x, o.y, o.label, o.color));
  }

  draw();
  window.addEventListener('resize', draw);
})();
// ===== 楕円曲線 =====
(function() {
  const container = document.getElementById('elliptic-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const aSl=document.getElementById('ec-a'), bSl=document.getElementById('ec-b'), pxSl=document.getElementById('ec-px');
  const aVal=document.getElementById('ec-a-val'), bVal=document.getElementById('ec-b-val'), pxVal=document.getElementById('ec-px-val');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const a=parseFloat(aSl.value), b=parseFloat(bSl.value);
    const Δ=-16*(4*a*a*a+27*b*b); // 判別式
    const pad=35;
    const xMin=-3, xMax=3, yMin=-4, yMax=4;

    function sx(x){return pad+(x-xMin)/(xMax-xMin)*(W-2*pad);}
    function sy(y){return pad+(1-(y-yMin)/(yMax-yMin))*(H-2*pad);}

    // グリッド・軸
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [-3,-2,-1,0,1,2,3].forEach(v=>{
      ctx.beginPath();ctx.moveTo(sx(v),pad);ctx.lineTo(sx(v),H-pad);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pad,sy(v));ctx.lineTo(W-pad,sy(v));ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(W-pad,sy(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx(0),pad);ctx.lineTo(sx(0),H-pad);ctx.stroke();
    ctx.fillStyle='rgba(150,150,180,0.4)'; ctx.font='10px monospace'; ctx.textAlign='center';
    [-2,-1,1,2].forEach(v=>{ctx.fillText(v,sx(v),sy(0)+14);});
    ctx.textAlign='right';
    [-3,-2,-1,1,2,3].forEach(v=>{ctx.fillText(v,sx(0)-4,sy(v)+4);});

    // 楕円曲線の描画 (y² = x³+ax+b)
    if(Δ!==0){
      // 上側 y>0
      for(let sign of [1,-1]){
        ctx.beginPath(); let first=true;
        for(let i=0;i<=800;i++){
          const x=xMin+(xMax-xMin)*i/800;
          const rhs=x*x*x+a*x+b;
          if(rhs<0){first=true;continue;}
          const y=sign*Math.sqrt(rhs);
          const p={x:sx(x),y:sy(y)};
          if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y);
        }
        const g=ctx.createLinearGradient(pad,0,W-pad,0);
        g.addColorStop(0,'rgba(62,207,202,0.9)'); g.addColorStop(1,'rgba(109,204,152,0.9)');
        ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.stroke();
      }

      // 点加算 P + P = 2P の可視化
      const px=parseFloat(pxSl.value);
      const py2=px*px*px+a*px+b;
      if(py2>=0){
        const py=Math.sqrt(py2);
        // 接線の傾き: dy/dx = (3x²+a)/(2y)
        if(py>0.01){
          const slope=(3*px*px+a)/(2*py);
          // 接線: 2P の x座標 = slope²-2px
          const qx=slope*slope-2*px;
          const qy2=qx*qx*qx+a*qx+b;

          // 接線
          ctx.strokeStyle='rgba(245,200,66,0.6)'; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
          const t1=xMin, t2=xMax;
          ctx.beginPath(); ctx.moveTo(sx(t1),sy(py+slope*(t1-px))); ctx.lineTo(sx(t2),sy(py+slope*(t2-px))); ctx.stroke();
          ctx.setLineDash([]);

          // 点P
          ctx.beginPath(); ctx.arc(sx(px),sy(py),6,0,Math.PI*2);
          ctx.fillStyle='#fde68a'; ctx.fill();
          ctx.strokeStyle='white'; ctx.lineWidth=1.5; ctx.stroke();
          ctx.fillStyle='#fde68a'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
          ctx.fillText('P',sx(px),sy(py)-10);

          // 2P
          if(qy2>=0){
            const qy=Math.sqrt(qy2);
            ctx.beginPath(); ctx.arc(sx(qx),sy(-qy),6,0,Math.PI*2);
            ctx.fillStyle='#f8706c'; ctx.fill();
            ctx.strokeStyle='white'; ctx.lineWidth=1.5; ctx.stroke();
            // 反射の縦線
            ctx.strokeStyle='rgba(248,112,108,0.4)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
            ctx.beginPath(); ctx.moveTo(sx(qx),sy(qy)); ctx.lineTo(sx(qx),sy(-qy)); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle='#fca5a5'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
            ctx.fillText('2P',sx(qx),sy(-qy)-10);
          }
        }
      }
    }

    // 情報
    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`y² = x³ ${a>=0?'+':''}${a}x ${b>=0?'+':''}${b}`, pad+4, pad+14);
    ctx.fillStyle=Δ!==0?'#86efac':'#fca5a5';
    ctx.fillText(`Δ = ${Δ.toFixed(2)} ${Δ!==0?'(非特異)':'(特異点あり)'}`, pad+4, pad+28);
  }

  [aSl,bSl,pxSl].forEach((sl,i)=>{
    sl.addEventListener('input',()=>{ [aVal,bVal,pxVal][i].textContent=parseFloat(sl.value).toFixed(1+(i===2?1:0)); draw(); });
  });
  draw();
  window.addEventListener('resize',draw);
})();

// ===== 対称群 Dₙ =====
(function() {
  const container = document.getElementById('symmetry-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const nSlider = document.getElementById('sym-n');
  const nVal = document.getElementById('sym-n-val');
  const opSel = document.getElementById('sym-op');
  let animT = 0, animId, targetAngle = 0, currentAngle = 0;

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const n=parseInt(nSlider.value), op=opSel.value;
    const R=Math.min(W,H)*0.34, cx=W/2, cy=H/2;

    function drawPolygon(angle, reflected, alpha) {
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(angle);
      if(reflected) ctx.scale(1,-1);

      // 内側の対称軸
      ctx.strokeStyle=`rgba(62,207,202,${alpha*0.2})`; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      for(let i=0;i<n;i++){
        const a=i*2*Math.PI/n;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(R*Math.cos(a),R*Math.sin(a)); ctx.stroke();
      }
      ctx.setLineDash([]);

      // 多角形
      ctx.beginPath();
      for(let i=0;i<=n;i++){
        const a=i*2*Math.PI/n-Math.PI/2;
        if(i===0) ctx.moveTo(R*Math.cos(a),R*Math.sin(a));
        else ctx.lineTo(R*Math.cos(a),R*Math.sin(a));
      }
      ctx.fillStyle=`rgba(62,207,202,${alpha*0.12})`; ctx.fill();
      ctx.strokeStyle=`rgba(62,207,202,${alpha})`; ctx.lineWidth=2; ctx.stroke();

      // 頂点ラベル
      for(let i=0;i<n;i++){
        const a=i*2*Math.PI/n-Math.PI/2;
        const px=R*Math.cos(a), py=R*Math.sin(a);
        ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${180+i*360/n},70%,65%,${alpha})`; ctx.fill();
        ctx.fillStyle=`hsla(${180+i*360/n},70%,80%,${alpha*0.9})`;
        ctx.font='11px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(i+1, px*1.18, py*1.18);
        ctx.textBaseline='alphabetic';
      }
      ctx.restore();
    }

    // 元の位置（薄く）
    drawPolygon(0, false, 0.3);

    // 変換後
    if(op==='none') drawPolygon(0,false,1);
    else if(op==='rot1') drawPolygon(2*Math.PI/n,false,1);
    else if(op==='ref') drawPolygon(0,true,1);

    // 変換の説明
    const labels={none:'単位元 e (恒等変換)',rot1:`回転 r (2π/${n} = ${(360/n).toFixed(1)}°)`,ref:'反射 s (x軸に関する反射)'};
    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='center';
    ctx.fillText(labels[op], W/2, H-10);
    ctx.fillStyle='rgba(62,207,202,0.7)'; ctx.font='11px monospace';
    ctx.fillText(`D${n}  |D${n}|=${2*n}  (${n}回転 + ${n}反射)`, W/2, 20);
  }

  nSlider.addEventListener('input',()=>{nVal.textContent=nSlider.value; draw();});
  opSel.addEventListener('change', draw);
  draw();
  window.addEventListener('resize',draw);
})();

// ===== 固有値・固有ベクトル =====
(function() {
  const container = document.getElementById('eigen-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const aSlider = document.getElementById('eigen-a');
  const dSlider = document.getElementById('eigen-d');
  const aVal = document.getElementById('eigen-a-val');
  const dVal = document.getElementById('eigen-d-val');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const a=parseFloat(aSlider.value), d=parseFloat(dSlider.value);
    // 対角行列 [[a,0],[0,d]] の固有値は a, d
    const λ1=a, λ2=d;
    const cx=W/2, cy=H/2, scale=Math.min(W,H)*0.14;

    // グリッド・軸
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [-3,-2,-1,0,1,2,3].forEach(i=>{
      ctx.beginPath();ctx.moveTo(cx+i*scale,0);ctx.lineTo(cx+i*scale,H);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,cy+i*scale);ctx.lineTo(W,cy+i*scale);ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();

    // 単位円を変換したあとの楕円
    ctx.beginPath();
    for(let i=0;i<=360;i++){
      const θ=i*Math.PI/180;
      const tx=cx+a*Math.cos(θ)*scale, ty=cy-d*Math.sin(θ)*scale;
      if(i===0) ctx.moveTo(tx,ty); else ctx.lineTo(tx,ty);
    }
    ctx.strokeStyle='rgba(62,207,202,0.6)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(62,207,202,0.05)'; ctx.fill();

    // 単位円
    ctx.beginPath(); ctx.arc(cx,cy,scale,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);

    // 固有ベクトル（対角行列なので x軸・y軸方向）
    const vecs=[
      {vx:1,vy:0,λ:λ1,color:'#f8706c',label:`λ₁=${λ1.toFixed(1)}, v₁=(1,0)`},
      {vx:0,vy:1,λ:λ2,color:'#4ab8d8',label:`λ₂=${λ2.toFixed(1)}, v₂=(0,1)`},
    ];
    vecs.forEach(v=>{
      const ex=cx+v.λ*v.vx*scale, ey=cy-v.λ*v.vy*scale;
      ctx.strokeStyle=v.color; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey); ctx.stroke();
      const angle=Math.atan2(ey-cy,ex-cx);
      ctx.beginPath();
      ctx.moveTo(ex,ey);
      ctx.lineTo(ex-10*Math.cos(angle-0.4),ey-10*Math.sin(angle-0.4));
      ctx.lineTo(ex-10*Math.cos(angle+0.4),ey-10*Math.sin(angle+0.4));
      ctx.closePath(); ctx.fillStyle=v.color; ctx.fill();
    });

    // 情報
    ctx.font='11px monospace'; ctx.textAlign='left';
    vecs.forEach((v,i)=>{
      ctx.fillStyle=v.color;
      ctx.fillText(v.label, 8, 18+i*16);
    });
    ctx.fillStyle='rgba(200,200,230,0.5)';
    ctx.fillText(`行列 [[${a},0],[0,${d}]]  (対角行列)`, 8, H-8);
  }

  aSlider.addEventListener('input',()=>{aVal.textContent=parseFloat(aSlider.value).toFixed(1);draw();});
  dSlider.addEventListener('input',()=>{dVal.textContent=parseFloat(dSlider.value).toFixed(1);draw();});
  draw();
  window.addEventListener('resize',draw);
})();

// ===== RSA暗号 =====
(function() {
  function gcd(a,b){return b===0?a:gcd(b,a%b);}
  function modpow(base,exp,mod){let r=1;base%=mod;while(exp>0){if(exp%2===1)r=r*base%mod;exp=Math.floor(exp/2);base=base*base%mod;}return r;}
  function modinv(a,m){for(let x=1;x<m;x++) if((a*x)%m===1) return x;return -1;}

  function render() {
    const p=parseInt(document.getElementById('rsa-p').value);
    const q=parseInt(document.getElementById('rsa-q').value);
    const M=parseInt(document.getElementById('rsa-msg').value);
    const result=document.getElementById('rsa-result');

    if(p===q){result.innerHTML='<span style="color:var(--color-change)">p ≠ q である素数を選んでください</span>';return;}
    const n=p*q;
    const φ=(p-1)*(q-1);
    // e: φと互いに素な数を探す
    let e=3;
    while(e<φ&&gcd(e,φ)!==1) e+=2;
    const d=modinv(e,φ);

    if(M>=n){result.innerHTML=`<span style="color:var(--color-change)">メッセージ M は n=${n} 未満にしてください</span>`;return;}

    const C=modpow(M,e,n);
    const M2=modpow(C,d,n);

    result.innerHTML=`
      <div style="display:grid;gap:4px;">
        <div><span style="color:var(--text-muted)">素数:</span> <span style="color:#5eead4">p=${p}, q=${q}</span></div>
        <div><span style="color:var(--text-muted)">公開鍵:</span> <span style="color:#a78bfa">n=${n}, e=${e}</span></div>
        <div><span style="color:var(--text-muted)">秘密鍵:</span> <span style="color:#fca5a5">d=${d}</span></div>
        <div><span style="color:var(--text-muted)">φ(n):</span> <span style="color:var(--text-secondary)">(p-1)(q-1)=${φ}</span></div>
        <hr style="border-color:var(--border);margin:4px 0;">
        <div><span style="color:var(--text-muted)">平文:</span> <span style="color:#e8e8f8;font-size:1.1em">M=${M}</span></div>
        <div><span style="color:var(--text-muted)">暗号化:</span> C = M^e mod n = ${M}^${e} mod ${n} = <span style="color:#f5c842;font-size:1.1em">${C}</span></div>
        <div><span style="color:var(--text-muted)">復号化:</span> M = C^d mod n = ${C}^${d} mod ${n} = <span style="color:#86efac;font-size:1.1em">${M2}</span></div>
        <div style="color:${M2===M?'#86efac':'#f8706c'}">${M2===M?'✓ 復号成功!' : '✗ エラー'}</div>
      </div>`;
  }

  document.getElementById('rsa-btn').addEventListener('click', render);
  ['rsa-p','rsa-q'].forEach(id=>document.getElementById(id).addEventListener('change',render));
  render();
})();

// ===== ガロア理論 =====
(()=>{
  const container=document.getElementById('galois-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const polySel=document.getElementById('galois-poly');
  const permBtn=document.getElementById('galois-perm-btn');

  let permStep=0, animId=null;

  // xⁿ=1 の根 (単位根)
  function getRoots(poly){
    const n={'x2_1':2,'x3_1':3,'x4_1':4,'x5_1':5}[poly]||3;
    return Array.from({length:n},(_,k)=>[Math.cos(2*Math.PI*k/n),Math.sin(2*Math.PI*k/n)]);
  }

  // ガロア群の置換リスト (巡回シフト + 回転)
  function getPerms(poly){
    const n={'x2_1':2,'x3_1':3,'x4_1':4,'x5_1':5}[poly]||3;
    const perms=[];
    for(let s=0;s<n;s++) perms.push(Array.from({length:n},(_,k)=>(k+s)%n));
    return perms;
  }

  let currentPerm=null, prevPerm=null, animT=0;

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||280;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const poly=polySel.value;
    const roots=getRoots(poly);
    const n=roots.length;
    const perms=getPerms(poly);
    const perm=perms[permStep%perms.length];
    const cx=W/2, cy=H/2, R=Math.min(W,H)*0.35;

    // 単位円
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI);
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.stroke();

    // 実軸・虚軸
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(cx-R-20,cy); ctx.lineTo(cx+R+20,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-R-20); ctx.lineTo(cx,cy+R+20); ctx.stroke();

    // 根を結ぶ多角形
    ctx.beginPath();
    roots.forEach(([x,y],i)=>{
      const px=cx+x*R, py=cy-y*R;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    });
    ctx.closePath();
    ctx.strokeStyle='rgba(62,207,202,0.3)'; ctx.lineWidth=1; ctx.stroke();

    // 置換後の根への矢印
    roots.forEach(([x,y],i)=>{
      const j=perm[i];
      const [x2,y2]=roots[j];
      const sx=cx+x*R, sy=cy-y*R;
      const ex=cx+x2*R, ey=cy-y2*R;
      if(i!==j){
        const mx=(sx+ex)/2+((sy-ey)*0.2), my=(sy+ey)/2-((sx-ex)*0.2);
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.quadraticCurveTo(mx,my,ex,ey);
        ctx.strokeStyle='rgba(245,200,66,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
      }
    });

    // 根の点とラベル
    roots.forEach(([x,y],i)=>{
      const px=cx+x*R, py=cy-y*R;
      ctx.beginPath(); ctx.arc(px,py,8,0,2*Math.PI);
      ctx.fillStyle='rgba(62,207,202,0.9)'; ctx.fill();
      ctx.fillStyle='#0d0f14'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
      ctx.fillText(i,px,py+4);
      // ラベル外側
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px monospace';
      ctx.fillText(`ζ${n}${i>0?i:''}`,px+(x*R>0?12:-12),py-(y*R>0?12:-12));
    });

    // 置換の表示
    const permStr=`(${perm.join(' ')})`;
    ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
    ctx.fillText(`置換: ${permStr}  (${permStep%perms.length+1}/${perms.length})`, W/2, H-12);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif';
    ctx.fillText(`Gal(x${n}−1/ℚ) ≅ ℤ/${n}ℤ  (巡回群, 可解)`, W/2, H-28);
  }

  permBtn.addEventListener('click',()=>{ permStep++; draw(); });
  polySel.addEventListener('change',()=>{ permStep=0; draw(); });
  draw(); window.addEventListener('resize',draw);
})();

// ===== テンソル積 =====
(()=>{
  const container=document.getElementById('tensor-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const a1Sl=document.getElementById('ten-a1'), a1Val=document.getElementById('ten-a1-val');
  const a2Sl=document.getElementById('ten-a2'), a2Val=document.getElementById('ten-a2-val');

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||280;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const a1=parseFloat(a1Sl.value)*Math.PI/180;
    const a2=parseFloat(a2Sl.value)*Math.PI/180;

    // 3次元ベクトル (x,y,z) -> 3×3テンソル
    const u=[Math.cos(a1),Math.sin(a1)*0.8,Math.sin(a1)*0.6];
    const v=[Math.cos(a2),Math.sin(a2)*0.8,Math.sin(a2)*0.6];
    // 正規化
    const unorm=Math.sqrt(u.reduce((s,x)=>s+x*x,0));
    const vnorm=Math.sqrt(v.reduce((s,x)=>s+x*x,0));
    const un=u.map(x=>x/unorm), vn=v.map(x=>x/vnorm);

    // テンソル T[i][j] = u[i]*v[j]
    const T=un.map(ui=>vn.map(vj=>ui*vj));
    const n=3;

    // ヒートマップ (右半分)
    const hmX=W/2+20, hmY=40, cellSize=Math.min((W/2-60)/n,(H-80)/n);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('u ⊗ v (rank-1 行列)', hmX+(n*cellSize)/2, hmY-14);
    ['x','y','z'].forEach((l,i)=>{
      ctx.fillStyle='rgba(62,207,202,0.7)'; ctx.font='10px monospace'; ctx.textAlign='center';
      ctx.fillText(l,hmX+i*cellSize+cellSize/2,hmY-2);
      ctx.fillText(l,hmX-12,hmY+i*cellSize+cellSize/2+4);
    });
    for(let i=0;i<n;i++) for(let j=0;j<n;j++){
      const val=T[i][j];
      const r=val>0?Math.round(val*180):0, b=val<0?Math.round(-val*180):0;
      ctx.fillStyle=`rgba(${r},80,${b},0.8)`;
      ctx.fillRect(hmX+j*cellSize,hmY+i*cellSize,cellSize-2,cellSize-2);
      ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      ctx.fillText(val.toFixed(2),hmX+j*cellSize+cellSize/2,hmY+i*cellSize+cellSize/2+4);
    }

    // 左: ベクトル矢印
    const ax=W/4, ay=H/2, sc=H*0.32;
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(ax-sc,ay); ctx.lineTo(ax+sc,ay); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax,ay-sc); ctx.lineTo(ax,ay+sc); ctx.stroke();

    function arrow(ox,oy,dx,dy,col,lbl){
      const ex=ox+dx*sc, ey=oy-dy*sc;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ex,ey);
      ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke();
      ctx.beginPath();
      const d=Math.sqrt(dx*dx+dy*dy)||1;
      ctx.moveTo(ex,ey);
      ctx.lineTo(ex-(dx/d*0.1+dy/d*0.06)*sc,ey+(dy/d*0.1-dx/d*0.06)*sc);
      ctx.lineTo(ex-(dx/d*0.1-dy/d*0.06)*sc,ey+(dy/d*0.1+dx/d*0.06)*sc);
      ctx.closePath(); ctx.fillStyle=col; ctx.fill();
      ctx.fillStyle=col; ctx.font='bold 13px serif'; ctx.textAlign='center';
      ctx.fillText(lbl,ex+dx*14,ey-dy*14+4);
    }
    arrow(ax,ay,un[0],un[1],'rgba(62,207,202,0.9)','u');
    arrow(ax,ay,vn[0],vn[1],'rgba(248,112,108,0.9)','v');

    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('u, v ∈ ℝ³', ax, H-12);
  }

  a1Sl.addEventListener('input',()=>{a1Val.textContent=a1Sl.value+'°';draw();});
  a2Sl.addEventListener('input',()=>{a2Val.textContent=a2Sl.value+'°';draw();});
  draw(); window.addEventListener('resize',draw);
})();

// ===== スペクトル系列 =====
(()=>{
  const container=document.getElementById('spectral-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const rSl=document.getElementById('spec-r'), rVal=document.getElementById('spec-r-val');

  // 簡単な例: S¹上のS¹ファイバー束 → T²のコホモロジーを計算
  // E²_{p,q} = H^p(S¹) ⊗ H^q(S¹)
  // H^k(S¹) = ℤ if k=0,1; 0 otherwise
  // E²_{p,q}: 非零 at (0,0),(1,0),(0,1),(1,1)
  function getPage(r){
    // 各ページで消えるセルをシミュレート
    // E2: {(0,0):1,(1,0):1,(0,1):1,(1,1):1}
    // E3以降: d2=0 (この例では), 収束
    const cells={};
    // pmax=2, qmax=2
    for(let p=0;p<=3;p++) for(let q=0;q<=3;q++){
      let rank=0;
      if(p<=1&&q<=1) rank=1; // E2 page
      if(r>=3){
        // d2: (0,1)→(2,0) — but (2,0) doesn't exist in H*(S¹), so d2=0
        // stays the same
      }
      cells[`${p},${q}`]=rank;
    }
    return cells;
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||300;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const r=parseInt(rSl.value);
    rVal.textContent=`E${r===2?'²':r===3?'³':r===4?'⁴':'⁵'}`;
    const cells=getPage(r);

    const pMax=3, qMax=3;
    const pad=60, cellW=(W-pad-40)/(pMax+1), cellH=(H-pad-30)/(qMax+1);
    const ox=pad, oy=H-pad;

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(ox,30); ctx.lineTo(ox,oy); ctx.lineTo(W-30,oy); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('p (底空間方向)',W/2,H-8);
    ctx.save(); ctx.translate(16,H/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('q (ファイバー方向)',0,0); ctx.restore();

    // 目盛り
    for(let p=0;p<=pMax;p++){
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px monospace'; ctx.textAlign='center';
      ctx.fillText(p,ox+p*cellW+cellW/2,oy+14);
    }
    for(let q=0;q<=qMax;q++){
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px monospace'; ctx.textAlign='right';
      ctx.fillText(q,ox-6,oy-q*cellH-cellH/2+4);
    }

    // セル
    for(let p=0;p<=pMax;p++) for(let q=0;q<=qMax;q++){
      const rank=cells[`${p},${q}`]||0;
      const cx=ox+p*cellW, cy=oy-(q+1)*cellH;
      ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=0.5;
      ctx.strokeRect(cx,cy,cellW,cellH);
      if(rank>0){
        ctx.fillStyle='rgba(62,207,202,0.2)'; ctx.fillRect(cx,cy,cellW,cellH);
        ctx.fillStyle='rgba(62,207,202,0.9)'; ctx.font='bold 14px serif'; ctx.textAlign='center';
        ctx.fillText('ℤ',cx+cellW/2,cy+cellH/2+5);
      } else {
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='12px serif'; ctx.textAlign='center';
        ctx.fillText('0',cx+cellW/2,cy+cellH/2+5);
      }
    }

    // 微分 dᵣ の矢印 (r=2の時だけ)
    if(r===2){
      // d2: (p,q)→(p+2,q-1)
      for(let p=0;p<=pMax-2;p++) for(let q=1;q<=qMax;q++){
        const s=(cells[`${p},${q}`]||0)>0&&(cells[`${p+2},${q-1}`]||0)>0;
        if(s){
          const sx=ox+p*cellW+cellW*0.8, sy_=oy-q*cellH-cellH/2;
          const ex=ox+(p+2)*cellW+cellW*0.2, ey=oy-(q-1)*cellH-cellH/2;
          ctx.beginPath(); ctx.moveTo(sx,sy_); ctx.lineTo(ex,ey);
          ctx.strokeStyle='rgba(245,200,66,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
          const dx=ex-sx, dy=ey-sy_, len=Math.sqrt(dx*dx+dy*dy);
          ctx.beginPath();
          ctx.moveTo(ex,ey);
          ctx.lineTo(ex-dx/len*8+dy/len*4,ey-dy/len*8-dx/len*4);
          ctx.lineTo(ex-dx/len*8-dy/len*4,ey-dy/len*8+dx/len*4);
          ctx.closePath(); ctx.fillStyle='rgba(245,200,66,0.7)'; ctx.fill();
          ctx.fillStyle='rgba(245,200,66,0.8)'; ctx.font='10px monospace'; ctx.textAlign='center';
          ctx.fillText('d₂',(sx+ex)/2-6,(sy_+ey)/2-6);
        }
      }
    }

    // タイトル
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='bold 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText(`E${r} ページ — T²=S¹×S¹ のコホモロジー計算`, ox, 22);
    if(r>=3){
      ctx.fillStyle='rgba(62,207,202,0.8)'; ctx.font='11px monospace';
      ctx.fillText('収束: H⁰=ℤ, H¹=ℤ², H²=ℤ (トーラスのコホモロジー)', ox, 38);
    }
  }

  rSl.addEventListener('input',()=>{ draw(); });
  draw(); window.addEventListener('resize',draw);
})();
