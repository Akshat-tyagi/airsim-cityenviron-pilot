import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Terminal, 
  Download, 
  Trash2,
  Filter,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface LogPanelProps {
  logs: string[];
}

const LogPanel = ({ logs }: LogPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (message: string) => {
    if (message.includes('🚨') || message.includes('EMERGENCY')) {
      return <AlertTriangle className="w-3 h-3 text-hud-danger" />;
    }
    if (message.includes('⚠') || message.includes('WARNING')) {
      return <AlertCircle className="w-3 h-3 text-hud-warning" />;
    }
    if (message.includes('✓') || message.includes('Connected') || message.includes('OK')) {
      return <CheckCircle className="w-3 h-3 text-hud-success" />;
    }
    return <Info className="w-3 h-3 text-hud-primary" />;
  };

  const getLogSeverity = (message: string) => {
    if (message.includes('🚨') || message.includes('EMERGENCY')) return 'error';
    if (message.includes('⚠') || message.includes('WARNING')) return 'warning';
    if (message.includes('✓') || message.includes('Connected')) return 'success';
    return 'info';
  };

  const getLogColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-hud-danger';
      case 'warning': return 'text-hud-warning';
      case 'success': return 'text-hud-success';
      default: return 'text-foreground';
    }
  };

  const handleDownloadLogs = () => {
    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drone_logs_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const severityCounts = logs.reduce((acc, log) => {
    const severity = getLogSeverity(log);
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-hud-primary" />
          <span className="font-mono text-sm">SYSTEM LOGS</span>
          <Badge variant="secondary" className="bg-hud-primary/20 text-hud-primary">
            {logs.length}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleDownloadLogs}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button
            onClick={() => {/* Clear logs functionality would go here */}}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="flex items-center space-x-4 mb-4">
        {severityCounts.error && (
          <Badge variant="secondary" className="bg-hud-danger/20 text-hud-danger text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {severityCounts.error} Errors
          </Badge>
        )}
        {severityCounts.warning && (
          <Badge variant="secondary" className="bg-hud-warning/20 text-hud-warning text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            {severityCounts.warning} Warnings
          </Badge>
        )}
        {severityCounts.success && (
          <Badge variant="secondary" className="bg-hud-success/20 text-hud-success text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            {severityCounts.success} Success
          </Badge>
        )}
        {severityCounts.info && (
          <Badge variant="secondary" className="bg-hud-primary/20 text-hud-primary text-xs">
            <Info className="w-3 h-3 mr-1" />
            {severityCounts.info} Info
          </Badge>
        )}
      </div>

      {/* Log Display */}
      <Card className="flex-1 bg-black/40 border-border/50">
        <ScrollArea className="h-full p-3">
          <div ref={scrollRef} className="space-y-1">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No logs available</p>
                <p className="text-xs">System messages will appear here</p>
              </div>
            ) : (
              logs.map((log, index) => {
                const severity = getLogSeverity(log);
                const colorClass = getLogColor(severity);
                
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 py-1 px-2 rounded text-xs font-mono hover:bg-muted/20 transition-colors ${
                      severity === 'error' ? 'bg-hud-danger/5' :
                      severity === 'warning' ? 'bg-hud-warning/5' :
                      severity === 'success' ? 'bg-hud-success/5' :
                      ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log)}
                    </div>
                    <div className={`flex-1 ${colorClass} leading-relaxed break-words`}>
                      {log}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Quick Filters */}
      <div className="flex items-center space-x-2 mt-3">
        <span className="text-xs text-muted-foreground">Quick filter:</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <Filter className="w-3 h-3 mr-1" />
          All
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-hud-danger">
          Errors
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-hud-warning">
          Warnings
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-hud-success">
          Success
        </Button>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center mt-2">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-hud-success rounded-full animate-pulse"></div>
          <span>Live monitoring active</span>
        </div>
      </div>
    </div>
  );
};

export default LogPanel;