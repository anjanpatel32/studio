'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const NUM_SPARKLES = 100;
const NUM_DOTS = 200;

const Sparkle = () => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 10;
    const xStart = Math.random() * 100;
    const xEnd = Math.random() * 100;

    setStyle({
      top: '-5%',
      left: `${xStart}vw`,
      animation: `drift ${duration}s linear ${delay}s infinite`,
      '--x-end': `${xEnd}vw`,
    });
  }, []);

  return <div className="absolute h-1 w-1 rounded-full bg-primary/50" style={style} />;
};

const Dot = ({ mouseX, mouseY }: { mouseX: any; mouseY: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.1 };
  const scale = useSpring(1, springConfig);
  const opacity = useSpring(0.1, springConfig);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setX(rect.left + rect.width / 2);
      setY(rect.top + rect.height / 2);
    }
  }, []);

  useEffect(() => {
    if (x === 0 && y === 0) return;

    const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    const maxDist = 200;
    
    if (distance < maxDist) {
      const newScale = 1 + (maxDist - distance) / maxDist * 2.5;
      const newOpacity = 0.1 + (maxDist - distance) / maxDist * 0.9;
      scale.set(newScale);
      opacity.set(newOpacity);
    } else {
      scale.set(1);
      opacity.set(0.1);
    }
  }, [mouseX, mouseY, x, y, scale, opacity]);

  return (
    <motion.div
      ref={ref}
      className="h-1.5 w-1.5 rounded-full bg-primary"
      style={{ scale, opacity }}
    />
  );
};

export function AnimatedBackground() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes drift {
            0% {
              transform: translateY(0) translateX(0);
            }
            100% {
              transform: translateY(105vh) translateX(var(--x-end));
            }
          }
        `}
      </style>
      <div className="fixed inset-0 -z-50 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(120deg, hsl(var(--background)), hsl(var(--secondary)))',
              'linear-gradient(120deg, hsl(var(--secondary)), hsl(var(--accent)))',
              'linear-gradient(120deg, hsl(var(--accent)), hsl(var(--background)))',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
        
        <div className="absolute inset-0 grid h-full w-full grid-cols-10 grid-rows-20 place-items-center">
          {Array.from({ length: NUM_DOTS }).map((_, i) => (
            <Dot key={i} mouseX={mouseX} mouseY={mouseY} />
          ))}
        </div>

        <div className="absolute inset-0">
          {Array.from({ length: NUM_SPARKLES }).map((_, i) => (
            <Sparkle key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
