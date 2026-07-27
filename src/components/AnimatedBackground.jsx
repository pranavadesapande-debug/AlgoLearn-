import { motion } from 'framer-motion';

const orbs = [
  { size: 480, top: '-10%', left: '-8%', color: 'from-violet-300/40 to-indigo-300/10', dur: 18 },
  { size: 380, top: '40%', left: '70%', color: 'from-sky-300/35 to-cyan-200/10', dur: 22 },
  { size: 300, top: '70%', left: '15%', color: 'from-fuchsia-300/30 to-pink-200/10', dur: 16 },
  { size: 260, top: '5%', left: '55%', color: 'from-indigo-300/30 to-violet-200/10', dur: 20 },
];

const sparkles = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  top: `${(i * 8.3 + 5) % 95}%`,
  left: `${(i * 13.7 + 3) % 92}%`,
  size: 2 + (i % 3),
  delay: i * 0.6,
  dur: 3 + (i % 4),
}));

export default function AnimatedBackground({ variant = 'default' }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden mesh-bg pointer-events-none">
      {/* Animated gradient orbs */}
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${o.color} blur-3xl`}
          style={{ width: o.size, height: o.size, top: o.top, left: o.left }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Twinkling sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={`sp-${s.id}`}
          className="absolute rounded-full bg-violet-400/60"
          style={{ width: s.size, height: s.size, top: s.top, left: s.left }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Subtle grid overlay for dashboard */}
      {variant === 'dashboard' && (
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(256 83% 58%) 1px, transparent 1px), linear-gradient(90deg, hsl(256 83% 58%) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      )}
    </div>
  );
}
