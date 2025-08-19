
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, ScanLine, Camera, ArrowRight, CheckCircle, AlertTriangle, BarChart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type ScanStatus = "healthy" | "issue" | "critical";

interface ScanHistory {
  id: string;
  cropType: string;
  status: ScanStatus;
  date: string;
  imageUrl: string;
  confidence: number;
  recommendations: string[];
}

export default function CropScannerPreview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [scanning, setScanning] = useState(false);
  const [animatePing, setAnimatePing] = useState(false);
  
 useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch real scan history from database
      const { data: scans, error } = await supabase
        .from('crop_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const realScanHistory: ScanHistory[] = (scans || []).map(scan => ({
        id: scan.id,
        cropType: scan.crop_type || 'Unknown',
        status: scan.status as ScanStatus,
        date: new Date(scan.created_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        imageUrl: scan.image_url || '/placeholder.svg',
        confidence: Math.round((scan.confidence_score || 0.85) * 100),
        recommendations: scan.ai_recommendations || ['No specific recommendations available']
      }));

      setScanHistory(realScanHistory);
      setLoading(false);

      // Set up real-time subscription for new scans
      const channel = supabase
        .channel('crop-scans')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'crop_scans', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newScan: ScanHistory = {
              id: payload.new.id,
              cropType: payload.new.crop_type || 'Unknown',
              status: payload.new.status as ScanStatus,
              date: new Date(payload.new.created_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              imageUrl: payload.new.image_url || '/placeholder.svg',
              confidence: Math.round((payload.new.confidence_score || 0.85) * 100),
              recommendations: payload.new.ai_recommendations || ['No specific recommendations available']
            };
            
            setScanHistory(prev => [newScan, ...prev].slice(0, 5));
            
            // Show notification for critical issues
            if (payload.new.status === 'critical') {
              toast.error("Critical Issue Detected!", {
                description: `Your ${payload.new.crop_type} scan shows critical issues requiring immediate attention.`
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error('Failed to load scan history:', error);
      
      // No fallback data - show empty state
      setScanHistory([]);
      setLoading(false);
    }
  };

  const startScan = () => {
    setScanning(true);
    
    // Navigate to the scan page
    setTimeout(() => {
      navigate("/scan");
    }, 800);
  };
  
  const getStatusColor = (status: ScanStatus) => {
    switch(status) {
      case "healthy": return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "issue": return "text-amber-500 bg-amber-100 dark:bg-amber-900/30";
      case "critical": return "text-red-500 bg-red-100 dark:bg-red-900/30";
    }
  };
  
  const getStatusBadge = (status: ScanStatus) => {
    switch(status) {
      case "healthy": return <Badge className="bg-green-500">Healthy</Badge>;
      case "issue": return <Badge className="bg-amber-500">Issue Detected</Badge>;
      case "critical": return <Badge className="bg-red-500 animate-pulse">Critical</Badge>;
    }
  };

  return (
    <Card className="h-full border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardTitle className="flex justify-between items-center">
          <span>AI Crop Scanner</span>
          <Badge variant="outline" className="animate-pulse text-xs">In-field Diagnosis</Badge>
        </CardTitle>
        <CardDescription>
          Instant disease detection & AI treatment plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              className={cn(
                "w-full relative group overflow-hidden",
                scanning ? "bg-green-600 cursor-wait" : "bg-primary"
              )}
              onClick={startScan}
              disabled={scanning}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {scanning ? "Launching Camera..." : "Scan Crops Now"}
              </span>
              <span className={cn(
                "absolute inset-0 flex items-center justify-center bg-green-600 transition-transform",
                scanning ? "translate-x-0" : "translate-x-full group-hover:translate-x-0"
              )}>
                <ScanLine className="h-5 w-5 text-white" />
              </span>
            </Button>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Recent AI Scans
                </h3>
                <Badge variant="outline" className="text-xs">Auto-updating</Badge>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {scanHistory.map((scan) => (
                  <div 
                    key={scan.id} 
                    className="border rounded-lg overflow-hidden transition-all hover:shadow-md cursor-pointer"
                  >
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {scan.status === "healthy" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : scan.status === "issue" ? (
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <AlertTriangle className={`h-5 w-5 text-red-500 ${animatePing && scan.status === "critical" ? "animate-ping" : ""}`} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">{scan.cropType}</h4>
                              <div className="ml-2">{getStatusBadge(scan.status)}</div>
                            </div>
                            <p className="text-xs text-muted-foreground">{scan.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart className="h-3 w-3 text-indigo-500" />
                          <span className="text-xs font-medium">{scan.confidence}%</span>
                        </div>
                      </div>
                      
                      {scan.status !== "healthy" && (
                        <div className={`mt-2 p-2 rounded-md text-xs ${getStatusColor(scan.status)}`}>
                          <p className="font-medium">AI Treatment Plan:</p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {scan.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Link to="/scan">
              <Button variant="ghost" size="sm" className="w-full mt-2 group">
                <span className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4" />
                  View All Scan History
                  <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
