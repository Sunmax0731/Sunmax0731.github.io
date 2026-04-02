import{D as Bt,R as Zt,F as Yt,L as ot,C as rt,M as s,W as Vt,A as qt,S as Nt,P as jt,V as Me,a as Ut,b as Z,c as mt,d as ft,G as wt,e as W,f as _e,g as Ue,h as me,B as ze,i as Ee,j as $t,H as Kt,k as Qt,l as Jt,m as ei,n as X,o as ti,p as ii,q as ai,r as ni,s as si,t as oi,u as vt}from"./controls-D9uNXtZD.js";const ri=`precision highp float;

in vec3 position;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform float u_time;
uniform float u_waveHeight;
uniform float u_windDir;
uniform float u_windSpeed;
uniform float u_viscosity;
uniform float u_wallReflectivity;
uniform vec2 u_basinHalfSize;
uniform sampler2D u_dynamicHeight;
uniform vec2 u_dynamicTexel;
uniform vec2 u_dynamicCellSize;
uniform float u_dynamicGain;
uniform float u_localWaveSeconds;
uniform vec4 u_impacts[32];

out vec3 v_worldPos;
out vec3 v_normal;
out vec2 v_uv;
out float v_foam;

void applyRipple(
  vec2 xz,
  vec2 source,
  float strength,
  float age,
  float spatialFreq,
  float rippleSpeed,
  float radialDecay,
  float temporalDecay,
  float rampTime,
  inout float height,
  inout float gradX,
  inout float gradZ
) {
  float distX = xz.x - source.x;
  float distZ = xz.y - source.y;
  vec2 delta = vec2(distX, distZ);
  float dist = max(length(delta), 0.0001);
  float phase = dist * spatialFreq - age * rippleSpeed;
  float envelope = exp(-dist * radialDecay) * exp(-age * temporalDecay) * smoothstep(0.0, rampTime, age);
  float amplitude = strength * envelope;
  float wave = sin(phase);

  height += amplitude * wave;

  float dHdr = amplitude * (spatialFreq * cos(phase) - radialDecay * wave);
  vec2 dir = delta / dist;
  gradX += dHdr * dir.x;
  gradZ += dHdr * dir.y;
}

float sampleDynamicHeight(vec2 sampleUv) {
  return texture(u_dynamicHeight, clamp(sampleUv, vec2(0.0), vec2(1.0))).r;
}

void main() {
  v_uv = uv;

  vec3 pos = position;
  vec2 xz = (modelMatrix * vec4(position, 1.0)).xz;
  float time = u_time;

  vec2 d0 = normalize(vec2(cos(u_windDir), sin(u_windDir)));
  vec2 d1 = normalize(vec2(cos(u_windDir + 0.55), sin(u_windDir + 0.55)));
  vec2 d2 = normalize(vec2(cos(u_windDir - 0.75), sin(u_windDir - 0.75)));
  vec2 d3 = normalize(vec2(cos(u_windDir + 1.25), sin(u_windDir + 1.25)));

  float f0 = 0.22 / max(u_windSpeed, 0.5);
  float f1 = 0.46 / max(u_windSpeed, 0.5);
  float f2 = 0.78 / max(u_windSpeed, 0.5);
  float f3 = 1.12 / max(u_windSpeed, 0.5);

  float p0 = dot(xz, d0) * f0 * 14.0 - time * 1.1;
  float p1 = dot(xz, d1) * f1 * 11.0 - time * 1.5;
  float p2 = dot(xz, d2) * f2 * 8.0 - time * 1.8;
  float p3 = dot(xz, d3) * f3 * 6.0 - time * 2.4;

  float a0 = u_waveHeight * 0.85;
  float a1 = u_waveHeight * 0.35;
  float a2 = u_waveHeight * 0.18;
  float a3 = u_waveHeight * 0.1;

  pos.y += sin(p0) * a0;
  pos.y += sin(p1) * a1;
  pos.y += sin(p2) * a2;
  pos.y += sin(p3) * a3;
  float surfaceHeight = pos.y;

  float dhdx = cos(p0) * a0 * d0.x * f0 * 14.0
             + cos(p1) * a1 * d1.x * f1 * 11.0
             + cos(p2) * a2 * d2.x * f2 * 8.0
             + cos(p3) * a3 * d3.x * f3 * 6.0;

  float dhdz = cos(p0) * a0 * d0.y * f0 * 14.0
             + cos(p1) * a1 * d1.y * f1 * 11.0
             + cos(p2) * a2 * d2.y * f2 * 8.0
             + cos(p3) * a3 * d3.y * f3 * 6.0;

  for (int i = 0; i < 32; i++) {
    vec4 impact = u_impacts[i];
    float age = time - impact.z;
    if (age <= 0.0 || impact.w <= 0.001) continue;

    float viscMix = clamp((u_viscosity - 0.05) / 1.75, 0.0, 1.0);
    float rippleSpeed = mix(10.4, 6.2, viscMix);
    float spatialFreq = mix(7.4, 5.8, viscMix * 0.9);
    float radialDecay = mix(0.34, 0.68, viscMix);
    float temporalDecay = mix(0.1, 0.26, viscMix);
    float rampTime = mix(0.06, 0.14, viscMix);
    float singleReflectionGain = u_wallReflectivity * 0.78;
    float cornerReflectionGain = u_wallReflectivity * u_wallReflectivity * 0.62;
    float maxAge = max(u_localWaveSeconds, 0.2);
    if (age >= maxAge) continue;

    float leftX = -2.0 * u_basinHalfSize.x - impact.x;
    float rightX = 2.0 * u_basinHalfSize.x - impact.x;
    float nearZ = -2.0 * u_basinHalfSize.y - impact.y;
    float farZ = 2.0 * u_basinHalfSize.y - impact.y;

    applyRipple(xz, impact.xy, impact.w, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(leftX, impact.y), impact.w * singleReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(rightX, impact.y), impact.w * singleReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(impact.x, nearZ), impact.w * singleReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(impact.x, farZ), impact.w * singleReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(leftX, nearZ), impact.w * cornerReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(leftX, farZ), impact.w * cornerReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(rightX, nearZ), impact.w * cornerReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
    applyRipple(xz, vec2(rightX, farZ), impact.w * cornerReflectionGain, age, spatialFreq, rippleSpeed, radialDecay, temporalDecay, rampTime, surfaceHeight, dhdx, dhdz);
  }

  float dynamicCenter = sampleDynamicHeight(uv);
  float dynamicRight = sampleDynamicHeight(uv + vec2(u_dynamicTexel.x, 0.0));
  float dynamicLeft = sampleDynamicHeight(uv - vec2(u_dynamicTexel.x, 0.0));
  float dynamicTop = sampleDynamicHeight(uv + vec2(0.0, u_dynamicTexel.y));
  float dynamicBottom = sampleDynamicHeight(uv - vec2(0.0, u_dynamicTexel.y));

  surfaceHeight += dynamicCenter * u_dynamicGain;
  dhdx += ((dynamicRight - dynamicLeft) / max(2.0 * u_dynamicCellSize.x, 0.0001)) * u_dynamicGain;
  dhdz += ((dynamicBottom - dynamicTop) / max(2.0 * u_dynamicCellSize.y, 0.0001)) * u_dynamicGain;

  pos.y = surfaceHeight;
  v_normal = normalize(vec3(-dhdx, 1.0, -dhdz));
  v_worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  v_foam = smoothstep(0.05, 0.45, length(vec2(dhdx, dhdz))) * 0.55;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,li=`precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;
in vec2 v_uv;
in float v_foam;

uniform vec3 u_cameraPos;
uniform vec3 u_sunDir;
uniform vec3 u_sunColor;
uniform float u_time;
uniform vec3 u_shallowColor;
uniform vec3 u_deepColor;
uniform vec3 u_subsurfaceColor;
uniform vec3 u_foamTint;
uniform float u_foamAmount;
uniform float u_reflectionMix;
uniform float u_basinDepth;
uniform float u_waterSurfaceY;
uniform float u_waterClarity;
uniform float u_absorption;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

