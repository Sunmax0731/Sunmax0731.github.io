import"./site-shell-BrTbeRto.js";import{W as Ie,A as Le,w as Ue,J as ze,L as fe,C as pe,S as Oe,n as E,x as We,P as Ve,b as He,m as Xe,H as Ge,k as Ne,l as he,e as y,y as qe,f as J,h as je,g as K,B as z,a as me,V as ee,z as Ye,G as $e,r as te,q as N,N as Qe,s as ve,T as Ze,o as Je,E as Ke,M as D}from"./controls-CKQNPmPc.js";class et{constructor(e,n,i){this.gl=e,this.W=n,this.H=i,this.dt=.12,this.gravityY=-9.8,this.rhoLiquid=1e3,this.rhoGas=1,this.jacobiIter=28,this.velocityDamping=.9985,this.inkRetention=1,this._uniformTypes=new WeakMap,this._ready=!1}async init(e){const n=this.gl;if(!n.getExtension("EXT_color_buffer_float"))throw new Error("EXT_color_buffer_float is required for the ink demo.");const{vert:o,advect:r,div:s,pres:c,sub:v,render:b,splat:h}=e;this._progAdvect=this._build(o,r),this._progDiv=this._build(o,s),this._progPres=this._build(o,c),this._progSub=this._build(o,v),this._progRender=this._build(o,b),this._progSplat=this._build(o,h),this._vel=[this._makeFBO(n.NEAREST),this._makeFBO(n.NEAREST)],this._pres=[this._makeFBO(n.NEAREST),this._makeFBO(n.NEAREST)],this._vof=[this._makeFBO(n.NEAREST),this._makeFBO(n.NEAREST)],this._div=this._makeFBO(n.NEAREST),this._quadVAO=this._makeQuad(),this._rv=0,this._ready=!0,this._clearFields()}_makeFBO(e){const n=this.gl,i=n.createTexture();n.bindTexture(n.TEXTURE_2D,i),n.texImage2D(n.TEXTURE_2D,0,n.RGBA32F,this.W,this.H,0,n.RGBA,n.FLOAT,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,e),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,e),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE);const o=n.createFramebuffer();if(n.bindFramebuffer(n.FRAMEBUFFER,o),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,i,0),n.checkFramebufferStatus(n.FRAMEBUFFER)!==n.FRAMEBUFFER_COMPLETE)throw new Error("Ink framebuffer is incomplete.");return n.bindFramebuffer(n.FRAMEBUFFER,null),{fbo:o,tex:i}}_makeQuad(){const e=this.gl,n=e.createVertexArray(),i=e.createBuffer();return e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindVertexArray(null),n}_build(e,n){const i=this.gl,o=i.createShader(i.VERTEX_SHADER);if(i.shaderSource(o,e),i.compileShader(o),!i.getShaderParameter(o,i.COMPILE_STATUS))throw new Error(i.getShaderInfoLog(o)||"Vertex shader compilation failed.");const r=i.createShader(i.FRAGMENT_SHADER);if(i.shaderSource(r,n),i.compileShader(r),!i.getShaderParameter(r,i.COMPILE_STATUS))throw new Error(i.getShaderInfoLog(r)||"Fragment shader compilation failed.");const s=i.createProgram();if(i.attachShader(s,o),i.attachShader(s,r),i.bindAttribLocation(s,0,"a_position"),i.linkProgram(s),!i.getProgramParameter(s,i.LINK_STATUS))throw new Error(i.getProgramInfoLog(s)||"Program link failed.");const c=new Map,v=i.getProgramParameter(s,i.ACTIVE_UNIFORMS);for(let b=0;b<v;b++){const h=i.getActiveUniform(s,b);h&&(c.set(h.name,h.type),h.name.endsWith("[0]")&&c.set(h.name.slice(0,-3),h.type))}return this._uniformTypes.set(s,c),s}_uniform(e,n,i){const o=this.gl,r=o.getUniformLocation(e,n);if(r===null)return;const s=this._uniformTypes.get(e)?.get(n);if(Array.isArray(i)){if(s===o.INT_VEC2||s===o.BOOL_VEC2){o.uniform2i(r,i[0],i[1]);return}if(s===o.INT_VEC3||s===o.BOOL_VEC3){o.uniform3i(r,i[0],i[1],i[2]);return}if(s===o.INT_VEC4||s===o.BOOL_VEC4){o.uniform4i(r,i[0],i[1],i[2],i[3]);return}i.length===2&&o.uniform2f(r,i[0],i[1]),i.length===3&&o.uniform3f(r,i[0],i[1],i[2]),i.length===4&&o.uniform4f(r,i[0],i[1],i[2],i[3]);return}if(s===o.INT||s===o.BOOL||s===o.SAMPLER_2D){o.uniform1i(r,i);return}typeof i=="number"&&o.uniform1f(r,i)}_bindTex(e,n,i,o){const r=this.gl,s=r.getUniformLocation(e,n);s!==null&&(r.activeTexture(r.TEXTURE0+i),r.bindTexture(r.TEXTURE_2D,o),r.uniform1i(s,i))}_blit(e,n,i={}){const o=this.gl;o.bindFramebuffer(o.FRAMEBUFFER,n),o.viewport(0,0,this.W,this.H),o.useProgram(e);for(const[r,s]of Object.entries(i))this._uniform(e,r,s);o.bindVertexArray(this._quadVAO),o.drawArrays(o.TRIANGLE_STRIP,0,4),o.bindVertexArray(null),o.bindFramebuffer(o.FRAMEBUFFER,null)}_draw(e,n,i){const o=this.gl;o.bindFramebuffer(o.FRAMEBUFFER,n),o.viewport(0,0,this.W,this.H),o.useProgram(e),i(),o.bindVertexArray(this._quadVAO),o.drawArrays(o.TRIANGLE_STRIP,0,4),o.bindVertexArray(null),o.bindFramebuffer(o.FRAMEBUFFER,null)}_clearFields(){const e=this.gl,n=new Float32Array(this.W*this.H*4);this._vel.forEach(i=>{e.bindTexture(e.TEXTURE_2D,i.tex),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.W,this.H,e.RGBA,e.FLOAT,n)}),this._pres.forEach(i=>{e.bindTexture(e.TEXTURE_2D,i.tex),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.W,this.H,e.RGBA,e.FLOAT,n)}),this._vof.forEach(i=>{e.bindTexture(e.TEXTURE_2D,i.tex),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.W,this.H,e.RGBA,e.FLOAT,n)}),e.bindTexture(e.TEXTURE_2D,this._div.tex),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.W,this.H,e.RGBA,e.FLOAT,n),this._rv=0}_seedScene(e){if(!this._ready)return;const n=this.gl,i=new Float32Array(this.W*this.H*4);for(let o=0;o<this.H;o++)for(let r=0;r<this.W;r++)i[(o*this.W+r)*4]=e(r,o,this.W,this.H);this._clearFields(),this._vof.forEach(o=>{n.bindTexture(n.TEXTURE_2D,o.tex),n.texSubImage2D(n.TEXTURE_2D,0,0,0,this.W,this.H,n.RGBA,n.FLOAT,i)})}setSceneDamBreak(){this._seedScene((e,n,i,o)=>e<i*.34&&n<o*.62?1:0)}setSceneDroplet(){this._seedScene((e,n,i,o)=>{const r=n<o*.16,s=i*.54,c=o*.78,v=o*.085,b=(e-s)*(e-s)+(n-c)*(n-c)<v*v;return r||b?1:0})}setSceneBubble(){this._seedScene((e,n,i,o)=>{const r=i*.5,s=o*.16,c=o*.09;return(e-r)*(e-r)+(n-s)*(n-s)<c*c?0:1})}splat(e,n,i,o,r={}){if(!this._ready)return;this.gl;const s=this._rv,c=1-s,v=r.radius??24,b=r.velocityAmount??.3,h=r.fluidAmount??1,W=r.erase??!1;this._draw(this._progSplat,this._vel[c].fbo,()=>{this._bindTex(this._progSplat,"u_target",0,this._vel[s].tex),this._uniform(this._progSplat,"u_resolution",[this.W,this.H]),this._uniform(this._progSplat,"u_center",[e,n]),this._uniform(this._progSplat,"u_velocity",[i,o]),this._uniform(this._progSplat,"u_radius",v),this._uniform(this._progSplat,"u_amount",b),this._uniform(this._progSplat,"u_mode",0)}),this._draw(this._progSplat,this._vof[c].fbo,()=>{this._bindTex(this._progSplat,"u_target",0,this._vof[s].tex),this._uniform(this._progSplat,"u_resolution",[this.W,this.H]),this._uniform(this._progSplat,"u_center",[e,n]),this._uniform(this._progSplat,"u_velocity",[0,0]),this._uniform(this._progSplat,"u_radius",v*.9),this._uniform(this._progSplat,"u_amount",h),this._uniform(this._progSplat,"u_mode",W?2:1)}),this._rv=c}step(){if(!this._ready)return;const e=this.gl,n=this._rv,i=1-n,o=[this.W,this.H],r=1/Math.min(this.W,this.H),s=.5/r;e.useProgram(this._progAdvect),this._bindTex(this._progAdvect,"u_field",0,this._vof[n].tex),this._bindTex(this._progAdvect,"u_velocity",1,this._vel[n].tex),this._blit(this._progAdvect,this._vof[i].fbo,{u_resolution:o,u_dt:this.dt,u_dissipation:this.inkRetention}),e.useProgram(this._progAdvect),this._bindTex(this._progAdvect,"u_field",0,this._vel[n].tex),this._bindTex(this._progAdvect,"u_velocity",1,this._vel[n].tex),this._blit(this._progAdvect,this._vel[i].fbo,{u_resolution:o,u_dt:this.dt,u_dissipation:this.velocityDamping}),this._rv=i;const c=this._rv,v=1-c;e.useProgram(this._progDiv),this._bindTex(this._progDiv,"u_velocity",0,this._vel[c].tex),this._blit(this._progDiv,this._div.fbo,{u_resolution:o,u_halfRdx:s});const b=-r*r;for(let h=0;h<this.jacobiIter;h++){const W=h%2,De=1-W;e.useProgram(this._progPres),this._bindTex(this._progPres,"u_pressure",0,this._pres[W].tex),this._bindTex(this._progPres,"u_divergence",1,this._div.tex),this._blit(this._progPres,this._pres[De].fbo,{u_resolution:o,u_alpha:b,u_rBeta:.25})}e.useProgram(this._progSub),this._bindTex(this._progSub,"u_velocity",0,this._vel[c].tex),this._bindTex(this._progSub,"u_pressure",1,this._pres[this.jacobiIter%2].tex),this._bindTex(this._progSub,"u_vof",2,this._vof[c].tex),this._blit(this._progSub,this._vel[v].fbo,{u_resolution:o,u_halfRdx:s,u_dt:this.dt,u_gravityY:this.gravityY,u_rho_liquid:this.rhoLiquid,u_rho_gas:this.rhoGas}),this._rv=v}render(e,n,i){if(!this._ready)return;this.gl.useProgram(this._progRender),this._bindTex(this._progRender,"u_vof",0,this._vof[this._rv].tex),this._bindTex(this._progRender,"u_velocity",1,this._vel[this._rv].tex),this._blit(this._progRender,null,{u_resolution:[this.W,this.H],u_mode:e==="velocity"?1:0,u_time:i,u_inkColor:n.ink,u_edgeColor:n.edge,u_bgA:n.bgA,u_bgB:n.bgB})}}const tt=`#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,nt=`#version 300 es
precision highp float;

