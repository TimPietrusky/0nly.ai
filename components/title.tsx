"use client";

import { useEffect, useRef } from "react";

interface FlowLine {
  x: number;
  y: number;
  initialAngle: number;
  currentAngle: number;
  targetAngle: number;
  length: number;
  phase: number;
}

export function Title() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let flowLines: FlowLine[] = [];
    let animationFrameId: number;
    let mousePosition = { x: 0, y: 0 };
    let time = 0;

    const lineLength = 9;
    const strokeWidth = 2.2;
    const density = 5;
    const opacity = 0.35;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.3;
    };

    const initializeFlowField = () => {
      const cellSize = density;
      const zoomFactor = 0.005;
      flowLines = [];

      for (let y = 0; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
          const zoomedX = x * zoomFactor;
          const zoomedY = y * zoomFactor;

          const angle =
            Math.sin(zoomedX) * Math.cos(zoomedY) * Math.PI +
            Math.sin(zoomedX * 0.7) * Math.cos(zoomedY * 1.3) * Math.PI * 0.5 +
            Math.sin(zoomedX * 1.3) * Math.cos(zoomedY * 0.7) * Math.PI * 0.3;

          const length =
            (Math.sin(zoomedX * 0.8) * Math.cos(zoomedY * 1.2) + 2) *
            lineLength;

          flowLines.push({
            x,
            y,
            initialAngle: angle,
            currentAngle: angle,
            targetAngle: angle,
            length,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const drawFlowField = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      flowLines.forEach((line) => {
        const dx = mousePosition.x - line.x;
        const dy = mousePosition.y - line.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const gravityRadius = 100;
        const maxAngleChange = Math.PI / 2;

        if (distance < gravityRadius) {
          line.targetAngle = Math.atan2(dy, dx);
          const angleChange = Math.min(
            maxAngleChange,
            ((gravityRadius - distance) / gravityRadius) * maxAngleChange
          );
          line.currentAngle +=
            (line.targetAngle - line.currentAngle) * angleChange * 0.2;
        } else {
          line.targetAngle = line.initialAngle;
          line.currentAngle += (line.targetAngle - line.currentAngle) * 0.1;
        }

        // Subtle animation
        const animationAmplitude = 0.05;
        const animationFrequency = 0.001;
        line.currentAngle +=
          Math.sin(time * animationFrequency + line.phase) * animationAmplitude;

        const lineOpacity =
          opacity * (0.5 + Math.sin(time * 0.01 + line.phase) * 0.5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
        ctx.lineWidth =
          strokeWidth * (0.8 + Math.sin(time * 0.02 + line.phase) * 0.2);

        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(
          line.x + Math.cos(line.currentAngle) * line.length,
          line.y + Math.sin(line.currentAngle) * line.length
        );
        ctx.stroke();
      });
    };

    const drawText = () => {
      const text = "0NLY.AI";
      const fontSize = Math.min(canvas.width * 0.15, canvas.height * 0.8);
      ctx.font = `100 ${fontSize}px "Roboto Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textWidth = ctx.measureText(text).width;
      const scale = Math.min(canvas.width / textWidth, 1);

      ctx.save();
      ctx.scale(scale, 1);

      // Draw black background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height);

      // Draw flow field
      drawFlowField();

      // Create a clipping region with the text
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "white";
      ctx.fillText(text, canvas.width / 2 / scale, canvas.height / 2);

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";

      // Draw glowing effect
      const glowColor = `rgba(255, 255, 255, ${
        0.1 + Math.sin(time * 0.002) * 0.05
      })`;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10 + Math.sin(time * 0.003) * 5;
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillText(text, canvas.width / 2 / scale, canvas.height / 2);

      ctx.restore();
    };

    const animate = () => {
      time += 1;
      drawText();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      updateCanvasSize();
      initializeFlowField();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    // Load Roboto Mono Thin 100 font
    const fontFace = new FontFace(
      "Roboto Mono",
      "url(https://fonts.gstatic.com/s/robotomono/v22/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.woff2)",
      { weight: "100" }
    );

    fontFace
      .load()
      .then((font) => {
        document.fonts.add(font);
        updateCanvasSize();
        initializeFlowField();
        animate();
      })
      .catch((error) => {
        console.error("Font loading failed:", error);
      });

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-[30%] flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
