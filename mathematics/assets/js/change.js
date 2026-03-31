// ===== 微分の可視化 =====
(function() {
  const container = document.getElementById('derivative-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const xSlider = document.getElementById('deriv-x');
  const xVal = document.getElementById('deriv-x-val');
  const fnSel = document.getElementById('deriv-fn');

  const fns = {
    sin: x => Math.sin(x),
    x2:  x => x * x,
    x3:  x => x * x * x,
    exp: x => Math.exp(x * 0.5),
  };
  const fnNames = { sin: 'sin(x)', x2: 'x²', x3: 'x³', exp: 'e^(x/2)' };

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.scale(dpr, dpr);

    const x0 = parseFloat(xSlider.value);
    const f  = fns[fnSel.value];
    const h  = 1e-7;
    const dy = (f(x0+h) - f(x0-h)) / (2*h);

    const pad = 40;
    const xMin = -4, xMax = 4;
    const yMin = -3, yMax = 3;

    function toScreen(mx, my) {
      return {
        x: pad + (mx - xMin) / (xMax - xMin) * (W - 2*pad),
        y: pad + (1 - (my - yMin) / (yMax - yMin)) * (H - 2*pad),
      };
    }

    // グリッド
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = xMin; i <= xMax; i++) {
      const s = toScreen(i, 0);
      ctx.beginPath(); ctx.moveTo(s.x, pad); ctx.lineTo(s.x, H-pad); ctx.stroke();
    }
    for (let i = yMin; i <= yMax; i++) {
      const s = toScreen(0, i);
      ctx.beginPath(); ctx.moveTo(pad, s.y); ctx.lineTo(W-pad, s.y); ctx.stroke();
    }

    // 軸
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
    const ox = toScreen(0,0);
    ctx.beginPath(); ctx.moveTo(pad, ox.y); ctx.lineTo(W-pad, ox.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox.x, pad); ctx.lineTo(ox.x, H-pad); ctx.stroke();

    // 関数曲線
    ctx.beginPath();
    let first = true;
    for (let i = 0; i <= 400; i++) {
      const x = xMin + (xMax - xMin) * i / 400;
      const y = f(x);
      if (!isFinite(y) || y < yMin - 2 || y > yMax + 2) { first = true; continue; }
      const s = toScreen(x, y);
      if (first) { ctx.moveTo(s.x, s.y); first = false; }
      else ctx.lineTo(s.x, s.y);
    }
    ctx.strokeStyle = '#f8706c'; ctx.lineWidth = 2.5; ctx.stroke();

    // 接線
    const tangent = x => f(x0) + dy * (x - x0);
    ctx.beginPath();
    const t1 = toScreen(xMin, tangent(xMin));
    const t2 = toScreen(xMax, tangent(xMax));
    ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y);
    ctx.strokeStyle = 'rgba(245,200,66,0.8)'; ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

    // 接点
    const p0 = toScreen(x0, f(x0));
    ctx.beginPath(); ctx.arc(p0.x, p0.y, 6, 0, Math.PI*2);
    ctx.fillStyle = '#fde68a'; ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke();

    // ラベル
    ctx.fillStyle = '#e8e8f8'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`f(x) = ${fnNames[fnSel.value]}`, pad + 4, pad + 16);
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`f'(${x0.toFixed(1)}) = ${dy.toFixed(3)}`, pad + 4, pad + 32);
  }

  xSlider.addEventListener('input', () => { xVal.textContent = parseFloat(xSlider.value).toFixed(1); draw(); });
  fnSel.addEventListener('change', draw);
  draw();
  window.addEventListener('resize', draw);
})();

// ===== リーマン和の可視化 =====
(function() {
  const container = document.getElementById('integral-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const nSlider = document.getElementById('riemann-n');
  const nVal = document.getElementById('riemann-n-val');
  const approxSpan = document.getElementById('riemann-approx');

  const f = x => Math.sin(x) + 1;
  const a = 0, b = Math.PI;

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.scale(dpr, dpr);

    const n = parseInt(nSlider.value);
    const pad = 40;
    const xMin = -0.5, xMax = 3.8, yMin = 0, yMax = 2.5;

    function toScreen(mx, my) {
      return {
        x: pad + (mx - xMin) / (xMax - xMin) * (W - 2*pad),
        y: pad + (1 - (my - yMin) / (yMax - yMin)) * (H - 2*pad),
      };
    }

    // グリッド
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const s = toScreen(i * Math.PI / 3, 0);
      ctx.beginPath(); ctx.moveTo(s.x, pad); ctx.lineTo(s.x, H-pad); ctx.stroke();
    }
    for (let i = 0; i <= 2; i++) {
      const s = toScreen(0, i);
      ctx.beginPath(); ctx.moveTo(pad, s.y); ctx.lineTo(W-pad, s.y); ctx.stroke();
    }

    // 軸
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
    const ox = toScreen(0, 0);
    ctx.beginPath(); ctx.moveTo(pad, ox.y); ctx.lineTo(W-pad, ox.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox.x, pad); ctx.lineTo(ox.x, H-pad); ctx.stroke();

    // リーマン矩形
    const dx = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x = a + (i + 0.5) * dx;
      const y = f(x);
      sum += y * dx;
      const p1 = toScreen(a + i * dx, 0);
      const p2 = toScreen(a + (i + 1) * dx, y);
      ctx.fillStyle = 'rgba(248,112,108,0.25)';
      ctx.fillRect(p1.x, p2.y, p2.x - p1.x, p1.y - p2.y);
      ctx.strokeStyle = 'rgba(248,112,108,0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(p1.x, p2.y, p2.x - p1.x, p1.y - p2.y);
    }

    approxSpan.textContent = sum.toFixed(4);

    // 関数
    ctx.beginPath();
    let first = true;
    for (let i = 0; i <= 400; i++) {
      const x = xMin + (xMax - xMin) * i / 400;
      const y = f(x);
      const s = toScreen(x, y);
      if (first) { ctx.moveTo(s.x, s.y); first = false; }
      else ctx.lineTo(s.x, s.y);
    }
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2.5; ctx.stroke();

    // ラベル
    ctx.fillStyle = '#e8e8f8'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
    ctx.fillText('f(x) = sin(x) + 1', pad+4, pad+16);
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`∫₀^π f dx ≈ ${sum.toFixed(4)}  (真値≈4.000)`, pad+4, pad+32);
  }

  nSlider.addEventListener('input', () => { nVal.textContent = nSlider.value; draw(); });
  draw();
  window.addEventListener('resize', draw);
})();

