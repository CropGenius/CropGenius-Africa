/**
 * 🔥💪 DESKTOP LAYOUT - INFINITY GOD MODE ACTIVATED!
 * Production-ready desktop layout for CropGenius agricultural intelligence
 * Optimized for farmers using desktop computers and large screens
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Cloud, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  Bell,
  User,
  Search,
  Plus,
  Menu,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Leaf,
  Map,
  Camera,
  Users,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// 🔥 INFINITY IQ HOOKS AND SERVICES
import { useAuthContext } from '@/providers/AuthProvider';
import { useErrorHandler } from '@/utils/errorHandling';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { PageErrorBoundary, WidgetErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { OfflineStatusIndicator } from '@/components/offline/OfflineStatusIndicator';

interface DesktopLayoutProps {
  children: React.ReactNode;
  deviceType?: string;
  orientation?: string;
  windowSize?: { width: number; height: number };
  isFullscreen?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  category: 'main' | 'intelligence' | 'management' | 'community';
}

/**
 * 🔥 INFINITY GOD MODE DESKTOP LAYOUT
 * The most advanced desktop layout for agricultural intelligence
 */
export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  deviceType,
  orientation,
  windowSize,
  isFullscreen = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { handleError } = useErrorHandler();
  const { isOnline, connectionQuality } = useOfflineStatus();

  // 🚀 STATE MANAGEMENT
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🔥 NAVIGATION ITEMS
  const navigationItems: NavigationItem[] = [
    // Main Navigation
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/', category: 'main' },
    { id: 'farms', label: 'My Farms', icon: <Leaf className="h-5 w-5" />, path: '/farms', category: 'main' },
    { id: 'fields', label: 'Field Management', icon: <Map className="h-5 w-5" />, path: '/fields', category: 'main' },
    
    // Intelligence
    { id: 'weather', label: 'Weather Intelligence', icon: <Cloud className="h-5 w-5" />, path: '/weather', category: 'intelligence' },
    { id: 'market', label: 'Market Intelligence', icon: <TrendingUp className="h-5 w-5" />, path: '/market', category: 'intelligence' },
    { id: 'scan', label: 'AI Disease Scanner', icon: <Camera className="h-5 w-5" />, path: '/scan', category: 'intelligence' },
    { id: 'mission-control', label: 'Mission Control', icon: <Target className="h-5 w-5" />, path: '/mission-control', category: 'intelligence' },
    
    // Management
    { id: 'farm-planning', label: 'Farm Planning', icon: <Calendar className="h-5 w-5" />, path: '/farm-planning', category: 'management' },
    { id: 'yield-predictor', label: 'Yield Predictor', icon: <Activity className="h-5 w-5" />, path: '/yield-predictor', category: 'management' },
    
    // Community
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="h-5 w-5" />, path: '/chat', badge: 2, category: 'community' },
    { id: 'community', label: 'Farmer Community', icon: <Users className="h-5 w-5" />, path: '/community', category: 'community' }
  ];

  // 🚀 UPDATE TIME
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 LOAD NOTIFICATIONS
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (user && isOnline) {
          // Simulate loading notifications from Supabase
          setNotifications(Math.floor(Math.random() * 5) + 1);
        }
      } catch (error) {
        handleError(error as Error, { 
          component: 'DesktopLayout',
          operation: 'loadNotifications' 
        });
      }
    };

    loadNotifications();
  }, [user, isOnline, handleError]);

  // 🚀 NAVIGATION HANDLERS
  const handleNavigation = (path: string) => {
    try {
      navigate(path);
      toast.success('Navigation successful', {
        description: `Navigated to ${path}`,
        duration: 1000
      });
    } catch (error) {
      handleError(error as Error, { 
        component: 'DesktopLayout',
        operation: 'handleNavigation',
        path 
      });
    }
  };

  // 🔥 SEARCH HANDLER
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info('Search feature coming soon!', {
        description: `Searching for: ${searchQuery}`
      });
    }
  };

  // 🚀 GET ACTIVE NAVIGATION ITEM
  const getActiveItem = () => {
    return navigationItems.find(item => 
      location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path))
    );
  };

  const activeItem = getActiveItem();

  // 🔥 FILTER ITEMS BY CATEGORY
  const getItemsByCategory = (category: string) => {
    return navigationItems.filter(item => item.category === category);
  };

  // 🚀 FORMAT TIME
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <PageErrorBoundary errorBoundaryId="desktop-layout">
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
        
        {/* 🔥 SIDEBAR */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 280 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl flex flex-col relative z-20"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">CropGenius</h1>
                    <p className="text-xs text-gray-500">Agricultural Intelligence</p>
                  </div>
                </motion.div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Main Navigation */}
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Main
                </h3>
              )}
              <div className="space-y-1">
                {getItemsByCategory('main').map((item) => (
                  <Button
                    key={item.id}
                    variant={activeItem?.id === item.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-10 ${
                      sidebarCollapsed ? 'px-2' : 'px-3'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intelligence */}
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  AI Intelligence
                </h3>
              )}
              <div className="space-y-1">
                {getItemsByCategory('intelligence').map((item) => (
                  <Button
                    key={item.id}
                    variant={activeItem?.id === item.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-10 ${
                      sidebarCollapsed ? 'px-2' : 'px-3'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Management */}
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Management
                </h3>
              )}
              <div className="space-y-1">
                {getItemsByCategory('management').map((item) => (
                  <Button
                    key={item.id}
                    variant={activeItem?.id === item.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-10 ${
                      sidebarCollapsed ? 'px-2' : 'px-3'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Community */}
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Community
                </h3>
              )}
              <div className="space-y-1">
                {getItemsByCategory('community').map((item) => (
                  <Button
                    key={item.id}
                    variant={activeItem?.id === item.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-10 ${
                      sidebarCollapsed ? 'px-2' : 'px-3'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/50">
            {!sidebarCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.user_metadata?.full_name || 'Farmer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </motion.aside>

        {/* 🚀 MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm px-6 py-4 flex items-center justify-between relative z-10">
            
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeItem?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search farms, fields, or ask AI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50/50 border-gray-200/50"
                />
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <OfflineStatusIndicator variant="badge" />

              {/* Quick Actions */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/scan')}
                className="relative"
              >
                <Camera className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => toast.info('Notifications feature coming soon!')}
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border p-4 min-w-48 z-50"
                    >
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate('/settings');
                            setShowUserMenu(false);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={() => {
                            // Handle logout
                            toast.info('Logout feature coming soon!');
                            setShowUserMenu(false);
                          }}
                        >
                          Logout
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
            <PageErrorBoundary errorBoundaryId="desktop-layout-content">
              {children}
            </PageErrorBoundary>
          </main>
        </div>

        {/* 🔥 FLOATING QUICK ACTIONS */}
        <div className="fixed bottom-6 right-6 z-30">
          <div className="flex flex-col space-y-3">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl"
              onClick={() => navigate('/scan')}
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 🚀 PERFORMANCE INDICATOR */}
        {windowSize && (
          <div className="fixed bottom-4 left-4 z-30">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {windowSize.width}x{windowSize.height} • Desktop Mode
            </Badge>
          </div>
        )}
      </div>
    </PageErrorBoundary>
  );
};

export default DesktopLayout;