import{v as te,R as ee,U as ie,L as Ht,C as vt,W as oe,w as ne,A as se,S as re,n as I,x as ae,P as le,b as z,m as ce,H as ue,k as It,l as he,f as _t,e as Q,y as Ft,q as Bt,s as me,T as de,u as pe,h as fe,B as xe,z as ve,N as ye,j as ge,G as we,a as Me,r as _e,E as Ce,V as Gt,I as be,o as De,M as N,p as Le}from"./controls-B-5G8hC0.js";function b(t,e,i){return Math.min(i,Math.max(e,t))}function A(t,e,i){return t+(e-t)*i}class Ae{constructor(e={}){this.inputWidth=e.inputWidth??512,this.inputHeight=e.inputHeight??512,this.W=e.gridWidth??30,this.H=e.gridHeight??48,this.D=e.gridDepth??24,this.count=this.W*this.H*this.D,this.dt=1/60,this.advection=.72,this.jacobiIter=20,this.buoyancy=1.5,this.weight=.05,this.vortConfinement=15,this.dissipation=.994,this.tempDissipation=.97,this.velocityDamping=.986,this.baseRise=.06,this.lateralSpread=1,this.radialPull=.014,this.verticalLift=1,this.cooling=1,this.edgeLoss=.92,this.topLoss=.82,this.densityDiffusion=.04,this.temperatureDiffusion=.03,this.density=new Float32Array(this.count),this.densityNext=new Float32Array(this.count),this.temperature=new Float32Array(this.count),this.temperatureNext=new Float32Array(this.count),this.velX=new Float32Array(this.count),this.velY=new Float32Array(this.count),this.velZ=new Float32Array(this.count),this.velXNext=new Float32Array(this.count),this.velYNext=new Float32Array(this.count),this.velZNext=new Float32Array(this.count),this.volumeData=new Uint8Array(this.count*4),this.volumeTexture=new te(this.volumeData,this.W,this.H,this.D),this.volumeTexture.format=ee,this.volumeTexture.type=ie,this.volumeTexture.minFilter=Ht,this.volumeTexture.magFilter=Ht,this.volumeTexture.wrapS=vt,this.volumeTexture.wrapT=vt,this.volumeTexture.wrapR=vt,this.volumeTexture.unpackAlignment=1,this.volumeTexture.needsUpdate=!0,this.reset()}configure(e={}){["buoyancy","vortConfinement","dissipation","tempDissipation","jacobiIter","lateralSpread","radialPull","verticalLift","cooling","edgeLoss","topLoss","densityDiffusion","temperatureDiffusion"].forEach(n=>{e[n]!==void 0&&(this[n]=e[n])})}reset(){this.density.fill(0),this.densityNext.fill(0),this.temperature.fill(0),this.temperatureNext.fill(0),this.velX.fill(0),this.velY.fill(0),this.velZ.fill(0),this.velXNext.fill(0),this.velYNext.fill(0),this.velZNext.fill(0),this.volumeData.fill(0),this.volumeTexture.needsUpdate=!0}splat(e,i,n,l,r,h={}){const d=b(e/this.inputWidth*(this.W-1),0,this.W-1),s=b(i/this.inputHeight*(this.H-1),0,this.H-1),o=b((h.depth??.5)*(this.D-1),0,this.D-1),c=h.radius??24,a=h.velocityAmount??.35,x=h.densityAmount??(r==="fire"?.95:.72),f=h.temperatureAmount??(r==="fire"?1.25:.18),p=Math.max(1.8,c/this.inputWidth*this.W*1.8),M=Math.max(2.2,c/this.inputHeight*this.H*2.4),v=Math.max(1.4,p*.7),H=n/this.inputWidth*this.W*.44*a,k=l/this.inputHeight*this.H*.52*a,P=H*.28,B=r==="fire"?1:.38,X=Math.max(0,Math.floor(d-p*1.5)),$=Math.min(this.W-1,Math.ceil(d+p*1.5)),V=Math.max(0,Math.floor(s-M*1.35)),j=Math.min(this.H-1,Math.ceil(s+M*1.35)),O=Math.max(0,Math.floor(o-v*1.5)),U=Math.min(this.D-1,Math.ceil(o+v*1.5));for(let G=O;G<=U;G++){const q=(G-o)/v,tt=q*q;for(let ut=V;ut<=j;ut++){const zt=(ut-s)/M,Qt=zt*zt;for(let ht=X;ht<=$;ht++){const et=(ht-d)/p,Wt=et*et+Qt+tt;if(Wt>1)continue;const it=Math.exp(-Wt*2.6),Y=this._index(ht,ut,G),$t=et*.45-q*.4;this.density[Y]=Math.min(1.45,this.density[Y]+x*it),this.temperature[Y]=Math.min(1.55,this.temperature[Y]+f*it),this.velX[Y]+=(H*this.lateralSpread+$t*.95*B)*it,this.velY[Y]+=(Math.max(.7,k+1)+(1-Math.abs(et))*.5)*it*(.72+B*.22)*this.verticalLift,this.velZ[Y]+=(-P*this.lateralSpread+q*.95-et*.28)*it*(.52+B*.45)}}}}step(e,i=1/60){this.dt=b(i,1/120,1/24),this._applyForces(e),this._smoothVelocity(),this._advectScalars(),this._updateTexture()}_applyForces(e){const i=this.W-1,n=this.H-1,l=this.D-1,r=this.vortConfinement*.0022,h=this.buoyancy*.042,d=this.weight*.018,s=this.dt*60;let o=0;for(let c=0;c<this.D;c++){const a=c/l-.5;for(let x=0;x<this.H;x++){const f=x/n,p=1-f;for(let M=0;M<this.W;M++,o++){const v=M/i-.5,H=this.density[o],k=this.temperature[o];let P=this.velX[o],B=this.velY[o],X=this.velZ[o];const $=Math.hypot(v*1.35,a*1.12),V=Math.max(0,1-$*1.32),j=.18+H*.82,O=f*7.8+e*1.75+v*5.6-a*4.8,U=f*5.1-e*1.2+a*6+v*3.2,G=Math.sin(O)*.65+Math.cos(U*.55)*.35,q=Math.cos(U)*.65-Math.sin(O*.7)*.35;P+=(G-a*.58-v*V*.22)*r*j*p*s*this.lateralSpread,X+=(q+v*.58-a*V*.22)*r*j*p*s*this.lateralSpread,B+=(this.baseRise*(.58+V*.42)+k*h-H*d)*s*this.verticalLift,P+=-v*this.radialPull*V*p*s,X+=-a*this.radialPull*V*p*s;const tt=this.velocityDamping-Math.max(0,f-.8)*.012;this.velXNext[o]=P*tt,this.velYNext[o]=B*(tt-.002),this.velZNext[o]=X*tt}}}}_smoothVelocity(){const e=.035+Math.min(.16,this.jacobiIter*.003);for(let i=0;i<this.D;i++)for(let n=0;n<this.H;n++)for(let l=0;l<this.W;l++){const r=this._index(l,n,i);if(l===0||n===0||i===0||l===this.W-1||n===this.H-1||i===this.D-1){this.velX[r]=this.velXNext[r]*.68,this.velY[r]=Math.max(0,this.velYNext[r]*.68),this.velZ[r]=this.velZNext[r]*.68;continue}const h=this._index(l+1,n,i),d=this._index(l-1,n,i),s=this._index(l,n+1,i),o=this._index(l,n-1,i),c=this._index(l,n,i+1),a=this._index(l,n,i-1),x=(this.velXNext[h]+this.velXNext[d]+this.velXNext[s]+this.velXNext[o]+this.velXNext[c]+this.velXNext[a])/6,f=(this.velYNext[h]+this.velYNext[d]+this.velYNext[s]+this.velYNext[o]+this.velYNext[c]+this.velYNext[a])/6,p=(this.velZNext[h]+this.velZNext[d]+this.velZNext[s]+this.velZNext[o]+this.velZNext[c]+this.velZNext[a])/6;this.velX[r]=A(this.velXNext[r],x,e),this.velY[r]=Math.max(0,A(this.velYNext[r],f,e)),this.velZ[r]=A(this.velZNext[r],p,e)}}_advectScalars(){const e=this.advection*this.dt*60,i=this.W-1,n=this.H-1,l=this.D-1;let r=0;for(let s=0;s<this.D;s++)for(let o=0;o<this.H;o++){const c=o/n;for(let a=0;a<this.W;a++,r++){const x=a-this.velX[r]*e,f=o-this.velY[r]*e,p=s-this.velZ[r]*e;let M=this._sample(this.density,x,f,p)*this.dissipation,v=this._sample(this.temperature,x,f,p)*this.tempDissipation;M*=1-Math.max(0,c-.84)*.05,v*=Math.max(.88,1-(.004+c*.01)*this.cooling),(a===0||a===i||s===0||s===l)&&(M*=this.edgeLoss,v*=Math.max(.82,this.edgeLoss-.02*this.cooling)),o===n&&(M*=this.topLoss,v*=Math.max(.72,this.topLoss-.06*this.cooling)),this.densityNext[r]=b(M,0,1.45),this.temperatureNext[r]=b(v,0,1.55)}}const h=this.densityDiffusion,d=this.temperatureDiffusion;for(let s=1;s<this.D-1;s++)for(let o=1;o<this.H-1;o++)for(let c=1;c<this.W-1;c++){const a=this._index(c,o,s),x=this._index(c+1,o,s),f=this._index(c-1,o,s),p=this._index(c,o+1,s),M=this._index(c,o-1,s),v=this._index(c,o,s+1),H=this._index(c,o,s-1),k=(this.densityNext[x]+this.densityNext[f]+this.densityNext[p]+this.densityNext[M]+this.densityNext[v]+this.densityNext[H])/6,P=(this.temperatureNext[x]+this.temperatureNext[f]+this.temperatureNext[p]+this.temperatureNext[M]+this.temperatureNext[v]+this.temperatureNext[H])/6;this.density[a]=A(this.densityNext[a],k,h),this.temperature[a]=A(this.temperatureNext[a],P,d)}for(let s=0;s<this.D;s++)for(let o=0;o<this.H;o++)for(let c=0;c<this.W;c++){if(c>0&&c<this.W-1&&o>0&&o<this.H-1&&s>0&&s<this.D-1)continue;const a=this._index(c,o,s);this.density[a]=this.densityNext[a],this.temperature[a]=this.temperatureNext[a]}}_updateTexture(){let e=0;for(let i=0;i<this.count;i++){const n=b(this.density[i],0,1),l=b(this.temperature[i],0,1),r=Math.min(1,Math.hypot(this.velX[i],this.velY[i],this.velZ[i])*.18),h=b(Math.max(n,l*.84),0,1);this.volumeData[e++]=Math.round(n*255),this.volumeData[e++]=Math.round(l*255),this.volumeData[e++]=Math.round(r*255),this.volumeData[e++]=Math.round(h*255)}this.volumeTexture.needsUpdate=!0}_sample(e,i,n,l){const r=b(Math.floor(i),0,this.W-1),h=b(Math.floor(n),0,this.H-1),d=b(Math.floor(l),0,this.D-1),s=Math.min(r+1,this.W-1),o=Math.min(h+1,this.H-1),c=Math.min(d+1,this.D-1),a=b(i-r,0,1),x=b(n-h,0,1),f=b(l-d,0,1),p=e[this._index(r,h,d)],M=e[this._index(s,h,d)],v=e[this._index(r,o,d)],H=e[this._index(s,o,d)],k=e[this._index(r,h,c)],P=e[this._index(s,h,c)],B=e[this._index(r,o,c)],X=e[this._index(s,o,c)],$=A(p,M,a),V=A(v,H,a),j=A(k,P,a),O=A(B,X,a),U=A($,V,x),G=A(j,O,x);return A(U,G,f)}_index(e,i,n){return e+this.W*(i+this.H*n)}}const Se=`out vec3 vLocalPos;

void main() {
  vLocalPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ne=`precision highp float;