uniform sampler2D u_field;
uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform float u_dt;
uniform float u_dissipation;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 vel = texture(u_velocity, uv).rg;
  vec2 prevUV = uv - vel * u_dt / u_resolution;
  prevUV = clamp(prevUV, vec2(0.0), vec2(1.0));
  fragColor = texture(u_field, prevUV) * u_dissipation;
}
`,it=`#version 300 es
precision highp float;

uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform float u_halfRdx; // 0.5 / dx

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 inv = 1.0 / u_resolution;

  float velR = texture(u_velocity, uv + vec2(inv.x, 0.0)).r;
  float velL = texture(u_velocity, uv - vec2(inv.x, 0.0)).r;
  float velT = texture(u_velocity, uv + vec2(0.0, inv.y)).g;
  float velB = texture(u_velocity, uv - vec2(0.0, inv.y)).g;

  float div = u_halfRdx * (velR - velL + velT - velB);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}
`,ot=`#version 300 es
precision highp float;

uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_resolution;
uniform float u_alpha;   // -dx^2
uniform float u_rBeta;  // 1/4

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 inv = 1.0 / u_resolution;

  float pR = texture(u_pressure, uv + vec2(inv.x, 0.0)).r;
  float pL = texture(u_pressure, uv - vec2(inv.x, 0.0)).r;
  float pT = texture(u_pressure, uv + vec2(0.0, inv.y)).r;
  float pB = texture(u_pressure, uv - vec2(0.0, inv.y)).r;
  float bC = texture(u_divergence, uv).r;

  fragColor = vec4((pR + pL + pT + pB + u_alpha * bC) * u_rBeta, 0.0, 0.0, 1.0);
}
`,rt=`#version 300 es
precision highp float;

