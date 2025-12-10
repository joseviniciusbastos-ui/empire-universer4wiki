import React, { useEffect, useRef } from 'react';
// @ts-ignore
import Matter from 'matter-js';

const GravitySystem: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Setup Matter.js Engine
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;

    // Antigravity settings: Low gravity or zero gravity
    engine.world.gravity.y = 0; // Zero gravity (floating)
    engine.world.gravity.x = 0;

    // 2. Select DOM elements to physics-enable
    // We target common block elements that look good floating
    const selectors = 'header, aside, main > div > div > div, .card-component, button';
    const elements = document.querySelectorAll<HTMLElement>(selectors);
    const bodies: any[] = [];

    // 3. Create bodies for each element
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();

      // Create a physical body that matches the element
      const body = Bodies.rectangle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        rect.width,
        rect.height,
        {
          restitution: 0.9, // Bouncy
          frictionAir: 0.05,
          render: {
            fillStyle: '#333'
          }
        }
      );
      bodies.push(body);
    });
  }, []);

  return <div ref={sceneRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
};

export default GravitySystem;