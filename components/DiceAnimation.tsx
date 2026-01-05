
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RigidBody, Physics, RapierRigidBody, CuboidCollider, MeshCollider } from '@react-three/rapier';
import { Environment, Text, Float, Sparkles as SparklesEffect, Center } from '@react-three/drei';
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

const DieGeometry = React.memo(({ type }: { type: string }) => {
  // Scaling factors to normalize size roughly
  switch (type) {
    case 'd4': return <tetrahedronGeometry args={[1.2]} />;
    case 'd6': return <boxGeometry args={[1.4, 1.4, 1.4]} />;
    case 'd8': return <octahedronGeometry args={[1.1]} />;
    // d10 is strictly a pentagonal trapezohedron, not a standard primitive. 
    // We use an octahedron as a physics proxy or icosahedron. 
    // Dodecahedron (d12) feels reasonably close in "rolliness".
    case 'd10': return <dodecahedronGeometry args={[1.0]} />; 
    case 'd12': return <dodecahedronGeometry args={[1.0]} />;
    case 'd20': return <icosahedronGeometry args={[1.0]} />;
    default: return <boxGeometry args={[1.4, 1.4, 1.4]} />;
  }
});

const Die: React.FC<DieProps> = ({ data, position, rotation, impulse, torque, onSettle, soundEnabled, delay, index }) => {
  const ref = useRef<RapierRigidBody>(null);
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState(false);
  const [currentPos, setCurrentPos] = useState(new THREE.Vector3(...position));
  const lastCollisionTime = useRef(0);

  // Delayed activation to stagger the throw
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Apply impulse once activated
  useEffect(() => {
    if (active && ref.current) {
      // Wake up the body just in case
      ref.current.wakeUp();
      // Apply initial force
      ref.current.applyImpulse(new THREE.Vector3(...impulse), true);
      ref.current.applyTorqueImpulse(new THREE.Vector3(...torque), true);
    }
  }, [active, impulse, torque]);

  const getColors = () => {
    if (data.isCrit) return { die: '#fbbf24', text: '#fffbeb', emissive: '#d97706' }; // Gold/Amber
    if (data.isFail) return { die: '#1c1917', text: '#ef4444', emissive: '#450a0a' }; // Dark/Red
    if (data.source === 'player') return { die: '#064e3b', text: '#d1fae5', emissive: '#065f46' }; // Emerald
    return { die: '#7f1d1d', text: '#fecaca', emissive: '#450a0a' }; // Red
  };

  const colors = getColors();

  useFrame((state) => {
    if (!ref.current || !active) return;

    // Track position for the settled text overlay
    const translation = ref.current.translation();
    currentPos.set(translation.x, translation.y, translation.z);

    if (!settled) {
      const vel = ref.current.linvel();
      const ang = ref.current.angvel();
      const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
      const rotSpeed = Math.sqrt(ang.x ** 2 + ang.y ** 2 + ang.z ** 2);
      
      // Dice is "settled" when movement is negligible
      // Added condition to ensure it has actually moved/fallen a bit (time check)
      if (speed < 0.01 && rotSpeed < 0.05 && state.clock.getElapsedTime() > (delay / 1000 + 1.0)) {
        setSettled(true);
        if (soundEnabled) {
          if (data.isCrit) audioService.playOneShot('crit');
          else if (data.isFail) audioService.playOneShot('fail');
        }
        onSettle();
      }
    }
  });

  const handleCollision = (payload: any) => {
    if (!active || settled) return;
    const now = Date.now();
    // Only play sound if hitting hard enough and enough time passed
    if (soundEnabled && now - lastCollisionTime.current > 100 && payload.totalForceMagnitude > 20) {
      // Modulate pitch slightly based on index
      audioService.playOneShot('dice_roll', index * 33 + Math.random() * 20);
      lastCollisionTime.current = now;
    }
  };

  return (
    <>
      <RigidBody
        ref={ref}
        position={position}
        rotation={rotation}
        colliders={false} // Use manual collider
        restitution={0.4} // Bounciness - adjusted for realism
        friction={0.7} // Grip - ensures it rolls rather than slides
        linearDamping={0.1} // Air resistance - low for falling
        angularDamping={0.2} // Spin resistance - let it roll
        onCollisionEnter={handleCollision}
        enabled={active}
        ccd={true} // Continuous Collision Detection prevents tunneling at high speeds
      >
        <MeshCollider type="hull">
          <mesh castShadow receiveShadow>
            <DieGeometry type={data.type || 'd20'} />
            <meshStandardMaterial 
              color={colors.die} 
              roughness={0.2} 
              metalness={0.4}
              emissive={colors.emissive}
              emissiveIntensity={0.2}
            />
          </mesh>
        </MeshCollider>
      </RigidBody>

      {/* Result Indicator */}
      {settled && (
        <group position={[currentPos.x, currentPos.y + 1.8, currentPos.z]}>
          <Float speed={3} rotationIntensity={0.2} floatIntensity={0.3} floatingRange={[0, 0.2]}>
            <Center>
                <Text
                    fontSize={0.8}
                    color={data.isCrit ? "#fbbf24" : data.isFail ? "#ef4444" : "#e7e5e4"}
                    font="https://fonts.gstatic.com/s/cinzel/v11/8vIJ7ww63mVu7gt78Uk.woff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {data.value}
                </Text>
            </Center>
          </Float>
          {data.isCrit && (
             <SparklesEffect count={20} scale={2} size={2} speed={0.4} opacity={0.5} color="#fbbf24" />
          )}
        </group>
      )}
    </>
  );
};

