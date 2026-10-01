import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Crosshair,
  Compass,
  Eye,
  Activity,
} from 'lucide-react';
import { LOCOMOTION_STAGES, TRUNK_SEGMENTS, LocomotionStagePreset } from '../data/scolopendraData';

type RenderLayerMode = 'natural' | 'kinematic' | 'footfalls';

interface SegmentNode {
  x: number;
  y: number;
  angle: number;
}

interface FootfallTrace {
  x: number;
  y: number;
  age: number;
  side: 'L' | 'R';
  segment: number;
}

interface LeafElement {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  tone: string;
  veinAngle: number;
}

const STATIC_LEAVES: LeafElement[] = [
  { x: 140, y: 110, rx: 46, ry: 22, rotation: 0.45, tone: '#14261C', veinAngle: 0.2 },
  { x: 640, y: 95, rx: 54, ry: 25, rotation: -0.6, tone: '#182C20', veinAngle: -0.3 },
  { x: 720, y: 360, rx: 48, ry: 24, rotation: 1.1, tone: '#122219', veinAngle: 0.5 },
  { x: 210, y: 390, rx: 58, ry: 26, rotation: -0.25, tone: '#16291E', veinAngle: -0.1 },
  { x: 460, y: 240, rx: 42, ry: 19, rotation: 0.85, tone: '#13241A', veinAngle: 0.4 },
  { x: 830, y: 190, rx: 50, ry: 23, rotation: -0.9, tone: '#172A1F', veinAngle: -0.2 },
];