precision highp sampler3D;

uniform sampler3D u_volumeTex;
uniform vec3 u_boundsMin;
uniform vec3 u_boundsMax;
uniform vec3 u_cameraPosLocal;
uniform vec3 u_lightDirLocal;
uniform float u_time;
uniform float u_densityGain;
uniform float u_shadowStrength;
uniform float u_warpAmount;
uniform float u_emissionGain;
uniform int u_mode;
uniform vec3 u_fireBaseColor;
uniform vec3 u_fireLowColor;
uniform vec3 u_fireMidColor;
uniform vec3 u_fireHighColor;
uniform vec3 u_sootColor;
uniform vec3 u_smokeLightColor;
uniform vec3 u_smokeDarkColor;
uniform vec3 u_smokeWarmColor;

in vec3 vLocalPos;
out vec4 fragColor;

const int STEPS = 56;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

bool intersectBox(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax, out float tNear, out float tFar) {
  vec3 invDir = 1.0 / rayDir;
  vec3 t0 = (boxMin - rayOrigin) * invDir;
  vec3 t1 = (boxMax - rayOrigin) * invDir;
  vec3 tSmaller = min(t0, t1);
  vec3 tLarger = max(t0, t1);
  tNear = max(max(tSmaller.x, tSmaller.y), tSmaller.z);
  tFar = min(min(tLarger.x, tLarger.y), tLarger.z);
  return tFar > max(tNear, 0.0);
}