const Table = () => (
  <group>
    {/* Physical Floor - Invisible */}
    <RigidBody type="fixed" colliders="cuboid" friction={1} restitution={0.2}>
      <CuboidCollider args={[50, 1, 50]} position={[0, -1, 0]} />
    </RigidBody>

    {/* Visual Floor - Shadow Catcher */}
    <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial transparent opacity={0.4} color="#000000" />
    </mesh>
    
    {/* Ambient Glow from bottom */}
    <gridHelper args={[50, 50, 0x333333, 0x111111]} position={[0, 0.01, 0]} />
  </group>
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
      }, 2500); // Wait a bit after all settled to show results
      return () => clearTimeout(timeout);
    }
  }, [settledCount, rolls.length, onComplete, done]);

  // Pre-calculate random throw properties with more variance
  const physicsProps = useMemo(() => {
    return rolls.map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 8, // Spread X
        15 + i * 2, // Stagger Height (Higher start)
        (Math.random() - 0.5) * 4 // Spread Z
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ] as [number, number, number],
      impulse: [
        (Math.random() - 0.5) * 8, // Random X force
        -15 - Math.random() * 10, // Stronger Downward force
        (Math.random() - 0.5) * 8 // Random Z force
      ] as [number, number, number],
      torque: [
        (Math.random() - 0.5) * 50, // High spin for tumbling
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      ] as [number, number, number]
    }));
  }, [rolls]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-50">
      <Canvas shadows camera={{ position: [0, 25, 15], fov: 35, near: 0.1, far: 100 }}>
        
        <ambientLight intensity={0.4} />
        <spotLight 
            position={[10, 20, 10]} 
            angle={0.4} 
            penumbra={0.5} 
            intensity={2} 
            castShadow 
            shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#d97706" />
        
        <Physics gravity={[0, -30, 0]} timeStep={1/60}>
          <Table />
          {rolls.map((roll, i) => (
            <Die 
              key={`${i}-${roll.value}-${roll.type}`} 
              data={roll} 
              {...physicsProps[i]}
              delay={i * 200} // Stagger dice drops
              index={i}
              onSettle={() => setSettledCount(prev => prev + 1)}
              soundEnabled={soundEnabled}
            />
          ))}
        </Physics>
        
        <Environment preset="city" />
      </Canvas>

      <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
          {settledCount === rolls.length ? (
             <div className="inline-block px-4 py-2 bg-black/60 backdrop-blur border border-amber-500/30 rounded-lg animate-fade-in text-amber-100 font-display text-sm tracking-wider shadow-lg">
                 Result: <span className="text-amber-400 font-bold text-lg">{rolls.reduce((a, b) => a + b.value, 0)}</span>
             </div>
          ) : (
             <div className="text-amber-500/50 font-display text-xs uppercase tracking-[0.5em] animate-pulse">Rolling Fate...</div>
          )}
      </div>
    </div>
  );
};

export default DiceAnimation;