// ===== ローレンツアトラクター (Three.js 3D) =====
(function() {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('lorenz-viz');
  const sigSlider = document.getElementById('lorenz-sigma');
  const rhoSlider = document.getElementById('lorenz-rho');
  const sigVal    = document.getElementById('lorenz-sigma-val');
  const rhoVal    = document.getElementById('lorenz-rho-val');

  const W = container.clientWidth, H = 350;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080812);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
  camera.position.set(55, 35, 75);
  camera.lookAt(0, 25, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 25, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  // 座標軸
  const axisMat = new THREE.LineBasicMaterial({ color: 0x334466 });
  [
    [[-40,0,0],[40,0,0]],
    [[0,-5,0],[0,55,0]],
    [[0,0,-40],[0,0,40]]
  ].forEach(([a,b]) => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...a), new THREE.Vector3(...b)
    ]);
    scene.add(new THREE.Line(g, axisMat));
  });
  // 軸ラベル用スプライト
  function makeLabel(text, pos, col) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = col || '#8899cc';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 32, 24);
    const tex = new THREE.CanvasTexture(canvas);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sp.position.set(...pos);
    sp.scale.set(4, 2, 1);
    scene.add(sp);
  }
  makeLabel('x', [44, 0, 0]); makeLabel('z', [0, 58, 0]); makeLabel('y', [0, 0, 44]);

  let lineObj = null;
  let trailMat = new THREE.LineBasicMaterial({ vertexColors: true });
  let points = [];

  function reset() {
    points = [{ x: 0.1, y: 0, z: 0 }];
    if (lineObj) { scene.remove(lineObj); lineObj.geometry.dispose(); lineObj = null; }
  }

  function step() {
    const σ = parseFloat(sigSlider.value);
    const ρ = parseFloat(rhoSlider.value);
    const β = 8 / 3, dt = 0.005;
    for (let i = 0; i < 6; i++) {
      const p = points[points.length - 1];
      points.push({
        x: p.x + σ * (p.y - p.x) * dt,
        y: p.y + (p.x * (ρ - p.z) - p.y) * dt,
        z: p.z + (p.x * p.y - β * p.z) * dt
      });
    }
    if (points.length > 5000) points = points.slice(-5000);
    rebuildLine();
  }

  function rebuildLine() {
    if (lineObj) { scene.remove(lineObj); lineObj.geometry.dispose(); }
    const n = points.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const p = points[i];
      // Three.js座標: x=x, y=z(高さ), z=y
      pos[i*3]   = p.x;
      pos[i*3+1] = p.z;
      pos[i*3+2] = p.y;
      const t = i / n;
      col[i*3]   = 0.3 + t * 0.7;
      col[i*3+1] = t * 0.45;
      col[i*3+2] = 1.0 - t * 0.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    lineObj = new THREE.Line(geo, trailMat);
    scene.add(lineObj);
  }

  // 現在点マーカー
  const dotGeo  = new THREE.SphereGeometry(0.6, 8, 8);
  const dotMat  = new THREE.MeshBasicMaterial({ color: 0xfde68a });
  const dotMesh = new THREE.Mesh(dotGeo, dotMat);
  scene.add(dotMesh);

  function loop() {
    step();
    const p = points[points.length - 1];
    dotMesh.position.set(p.x, p.z, p.y);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  [sigSlider, rhoSlider].forEach(s => {
    s.addEventListener('input', () => {
      sigVal.textContent = sigSlider.value;
      rhoVal.textContent = rhoSlider.value;
      reset();
    });
  });
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });

  reset();
  loop();
})();