vec3 volumeUv(vec3 p) {
  vec3 uv = (p - u_boundsMin) / (u_boundsMax - u_boundsMin);
  float yFade = 1.0 - uv.y;
  vec3 warp = vec3(
    sin(uv.y * 12.0 + uv.z * 7.0 + u_time * 1.3),
    sin(uv.x * 9.0 - uv.z * 5.0 - u_time * 0.9) * 0.35,
    cos(uv.y * 10.0 - uv.x * 6.0 - u_time * 1.1)
  ) * u_warpAmount * (0.14 + yFade * 0.22);
  return clamp(uv + warp, vec3(0.001), vec3(0.999));
}

vec4 sampleVolume(vec3 p) {
  vec4 voxel = texture(u_volumeTex, volumeUv(p));
  float density = voxel.r * u_densityGain;
  float temperature = voxel.g;
  float speed = voxel.b;
  float opacity = voxel.a;
  return vec4(density, temperature, speed, opacity);
}

float densityAt(vec3 p) {
  return sampleVolume(p).x;
}

float lightAttenuation(vec3 p, float stepLength) {
  vec3 lightDir = normalize(u_lightDirLocal);
  float nearOcc = densityAt(p + lightDir * stepLength * 5.0);
  float midOcc = densityAt(p + lightDir * stepLength * 11.0);
  float farOcc = densityAt(p + lightDir * stepLength * 19.0);
  return exp(-(nearOcc * 1.7 + midOcc * 1.1 + farOcc * 0.8) * u_shadowStrength);
}

vec3 flamePalette(float heat) {
  vec3 color = mix(u_fireLowColor, u_fireMidColor, smoothstep(0.02, 0.3, heat));
  color = mix(color, u_fireHighColor, smoothstep(0.36, 0.92, heat));
  return color;
}

