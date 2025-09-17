import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Navigation, 
  Route, 
  Target,
  Play,
  Square,
  RotateCcw
} from "lucide-react";

interface Coordinates {
  x: number;
  y: number;
  z: number;
}

interface Waypoint extends Coordinates {
  id: string;
  completed: boolean;
}

interface PathPlanningProps {
  onNavigate: (coords: Coordinates) => void;
}

const PathPlanning = ({ onNavigate }: PathPlanningProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<Coordinates>({ x: 0, y: 0, z: 10 });
  const [currentPosition, setCurrentPosition] = useState<Coordinates>({ x: 0, y: 0, z: 0 });
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [pathExists, setPathExists] = useState(false);
  const [plannedPath, setPlannedPath] = useState<Coordinates[]>([]);

  // Simulate current drone position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 0.1,
        y: prev.y + (Math.random() - 0.5) * 0.1,
        z: prev.z + (Math.random() - 0.5) * 0.05,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Draw the planning map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * canvas.width;
      const y = (i / 20) * canvas.height;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw obstacles (buildings)
    const obstacles = [
      { x: 100, y: 80, w: 60, h: 80 },
      { x: 220, y: 120, w: 80, h: 100 },
      { x: 50, y: 200, w: 70, h: 60 },
      { x: 300, y: 50, w: 50, h: 120 },
    ];

    obstacles.forEach(obs => {
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#ff8888';
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });

    // Draw planned path
    if (plannedPath.length > 0) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      plannedPath.forEach((point, index) => {
        const x = (point.x + 200) * 2; // Scale and offset for display
        const y = (point.y + 150) * 1;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current position
    const currentX = (currentPosition.x + 200) * 2;
    const currentY = (currentPosition.y + 150) * 1;
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw position ring
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 15, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw target position
    const targetX = (target.x + 200) * 2;
    const targetY = (target.y + 150) * 1;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw target crosshair
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetX - 15, targetY);
    ctx.lineTo(targetX + 15, targetY);
    ctx.moveTo(targetX, targetY - 15);
    ctx.lineTo(targetX, targetY + 15);
    ctx.stroke();

    // Draw waypoints
    waypoints.forEach((waypoint, index) => {
      const x = (waypoint.x + 200) * 2;
      const y = (waypoint.y + 150) * 1;
      
      ctx.fillStyle = waypoint.completed ? '#00ff00' : '#0080ff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw waypoint number
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText((index + 1).toString(), x + 8, y + 4);
    });

  }, [currentPosition, target, waypoints, plannedPath]);

  const handlePlanPath = async () => {
    setIsPlanning(true);
    
    // Simulate path planning algorithm (A* or RRT*)
    setTimeout(() => {
      // Generate a simple path with obstacle avoidance
      const path: Coordinates[] = [
        currentPosition,
        { x: currentPosition.x + 20, y: currentPosition.y + 10, z: target.z },
        { x: target.x - 15, y: target.y - 20, z: target.z },
        target
      ];
      
      setPlannedPath(path);
      setPathExists(true);
      setIsPlanning(false);
      
      // Generate waypoints
      const newWaypoints: Waypoint[] = path.slice(1).map((point, index) => ({
        ...point,
        id: `wp_${index}`,
        completed: false
      }));
      setWaypoints(newWaypoints);
    }, 2000);
  };

  const handleExecutePath = () => {
    if (plannedPath.length > 0) {
      onNavigate(target);
      
      // Simulate waypoint completion
      let completedCount = 0;
      const interval = setInterval(() => {
        setWaypoints(prev => {
          const updated = [...prev];
          if (completedCount < updated.length) {
            updated[completedCount].completed = true;
            completedCount++;
          } else {
            clearInterval(interval);
          }
          return updated;
        });
      }, 1500);
    }
  };

  const handleClearPath = () => {
    setPlannedPath([]);
    setWaypoints([]);
    setPathExists(false);
  };

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        
        {/* Controls Panel */}
        <div className="space-y-4">
          <Card className="p-4 bg-black/20 border-border/50">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-hud-accent" />
              <span className="font-mono text-sm">TARGET COORDINATES</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="target-x" className="text-xs text-muted-foreground">X (m)</Label>
                <Input
                  id="target-x"
                  type="number"
                  value={target.x}
                  onChange={(e) => setTarget(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label htmlFor="target-y" className="text-xs text-muted-foreground">Y (m)</Label>
                <Input
                  id="target-y"
                  type="number"
                  value={target.y}
                  onChange={(e) => setTarget(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label htmlFor="target-z" className="text-xs text-muted-foreground">Z (m)</Label>
                <Input
                  id="target-z"
                  type="number"
                  value={target.z}
                  onChange={(e) => setTarget(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </Card>

          {/* Current Position */}
          <Card className="p-4 bg-black/20 border-border/50">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-5 h-5 text-hud-success" />
              <span className="font-mono text-sm">CURRENT POSITION</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="text-center">
                <div className="text-muted-foreground">X</div>
                <div>{currentPosition.x.toFixed(1)} m</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Y</div>
                <div>{currentPosition.y.toFixed(1)} m</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Z</div>
                <div>{currentPosition.z.toFixed(1)} m</div>
              </div>
            </div>
          </Card>

          {/* Path Planning Controls */}
          <Card className="p-4 bg-black/20 border-border/50">
            <div className="flex items-center space-x-2 mb-4">
              <Route className="w-5 h-5 text-hud-secondary" />
              <span className="font-mono text-sm">PATH PLANNING</span>
              {pathExists && (
                <Badge variant="secondary" className="bg-hud-success/20 text-hud-success text-xs">
                  PATH READY
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handlePlanPath}
                disabled={isPlanning}
                className="w-full bg-hud-secondary/20 hover:bg-hud-secondary/30 text-hud-secondary border-hud-secondary/50"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isPlanning ? "COMPUTING..." : "PLAN PATH"}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleExecutePath}
                  disabled={!pathExists}
                  variant="default"
                  className="bg-hud-success/20 hover:bg-hud-success/30 text-hud-success border-hud-success/50"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </Button>
                
                <Button
                  onClick={handleClearPath}
                  variant="outline"
                  className="border-hud-danger/50 text-hud-danger hover:bg-hud-danger/10"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Waypoints List */}
          {waypoints.length > 0 && (
            <Card className="p-4 bg-black/20 border-border/50">
              <div className="text-sm font-mono mb-3">WAYPOINTS</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="flex items-center justify-between text-xs">
                    <span className="font-mono">
                      WP{index + 1}: ({waypoint.x.toFixed(1)}, {waypoint.y.toFixed(1)}, {waypoint.z.toFixed(1)})
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={waypoint.completed ? "bg-hud-success/20 text-hud-success" : "bg-hud-warning/20 text-hud-warning"}
                    >
                      {waypoint.completed ? "✓" : "○"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Map Display */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-hud-primary" />
              <span className="font-mono text-sm">MISSION PLANNER</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Scale: 1:200
            </div>
          </div>
          
          <div className="relative bg-black rounded border border-hud-primary/30">
            <canvas 
              ref={canvasRef}
              className="w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
            
            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-black/80 rounded p-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-hud-success rounded-full"></div>
                  <span>Current Position</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-hud-accent rounded-full"></div>
                  <span>Target</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-hud-secondary rounded-full"></div>
                  <span>Waypoint</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-hud-danger"></div>
                  <span>Obstacle</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PathPlanning;