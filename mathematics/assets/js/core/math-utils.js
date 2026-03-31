/**
 * math-utils.js - 共通数学関数ライブラリ
 */

const MathUtils = {

  // ===== 数論 =====

  /** n以下の素数をエラトステネスの篩で列挙 */
  sieve(n) {
    const flags = new Uint8Array(n + 1).fill(1);
    flags[0] = flags[1] = 0;
    for (let i = 2; i * i <= n; i++) {
      if (flags[i]) for (let j = i * i; j <= n; j += i) flags[j] = 0;
    }
    const primes = [];
    for (let i = 2; i <= n; i++) if (flags[i]) primes.push(i);
    return primes;
  },

  /** 素因数分解 */
  factorize(n) {
    const factors = {};
    for (let d = 2; d * d <= n; d++) {
      while (n % d === 0) { factors[d] = (factors[d] || 0) + 1; n /= d; }
    }
    if (n > 1) factors[n] = (factors[n] || 0) + 1;
    return factors;
  },

  /** 最大公約数 (GCD) */
  gcd(a, b) { return b === 0 ? a : MathUtils.gcd(b, a % b); },

  /** 最小公倍数 (LCM) */
  lcm(a, b) { return (a / MathUtils.gcd(a, b)) * b; },

  /** 素数判定 */
  isPrime(n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  },

  /** フィボナッチ数列 */
  fibonacci(n) {
    const seq = [0, 1];
    for (let i = 2; i <= n; i++) seq.push(seq[i-1] + seq[i-2]);
    return seq.slice(0, n + 1);
  },

  /** 組合せ C(n,k) */
  comb(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 0; i < k; i++) result = result * (n - i) / (i + 1);
    return Math.round(result);
  },

  /** 順列 P(n,k) */
  perm(n, k) {
    let result = 1;
    for (let i = 0; i < k; i++) result *= (n - i);
    return result;
  },

  // ===== 解析・微積分 =====

  /** 数値微分 (中心差分) */
  derivative(f, x, h = 1e-7) {
    return (f(x + h) - f(x - h)) / (2 * h);
  },

  /** 数値積分 (Simpson法) */
  integrate(f, a, b, n = 1000) {
    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
      sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
    }
    return (h / 3) * sum;
  },

  /** Runge-Kutta 4次法 (ODE数値解) */
  rk4(f, t0, y0, dt, steps) {
    const trajectory = [{ t: t0, y: y0 }];
    let t = t0, y = y0;
    for (let i = 0; i < steps; i++) {
      const k1 = f(t, y);
      const k2 = f(t + dt/2, y + k1 * dt/2);
      const k3 = f(t + dt/2, y + k2 * dt/2);
      const k4 = f(t + dt, y + k3 * dt);
      y += (dt / 6) * (k1 + 2*k2 + 2*k3 + k4);
      t += dt;
      trajectory.push({ t, y });
    }
    return trajectory;
  },

  // ===== 複素数 =====

  complex: {
    add:  (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
    sub:  (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
    mul:  (a, b) => ({ re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re }),
    div:  (a, b) => {
      const d = b.re*b.re + b.im*b.im;
      return { re: (a.re*b.re + a.im*b.im)/d, im: (a.im*b.re - a.re*b.im)/d };
    },
    abs:  (a) => Math.sqrt(a.re*a.re + a.im*a.im),
    arg:  (a) => Math.atan2(a.im, a.re),
    conj: (a) => ({ re: a.re, im: -a.im }),
    exp:  (a) => {
      const r = Math.exp(a.re);
      return { re: r * Math.cos(a.im), im: r * Math.sin(a.im) };
    },
    pow:  (a, n) => {
      const r = Math.pow(MathUtils.complex.abs(a), n);
      const θ = MathUtils.complex.arg(a) * n;
      return { re: r * Math.cos(θ), im: r * Math.sin(θ) };
    },
  },

  // ===== ベクトル =====

  vec2: {
    add:    (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
    sub:    (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
    scale:  (a, s) => ({ x: a.x * s, y: a.y * s }),
    dot:    (a, b) => a.x*b.x + a.y*b.y,
    len:    (a) => Math.sqrt(a.x*a.x + a.y*a.y),
    norm:   (a) => { const l = MathUtils.vec2.len(a); return { x: a.x/l, y: a.y/l }; },
    rotate: (a, θ) => ({
      x: a.x * Math.cos(θ) - a.y * Math.sin(θ),
      y: a.x * Math.sin(θ) + a.y * Math.cos(θ),
    }),
  },

  // ===== 統計 =====

  stats: {
    mean:     (arr) => arr.reduce((s, x) => s + x, 0) / arr.length,
    variance: (arr) => {
      const m = MathUtils.stats.mean(arr);
      return arr.reduce((s, x) => s + (x-m)**2, 0) / arr.length;
    },
    stddev:   (arr) => Math.sqrt(MathUtils.stats.variance(arr)),
    /** 正規分布PDF */
    normalPDF: (x, μ = 0, σ = 1) =>
      Math.exp(-0.5 * ((x - μ)/σ)**2) / (σ * Math.sqrt(2 * Math.PI)),
    /** ポアソン分布 */
    poissonPMF: (k, λ) =>
      Math.exp(-λ) * Math.pow(λ, k) / MathUtils.factorial(k),
  },

  factorial(n) {
    if (n <= 1) return 1;
    return n * MathUtils.factorial(n - 1);
  },

  // ===== 幾何 =====

  /** マンデルブロ集合の反復回数 */
  mandelbrot(cx, cy, maxIter = 100) {
    let zx = 0, zy = 0, i = 0;
    while (zx*zx + zy*zy < 4 && i < maxIter) {
      const tmp = zx*zx - zy*zy + cx;
      zy = 2*zx*zy + cy;
      zx = tmp;
      i++;
    }
    return i;
  },

  /** ローレンツ方程式 */
  lorenz(x, y, z, σ = 10, ρ = 28, β = 8/3) {
    return {
      dx: σ * (y - x),
      dy: x * (ρ - z) - y,
      dz: x * y - β * z,
    };
  },

  // ===== ユーティリティ =====
  clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
  lerp:  (a, b, t) => a + (b - a) * t,
  map:   (x, a, b, c, d) => c + (x - a) / (b - a) * (d - c),
  /** ラジアン → 度 */ toDeg: (r) => r * 180 / Math.PI,
  /** 度 → ラジアン */ toRad: (d) => d * Math.PI / 180,
};

// グローバル公開
window.MathUtils = MathUtils;