vec3 skyColor(vec3 dir) {
  float t = max(dir.y, 0.0);
  vec3 zenith = vec3(0.05, 0.15, 0.4);
  vec3 horizon = vec3(0.6, 0.75, 0.9);
  return mix(horizon, zenith, pow(t, 0.6));
}

void main() {
  vec3 normal = normalize(v_normal);

  float t = u_time * 0.3;
  vec2 uvAnim = v_worldPos.xz * 0.5;
  float nx = fbm(uvAnim + vec2(t, 0.0)) * 2.0 - 1.0;
  float nz = fbm(uvAnim + vec2(0.0, t * 0.8) + vec2(5.2, 1.3)) * 2.0 - 1.0;
  normal = normalize(normal + vec3(nx, 0.0, nz) * 0.12);

  vec3 viewDir = normalize(u_cameraPos - v_worldPos);
  vec3 lightDir = normalize(u_sunDir);
  vec3 halfDir = normalize(lightDir + viewDir);

  float f0 = 0.02;
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
  fresnel = clamp(fresnel, 0.0, 1.0);

  vec3 reflected = reflect(-viewDir, normal);
  vec3 reflColor = skyColor(reflected);

  float spec = pow(max(dot(normal, halfDir), 0.0), 256.0);
  vec3 sunSpec = u_sunColor * spec * 8.0;

  float depth = clamp((u_waterSurfaceY - v_worldPos.y + u_basinDepth) / max(u_basinDepth, 0.001), 0.0, 1.0);
  float absorb = exp(-depth * mix(3.8, 1.35, u_waterClarity) * u_absorption);
  vec3 transmittedColor = mix(u_deepColor, u_shallowColor, absorb);
  vec3 waterColor = mix(transmittedColor, u_deepColor, clamp(depth * 0.22, 0.0, 1.0));

  float sss = pow(max(dot(lightDir, -viewDir), 0.0), 3.0) * 0.3;
  vec3 sssColor = u_subsurfaceColor * sss;

  float reflection = clamp(fresnel * u_reflectionMix, 0.0, 1.0);
  vec3 color = mix(waterColor + sssColor, reflColor, reflection) + sunSpec;

  float foamNoise = fbm(v_worldPos.xz * 3.0 + vec2(u_time * 0.1)) * 0.5;
  float foamMask = smoothstep(0.3, 0.8, v_foam + foamNoise);
  color = mix(color, u_foamTint, foamMask * 0.7 * u_foamAmount);

  float dist = length(u_cameraPos - v_worldPos);
  float fog = exp(-dist * 0.008);
  vec3 fogColor = skyColor(normalize(v_worldPos - u_cameraPos));
  color = mix(fogColor, color, fog);

  float alphaBase = mix(0.26, 0.64, depth);
  float alpha = mix(alphaBase, 0.94, reflection * 0.82);
  alpha += foamMask * 0.14;
  alpha = clamp(mix(alpha, alpha * 0.72, u_waterClarity), 0.14, 0.96);

  fragColor = vec4(color, alpha);
}
`,ci=`precision highp float;

in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec3 v_dir;

void main() {
  v_dir = position;
  vec4 pos = projectionMatrix * mat4(mat3(modelViewMatrix)) * vec4(position, 1.0);
  gl_Position = pos.xyww;
}
`,pi=`precision highp float;

in vec3 v_dir;

uniform vec3 u_sunDir;
uniform vec3 u_sunColor;

out vec4 fragColor;

void main() {
  vec3 dir = normalize(v_dir);
  float t = max(dir.y, 0.0);

  vec3 zenith = vec3(0.05, 0.15, 0.42);
  vec3 horizon = vec3(0.55, 0.72, 0.92);
  vec3 sky = mix(horizon, zenith, pow(t, 0.5));

  float sunset = pow(1.0 - t, 4.0) * 0.4;
  sky += vec3(1.0, 0.4, 0.1) * sunset * (1.0 - u_sunDir.y);

  float sunDot = max(dot(dir, normalize(u_sunDir)), 0.0);
  sky += u_sunColor * pow(sunDot, 128.0) * 3.0;
  sky += u_sunColor * pow(sunDot, 8.0) * 0.2;

  fragColor = vec4(sky, 1.0);
}
`;class gt{constructor(t={}){const i=t.resolution??128;this.width=i,this.height=i,this.basinHalfSize=t.basinHalfSize.clone(),this.sizeX=this.basinHalfSize.x*2,this.sizeZ=this.basinHalfSize.y*2,this.cellX=this.sizeX/(this.width-1),this.cellZ=this.sizeZ/(this.height-1),this.invCellX2=1/(this.cellX*this.cellX),this.invCellZ2=1/(this.cellZ*this.cellZ),this.count=this.width*this.height,this.heights=new Float32Array(this.count),this.velocities=new Float32Array(this.count),this.nextHeights=new Float32Array(this.count),this.nextVelocities=new Float32Array(this.count),this.textureData=new Float32Array(this.count*4),this.texture=new Bt(this.textureData,this.width,this.height,Zt,Yt),this.texture.minFilter=ot,this.texture.magFilter=ot,this.texture.wrapS=rt,this.texture.wrapT=rt,this.texture.generateMipmaps=!1,this.viscosity=.35,this.baseWaveHeight=.02,this.windSpeed=.35,this.reset()}reset(){this.heights.fill(0),this.velocities.fill(0),this.nextHeights.fill(0),this.nextVelocities.fill(0),this.textureData.fill(0),this.texture.needsUpdate=!0}setParameters(t={}){typeof t.viscosity=="number"&&(this.viscosity=t.viscosity),typeof t.waveHeight=="number"&&(this.baseWaveHeight=t.waveHeight),typeof t.windSpeed=="number"&&(this.windSpeed=t.windSpeed)}addImpact(t,i,n,o=.48){const a=Math.max(o,.14),r=a*a,c=a*4.6,l=this._worldToGrid(t-c,i+c),p=this._worldToGrid(t+c,i-c),d=s.clamp(this.baseWaveHeight/.8,0,1),m=s.clamp((this.viscosity-.05)/1.75,0,1),x=n*s.lerp(3.8,6.8,d)*s.lerp(1,.9,m),_=n*s.lerp(.038,.088,d)*s.lerp(1,.92,m);for(let S=l.z;S<=p.z;S++){const D=this._gridToWorldZ(S);for(let h=l.x;h<=p.x;h++){const G=this._gridToWorldX(h)-t,P=D-i,L=G*G+P*P;if(L>c*c)continue;const R=Math.exp(-L/(2*r)),N=L/r,$=(N-.92)*R,Te=(1-N*.82)*R,Ge=S*this.width+h;this.velocities[Ge]+=$*x,this.heights[Ge]-=Te*_}}}step(t){if(t<=0)return;const i=s.clamp((this.viscosity-.05)/1.75,0,1),n=s.lerp(5.8,2.8,i)+Math.min(this.windSpeed,8)*.028,o=s.lerp(.008,.05,i),a=s.lerp(35e-5,.0022,i),r=s.lerp(.01,.045,i),c=Math.max(2,Math.min(6,Math.ceil(t/.0045))),l=t/c;for(let p=0;p<c;p++){for(let d=0;d<this.height;d++)for(let m=0;m<this.width;m++){const x=d*this.width+m,_=this.heights[d*this.width+(m>0?m-1:m+1)],S=this.heights[d*this.width+(m<this.width-1?m+1:m-1)],D=this.heights[(d>0?d-1:d+1)*this.width+m],h=this.heights[(d<this.height-1?d+1:d-1)*this.width+m],g=this.heights[x],G=this.velocities[x],P=(_+S-2*g)*this.invCellX2+(D+h-2*g)*this.invCellZ2,L=(_+S+D+h)*.25,R=n*n*P+(L-g)*r-G*o,N=(G+R*l)*(1-l*a),$=g+N*l;this.nextVelocities[x]=N,this.nextHeights[x]=$}this._swapBuffers(),this._removeMeanOffset(.006),this._removeVelocityBias(.003)}this._syncTexture()}sampleHeightAt(t,i){const n=s.clamp((t+this.basinHalfSize.x)/this.cellX,0,this.width-1),o=s.clamp((this.basinHalfSize.y-i)/this.cellZ,0,this.height-1),a=Math.floor(n),r=Math.floor(o),c=Math.min(a+1,this.width-1),l=Math.min(r+1,this.height-1),p=n-a,d=o-r,m=this.heights[r*this.width+a],x=this.heights[r*this.width+c],_=this.heights[l*this.width+a],S=this.heights[l*this.width+c],D=s.lerp(m,x,p),h=s.lerp(_,S,p);return s.lerp(D,h,d)}_worldToGrid(t,i){return{x:s.clamp(Math.floor((t+this.basinHalfSize.x)/this.cellX),0,this.width-1),z:s.clamp(Math.floor((this.basinHalfSize.y-i)/this.cellZ),0,this.height-1)}}_gridToWorldX(t){return-this.basinHalfSize.x+t*this.cellX}_gridToWorldZ(t){return this.basinHalfSize.y-t*this.cellZ}_removeMeanOffset(t=1){let i=0;for(let a=0;a<this.count;a++)i+=this.heights[a];const n=i/this.count;if(Math.abs(n)<1e-6)return;const o=n*t;for(let a=0;a<this.count;a++)this.heights[a]-=o}_removeVelocityBias(t=1){let i=0;for(let a=0;a<this.count;a++)i+=this.velocities[a];const n=i/this.count;if(Math.abs(n)<1e-6)return;const o=n*t;for(let a=0;a<this.count;a++)this.velocities[a]-=o}_swapBuffers(){[this.heights,this.nextHeights]=[this.nextHeights,this.heights],[this.velocities,this.nextVelocities]=[this.nextVelocities,this.velocities]}_syncTexture(){for(let t=0;t<this.count;t++){const i=t*4;this.textureData[i]=this.heights[t],this.textureData[i+1]=this.velocities[t],this.textureData[i+2]=0,this.textureData[i+3]=1}this.texture.needsUpdate=!0}}const yt=32,ae=128;function $e(e){let t=document.getElementById("fatal-error");t||(t=document.createElement("div"),t.id="fatal-error",Object.assign(t.style,{position:"fixed",left:"16px",right:"16px",bottom:"16px",padding:"14px 16px",borderRadius:"16px",border:"1px solid rgba(255, 110, 110, 0.35)",background:"rgba(40, 8, 12, 0.9)",color:"#ffd7d7",fontFamily:"Consolas, monospace",fontSize:"12px",lineHeight:"1.5",zIndex:"10000",whiteSpace:"pre-wrap"}),document.body.appendChild(t)),t.textContent=e}window.addEventListener("error",e=>{e.message&&$e(e.message)});window.addEventListener("unhandledrejection",e=>{const t=e.reason?.message||String(e.reason||"Unknown promise rejection");$e(t)});function Y(e){return s.clamp(e,0,1)}function ve(e,t){t.set(e.r,e.g,e.b)}const I=document.getElementById("canvas"),V=new Vt({canvas:I,antialias:!0});V.setPixelRatio(Math.min(window.devicePixelRatio,2));V.setSize(window.innerWidth,window.innerHeight);V.toneMapping=qt;V.toneMappingExposure=1.22;V.debug.onShaderError=(e,t,i,n)=>{const o=e.getShaderInfoLog(i)||"No vertex log",a=e.getShaderInfoLog(n)||"No fragment log",r=e.getProgramInfoLog(t)||"No program log";$e(`Shader compile failed

