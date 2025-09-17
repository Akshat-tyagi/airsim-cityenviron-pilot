import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Battery, 
  Navigation, 
  Gauge, 
  Wifi,
  AlertTriangle,
  Shield,
  MapPin
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

interface DroneHUDProps {
  status: DroneStatus;
}

const DroneHUD = ({ status }: DroneHUDProps) => {
  const speed = Math.sqrt(
    status.velocity.x ** 2 + 
    status.velocity.y ** 2 + 
    status.velocity.z ** 2
  ).toFixed(1);

  const getBatteryColor = (level: number) => {
    if (level > 50) return "hud-success";
    if (level > 20) return "hud-warning";
    return "hud-danger";
  };

  const getStatusColor = (armed: boolean, connected: boolean) => {
    if (!connected) return "hud-danger";
    if (armed) return "hud-success";
    return "hud-warning";
  };

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Connection Status */}
        <Card className="p-4 bg-black/20 border-hud-primary/30">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${getStatusColor(status.armed, status.connected)}/20`}>
              <Wifi className={`w-5 h-5 text-${getStatusColor(status.armed, status.connected)}`} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">CONNECTION</div>
              <div className="font-mono text-sm">
                {status.connected ? "ONLINE" : "OFFLINE"}
              </div>
            </div>
          </div>
        </Card>

        {/* Flight Mode */}
        <Card className="p-4 bg-black/20 border-hud-secondary/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-hud-secondary/20">
              <Shield className="w-5 h-5 text-hud-secondary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">MODE</div>
              <div className="font-mono text-sm">{status.mode}</div>
            </div>
          </div>
        </Card>

        {/* Armed Status */}
        <Card className="p-4 bg-black/20 border-hud-accent/30">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${status.armed ? 'bg-hud-success/20' : 'bg-hud-danger/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${status.armed ? 'text-hud-success' : 'text-hud-danger'}`} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ARM STATUS</div>
              <div className="font-mono text-sm">
                {status.armed ? "ARMED" : "DISARMED"}
              </div>
            </div>
          </div>
        </Card>

        {/* Altitude */}
        <Card className="p-4 bg-black/20 border-hud-primary/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-hud-primary/20">
              <Activity className="w-5 h-5 text-hud-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ALTITUDE</div>
              <div className="font-mono text-sm">{status.altitude.toFixed(1)} m</div>
            </div>
          </div>
        </Card>

      </div>

      {/* Detailed Telemetry */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Battery Status */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Battery className={`w-5 h-5 text-${getBatteryColor(status.battery)}`} />
              <span className="font-mono text-sm">BATTERY</span>
            </div>
            <span className="font-mono text-lg">{status.battery.toFixed(1)}%</span>
          </div>
          <Progress 
            value={status.battery} 
            className="h-3 mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Est. Flight Time: {Math.floor(status.battery * 0.3)} min</span>
            <span className={status.battery < 20 ? "text-hud-danger animate-pulse" : ""}>
              {status.battery < 20 ? "LOW BATTERY!" : "NOMINAL"}
            </span>
          </div>
        </Card>

        {/* Velocity Vector */}
        <Card className="p-4 bg-black/20 border-border/50">
          <div className="flex items-center space-x-2 mb-3">
            <Gauge className="w-5 h-5 text-hud-secondary" />
            <span className="font-mono text-sm">VELOCITY</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Speed:</span>
              <span className="font-mono">{speed} m/s</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-muted-foreground">X</div>
                <div className="font-mono">{status.velocity.x.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Y</div>
                <div className="font-mono">{status.velocity.y.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Z</div>
                <div className="font-mono">{status.velocity.z.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* GPS and Navigation */}
      <Card className="mt-6 p-4 bg-black/20 border-border/50">
        <div className="flex items-center space-x-2 mb-3">
          <Navigation className="w-5 h-5 text-hud-accent" />
          <span className="font-mono text-sm">GPS & NAVIGATION</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">COORDINATES</div>
            <div className="font-mono text-sm">
              {status.gps.lat.toFixed(6)}, {status.gps.lon.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">GPS STATUS</div>
            <Badge variant="secondary" className="bg-hud-success/20 text-hud-success">
              <MapPin className="w-3 h-3 mr-1" />
              GPS FIX
            </Badge>
          </div>
        </div>
      </Card>

      {/* System Health */}
      <Card className="mt-6 p-4 bg-black/20 border-border/50">
        <div className="text-sm font-mono mb-3">SYSTEM HEALTH</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">IMU</span>
            <Badge variant="secondary" className="bg-hud-success/20 text-hud-success text-xs">OK</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Compass</span>
            <Badge variant="secondary" className="bg-hud-success/20 text-hud-success text-xs">OK</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Motors</span>
            <Badge variant="secondary" className="bg-hud-success/20 text-hud-success text-xs">OK</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Camera</span>
            <Badge variant="secondary" className="bg-hud-success/20 text-hud-success text-xs">OK</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DroneHUD;