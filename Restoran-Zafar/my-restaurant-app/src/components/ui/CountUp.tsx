import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  duration?: number; // ms
  format?: (n: number) => string;
  className?: string;
  suffix?: string;
  prefix?: string;
}

// Raqamni 0 dan value gacha silliq sanab chiqaradi (requestAnimationFrame).
const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1200,
  format,
  className,
  suffix = '',
  prefix = '',
}) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };

    // Ko'rinishga kirganda boshlanadi.
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const text = format ? format(display) : Math.round(display).toLocaleString();
  return <span ref={ref} className={className}>{prefix}{text}{suffix}</span>;
};

export default CountUp;
