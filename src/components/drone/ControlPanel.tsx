import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Power,
  Square,
  Plane,
  PlaneLanding,
  RotateCcw,
  AlertTriangle,
  Settings,
  Zap,
  Gauge,
  MoveUp
} from "lucide-react";

interface DroneStatus {
  altitude: number;
  velocity: { x: number; y: number; z: number };
  battery: number;
  gps: { lat: number; lon: number };
  armed: boolean;
  connected: boolean;
  mode: string;
}

interface ControlPanelProps {
  status: DroneStatus;
  onCommand: (command: string, data?: any) => void;
  onLog: (message: string) => void;
}

const ControlPanel = ({ status, onCommand, onLog }: ControlPanelProps) => {
  const [maxSpeed, setMaxSpeed] = useState([10]);
  const [targetAltitude, setTargetAltitude] = useState([20]);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [manualControl, setManualControl] = useState({
    throttle: 50,
    pitch: 0,
    roll: 0,
    yaw: 0
  });

  const handleEmergencyStop = () => {
    if (!emergencyConfirm) {
      setEmergencyConfirm(true);
      setTimeout(() => setEmergencyConfirm(false), 3000);
      return;
    }
    
    onCommand("emergency");
    onLog("🚨 Emergency stop activated by user");
    setEmergencyConfirm(false);
  };

  const handleTakeoff = () => {
    if (!status.armed) {
      onLog("⚠ Please arm the drone first");
      return;
    }
    onCommand("takeoff");
  };

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="space-y-4">
        
        {/* Primary Flight Controls */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Plane className="w-5 h-5 text-hud-primary" />
            <span className="font-mono text-sm">FLIGHT CONTROLS</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onCommand(status.armed ? "disarm" : "arm")}
              variant={status.armed ? "destructive" : "default"}
              className={status.armed 
                ? "bg-hud-danger/20 hover:bg-hud-danger/30 text-hud-danger border-hud-danger/50" 
                : "bg-hud-success/20 hover:bg-hud-success/30 text-hud-success border-hud-success/50"
              }
            >
              <Power className="w-4 h-4 mr-2" />
              {status.armed ? "DISARM" : "ARM"}
            </Button>
            
            <Button
              onClick={handleTakeoff}
              disabled={!status.connected || status.altitude > 1}
              className="bg-hud-secondary/20 hover:bg-hud-secondary/30 text-hud-secondary border-hud-secondary/50"
            >
              <Plane className="w-4 h-4 mr-2" />
              TAKEOFF
            </Button>
            
            <Button
              onClick={() => onCommand("land")}
              disabled={!status.connected || status.altitude < 1}
              className="bg-hud-accent/20 hover:bg-hud-accent/30 text-hud-accent border-hud-accent/50"
            >
              <PlaneLanding className="w-4 h-4 mr-2" />
              LAND
            </Button>
            
            <Button
              onClick={() => onCommand("hover")}
              disabled={!status.connected}
              variant="outline"
              className="border-border hover:bg-muted/50"
            >
              <Square className="w-4 h-4 mr-2" />
              HOVER
            </Button>
          </div>
        </Card>

        {/* Emergency Controls */}
        <Card className="p-4 bg-black/20 border-hud-danger/30">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-hud-danger animate-pulse" />
            <span className="font-mono text-sm">EMERGENCY</span>
          </div>
          
          <Button
            onClick={handleEmergencyStop}
            variant="destructive"
            className={`w-full ${emergencyConfirm ? 'animate-pulse-glow' : ''} bg-hud-danger/30 hover:bg-hud-danger/50 text-white`}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {emergencyConfirm ? "CONFIRM EMERGENCY STOP" : "EMERGENCY STOP"}
          </Button>
          
          {emergencyConfirm && (
            <p className="text-xs text-hud-danger mt-2 text-center animate-pulse">
              Click again to confirm emergency stop
            </p>
          )}
        </Card>

        {/* Flight Parameters */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-hud-secondary" />
            <span className="font-mono text-sm">FLIGHT PARAMETERS</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs text-muted-foreground">MAX SPEED</Label>
                <span className="text-xs font-mono">{maxSpeed[0]} m/s</span>
              </div>
              <Slider
                value={maxSpeed}
                onValueChange={setMaxSpeed}
                max={25}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs text-muted-foreground">TARGET ALTITUDE</Label>
                <span className="text-xs font-mono">{targetAltitude[0]} m</span>
              </div>
              <Slider
                value={targetAltitude}
                onValueChange={setTargetAltitude}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Manual Control */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Gauge className="w-5 h-5 text-hud-accent" />
            <span className="font-mono text-sm">MANUAL CONTROL</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Throttle */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">THROTTLE</Label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={manualControl.throttle}
                  onChange={(e) => setManualControl(prev => ({ ...prev, throttle: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-full appearance-none"
                />
                <span className="text-xs font-mono text-center block mt-1">{manualControl.throttle}%</span>
              </div>
            </div>
            
            {/* Yaw */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">YAW</Label>
              <div className="relative">
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={manualControl.yaw}
                  onChange={(e) => setManualControl(prev => ({ ...prev, yaw: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-full appearance-none"
                />
                <span className="text-xs font-mono text-center block mt-1">{manualControl.yaw}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Pitch */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">PITCH</Label>
              <input
                type="range"
                min="-100"
                max="100"
                value={manualControl.pitch}
                onChange={(e) => setManualControl(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                className="w-full h-2 bg-muted rounded-full appearance-none"
              />
              <span className="text-xs font-mono text-center block">{manualControl.pitch}</span>
            </div>
            
            {/* Roll */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">ROLL</Label>
              <input
                type="range"
                min="-100"
                max="100"
                value={manualControl.roll}
                onChange={(e) => setManualControl(prev => ({ ...prev, roll: parseInt(e.target.value) }))}
                className="w-full h-2 bg-muted rounded-full appearance-none"
              />
              <span className="text-xs font-mono text-center block">{manualControl.roll}</span>
            </div>
          </div>
          
          <Button
            onClick={() => setManualControl({ throttle: 50, pitch: 0, roll: 0, yaw: 0 })}
            variant="outline"
            className="w-full mt-4"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET CONTROLS
          </Button>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="text-sm font-mono mb-3">QUICK ACTIONS</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onCommand("return_home")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🏠 Return Home
            </Button>
            <Button
              onClick={() => onCommand("orbit")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🔄 Orbit Mode
            </Button>
            <Button
              onClick={() => onCommand("follow_me")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              👤 Follow Me
            </Button>
            <Button
              onClick={() => onCommand("photo")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              📷 Take Photo
            </Button>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="text-sm font-mono mb-3">SYSTEM STATUS</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Connection</span>
              <Badge 
                variant="secondary" 
                className={status.connected ? "bg-hud-success/20 text-hud-success" : "bg-hud-danger/20 text-hud-danger"}
              >
                {status.connected ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Flight Mode</span>
              <Badge variant="secondary" className="bg-hud-secondary/20 text-hud-secondary">
                {status.mode}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Battery Level</span>
              <Badge 
                variant="secondary" 
                className={
                  status.battery > 50 ? "bg-hud-success/20 text-hud-success" :
                  status.battery > 20 ? "bg-hud-warning/20 text-hud-warning" :
                  "bg-hud-danger/20 text-hud-danger"
                }
              >
                {status.battery.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ControlPanel;