uniform sampler2D u_velocity;
uniform sampler2D u_pressure;
uniform sampler2D u_vof;
uniform vec2 u_resolution;
uniform float u_halfRdx;
uniform float u_dt;
uniform float u_gravityY;
uniform float u_rho_liquid;
uniform float u_rho_gas;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 inv = 1.0 / u_resolution;

  if (uv.x < inv.x || uv.x > 1.0-inv.x || uv.y < inv.y || uv.y > 1.0-inv.y) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float pR = texture(u_pressure, uv + vec2(inv.x, 0.0)).r;
  float pL = texture(u_pressure, uv - vec2(inv.x, 0.0)).r;
  float pT = texture(u_pressure, uv + vec2(0.0, inv.y)).r;
  float pB = texture(u_pressure, uv - vec2(0.0, inv.y)).r;

  vec2 vel = texture(u_velocity, uv).rg;
  float C   = texture(u_vof, uv).r;

  float rho = mix(u_rho_gas, u_rho_liquid, C);

  float gradPx = u_halfRdx * (pR - pL);
  float gradPy = u_halfRdx * (pT - pB);

  vel.x -= u_dt / rho * gradPx;
  vel.y -= u_dt / rho * gradPy;

  vel.y += u_dt * u_gravityY * C;

  if (uv.x <= 2.0*inv.x)         vel.x = max(vel.x, 0.0);
  if (uv.x >= 1.0 - 2.0*inv.x)  vel.x = min(vel.x, 0.0);
  if (uv.y <= 2.0*inv.y)         vel.y = max(vel.y, 0.0);
  if (uv.y >= 1.0 - 2.0*inv.y)  vel.y = min(vel.y, 0.0);

  fragColor = vec4(vel, 0.0, 1.0);
}
`,st=`#version 300 es
precision highp float;

uniform sampler2D u_vof;
uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform int u_mode; // 0: ink, 1: velocity
uniform float u_time;
uniform vec3 u_inkColor;
uniform vec3 u_edgeColor;
uniform vec3 u_bgA;
uniform vec3 u_bgB;

in vec2 v_uv;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.08 + vec2(4.2, 1.3);
    amplitude *= 0.5;
  }
  return value;
}

vec3 heatRamp(float t) {
  vec3 cold = vec3(0.15, 0.28, 0.74);
  vec3 mid = vec3(0.35, 0.92, 0.98);
  vec3 hot = vec3(1.0, 0.78, 0.16);
  vec3 peak = vec3(1.0, 0.98, 0.92);
  vec3 base = mix(cold, mid, smoothstep(0.0, 0.45, t));
  base = mix(base, hot, smoothstep(0.35, 0.85, t));
  return mix(base, peak, smoothstep(0.82, 1.0, t));
}

void main() {
  vec2 inv = 1.0 / u_resolution;
  float c = texture(u_vof, v_uv).r;
  vec2 velocity = texture(u_velocity, v_uv).rg;
  float speed = length(velocity) * 5.2;

  float cR = texture(u_vof, v_uv + vec2(inv.x, 0.0)).r;
  float cL = texture(u_vof, v_uv - vec2(inv.x, 0.0)).r;
  float cT = texture(u_vof, v_uv + vec2(0.0, inv.y)).r;
  float cB = texture(u_vof, v_uv - vec2(0.0, inv.y)).r;
  vec2 grad = vec2(cR - cL, cT - cB) * 0.5;
  float edge = length(grad);

  float body = smoothstep(0.02, 0.22, c);
  float rim = smoothstep(0.02, 0.22, edge);

  if (u_mode == 1) {
    vec3 flow = heatRamp(clamp(speed, 0.0, 1.0));
    vec3 color = mix(u_bgA * 0.4 + u_bgB * 0.6, flow, clamp(speed * 1.08 + rim * 0.45, 0.0, 1.0));
    color += flow * rim * 0.12;
    fragColor = vec4(color, body * 0.82);
    return;
  }

  float cellular = fbm(v_uv * 12.0 + vec2(u_time * 0.05, -u_time * 0.035));
  float veining = fbm(v_uv * 28.0 - velocity * 3.0 + vec2(u_time * 0.04, u_time * 0.025));
  float shadowNoise = fbm(v_uv * 9.0 + velocity * 0.8 - vec2(u_time * 0.02, -u_time * 0.015));

  vec3 deepColor = mix(u_bgA * 0.45, u_inkColor * 0.64, clamp(body * 0.82 + shadowNoise * 0.18, 0.0, 1.0));
  vec3 thinColor = mix(u_inkColor * 0.9, u_edgeColor, clamp(rim * 0.8 + cellular * 0.25, 0.0, 1.0));
  vec3 liquid = mix(deepColor, thinColor, clamp(0.26 + body * 0.58 + cellular * 0.16 - veining * 0.08, 0.0, 1.0));
  liquid += u_edgeColor * rim * (0.08 + speed * 0.06);
  liquid += vec3(0.98, 0.99, 1.0) * pow(clamp(edge * 8.5 + speed * 0.25, 0.0, 1.0), 3.2) * 0.08;

  float alpha = clamp(max(body, rim * 0.36), 0.0, 1.0);
  fragColor = vec4(liquid, alpha);
}
`,at=`#version 300 es
precision highp float;