// ===== ベクトル場 =====
(function() {
  const container = document.getElementById('vector-field-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const typeSelect = document.getElementById('vf-type');

  const fields = {
    rotation: (x, y) => ({ vx: -y, vy: x }),
    gradient: (x, y) => ({ vx: x, vy: y }),
    saddle:   (x, y) => ({ vx: x, vy: -y }),
  };

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const field = fields[typeSelect.value];
    const nx = 14, ny = 10;
    const pad = 30;

    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        const sx = pad + ix / (nx - 1) * (W - 2*pad);
        const sy = pad + iy / (ny - 1) * (H - 2*pad);
        const mx = (ix / (nx-1)) * 4 - 2;
        const my = -((iy / (ny-1)) * 4 - 2);
        const { vx, vy } = field(mx, my);
        const len = Math.sqrt(vx*vx + vy*vy);
        const maxLen = 20;
        const scale = Math.min(maxLen / len, 15);
        const ex = sx + vx / len * scale;
        const ey = sy - vy / len * scale;

        const hue = Math.atan2(vy, vx) * 180 / Math.PI + 180;
        ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

        // 矢印
        const angle = Math.atan2(ey - sy, ex - sx);
        const arrowSize = 5;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - arrowSize * Math.cos(angle - 0.4), ey - arrowSize * Math.sin(angle - 0.4));
        ctx.lineTo(ex - arrowSize * Math.cos(angle + 0.4), ey - arrowSize * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fill();
      }
    }
  }

  typeSelect.addEventListener('change', draw);
  draw();
  window.addEventListener('resize', draw);
})();
// ===== 振り子の微分方程式 =====
(function() {
  const container = document.getElementById('pendulum-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const thetaSl=document.getElementById('pend-theta'), dampSl=document.getElementById('pend-damp');
  const thetaVal=document.getElementById('pend-theta-val'), dampVal=document.getElementById('pend-damp-val');
  const resetBtn=document.getElementById('pend-reset-btn');
  let θ, ω, trail, animId, t;

  function init() {
    θ = parseFloat(thetaSl.value)*Math.PI/180;
    ω = 0; trail = []; t = 0;
  }

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const γ=parseFloat(dampSl.value), g=9.8, L=1;
    const dt=0.02;
    for(let i=0;i<3;i++){
      const dω=-g/L*Math.sin(θ)-γ*ω;
      ω+=dω*dt; θ+=ω*dt; t+=dt;
    }
    trail.push({θ, t});
    if(trail.length>300) trail.shift();

    const pivotX=W*0.35, pivotY=H*0.15, rodLen=Math.min(W,H)*0.28;
    const bobX=pivotX+rodLen*Math.sin(θ), bobY=pivotY+rodLen*Math.cos(θ);

    // 振り子の軌跡
    if(trail.length>1){
      ctx.beginPath();
      trail.forEach(({θ:th},i)=>{
        const bx=pivotX+rodLen*Math.sin(th), by=pivotY+rodLen*Math.cos(th);
        if(i===0) ctx.moveTo(bx,by); else ctx.lineTo(bx,by);
      });
      ctx.strokeStyle='rgba(248,112,108,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
    }

    // 支点
    ctx.beginPath(); ctx.arc(pivotX,pivotY,5,0,Math.PI*2);
    ctx.fillStyle='rgba(200,200,230,0.5)'; ctx.fill();

    // 棒
    ctx.beginPath(); ctx.moveTo(pivotX,pivotY); ctx.lineTo(bobX,bobY);
    ctx.strokeStyle='rgba(200,200,230,0.6)'; ctx.lineWidth=2; ctx.stroke();

    // 重り
    ctx.beginPath(); ctx.arc(bobX,bobY,12,0,Math.PI*2);
    const grad=ctx.createRadialGradient(bobX-3,bobY-3,2,bobX,bobY,12);
    grad.addColorStop(0,'#fca5a5'); grad.addColorStop(1,'#f8706c');
    ctx.fillStyle=grad; ctx.fill();

    // 角度弧
    ctx.beginPath(); ctx.arc(pivotX,pivotY,40,-Math.PI/2,-Math.PI/2+θ, θ<0);
    ctx.strokeStyle='rgba(245,200,66,0.6)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#fde68a'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`θ=${(θ*180/Math.PI).toFixed(1)}°`, pivotX+45, pivotY+5);

    // 右側: 時系列グラフ
    const gx=W*0.55, gw=W*0.4, gy=H*0.5, gh=H*0.35;
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(gx,gy-gh);ctx.lineTo(gx,gy+gh);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+gw,gy);ctx.stroke();

    if(trail.length>1){
      const tStart=trail[0].t, tEnd=trail[trail.length-1].t;
      ctx.beginPath();
      trail.forEach(({θ:th,t:ti},i)=>{
        const x=gx+(ti-tStart)/(tEnd-tStart||1)*gw;
        const y=gy-th/(Math.PI)*gh;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.strokeStyle='#fca5a5'; ctx.lineWidth=1.8; ctx.stroke();
    }
    ctx.fillStyle='rgba(200,200,230,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('θ(t)', gx+gw/2, gy-gh-4);

    // エネルギー
    const g0=9.8, L0=1;
    const E=0.5*ω*ω*L0*L0+g0*L0*(1-Math.cos(θ));
    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.textAlign='left';
    ctx.fillText(`ω=${ω.toFixed(3)}  E=${E.toFixed(3)}`, 8, H-8);

    animId=requestAnimationFrame(draw);
  }

  thetaSl.addEventListener('input',()=>{thetaVal.textContent=thetaSl.value+'°'; init();});
  dampSl.addEventListener('input',()=>{dampVal.textContent=parseFloat(dampSl.value).toFixed(2);});
  resetBtn.addEventListener('click',init);
  init(); draw();
  window.addEventListener('resize',()=>{cancelAnimationFrame(animId); init(); draw();});
})();