export const LocomotionSandbox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation controls state
  const [activeStageId, setActiveStageId] = useState<string>('stage-2');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [velocityCmPerSec, setVelocityCmPerSec] = useState<number>(15.0);
  const [phaseLagDeg, setPhaseLagDeg] = useState<number>(36);
  const [undulationPct, setUndulationPct] = useState<number>(45);
  const [renderMode, setRenderMode] = useState<RenderLayerMode>('natural');
  const [guidanceMode, setGuidanceMode] = useState<'autonomous' | 'waypoint'>('autonomous');
  const [strikePulse, setStrikePulse] = useState<number>(0);
  const [selectedSegmentInspect, setSelectedSegmentInspect] = useState<number>(8);

  // Live phase array for the 20 walking segment pairs (updated at 15fps for React UI strip)
  const [livePhases, setLivePhases] = useState<number[]>(() =>
    Array.from({ length: 20 }, (_, i) => i * 0.6)
  );

  // Mutable simulation state inside ref for 60fps loop
  const simRef = useRef<{
    time: number;
    segments: SegmentNode[];
    targetX: number;
    targetY: number;
    waypointActive: boolean;
    footfalls: FootfallTrace[];
    strikeTimer: number;
  }>({
    time: 0,
    segments: Array.from({ length: 21 }, (_, i) => ({
      x: 480 - i * 18,
      y: 250,
      angle: 0,
    })),
    targetX: 680,
    targetY: 220,
    waypointActive: false,
    footfalls: [],
    strikeTimer: 0,
  });

  // Apply preset stage
  const handleSelectStage = (preset: LocomotionStagePreset) => {
    setActiveStageId(preset.id);
    setVelocityCmPerSec(preset.velocityCmPerSec);
    setPhaseLagDeg(preset.phaseLagDeg);
    setUndulationPct(preset.undulationPct);
  };

  // Trigger a manual predatory forcipule strike animation
  const handleTriggerStrike = () => {
    simRef.current.strikeTimer = 1.0;
    setStrikePulse((p) => p + 1);
  };

  // Reset centipede position
  const handleReset = useCallback(() => {
    simRef.current.time = 0;
    simRef.current.footfalls = [];
    simRef.current.segments = Array.from({ length: 21 }, (_, i) => ({
      x: 480 - i * 18,
      y: 250,
      angle: 0,
    }));
    simRef.current.targetX = 700;
    simRef.current.targetY = 250;
  }, []);

  // Step forward 1 frame when paused
  const handleStepFrame = () => {
    setIsPlaying(false);
    simRef.current.time += 0.045;
  };

  // Handle canvas click/drag to set prey vibration waypoint
  const handleCanvasPointer = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    simRef.current.targetX = Math.max(60, Math.min(canvas.width - 60, x));
    simRef.current.targetY = Math.max(60, Math.min(canvas.height - 60, y));
    simRef.current.waypointActive = true;
    setGuidanceMode('waypoint');
  };

  // Derived biomechanical metrics
  const strideFrequencyHz = Number((0.9 + (velocityCmPerSec / 28) * 5.6).toFixed(1));
  const dutyFactorPct = Math.round(76 - (velocityCmPerSec / 28) * 44);
  const wavelengthSegments = Number((360 / phaseLagDeg).toFixed(1));
  const groundedPairsCount = livePhases.filter(
    (phi) => Math.sin(phi) > Math.cos((dutyFactorPct / 100) * Math.PI)
  ).length;

  useEffect(() => {
    let animationFrameId: number;
    let lastUiUpdate = 0;

    const renderFrame = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const sim = simRef.current;

      const dt = isPlaying ? 0.016 : 0;
      sim.time += dt * (velocityCmPerSec / 12);

      if (sim.strikeTimer > 0) {
        sim.strikeTimer = Math.max(0, sim.strikeTimer - 0.035);
      }

      // Update autonomous target or waypoint target
      const head = sim.segments[0];
      if (guidanceMode === 'autonomous') {
        // Smooth Lissajous patrol across the Sinharaja forest floor stage
        const patrolT = sim.time * 0.42;
        sim.targetX = width * 0.5 + Math.cos(patrolT) * (width * 0.34);
        sim.targetY = height * 0.5 + Math.sin(patrolT * 1.7) * (height * 0.28);
      } else {
        const distToTarget = Math.hypot(sim.targetX - head.x, sim.targetY - head.y);
        if (distToTarget < 34 && sim.waypointActive) {
          // Reached prey vibration target -> trigger forcipule strike!
          sim.strikeTimer = 1.0;
          sim.waypointActive = false;
        }
      }

      // Move head toward target with axial undulation S-wave
      if (dt > 0 || !isPlaying) {
        const dx = sim.targetX - head.x;
        const dy = sim.targetY - head.y;
        const desiredAngle = Math.atan2(dy, dx);

        // Shortest angular difference
        let angleDiff = desiredAngle - head.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const turnRate = 0.085 * (velocityCmPerSec / 14);
        const undulationRad =
          (undulationPct / 100) * 0.38 * Math.sin(sim.time * 4.8);

        if (isPlaying) {
          head.angle += angleDiff * Math.min(1, turnRate) + undulationRad * 0.14;
          const speedPx = (velocityCmPerSec / 15) * 2.85;
          head.x += Math.cos(head.angle) * speedPx;
          head.y += Math.sin(head.angle) * speedPx;

          // Keep softly inside arena bounds
          if (head.x < 45) head.x = 45;
          if (head.x > width - 45) head.x = width - 45;
          if (head.y < 45) head.y = 45;
          if (head.y > height - 45) head.y = height - 45;
        }

        // Inverse kinematics / follow-the-leader chain for segments 1..20
        const phaseLagRad = (phaseLagDeg * Math.PI) / 180;
        for (let i = 1; i < sim.segments.length; i++) {
          const prev = sim.segments[i - 1];
          const curr = sim.segments[i];
          const segSpacing = i === 1 ? 14 : i === 20 ? 15 : 17.5;

          const sdx = prev.x - curr.x;
          const sdy = prev.y - curr.y;
          let segAngle = Math.atan2(sdy, sdx);

          // Add traveling axial body wave along trunk
          const axialWave =
            (undulationPct / 100) *
            0.16 *
            Math.sin(sim.time * 4.8 - i * phaseLagRad * 0.65);

          curr.angle = segAngle + axialWave * 0.25;
          curr.x = prev.x - Math.cos(curr.angle) * segSpacing;
          curr.y = prev.y - Math.sin(curr.angle) * segSpacing;
        }
      }

      // Age and prune footfalls
      if (isPlaying) {
        for (let i = sim.footfalls.length - 1; i >= 0; i--) {
          sim.footfalls[i].age += 0.016;
          if (sim.footfalls[i].age > 2.4) {
            sim.footfalls.splice(i, 1);
          }
        }
      }

      // ================= DRAWING THE SINHARAJA FOREST FLOOR STAGE =================
      ctx.clearRect(0, 0, width, height);

      // Deep damp humus & rainforest floor gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        40,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      bgGrad.addColorStop(0, '#101D16');
      bgGrad.addColorStop(0.6, '#0B1410');
      bgGrad.addColorStop(1, '#070D0A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle scientific coordinate grid (30px intervals)
      ctx.strokeStyle = 'rgba(214, 206, 190, 0.045)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Render fallen dipterocarp leaves on the forest floor (in natural mode)
      if (renderMode === 'natural') {
        STATIC_LEAVES.forEach((leaf) => {
          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation);
          ctx.fillStyle = leaf.tone;
          ctx.strokeStyle = 'rgba(180, 195, 160, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.rx, leaf.ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Central leaf midrib vein
          ctx.beginPath();
          ctx.moveTo(-leaf.rx * 0.85, 0);
          ctx.lineTo(leaf.rx * 0.85, 0);
          ctx.strokeStyle = 'rgba(180, 195, 160, 0.09)';
          ctx.stroke();
          ctx.restore();
        });
      }

      // Draw target / prey bio-vibration rings
      ctx.save();
      const pulseRadius = 10 + ((sim.time * 18) % 28);
      ctx.strokeStyle =
        guidanceMode === 'waypoint'
          ? 'rgba(217, 78, 31, 0.55)'
          : 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sim.targetX, sim.targetY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle =
        guidanceMode === 'waypoint' ? '#D94E1F' : 'rgba(56, 189, 248, 0.65)';
      ctx.beginPath();
      ctx.arc(sim.targetX, sim.targetY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw footfall pivot traces if enabled or subtle in kinematic mode
      if (renderMode === 'footfalls' || renderMode === 'kinematic') {
        sim.footfalls.forEach((fp) => {
          const alpha = Math.max(0, 1 - fp.age / 2.4);
          ctx.fillStyle =
            fp.side === 'L'
              ? `rgba(217, 78, 31, ${alpha * 0.65})`
              : `rgba(56, 189, 248, ${alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(fp.x, fp.y, renderMode === 'footfalls' ? 3.2 : 2.0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ================= DRAW 20 PAIRS OF WALKING LEGS + METACHRONAL WAVE =================
      const phaseLagRad = (phaseLagDeg * Math.PI) / 180;
      const dutyThreshold = Math.cos((dutyFactorPct / 100) * Math.PI);
      const currentPhases: number[] = [];

      for (let i = 0; i < 20; i++) {
        const seg = sim.segments[i];
        const phiLeft = sim.time * 6.5 - i * phaseLagRad;
        // Antiphase or slight lag on contralateral right leg during fast undulation
        const phiRight = phiLeft + Math.PI * (0.85 + 0.15 * (undulationPct / 100));
        currentPhases.push(phiLeft);

        const drawLeg = (side: 'L' | 'R', phi: number) => {
          const dir = side === 'L' ? -1 : 1;
          const normalAngle = seg.angle + dir * (Math.PI / 2);

          // Swing vs stance phase
          const stanceSignal = Math.sin(phi);
          const isGrounded = stanceSignal > dutyThreshold;
          const swingOffset = Math.cos(phi) * 0.48; // sweeps forward/backward

          const legAngle = normalAngle + dir * swingOffset;
          const coxaLen = 8;
          const femurLen = 14;
          const tarsusLen = 13 + (isGrounded ? 2 : -1);

          const coxaX = seg.x + Math.cos(normalAngle) * coxaLen;
          const coxaY = seg.y + Math.sin(normalAngle) * coxaLen;

          const kneeX = coxaX + Math.cos(legAngle) * femurLen;
          const kneeY = coxaY + Math.sin(legAngle) * femurLen;

          const tipAngle = legAngle - dir * 0.28;
          const tipX = kneeX + Math.cos(tipAngle) * tarsusLen;
          const tipY = kneeY + Math.sin(tipAngle) * tarsusLen;

          // Record footfall pivot trace at moment of touchdown
          if (
            isPlaying &&
            Math.abs(stanceSignal - dutyThreshold) < 0.08 &&
            sim.footfalls.length < 180
          ) {
            sim.footfalls.push({ x: tipX, y: tipY, age: 0, side, segment: i + 1 });
          }

          ctx.save();
          if (renderMode === 'kinematic') {
            ctx.strokeStyle = isGrounded ? '#10B981' : '#64748B';
            ctx.lineWidth = isGrounded ? 2.2 : 1.2;
          } else {
            // Vivid orange-amber articulated legs with dark band near tarsal tip
            ctx.strokeStyle = isGrounded ? '#EA580C' : 'rgba(234, 88, 12, 0.62)';
            ctx.lineWidth = isGrounded ? 2.6 : 1.8;
          }

          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(coxaX, coxaY);
          ctx.lineTo(kneeX, kneeY);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          // Dark blue-black tibial/tarsal ring characteristic of S. hardwickei legs
          if (renderMode === 'natural') {
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(
              kneeX + (tipX - kneeX) * 0.45,
              kneeY + (tipY - kneeY) * 0.45
            );
            ctx.lineTo(
              kneeX + (tipX - kneeX) * 0.8,
              kneeY + (tipY - kneeY) * 0.8
            );
            ctx.stroke();
          }

          // Ground contact anchor indicator in kinematic/footfalls mode
          if (isGrounded && (renderMode === 'kinematic' || renderMode === 'footfalls')) {
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        };

        drawLeg('L', phiLeft);
        drawLeg('R', phiRight);
      }

      // ================= DRAW ULTIMATE SENSORY LEGS (SEGMENT 21) =================
      const tailSeg = sim.segments[20];
      [-1, 1].forEach((dir) => {
        const spread = 0.42 + 0.08 * Math.sin(sim.time * 3.2 * dir);
        const baseAngle = tailSeg.angle + Math.PI + dir * spread;
        const midX = tailSeg.x + Math.cos(baseAngle) * 20;
        const midY = tailSeg.y + Math.sin(baseAngle) * 20;
        const endAngle = baseAngle - dir * 0.24;
        const endX = midX + Math.cos(endAngle) * 19;
        const endY = midY + Math.sin(endAngle) * 19;

        ctx.save();
        ctx.strokeStyle = '#D94E1F';
        ctx.lineWidth = 3.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailSeg.x, tailSeg.y);
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
      });

      // ================= DRAW 21 ARMORED TERGITE PLATES (TAIL TO HEAD) =================
      for (let i = sim.segments.length - 1; i >= 0; i--) {
        const seg = sim.segments[i];
        const spec = TRUNK_SEGMENTS[i];
        const halfW = spec.widthMm * 1.15;
        const halfL = spec.lengthMm * 1.45;

        ctx.save();
        ctx.translate(seg.x, seg.y);
        ctx.rotate(seg.angle);

        if (renderMode === 'kinematic') {
          ctx.strokeStyle = spec.tergiteColor === 'orange' ? '#F97316' : '#38BDF8';
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.lineWidth = selectedSegmentInspect === i + 1 ? 2.5 : 1.2;
          ctx.beginPath();
          ctx.roundRect(-halfL, -halfW, halfL * 2, halfW * 2, 4);
          ctx.fill();
          ctx.stroke();
        } else {
          // Authentic Scolopendra hardwickei glossy armor plate
          const isOrange = spec.tergiteColor === 'orange';
          const plateGrad = ctx.createLinearGradient(0, -halfW, 0, halfW);
          if (isOrange) {
            plateGrad.addColorStop(0, '#B83710');
            plateGrad.addColorStop(0.35, '#EA580C');
            plateGrad.addColorStop(0.5, '#FB923C');
            plateGrad.addColorStop(0.7, '#D94E1F');
            plateGrad.addColorStop(1, '#7C2D12');
          } else {
            plateGrad.addColorStop(0, '#020617');
            plateGrad.addColorStop(0.35, '#0F172A');
            plateGrad.addColorStop(0.5, '#1E293B');
            plateGrad.addColorStop(0.75, '#090D16');
            plateGrad.addColorStop(1, '#020617');
          }

          ctx.fillStyle = plateGrad;
          ctx.strokeStyle = isOrange
            ? 'rgba(255, 237, 213, 0.25)'
            : 'rgba(148, 163, 184, 0.22)';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.roundRect(-halfL, -halfW, halfL * 2, halfW * 2, 4.5);
          ctx.fill();
          ctx.stroke();

          // Highlight ring if inspected
          if (selectedSegmentInspect === i + 1) {
            ctx.strokeStyle = '#FDE047';
            ctx.lineWidth = 2;
            ctx.strokeRect(-halfL - 2, -halfW - 2, halfL * 2 + 4, halfW * 2 + 4);
          }
        }
        ctx.restore();
      }

      // ================= DRAW CEPHALIC CAPSULE, ANTENNAE & FORCIPULES =================
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(head.angle);

      // 17-jointed sweeping antennae
      [-1, 1].forEach((dir) => {
        const sweep = 0.52 + 0.18 * Math.sin(sim.time * 8.5 + dir);
        const antAngle = dir * sweep;
        const midX = 12 + Math.cos(antAngle) * 24;
        const midY = dir * 5 + Math.sin(antAngle) * 24;
        const tipX = midX + Math.cos(antAngle * 1.25) * 22;
        const tipY = midY + Math.sin(antAngle * 1.25) * 22;

        ctx.strokeStyle = '#FB923C';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(8, dir * 5);
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();
      });

      // Venomous Forcipules (Maxillipeds) extending when striking or probing
      const strikeReach = sim.strikeTimer > 0 ? Math.sin(sim.strikeTimer * Math.PI) * 12 : 0;
      [-1, 1].forEach((dir) => {
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(4, dir * 9);
        ctx.quadraticCurveTo(
          16 + strikeReach,
          dir * (14 - strikeReach * 0.35),
          20 + strikeReach,
          dir * (4 - strikeReach * 0.25)
        );
        ctx.stroke();
      });

      // Cephalic Shield
      ctx.fillStyle = '#D94E1F';
      ctx.strokeStyle = '#FED7AA';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(4, 0, 11, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4+4 Ocelli cluster
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(10, -5.5, 1.6, 0, Math.PI * 2);
      ctx.arc(10, 5.5, 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Update React state strip at ~12Hz to avoid layout thrashing
      if (timestamp - lastUiUpdate > 80) {
        setLivePhases(currentPhases);
        lastUiUpdate = timestamp;
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    animationFrameId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isPlaying,
    velocityCmPerSec,
    phaseLagDeg,
    undulationPct,
    renderMode,
    guidanceMode,
    dutyFactorPct,
    selectedSegmentInspect,
  ]);

  const currentStage =
    LOCOMOTION_STAGES.find((s) => s.id === activeStageId) || LOCOMOTION_STAGES[1];
  const inspectedSpec = TRUNK_SEGMENTS[selectedSegmentInspect - 1];

  return (
    <section
      id="locomotion-lab"
      className="max-w-[1360px] mx-auto px-6 py-16 border-b border-[#E4DFD5]"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C] mb-2">
            <span>01. Biomechanical Sandbox</span>
            <span aria-hidden="true">·</span>
            <span>Metachronal Gait Kinematics</span>
            <span aria-hidden="true">·</span>
            <span>21 Metameric Segments</span>
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1C1917] tracking-tight text-balance">
            The Wave of Motion: Axial-Appendicular Locomotion Simulator
          </h2>
        </div>

        {/* Guided Learning Stage Switcher */}
        <div
          role="group"
          aria-label="Guided locomotion stages"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EBE6DF] rounded-lg border border-[#DCD5C9]"
        >
          {LOCOMOTION_STAGES.map((stage, idx) => {
            const isActive = activeStageId === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleSelectStage(stage)}
                className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                    : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#FBF9F5]/50'
                }`}
              >
                Stage {idx + 1}: {stage.title.split(' ')[0]} {stage.title.split(' ')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: 65% Interactive Canvas Stage (Left) + 35% Control & Concept Deck (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT ZONE: Interactive Stage (8 cols on 12-col grid = 66.6%) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="relative rounded-xl overflow-hidden border border-[#292524] bg-[#0B1410] shadow-sm">
            {/* Top Stage Overlay Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0F172A]/90 border-b border-white/10 text-xs text-stone-300">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-amber-400 tabular-nums">
                  {guidanceMode === 'waypoint'
                    ? '● BIO-VIBRATION WAYPOINT LOCK'
                    : '● AUTONOMOUS FOREST PROWL'}
                </span>
                <span aria-hidden="true" className="text-stone-600">
                  |
                </span>
                <span className="text-stone-300 hidden sm:inline">
                  Click anywhere on the Sinharaja forest floor to place a prey vibration target
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGuidanceMode('autonomous')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    guidanceMode === 'autonomous'
                      ? 'bg-[#D94E1F] text-white'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  <Compass className="w-3 h-3 inline mr-1" />
                  Auto Patrol
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuidanceMode('waypoint');
                    simRef.current.waypointActive = true;
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    guidanceMode === 'waypoint'
                      ? 'bg-[#D94E1F] text-white'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  <Crosshair className="w-3 h-3 inline mr-1" />
                  Cursor Target
                </button>
              </div>
            </div>

            {/* Interactive HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={920}
              height={480}
              onClick={handleCanvasPointer}
              className="w-full h-[360px] sm:h-[440px] block cursor-crosshair"
              aria-label="Interactive biomechanical simulation of Scolopendra hardwickei gliding across the Sinharaja forest floor"
            />

            {/* Bottom Stage Overlay Legend & Layer Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#090D16] border-t border-white/10 text-xs">
              <div className="flex items-center gap-4 text-stone-300 font-mono text-[11px] tabular-nums">
                <span>
                  Velocity: <strong className="text-white">{velocityCmPerSec.toFixed(1)} cm/s</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Wave λ: <strong className="text-white">{wavelengthSegments} segs</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Grounded Pairs: <strong className="text-emerald-400">{groundedPairsCount}/20</strong>
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(['natural', 'kinematic', 'footfalls'] as RenderLayerMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setRenderMode(mode)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      renderMode === mode
                        ? 'bg-stone-100 text-stone-900'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {mode === 'natural' && 'Chitin Armor'}
                    {mode === 'kinematic' && 'Kinematic Vectors'}
                    {mode === 'footfalls' && 'Footfall Trails'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Metachronal Phase Wave & Ground Contact Telemetry Strip */}
          <div className="p-5 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1917]">
                  Live Metachronal Wave Phase Profile (Segments 1 – 20 + Ultimate XXI)
                </h3>
                <p className="text-xs text-[#57534E]">
                  Click any segment bar below to highlight its tergite plate on the live specimen and inspect its morphometrics.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                <span className="text-[#059669] font-medium">● POWER STROKE (STANCE)</span>
                <span className="text-[#64748B]">▲ RECOVERY SWING</span>
              </div>
            </div>

            {/* 21 Segment Interactive Wave Bars */}
            <div className="grid grid-cols-21 gap-1 h-20 items-end pt-2 px-1 bg-[#EAE4D8] rounded-lg p-2 border border-[#DCD5C9]">
              {TRUNK_SEGMENTS.map((spec, idx) => {
                const isUltimate = idx === 20;
                const phi = livePhases[idx] ?? 0;
                const sinVal = isUltimate ? -0.8 : Math.sin(phi);
                const dutyThreshold = Math.cos((dutyFactorPct / 100) * Math.PI);
                const isGrounded = !isUltimate && sinVal > dutyThreshold;
                const heightPct = isUltimate
                  ? 35
                  : Math.round(((sinVal + 1) / 2) * 75 + 20);
                const isSelected = selectedSegmentInspect === spec.segmentNumber;

                return (
                  <button
                    key={spec.segmentNumber}
                    type="button"
                    onClick={() => setSelectedSegmentInspect(spec.segmentNumber)}
                    title={`Segment ${spec.segmentNumber}: ${spec.colorLabel}`}
                    className={`flex flex-col items-center justify-end h-full group cursor-pointer rounded px-0.5 transition-colors ${
                      isSelected ? 'bg-amber-200/70 ring-1 ring-[#D94E1F]' : 'hover:bg-white/50'
                    }`}
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-transform duration-75 ${
                        isUltimate
                          ? 'bg-[#D94E1F]'
                          : isGrounded
                          ? 'bg-[#059669]'
                          : 'bg-[#64748B]/60'
                      }`}
                    />
                    <span
                      className={`mt-1 font-mono text-[10px] tabular-nums leading-none ${
                        spec.tergiteColor === 'orange'
                          ? 'text-[#D94E1F] font-semibold'
                          : 'text-[#0F172A] font-semibold'
                      }`}
                    >
                      {spec.segmentNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Segment Micro-Readout */}
            <div className="mt-3 pt-3 border-t border-[#DFD8CA] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#1C1917] tabular-nums">
                  Segment #{inspectedSpec.segmentNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    inspectedSpec.tergiteColor === 'orange'
                      ? 'text-[#B83710] font-medium'
                      : 'text-[#0F172A] font-medium'
                  }
                >
                  {inspectedSpec.colorLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#57534E] tabular-nums">
                  {inspectedSpec.widthMm} mm W × {inspectedSpec.lengthMm} mm L
                </span>
                {inspectedSpec.hasSpiracle && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#0284C7] font-medium">
                      ● Cribriform Spiracle Present
                    </span>
                  </>
                )}
              </div>
              <span className="text-[#44403C]">{inspectedSpec.anatomicalRole}</span>
            </div>
          </div>
        </div>

        {/* RIGHT ZONE: Control & Concept Deck (4 cols on 12-col grid = 33.3%) */}
        <div className="lg:col-span-4 flex flex-col gap-6 p-6 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA]">
          {/* Playback & Action Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                Simulation Transport
              </span>
              <span className="font-mono text-xs text-[#059669] tabular-nums">
                {isPlaying ? '● LIVE 60 FPS' : '▲ PAUSED'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#292524] transition-colors whitespace-nowrap cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause Gait' : 'Resume Gait'}
              </button>
              <button
                type="button"
                onClick={handleStepFrame}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium bg-[#EBE6DF] text-[#1C1917] hover:bg-[#E2DBD0] border border-[#D6CEBE] transition-colors whitespace-nowrap cursor-pointer"
              >
                <StepForward className="w-3.5 h-3.5" />
                Step +15ms
              </button>
              <button
                type="button"
                onClick={handleTriggerStrike}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium bg-[#D94E1F] text-white hover:bg-[#B83710] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                Forcipule Strike {strikePulse > 0 ? `(${strikePulse})` : ''}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium bg-[#EBE6DF] text-[#1C1917] hover:bg-[#E2DBD0] border border-[#D6CEBE] transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Arena
              </button>
            </div>
          </div>

          <hr className="border-[#DFD8CA]" />

          {/* Parameter Sliders with Explicit Labels, Values & Units */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="slider-velocity" className="font-medium text-[#1C1917]">
                  Locomotion Velocity (v)
                </label>
                <span className="font-mono font-semibold text-[#D94E1F] tabular-nums">
                  {velocityCmPerSec.toFixed(1)} cm/s
                </span>
              </div>
              <input
                id="slider-velocity"
                type="range"
                min={4.0}
                max={28.0}
                step={0.5}
                value={velocityCmPerSec}
                onChange={(e) => setVelocityCmPerSec( parseFloat(e.target.value) )}
                className="w-full accent-[#D94E1F] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#78716C] mt-1 tabular-nums">
                <span>4.0 cm/s (Probing)</span>
                <span>16.0 cm/s</span>
                <span>28.0 cm/s (Sprint)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="slider-phaselag" className="font-medium text-[#1C1917]">
                  Metachronal Phase Lag (Δφ)
                </label>
                <span className="font-mono font-semibold text-[#1C1917] tabular-nums">
                  {phaseLagDeg}° / segment
                </span>
              </div>
              <input
                id="slider-phaselag"
                type="range"
                min={15}
                max={60}
                step={1}
                value={phaseLagDeg}
                onChange={(e) => setPhaseLagDeg(parseInt(e.target.value, 10))}
                className="w-full accent-[#D94E1F] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#78716C] mt-1 tabular-nums">
                <span>15° (Long Wave)</span>
                <span>36° (Nominal)</span>
                <span>60° (Tight Wave)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="slider-undulation" className="font-medium text-[#1C1917]">
                  Axial Body Undulation (A)
                </label>
                <span className="font-mono font-semibold text-[#1C1917] tabular-nums">
                  {undulationPct}% amplitude
                </span>
              </div>
              <input
                id="slider-undulation"
                type="range"
                min={0}
                max={100}
                step={1}
                value={undulationPct}
                onChange={(e) => setUndulationPct(parseInt(e.target.value, 10))}
                className="w-full accent-[#D94E1F] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#78716C] mt-1 tabular-nums">
                <span>0% (Rectilinear)</span>
                <span>50% (S-Wave)</span>
                <span>100% (Max Whip)</span>
              </div>
            </div>
          </div>

          <hr className="border-[#DFD8CA]" />

          {/* Active Stage Concept Annotation & Canonical Gait Formula */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
              {currentStage.stageLabel}
            </div>
            <p className="text-sm text-[#292524] leading-relaxed">
              {currentStage.annotation}
            </p>

            {/* Mathematical Formula Box */}
            <div className="p-3.5 rounded-lg bg-[#EBE6DF] border border-[#D6CEBE] font-mono text-xs text-[#1C1917] space-y-1.5">
              <div className="text-[11px] text-[#57534E]">
                Canonical Metachronal Oscillator:
              </div>
              <div className="text-sm font-medium tracking-tight">
                φᵢ(t) = 2π·({strideFrequencyHz} Hz)·t − i·({phaseLagDeg}°)
              </div>
              <div className="text-[11px] text-[#44403C] pt-1 border-t border-[#D6CEBE]">
                Duty Factor D = {dutyFactorPct}% · {currentStage.equationNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
