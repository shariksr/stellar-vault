import { useEffect, useRef, ReactNode } from 'react';

const R = (a: number, b: number) => Math.random() * (b - a) + a;
const RI = (a: number, b: number) => Math.floor(R(a, b));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

const COLORS: [number, number, number][] = [
  [0,200,255],[0,255,200],[100,150,255],[0,255,130],[180,100,255],
  [255,200,0],[0,230,180],[255,100,150],[100,255,180],
];

const NODE_DEFS = [
  {x:0.06,y:0.08,name:'Node-NW1',tier:2},{x:0.08,y:0.28,name:'Node-W1',tier:1},{x:0.07,y:0.50,name:'Node-W2',tier:2},
  {x:0.09,y:0.70,name:'Node-W3',tier:1},{x:0.06,y:0.90,name:'Node-SW1',tier:2},
  {x:0.22,y:0.10,name:'Node-N1',tier:3},{x:0.24,y:0.30,name:'Node-C1',tier:2},{x:0.20,y:0.52,name:'Node-C2',tier:1},
  {x:0.23,y:0.72,name:'Node-S1',tier:2},{x:0.25,y:0.88,name:'Node-S2',tier:3},
  {x:0.40,y:0.07,name:'Node-N2',tier:2},{x:0.42,y:0.28,name:'Node-C3',tier:3},{x:0.38,y:0.48,name:'Node-C4',tier:2},
  {x:0.44,y:0.68,name:'Node-S3',tier:3},{x:0.41,y:0.88,name:'Node-S4',tier:1},
  {x:0.58,y:0.10,name:'Node-N3',tier:3},{x:0.56,y:0.30,name:'Node-C5',tier:2},{x:0.60,y:0.52,name:'Node-C6',tier:1},
  {x:0.57,y:0.72,name:'Node-S5',tier:2},{x:0.59,y:0.90,name:'Node-SE1',tier:2},
  {x:0.74,y:0.08,name:'Node-NE1',tier:2},{x:0.76,y:0.28,name:'Node-E1',tier:3},{x:0.72,y:0.50,name:'Node-E2',tier:2},
  {x:0.78,y:0.70,name:'Node-E3',tier:1},{x:0.75,y:0.90,name:'Node-SE2',tier:3},
  {x:0.90,y:0.12,name:'Node-NE2',tier:1},{x:0.92,y:0.35,name:'Node-E4',tier:2},{x:0.88,y:0.55,name:'Node-E5',tier:3},
  {x:0.91,y:0.75,name:'Node-SE3',tier:2},{x:0.89,y:0.92,name:'Node-SE4',tier:1},
];

interface Node {
  x: number; y: number; name: string; tier: number;
  pulsePhase: number; pulseSpeed: number; baseSize: number;
  color: [number, number, number]; hovered: boolean; activity: number;
}
interface Connection {
  from: Node; to: Node; color: [number, number, number];
  progress: number; speed: number; life: number; maxLife: number; width: number;
}
interface Shockwave {
  x: number; y: number; r: number; maxR: number;
  color: [number, number, number]; life: number; dur: number;
}
interface HexRing {
  x: number; y: number; r: number; maxR: number;
  color: [number, number, number]; life: number; dur: number; rot: number;
}
interface EnergyOrb {
  from: Node; to: Node; progress: number; speed: number;
  color: [number, number, number]; size: number; trail: { x: number; y: number }[];
}
interface DataRainDrop {
  x: number; y: number; speed: number; char: string;
  opacity: number; size: number; color: [number, number, number];
  timer: number; changeEvery: number;
}

const bPt = (p0: { x: number; y: number }, p1: { x: number; y: number }, cp: { x: number; y: number }, t: number) => ({
  x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * cp.x + t * t * p1.x,
  y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * cp.y + t * t * p1.y,
});
const getCP = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (a.x + b.x) / 2 + R(-dist * 0.12, dist * 0.12), y: (a.y + b.y) / 2 - dist * R(0.08, 0.35) };
};

interface Props { children: ReactNode; }

