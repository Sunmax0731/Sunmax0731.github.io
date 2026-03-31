// ============================================================
// topology.js - 球体トポロジー生成（三角形・六角形）
//
// 三角形: 正二十面体を freq² 分割 → 20*freq² セル
// 六角形: 三角形分割の双対 → 10*freq²+2 セル（六角形+12個の五角形）
// ============================================================

const Topology = (() => {

  const PHI = (1 + Math.sqrt(5)) / 2;

  // 正二十面体の12頂点（単位球面に正規化）
  const ICO_V = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0,  1, PHI], [0, -1, -PHI], [0,  1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ].map(v => { const l = Math.sqrt(v[0]**2+v[1]**2+v[2]**2); return v.map(x => x/l); });

  // 正二十面体の20面
  const ICO_F = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];

  function _norm(v) {
    const l = Math.sqrt(v[0]**2+v[1]**2+v[2]**2);
    return l < 1e-12 ? [0,0,1] : v.map(x => x/l);
  }

  // ============================================================
  // 正二十面体の各面を freq² 個の三角形に測地線細分割
  // 各頂点は単位球面に射影
  // ============================================================
  function _buildRawGeodesic(freq) {
    const vertMap = new Map();
    const verts   = [];
    const tris    = [];

    function getVert(x, y, z) {
      const [nx, ny, nz] = _norm([x, y, z]);
      const key = `${nx.toFixed(6)},${ny.toFixed(6)},${nz.toFixed(6)}`;
      if (!vertMap.has(key)) { vertMap.set(key, verts.length); verts.push([nx, ny, nz]); }
      return vertMap.get(key);
    }

    for (const [ai, bi, ci] of ICO_F) {
      const a = ICO_V[ai], b = ICO_V[bi], c = ICO_V[ci];
      const n = freq;

      // 重心座標 (i/n, j/n, k/n) のグリッドを生成
      const grid = [];
      for (let i = 0; i <= n; i++) {
        grid[i] = [];
        for (let j = 0; j <= n-i; j++) {
          const k = n-i-j;
          grid[i][j] = getVert(
            (i*a[0]+j*b[0]+k*c[0])/n,
            (i*a[1]+j*b[1]+k*c[1])/n,
            (i*a[2]+j*b[2]+k*c[2])/n
          );
        }
      }

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n-i; j++) {
          tris.push([grid[i][j], grid[i+1][j], grid[i][j+1]]);
          if (i+j < n-1) tris.push([grid[i+1][j], grid[i+1][j+1], grid[i][j+1]]);
        }
      }
    }
    return { verts, tris };
  }

  // ============================================================
  // 三角形球体
  // セル = 各三角形、隣接 = 頂点共有（8近傍相当）
  // ============================================================
  function buildTriangle(freq) {
    const { verts, tris } = _buildRawGeodesic(freq);

    // 頂点 → 三角形リスト
    const v2t = verts.map(() => []);
    tris.forEach((t, i) => t.forEach(v => v2t[v].push(i)));

    // 隣接（頂点共有ですべての接触三角形）
    const adjacency = tris.map((_, i) => {
      const s = new Set();
      tris[i].forEach(v => v2t[v].forEach(j => { if (j !== i) s.add(j); }));
      return [...s];
    });

    // 各三角形の重心（セル中心方向）
    const positions = tris.map(([v0,v1,v2]) => _norm([
      (verts[v0][0]+verts[v1][0]+verts[v2][0])/3,
      (verts[v0][1]+verts[v1][1]+verts[v2][1])/3,
      (verts[v0][2]+verts[v1][2]+verts[v2][2])/3,
    ]));

    return {
      shapeType : 'triangle',
      numCells  : tris.length,
      verts,
      triVerts  : tris.map(([v0,v1,v2]) => [verts[v0], verts[v1], verts[v2]]),
      positions,
      adjacency,
    };
  }

  // ============================================================
  // 六角形球体（測地線三角形分割の双対）
  // セル = 三角形分割の各頂点
  // ポリゴン = 周囲三角形の重心を角度順に並べたもの
  // ============================================================
  function buildHex(freq) {
    const { verts, tris } = _buildRawGeodesic(freq);

    // 辺共有隣接（六角形セル間）
    const vertAdj = verts.map(() => new Set());
    tris.forEach(([v0,v1,v2]) => {
      vertAdj[v0].add(v1); vertAdj[v0].add(v2);
      vertAdj[v1].add(v0); vertAdj[v1].add(v2);
      vertAdj[v2].add(v0); vertAdj[v2].add(v1);
    });

    // 三角形の重心（正規化）
    const triC = tris.map(([v0,v1,v2]) => _norm([
      (verts[v0][0]+verts[v1][0]+verts[v2][0])/3,
      (verts[v0][1]+verts[v1][1]+verts[v2][1])/3,
      (verts[v0][2]+verts[v1][2]+verts[v2][2])/3,
    ]));

    // 頂点 → 周囲三角形
    const v2t = verts.map(() => []);
    tris.forEach((_, i) => tris[i].forEach(v => v2t[v].push(i)));

    // 接平面上で三角形を角度順ソート
    function sortedTrisAround(vi) {
      const n = verts[vi];
      const tlist = v2t[vi];

      // 接ベクトル t1 を計算（n と直交）
      let ref = Math.abs(n[0]) < 0.9 ? [1,0,0] : [0,1,0];
      const d = ref[0]*n[0]+ref[1]*n[1]+ref[2]*n[2];
      let t1 = [ref[0]-d*n[0], ref[1]-d*n[1], ref[2]-d*n[2]];
      const l1 = Math.sqrt(t1[0]**2+t1[1]**2+t1[2]**2);
      t1 = t1.map(x => x/l1);

      // t2 = n × t1
      const t2 = [n[1]*t1[2]-n[2]*t1[1], n[2]*t1[0]-n[0]*t1[2], n[0]*t1[1]-n[1]*t1[0]];

      return [...tlist].sort((a, b) => {
        const ca = triC[a], cb = triC[b];
        const angA = Math.atan2(ca[0]*t2[0]+ca[1]*t2[1]+ca[2]*t2[2], ca[0]*t1[0]+ca[1]*t1[1]+ca[2]*t1[2]);
        const angB = Math.atan2(cb[0]*t2[0]+cb[1]*t2[1]+cb[2]*t2[2], cb[0]*t1[0]+cb[1]*t1[1]+cb[2]*t1[2]);
        return angA - angB;
      });
    }

    const polygons = verts.map((_, vi) => sortedTrisAround(vi).map(t => triC[t]));

    return {
      shapeType : 'hex',
      numCells  : verts.length,
      positions : verts.map(v => [...v]),
      polygons,
      adjacency : vertAdj.map(s => [...s]),
    };
  }

  return { buildTriangle, buildHex };

})();