Vertex:
${o}

Fragment:
${a}

Program:
${r}`)};const T=new Nt,U=new jt(60,window.innerWidth/window.innerHeight,.1,1e3),Q=new Z(0,.2,0),A={theta:.26,phi:1.04,radius:14};function Re(){U.position.set(Q.x+A.radius*Math.sin(A.phi)*Math.sin(A.theta),Q.y+A.radius*Math.cos(A.phi),Q.z+A.radius*Math.sin(A.phi)*Math.cos(A.theta)),U.lookAt(Q)}const z=new Me(6.2,6.2),q=1.2,J=1.85,M=.03,di=.95,v=z.clone();let k=1,be=1,ne=q,xt=q,K=q,ee=0,H=M,He=128,Ke=ae,Ce=120;const he={size:.72,mass:.76},C={enabled:!1,rate:12,intensity:.22,accumulator:0};let ge=!1,b=new gt({resolution:He,basinHalfSize:v}),se;const St=new Ut(z.x*2,z.y*2,192,192);St.rotateX(-Math.PI/2);const Le=new Z(.5,.74,-.8).normalize(),Qe=new Z(1,.98,.9),Mt=new Z(.1,.55,.7),_t=new Z(.02,.08,.2),bt=new Z(.03,.42,.38),Ht=new Z(.95,.97,1),Je=Array.from({length:yt},()=>new mt(0,0,-100,0)),et=Array.from({length:ae},()=>new mt(0,0,-100,0));let Ie=0,xe=0,Dt=1,De=.35,oe=.76;const f={u_time:{value:0},u_waveHeight:{value:.02},u_windDir:{value:.18},u_windSpeed:{value:.35},u_viscosity:{value:De},u_basinHalfSize:{value:v},u_wallReflectivity:{value:oe},u_dynamicHeight:{value:b.texture},u_dynamicTexel:{value:new Me(1/b.width,1/b.height)},u_dynamicCellSize:{value:new Me(b.cellX,b.cellZ)},u_dynamicGain:{value:1.9},u_localWaveSeconds:{value:Ce},u_basinDepth:{value:ne},u_waterSurfaceY:{value:ee},u_waterClarity:{value:.72},u_absorption:{value:.88},u_cameraPos:{value:U.position.clone()},u_sunDir:{value:Le},u_sunColor:{value:Qe},u_shallowColor:{value:Mt},u_deepColor:{value:_t},u_subsurfaceColor:{value:bt},u_foamTint:{value:Ht},u_foamAmount:{value:.16},u_reflectionMix:{value:1.08},u_impacts:{value:Je}},hi={u_sunDir:{value:Le},u_sunColor:{value:Qe}},ui=new ft({name:"OceanSurface",vertexShader:ri,fragmentShader:li,uniforms:f,transparent:!0,depthWrite:!1,glslVersion:wt}),Fe=new W(St,ui);Fe.renderOrder=1;T.add(Fe);const Ne=new _e({color:1056819,roughness:.24,metalness:.08,emissive:528667,emissiveIntensity:.45}),zt=new _e({color:856601,roughness:.78,metalness:.12,emissive:395794,emissiveIntensity:.35}),Oe=new Ue({color:14085119,roughness:.04,metalness:.04,transmission:.92,transparent:!0,opacity:.24,thickness:.18,ior:1.12,clearcoat:1,clearcoatRoughness:.04});Oe.depthWrite=!1;const Rt=new _e({color:2240577,roughness:.22,metalness:.72,emissive:660256,emissiveIntensity:.8}),fe=new me;T.add(fe);const tt=new W(new ze(z.x*2+1.2,.56,z.y*2+1.2),zt);tt.position.y=-q-.32;fe.add(tt);const it=new W(new ze(z.x*2,.08,z.y*2),Ne);it.position.y=-q-.04;fe.add(it);const lt=-q+J*.5,mi=[{axis:"x",sign:1,sx:M,sy:J,sz:z.y*2+M},{axis:"x",sign:-1,sx:M,sy:J,sz:z.y*2+M},{axis:"z",sign:1,sx:z.x*2+M,sy:J,sz:M},{axis:"z",sign:-1,sx:z.x*2+M,sy:J,sz:M}],fi=mi.map(e=>{const t=new W(new ze(e.sx,e.sy,e.sz),Oe);return t.renderOrder=2,fe.add(t),{mesh:t,cfg:e}}),ct=-q+J+.06,wi=[{axis:"z",sign:1,sx:z.x*2+M*2.4,sy:.1,sz:M*2.2},{axis:"z",sign:-1,sx:z.x*2+M*2.4,sy:.1,sz:M*2.2},{axis:"x",sign:1,sx:M*2.2,sy:.1,sz:z.y*2+M*2.4},{axis:"x",sign:-1,sx:M*2.2,sy:.1,sz:z.y*2+M*2.4}],vi=wi.map(e=>{const t=new W(new ze(e.sx,e.sy,e.sz),Rt);return fe.add(t),{mesh:t,cfg:e}}),gi=new Ee(400,32,16),yi=new ft({name:"SkyDome",vertexShader:ci,fragmentShader:pi,uniforms:hi,side:$t,glslVersion:wt});T.add(new W(gi,yi));T.add(new Kt(8364232,1053467,.82));const ue=new Qt(16777215,.95);ue.position.copy(Le).multiplyScalar(18);T.add(ue);T.add(ue.target);const at=new Jt(10214655,.8,24,2);at.position.set(-6,4,5);T.add(at);const Xe=new me;T.add(Xe);const Be=new me;T.add(Be);const Ze=new me;T.add(Ze);const Ye=new me;T.add(Ye);const Ve=new me;T.add(Ve);const xi=new ei,u={waterHue:.53,waterSaturation:.64,waterLightness:.28,sunHue:.12,sunSaturation:.18,sunIntensity:1.05,foamAmount:.16,reflectionMix:1.08,exposure:1.22,impactGain:1,viscosity:.35,wallReflectivity:.76},te=new X,Pe=new X,pt=new X,je=new X,ke=new X,dt=new X,E={waveHeight:0,windSpeed:.05},F={waveHeight:f.u_waveHeight.value,windSpeed:f.u_windSpeed.value,windDir:f.u_windDir.value},y={waveHeight:f.u_waveHeight.value,windSpeed:f.u_windSpeed.value,windDir:f.u_windDir.value,waveHalfLife:3.2,windHalfLife:2.8};function Ct(){return Math.min(di*k,v.x-.34,v.y-.34)}function ye(){v.copy(z).multiplyScalar(k),ne=q*be,K=Math.min(Math.max(xt,.08),ne),ee=K-ne,Fe.scale.set(k,1,k),Fe.position.y=ee,fe.scale.set(1,be,1),tt.scale.set(k,1,k),it.scale.set(k,1,k),Oe.thickness=H*6,Oe.opacity=s.clamp(.18+H*1.8,.16,.3);for(const{mesh:e,cfg:t}of fi)t.axis==="x"?(e.scale.set(H/M,1,(v.y*2+H)/t.sz),e.position.set(t.sign*(v.x+H*.5),lt,0)):(e.scale.set((v.x*2+H)/t.sx,1,H/M),e.position.set(0,lt,t.sign*(v.y+H*.5)));for(const{mesh:e,cfg:t}of vi)t.axis==="x"?(e.scale.set(H/M,1,(v.y*2+H*2.4)/t.sz),e.position.set(t.sign*(v.x+H*.5),ct,0)):(e.scale.set((v.x*2+H*2.4)/t.sx,1,H/M),e.position.set(0,ct,t.sign*(v.y+H*.5)));f.u_basinHalfSize.value.copy(v),f.u_basinDepth.value=K,f.u_waterSurfaceY.value=ee,Q.y=ee*.35+.2,Re(),se&&Math.abs(se.getValue("waterDepth")-K)>1e-6&&se.setValue("waterDepth",K,!1)}function Lt(){f.u_dynamicHeight.value=b.texture,f.u_dynamicTexel.value.set(1/b.width,1/b.height),f.u_dynamicCellSize.value.set(b.cellX,b.cellZ),f.u_localWaveSeconds.value=Ce}function ht(){b.texture.dispose(),b=new gt({resolution:He,basinHalfSize:v}),Lt(),we()}function we(){f.u_waveHeight.value=y.waveHeight,f.u_windSpeed.value=y.windSpeed,f.u_windDir.value=y.windDir,b.setParameters({viscosity:De,waveHeight:y.waveHeight,windSpeed:y.windSpeed})}function Si(e,t,i){const n=s.clamp(e/1.35,0,1),o=s.clamp(t/8.8,0,1),a=s.clamp(n*.62+o*.38,0,1);if(a<=.015)return;const r=v.x-.8,c=v.y-.8,l=new Me(Math.cos(i),Math.sin(i)).normalize(),p=new Me(-l.y,l.x),d=Math.abs(l.x)*r+Math.abs(l.y)*c,m=Math.abs(p.x)*r+Math.abs(p.y)*c,x=Math.round(s.lerp(5,10,a)),_=Math.round(s.lerp(2,4,a)),S=s.lerp(.6,1.35,a),D=s.lerp(.16,.58,a),h=d*.72;for(let g=0;g<_;g++){const P=1-(_===1?0:g/(_-1))*.3,L=-h+g*S*1.6;for(let R=0;R<x;R++){const N=x===1?.5:R/(x-1),$=s.lerp(-m*.94,m*.94,N),Te=(Math.sin((R+1)*1.91+g*2.37)*.5+.5)*S*.18,Ge=s.clamp(l.x*L+p.x*$+l.x*Te,-r,r),Xt=s.clamp(l.y*L+p.y*$+l.y*Te,-c,c);b.addImpact(Ge,Xt,D*P,S)}}}function At(e={}){const t=e.waveHeight??F.waveHeight,i=e.windSpeed??F.windSpeed,n=e.windDir??F.windDir,o=s.clamp(t/1.35*.6+i/8.8*.4,0,1);y.waveHeight=t,y.windSpeed=i,y.windDir=n,y.waveHalfLife=s.lerp(2.8,8.6,o),y.windHalfLife=s.lerp(2.2,6.6,o),we(),e.seedSolver!==!1&&Si(t,i,n)}function Mi(e){const t=Math.exp(-Math.LN2*e/Math.max(y.waveHalfLife,.001)),i=Math.exp(-Math.LN2*e/Math.max(y.windHalfLife,.001));y.waveHeight=E.waveHeight+(y.waveHeight-E.waveHeight)*t,y.windSpeed=E.windSpeed+(y.windSpeed-E.windSpeed)*i,Math.abs(y.waveHeight-E.waveHeight)<2e-4&&(y.waveHeight=E.waveHeight),Math.abs(y.windSpeed-E.windSpeed)<5e-4&&(y.windSpeed=E.windSpeed),we()}function _i(){te.setHSL(u.waterHue,Y(u.waterSaturation),Y(u.waterLightness+.16)),Pe.setHSL(u.waterHue,Y(u.waterSaturation*.96),Y(u.waterLightness*.34+.02)),pt.setHSL((u.waterHue+.03)%1,Y(u.waterSaturation*.82),Y(u.waterLightness*.56+.05)),je.setHSL(u.waterHue,Y(u.waterSaturation*.12),.95),ke.setHSL(u.sunHue,Y(u.sunSaturation),.72).multiplyScalar(u.sunIntensity),dt.copy(ke).lerp(new X(10214655),.55),ve(te,Mt),ve(Pe,_t),ve(pt,bt),ve(je,Ht),ve(ke,Qe),ue.color.copy(ke),at.color.copy(dt),Ne.color.copy(Pe).multiplyScalar(.72).lerp(new X(857116),.42),Ne.emissive.copy(te).multiplyScalar(.08),zt.emissive.copy(Pe).multiplyScalar(.16),Rt.emissive.copy(te).multiplyScalar(.14),f.u_foamAmount.value=u.foamAmount,f.u_reflectionMix.value=u.reflectionMix,V.toneMappingExposure=u.exposure,Dt=u.impactGain,De=u.viscosity,f.u_viscosity.value=De,oe=u.wallReflectivity,f.u_wallReflectivity.value=oe,we()}function Tt(e,t){if(e==="waveHeight"&&(F.waveHeight=t),e==="windSpeed"&&(F.windSpeed=t),e==="windDir"&&(F.windDir=t,y.windDir=t),e==="impactHistoryCount"&&(Ke=Math.round(t)),e==="localWaveSeconds"&&(Ce=t,f.u_localWaveSeconds.value=t),e==="waterDepth"){xt=t,ye(),ge&&ie();return}if(e==="tankScale"){if(Math.abs(k-t)<1e-6)return;k=t,ye(),ht(),ge&&ie();return}if(e==="tankDepthScale"){if(Math.abs(be-t)<1e-6)return;be=t,ye(),ge&&ie();return}if(e==="glassThickness"){if(Math.abs(H-t)<1e-6)return;H=t,ye();return}if(e==="gridResolution"){const i=Math.round(t);He!==i&&(He=i,ht(),ge&&ie());return}if(e==="dropSize"&&(he.size=t),e==="dropMass"&&(he.mass=t),e==="rainRate"&&(C.rate=t),e==="rainStrength"&&(C.intensity=t),e==="sunAngle"&&Le.set(.5,t,-.8).normalize(),e==="viscosity"&&(f.u_viscosity.value=t),e==="wallReflectivity"&&(f.u_wallReflectivity.value=t),e in u&&(u[e]=t,_i()),e==="waveHeight"||e==="windSpeed"||e==="windDir"){At({waveHeight:F.waveHeight,windSpeed:F.windSpeed,windDir:F.windDir,seedSolver:!1});return}we()}const w={surface:{section:"Surface",sectionOrder:1},tank:{section:"Tank",sectionOrder:2},impacts:{section:"Impacts & Rain",sectionOrder:3},water:{section:"Water Look",sectionOrder:4},light:{section:"Light",sectionOrder:5}};se=new ti({waveHeight:{...w.surface,order:1,label:"Wave Height",min:0,max:2.4,step:.02,value:.02,description:"基礎波の高さです。大きくすると常時うねりが強くなり、静かな水面よりも荒れた海面の表情になります。"},windSpeed:{...w.surface,order:2,label:"Wind Speed",min:.05,max:14,step:.05,value:.35,description:"風で駆動される波の速さと細かさです。上げるほど水面の動きが忙しくなり、落下インパクトが背景の波に埋もれやすくなります。"},windDir:{...w.surface,order:3,label:"Wind Dir",min:0,max:Math.PI*2,step:.05,value:.18,description:"基礎波が流れる向きです。波筋の方向が変わるので、ハイライトや波頭の見え方も変化します。"},localWaveSeconds:{...w.surface,order:4,label:"Local Seconds",min:4,max:120,step:1,value:Ce,description:"着水点のまわりで解析的に残す局所波の秒数です。長くすると余韻が続きますが、履歴参照の負荷も増えます。"},impactHistoryCount:{...w.surface,order:5,label:"History Count",min:8,max:128,step:1,value:Ke,description:"水面計算で参照する impact 履歴の件数です。増やすほど連続着水の影響が残りますが、CPU の計算量も増えます。"},sunAngle:{...w.light,order:1,label:"Sun Angle",min:-.2,max:1.1,step:.01,value:.74,description:"太陽の高さです。低くすると横からの光になり、反射と陰影が強くなって波の凹凸が目立ちます。"},viscosity:{...w.surface,order:6,label:"Viscosity",min:.05,max:1.8,step:.01,value:u.viscosity,description:"擬似粘度です。高いほど着水後の波紋が早く減衰して広がりも遅くなり、低いほど軽い液体のように長く広がります。"},wallReflectivity:{...w.tank,order:4,label:"Wall Reflect",min:0,max:1.2,step:.01,value:u.wallReflectivity,description:"壁面での反射の強さです。高いほど波が槽の端で返ってきて往復し、低いほど壁で吸収されて静かに減衰します。"},tankScale:{...w.tank,order:1,label:"Tank Width",min:.6,max:1.8,step:.05,value:k,description:"水槽の広さです。大きいほど波が長く伝わり、小さいほど壁反射が早く返ります。変更時はシミュレーションを再初期化します。"},tankDepthScale:{...w.tank,order:2,label:"Tank Depth",min:.6,max:1.8,step:.05,value:be,description:"水槽の深さです。深くすると底までの距離が伸び、浅くすると底面の存在感が強くなります。変更時はシミュレーションを再初期化します。"},waterDepth:{...w.tank,order:3,label:"Water Depth",min:.08,max:2.2,step:.01,value:K,description:"実際に水を張る深さです。水槽の深さとは独立に調整でき、槽より深くした場合は槽の深さまでに制限されます。"},glassThickness:{...w.tank,order:4,label:"Glass Thick",min:.01,max:.12,step:.005,value:H,description:"ガラス壁の厚みです。水槽の広さとは独立に調整でき、値はそのままメートル相当で扱っています。"},gridResolution:{...w.tank,order:5,label:"Grid Res",min:64,max:256,step:16,value:He,description:"水面 solver のグリッド解像度です。高いほど細かい波を保持できますが、負荷が上がり、変更時にシミュレーションを再初期化します。"},dropSize:{...w.impacts,order:1,label:"Drop Size",min:.4,max:1.2,step:.01,value:he.size,description:"落下物の見た目サイズです。大きいほど接水面が広がり、波の立ち上がりも広く見えます。"},dropMass:{...w.impacts,order:2,label:"Drop Mass",min:.35,max:1.4,step:.01,value:he.mass,description:"落下物の質量スケールです。重いほど同じサイズでも強い impact を与えます。"},rainRate:{...w.impacts,order:4,label:"Rain Rate",min:1,max:40,step:1,value:C.rate,description:"雨モードで 1 秒あたりに落とす雨粒の数です。高いほど水面へ連続的な刺激が入ります。"},rainStrength:{...w.impacts,order:5,label:"Rain Power",min:.08,max:.5,step:.01,value:C.intensity,description:"雨粒 1 粒ごとの強さです。上げるほど小さな波紋ではなく、はっきりした連続波になります。"},waterHue:{...w.water,order:1,label:"Water Hue",min:0,max:1,step:.01,value:u.waterHue,description:"水の色相です。透過色と反射色の基調が変わり、海水、湖水、着色液体のような印象を作れます。"},waterSaturation:{...w.water,order:2,label:"Water Sat",min:0,max:1,step:.01,value:u.waterSaturation,description:"水の彩度です。高いほど色味が濃くなり、低いほど透明感のある無彩色寄りの表現になります。"},waterLightness:{...w.water,order:3,label:"Water Light",min:.05,max:.55,step:.01,value:u.waterLightness,description:"水の明るさです。上げると浅瀬や透過光が強く見え、下げると深く重い液体の印象になります。"},sunHue:{...w.light,order:2,label:"Sun Hue",min:0,max:1,step:.01,value:u.sunHue,description:"太陽光の色相です。暖色に寄せると夕景、寒色に寄せると曇天や月光寄りの雰囲気になります。"},sunSaturation:{...w.light,order:3,label:"Sun Sat",min:0,max:1,step:.01,value:u.sunSaturation,description:"太陽光の色味の強さです。上げるほどハイライトに色が乗り、下げると白色光に近づきます。"},sunIntensity:{...w.light,order:4,label:"Sun Intensity",min:.3,max:2,step:.01,value:u.sunIntensity,description:"太陽光の強度です。上げると鏡面反射と水面のきらめきが強くなり、下げると柔らかい照明になります。"},foamAmount:{...w.water,order:4,label:"Foam Amount",min:0,max:1.5,step:.01,value:u.foamAmount,description:"白波の出やすさです。高いほど勾配の強い場所に泡の縁取りが出て、荒れた表情になります。"},reflectionMix:{...w.water,order:5,label:"Reflection",min:.3,max:1.3,step:.01,value:u.reflectionMix,description:"空の映り込みの強さです。上げると鏡面寄り、下げると水の内部色が見えやすくなります。"},impactGain:{...w.impacts,order:3,label:"Impact Gain",min:.2,max:2.5,step:.01,value:u.impactGain,description:"落下物が作る波紋の初期振幅です。大きいほど着水時の反応が強く、スプラッシュも目立ちます。"},exposure:{...w.light,order:5,label:"Exposure",min:.6,max:1.8,step:.01,value:u.exposure,description:"全体露出です。高いほど水面と空の明部が持ち上がり、低いほどコントラストの強い引き締まった画になります。"}},Tt,{title:"Ocean Tuning",accent:"#7ee0ff",helpText:"各スライダーにカーソルを合わせると、その値がシミュレーションの見た目や挙動に与える影響を日本語で表示します。"});Object.entries(se.values).forEach(([e,t])=>Tt(e,t));const Gt={nagi:{label:"Nagi",waveHeight:.02,windSpeed:.35,windDir:.18,sunAngle:.74,waterHue:.53,waterSaturation:.64,waterLightness:.28,sunHue:.12,sunSaturation:.18,sunIntensity:1.05,foamAmount:.16,reflectionMix:1.08,impactGain:1,viscosity:.35,wallReflectivity:.92,exposure:1.22,idleOrbit:8e-5},glass:{label:"Glass",waveHeight:.16,windSpeed:1.1,windDir:.22,sunAngle:.66,waterHue:.54,waterSaturation:.42,waterLightness:.35,sunHue:.11,sunSaturation:.12,sunIntensity:1.12,foamAmount:.12,reflectionMix:1.2,impactGain:.9,viscosity:.28,wallReflectivity:.84,exposure:1.28,idleOrbit:18e-5},swell:{label:"Swell",waveHeight:.55,windSpeed:4.2,windDir:.32,sunAngle:.4,waterHue:.55,waterSaturation:.7,waterLightness:.24,sunHue:.12,sunSaturation:.36,sunIntensity:1.2,foamAmount:.72,reflectionMix:.98,impactGain:1.08,viscosity:.42,wallReflectivity:.68,exposure:1.18,idleOrbit:32e-5},storm:{label:"Storm",waveHeight:1.35,windSpeed:8.8,windDir:.5,sunAngle:.15,waterHue:.59,waterSaturation:.52,waterLightness:.18,sunHue:.58,sunSaturation:.22,sunIntensity:1.18,foamAmount:1.18,reflectionMix:.88,impactGain:1.3,viscosity:.2,wallReflectivity:.58,exposure:.96,idleOrbit:55e-5},sunset:{label:"Sunset",waveHeight:.7,windSpeed:3,windDir:5.9,sunAngle:.22,waterHue:.57,waterSaturation:.62,waterLightness:.23,sunHue:.07,sunSaturation:.66,sunIntensity:1.26,foamAmount:.48,reflectionMix:1.04,impactGain:1.12,viscosity:.5,wallReflectivity:.78,exposure:1.08,idleOrbit:26e-5}};let Pt=Gt.nagi.idleOrbit,Ae=!1,We={x:0,y:0};ye();Lt();Re();function j(e,t={}){const i=Gt[e];i&&(Object.entries(i).forEach(([n,o])=>{n==="label"||n==="idleOrbit"||se.setValue(n,o,!0)}),Pt=i.idleOrbit,At({waveHeight:i.waveHeight,windSpeed:i.windSpeed,windDir:i.windDir,seedSolver:t.seedSolver!==!1}),document.querySelectorAll("[data-preset]").forEach(n=>{n.classList.toggle("active",n.dataset.preset===e)}))}j("nagi",{seedSolver:!1});I.addEventListener("contextmenu",e=>e.preventDefault());I.addEventListener("pointerdown",e=>{e.pointerType==="mouse"&&e.button!==0&&e.button!==2||(I.setPointerCapture(e.pointerId),Ae=!0,We={x:e.clientX,y:e.clientY})});function kt(e){e?.pointerId!==void 0&&I.hasPointerCapture(e.pointerId)&&I.releasePointerCapture(e.pointerId),Ae=!1}I.addEventListener("pointerup",kt);I.addEventListener("pointercancel",kt);I.addEventListener("pointerleave",()=>{Ae=!1});I.addEventListener("pointermove",e=>{Ae&&(A.theta-=(e.clientX-We.x)*.005,A.phi=s.clamp(A.phi+(e.clientY-We.y)*.005,.2,1.42),We={x:e.clientX,y:e.clientY},Re())});I.addEventListener("wheel",e=>{e.preventDefault(),A.radius=s.clamp(A.radius+e.deltaY*.05,3.5,40),Re()},{passive:!1});window.addEventListener("resize",()=>{U.aspect=window.innerWidth/window.innerHeight,U.updateProjectionMatrix(),V.setSize(window.innerWidth,window.innerHeight)});document.querySelectorAll("[data-preset]").forEach(e=>{e.addEventListener("click",()=>j(e.dataset.preset))});const bi={droplet:{makeGeometry:e=>new Ee(.13*e,16,16),makeMaterial:e=>new Ue({color:te.clone().lerp(new X(16777215),.42),roughness:.08,metalness:0,transmission:.78,transparent:!0,opacity:.92,thickness:.85+e*.4,clearcoat:1,clearcoatRoughness:.06}),spawnY:4.45,impactStrength:.24,opacity:.92,reboundScale:.86,fadeRate:.5,spinScale:.9},sphere:{makeGeometry:e=>new Ee(.34*e,26,26),makeMaterial:()=>new _e({color:12832477,roughness:.18,metalness:.86,transparent:!0,opacity:.96}),spawnY:4.95,impactStrength:.4,opacity:.96,reboundScale:.78,fadeRate:.42,spinScale:1},crate:{makeGeometry:e=>new ze(.56*e,.56*e,.56*e),makeMaterial:()=>new _e({color:8016181,roughness:.76,metalness:.08,transparent:!0,opacity:.96}),spawnY:5.05,impactStrength:.48,opacity:.96,reboundScale:.72,fadeRate:.4,spinScale:1.08}},re=[],le=[],ce=[],pe=[],de=[];function Hi(e,t={}){const i=bi[e];if(!i)return null;const n=(t.sizeScale??1)*he.size,o=(t.massScale??1)*he.mass;return{mesh:new W(i.makeGeometry(n),i.makeMaterial(n)),spawnY:t.spawnY??i.spawnY+n*.45,opacity:t.opacity??i.opacity,impactStrength:i.impactStrength*Math.max(.16,o)*Math.pow(n,1.08),reboundScale:t.reboundScale??i.reboundScale,fadeRate:t.fadeRate??i.fadeRate,spinScale:t.spinScale??i.spinScale,impactOptions:t.impactOptions??{}}}function Di(e,t,i){const n=f.u_windDir.value,o=Math.max(f.u_windSpeed.value,.5),a=f.u_waveHeight.value,r=Math.cos(n),c=Math.sin(n),l=Math.cos(n+.55),p=Math.sin(n+.55),d=Math.cos(n-.75),m=Math.sin(n-.75),x=Math.cos(n+1.25),_=Math.sin(n+1.25),S=.22/o,D=.46/o,h=.78/o,g=1.12/o,G=(e*r+t*c)*S*14-i*1.1,P=(e*l+t*p)*D*11-i*1.5,L=(e*d+t*m)*h*8-i*1.8,R=(e*x+t*_)*g*6-i*2.4;return Math.sin(G)*a*.85+Math.sin(P)*a*.35+Math.sin(L)*a*.18+Math.sin(R)*a*.1}function B(e,t,i,n,o,a,r,c,l,p,d){const m=e-i,x=t-n,_=Math.max(Math.hypot(m,x),1e-4),S=_*a-d*r,D=Math.exp(-_*c)*Math.exp(-d*l)*s.smoothstep(d,0,p);return o*D*Math.sin(S)}function zi(e,t,i){let n=0;const o=s.clamp((De-.05)/1.75,0,1),a=s.lerp(10.4,6.2,o),r=s.lerp(7.4,5.8,o*.9),c=s.lerp(.24,.54,o),l=s.lerp(.026,.075,o),p=s.lerp(.06,.14,o),d=oe*.78,m=oe*oe*.62,x=Ce,_=Math.max(1,Math.min(ae,Math.round(Ke)));for(let S=0;S<_;S++){const D=(xe-1-S+ae)%ae,h=et[D],g=i-h.z;if(g<=0||g>=x||h.w<=.001)continue;const G=-2*v.x-h.x,P=2*v.x-h.x,L=-2*v.y-h.y,R=2*v.y-h.y;n+=B(e,t,h.x,h.y,h.w,r,a,c,l,p,g),n+=B(e,t,G,h.y,h.w*d,r,a,c,l,p,g),n+=B(e,t,P,h.y,h.w*d,r,a,c,l,p,g),n+=B(e,t,h.x,L,h.w*d,r,a,c,l,p,g),n+=B(e,t,h.x,R,h.w*d,r,a,c,l,p,g),n+=B(e,t,G,L,h.w*m,r,a,c,l,p,g),n+=B(e,t,G,R,h.w*m,r,a,c,l,p,g),n+=B(e,t,P,L,h.w*m,r,a,c,l,p,g),n+=B(e,t,P,R,h.w*m,r,a,c,l,p,g)}return n}function nt(e,t,i){return ee+Di(e,t,i)+b.sampleHeightAt(e,t)*f.u_dynamicGain.value+zi(e,t,i)}function Ri(e,t,i,n=1){const o=new ai({color:je,transparent:!0,opacity:.54,depthWrite:!1,blending:si,side:ni}),a=.14*n,r=a+.04*(.75+n*.25),c=new W(new oi(a,r,48),o);c.rotation.x=-Math.PI/2,c.position.set(e,i+.02,t),Be.add(c),le.push({mesh:c,age:0,expansion:4.4*(.8+n*.28),fade:.62*(.82+n*.18)})}function st(e=.82){return new Ue({color:te.clone().lerp(new X(16777215),.5),roughness:.08,metalness:0,transmission:.76,transparent:!0,opacity:e,thickness:.8,clearcoat:1,clearcoatRoughness:.05,depthWrite:!1})}function Ci(e,t,i,n,o=0){const a=s.clamp(n/.8,.18,1.28),r=Math.max(.34,1-o*.26),c=s.lerp(.26,.82,a)*r,l=s.lerp(.18,.76,a)*r,p=new vt(c*.7,c*1.12,l,48,4,!0),d=new W(p,st(.22+a*.08));d.position.set(e,i+l*.36,t),d.renderOrder=3,d.rotation.y=Math.random()*Math.PI*2,Ze.add(d),ce.push({mesh:d,age:0,lifetime:s.lerp(.24,.56,a)*(1+o*.08),baseHeight:l,radialSpeed:s.lerp(1.2,3.2,a)*r,verticalLift:s.lerp(.18,.6,a)*r,wobble:s.lerp(.12,.36,a)})}function Li(e,t,i,n,o=0){const a=s.clamp(n/.8,.25,1.3),r=Math.max(.38,1-o*.24),c=s.lerp(.22,.58,a),l=s.lerp(.2,.78,a),p=new W(new vt(c*.42*r,c*r,l*r,28,1,!0),st(.46*r+.08));p.position.set(e,i+l*.46*r,t),p.renderOrder=3,Ve.add(p),de.push({mesh:p,age:0,lifetime:s.lerp(.34,.72,a)*r,baseRadius:c*r,baseHeight:l*r,lift:s.lerp(.42,.76,a)*r})}function Ai(e,t){const i=Math.random(),n=Math.max(.4,1-t*.22);return i<.68?{radius:s.lerp(.012,.03,Math.pow(Math.random(),.6))*n,radialMultiplier:s.lerp(1,1.65,Math.random()),liftMultiplier:s.lerp(.9,1.35,Math.random()),drag:s.lerp(1.35,1.8,Math.random()),gravityScale:s.lerp(.72,.9,Math.random()),impactScale:s.lerp(.45,.82,Math.random()),chainBudget:t<1?1:0}:i<.93?{radius:s.lerp(.03,.058,Math.pow(Math.random(),.82))*n,radialMultiplier:s.lerp(.8,1.25,Math.random()),liftMultiplier:s.lerp(.72,1,Math.random()),drag:s.lerp(.85,1.15,Math.random()),gravityScale:s.lerp(.9,1.05,Math.random()),impactScale:s.lerp(.8,1.05,Math.random()),chainBudget:t<2?1:0}:{radius:s.lerp(.058,.11,Math.random())*n,radialMultiplier:s.lerp(.56,.9,Math.random()),liftMultiplier:s.lerp(.58,.84,Math.random()),drag:s.lerp(.5,.8,Math.random()),gravityScale:s.lerp(1,1.18,Math.random()),impactScale:s.lerp(1,1.25,Math.random()),chainBudget:t<2?2:0}}function Ti(e,t,i,n,o=0){const a=s.clamp(n/.8,.22,1.3),r=Math.max(.42,1-o*.26),c=Math.round(s.lerp(10,26,a)*r);for(let l=0;l<c;l++){const p=Ai(a,o),d=p.radius,m=new W(new Ee(d,12,12),st(s.lerp(.68,.92,s.clamp(d/.11,0,1)))),x=Math.random()*Math.PI*2,_=s.lerp(.8,3.1,Math.random())*a*r*p.radialMultiplier,S=(s.lerp(1.8,5.4,Math.random())*a+.4)*r*p.liftMultiplier,D=Math.random()<.25?1.45:1;m.position.set(e+Math.cos(x)*d*.45,i+.04+Math.random()*.08,t+Math.sin(x)*d*.45),m.renderOrder=4,Ye.add(m),pe.push({mesh:m,radius:d,age:0,lifetime:s.lerp(.55,1.15,Math.random())*s.lerp(.78,1.15,d/.11),velocity:new Z(Math.cos(x)*_,S*D,Math.sin(x)*_),gravityScale:p.gravityScale,drag:p.drag,remainingReentries:p.chainBudget,generation:o,secondaryStrength:n*s.lerp(.05,.12,Math.random())*p.impactScale})}}function It(e,t,i,n,o={}){const a=nt(e,t,i),r=o.visualScale??1,c=o.generation??0,l=n*Dt,p=l*.34,d=s.lerp(.48,1.2,s.clamp(l/.95,0,1))*s.clamp(.8+r*.28,.65,1.18);et[xe].set(e,t,i,l),xe=(xe+1)%ae,Je[Ie].set(e,t,i,p),Ie=(Ie+1)%yt,b.addImpact(e,t,l*1.92,d),o.surfaceRing===!0&&Ri(e,t,a,r),o.spray!==!1&&(Ci(e,t,a,l*r,c),Li(e,t,a,l*r,c),Ti(e,t,a,l*r,c))}function O(e){e.geometry.dispose(),e.material.dispose()}function ie(){for(;re.length;){const e=re.pop();Xe.remove(e.mesh),O(e.mesh)}for(;le.length;){const e=le.pop();Be.remove(e.mesh),O(e.mesh)}for(;ce.length;){const e=ce.pop();Ze.remove(e.mesh),O(e.mesh)}for(;pe.length;){const e=pe.pop();Ye.remove(e.mesh),O(e.mesh)}for(;de.length;){const e=de.pop();Ve.remove(e.mesh),O(e.mesh)}Je.forEach(e=>e.set(0,0,-100,0)),et.forEach(e=>e.set(0,0,-100,0)),Ie=0,xe=0,Et(!1),b.reset(),y.waveHeight=E.waveHeight,y.windSpeed=E.windSpeed,y.windDir=F.windDir,we()}function Gi(e=Ct()){return{x:s.randFloat(-v.x+e,v.x-e),z:s.randFloat(-v.y+e,v.y-e)}}function Se(e,t={}){const i=Hi(e,t);if(!i)return;const n=t.position??Gi(t.edgeInset);i.mesh.position.set(n.x,i.spawnY,n.z),i.mesh.rotation.set(Math.random()*Math.PI*i.spinScale,Math.random()*Math.PI*i.spinScale,Math.random()*Math.PI*i.spinScale),Xe.add(i.mesh),re.push({mesh:i.mesh,velocityY:0,spin:new Z(s.randFloat(.4,1.1)*i.spinScale,s.randFloat(.5,1.4)*i.spinScale,s.randFloat(.3,1)*i.spinScale),impacted:!1,opacity:i.opacity,impactStrength:i.impactStrength,reboundScale:i.reboundScale,fadeRate:i.fadeRate,impactOptions:i.impactOptions})}const qe=document.querySelector('[data-drop="rain"]');function Wt(){qe&&(qe.textContent=C.enabled?"Rain Stop":"Rain Start",qe.classList.toggle("active",C.enabled))}function Et(e){C.enabled=e,C.accumulator=0,Wt()}function Ft(){Et(!C.enabled)}function Pi(){const e=s.clamp((C.intensity-.08)/.42,0,1);Se("droplet",{sizeScale:s.lerp(.4,.72,e),massScale:s.lerp(.35,.78,e),spawnY:s.lerp(5.2,6.4,e),edgeInset:Math.max(.24,Ct()*.45),fadeRate:.88,reboundScale:.18,spinScale:.45,impactOptions:{spray:!1,surfaceRing:!1,visualScale:s.lerp(.22,.42,e)}})}function ki(e){if(!C.enabled)return;C.accumulator+=e*C.rate;let t=0;for(;C.accumulator>=1&&t<10;)C.accumulator-=1,Pi(),t+=1}Wt();ge=!0;document.querySelectorAll("[data-drop]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.drop;if(t==="clear"){ie();return}if(t==="rain"){Ft();return}Se(t)})});window.addEventListener("keydown",e=>{e.key==="1"&&j("nagi"),e.key==="2"&&j("glass"),e.key==="3"&&j("swell"),e.key==="4"&&j("storm"),e.key==="5"&&j("sunset"),(e.key==="q"||e.key==="Q")&&Se("droplet"),(e.key==="w"||e.key==="W")&&Se("sphere"),(e.key==="e"||e.key==="E")&&Se("crate"),(e.key==="t"||e.key==="T")&&Ft(),(e.key==="r"||e.key==="R")&&ie()});function Ii(e,t){for(let i=re.length-1;i>=0;i--){const n=re[i];if(n.mesh.rotation.x+=n.spin.x*t,n.mesh.rotation.y+=n.spin.y*t,n.mesh.rotation.z+=n.spin.z*t,!n.impacted){n.velocityY-=9.8*t,n.mesh.position.y+=n.velocityY*t;const o=nt(n.mesh.position.x,n.mesh.position.z,e);n.mesh.position.y<=o+.04&&(n.impacted=!0,It(n.mesh.position.x,n.mesh.position.z,e,n.impactStrength,n.impactOptions),n.mesh.position.y=o-.02,n.velocityY=(-.38-n.impactStrength*.68)*n.reboundScale);continue}n.mesh.position.y+=n.velocityY*t,n.velocityY-=1.2*t,n.opacity=Math.max(0,n.opacity-t*n.fadeRate),n.mesh.material.opacity=n.opacity,(n.opacity<=.02||n.mesh.position.y<-ne-1.4)&&(Xe.remove(n.mesh),O(n.mesh),re.splice(i,1))}}function Wi(e){for(let t=le.length-1;t>=0;t--){const i=le[t];i.age+=e;const n=1+i.age*i.expansion;i.mesh.scale.set(n,n,n),i.mesh.material.opacity=Math.max(0,.54-i.age*i.fade),i.mesh.material.opacity<=.01&&(Be.remove(i.mesh),O(i.mesh),le.splice(t,1))}}function Ei(e){for(let t=ce.length-1;t>=0;t--){const i=ce[t];i.age+=e;const n=i.age/i.lifetime,o=1+n*(2.2+i.radialSpeed*.35),a=1-n*.42;i.mesh.scale.set(o,Math.max(.1,a),o),i.mesh.position.y+=e*(i.verticalLift-n*1.25),i.mesh.rotation.y+=e*(.45+i.wobble),i.mesh.material.opacity=Math.max(0,(.28+i.wobble*.08)*(1-n*1.18)),(n>=1||i.mesh.material.opacity<=.01)&&(Ze.remove(i.mesh),O(i.mesh),ce.splice(t,1))}}function Fi(e){for(let t=de.length-1;t>=0;t--){const i=de[t];i.age+=e;const n=i.age/i.lifetime,o=1+n*2.9,a=1+n*.45;i.mesh.scale.set(o,a,o),i.mesh.position.y+=e*(i.lift-n*.9),i.mesh.material.opacity=Math.max(0,.46*(1-n*1.08)),(n>=1||i.mesh.material.opacity<=.01)&&(Ve.remove(i.mesh),O(i.mesh),de.splice(t,1))}}function Oi(e,t){const i=v.x-.06,n=v.y-.06;for(let o=pe.length-1;o>=0;o--){const a=pe[o];a.age+=t,a.velocity.x*=Math.max(0,1-t*a.drag),a.velocity.z*=Math.max(0,1-t*a.drag),a.velocity.y-=9.8*t*a.gravityScale,a.velocity.y*=1-t*.12,a.mesh.position.x+=a.velocity.x*t,a.mesh.position.y+=a.velocity.y*t,a.mesh.position.z+=a.velocity.z*t,(a.mesh.position.x<-i||a.mesh.position.x>i)&&(a.mesh.position.x=s.clamp(a.mesh.position.x,-i,i),a.velocity.x*=-.24),(a.mesh.position.z<-n||a.mesh.position.z>n)&&(a.mesh.position.z=s.clamp(a.mesh.position.z,-n,n),a.velocity.z*=-.24);const r=1-a.age/a.lifetime;if(a.mesh.material.opacity=Math.max(0,.84*r),a.remainingReentries>0&&a.velocity.y<0){const c=nt(a.mesh.position.x,a.mesh.position.z,e);if(a.mesh.position.y<=c+a.radius*.35){const l=a.generation+1,p=a.secondaryStrength>.06&&l<=2,d=s.clamp(.32+a.radius*7.5,.28,.82);It(a.mesh.position.x,a.mesh.position.z,e,a.secondaryStrength,{spray:p,surfaceRing:!1,visualScale:d,generation:l}),a.remainingReentries-=1,a.secondaryStrength*=.42,a.mesh.position.y=c+a.radius*.4,a.velocity.y=Math.abs(a.velocity.y)*.14,a.velocity.x*=.32,a.velocity.z*=.32}}(a.remainingReentries<=0||r<=0||a.mesh.position.y<-ne-.8)&&(Ye.remove(a.mesh),O(a.mesh),pe.splice(o,1))}}const ut=new ii;function Ot(){requestAnimationFrame(Ot);const e=Math.min(ut.getDelta(),.033),t=ut.elapsedTime;Ae||(A.theta+=Pt,Re()),Mi(e),f.u_time.value=t,f.u_cameraPos.value.copy(U.position),ue.position.copy(Le).multiplyScalar(18),ue.target.position.copy(Q),ki(e),Ii(t,e),Wi(e),Ei(e),Fi(e),Oi(t,e),b.step(e),V.render(T,U),xi.update()}Ot();