void main() {
  vec3 rayOrigin = u_cameraPosLocal;
  vec3 rayDir = normalize(vLocalPos - rayOrigin);

  float tNear;
  float tFar;
  if (!intersectBox(rayOrigin, rayDir, u_boundsMin, u_boundsMax, tNear, tFar)) {
    discard;
  }

  tNear = max(tNear, 0.0);
  float rayLength = tFar - tNear;
  if (rayLength <= 0.0001) {
    discard;
  }

  float stepLength = rayLength / float(STEPS);
  float jitter = hash12(gl_FragCoord.xy + vec2(u_time * 27.0, u_time * 13.0));
  vec3 lightDir = normalize(u_lightDirLocal);
  vec4 accum = vec4(0.0);

  for (int i = 0; i < STEPS; i++) {
    float t = tNear + (float(i) + jitter) * stepLength;
    vec3 p = rayOrigin + rayDir * t;
    vec4 voxel = sampleVolume(p);
    vec3 uvw = volumeUv(p);

    float density = voxel.x * voxel.w;
    if (density < 0.0025) {
      continue;
    }

    float temperature = voxel.y;
    float speed = voxel.z;
    float shadow = lightAttenuation(p, stepLength);
    float forward = pow(max(dot(rayDir, lightDir), 0.0), u_mode == 1 ? 4.0 : 2.4);
    float radial = length((uvw.xz - vec2(0.5)) * vec2(1.45, 1.15));
    float coreMask = 1.0 - smoothstep(0.14, 0.72, radial);
    float heightCool = smoothstep(0.02, 1.0, uvw.y);
    float extinction = density * stepLength * (u_mode == 1 ? 3.1 : 3.0);
    float alpha = 1.0 - exp(-extinction);

    vec3 color;
    if (u_mode == 1) {
      float heat = clamp(temperature * (1.14 - heightCool * 0.42) + density * 0.18 + coreMask * 0.08, 0.0, 1.0);
      float soot = smoothstep(0.22, 0.92, density) * smoothstep(0.18, 0.92, uvw.y) * (1.0 - smoothstep(0.34, 0.88, heat));
      float blueBase = smoothstep(0.0, 0.18, 1.0 - uvw.y) * smoothstep(0.46, 1.0, temperature);
      float ember = smoothstep(0.24, 0.8, density) * smoothstep(0.0, 0.25, 1.0 - uvw.y);

      color = flamePalette(heat);
      color += u_fireBaseColor * blueBase * (0.12 + coreMask * 0.32);
      color = mix(color, u_sootColor, soot * 0.58);
      color += mix(u_fireMidColor, u_fireHighColor, 0.42) * ember * 0.08;
      color *= (0.84 + coreMask * 0.18) * mix(0.42, 1.42, shadow) * u_emissionGain;
      color += mix(u_fireMidColor, u_fireHighColor, 0.72) * forward * (0.08 + speed * 0.18);
      alpha *= mix(0.9, 1.08, coreMask);
    } else {
      float mistBody = clamp(density * 0.88 + heightCool * 0.14, 0.0, 1.0);
      float rim = pow(1.0 - clamp(radial, 0.0, 1.0), 1.8);
      float scatter = pow(max(dot(-rayDir, lightDir), 0.0), 5.0);

      color = mix(u_smokeLightColor, u_smokeDarkColor, mistBody);
      color = mix(color, u_smokeLightColor, (1.0 - mistBody) * 0.38 + rim * 0.12);
      color += u_smokeWarmColor * (temperature * 0.16 + speed * 0.05);
      color *= mix(0.62, 1.14, shadow);
      color += mix(u_smokeWarmColor, u_smokeLightColor, 0.7) * scatter * (0.06 + speed * 0.08);
      alpha *= 0.76 + rim * 0.12;
    }

    accum.rgb += (1.0 - accum.a) * color * alpha;
    accum.a += (1.0 - accum.a) * alpha;

    if (accum.a > 0.985) {
      break;
    }
  }

  if (accum.a < 0.01) {
    discard;
  }

  accum.rgb = pow(accum.rgb, vec3(0.92));
  fragColor = vec4(accum.rgb, accum.a);
}
`;function Tt(t){let e=document.getElementById("fatal-error");e||(e=document.createElement("div"),e.id="fatal-error",Object.assign(e.style,{position:"fixed",left:"16px",right:"16px",bottom:"16px",padding:"14px 16px",borderRadius:"16px",border:"1px solid rgba(255, 110, 110, 0.35)",background:"rgba(40, 8, 12, 0.9)",color:"#ffd7d7",fontFamily:"Consolas, monospace",fontSize:"12px",lineHeight:"1.5",zIndex:"10000",whiteSpace:"pre-wrap"}),document.body.appendChild(e)),e.textContent=t}window.addEventListener("error",t=>{t.message&&Tt(t.message)});window.addEventListener("unhandledrejection",t=>{const e=t.reason?.message||String(t.reason||"Unknown promise rejection");Tt(e)});function ze(t,e=720){const i=Math.min(window.devicePixelRatio||1,1.2),n=Math.max(t.width,t.height),l=Math.min(1,e/n)*i;return{width:Math.max(360,Math.round(t.width*l)),height:Math.max(360,Math.round(t.height*l))}}function We(t,e){const i=t/Math.max(e,1),n=Math.round(N.clamp(28+(i-.8)*8,28,36)),l=Math.round(N.clamp(n*1.55,42,58)),r=Math.round(N.clamp(n*.8,20,30));return{gridWidth:n,gridHeight:l,gridDepth:r}}const S=document.getElementById("canvas"),kt=document.getElementById("viewport");function Xt(){const t=kt.getBoundingClientRect();return{width:Math.max(360,Math.round(t.width||window.innerWidth)),height:Math.max(420,Math.round(t.height||window.innerHeight))}}const W=new oe({canvas:S,antialias:!0,alpha:!0});if(!W.capabilities.isWebGL2)throw new Error("WebGL2 is required for the smoke demo.");W.outputColorSpace=ne;W.setPixelRatio(Math.min(window.devicePixelRatio,1.5));const rt=Xt();W.setSize(rt.width,rt.height,!1);W.toneMapping=se;W.toneMappingExposure=1.08;const L=ze(rt),He=We(L.width,L.height),w=new Ae({inputWidth:L.width,inputHeight:L.height,...He}),C=new re;C.background=new I(329485);C.fog=new ae(329485,.062);const Z=new le(50,rt.width/rt.height,.1,100),mt=new z(0,4.2,0),D={theta:.48,phi:1.02,radius:12.2};function Ct(){Z.position.set(mt.x+D.radius*Math.sin(D.phi)*Math.sin(D.theta),mt.y+D.radius*Math.cos(D.phi),mt.z+D.radius*Math.sin(D.phi)*Math.cos(D.theta)),Z.lookAt(mt)}function Ee(){const{width:t,height:e}=Xt();Z.aspect=t/e,Z.updateProjectionMatrix(),W.setSize(t,e,!1)}Ct();const yt=new ce,Pe=document.getElementById("lookName"),Ve=new Le;C.add(new ue(8359860,1446413,1.45));const bt=new It(11060479,1.45);bt.position.set(-5.5,9,5.5);C.add(bt);const Yt=new It(5070205,.45);Yt.position.set(4.5,3,-2);C.add(Yt);const at=new he(16747335,3.5,16,2);at.position.set(0,1.2,0);C.add(at);const Ie=L.height*.08,Zt=new _t({color:1052951,roughness:.94,metalness:.05}),Dt=new Q(new Ft(18,64),Zt);Dt.rotation.x=-Math.PI/2;Dt.position.y=-.01;C.add(Dt);const R=new Q(new Ft(1,48),new Bt({color:16743213,transparent:!0,opacity:.17,depthWrite:!1,blending:me}));R.rotation.x=-Math.PI/2;R.position.y=.005;C.add(R);const pt=new _t({color:3416085,roughness:.7,metalness:.2,emissive:1902851,emissiveIntensity:.8}),xt=new Q(new de(1.35,.12,18,64),pt);xt.rotation.x=Math.PI/2;xt.position.y=.08;C.add(xt);const ft=new _t({color:2299665,roughness:.64,metalness:.18,emissive:590850,emissiveIntensity:.35}),Rt=new Q(new pe(.32,.42,.52,24),ft);Rt.position.y=.25;C.add(Rt);const F=new fe;C.add(F);const ct=6.2,J=10,Lt=1,T=new z(-ct*.5,0,-Lt*.5),nt=new z(ct*.5,J,Lt*.5),_={u_volumeTex:{value:w.volumeTexture},u_boundsMin:{value:T.clone()},u_boundsMax:{value:nt.clone()},u_cameraPosLocal:{value:new z},u_lightDirLocal:{value:new z(-.42,.84,.33).normalize()},u_time:{value:0},u_densityGain:{value:1.12},u_shadowStrength:{value:1.08},u_warpAmount:{value:.09},u_emissionGain:{value:1.18},u_mode:{value:1},u_fireBaseColor:{value:new I(3758335)},u_fireLowColor:{value:new I(1311745)},u_fireMidColor:{value:new I(16738834)},u_fireHighColor:{value:new I(16773073)},u_sootColor:{value:new I(2364945)},u_smokeLightColor:{value:new I(14804718)},u_smokeDarkColor:{value:new I(1843240)},u_smokeWarmColor:{value:new I(12741423)}},E=new Q((()=>{const t=new xe(ct,J,Lt,1,1,1);return t.translate(0,J*.5,0),t})(),new ve({uniforms:_,vertexShader:Se,fragmentShader:Ne,glslVersion:we,transparent:!0,side:ge,depthWrite:!1,depthTest:!0,blending:ye}));E.position.y=.04;E.scale.z=4.4;E.renderOrder=3;F.add(E);const lt={x:ct*.5,z:E.scale.z*.5};function At(t=1){R.scale.set(lt.x*t,lt.z*t,1)}At();const jt=new Q(new Me(ct,J),new Bt({color:16777215,transparent:!0,opacity:0,side:_e,depthWrite:!1}));jt.position.set(0,J*.5,0);F.add(jt);const ot=new Ce,Mt=new Gt,Ot=new z,Et=new z,Fe=new z(0,J*.5,0),dt=new z,Pt=new z,gt=new z,wt=new be;function Be(t,e){const i=S.getBoundingClientRect();Mt.x=(t-i.left)/i.width*2-1,Mt.y=-((e-i.top)/i.height)*2+1}function Ge(t,e,i,n){const l=1/e.x,r=1/e.y,h=1/e.z,d=(i.x-t.x)*l,s=(n.x-t.x)*l,o=(i.y-t.y)*r,c=(n.y-t.y)*r,a=(i.z-t.z)*h,x=(n.z-t.z)*h,f=Math.max(Math.min(d,s),Math.min(o,c),Math.min(a,x)),p=Math.min(Math.max(d,s),Math.max(o,c),Math.max(a,x));return!Number.isFinite(f)||!Number.isFinite(p)||p<Math.max(f,0)?null:{tNear:Math.max(f,0),tFar:p}}function Ut(t,e){Be(t,e),ot.setFromCamera(Mt,Z),F.updateMatrixWorld(!0);const i=ot.intersectObject(R,!1)[0];if(i){const a=F.worldToLocal(i.point.clone()),x=N.clamp(a.x/(lt.x*2)+.5,0,1),f=N.clamp(a.z/(lt.z*2)+.5,0,1);return{x:x*L.width,y:Ie,depth:f}}E.updateMatrixWorld(!0),wt.copy(E.matrixWorld).invert(),dt.copy(ot.ray.origin).applyMatrix4(wt),Pt.copy(ot.ray.origin).add(ot.ray.direction).applyMatrix4(wt),gt.copy(Pt).sub(dt).normalize();const n=Ge(dt,gt,T,nt);if(!n)return null;const l=Ot.copy(dt).addScaledVector(gt,n.tNear),r=(l.x-T.x)/(nt.x-T.x),h=(l.y-T.y)/(nt.y-T.y),d=(l.z-T.z)/(nt.z-T.z),s=N.clamp(r*L.width,0,L.width),o=N.clamp(h*L.height,0,L.height),c=N.clamp(d,0,1);return{x:s,y:o,depth:c}}const m={radius:28,force:3.2,velocityAmount:.38,densityAmount:.95,temperatureAmount:1.35,autoWander:.06};let St="fire",K=0,Nt="campfire";function Te(t,e){t==="buoyancy"&&(w.buoyancy=e),t==="vorticity"&&(w.vortConfinement=e),t==="dissipation"&&(w.dissipation=e,w.tempDissipation=Math.max(.88,e-.018*w.cooling)),t==="jacobiIter"&&(w.jacobiIter=Math.round(e)),t==="lateralSpread"&&(w.lateralSpread=e),t==="verticalLift"&&(w.verticalLift=e),t==="cooling"&&(w.cooling=e,w.tempDissipation=Math.max(.88,w.dissipation-.018*e)),t==="emitterRadius"&&(m.radius=e),t==="emitterForce"&&(m.force=e),t==="velocityAmount"&&(m.velocityAmount=e),t==="densityAmount"&&(m.densityAmount=e),t==="temperatureAmount"&&(m.temperatureAmount=e),t==="autoWander"&&(m.autoWander=e),t==="volumeDepth"&&(E.scale.z=e,lt.z=e*.5,At()),t==="densityGain"&&(_.u_densityGain.value=e),t==="shadowing"&&(_.u_shadowStrength.value=e),t==="warpAmount"&&(_.u_warpAmount.value=e),t==="emissionGain"&&(_.u_emissionGain.value=e),t==="exposure"&&(W.toneMappingExposure=e),t==="fogDensity"&&(C.fog.density=e)}const y={simulation:{section:"Simulation",sectionOrder:1},emitter:{section:"Emitter",sectionOrder:2},volume:{section:"Volume Look",sectionOrder:3},atmosphere:{section:"Atmosphere",sectionOrder:4}},g=new De({buoyancy:{...y.simulation,order:1,label:"Buoyancy",min:0,max:5,step:.1,value:1.8,description:"3D グリッド内で温度を上向き速度へ変換する強さです。大きいほど煙柱が高く伸び、立ち上がりが速くなります。"},vorticity:{...y.simulation,order:2,label:"Vorticity",min:0,max:30,step:.5,value:16,description:"ボクセル間の横渦と巻き込み量です。値を上げると奥行き方向にもねじれが出て、立体的な乱流になります。"},dissipation:{...y.simulation,order:3,label:"Dissipation",min:.95,max:1,step:.001,value:.992,description:"密度と熱が 3D グリッド内でどれだけ残るかを制御します。高いほど煙が長く残り、低いほど薄く消えます。"},jacobiIter:{...y.simulation,order:4,label:"Velocity Smooth",min:5,max:40,step:1,value:20,decimals:0,description:"速度場の平滑化量です。上げると流れが滑らかに繋がり、低いと荒く切れた乱れが出ます。"},lateralSpread:{...y.simulation,order:5,label:"Lateral Spread",min:.35,max:1.8,step:.01,value:w.lateralSpread,description:"煙や炎が左右へ広がる強さです。大きいほど横に膨らみ、低いほど細い柱のまま立ち上がります。"},verticalLift:{...y.simulation,order:6,label:"Vertical Lift",min:.45,max:1.7,step:.01,value:w.verticalLift,description:"上昇方向の持ち上がりです。高いほど立ち上がりが速くなり、低いほど横へ流れやすくなります。"},cooling:{...y.simulation,order:7,label:"Cooling",min:.6,max:1.4,step:.01,value:w.cooling,description:"熱が失われる速さです。大きいほど火は早く冷えて煙へ移り、小さいほど高温の芯が長く残ります。"},emitterRadius:{...y.emitter,order:1,label:"Emitter Radius",min:10,max:56,step:1,value:m.radius,decimals:0,description:"3D グリッドへ注入する範囲です。大きいほど太い煙柱や広い炎になり、小さいほど集中した噴出になります。"},emitterForce:{...y.emitter,order:2,label:"Emitter Force",min:.5,max:6.5,step:.1,value:m.force,description:"噴出時に与える初速です。高いほど密度グリッド内で押し上げが強くなり、ジェット感が増します。"},velocityAmount:{...y.emitter,order:3,label:"Emitter Velocity",min:.1,max:.9,step:.01,value:m.velocityAmount,description:"注入した瞬間に与える流速の量です。上げるほど押し出しが強くなり、勢いのある炎や煙になります。"},densityAmount:{...y.emitter,order:4,label:"Emitter Density",min:.2,max:1.6,step:.01,value:m.densityAmount,description:"1 回の噴出で加える密度の量です。高いほど煙の塊が濃くなり、ボリュームの芯が太く見えます。"},temperatureAmount:{...y.emitter,order:5,label:"Emitter Heat",min:0,max:1.8,step:.01,value:m.temperatureAmount,description:"噴出に含める熱量です。高いほど燃焼色が明るくなり、上昇も強くなります。低いと霧や煙に寄ります。"},autoWander:{...y.emitter,order:6,label:"Auto Wander",min:0,max:.22,step:.005,value:m.autoWander,description:"自動噴出時の発生位置の揺れ幅です。上げるほど火元やミストが左右にうねり、低いと真上へ安定して立ちます。"},volumeDepth:{...y.volume,order:1,label:"Volume Depth",min:2.4,max:6.8,step:.1,value:4.4,description:"3D ボリューム描画の奥行きです。大きいほど横から見たときの厚みが増え、ボクセルの立体感が強く見えます。"},densityGain:{...y.volume,order:2,label:"Density Gain",min:.55,max:1.9,step:.01,value:1.12,description:"密度グリッドの見た目の濃さです。高いほど煙は重く、炎は芯の詰まったボリュームになります。"},shadowing:{...y.volume,order:3,label:"Self Shadow",min:0,max:2,step:.05,value:1.08,description:"ボリューム内部の自己陰影です。高いほど奥が暗くなり、内部の厚みや層構造が分かりやすくなります。"},warpAmount:{...y.volume,order:4,label:"Depth Warp",min:0,max:.18,step:.005,value:.09,description:"3D テクスチャ参照時の微小な歪み量です。上げると密度グリッドの格子感が減り、より自然な揺らぎになります。"},emissionGain:{...y.volume,order:5,label:"Emission",min:.5,max:1.8,step:.01,value:1.18,description:"体積発光の強さです。炎では輝度、煙では散乱の明るさに効き、熱量の印象を調整します。"},exposure:{...y.atmosphere,order:1,label:"Exposure",min:.7,max:1.4,step:.01,value:W.toneMappingExposure,description:"画面全体の露出です。上げるほど火の明るさや霧の白さが強まり、下げると締まった暗部が残ります。"},fogDensity:{...y.atmosphere,order:2,label:"Fog Density",min:.02,max:.12,step:.001,value:C.fog.density,description:"背景側に溜まる空気の霞みです。上げるほど奥が沈んで立体感が出て、下げると全体がクリアに見えます。"}},Te,{title:"Volume Controls",accent:"#ffb56a",anchor:kt}),qt={campfire:{label:"Campfire",mode:"fire",buoyancy:1.8,vorticity:16,dissipation:.992,jacobiIter:20,emitterRadius:28,emitterForce:3.2,velocityAmount:.38,densityAmount:.95,temperatureAmount:1.35,autoWander:.06,volumeDepth:4.4,densityGain:1.12,shadowing:1.08,warpAmount:.09,emissionGain:1.18,light:16747335,intensity:3.5,exposure:1.08,background:329485,fogDensity:.062,floorColor:1052951,glowColor:16743213,glowOpacity:.17,ringColor:3416085,ringEmissive:1902851,ringEmissiveIntensity:.8,coreColor:2299665,coreEmissive:1180929,coreEmissiveIntensity:.35,fireBaseColor:3827455,fireLowColor:2229249,fireMidColor:16737560,fireHighColor:16773841,sootColor:2759702,smokeLightColor:14209738,smokeDarkColor:2169111,smokeWarmColor:10969140,lateralSpread:.96,radialPull:.018,verticalLift:1.06,cooling:1.02,edgeLoss:.93,topLoss:.84,densityDiffusion:.036,temperatureDiffusion:.024},mist:{label:"Mist",mode:"smoke",buoyancy:1,vorticity:24,dissipation:.997,jacobiIter:24,emitterRadius:42,emitterForce:2,velocityAmount:.22,densityAmount:.72,temperatureAmount:.12,autoWander:.14,volumeDepth:5.8,densityGain:.84,shadowing:1.52,warpAmount:.12,emissionGain:.74,light:8108031,intensity:1.15,exposure:1,background:395280,fogDensity:.075,floorColor:1185053,glowColor:8633087,glowOpacity:.06,ringColor:2765118,ringEmissive:528408,ringEmissiveIntensity:.25,coreColor:2107443,coreEmissive:660255,coreEmissiveIntensity:.12,fireBaseColor:8959743,fireLowColor:594205,fireMidColor:10011903,fireHighColor:16514559,sootColor:1581360,smokeLightColor:16120063,smokeDarkColor:6976640,smokeWarmColor:13163766,lateralSpread:1.46,radialPull:-.007,verticalLift:.84,cooling:1.18,edgeLoss:.968,topLoss:.91,densityDiffusion:.082,temperatureDiffusion:.052},thruster:{label:"Thruster",mode:"fire",buoyancy:.55,vorticity:9,dissipation:.989,jacobiIter:18,emitterRadius:18,emitterForce:5.4,velocityAmount:.58,densityAmount:1.18,temperatureAmount:1.5,autoWander:.03,volumeDepth:3.2,densityGain:1.42,shadowing:.64,warpAmount:.045,emissionGain:1.34,light:6739711,intensity:4.5,exposure:1.16,background:263951,fogDensity:.052,floorColor:790553,glowColor:5951743,glowOpacity:.15,ringColor:2373446,ringEmissive:663600,ringEmissiveIntensity:.72,coreColor:1582902,coreEmissive:861239,coreEmissiveIntensity:.42,fireBaseColor:3108095,fireLowColor:264984,fireMidColor:2605567,fireHighColor:16055551,sootColor:858925,smokeLightColor:13823231,smokeDarkColor:1386555,smokeWarmColor:6537727,lateralSpread:.62,radialPull:.028,verticalLift:1.22,cooling:.88,edgeLoss:.89,topLoss:.79,densityDiffusion:.026,temperatureDiffusion:.018}};function ke(t){St=t.mode,_.u_mode.value=t.mode==="fire"?1:0,at.color.setHex(t.light),at.intensity=t.intensity,W.toneMappingExposure=t.exposure,C.background.setHex(t.background),C.fog.color.setHex(t.background),C.fog.density=t.fogDensity,Zt.color.setHex(t.floorColor),R.material.color.setHex(t.glowColor),R.material.opacity=t.glowOpacity,pt.color.setHex(t.ringColor),pt.emissive.setHex(t.ringEmissive),pt.emissiveIntensity=t.ringEmissiveIntensity,ft.color.setHex(t.coreColor),ft.emissive.setHex(t.coreEmissive),ft.emissiveIntensity=t.coreEmissiveIntensity,_.u_fireBaseColor.value.setHex(t.fireBaseColor),_.u_fireLowColor.value.setHex(t.fireLowColor),_.u_fireMidColor.value.setHex(t.fireMidColor),_.u_fireHighColor.value.setHex(t.fireHighColor),_.u_sootColor.value.setHex(t.sootColor),_.u_smokeLightColor.value.setHex(t.smokeLightColor),_.u_smokeDarkColor.value.setHex(t.smokeDarkColor),_.u_smokeWarmColor.value.setHex(t.smokeWarmColor),w.configure({lateralSpread:t.lateralSpread,radialPull:t.radialPull,verticalLift:t.verticalLift,cooling:t.cooling,edgeLoss:t.edgeLoss,topLoss:t.topLoss,densityDiffusion:t.densityDiffusion,temperatureDiffusion:t.temperatureDiffusion,tempDissipation:Math.max(.88,t.dissipation-.018*t.cooling)})}function st(t){const e=qt[t];e&&(Nt=t,Pe.textContent=e.label,g.setValue("buoyancy",e.buoyancy,!0),g.setValue("vorticity",e.vorticity,!0),g.setValue("dissipation",e.dissipation,!0),g.setValue("jacobiIter",e.jacobiIter,!0),g.setValue("lateralSpread",e.lateralSpread,!0),g.setValue("verticalLift",e.verticalLift,!0),g.setValue("cooling",e.cooling,!0),g.setValue("emitterRadius",e.emitterRadius,!0),g.setValue("emitterForce",e.emitterForce,!0),g.setValue("velocityAmount",e.velocityAmount,!0),g.setValue("densityAmount",e.densityAmount,!0),g.setValue("temperatureAmount",e.temperatureAmount,!0),g.setValue("autoWander",e.autoWander,!0),g.setValue("volumeDepth",e.volumeDepth,!0),g.setValue("densityGain",e.densityGain,!0),g.setValue("shadowing",e.shadowing,!0),g.setValue("warpAmount",e.warpAmount,!0),g.setValue("emissionGain",e.emissionGain,!0),g.setValue("exposure",e.exposure,!0),g.setValue("fogDensity",e.fogDensity,!0),m.velocityAmount=e.velocityAmount,m.densityAmount=e.densityAmount,m.temperatureAmount=e.temperatureAmount,m.autoWander=e.autoWander,w.reset(),ke(e),document.querySelectorAll("[data-look]").forEach(i=>{i.classList.toggle("active",i.dataset.look===t)}))}st(Nt);const u={mode:null,previous:{x:0,y:0},simPoint:null,velocity:new Gt,pointerId:null};S.addEventListener("contextmenu",t=>t.preventDefault());S.addEventListener("pointerdown",t=>{if(t.pointerType==="mouse"&&t.button===2){S.setPointerCapture(t.pointerId),u.mode="orbit",u.pointerId=t.pointerId,u.previous={x:t.clientX,y:t.clientY};return}if(t.pointerType==="mouse"&&t.button!==0)return;const e=Ut(t.clientX,t.clientY);e&&(S.setPointerCapture(t.pointerId),u.mode="emit",u.pointerId=t.pointerId,u.simPoint=e,u.velocity.set(0,m.force))});function Kt(t){u.pointerId!==null&&t?.pointerId===u.pointerId&&S.hasPointerCapture(t.pointerId)&&S.releasePointerCapture(t.pointerId),u.mode=null,u.pointerId=null,u.simPoint=null}S.addEventListener("pointerup",Kt);S.addEventListener("pointercancel",Kt);S.addEventListener("pointermove",t=>{if(u.mode==="orbit"){D.theta=N.clamp(D.theta-(t.clientX-u.previous.x)*.005,-1.2,1.2),D.phi=N.clamp(D.phi+(t.clientY-u.previous.y)*.005,.54,1.44),u.previous={x:t.clientX,y:t.clientY},Ct();return}if(u.mode!=="emit")return;const e=Ut(t.clientX,t.clientY);!e||!u.simPoint||(u.velocity.set((e.x-u.simPoint.x)*5.6,(e.y-u.simPoint.y)*5.6+m.force),u.simPoint=e)});S.addEventListener("wheel",t=>{t.preventDefault(),D.radius=N.clamp(D.radius+t.deltaY*.01,8,18),Ct()},{passive:!1});document.querySelectorAll("[data-look]").forEach(t=>{t.addEventListener("click",()=>st(t.dataset.look))});window.addEventListener("keydown",t=>{t.key==="1"&&st("campfire"),t.key==="2"&&st("mist"),t.key==="3"&&st("thruster"),(t.key==="r"||t.key==="R")&&w.reset()});window.addEventListener("resize",Ee);function Vt(t,e,i,n,l){w.splat(t,e,n,l,St,{radius:m.radius,velocityAmount:m.velocityAmount,densityAmount:m.densityAmount,temperatureAmount:m.temperatureAmount,depth:i})}function Xe(t){const e=Math.sin(t*.52)*.11,i=Math.cos(t*.41)*.08;F.position.x=e,F.position.z=i,F.rotation.y=Math.sin(t*.16)*.1;const l=qt[Nt].intensity,r=St==="fire"?.88+Math.sin(t*20)*.08+Math.sin(t*33)*.05:.96+Math.sin(t*4)*.03;at.intensity=l*r,xt.rotation.z=Math.sin(t*.55)*.04,At(1+Math.sin(t*2.2)*.03)}function Ye(t){F.updateMatrixWorld(!0),_.u_time.value=t,_.u_cameraPosLocal.value.copy(E.worldToLocal(Ot.copy(Z.position))),Et.copy(bt.position),_.u_lightDirLocal.value.copy(E.worldToLocal(Et).sub(Fe)).normalize()}function Jt(){requestAnimationFrame(Jt);const t=Math.min(Ve.getDelta(),1/24);if(K+=t,u.mode==="emit"&&u.simPoint)Vt(u.simPoint.x,u.simPoint.y,u.simPoint.depth,u.velocity.x,u.velocity.y),u.velocity.x*=.84,u.velocity.y=u.velocity.y*.66+m.force*.34;else{const e=L.width*.5+Math.sin(K*1.1)*L.width*m.autoWander,i=L.height*.08,n=Math.sin(K*1.8)*m.force*.55;Vt(e,i,.5,n,m.force)}yt.beginSim(),w.step(K,t),yt.endSim(),Xe(K),Ye(K),W.render(C,Z),yt.update()}Jt();
