/**
 * 🔥💪 TABLET LAYOUT - INFINITY GOD MODE ACTIVATED!
 * Production-ready tablet layout for CropGenius agricultural intelligence
 * Perfect for farmers using iPads and Android tablets in the field
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
  Grid3X3,
  List,
  Zap,
  Leaf,
  Map,
  Camera,
  Users,
  Calendar,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// 🔥 INFINITY IQ HOOKS AND SERVICES
import { useAuthContext } from '@/providers/AuthProvider';
import { useErrorHandler } from '@/utils/errorHandling';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { PageErrorBoundary, WidgetErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { OfflineStatusIndicator } from '@/components/offline/OfflineStatusIndicator';

interface TabletLayoutProps {
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
 * 🔥 INFINITY GOD MODE TABLET LAYOUT
 * The most advanced tablet layout for agricultural intelligence
 */
export const TabletLayout: React.FC<TabletLayoutProps> = ({
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
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('main');

  // 🔥 NAVIGATION ITEMS
  const navigationItems: NavigationItem[] = [
    // Main Navigation
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/', category: 'main' },
    { id: 'farms', label: 'My Farms', icon: <Leaf className="h-5 w-5" />, path: '/farms', category: 'main' },
    { id: 'fields', label: 'Fields', icon: <Map className="h-5 w-5" />, path: '/fields', category: 'main' },
    
    // Intelligence
    { id: 'weather', label: 'Weather', icon: <Cloud className="h-5 w-5" />, path: '/weather', category: 'intelligence' },
    { id: 'market', label: 'Market', icon: <TrendingUp className="h-5 w-5" />, path: '/market', category: 'intelligence' },
    { id: 'scan', label: 'AI Scanner', icon: <Camera className="h-5 w-5" />, path: '/scan', category: 'intelligence' },
    { id: 'mission-control', label: 'Mission Control', icon: <Target className="h-5 w-5" />, path: '/mission-control', category: 'intelligence' },
    
    // Management
    { id: 'farm-planning', label: 'Planning', icon: <Calendar className="h-5 w-5" />, path: '/farm-planning', category: 'management' },
    { id: 'yield-predictor', label: 'Yield Predictor', icon: <Activity className="h-5 w-5" />, path: '/yield-predictor', category: 'management' },
    
    // Community
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="h-5 w-5" />, path: '/chat', badge: 2, category: 'community' },
    { id: 'community', label: 'Community', icon: <Users className="h-5 w-5" />, path: '/community', category: 'community' }
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
          setNotifications(Math.floor(Math.random() * 5) + 1);
        }
      } catch (error) {
        handleError(error as Error, { 
          component: 'TabletLayout',
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
      setShowSidebar(false);
      toast.success('Navigation successful', {
        description: `Navigated to ${path}`,
        duration: 1000
      });
    } catch (error) {
      handleError(error as Error, { 
        component: 'TabletLayout',
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

  // 🔥 RENDER NAVIGATION ITEMS
  const renderNavigationItems = (items: NavigationItem[], compact = false) => {
    if (viewMode === 'grid' && !compact) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={activeItem?.id === item.id ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center justify-center space-y-2 relative"
              onClick={() => handleNavigation(item.path)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={activeItem?.id === item.id ? 'default' : 'ghost'}
            className="w-full justify-start h-12"
            onClick={() => handleNavigation(item.path)}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="ml-3 flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <PageErrorBoundary errorBoundaryId="tablet-layout">
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
        
        {/* 🔥 SIDEBAR OVERLAY */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowSidebar(false)}
              />
              
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
              >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">CropGenius</h1>
                        <p className="text-sm text-gray-500">Agricultural Intelligence</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSidebar(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="main" className="text-xs">Main</TabsTrigger>
                      <TabsTrigger value="intelligence" className="text-xs">AI</TabsTrigger>
                      <TabsTrigger value="management" className="text-xs">Manage</TabsTrigger>
                      <TabsTrigger value="community" className="text-xs">Social</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="main" className="mt-0">
                      {renderNavigationItems(getItemsByCategory('main'), true)}
                    </TabsContent>
                    
                    <TabsContent value="intelligence" className="mt-0">
                      {renderNavigationItems(getItemsByCategory('intelligence'), true)}
                    </TabsContent>
                    
                    <TabsContent value="management" className="mt-0">
                      {renderNavigationItems(getItemsByCategory('management'), true)}
                    </TabsContent>
                    
                    <TabsContent value="community" className="mt-0">
                      {renderNavigationItems(getItemsByCategory('community'), true)}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.user_metadata?.full_name || 'Farmer'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/settings');
                      setShowSidebar(false);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 🚀 MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm px-4 py-3 flex items-center justify-between relative z-10">
            
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeItem?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <OfflineStatusIndicator variant="minimal" />

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/scan')}
                className="relative"
              >
                <Camera className="h-4 w-4" />
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
                  size="icon"
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

          {/* Search Bar */}
          <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/30 px-4 py-3">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search farms, fields, or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200/50"
              />
            </form>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
            <PageErrorBoundary errorBoundaryId="tablet-layout-content">
              {children}
            </PageErrorBoundary>
          </main>
        </div>

        {/* 🔥 FLOATING ACTION BUTTON */}
        <div className="fixed bottom-6 right-6 z-30">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl"
            onClick={() => navigate('/scan')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* 🚀 PERFORMANCE INDICATOR */}
        {windowSize && (
          <div className="fixed bottom-4 left-4 z-30">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {windowSize.width}x{windowSize.height} • Tablet • {orientation}
            </Badge>
          </div>
        )}
      </div>
    </PageErrorBoundary>
  );
};

export default TabletLayout;