uniform sampler2D u_target;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_velocity;
uniform float u_radius;
uniform float u_amount;
uniform int u_mode; // 0: velocity, 1: add fluid, 2: remove fluid

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 position = uv * u_resolution;
  vec2 delta = position - u_center;
  float strength = exp(-dot(delta, delta) / (u_radius * u_radius));
  vec4 current = texture(u_target, uv);

  if (u_mode == 0) {
    fragColor = vec4(current.rg + u_velocity * strength * u_amount, 0.0, 1.0);
    return;
  }

  float value = current.r + (u_mode == 1 ? 1.0 : -1.0) * strength * u_amount;
  fragColor = vec4(clamp(value, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`,lt=`precision highp float;
precision highp int;

uniform sampler2D u_inkMap;
uniform vec2 u_texel;
uniform float u_domainSize;
uniform float u_surfaceHeight;
uniform float u_surfaceRelief;
uniform float u_meniscus;
uniform float u_time;
uniform int u_viewMode;

out vec2 vUv;
out vec3 vWorldPos;
out vec3 vWorldNormal;
out vec4 vInk;
out float vBody;
out float vEdge;
out float vThickness;

float luminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

float sampleField(vec2 sampleUv) {
  vec4 texel = texture(u_inkMap, clamp(sampleUv, 0.0, 1.0));
  float alpha = texel.a;
  float pigment = luminance(texel.rgb);
  float body = u_viewMode == 1 ? max(alpha, pigment * 0.8) : alpha;
  return clamp(body, 0.0, 1.0);
}

float filteredField(vec2 sampleUv) {
  float center = sampleField(sampleUv) * 0.36;
  center += sampleField(sampleUv + vec2(u_texel.x, 0.0)) * 0.16;
  center += sampleField(sampleUv - vec2(u_texel.x, 0.0)) * 0.16;
  center += sampleField(sampleUv + vec2(0.0, u_texel.y)) * 0.16;
  center += sampleField(sampleUv - vec2(0.0, u_texel.y)) * 0.16;
  return center;
}

float detailWave(vec2 sampleUv, float body) {
  float waveA = sin(sampleUv.x * 21.0 + u_time * 0.58);
  float waveB = cos(sampleUv.y * 18.0 - u_time * 0.43);
  float waveC = sin((sampleUv.x + sampleUv.y) * 14.0 + u_time * 0.3);
  return (waveA * waveB + waveC * 0.55) * u_surfaceRelief * body;
}

float heightAt(vec2 sampleUv) {
  float body = smoothstep(0.01, 0.98, filteredField(sampleUv));
  float meniscusBand = smoothstep(0.03, 0.26, body) * (1.0 - smoothstep(0.42, 0.98, body));
  return body * u_surfaceHeight + meniscusBand * u_meniscus + detailWave(sampleUv, body);
}

void main() {
  vUv = uv;
  vInk = texture(u_inkMap, uv);

  float bodyCenter = smoothstep(0.01, 0.98, filteredField(uv));
  float heightCenter = heightAt(uv);
  float heightRight = heightAt(uv + vec2(u_texel.x, 0.0));
  float heightLeft = heightAt(uv - vec2(u_texel.x, 0.0));
  float heightTop = heightAt(uv + vec2(0.0, u_texel.y));
  float heightBottom = heightAt(uv - vec2(0.0, u_texel.y));

  vec3 displaced = position;
  displaced.y += heightCenter;

  vec3 tangentX = normalize(vec3(2.0 * u_texel.x * u_domainSize, heightRight - heightLeft, 0.0));
  vec3 tangentZ = normalize(vec3(0.0, heightTop - heightBottom, -2.0 * u_texel.y * u_domainSize));
  vec3 localNormal = normalize(cross(tangentZ, tangentX));

  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * localNormal);
  vBody = bodyCenter;
  vEdge = clamp(length(vec2(heightRight - heightLeft, heightTop - heightBottom)) * 10.0, 0.0, 1.0);
  vThickness = clamp(heightCenter / max(u_surfaceHeight + u_meniscus + max(u_surfaceRelief, 0.001), 0.001), 0.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`,ut=`precision highp float;
precision highp int;

uniform sampler2D u_inkMap;
uniform vec3 u_cameraPos;
uniform float u_absorption;
uniform float u_refraction;
uniform float u_fresnel;
uniform float u_specular;
uniform float u_caustics;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform vec3 u_rimColor;
uniform vec3 u_shadowColor;
uniform float u_time;
uniform int u_viewMode;

in vec2 vUv;
in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec4 vInk;
in float vBody;
in float vEdge;
in float vThickness;

out vec4 fragColor;

vec3 skyColor(vec3 direction) {
  float horizon = saturate(direction.y * 0.5 + 0.5);
  vec3 low = vec3(0.05, 0.07, 0.11);
  vec3 mid = vec3(0.14, 0.18, 0.26);
  vec3 high = vec3(0.66, 0.74, 0.9);
  vec3 base = mix(low, mid, smoothstep(0.0, 0.6, horizon));
  return mix(base, high, pow(horizon, 1.25));
}

void main() {
  float alphaMask = max(vInk.a, vBody * 0.85);
  if (alphaMask < 0.015) {
    discard;
  }

  vec3 normal = normalize(vWorldNormal);
  vec3 viewDir = normalize(u_cameraPos - vWorldPos);
  vec3 lightDir = normalize(u_lightDir);
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 halfDir = normalize(lightDir + viewDir);

  vec2 refractOffset = normal.xz * u_refraction * (0.028 + vThickness * 0.04);
  vec3 refractedInk = texture(u_inkMap, clamp(vUv + refractOffset, 0.001, 0.999)).rgb;
  vec3 pigment = max(vInk.rgb, refractedInk * 0.78);
  vec3 deepPigment = mix(u_shadowColor, pigment * 0.62 + u_shadowColor * 0.38, saturate(vThickness * 1.2 + 0.08));
  vec3 thinPigment = mix(pigment * 1.06, u_rimColor, saturate(vEdge * 0.55 + (1.0 - vThickness) * 0.4));

  float absorption = exp(-u_absorption * (0.42 + vThickness * 1.75));
  vec3 bodyColor = mix(deepPigment, thinPigment, absorption);

  float diffuse = 0.34 + 0.66 * saturate(dot(normal, lightDir));
  float specularPower = mix(28.0, 120.0, saturate(u_specular * 0.5));
  float specular = pow(saturate(dot(normal, halfDir)), specularPower) * (0.35 + u_specular * 0.9);
  float fresnel = pow(1.0 - saturate(dot(viewDir, normal)), 4.4) * u_fresnel;
  float internalPulse = 0.5 + 0.5 * sin((vUv.x * 17.0 + vUv.y * 13.0) + u_time * 0.32);

  vec3 reflection = skyColor(reflectDir);
  vec3 color = bodyColor * diffuse;
  color += reflection * (0.16 + fresnel * 0.52);
  color += u_lightColor * specular * (0.48 + vEdge * 0.3);
  color += u_rimColor * u_caustics * pow(1.0 - vThickness, 1.5) * (0.15 + vEdge * 0.38 + internalPulse * 0.05);
  color = mix(color, u_rimColor, vEdge * 0.14);

  if (u_viewMode == 1) {
    vec3 flowColor = mix(pigment, reflection, fresnel * 0.28);
    flowColor += u_lightColor * specular * 0.35;
    color = mix(flowColor, color, 0.35);
  }

  float alpha = saturate(alphaMask * 0.72 + vThickness * 0.24 + fresnel * 0.12);
  fragColor = vec4(color, alpha);
}
`;function _e(t){let e=document.getElementById("fatal-error");e||(e=document.createElement("div"),e.id="fatal-error",Object.assign(e.style,{position:"fixed",left:"16px",right:"16px",bottom:"16px",padding:"14px 16px",borderRadius:"16px",border:"1px solid rgba(255, 110, 110, 0.35)",background:"rgba(40, 8, 12, 0.9)",color:"#ffd7d7",fontFamily:"Consolas, monospace",fontSize:"12px",lineHeight:"1.5",zIndex:"10000",whiteSpace:"pre-wrap"}),document.body.appendChild(e)),e.textContent=t}window.addEventListener("error",t=>{t.message&&_e(t.message)});window.addEventListener("unhandledrejection",t=>{const e=t.reason?.message||String(t.reason||"Unknown promise rejection");_e(e)});function ct(t,e=768){const n=Math.min(window.devicePixelRatio||1,1.2),i=Math.max(t.width,t.height),o=Math.min(1,e/i)*n;return{width:Math.max(320,Math.round(t.width*o)),height:Math.max(320,Math.round(t.height*o))}}function ce(t){return new E().setRGB(t[0],t[1],t[2])}const g=document.getElementById("canvas"),dt=document.getElementById("viewport"),ft=document.getElementById("controlsMount");function ge(){const t=dt.getBoundingClientRect();return{width:Math.max(360,Math.round(t.width||window.innerWidth)),height:Math.max(420,Math.round(t.height||window.innerHeight))}}const T=new Ie({canvas:g,antialias:!0,alpha:!0});T.setPixelRatio(Math.min(window.devicePixelRatio,2));const I=ge();T.setSize(I.width,I.height,!1);T.toneMapping=Le;T.toneMappingExposure=1.08;T.outputColorSpace=Ue;const q=document.createElement("canvas"),{width:M,height:F}=ct(I);q.width=M;q.height=F;const H=q.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1});if(!H)throw new Error("WebGL2 is required for the ink demo.");const _=new et(H,M,F);await _.init({vert:tt,advect:nt,div:it,pres:ot,sub:rt,render:st,splat:at});const R=new ze(q);R.minFilter=fe;R.magFilter=fe;R.generateMipmaps=!1;R.wrapS=pe;R.wrapT=pe;const x=new Oe;x.background=new E(329227);x.fog=new We(329227,.055);const A=new Ve(48,I.width/I.height,.1,100),V=new He(0,1.45,0),m={theta:.46,phi:1.02,radius:10.4};let f=null;function ne(){A.position.set(V.x+m.radius*Math.sin(m.phi)*Math.sin(m.theta),V.y+m.radius*Math.cos(m.phi),V.z+m.radius*Math.sin(m.phi)*Math.cos(m.theta)),A.lookAt(V),f?.u_cameraPos.value.copy(A.position)}function pt(){const{width:t,height:e}=ge();A.aspect=t/e,A.updateProjectionMatrix(),T.setSize(t,e,!1)}ne();const Q=new Xe({visible:!1});let ie=26,j="sheet",X="paint",L="ink",S=0;const l={surfaceHeight:.17,surfaceRelief:.055,meniscus:.06,absorption:1.75,refraction:.22,fresnel:1.05,specular:1.15,caustics:.42},d={paintForce:.28,paintAmount:1,bubbleForce:.42,bubbleCarve:.95,ambientMotion:.14};x.add(new Ge(8162214,1119002,1.25));const k=new Ne(15134975,1.22);k.position.set(-4,7,5);x.add(k);const U=new he(8038399,1.8,18,2);U.position.set(3.5,2.8,-2.2);x.add(U);const oe=new he(6287615,1.2,14,2);oe.position.set(-2.8,1.8,3);x.add(oe);const re=new y(new qe(18,64),new J({color:855830,roughness:.96,metalness:.04}));re.rotation.x=-Math.PI/2;re.position.y=-.01;x.add(re);const w=new je;x.add(w);const ht=new J({color:1514023,roughness:.34,metalness:.46,emissive:592660,emissiveIntensity:.8}),mt=new K({color:856347,roughness:.18,metalness:.08,transmission:.18,thickness:.8,clearcoat:1,clearcoatRoughness:.12}),xe=new y(new z(6.8,.72,6.8),ht);xe.position.y=.34;w.add(xe);const be=new y(new z(6,.18,6),mt);be.position.y=.82;w.add(be);const vt=new J({color:2764613,roughness:.3,metalness:.56,emissive:790560,emissiveIntensity:.9});[{x:0,y:.99,z:2.76,sx:5.62,sy:.24,sz:.16},{x:0,y:.99,z:-2.76,sx:5.62,sy:.24,sz:.16},{x:2.76,y:.99,z:0,sx:.16,sy:.24,sz:5.62},{x:-2.76,y:.99,z:0,sx:.16,sy:.24,sz:5.62}].forEach(t=>{const e=new y(new z(t.sx,t.sy,t.sz),vt);e.position.set(t.x,t.y,t.z),w.add(e)});const p=5.32,Y=1.06,ye=new K({color:1120804,roughness:.08,metalness:.04,transmission:.58,thickness:1.25,clearcoat:1,clearcoatRoughness:.08,transparent:!0,opacity:.88,ior:1.22}),we=new y(new z(p+.18,.08,p+.18),ye);we.position.y=.99;w.add(we);const Ee=new K({color:1582132,roughness:.05,metalness:.02,transmission:.74,thickness:.82,clearcoat:1,clearcoatRoughness:.05,transparent:!0,opacity:.82,ior:1.24});[{x:0,y:1.155,z:p*.5+.06,sx:p+.1,sy:.34,sz:.08},{x:0,y:1.155,z:-2.72,sx:p+.1,sy:.34,sz:.08},{x:p*.5+.06,y:1.155,z:0,sx:.08,sy:.34,sz:p+.1},{x:-2.72,y:1.155,z:0,sx:.08,sy:.34,sz:p+.1}].forEach(t=>{const e=new y(new z(t.sx,t.sy,t.sz),Ee);e.position.set(t.x,t.y,t.z),w.add(e)});const Te=new me(p,p,180,180);Te.rotateX(-Math.PI/2);const $=new me(p,p);$.rotateX(-Math.PI/2);f={u_inkMap:{value:R},u_texel:{value:new ee(1/M,1/F)},u_domainSize:{value:p},u_cameraPos:{value:A.position.clone()},u_surfaceHeight:{value:l.surfaceHeight},u_surfaceRelief:{value:l.surfaceRelief},u_meniscus:{value:l.meniscus},u_absorption:{value:l.absorption},u_refraction:{value:l.refraction},u_fresnel:{value:l.fresnel},u_specular:{value:l.specular},u_caustics:{value:l.caustics},u_time:{value:0},u_viewMode:{value:0},u_lightDir:{value:k.position.clone().normalize()},u_lightColor:{value:k.color.clone().multiplyScalar(k.intensity)},u_rimColor:{value:new E(10282495)},u_shadowColor:{value:new E(528408)}};const _t=new Ye({name:"InkFlowSurface",uniforms:f,vertexShader:lt,fragmentShader:ut,transparent:!0,depthWrite:!1,side:te,glslVersion:$e,defines:{USE_UV:""}}),se=new y(Te,_t);se.position.y=Y;se.renderOrder=3;w.add(se);const P=new y($,new N({map:R,transparent:!0,depthWrite:!1,opacity:.22,blending:Qe,side:te,color:726820}));P.position.y=Y-.05;P.scale.setScalar(.992);P.renderOrder=1;w.add(P);const B=new y($,new N({map:R,transparent:!0,depthWrite:!1,opacity:.14,blending:ve,side:te,color:14874111}));B.position.y=Y-.075;B.scale.setScalar(.968);B.renderOrder=0;w.add(B);const G=new y($,new N({color:16777215,transparent:!0,opacity:0,depthWrite:!1}));G.position.y=Y+.015;w.add(G);const O=new y(new Ze(4.6,.03,16,80),new N({color:3163500,transparent:!0,opacity:.22,blending:ve,depthWrite:!1}));O.rotation.x=Math.PI/2;O.position.y=.42;x.add(O);const ae=[{id:"lagoon",label:"Lagoon",ink:[.1,.72,.95],edge:[.86,.97,1],bgA:[.02,.08,.14],bgB:[0,.01,.03],accent:5822463},{id:"ember",label:"Ember",ink:[.94,.42,.15],edge:[1,.87,.68],bgA:[.11,.04,.03],bgB:[.01,0,.02],accent:16747595},{id:"indigo",label:"Indigo",ink:[.47,.56,1],edge:[.83,.88,1],bgA:[.05,.04,.12],bgB:[.01,.01,.03],accent:8360191},{id:"mono",label:"Mono",ink:[.82,.87,.92],edge:[1,1,1],bgA:[.08,.08,.09],bgB:[.01,.01,.02],accent:15068921}];let Re=ae[0];function le(){const t=L==="ink";f.u_viewMode.value=t?0:1,P.material.opacity=t?.18+l.caustics*.14:.08,B.material.opacity=t?.04+l.caustics*.24:.03}function gt(t){const e=new E(t.accent),n=ce(t.bgA).lerp(new E(397336),.45);f.u_rimColor.value.copy(ce(t.edge).lerp(e,.22)),f.u_shadowColor.value.copy(n),P.material.color.copy(e.clone().multiplyScalar(.35).lerp(new E(529179),.68)),B.material.color.copy(e.clone().lerp(new E(16777215),.42)),ye.color.copy(n.clone().lerp(e,.08)),Ee.color.copy(n.clone().lerp(e,.16).lerp(new E(16777215),.08)),U.color.copy(e),oe.color.copy(e.clone().lerp(new E(16777215),.32)),O.material.color.copy(e.clone().multiplyScalar(.55))}function xt(t,e){t==="gravity"&&(_.gravityY=-e),t==="dt"&&(_.dt=e),t==="jacobiIter"&&(_.jacobiIter=Math.round(e)),t==="brushRadius"&&(ie=e),t==="paintForce"&&(d.paintForce=e),t==="paintAmount"&&(d.paintAmount=e),t==="bubbleForce"&&(d.bubbleForce=e),t==="bubbleCarve"&&(d.bubbleCarve=e),t==="ambientMotion"&&(d.ambientMotion=e),t==="velocityDamping"&&(_.velocityDamping=e),t==="inkRetention"&&(_.inkRetention=e),t==="surfaceHeight"&&(l.surfaceHeight=e,f.u_surfaceHeight.value=e),t==="surfaceRelief"&&(l.surfaceRelief=e,f.u_surfaceRelief.value=e),t==="meniscus"&&(l.meniscus=e,f.u_meniscus.value=e),t==="absorption"&&(l.absorption=e,f.u_absorption.value=e),t==="refraction"&&(l.refraction=e,f.u_refraction.value=e),t==="fresnel"&&(l.fresnel=e,f.u_fresnel.value=e),t==="specular"&&(l.specular=e,f.u_specular.value=e),t==="caustics"&&(l.caustics=e,f.u_caustics.value=e,le()),t==="exposure"&&(T.toneMappingExposure=e),t==="fogDensity"&&(x.fog.density=e)}const u={simulation:{section:"Simulation",sectionOrder:1},brush:{section:"Brush & Flow",sectionOrder:2},surface:{section:"Surface Form",sectionOrder:3},optics:{section:"Optical Look",sectionOrder:4}};new Je({gravity:{...u.simulation,order:1,label:"Gravity",min:0,max:20,step:.5,value:9.8,description:"液体を下方向へ引く強さです。大きいほど滴下や崩れが速くなり、壁際まで押し出された流れの戻りも強くなります。"},dt:{...u.simulation,order:2,label:"Time Step",min:.01,max:.35,step:.01,value:.12,description:"1 step ごとの進み量です。大きいほど変化は速く見えますが、値を上げすぎると表面が荒れて不安定になります。"},jacobiIter:{...u.simulation,order:3,label:"Pressure Iter",min:5,max:60,step:1,value:28,decimals:0,description:"圧力解法の反復回数です。増やすほど体積保持と流線が安定し、少ないとにじみや圧縮感が残ります。"},velocityDamping:{...u.simulation,order:4,label:"Velocity Damping",min:.985,max:1,step:5e-4,value:.9985,description:"流速の減衰量です。下げると流れが早く失速し、上げると尾や巻き返しが長く残ります。"},inkRetention:{...u.simulation,order:5,label:"Ink Retention",min:.96,max:1,step:.001,value:1,description:"インク量の保持率です。下げると薄く消えていき、上げると濃い塊や筋が長く残ります。"},brushRadius:{...u.brush,order:1,label:"Brush Radius",min:10,max:60,step:1,value:26,decimals:0,description:"クリックやドラッグで加える範囲です。大きいほど大きなインク塊になり、広い膜や波打つ境界が出やすくなります。"},paintForce:{...u.brush,order:2,label:"Paint Force",min:.05,max:.8,step:.01,value:d.paintForce,description:"ペイント時に流れへ与える勢いです。高いほど引きずる尾が長くなり、激しい攪拌のような跡が残ります。"},paintAmount:{...u.brush,order:3,label:"Paint Amount",min:.2,max:1.2,step:.01,value:d.paintAmount,description:"ペイント時に加える液量です。高いほど厚いインクの塊になり、低いほど薄い膜を重ねる感触になります。"},bubbleForce:{...u.brush,order:4,label:"Bubble Force",min:.05,max:.9,step:.01,value:d.bubbleForce,description:"気泡をくり抜くときの押し広げる勢いです。高いほど周囲の液体を大きく押しのけ、縁に強い波が立ちます。"},bubbleCarve:{...u.brush,order:5,label:"Bubble Carve",min:.2,max:1.2,step:.01,value:d.bubbleCarve,description:"気泡操作でどれだけ液体を削るかです。高いほどはっきり穴が空き、低いと柔らかくえぐるような見え方になります。"},ambientMotion:{...u.brush,order:6,label:"Ambient Motion",min:0,max:.4,step:.01,value:d.ambientMotion,description:"操作していない間のゆるい流れの強さです。上げるほど表面に常時うねりが残り、下げると静かなトレイになります。"},surfaceHeight:{...u.surface,order:1,label:"Surface Height",min:.06,max:.28,step:.005,value:l.surfaceHeight,description:"液体を厚みとして持ち上げる量です。大きいほど膜の輪郭が立体的になり、インクが盛り上がって見えます。"},surfaceRelief:{...u.surface,order:2,label:"Surface Relief",min:0,max:.12,step:.002,value:l.surfaceRelief,description:"表面の細かな凹凸量です。上げると反射が割れ、薄膜のうねりや粘る質感が強調されます。"},meniscus:{...u.surface,order:3,label:"Meniscus",min:0,max:.14,step:.002,value:l.meniscus,description:"液体の縁が立ち上がる量です。上げるほど端で盛り上がり、容器内の濡れた膜らしさが増します。"},absorption:{...u.optics,order:1,label:"Absorption",min:.4,max:3.2,step:.05,value:l.absorption,description:"液体内部で光を吸収する強さです。大きいほど中心が濃く暗くなり、深い色味と厚みが出ます。"},refraction:{...u.optics,order:2,label:"Refraction",min:0,max:.45,step:.01,value:l.refraction,description:"表面越しに見える模様の歪み量です。上げると下層や反射が揺れて、液体らしい屈折感が強まります。"},fresnel:{...u.optics,order:3,label:"Fresnel",min:0,max:1.8,step:.05,value:l.fresnel,description:"視線角で反射が増える量です。上げると斜めから見た縁が明るくなり、濡れた薄膜の存在感が増します。"},specular:{...u.optics,order:4,label:"Specular",min:.2,max:2,step:.05,value:l.specular,description:"ハイライトの鋭さと強さです。上げると濡れたインク表面の照り返しが強くなります。"},caustics:{...u.optics,order:5,label:"Caustics",min:0,max:1,step:.02,value:l.caustics,description:"液体の下側に落ちる淡い光だまりの強さです。上げるとトレイ底面への色移りと厚み感が増します。"},exposure:{...u.optics,order:6,label:"Exposure",min:.7,max:1.4,step:.01,value:T.toneMappingExposure,description:"画面全体の明るさです。上げるとハイライトや透明感が目立ち、下げると色の深さとコントラストが強まります。"},fogDensity:{...u.optics,order:7,label:"Fog Density",min:.02,max:.1,step:.001,value:x.fog.density,description:"背景側の霞みの量です。上げるほど奥行きが強調され、下げるとトレイ全体がくっきり見えます。"}},xt,{title:"Ink Controls",accent:"#9ea8ff",helpText:"スライダーへカーソルを重ねると、シミュレーションと見た目にどのような影響を与えるかを日本語で表示します。",mount:ft});const bt=document.getElementById("palette"),Se=document.getElementById("toolToggle"),Ae=document.getElementById("viewToggle"),yt=document.getElementById("resetButton");ae.forEach(t=>{const e=document.createElement("button");e.className="swatch",e.title=t.label,e.dataset.palette=t.id,e.style.background=`rgb(${t.ink.map(n=>Math.round(n*255)).join(" ")})`,e.addEventListener("click",()=>Ce(t.id)),bt.appendChild(e)});function Ce(t){const e=ae.find(n=>n.id===t);e&&(Re=e,gt(e),document.querySelectorAll("[data-palette]").forEach(n=>{n.classList.toggle("active",n.dataset.palette===t)}))}function C(t){j=t,t==="sheet"&&_.setSceneDamBreak(),t==="drop"&&_.setSceneDroplet(),t==="bubble"&&_.setSceneBubble(),document.querySelectorAll("[data-scene]").forEach(e=>{e.classList.toggle("active",e.dataset.scene===t)})}function ue(){Se.textContent=`Tool: ${X==="paint"?"Paint":"Bubble"}`,Ae.textContent=`View: ${L==="ink"?"Ink":"Velocity"}`}function Fe(){X=X==="paint"?"bubble":"paint",ue()}function Me(){L=L==="ink"?"velocity":"ink",le(),ue()}Ce("lagoon");C("sheet");le();ue();document.querySelectorAll("[data-scene]").forEach(t=>{t.addEventListener("click",()=>C(t.dataset.scene))});Se.addEventListener("click",Fe);Ae.addEventListener("click",Me);yt.addEventListener("click",()=>C(j));const de=new Ke,Z=new ee;function Pe(t,e){const n=g.getBoundingClientRect();Z.x=(t-n.left)/n.width*2-1,Z.y=-((e-n.top)/n.height)*2+1,de.setFromCamera(Z,A);const i=de.intersectObject(G,!1)[0];if(!i)return null;const o=G.worldToLocal(i.point.clone());return{x:D.clamp((o.x/p+.5)*M,0,M),y:D.clamp((-o.z/p+.5)*F,0,F)}}const a={mode:null,pointerId:null,previous:{x:0,y:0},simPoint:null,velocity:new ee};g.addEventListener("contextmenu",t=>t.preventDefault());g.addEventListener("pointerdown",t=>{if(t.pointerType==="mouse"&&t.button===2){g.setPointerCapture(t.pointerId),a.mode="orbit",a.pointerId=t.pointerId,a.previous={x:t.clientX,y:t.clientY};return}if(t.pointerType==="mouse"&&t.button!==0)return;const e=Pe(t.clientX,t.clientY);e&&(g.setPointerCapture(t.pointerId),a.mode="paint",a.pointerId=t.pointerId,a.previous={x:t.clientX,y:t.clientY},a.simPoint=e,a.velocity.set(0,0))});function Be(t){a.pointerId!==null&&t?.pointerId===a.pointerId&&g.hasPointerCapture(t.pointerId)&&g.releasePointerCapture(t.pointerId),a.mode=null,a.pointerId=null,a.simPoint=null}g.addEventListener("pointerup",Be);g.addEventListener("pointercancel",Be);g.addEventListener("pointerleave",()=>{a.mode=null,a.pointerId=null,a.simPoint=null});g.addEventListener("pointermove",t=>{if(a.mode==="orbit"){m.theta=D.clamp(m.theta-(t.clientX-a.previous.x)*.005,-1.15,1.15),m.phi=D.clamp(m.phi+(t.clientY-a.previous.y)*.005,.55,1.42),a.previous={x:t.clientX,y:t.clientY},ne();return}if(a.mode!=="paint")return;const e=Pe(t.clientX,t.clientY);!e||!a.simPoint||(a.velocity.set((e.x-a.simPoint.x)*5.6,(e.y-a.simPoint.y)*5.6),a.simPoint=e)});g.addEventListener("wheel",t=>{t.preventDefault(),m.radius=D.clamp(m.radius+t.deltaY*.01,7.2,15),ne()},{passive:!1});window.addEventListener("keydown",t=>{t.key==="1"&&C("sheet"),t.key==="2"&&C("drop"),t.key==="3"&&C("bubble"),(t.key==="b"||t.key==="B")&&Fe(),(t.key==="v"||t.key==="V")&&Me(),(t.key==="r"||t.key==="R")&&C(j)});H.disable(H.DEPTH_TEST);function wt(){if(!a.simPoint)return;const t=X==="bubble";_.splat(a.simPoint.x,a.simPoint.y,a.velocity.x,a.velocity.y,{radius:ie,velocityAmount:t?d.bubbleForce:d.paintForce,fluidAmount:t?d.bubbleCarve:d.paintAmount,erase:t}),a.velocity.multiplyScalar(.82)}function Et(){if(j!=="sheet"||d.ambientMotion<=0)return;const t=F*.58+Math.sin(S*.9)*F*.02;_.splat(M*.14,t,.65,0,{radius:ie*1.8,velocityAmount:d.ambientMotion,fluidAmount:0})}function Tt(){w.rotation.y=Math.sin(S*.18)*.04,O.rotation.z=Math.sin(S*.26)*.08,U.position.x=Math.sin(S*.4)*3.6,U.position.z=Math.cos(S*.4)*3}const Rt=2;function ke(){requestAnimationFrame(ke),S+=.016,a.mode==="paint"?wt():Et(),Q.beginSim();for(let t=0;t<Rt;t++)_.step();Q.endSim(),_.render(L,Re,S),R.needsUpdate=!0,f.u_time.value=S,Tt(),T.render(x,A),Q.update()}window.addEventListener("resize",pt);ke();