// ===== 複素関数のドメイン着色 =====
(function() {
  const container = document.getElementById('complex-fn-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const fnSel=document.getElementById('cfn-select');
  const renderBtn=document.getElementById('cfn-render-btn');

  function hslToRgb(h,s,l){
    h/=360; const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
    const hue2rgb=(p,q,t)=>{ if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p; };
    return [hue2rgb(p,q,h+1/3)*255, hue2rgb(p,q,h)*255, hue2rgb(p,q,h-1/3)*255];
  }

  const fns = {
    z2:   ([re,im])=>{ return [re*re-im*im, 2*re*im]; },
    z3:   ([re,im])=>{ const r2=re*re-im*im; return [re*r2-im*2*re*im, im*r2+re*2*re*im]; },
    '1z': ([re,im])=>{ const d=re*re+im*im; return d<1e-10?[1e10,1e10]:[re/d,-im/d]; },
    ez:   ([re,im])=>{ const r=Math.exp(re); return [r*Math.cos(im), r*Math.sin(im)]; },
    sinz: ([re,im])=>{ return [Math.sin(re)*Math.cosh(im), Math.cos(re)*Math.sinh(im)]; },
  };

  function render() {
    const W=container.offsetWidth, H=container.offsetHeight;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');
    const fn=fns[fnSel.value];
    const xRange=3, yRange=3*H/W;
    const img=ctx.createImageData(W,H);

    for(let py=0;py<H;py++){
      for(let px=0;px<W;px++){
        const re=(px/W-0.5)*2*xRange, im=-(py/H-0.5)*2*yRange;
        const [fre,fim]=fn([re,im]);
        const arg=Math.atan2(fim,fre);
        const mag=Math.sqrt(fre*fre+fim*fim);
        // ドメイン着色: 偏角→色相, 絶対値→明度
        const hue=(arg/Math.PI+1)*180;
        const bri=0.5+0.4*Math.sin(Math.log(Math.max(mag,1e-10))*2);
        const [r,g,b]=hslToRgb(hue,0.9,Math.max(0.1,Math.min(0.9,bri)));
        const idx=(py*W+px)*4;
        img.data[idx]=r; img.data[idx+1]=g; img.data[idx+2]=b; img.data[idx+3]=255;
      }
    }
    ctx.putImageData(img,0,0);

    // 座標軸
    ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();

    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText('色相=偏角arg(f(z))  明度=|f(z)|', 6, H-8);
  }

  renderBtn.addEventListener('click', render);
  fnSel.addEventListener('change', render);
  setTimeout(render,100);
  window.addEventListener('resize',()=>setTimeout(render,200));
})();

// ===== 等差・等比数列 =====
(function() {
  const container = document.getElementById('sequence-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const typeSel=document.getElementById('seq-type');
  const rSl=document.getElementById('seq-r');
  const rVal=document.getElementById('seq-r-val');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const type=typeSel.value, r=parseFloat(rSl.value), a=1, N=25;
    let terms=[], sumTerms=[];

    if(type==='arith'){
      for(let n=1;n<=N;n++) terms.push(a+(n-1)*r*3);
    } else if(type==='geo'){
      for(let n=1;n<=N;n++) terms.push(a*Math.pow(r,n-1));
    } else {
      let s=0;
      for(let n=0;n<=N;n++){ s+=a*Math.pow(r,n); terms.push(a*Math.pow(r,n)); sumTerms.push(s); }
    }

    const pad=40;
    const allVals=[...terms,...sumTerms].filter(isFinite);
    const yMin=Math.min(...allVals,0)-0.1, yMax=Math.max(...allVals,0)+0.1;

    function sx(i){return pad+i/(terms.length-1)*(W-2*pad);}
    function sy(v){return pad+(1-(v-yMin)/(yMax-yMin))*(H-2*pad);}

    // グリッド
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    const step=MathUtils._niceStep?MathUtils._niceStep(yMax-yMin):1;
    const niceStep=(range)=>{const r=range/6,e=Math.pow(10,Math.floor(Math.log10(r)));const f=r/e;return f<1.5?e:f<3.5?2*e:f<7.5?5*e:10*e;};
    const ystep=niceStep(yMax-yMin);
    for(let v=Math.ceil(yMin/ystep)*ystep;v<=yMax;v+=ystep){
      const y=sy(v);
      ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke();
      ctx.fillStyle='rgba(150,150,180,0.5)'; ctx.font='10px monospace'; ctx.textAlign='right';
      ctx.fillText(v.toFixed(2),pad-4,y+4);
    }
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(W-pad,sy(0));ctx.stroke();

    // 級数の和
    if(type==='geosum'&&sumTerms.length>1){
      ctx.beginPath();
      sumTerms.forEach((v,i)=>{
        const p={x:sx(i),y:sy(v)};
        if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      });
      ctx.strokeStyle='rgba(245,200,66,0.7)'; ctx.lineWidth=2; ctx.setLineDash([5,3]); ctx.stroke(); ctx.setLineDash([]);
      // 収束値
      if(Math.abs(r)<1){
        const limit=a/(1-r);
        if(isFinite(limit)){
          ctx.strokeStyle='rgba(109,204,152,0.5)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
          ctx.beginPath();ctx.moveTo(pad,sy(limit));ctx.lineTo(W-pad,sy(limit));ctx.stroke();ctx.setLineDash([]);
          ctx.fillStyle='#86efac'; ctx.font='11px monospace'; ctx.textAlign='right';
          ctx.fillText(`収束値 a/(1-r)=${limit.toFixed(3)}`,W-pad-4,sy(limit)-4);
        }
      }
    }

    // 項の棒グラフ
    const bw=Math.max(4,(W-2*pad)/terms.length-2);
    terms.forEach((v,i)=>{
      if(!isFinite(v)) return;
      const x=sx(i), y0=sy(0), y1=sy(v);
      const hue=200+i*10;
      ctx.fillStyle=`hsla(${hue},70%,60%,0.7)`;
      ctx.fillRect(x-bw/2, Math.min(y0,y1), bw, Math.abs(y0-y1));
      ctx.beginPath(); ctx.arc(x,sy(v),3,0,Math.PI*2);
      ctx.fillStyle=`hsla(${hue},80%,75%,0.9)`; ctx.fill();
    });

    // ラベル
    const labels={arith:`等差数列 a=1, d=${(r*3).toFixed(2)}`, geo:`等比数列 a=1, r=${r.toFixed(2)}`, geosum:`等比級数 Σr^n  r=${r.toFixed(2)} (黄=累積和)`};
    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(labels[type], pad+4, pad+14);
  }

  typeSel.addEventListener('change',draw);
  rSl.addEventListener('input',()=>{rVal.textContent=parseFloat(rSl.value).toFixed(2);draw();});
  draw();
  window.addEventListener('resize',draw);
})();

// ===== フーリエ級数 =====
(function() {
  const container = document.getElementById('fourier-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const nSlider = document.getElementById('fourier-n');
  const nVal = document.getElementById('fourier-n-val');
  const typeSelect = document.getElementById('fourier-type');

  // 目標波形
  const targets = {
    square:   x => (x % (2*Math.PI) < Math.PI ? 1 : -1),
    sawtooth: x => { const t=(x%(2*Math.PI))/(2*Math.PI); return 2*t-1; },
    triangle: x => { const t=(x%(2*Math.PI))/(2*Math.PI); return t<0.5?4*t-1:3-4*t; },
  };
  // フーリエ係数
  const coeffs = {
    square:   n => n%2===0 ? 0 : 4/(n*Math.PI) * (Math.floor(n/2)%2===0 ? 1 : -1) * (n%2===1 ? 1 : 0),
    sawtooth: n => n===0 ? 0 : -2/n * Math.pow(-1,n),
    triangle: n => n%2===0 ? 0 : 8/(Math.PI**2*n**2) * (Math.floor(n/2)%2===0 ? 1 : -1),
  };

  function fourier(x, N, type) {
    let sum = 0;
    for(let k=1; k<=N; k++) {
      const bn = coeffs[type](k);
      sum += bn * Math.sin(k*x);
    }
    return sum;
  }

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const N=parseInt(nSlider.value), type=typeSelect.value;
    const pad=30, cx=W/2, cy=H/2;
    const xRange=Math.PI*2.5, yScale=H*0.38;

    // グリッド・軸
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [-1,0,1].forEach(v=>{
      const y=cy-v*yScale;
      ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad,cy); ctx.lineTo(W-pad,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,pad); ctx.lineTo(cx,H-pad); ctx.stroke();

    function toX(t){return cx+t/xRange*(W/2-pad);}

    // 目標波形
    ctx.beginPath();
    for(let i=0;i<=600;i++){
      const t=-xRange+2*xRange*i/600;
      const y=targets[type](t+Math.PI);
      if(i===0) ctx.moveTo(toX(t),cy-y*yScale);
      else ctx.lineTo(toX(t),cy-y*yScale);
    }
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5; ctx.stroke();

    // フーリエ近似
    ctx.beginPath();
    for(let i=0;i<=600;i++){
      const t=-xRange+2*xRange*i/600;
      const y=fourier(t+Math.PI,N,type);
      if(i===0) ctx.moveTo(toX(t),cy-y*yScale);
      else ctx.lineTo(toX(t),cy-y*yScale);
    }
    const g=ctx.createLinearGradient(pad,0,W-pad,0);
    g.addColorStop(0,'rgba(248,112,108,0.8)');
    g.addColorStop(0.5,'rgba(245,200,66,0.9)');
    g.addColorStop(1,'rgba(109,204,152,0.8)');
    ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.stroke();

    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`N=${N}項の近似 (白:目標, カラー:近似)`, pad+4, pad+14);
  }

  nSlider.addEventListener('input',()=>{nVal.textContent=nSlider.value; draw();});
  typeSelect.addEventListener('change', draw);
  draw();
  window.addEventListener('resize',draw);
})();

// ===== テイラー展開 =====
(function() {
  const container = document.getElementById('taylor-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const nSlider = document.getElementById('taylor-n');
  const nVal = document.getElementById('taylor-n-val');
  const fnSel = document.getElementById('taylor-fn');

  function factorial(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r;}

  const fns = {
    sin: {
      f: x=>Math.sin(x),
      term: (x,n) => n%2===0 ? 0 : (n%4===1?1:-1)*Math.pow(x,n)/factorial(n),
      label:'sin(x)', yMin:-2, yMax:2, xMin:-7, xMax:7
    },
    exp: {
      f: x=>Math.exp(x),
      term: (x,n) => Math.pow(x,n)/factorial(n),
      label:'eˣ', yMin:-1, yMax:10, xMin:-3, xMax:3
    },
    cos: {
      f: x=>Math.cos(x),
      term: (x,n) => n%2===1 ? 0 : (n%4===0?1:-1)*Math.pow(x,n)/factorial(n),
      label:'cos(x)', yMin:-2, yMax:2, xMin:-7, xMax:7
    },
  };

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const N=parseInt(nSlider.value), fn=fns[fnSel.value];
    const {xMin,xMax,yMin,yMax}=fn;
    const pad=35;
    function sx(x){return pad+(x-xMin)/(xMax-xMin)*(W-2*pad);}
    function sy(y){return pad+(1-(y-yMin)/(yMax-yMin))*(H-2*pad);}

    // グリッド・軸
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    for(let x=Math.ceil(xMin);x<=xMax;x++){ctx.beginPath();ctx.moveTo(sx(x),pad);ctx.lineTo(sx(x),H-pad);ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(W-pad,sy(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx(0),pad);ctx.lineTo(sx(0),H-pad);ctx.stroke();

    // 中間項を個別の色で描画
    const colors=['#7c6cf8','#f8706c','#4ab8d8','#6dcc98','#f5c842','#a78bfa','#fca5a5','#5eead4','#86efac','#fde68a','#c4b5fd','#67e8f9'];
    for(let k=1;k<=N;k++){
      ctx.beginPath(); let first=true;
      let partial=0;
      // k項目まで積み上げ
      ctx.beginPath(); first=true;
      for(let i=0;i<=300;i++){
        const x=xMin+(xMax-xMin)*i/300;
        let s=0;
        for(let j=0;j<=k-1;j++) s+=fn.term(x,j);
        if(!isFinite(s)||s<yMin-3||s>yMax+3){first=true;continue;}
        const p={x:sx(x),y:sy(s)};
        if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y);
      }
      const alpha=k===N?1:(0.3+0.5*k/N);
      ctx.strokeStyle=colors[(k-1)%colors.length].replace(')',`,${alpha})`).replace('rgb','rgba').replace('#','').slice(0,6);
      ctx.strokeStyle=(k===N?colors[(k-1)%colors.length]:`${colors[(k-1)%colors.length]}55`);
      ctx.lineWidth=k===N?2.5:1; ctx.stroke();
    }

    // 真の関数
    ctx.beginPath(); let first=true;
    for(let i=0;i<=400;i++){
      const x=xMin+(xMax-xMin)*i/400;
      const y=fn.f(x);
      if(!isFinite(y)||y<yMin-1||y>yMax+1){first=true;continue;}
      const p={x:sx(x),y:sy(y)};
      if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y);
    }
    ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2; ctx.setLineDash([6,3]); ctx.stroke(); ctx.setLineDash([]);

    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`${fn.label}  x=0周りのテイラー展開 (N=${N}項)`, pad+4, pad+14);
  }

  nSlider.addEventListener('input',()=>{nVal.textContent=nSlider.value; draw();});
  fnSel.addEventListener('change',draw);
  draw();
  window.addEventListener('resize',draw);
})();

