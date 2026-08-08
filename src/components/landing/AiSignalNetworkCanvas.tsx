import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const AiSignalNetworkCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    // Check WebGL availability safely
    const checkWebGL = (): boolean => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebGlSupported(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    let observer: IntersectionObserver | null = null;

    try {
      // 1. Scene & Camera Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 30);

      // 2. Renderer Setup with DPR capping
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // 3. Central AI Core Setup
      const aiCoreGroup = new THREE.Group();

      const coreGeo = new THREE.IcosahedronGeometry(2.8, 2);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x10b981, // Emerald 500
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      aiCoreGroup.add(coreMesh);

      const innerCoreGeo = new THREE.IcosahedronGeometry(1.6, 1);
      const innerCoreMat = new THREE.MeshBasicMaterial({
        color: 0x059669, // Emerald 600
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
      aiCoreGroup.add(innerCoreMesh);

      const centerPointGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const centerPointMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.8,
      });
      const centerPoint = new THREE.Mesh(centerPointGeo, centerPointMat);
      aiCoreGroup.add(centerPoint);

      aiCoreGroup.position.set(6, 1, 0);
      scene.add(aiCoreGroup);

      // 4. Lead Nodes Setup
      const isMobile = window.innerWidth < 768;
      const nodeCount = isMobile ? 35 : 85;

      const nodes: {
        position: THREE.Vector3;
        velocity: THREE.Vector3;
        mesh: THREE.Mesh;
        isConversionNode: boolean;
      }[] = [];

      const nodeGroup = new THREE.Group();
      scene.add(nodeGroup);

      const leadNodeGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const leadNodeMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.7,
      });

      const conversionNodeMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.9,
      });

      for (let i = 0; i < nodeCount; i++) {
        const isConversionNode = i % 7 === 0;
        const mesh = new THREE.Mesh(
          leadNodeGeo,
          isConversionNode ? conversionNodeMat : leadNodeMat
        );

        const radius = 12 + Math.random() * 16;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.8;

        const x = Math.sin(theta) * Math.cos(phi) * radius;
        const y = Math.sin(phi) * radius * 0.7;
        const z = (Math.random() - 0.5) * 12;

        mesh.position.set(x, y, z);
        nodeGroup.add(mesh);

        nodes.push({
          position: mesh.position,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.006,
            (Math.random() - 0.5) * 0.006,
            (Math.random() - 0.5) * 0.003
          ),
          mesh,
          isConversionNode,
        });
      }

      // 5. Connection Lines
      const maxConnections = isMobile ? 40 : 110;
      const linePositions = new Float32Array(maxConnections * 2 * 3);
      const lineColors = new Float32Array(maxConnections * 2 * 3);

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3)
      );
      lineGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(lineColors, 3)
      );

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });

      const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(linesMesh);

      // 6. Traveling Signals
      const signalCount = isMobile ? 12 : 28;
      const signals: {
        mesh: THREE.Mesh;
        startNodeIdx: number;
        endNodeIdx: number;
        progress: number;
        speed: number;
      }[] = [];

      const signalGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const signalMat = new THREE.MeshBasicMaterial({
        color: 0x6ee7b7,
        transparent: true,
        opacity: 0.95,
      });

      for (let s = 0; s < signalCount; s++) {
        const signalMesh = new THREE.Mesh(signalGeo, signalMat);
        scene.add(signalMesh);

        const startIdx = Math.floor(Math.random() * nodes.length);
        let endIdx = Math.floor(Math.random() * nodes.length);
        while (endIdx === startIdx) {
          endIdx = Math.floor(Math.random() * nodes.length);
        }

        signals.push({
          mesh: signalMesh,
          startNodeIdx: startIdx,
          endNodeIdx: endIdx,
          progress: Math.random(),
          speed: 0.004 + Math.random() * 0.008,
        });
      }

      // 7. Mouse Parallax
      let targetMouseX = 0;
      let targetMouseY = 0;
      let currentMouseX = 0;
      let currentMouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // 8. Resize Handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      };

      window.addEventListener('resize', handleResize);

      // 9. Intersection Observer
      let isVisible = true;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(container);

      // 10. Animation Loop
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (!isVisible) return;

        const elapsedTime = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          currentMouseX += (targetMouseX - currentMouseX) * 0.04;
          currentMouseY += (targetMouseY - currentMouseY) * 0.04;
          camera.position.x = currentMouseX;
          camera.position.y = -currentMouseY;
          camera.lookAt(0, 0, 0);

          aiCoreGroup.rotation.y = elapsedTime * 0.12;
          aiCoreGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.08;
          const scalePulse = 1 + Math.sin(elapsedTime * 1.8) * 0.04;
          aiCoreGroup.scale.set(scalePulse, scalePulse, scalePulse);

          nodes.forEach((n) => {
            n.position.add(n.velocity);
            if (Math.abs(n.position.x) > 18) n.velocity.x *= -1;
            if (Math.abs(n.position.y) > 12) n.velocity.y *= -1;
            if (Math.abs(n.position.z) > 10) n.velocity.z *= -1;
          });

          let pairIdx = 0;
          const posAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
          const colAttr = lineGeometry.attributes.color as THREE.BufferAttribute;

          const emeraldR = 0.06;
          const emeraldG = 0.72;
          const emeraldB = 0.5;

          for (let i = 0; i < nodes.length && pairIdx < maxConnections; i++) {
            for (let j = i + 1; j < nodes.length && pairIdx < maxConnections; j++) {
              const dist = nodes[i].position.distanceTo(nodes[j].position);
              if (dist < 7.5) {
                const baseIdx = pairIdx * 6;

                linePositions[baseIdx] = nodes[i].position.x;
                linePositions[baseIdx + 1] = nodes[i].position.y;
                linePositions[baseIdx + 2] = nodes[i].position.z;

                linePositions[baseIdx + 3] = nodes[j].position.x;
                linePositions[baseIdx + 4] = nodes[j].position.y;
                linePositions[baseIdx + 5] = nodes[j].position.z;

                const alpha = (1 - dist / 7.5) * 0.45;
                lineColors[baseIdx] = emeraldR * alpha;
                lineColors[baseIdx + 1] = emeraldG * alpha;
                lineColors[baseIdx + 2] = emeraldB * alpha;

                lineColors[baseIdx + 3] = emeraldR * alpha;
                lineColors[baseIdx + 4] = emeraldG * alpha;
                lineColors[baseIdx + 5] = emeraldB * alpha;

                pairIdx++;
              }
            }
          }

          for (let p = pairIdx * 6; p < linePositions.length; p++) {
            linePositions[p] = 0;
            lineColors[p] = 0;
          }

          posAttr.needsUpdate = true;
          colAttr.needsUpdate = true;

          signals.forEach((sig) => {
            sig.progress += sig.speed;
            if (sig.progress >= 1) {
              sig.progress = 0;
              sig.startNodeIdx = Math.floor(Math.random() * nodes.length);
              sig.endNodeIdx = Math.floor(Math.random() * nodes.length);
            }

            const pStart = nodes[sig.startNodeIdx].position;
            const pEnd = nodes[sig.endNodeIdx].position;
            sig.mesh.position.lerpVectors(pStart, pEnd, sig.progress);
          });
        }

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (observer) observer.disconnect();

        coreGeo.dispose();
        coreMat.dispose();
        innerCoreGeo.dispose();
        innerCoreMat.dispose();
        centerPointGeo.dispose();
        centerPointMat.dispose();
        leadNodeGeo.dispose();
        leadNodeMat.dispose();
        conversionNodeMat.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        signalGeo.dispose();
        signalMat.dispose();
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.error('Three.js setup encountered an error:', err);
      setWebGlSupported(false);
    }
  }, []);

  // WebGL Fallback Ambient Background
  if (!webGlSupported) {
    return (
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none opacity-85 transition-opacity duration-1000"
      />
    </div>
  );
};
