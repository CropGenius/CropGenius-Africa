import React, { useState } from 'react';
import { useUserFarms, useCreateFarm } from '@/hooks/useUserFarms';
import { useAuthContext } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Leaf } from 'lucide-react';
import { Farm } from '@/types/farm';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface FarmsListProps {
  onFarmSelect: (farm: Farm) => void;
  selectedFarmId?: string;
}

const CreateFarmDialog = ({ user }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const createFarmMutation = useCreateFarm();
  
    const handleCreate = () => {
      createFarmMutation.mutate({ name, location, user_id: user.id });
    };
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Farm
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new farm</DialogTitle>
            <DialogDescription>
              Enter the details of your new farm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createFarmMutation.isLoading}>
              {createFarmMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export const FarmsList: React.FC<FarmsListProps> = ({ onFarmSelect, selectedFarmId }) => {
  const { user } = useAuthContext();
  const { data: farms, isLoading, error } = useUserFarms();

  if (isLoading) {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error fetching farms: {error.message}</p>;
  }

  if (farms?.length === 0) {
    return (
      <div className="text-center">
        <Leaf className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No farms</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new farm.</p>
        <div className="mt-6">
          <CreateFarmDialog user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Your Farms</h2>
            <CreateFarmDialog user={user} />
        </div>
      {farms?.map((farm) => (
        <Card
          key={farm.id}
          className={`cursor-pointer hover:shadow-md transition-all ${
            selectedFarmId === farm.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onFarmSelect(farm)}
        >
          <CardHeader>
            <CardTitle>{farm.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{farm.location}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