// ===== ロジスティック写像 =====
(function() {
  const container = document.getElementById('logistic-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const rSlider = document.getElementById('logistic-r');
  const rVal = document.getElementById('logistic-r-val');
  const modeSelect = document.getElementById('logistic-mode');

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const r=parseFloat(rSlider.value), mode=modeSelect.value;
    const f=x=>r*x*(1-x);
    const pad=35;

    if(mode==='time') {
      // 時系列
      let x=0.3;
      const xs=[x];
      for(let i=0;i<200;i++){x=f(x);xs.push(x);}
      const skip=50;
      function sx(i){return pad+(i-skip)/(xs.length-1-skip)*(W-2*pad);}
      function sy(v){return pad+(1-v)*(H-2*pad);}
      // グリッド
      ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
      [0.25,0.5,0.75].forEach(v=>{ctx.beginPath();ctx.moveTo(pad,sy(v));ctx.lineTo(W-pad,sy(v));ctx.stroke();});
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(W-pad,sy(0));ctx.stroke();

      ctx.beginPath();
      xs.slice(skip).forEach((v,i)=>{
        const p={x:sx(i+skip),y:sy(v)};
        if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      });
      const g=ctx.createLinearGradient(pad,0,W-pad,0);
      g.addColorStop(0,'rgba(248,112,108,0.9)'); g.addColorStop(1,'rgba(245,200,66,0.9)');
      ctx.strokeStyle=g; ctx.lineWidth=1.8; ctx.stroke();
      ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='left';
      ctx.fillText(`r=${r.toFixed(2)} の時系列 (初期値0.3, 先頭${skip}点スキップ)`, pad+4, pad+14);

    } else if(mode==='cobweb') {
      // クモの巣図
      function sx2(x){return pad+x*(W-2*pad);}
      function sy2(y){return (H-pad)-y*(H-2*pad);}
      // y=xの対角線
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(sx2(0),sy2(0)); ctx.lineTo(sx2(1),sy2(1)); ctx.stroke();
      // f(x)の曲線
      ctx.beginPath();
      for(let i=0;i<=200;i++){const x=i/200;const y=f(x);ctx.lineTo(sx2(x),sy2(y));}
      ctx.strokeStyle='#f8706c'; ctx.lineWidth=2.5; ctx.stroke();
      // クモの巣
      let x=0.2; ctx.strokeStyle='rgba(109,204,152,0.8)'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(sx2(x),sy2(0));
      for(let i=0;i<60;i++){
        const y=f(x);
        ctx.lineTo(sx2(x),sy2(y));
        ctx.lineTo(sx2(y),sy2(y));
        x=y;
      }
      ctx.stroke();
      ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='left';
      ctx.fillText(`r=${r.toFixed(2)} クモの巣図 (初期値x=0.2)`, pad+4, pad+14);

    } else {
      // 分岐図（現在のrを強調）
      ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='left';
      ctx.fillText('分岐図を描画中...', pad+4, pad+14);
      const rMin=2.5, rMax=4.0;
      for(let ri=0;ri<W-2*pad;ri++){
        const rv=rMin+(rMax-rMin)*ri/(W-2*pad);
        const fv=x=>rv*x*(1-x);
        let x=0.5;
        for(let i=0;i<200;i++) x=fv(x);
        for(let i=0;i<100;i++){
          x=fv(x);
          const px=pad+ri;
          const py=(H-pad)-(x*(H-2*pad));
          ctx.fillStyle=`hsla(${ri/(W-2*pad)*120+240},70%,65%,0.5)`;
          ctx.fillRect(px,py,1,1);
        }
      }
      // 現在値の縦線
      const rx=pad+(r-rMin)/(rMax-rMin)*(W-2*pad);
      ctx.strokeStyle='rgba(245,200,66,0.8)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(rx,pad); ctx.lineTo(rx,H-pad); ctx.stroke();
      ctx.fillStyle='#fde68a'; ctx.font='11px monospace'; ctx.textAlign='center';
      ctx.fillText(`r=${r.toFixed(2)}`, rx, pad+14);
    }
  }

  rSlider.addEventListener('input',()=>{rVal.textContent=parseFloat(rSlider.value).toFixed(2); draw();});
  modeSelect.addEventListener('change',draw);
  draw();
  window.addEventListener('resize',draw);
})();

