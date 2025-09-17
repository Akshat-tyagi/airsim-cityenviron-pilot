import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Camera, Square } from "lucide-react";

interface DetectedObject {
  id: string;
  type: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  color: string;
}

const CameraFeed = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [frameCount, setFrameCount] = useState(0);

  // Simulate camera feed and object detection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 450;

    const animateFrame = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simulate city environment
      drawCityscape(ctx, canvas.width, canvas.height);
      
      // Add scan line effect
      const scanY = (frameCount * 3) % canvas.height;
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      setFrameCount(prev => prev + 1);
    };

    const interval = setInterval(animateFrame, 50);

    // Simulate object detection updates
    const detectionInterval = setInterval(() => {
      const objects: DetectedObject[] = [
        {
          id: '1',
          type: 'car',
          confidence: 0.89,
          bbox: { x: 150, y: 200, width: 120, height: 60 },
          color: '#00ff00'
        },
        {
          id: '2',
          type: 'building',
          confidence: 0.95,
          bbox: { x: 300, y: 50, width: 200, height: 300 },
          color: '#0080ff'
        },
        {
          id: '3',
          type: 'pedestrian',
          confidence: 0.76,
          bbox: { x: 500, y: 250, width: 40, height: 80 },
          color: '#ffff00'
        },
        {
          id: '4',
          type: 'tree',
          confidence: 0.82,
          bbox: { x: 600, y: 180, width: 80, height: 120 },
          color: '#00ff80'
        }
      ];
      setDetectedObjects(objects);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(detectionInterval);
    };
  }, [frameCount]);

  // Draw object detection overlays
  useEffect(() => {
    if (!showOverlay) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    detectedObjects.forEach(obj => {
      // Draw bounding box
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.bbox.x, obj.bbox.y, obj.bbox.width, obj.bbox.height);
      
      // Draw label background
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.bbox.x, obj.bbox.y - 25, 120, 20);
      
      // Draw label text
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.fillText(
        `${obj.type} ${(obj.confidence * 100).toFixed(0)}%`,
        obj.bbox.x + 2,
        obj.bbox.y - 10
      );
    });
  }, [detectedObjects, showOverlay]);

  const drawCityscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // Buildings silhouettes
    const buildings = [
      { x: 50, y: height * 0.3, w: 80, h: height * 0.4 },
      { x: 150, y: height * 0.2, w: 100, h: height * 0.5 },
      { x: 280, y: height * 0.1, w: 120, h: height * 0.6 },
      { x: 420, y: height * 0.25, w: 90, h: height * 0.45 },
      { x: 530, y: height * 0.15, w: 110, h: height * 0.55 },
      { x: 660, y: height * 0.35, w: 70, h: height * 0.35 },
    ];

    buildings.forEach(building => {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(building.x, building.y, building.w, building.h);
      
      // Windows
      ctx.fillStyle = '#ffff80';
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
          if (Math.random() > 0.3) {
            ctx.fillRect(
              building.x + 10 + i * 25,
              building.y + 20 + j * 20,
              8,
              8
            );
          }
        }
      }
    });

    // Add some atmospheric effects
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.fillRect(0, 0, width, height);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Camera Controls Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-hud-primary" />
            <span className="font-mono text-sm">FPV CAMERA</span>
            <Badge variant="secondary" className="bg-hud-primary/20 text-hud-primary">
              LIVE
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            30 FPS • 1920x1080 • H.264
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showOverlay ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOverlay(!showOverlay)}
            className="bg-hud-primary/20 hover:bg-hud-primary/30"
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Detection
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            className={isRecording ? "animate-pulse-glow" : ""}
          >
            <Square className="w-4 h-4" />
            {isRecording ? "Stop" : "Record"}
          </Button>
        </div>
      </div>

      {/* Camera Display */}
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden border border-hud-primary/30">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-2 border-hud-primary opacity-60">
              <div className="absolute top-1/2 left-1/2 w-2 h-2 transform -translate-x-1/2 -translate-y-1/2 bg-hud-primary"></div>
            </div>
          </div>
          
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-hud-primary opacity-60"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-hud-primary opacity-60"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-hud-primary opacity-60"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-hud-primary opacity-60"></div>
        </div>

        {/* Detection Info */}
        {showOverlay && detectedObjects.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-black/80 rounded p-2 text-xs font-mono">
            <div className="text-hud-primary mb-1">DETECTED OBJECTS:</div>
            {detectedObjects.map(obj => (
              <div key={obj.id} className="flex items-center space-x-2 text-white">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: obj.color }}
                ></div>
                <span>{obj.type.toUpperCase()}</span>
                <span className="text-muted-foreground">
                  {(obj.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraFeed;