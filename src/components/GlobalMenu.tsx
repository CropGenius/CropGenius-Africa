import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  Scan, 
  CalendarDays, 
  TrendingUp,
  ShoppingCart,
  Cloud,
  MessageSquare,
  Layers,
  Bell,
  Users,
  Award,
  Settings,
  LogOut,
  Target,
  BarChart3,
  Sparkles
} from "lucide-react";
import LogoSVG from '@/assets/logo/cropgenius-logo.svg';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "sonner";

export default function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [userStats, setUserStats] = useState({ credits: 0, farms: 0, newFeatures: 0 });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user!.id)
        .single();
      
      const { count: farmsCount } = await supabase
        .from('farms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      
      setUserStats({
        credits: profile?.credits || 0,
        farms: farmsCount || 0,
        newFeatures: 3 // New features available
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const menuItems = [
    { name: "Home", icon: <Home className="w-5 h-5" />, path: "/", category: "main" },
    { name: "Crop Scanner", icon: <Scan className="w-5 h-5" />, path: "/scan", category: "tools" },
    { name: "Farm Planning", icon: <CalendarDays className="w-5 h-5" />, path: "/farm-planning", category: "tools", isNew: true },
    { name: "Crop Disease Detection", icon: <Target className="w-5 h-5" />, path: "/crop-disease-detection", category: "tools", isNew: true },
    { name: "Yield Predictor", icon: <TrendingUp className="w-5 h-5" />, path: "/yield-predictor", category: "tools" },
    { 
      name: "Manage Fields", 
      icon: <Layers className="w-5 h-5" />, 
      path: "/manage-fields",
      category: "main",
      highlight: true,
      badge: userStats.farms > 0 ? userStats.farms.toString() : undefined
    },
    { name: "Market Intelligence", icon: <BarChart3 className="w-5 h-5" />, path: "/market-insights", category: "tools", isNew: true },
    { name: "Market Prices", icon: <ShoppingCart className="w-5 h-5" />, path: "/market", category: "main" },
    { name: "Weather Intelligence", icon: <Cloud className="w-5 h-5" />, path: "/weather", category: "main" },
    { name: "Mission Control", icon: <Target className="w-5 h-5" />, path: "/mission-control", category: "tools", isNew: true },
    { name: "AI Assistant", icon: <MessageSquare className="w-5 h-5" />, path: "/chat", category: "main" },
    { name: "Community Hub", icon: <Users className="w-5 h-5" />, path: "/community", category: "social", isNew: true },
  ];

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const categoryLabels = {
    main: "Main Features",
    tools: "AI Tools",
    social: "Community"
  };

  const handleNavigate = (path: string, itemName: string) => {
    // Track navigation analytics
    if (user) {
      supabase.from('user_analytics').insert({
        user_id: user.id,
        event_type: 'navigation',
        event_data: { from: location.pathname, to: path, source: 'hamburger_menu', item: itemName }
      }).then(() => {}).catch(() => {}); // Silent fail for analytics
    }
    
    navigate(path);
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={LogoSVG} alt="CropGenius logo" className="h-8 w-auto" />
              <div className="text-sm text-gray-600">
                <div className="font-medium">{user?.user_metadata?.full_name || 'Farmer'}</div>
                <div className="text-xs">{userStats.credits} credits</div>
              </div>
            </div>
            {userStats.newFeatures > 0 && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                {userStats.newFeatures} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-2">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>
                {items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full justify-start mb-1 transition-all duration-200 ${
                        isActive
                          ? "bg-green-100 text-green-700 font-medium"
                          : item.highlight 
                            ? "bg-primary/10 font-medium text-primary hover:bg-primary/20 hover:text-primary" 
                            : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleNavigate(item.path, item.name)}
                    >
                      {item.icon}
                      <span className="ml-2 flex-1 text-left">{item.name}</span>
                      <div className="flex items-center space-x-1">
                        {item.badge && (
                          <Badge variant="outline" className="text-xs h-5">
                            {item.badge}
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge className="bg-green-100 text-green-700 text-xs h-5 px-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {item.highlight && !item.badge && (
                          <Badge className="bg-primary text-white text-xs h-5 px-2">
                            Hot
                          </Badge>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            ))}
            
            <div className="border-t my-4 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start mb-1"
                onClick={() => handleNavigate("/settings")}
              >
                <Settings className="w-5 h-5" />
                <span className="ml-2">Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