// ===== 測度論・ルベーグ積分 =====
(()=>{
  const container=document.getElementById('lebesgue-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const modeSel=document.getElementById('leb-mode');
  const nSl=document.getElementById('leb-n'), nVal=document.getElementById('leb-n-val');

  // f(x) = sin²(πx) + 0.2  on [0,1]
  const f=x=>Math.sin(Math.PI*x)*Math.sin(Math.PI*x)*0.8+0.1;

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||260;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const N=parseInt(nSl.value), mode=modeSel.value;
    const pad=50, axW=W-2*pad, axH=H-2*pad;
    const sx=x=>pad+x*axW, sy=y=>H-pad-y*axH;

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('x',W-pad+8,H-pad+4);
    ctx.textAlign='right'; ctx.fillText('f(x)',pad-4,pad+4);

    let approxSum=0;

    if(mode==='riemann'){
      // リーマン積分: x方向に等分
      const dx=1/N;
      for(let i=0;i<N;i++){
        const x=i*dx, fv=f(x+dx/2);
        approxSum+=fv*dx;
        ctx.fillStyle=`rgba(248,112,108,0.4)`;
        ctx.fillRect(sx(x),sy(fv),axW*dx,sy(0)-sy(fv));
        ctx.strokeStyle='rgba(248,112,108,0.7)'; ctx.lineWidth=0.5;
        ctx.strokeRect(sx(x),sy(fv),axW*dx,sy(0)-sy(fv));
      }
    } else {
      // ルベーグ積分: y方向(値域)に等分, 逆像の長さを計算
      const dy=1/N;
      for(let j=0;j<N;j++){
        const y0=j*dy, y1=(j+1)*dy, ymid=(y0+y1)/2;
        // f(x)∈[y0,y1] となるxの集合(逆像)の長さを数値的に測る
        const samples=200; let measure=0;
        for(let k=0;k<samples;k++){
          const xk=k/samples;
          if(f(xk)>=y0&&f(xk)<y1) measure+=1/samples;
        }
        approxSum+=ymid*measure;
        // 逆像を x軸上に描画
        let inSet=false, startX=0;
        for(let k=0;k<=samples;k++){
          const xk=k/samples, inNow=k<samples&&f(xk)>=y0&&f(xk)<y1;
          if(!inSet&&inNow){startX=xk;inSet=true;}
          if(inSet&&!inNow){
            ctx.fillStyle=`hsla(${160+j*20},70%,55%,0.5)`;
            ctx.fillRect(sx(startX),sy(y1),axW*(xk-startX),axH*dy);
            inSet=false;
          }
        }
        // y軸側に目盛り
        ctx.strokeStyle=`hsla(${160+j*20},70%,55%,0.6)`; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(pad-8,sy(ymid)); ctx.lineTo(pad,sy(ymid)); ctx.stroke();
      }
    }

    // 関数曲線
    ctx.beginPath();
    for(let k=0;k<=300;k++){
      const x=k/300; const y=f(x);
      if(k===0) ctx.moveTo(sx(x),sy(y)); else ctx.lineTo(sx(x),sy(y));
    }
    ctx.strokeStyle='rgba(245,200,66,0.9)'; ctx.lineWidth=2; ctx.stroke();

    // 積分値表示
    ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.font='bold 12px monospace'; ctx.textAlign='left';
    ctx.fillText(`≈ ${approxSum.toFixed(4)}  (真値 ≈ 0.5)`, pad+4, pad+16);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px sans-serif';
    ctx.fillText(mode==='riemann'?'縦スライス（リーマン）':'横スライス（ルベーグ）', pad+4, pad+30);
  }

  modeSel.addEventListener('change',draw);
  nSl.addEventListener('input',()=>{nVal.textContent=nSl.value;draw();});
  draw(); window.addEventListener('resize',draw);
})();

