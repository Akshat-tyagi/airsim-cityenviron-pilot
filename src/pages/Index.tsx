import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CameraFeed from "@/components/drone/CameraFeed";
import DroneHUD from "@/components/drone/DroneHUD";
import PathPlanning from "@/components/drone/PathPlanning";
import ControlPanel from "@/components/drone/ControlPanel";
import LogPanel from "@/components/drone/LogPanel";
import { useToast } from "@/hooks/use-toast";

interface DroneStatus {
  altitude: number;
  velocity: { x: number; y: number; z: number };
  battery: number;
  gps: { lat: number; lon: number };
  armed: boolean;
  connected: boolean;
  mode: string;
}

const Index = () => {
  const { toast } = useToast();
  const [droneStatus, setDroneStatus] = useState<DroneStatus>({
    altitude: 0,
    velocity: { x: 0, y: 0, z: 0 },
    battery: 100,
    gps: { lat: 47.6062, lon: -122.3321 },
    armed: false,
    connected: false,
    mode: "STABILIZE"
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${message}`]);
  };

  // Simulate drone connection and status updates
  useEffect(() => {
    const connectToDrone = async () => {
      addLog("Attempting to connect to AirSim...");
      setTimeout(() => {
        setDroneStatus(prev => ({ ...prev, connected: true }));
        addLog("✓ Connected to AirSim CityEnviron");
        toast({
          title: "Drone Connected",
          description: "Successfully connected to AirSim simulation",
        });
      }, 2000);
    };

    connectToDrone();

    // Simulate telemetry updates
    const interval = setInterval(() => {
      setDroneStatus(prev => ({
        ...prev,
        altitude: prev.altitude + (Math.random() - 0.5) * 0.1,
        velocity: {
          x: prev.velocity.x + (Math.random() - 0.5) * 0.2,
          y: prev.velocity.y + (Math.random() - 0.5) * 0.2,
          z: prev.velocity.z + (Math.random() - 0.5) * 0.1,
        },
        battery: Math.max(0, prev.battery - 0.01),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [toast]);

  const handleDroneCommand = (command: string, data?: any) => {
    switch (command) {
      case "takeoff":
        if (!droneStatus.armed) {
          addLog("⚠ Cannot takeoff: Drone not armed");
          return;
        }
        addLog("🚁 Taking off...");
        setDroneStatus(prev => ({ ...prev, altitude: 10, mode: "TAKEOFF" }));
        break;
      case "land":
        addLog("🛬 Landing...");
        setDroneStatus(prev => ({ ...prev, altitude: 0, mode: "LAND" }));
        break;
      case "arm":
        addLog("🔓 Arming drone...");
        setDroneStatus(prev => ({ ...prev, armed: true }));
        break;
      case "disarm":
        addLog("🔒 Disarming drone...");
        setDroneStatus(prev => ({ ...prev, armed: false }));
        break;
      case "emergency":
        addLog("🚨 EMERGENCY STOP!");
        setDroneStatus(prev => ({ 
          ...prev, 
          armed: false, 
          altitude: 0, 
          velocity: { x: 0, y: 0, z: 0 },
          mode: "EMERGENCY"
        }));
        break;
      case "navigate":
        addLog(`🎯 Navigating to coordinates: ${data.x}, ${data.y}, ${data.z}`);
        setDroneStatus(prev => ({ ...prev, mode: "AUTO" }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DRONE CONTROL DASHBOARD
            </h1>
            <p className="text-muted-foreground mt-1">
              AirSim CityEnviron Integration • Status: {droneStatus.connected ? "CONNECTED" : "DISCONNECTED"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${droneStatus.connected ? 'bg-hud-success animate-pulse-glow' : 'bg-hud-danger'}`} />
            <span className="text-sm font-mono">
              {droneStatus.connected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        
        {/* Left Column - Camera and HUD */}
        <div className="col-span-8 space-y-4">
          <Card className="h-[60%] bg-gradient-panel border-border/50 shadow-panel">
            <CameraFeed />
          </Card>
          
          <Card className="h-[38%] bg-gradient-panel border-border/50 shadow-panel">
            <Tabs defaultValue="hud" className="h-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="hud" className="data-[state=active]:bg-hud-primary/20">HUD Status</TabsTrigger>
                <TabsTrigger value="planning" className="data-[state=active]:bg-hud-primary/20">Path Planning</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-hud-primary/20">System Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hud" className="h-[calc(100%-60px)]">
                <DroneHUD status={droneStatus} />
              </TabsContent>
              
              <TabsContent value="planning" className="h-[calc(100%-60px)]">
                <PathPlanning onNavigate={(coords) => handleDroneCommand("navigate", coords)} />
              </TabsContent>
              
              <TabsContent value="logs" className="h-[calc(100%-60px)]">
                <LogPanel logs={logs} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Controls */}
        <div className="col-span-4">
          <Card className="h-full bg-gradient-panel border-border/50 shadow-panel">
            <ControlPanel 
              status={droneStatus} 
              onCommand={handleDroneCommand}
              onLog={addLog}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;