const EliteCloudNetwork = ({ children }: Props) => {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    nodes: Node[]; connections: Connection[]; shockwaves: Shockwave[];
    hexRings: HexRing[]; energyOrbs: EnergyOrb[]; dataRain: DataRainDrop[];
    W: number; H: number; dfVal: number; frameCount: number; startTime: number;
  }>({ nodes: [], connections: [], shockwaves: [], hexRings: [], energyOrbs: [], dataRain: [], W: 0, H: 0, dfVal: 200, frameCount: 0, startTime: Date.now() });

  useEffect(() => {
    const bgC = bgRef.current, mainC = mainRef.current, fxC = fxRef.current, tip = tipRef.current;
    if (!bgC || !mainC || !fxC || !tip) return;
    const bgX = bgC.getContext('2d')!, ctx = mainC.getContext('2d')!, fxX = fxC.getContext('2d')!;
    const s = stateRef.current;
    let animId: number;
    let last: number | null = null;

    const ncEl = document.getElementById('ecn-nc');
    const lcEl = document.getElementById('ecn-lc');
    const dfEl = document.getElementById('ecn-df');
    const utEl = document.getElementById('ecn-ut');

    function resize() {
      s.W = bgC!.width = mainC!.width = fxC!.width = window.innerWidth;
      s.H = bgC!.height = mainC!.height = fxC!.height = window.innerHeight;
      s.nodes = NODE_DEFS.map((d, i) => ({
        ...d,
        x: clamp(d.x * s.W + R(-s.W * 0.025, s.W * 0.025), s.W * 0.04, s.W * 0.96),
        y: clamp(d.y * s.H + R(-s.H * 0.03, s.H * 0.03), s.H * 0.04, s.H * 0.96),
        pulsePhase: R(0, Math.PI * 2), pulseSpeed: R(1.2, 3.0),
        baseSize: d.tier === 3 ? R(4, 6) : d.tier === 2 ? R(3, 4.5) : R(2, 3),
        color: COLORS[i % COLORS.length], hovered: false, activity: 0,
      }));
      s.dataRain = Array.from({ length: 90 }, () => ({
        x: R(0, 1), y: R(0, 1), speed: R(0.0001, 0.0004),
        char: String.fromCharCode(0x30A0 + RI(0, 96)),
        opacity: R(0.03, 0.10), size: R(8, 13),
        color: COLORS[RI(0, COLORS.length)], timer: 0, changeEvery: R(0.5, 2),
      }));
      if (ncEl) ncEl.textContent = String(s.nodes.length);
      drawWorldMap();
    }

    function drawWorldMap() {
      bgX.clearRect(0, 0, s.W, s.H);
      bgX.strokeStyle = 'rgba(0,80,160,0.03)'; bgX.lineWidth = 0.5;
      for (let x = 0; x < s.W; x += 55) { bgX.beginPath(); bgX.moveTo(x, 0); bgX.lineTo(x, s.H); bgX.stroke(); }
      for (let y = 0; y < s.H; y += 55) { bgX.beginPath(); bgX.moveTo(0, y); bgX.lineTo(s.W, y); bgX.stroke(); }
      bgX.strokeStyle = 'rgba(0,100,180,0.04)'; bgX.lineWidth = 0.8;
      for (let i = 1; i < 9; i++) { bgX.beginPath(); bgX.arc(s.W / 2, s.H / 2, Math.min(s.W, s.H) * 0.11 * i, 0, Math.PI * 2); bgX.stroke(); }
      bgX.strokeStyle = 'rgba(0,100,160,0.025)'; bgX.lineWidth = 0.4;
      for (let i = -20; i < 30; i++) { const step = (s.W + s.H) * 0.06; bgX.beginPath(); bgX.moveTo(i * step, 0); bgX.lineTo(i * step + s.H, s.H); bgX.stroke(); }
    }

    function spawnConn() {
      if (s.nodes.length < 2) return;
      const a = RI(0, s.nodes.length); let b = RI(0, s.nodes.length - 1); if (b >= a) b++;
      s.connections.push({
        from: s.nodes[a], to: s.nodes[b], color: COLORS[RI(0, COLORS.length)],
        progress: 0, speed: R(0.003, 0.009), life: 0, maxLife: R(3, 6), width: R(0.8, 2),
      });
      s.nodes[a].activity = Math.min(1, s.nodes[a].activity + 0.5);
    }
    function spawnSW(x: number, y: number, c: [number, number, number]) {
      s.shockwaves.push({ x, y, r: 0, maxR: R(60, 140), color: c, life: 0, dur: R(0.6, 1.2) });
    }
    function spawnHex(x: number, y: number, c: [number, number, number]) {
      s.hexRings.push({ x, y, r: 0, maxR: R(30, 70), color: c, life: 0, dur: R(0.8, 1.5), rot: R(0, Math.PI) });
    }
    function spawnOrb() {
      const a = RI(0, s.nodes.length); let b = RI(0, s.nodes.length - 1); if (b >= a) b++;
      if (b >= s.nodes.length) return;
      s.energyOrbs.push({ from: s.nodes[a], to: s.nodes[b], progress: 0, speed: R(0.005, 0.015), color: COLORS[RI(0, COLORS.length)], size: R(4, 10), trail: [] });
    }

    const connInterval = setInterval(() => { if (s.connections.length < 18) spawnConn(); }, 550);
    const orbInterval = setInterval(spawnOrb, 1600);

    let burstTO: ReturnType<typeof setTimeout>;
    function burstLoop() {
      burstTO = setTimeout(() => {
        const n = RI(6, 12);
        for (let i = 0; i < n; i++) setTimeout(() => {
          spawnConn();
          if (i % 2 === 0 && s.nodes.length) spawnSW(s.nodes[RI(0, s.nodes.length)].x, s.nodes[RI(0, s.nodes.length)].y, [0, 255, 200]);
          if (i % 3 === 0) spawnOrb();
        }, i * R(40, 130));
        burstLoop();
      }, R(4500, 9000));
    }
    burstLoop();

    const onMouseMove = (e: MouseEvent) => {
      let any = false;
      s.nodes.forEach(n => {
        n.hovered = Math.hypot(n.x - e.clientX, n.y - e.clientY) < 28;
        if (n.hovered) {
          any = true;
          tip!.style.opacity = '1'; tip!.style.left = (e.clientX + 16) + 'px'; tip!.style.top = (e.clientY - 10) + 'px';
          tip!.textContent = `⬡ ${n.name}  |  TIER-${n.tier}  |  ${RI(80, 100)}% UPTIME`;
        }
      });
      if (!any) tip!.style.opacity = '0';
    };
    const onClick = (e: MouseEvent) => {
      spawnSW(e.clientX, e.clientY, [0, 200, 255]); spawnHex(e.clientX, e.clientY, [0, 255, 200]);
      for (let i = 0; i < 4; i++) setTimeout(spawnConn, i * 120);
      for (let i = 0; i < 2; i++) setTimeout(spawnOrb, i * 180);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    resize();
    window.addEventListener('resize', resize);

    function draw(ts: number) {
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05); last = ts;
      s.frameCount++;
      ctx.clearRect(0, 0, s.W, s.H); fxX.clearRect(0, 0, s.W, s.H);

      // data rain
      s.dataRain.forEach(d => {
        d.y += d.speed; d.timer += dt;
        if (d.y > 1.02) { d.y = -0.02; d.x = R(0, 1); }
        if (d.timer > d.changeEvery) { d.char = String.fromCharCode(0x30A0 + RI(0, 96)); d.timer = 0; }
        const [r, g, b] = d.color;
        ctx.font = `${d.size}px 'Courier New'`;
        ctx.fillStyle = `rgba(${r},${g},${b},${d.opacity})`;
        ctx.fillText(d.char, d.x * s.W, d.y * s.H);
      });

      // connections
      s.connections = s.connections.filter(c => c.life < c.maxLife);
      s.connections.forEach(c => {
        c.life += dt; c.progress = Math.min(c.progress + c.speed, 1);
        const lr = c.life / c.maxLife;
        const fade = lr < 0.12 ? lr / 0.12 : lr > 0.78 ? 1 - (lr - 0.78) / 0.22 : 1;
        const cp = getCP(c.from, c.to); const [r, g, b] = c.color;
        ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${r},${g},${b},0.4)`;
        ctx.beginPath(); ctx.moveTo(c.from.x, c.from.y); ctx.quadraticCurveTo(cp.x, cp.y, c.to.x, c.to.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.07 * fade})`; ctx.lineWidth = c.width * 5; ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.moveTo(c.from.x, c.from.y); ctx.quadraticCurveTo(cp.x, cp.y, c.to.x, c.to.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.20 * fade})`; ctx.lineWidth = c.width; ctx.stroke();
        ctx.setLineDash([4, 8]);
        ctx.beginPath(); ctx.moveTo(c.from.x, c.from.y); ctx.quadraticCurveTo(cp.x, cp.y, c.to.x, c.to.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.07 * fade})`; ctx.lineWidth = 0.5; ctx.stroke(); ctx.setLineDash([]);
        const pt = bPt(c.from, c.to, cp, c.progress);
        for (let i = 1; i <= 14; i++) {
          const tpt = bPt(c.from, c.to, cp, Math.max(0, c.progress - i * 0.018));
          ctx.beginPath(); ctx.arc(tpt.x, tpt.y, Math.max(0.1, 2.2 - i * 0.14), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${(0.65 - i * 0.044) * fade})`; ctx.fill();
        }
        const hg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 10);
        hg.addColorStop(0, `rgba(${r},${g},${b},${0.9 * fade})`); hg.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${0.95 * fade})`; ctx.fill();
      });

      // energy orbs
      s.energyOrbs = s.energyOrbs.filter(o => o.progress <= 1);
      s.energyOrbs.forEach(o => {
        o.progress += o.speed;
        const cp = getCP(o.from, o.to); const pt = bPt(o.from, o.to, cp, Math.min(o.progress, 1));
        o.trail.push({ ...pt }); if (o.trail.length > 22) o.trail.shift();
        const [r, g, b] = o.color;
        o.trail.forEach((tp, i) => {
          ctx.beginPath(); ctx.arc(tp.x, tp.y, o.size * (i / o.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${(i / o.trail.length) * 0.55})`; ctx.fill();
        });
        const og = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, o.size * 2.5);
        og.addColorStop(0, 'rgba(255,255,255,0.95)'); og.addColorStop(0.3, `rgba(${r},${g},${b},0.8)`); og.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, o.size * 2.5, 0, Math.PI * 2); ctx.fillStyle = og; ctx.fill();
        if (o.progress >= 1) { spawnSW(o.to.x, o.to.y, o.color); spawnHex(o.to.x, o.to.y, o.color); o.to.activity = 1; }
      });

      // nodes
      s.nodes.forEach(n => {
        n.activity = Math.max(0, n.activity - dt * 0.8);
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.001 * n.pulseSpeed + n.pulsePhase);
        const [r, g, b] = n.color; const sz = n.baseSize * (1 + n.activity * 0.7); const hv = n.hovered ? 1.5 : 1;
        const rR = sz + 6 + pulse * 14 * hv + n.activity * 22;
        const ring = ctx.createRadialGradient(n.x, n.y, sz, n.x, n.y, rR);
        ring.addColorStop(0, `rgba(${r},${g},${b},${(0.22 + n.activity * 0.3) * pulse})`); ring.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(n.x, n.y, rR, 0, Math.PI * 2); ctx.fillStyle = ring; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, sz + 14 + Math.sin(ts * 0.0006 * n.pulseSpeed) * 9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.07 * pulse})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.save(); ctx.shadowBlur = 22 + n.activity * 32; ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
        const gl = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, sz * 4.5);
        gl.addColorStop(0, `rgba(${r},${g},${b},${0.45 + n.activity * 0.4})`); gl.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(n.x, n.y, sz * 4.5, 0, Math.PI * 2); ctx.fillStyle = gl; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.arc(n.x, n.y, sz * hv, 0, Math.PI * 2); ctx.fillStyle = `rgba(${r},${g},${b},0.88)`; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, sz * 0.4 * hv, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.98)'; ctx.fill();
        if (n.hovered || n.activity > 0.3) {
          const hexR = sz * 3.5 + n.activity * 12;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + ts * 0.001; ctx.lineTo(n.x + hexR * Math.cos(a), n.y + hexR * Math.sin(a)); }
          ctx.closePath(); ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 + n.activity * 0.4})`; ctx.lineWidth = 1; ctx.stroke();
        }
        if (n.tier === 3) {
          ctx.font = "9px 'Courier New'"; ctx.fillStyle = `rgba(${r},${g},${b},${0.35 + pulse * 0.15})`;
          ctx.fillText(n.name.toUpperCase(), n.x + sz + 5, n.y - sz - 2);
        }
      });

      // shockwaves
      s.shockwaves = s.shockwaves.filter(sw => sw.life < sw.dur);
      s.shockwaves.forEach(sw => {
        sw.life += dt; sw.r = lerp(0, sw.maxR, sw.life / sw.dur);
        const t = sw.life / sw.dur, fd = (1 - t) * (1 - t); const [r, g, b] = sw.color;
        fxX.beginPath(); fxX.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        fxX.strokeStyle = `rgba(${r},${g},${b},${fd * 0.65})`; fxX.lineWidth = 2 - t * 1.6; fxX.stroke();
        fxX.beginPath(); fxX.arc(sw.x, sw.y, sw.r * 0.55, 0, Math.PI * 2);
        fxX.strokeStyle = `rgba(${r},${g},${b},${fd * 0.3})`; fxX.lineWidth = 1; fxX.stroke();
      });

      // hex rings
      s.hexRings = s.hexRings.filter(h => h.life < h.dur);
      s.hexRings.forEach(h => {
        h.life += dt; h.r = lerp(0, h.maxR, h.life / h.dur);
        const t = h.life / h.dur, fd = (1 - t) * (1 - t); const [r, g, b] = h.color;
        fxX.save(); fxX.translate(h.x, h.y); fxX.rotate(h.rot + ts * 0.001);
        fxX.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; fxX.lineTo(h.r * Math.cos(a), h.r * Math.sin(a)); }
        fxX.closePath(); fxX.strokeStyle = `rgba(${r},${g},${b},${fd * 0.55})`; fxX.lineWidth = 1.5 - t; fxX.stroke();
        fxX.restore();
      });

      // HUD update
      if (s.frameCount % 30 === 0) {
        s.dfVal += R(-6, 6); s.dfVal = clamp(s.dfVal, 80, 600);
        if (lcEl) lcEl.textContent = String(s.connections.length);
        if (dfEl) dfEl.textContent = s.dfVal.toFixed(1);
        const el = Math.floor((Date.now() - s.startTime) / 1000);
        if (utEl) utEl.textContent = `${String(Math.floor(el / 3600)).padStart(2, '0')}:${String(Math.floor((el % 3600) / 60)).padStart(2, '0')}:${String(el % 60).padStart(2, '0')}`;
      }

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(animId);
      clearInterval(connInterval);
      clearInterval(orbInterval);
      clearTimeout(burstTO);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 40%, #061428 0%, #030a14 55%, #010308 100%)', cursor: 'crosshair' }}>
      {/* Aurora blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[55%] h-[55%] rounded-full animate-[am1_20s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(ellipse, rgba(0,80,200,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-[30%] -right-[10%] w-[55%] h-[60%] rounded-full animate-[am2_24s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(ellipse, rgba(60,0,180,0.06) 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="absolute -bottom-[5%] left-[25%] w-[55%] h-[50%] rounded-full animate-[am3_17s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(ellipse, rgba(0,150,120,0.05) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute top-[20%] left-[35%] w-[45%] h-[55%] rounded-full animate-[am1_28s_ease-in-out_infinite_alternate-reverse]" style={{ background: 'radial-gradient(ellipse, rgba(0,100,200,0.04) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[10%] right-[15%] w-[40%] h-[45%] rounded-full animate-[am2_19s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(ellipse, rgba(80,20,160,0.05) 0%, transparent 70%)', filter: 'blur(85px)' }} />
      </div>

      {/* Canvas layers */}
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
      <canvas ref={mainRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
      <canvas ref={fxRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,2,10,0.88) 100%)' }} />

      {/* HUD corners */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <div className="absolute top-4 left-4 w-[60px] h-[60px]">
          <div className="absolute top-0 left-0 w-[2px] h-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
          <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
        </div>
        <div className="absolute top-4 right-4 w-[60px] h-[60px]">
          <div className="absolute top-0 right-0 w-[2px] h-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
          <div className="absolute top-0 right-0 h-[2px] w-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
        </div>
        <div className="absolute bottom-4 left-4 w-[60px] h-[60px]">
          <div className="absolute bottom-0 left-0 w-[2px] h-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
          <div className="absolute bottom-0 left-0 h-[2px] w-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
        </div>
        <div className="absolute bottom-4 right-4 w-[60px] h-[60px]">
          <div className="absolute bottom-0 right-0 w-[2px] h-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
          <div className="absolute bottom-0 right-0 h-[2px] w-full" style={{ background: 'rgba(0,200,255,0.4)' }} />
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-8 items-center pointer-events-none" style={{ zIndex: 6, fontFamily: "'Courier New', monospace", fontSize: '11px', color: 'rgba(0,200,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'rgba(0,255,150,0.8)', boxShadow: '0 0 8px rgba(0,255,150,0.8)' }} />
        </div>
        <div>NODES <span id="ecn-nc">0</span></div>
        <div>LINKS <span id="ecn-lc">0</span></div>
        <div>FLOW <span id="ecn-df">0</span> TB/S</div>
        <div>UP <span id="ecn-ut">00:00:00</span></div>
      </div>

      {/* Tooltip */}
      <div ref={tipRef} className="absolute pointer-events-none opacity-0 transition-opacity duration-200 whitespace-nowrap" style={{
        zIndex: 10, fontFamily: "'Courier New', monospace", fontSize: '10px', color: 'rgba(0,255,200,0.9)',
        background: 'rgba(0,10,30,0.85)', border: '1px solid rgba(0,200,255,0.3)',
        padding: '6px 10px', letterSpacing: '0.15em', textTransform: 'uppercase', backdropFilter: 'blur(4px)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 7 }}>{children}</div>
    </div>
  );
};

export default EliteCloudNetwork;
