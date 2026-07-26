'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface GsapFadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export default function GsapFadeIn({ children, className = "", delay = 0, duration = 0.7, yOffset = 20 }: GsapFadeInProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(container.current, {
      y: yOffset,
      opacity: 0,
      duration: duration,
      delay: delay,
      ease: 'power2.out',
    });
  }, { scope: container });

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
