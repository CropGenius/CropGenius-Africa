/**
 * 🔥💪 USER MANAGEMENT PANEL - INFINITY GOD MODE ACTIVATED!
 * REAL user management with REAL Supabase integration
 * Built for 100 million African farmers with military-grade security!
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 🔥 MISSION CONTROL TYPES
import { FarmerUser } from '@/services/missionControlApi';

interface UserManagementPanelProps {
  users: FarmerUser[];
  count: number;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => Promise<void>;
  getUser: (userId: string) => Promise<FarmerUser | null>;
  updateUser: (userId: string, updates: Partial<FarmerUser>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filter?: Record<string, any>;
  };
  setOptions: (options: any) => void;
}

/**
 * 🔥 INFINITY GOD MODE USER MANAGEMENT PANEL
 * Real user management with military-grade security
 */
export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  users,
  count,
  isLoading,
  error,
  onRefresh,
  getUser,
  updateUser,
  deleteUser,
  options,
  setOptions
}) => {
  // 🚀 STATE MANAGEMENT
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<FarmerUser | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<FarmerUser | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<FarmerUser>>({});

  // 🔥 GET SUBSCRIPTION TIER COLOR
  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'basic': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'enterprise': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🚀 GET STATUS COLOR
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'trial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🔥 FORMAT DATE
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 🚀 HANDLE SEARCH
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOptions({
      ...options,
      page: 1,
      filter: {
        ...options.filter,
        full_name: query ? `%${query}%` : undefined
      }
    });
  };

  // 🔥 HANDLE SORT
  const handleSort = (column: string) => {
    const newDirection = options.sortBy === column && options.sortDirection === 'asc' ? 'desc' : 'asc';
    setOptions({
      ...options,
      sortBy: column,
      sortDirection: newDirection
    });
  };

  // 🚀 HANDLE PAGE CHANGE
  const handlePageChange = (newPage: number) => {
    setOptions({
      ...options,
      page: newPage
    });
  };

  // 🔥 HANDLE VIEW USER
  const handleViewUser = async (user: FarmerUser) => {
    const fullUser = await getUser(user.id);
    if (fullUser) {
      setSelectedUser(fullUser);
      setEditingUser(fullUser);
      setShowUserDialog(true);
    }
  };

  // 🚀 HANDLE UPDATE USER
  const handleUpdateUser = async () => {
    if (!selectedUser || !editingUser) return;
    
    const success = await updateUser(selectedUser.id, editingUser);
    if (success) {
      setShowUserDialog(false);
      setSelectedUser(null);
      setEditingUser({});
      onRefresh();
    }
  };

  // 🔥 HANDLE DELETE USER
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const success = await deleteUser(userToDelete.id);
    if (success) {
      setShowDeleteDialog(false);
      setUserToDelete(null);
      onRefresh();
    }
  };

  // 🔥 CALCULATE PAGINATION
  const totalPages = Math.ceil(count / (options.limit || 10));
  const currentPage = options.page || 1;

  return (
    <div className="space-y-6">
      {/* 🚀 USER MANAGEMENT HEADER */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage {count.toLocaleString()} registered farmers across Africa
              </CardDescription>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={options.filter?.subscription_tier || 'all'}
                onValueChange={(value) => setOptions({
                  ...options,
                  filter: {
                    ...options.filter,
                    subscription_tier: value === 'all' ? undefined : value
                  }
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={options.filter?.subscription_status || 'all'}
                onValueChange={(value) => setOptions({
                  ...options,
                  filter: {
                    ...options.filter,
                    subscription_status: value === 'all' ? undefined : value
                  }
                })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('subscription_tier')}
                  >
                    Subscription
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('created_at')}
                  >
                    Joined
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('last_login')}
                  >
                    Last Active
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                            <AvatarFallback>
                              {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant="outline" 
                            className={getSubscriptionColor(user.subscription_tier)}
                          >
                            {user.subscription_tier.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(user.subscription_status)}
                            size="sm"
                          >
                            {user.subscription_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.last_login)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.location ? `${user.location.country}, ${user.location.region}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * (options.limit || 10)) + 1} to {Math.min(currentPage * (options.limit || 10), count)} of {count} users
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔥 USER DETAILS DIALOG */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and edit user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.full_name}`} />
                  <AvatarFallback>
                    {selectedUser.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getSubscriptionColor(selectedUser.subscription_tier)}>
                      {selectedUser.subscription_tier}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.subscription_status)}>
                      {selectedUser.subscription_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={editingUser.phone_number || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={editingUser.location?.country || ''}
                    onChange={(e) => setEditingUser(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, country: e.target.value, region: prev.location?.region || '' }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={editingUser.location?.region || ''}
                    onChange={(e) => setEditingUser(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, region: e.target.value, country: prev.location?.country || '' }
                    }))}
                  />
                </div>
              </div>

              {/* Usage Stats */}
              <div>
                <h4 className="font-medium mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedUser.usage_stats?.disease_scans || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Disease Scans</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedUser.usage_stats?.weather_checks || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Weather Checks</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedUser.usage_stats?.ai_chat_messages || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">AI Messages</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedUser.usage_stats?.market_queries || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Market Queries</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔥 DELETE CONFIRMATION DIALOG */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userToDelete.full_name}`} />
                  <AvatarFallback>
                    {userToDelete.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userToDelete.full_name}</p>
                  <p className="text-sm text-muted-foreground">{userToDelete.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};