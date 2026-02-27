import { useEffect, useRef } from 'react';

const COLORS: [number, number, number][] = [
  [255, 255, 255], [180, 220, 255], [255, 210, 140],
  [210, 180, 255], [140, 255, 220], [255, 180, 180],
];

const random = (a: number, b: number) => Math.random() * (b - a) + a;
const randomInt = (a: number, b: number) => Math.floor(random(a, b));

interface StaticStar {
  x: number; y: number; r: number; opacity: number;
  twinkleSpeed: number; twinkleOffset: number; color: [number, number, number];
}
interface ShootingStar {
  x: number; y: number; angle: number; speed: number; length: number;
  opacity: number; width: number; color: [number, number, number];
  progress: number; duration: number;
}
interface Sparkle {
  x: number; y: number; size: number; opacity: number;
  life: number; duration: number; color: [number, number, number];
}

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let staticStars: StaticStar[] = [];
    let stars: ShootingStar[] = [];
    let sparkles: Sparkle[] = [];
    let animId: number;
    let last: number | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      staticStars = Array.from({ length: 280 }, () => ({
        x: random(0, canvas.width), y: random(0, canvas.height),
        r: random(0.3, 1.8), opacity: random(0.15, 0.85),
        twinkleSpeed: random(0.3, 2.5), twinkleOffset: random(0, Math.PI * 2),
        color: COLORS[randomInt(0, COLORS.length)],
      }));
    };

    const createStar = (): ShootingStar => {
      const angle = random(28, 52) * Math.PI / 180;
      return {
        x: random(-200, canvas.width * 1.1), y: random(-150, canvas.height * 0.55),
        angle, speed: random(600, 1500), length: random(90, 260),
        opacity: random(0.5, 1), width: random(0.8, 2.6),
        color: COLORS[randomInt(0, COLORS.length)], progress: 0, duration: random(0.3, 0.85),
      };
    };

    const createSparkle = (): Sparkle => ({
      x: random(0, canvas.width), y: random(0, canvas.height),
      size: random(1, 3.5), opacity: random(0.6, 1),
      life: 0, duration: random(0.4, 1.2), color: COLORS[randomInt(0, COLORS.length)],
    });

    resize();
    window.addEventListener('resize', resize);

    const shootingInterval = setInterval(() => {
      const count = randomInt(2, 4);
      for (let i = 0; i < count; i++)
        setTimeout(() => { if (stars.length < 12) stars.push(createStar()); }, i * random(80, 250));
    }, random(800, 1500));

    const sparkleInterval = setInterval(() => {
      for (let i = 0; i < randomInt(3, 8); i++) sparkles.push(createSparkle());
    }, 1200);

    let burstTimeout: ReturnType<typeof setTimeout>;
    const burst = () => {
      burstTimeout = setTimeout(() => {
        const n = randomInt(6, 10);
        for (let i = 0; i < n; i++) setTimeout(() => stars.push(createStar()), i * random(40, 120));
        burst();
      }, random(4000, 8000));
    };
    burst();

    const draw = (ts: number) => {
      if (!last) last = ts;
      const delta = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Static twinkling stars
      staticStars.forEach(s => {
        const tw = 0.4 + 0.6 * Math.sin(ts * 0.001 * s.twinkleSpeed + s.twinkleOffset);
        const [r, g, b] = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${s.opacity * tw})`;
        ctx.fill();
      });

      // Sparkles
      sparkles = sparkles.filter(sp => sp.life < sp.duration);
      sparkles.forEach(sp => {
        sp.life += delta;
        const t = sp.life / sp.duration;
        const fade = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
        const [r, g, b] = sp.color;
        const sc = sp.size * (0.5 + 0.5 * Math.sin(t * Math.PI));
        ctx.save();
        ctx.globalAlpha = sp.opacity * fade;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sp.x - sc, sp.y); ctx.lineTo(sp.x + sc, sp.y);
        ctx.moveTo(sp.x, sp.y - sc); ctx.lineTo(sp.x, sp.y + sc);
        ctx.moveTo(sp.x - sc * 0.6, sp.y - sc * 0.6); ctx.lineTo(sp.x + sc * 0.6, sp.y + sc * 0.6);
        ctx.moveTo(sp.x + sc * 0.6, sp.y - sc * 0.6); ctx.lineTo(sp.x - sc * 0.6, sp.y + sc * 0.6);
        ctx.stroke();
        ctx.restore();
      });

      // Shooting stars
      stars = stars.filter(s => s.progress <= 1);
      stars.forEach(s => {
        s.progress += delta / s.duration;
        const t = Math.min(s.progress, 1);
        const dx = Math.cos(s.angle) * s.speed * s.duration;
        const dy = Math.sin(s.angle) * s.speed * s.duration;
        const tailStart = Math.max(0, t - s.length / (s.speed * s.duration));
        const x1 = s.x + dx * tailStart, y1 = s.y + dy * tailStart;
        const x2 = s.x + dx * t, y2 = s.y + dy * t;
        const [r, g, b] = s.color;

        // Outer glow trail
        const g1 = ctx.createLinearGradient(x1, y1, x2, y2);
        g1.addColorStop(0, `rgba(${r},${g},${b},0)`);
        g1.addColorStop(1, `rgba(${r},${g},${b},${s.opacity * 0.15})`);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = g1; ctx.lineWidth = s.width * 4; ctx.lineCap = 'round'; ctx.stroke();

        // Core trail
        const g2 = ctx.createLinearGradient(x1, y1, x2, y2);
        g2.addColorStop(0, `rgba(${r},${g},${b},0)`);
        g2.addColorStop(0.5, `rgba(${r},${g},${b},${s.opacity * 0.5})`);
        g2.addColorStop(1, `rgba(${r},${g},${b},${s.opacity})`);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = g2; ctx.lineWidth = s.width; ctx.lineCap = 'round'; ctx.stroke();

        // Radial head glow
        const glow = ctx.createRadialGradient(x2, y2, 0, x2, y2, s.width * 6);
        glow.addColorStop(0, `rgba(${r},${g},${b},${s.opacity * 0.8})`);
        glow.addColorStop(0.4, `rgba(${r},${g},${b},${s.opacity * 0.3})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(x2, y2, s.width * 6, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        // White-hot tip
        ctx.beginPath(); ctx.arc(x2, y2, s.width * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`; ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      clearInterval(shootingInterval);
      clearInterval(sparkleInterval);
      clearTimeout(burstTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" style={{
      background: 'radial-gradient(ellipse at 55% 25%, #0e1d42 0%, #07101f 50%, #020408 100%)',
    }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Nebula glow blobs */}
      <div className="absolute top-[5%] left-[15%] w-[600px] h-[350px] rounded-full opacity-100" style={{ background: 'radial-gradient(ellipse, rgba(30,60,200,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-[40%] right-[8%] w-[450px] h-[450px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(100,20,160,0.09) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[15%] left-[3%] w-[400px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(10,100,140,0.08) 0%, transparent 70%)', filter: 'blur(45px)' }} />
      <div className="absolute top-[60%] left-[40%] w-[500px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(20,60,120,0.07) 0%, transparent 70%)', filter: 'blur(55px)' }} />
    </div>
  );
};

export default StarryBackground;
