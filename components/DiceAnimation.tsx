
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RigidBody, Physics, RapierRigidBody } from '@react-three/rapier';
import { Environment, Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { audioService } from '../services/audio';
import { RollData } from '../types';

interface DieProps {
  data: RollData; 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  impulse: [number, number, number];
  torque: [number, number, number];
  onSettle: () => void;
  soundEnabled: boolean;
  delay: number;
  index: number;
}

const Die: React.FC<DieProps> = ({ data, position, rotation, impulse, torque, onSettle, soundEnabled, delay, index }) => {
  const ref = useRef<RapierRigidBody>(null);
  const [settled, setSettled] = useState(false);
  const [visible, setVisible] = useState(false);
  const lastCollisionTime = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      if (ref.current) {
        ref.current.applyImpulse(new THREE.Vector3(...impulse), true);
        ref.current.applyTorqueImpulse(new THREE.Vector3(...torque), true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, impulse, torque]);

  const getColors = () => {
    if (data.isCrit) return { die: '#fbbf24', text: '#78350f', edge: '#f59e0b' }; 
    if (data.isFail) return { die: '#1c1917', text: '#ef4444', edge: '#450a0a' }; 
    if (data.source === 'player') return { die: '#064e3b', text: '#d1fae5', edge: '#065f46' }; 
    return { die: '#7f1d1d', text: '#fecaca', edge: '#991b1b' }; 
  };

  const colors = getColors();

  useFrame(() => {
    if (ref.current && visible && !settled) {
      const vel = ref.current.linvel();
      const ang = ref.current.angvel();
      const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
      const rotSpeed = Math.sqrt(ang.x ** 2 + ang.y ** 2 + ang.z ** 2);
      
      if (speed < 0.05 && rotSpeed < 0.05) {
        setSettled(true);
        if (soundEnabled) {
          if (data.isCrit) audioService.playOneShot('crit');
          else if (data.isFail) audioService.playOneShot('fail');
          else audioService.playOneShot('dice_roll', index * 50); // Variant based on index
        }
        onSettle();
      }
    }
  });

  const handleCollision = () => {
    if (!visible || settled) return;
    const now = Date.now();
    if (soundEnabled && now - lastCollisionTime.current > 100) {
      // Pass a variant based on die index to ensure distinct collision sounds
      audioService.playOneShot('dice_roll', index * 33 + Math.random() * 20);
      lastCollisionTime.current = now;
    }
  };

  const Geometry = useMemo(() => {
    switch (data.type) {
      // @ts-ignore
      case 'd4': return <tetrahedronGeometry args={[0.8]} />;
      // @ts-ignore
      case 'd6': return <boxGeometry args={[1, 1, 1]} />;
      // @ts-ignore
      case 'd8': return <octahedronGeometry args={[0.8]} />;
      // @ts-ignore
      case 'd12': return <dodecahedronGeometry args={[0.8]} />;
      // @ts-ignore
      case 'd20': return <icosahedronGeometry args={[0.8]} />;
      // @ts-ignore
      default: return <icosahedronGeometry args={[0.8]} />;
    }
  }, [data.type]);

  if (!visible) return null;

  return (
    <RigidBody
      ref={ref}
      position={position}
      rotation={rotation}
      colliders="convex"
      restitution={0.4}
      friction={0.5}
      onCollisionEnter={handleCollision}
    >
      {/* @ts-ignore */}
      <mesh castShadow>
        {Geometry}
        {/* @ts-ignore */}
        <meshStandardMaterial 
          color={colors.die} 
          roughness={0.3} 
          metalness={0.2} 
        />
      {/* @ts-ignore */}
      </mesh>

      {settled && (
        <Float speed={4} rotationIntensity={0.2} floatIntensity={0.5}>
          <Text
            position={[0, 1.4, 0]}
            fontSize={0.7}
            color={colors.die}
            font="Cinzel"
            anchorX="center"
            anchorY="middle"
          >
            {data.value}
          </Text>
        </Float>
      )}
    </RigidBody>
  );
};

const Table = () => (
  <RigidBody type="fixed" colliders="cuboid" friction={0.8}>
    {/* @ts-ignore */}
    <mesh receiveShadow position={[0, -2, 0]}>
      {/* @ts-ignore */}
      <boxGeometry args={[50, 1, 50]} />
      {/* @ts-ignore */}
      <meshStandardMaterial color="#050404" roughness={0.9} />
    {/* @ts-ignore */}
    </mesh>
    {/* @ts-ignore */}
    <mesh receiveShadow position={[0, -1.48, 0]} rotation={[-Math.PI/2, 0, 0]}>
        {/* @ts-ignore */}
        <circleGeometry args={[12, 64]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} transparent opacity={0.4} />
    {/* @ts-ignore */}
    </mesh>
  </RigidBody>
);

interface DiceAnimationProps {
  rolls: RollData[];
  onComplete?: () => void;
  soundEnabled: boolean;
}

const DiceAnimation: React.FC<DiceAnimationProps> = ({ rolls, onComplete, soundEnabled }) => {
  const [settledCount, setSettledCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (settledCount === rolls.length && rolls.length > 0 && !done) {
      const timeout = setTimeout(() => {
        setDone(true);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [settledCount, rolls.length, onComplete, done]);

  const physicsProps = useMemo(() => {
    return rolls.map((_, i) => ({
      position: [
        -3 + Math.random() * 6,
        8 + Math.random() * 4,
        -3 + Math.random() * 6
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      impulse: [
        Math.random() * 8 - 4,
        -20,
        Math.random() * 8 - 4
      ] as [number, number, number],
      torque: [
        Math.random() * 20,
        Math.random() * 20,
        Math.random() * 20
      ] as [number, number, number]
    }));
  }, [rolls]);

  return (
    <div className="w-full h-full pointer-events-none relative">
      <Canvas shadows camera={{ position: [10, 14, 10], fov: 35 }}>
        {/* @ts-ignore */}
        <color attach="background" args={['#050404']} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
        
        {/* @ts-ignore */}
        <ambientLight intensity={0.5} />
        {/* @ts-ignore */}
        <spotLight position={[15, 25, 15]} angle={0.3} penumbra={1} intensity={2.5} castShadow />
        {/* @ts-ignore */}
        <pointLight position={[-10, 10, -10]} intensity={1.5} color="#fbbf24" />
        
        <Physics gravity={[0, -30, 0]}>
          <Table />
          {rolls.map((roll, i) => (
            <Die 
              key={`${i}-${roll.value}`} 
              data={roll} 
              {...physicsProps[i]}
              delay={i * 200}
              index={i}
              onSettle={() => setSettledCount(prev => prev + 1)}
              soundEnabled={soundEnabled}
            />
          ))}
        </Physics>
        <Environment preset="night" />
      </Canvas>

      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <h2 className="font-display text-[10px] uppercase tracking-[0.8em] text-amber-500/20 animate-pulse">The Hand of Fate</h2>
      </div>
    </div>
  );
};

export default DiceAnimation;
