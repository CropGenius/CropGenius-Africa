import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddFieldWizard from './wizard/AddFieldWizard';
import { Field } from '@/types/field';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ButtonProps } from '@/components/ui/button';

interface ResurrectedAddFieldButtonProps extends ButtonProps {
  onFieldAdded?: (field: Field) => void;
  buttonText?: string;
  icon?: React.ReactNode;
  showAsWizard?: boolean;
  defaultLocation?: { lat: number; lng: number };
}

export default function ResurrectedAddFieldButton({
  onFieldAdded,
  buttonText = "Add Field",
  icon = <Plus className="h-4 w-4 mr-2" />,
  showAsWizard = true,
  defaultLocation,
  variant = "default",
  size = "default",
  className,
  ...props
}: ResurrectedAddFieldButtonProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleFieldCreated = (field: Field) => {
    setDialogOpen(false);
    
    toast.success("🎉 Field created!", {
      description: `${field.name} is ready for cultivation`,
      duration: 4000,
    });
    
    if (onFieldAdded) {
      onFieldAdded(field);
      return;
    }
    
    if (field.id && !field.id.startsWith('offline-')) {
      navigate(`/fields/${field.id}`);
    } else {
      navigate('/fields');
    }
  };
  
  const handleCancel = () => {
    setDialogOpen(false);
    toast.info("Field creation cancelled");
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setDialogOpen(true)}
        {...props}
      >
        {icon}
        {buttonText}
      </Button>
      
      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Create New Field
            </DialogTitle>
          </DialogHeader>
          
          {showAsWizard ? (
            <AddFieldWizard
              onSuccess={handleFieldCreated}
              onCancel={handleCancel}
              defaultLocation={defaultLocation}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Simple form mode coming soon...
              </p>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}