// ===== ラプラス変換 =====
(()=>{
  const container=document.getElementById('laplace-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const sigSl=document.getElementById('lap-sigma'), sigVal=document.getElementById('lap-sigma-val');
  const omSl=document.getElementById('lap-omega'), omVal=document.getElementById('lap-omega-val');

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||260;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const sigma=parseFloat(sigSl.value), omega=parseFloat(omSl.value);
    const halfW=W/2;

    // 左: s平面
    const lPad=30, lW=halfW-lPad-10;
    const sRange=6, sScaleX=lW/(2*sRange), sScaleY=(H-60)/(2*sRange);
    const sOx=lPad+lW/2, sOy=H/2;

    // 安定領域を塗る
    ctx.fillStyle='rgba(62,207,202,0.06)';
    ctx.fillRect(lPad,lPad,sOx-lPad,H-2*lPad);

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(lPad,sOy); ctx.lineTo(lPad+lW,sOy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sOx,lPad); ctx.lineTo(sOx,H-lPad); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('σ(実部)',lPad+lW,sOy-6); ctx.textAlign='left';
    ctx.fillText('iω(虚部)',sOx+4,lPad+10);
    ctx.fillStyle='rgba(62,207,202,0.5)'; ctx.font='9px sans-serif';
    ctx.fillText('安定領域',lPad+4,lPad+14);

    // 極をプロット: s = sigma ± i*omega
    [[sigma,omega],[sigma,-omega]].forEach(([sr,si])=>{
      const px=sOx+sr*sScaleX, py=sOy-si*sScaleY;
      ctx.beginPath(); ctx.arc(px,py,7,0,2*Math.PI);
      ctx.fillStyle=sigma<0?'rgba(248,112,108,0.9)':'rgba(248,200,66,0.9)'; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='10px monospace'; ctx.textAlign='left';
      ctx.fillText(`${sr.toFixed(1)}${si>=0?'+':''}${si.toFixed(1)}i`, px+10, py+4);
    });
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('s 平面', lPad+lW/2, H-8);

    // 右: 時間応答 e^(σt)·cos(ωt)
    const rPad=halfW+10, rW=W-rPad-20;
    const tMax=6, tScale=rW/tMax;
    const ampMax=2, yScale=(H-60)/2, rOy=H/2, rOx=rPad;

    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(rOx,rOy-yScale); ctx.lineTo(rOx,rOy+yScale); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rOx,rOy); ctx.lineTo(rOx+rW,rOy); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('t',rOx+rW,rOy-6); ctx.fillText('y(t)',rOx+4,rOy-yScale+12);

    // 包絡線
    ctx.beginPath();
    for(let k=0;k<=200;k++){
      const t=k/200*tMax;
      const env=Math.exp(sigma*t);
      const x=rOx+t*tScale, y=rOy-Math.min(env,3)*yScale/ampMax;
      if(k===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath();
    for(let k=0;k<=200;k++){
      const t=k/200*tMax;
      const env=Math.exp(sigma*t);
      const x=rOx+t*tScale, y=rOy+Math.min(env,3)*yScale/ampMax;
      if(k===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);

    // 応答曲線
    ctx.beginPath();
    for(let k=0;k<=400;k++){
      const t=k/400*tMax;
      const y_=Math.exp(sigma*t)*Math.cos(omega*t);
      const x=rOx+t*tScale, y=rOy-Math.max(-3,Math.min(3,y_))*yScale/ampMax;
      if(k===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle=sigma<0?'rgba(62,207,202,0.9)':'rgba(248,200,66,0.9)'; ctx.lineWidth=2; ctx.stroke();

    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('時間応答 y(t)=e^(σt)cos(ωt)', rOx+rW/2, H-8);
  }

  sigSl.addEventListener('input',()=>{sigVal.textContent=parseFloat(sigSl.value).toFixed(1);draw();});
  omSl.addEventListener('input',()=>{omVal.textContent=parseFloat(omSl.value).toFixed(1);draw();});
  draw(); window.addEventListener('resize',draw);
})();

// ===== 微分形式 dx∧dy =====
(()=>{
  const container=document.getElementById('diffform-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const a1Sl=document.getElementById('df-angle1'), a1Val=document.getElementById('df-angle1-val');
  const a2Sl=document.getElementById('df-angle2'), a2Val=document.getElementById('df-angle2-val');
  const gSl=document.getElementById('df-grid'), gVal=document.getElementById('df-grid-val');

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||300;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const a1=parseFloat(a1Sl.value)*Math.PI/180;
    const a2=parseFloat(a2Sl.value)*Math.PI/180;
    const G=parseInt(gSl.value);
    const cx=W/2, cy=H/2, scale=Math.min(W,H)*0.3;

    // グリッド（背景）
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5;
    for(let i=-G;i<=G;i++){
      const x=cx+i*(scale/G), y=cy+i*(scale/G);
      ctx.beginPath(); ctx.moveTo(x,30); ctx.lineTo(x,H-30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30,y); ctx.lineTo(W-30,y); ctx.stroke();
    }

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(30,cy); ctx.lineTo(W-30,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,30); ctx.lineTo(cx,H-30); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px sans-serif';
    ctx.textAlign='center'; ctx.fillText('x',W-24,cy-4);
    ctx.textAlign='left'; ctx.fillText('y',cx+4,36);

    const u=[Math.cos(a1),Math.sin(a1)];
    const v=[Math.cos(a2),Math.sin(a2)];

    // 外積(det)
    const det=u[0]*v[1]-u[1]*v[0];

    // 平行四辺形を塗る
    const p0=[cx,cy];
    const p1=[cx+u[0]*scale,cy-u[1]*scale];
    const p2=[cx+u[0]*scale+v[0]*scale,cy-u[1]*scale-v[1]*scale];
    const p3=[cx+v[0]*scale,cy-v[1]*scale];
    ctx.beginPath();
    ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]);
    ctx.lineTo(p2[0],p2[1]); ctx.lineTo(p3[0],p3[1]); ctx.closePath();
    const col=det>=0?'rgba(248,112,108,0.25)':'rgba(74,184,216,0.25)';
    ctx.fillStyle=col; ctx.fill();
    ctx.strokeStyle=det>=0?'rgba(248,112,108,0.6)':'rgba(74,184,216,0.6)'; ctx.lineWidth=1.5; ctx.stroke();

    // ベクトル u
    const arrowLen=scale;
    function drawArrow(ox,oy,dx,dy,color,label){
      const ex=ox+dx*arrowLen, ey=oy-dy*arrowLen;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ex,ey);
      ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();
      const len=Math.sqrt(dx*dx+dy*dy)||1;
      const ux=dx/len, uy=dy/len;
      ctx.beginPath();
      ctx.moveTo(ex,ey);
      ctx.lineTo(ex-(ux*0.12-uy*0.07)*arrowLen,ey+(uy*0.12+ux*0.07)*arrowLen);
      ctx.lineTo(ex-(ux*0.12+uy*0.07)*arrowLen,ey+(uy*0.12-ux*0.07)*arrowLen);
      ctx.closePath(); ctx.fillStyle=color; ctx.fill();
      ctx.fillStyle=color; ctx.font='bold 13px serif'; ctx.textAlign='center';
      ctx.fillText(label,ex+dx*16,ey-dy*16+4);
    }
    drawArrow(cx,cy,u[0],u[1],'rgba(248,112,108,0.9)','u');
    drawArrow(cx,cy,v[0],v[1],'rgba(74,184,216,0.9)','v');

    // 向きの矢印（曲線矢印で反時計/時計）
    const midX=(p0[0]+p2[0])/2, midY=(p0[1]+p2[1])/2;
    ctx.font='bold 16px serif'; ctx.textAlign='center';
    ctx.fillStyle=det>=0?'rgba(248,112,108,0.9)':'rgba(74,184,216,0.9)';
    ctx.fillText(det>=0?'↺':'↻',midX,midY+6);

    // 値表示
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='bold 13px monospace'; ctx.textAlign='left';
    ctx.fillText(`dx∧dy(u,v) = det[u,v] = ${det.toFixed(3)}`, 16, H-14);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px sans-serif';
    ctx.fillText(det>=0?'正：反時計回り（標準向き）':'負：時計回り（逆向き）',16,H-30);
  }

  a1Sl.addEventListener('input',()=>{a1Val.textContent=a1Sl.value+'°';draw();});
  a2Sl.addEventListener('input',()=>{a2Val.textContent=a2Sl.value+'°';draw();});
  gSl.addEventListener('input',()=>{gVal.textContent=gSl.value;draw();});
  draw(); window.addEventListener('resize',draw);
})();

// ===== 熱方程式 u(x,t) — Three.js 3D解曲面 =====
(function() {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('heat-viz');
  if (!container) return;
  const tSlider     = document.getElementById('heat-t');
  const alphaSlider = document.getElementById('heat-alpha');
  const tVal        = document.getElementById('heat-t-val');
  const alphaVal    = document.getElementById('heat-alpha-val');

  const W = container.clientWidth, H = 380;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080812);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.set(2.5, 2.5, 5.5);
  camera.lookAt(1.57, 0.5, 0.5);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1.57, 0.5, 0.5);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  // 環境光 + 指向性ライト
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dLight.position.set(3, 5, 4);
  scene.add(dLight);

  // 座標軸
  function addAxis(a, b, color) {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...a), new THREE.Vector3(...b)
    ]);
    scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color })));
  }
  addAxis([0,0,0],[Math.PI+0.4,0,0], 0x886644); // x軸
  addAxis([0,0,0],[0,1.4,0],         0x44aa66); // u軸
  addAxis([0,0,0],[0,0,2.2],         0x4488cc); // t軸

  // ラベルスプライト
  function makeLabel(text, pos, col) {
    const cv = document.createElement('canvas');
    cv.width = 64; cv.height = 32;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = col || '#aabbdd';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 32, 24);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    sp.position.set(...pos);
    sp.scale.set(0.6, 0.3, 1);
    scene.add(sp);
  }
  makeLabel('x', [Math.PI+0.6, 0, 0], '#cc9966');
  makeLabel('u', [0, 1.55, 0],        '#66cc88');
  makeLabel('t', [0, 0, 2.4],         '#6699ff');

  const Nx = 80, Nt = 80;
  let mesh = null;

  // u(x,t) の解 (フーリエ展開 3項)
  function heatU(x, t, alpha) {
    return (
      Math.sin(x)     * Math.exp(-1 * alpha * t) +
      0.5 * Math.sin(2*x) * Math.exp(-4 * alpha * t) +
      0.3 * Math.sin(3*x) * Math.exp(-9 * alpha * t)
    );
  }

  // 値からHSLカラー(青→緑→黄→赤)
  function valueColor(v, vMin, vMax) {
    const t = Math.max(0, Math.min(1, (v - vMin) / (vMax - vMin)));
    // blue(0) → cyan(0.25) → green(0.5) → yellow(0.75) → red(1)
    if (t < 0.25)      return [0, t*4, 1];
    else if (t < 0.5)  return [0, 1, 1-(t-0.25)*4];
    else if (t < 0.75) return [(t-0.5)*4, 1, 0];
    else               return [1, 1-(t-0.75)*4, 0];
  }

  function buildSurface() {
    const tMax  = parseFloat(tSlider.value);
    const alpha = parseFloat(alphaSlider.value);

    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); mesh = null; }

    const positions = [];
    const colors    = [];
    const indices   = [];

    // 全体の値域を計算してカラーマップ正規化
    let uMin = Infinity, uMax = -Infinity;
    for (let it = 0; it <= Nt; it++) {
      for (let ix = 0; ix <= Nx; ix++) {
        const x = (ix / Nx) * Math.PI;
        const t = (it / Nt) * tMax;
        const u = heatU(x, t, alpha);
        if (u < uMin) uMin = u; if (u > uMax) uMax = u;
      }
    }

    for (let it = 0; it <= Nt; it++) {
      for (let ix = 0; ix <= Nx; ix++) {
        const x = (ix / Nx) * Math.PI;
        const t = (it / Nt) * tMax;
        const u = heatU(x, t, alpha);
        // Three.js座標: x=x方向, y=u(高さ), z=t方向
        positions.push(x, u, t);
        const [r,g,b] = valueColor(u, uMin, uMax);
        colors.push(r, g, b);
      }
    }

    for (let it = 0; it < Nt; it++) {
      for (let ix = 0; ix < Nx; ix++) {
        const a = it*(Nx+1)+ix, b=a+1, c=a+(Nx+1), d=c+1;
        indices.push(a,b,c, b,d,c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 40,
      specular: new THREE.Color(0.2, 0.2, 0.2)
    }));
    scene.add(mesh);
  }

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  [tSlider, alphaSlider].forEach(s => {
    s.addEventListener('input', () => {
      tVal.textContent   = parseFloat(tSlider.value).toFixed(2);
      alphaVal.textContent = parseFloat(alphaSlider.value).toFixed(2);
      buildSurface();
    });
  });
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });

  buildSurface();
  animate();
})();
