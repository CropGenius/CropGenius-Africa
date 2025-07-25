import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Plus, MapPin, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field } from '@/types/field';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import AddFieldWizard from './wizard/AddFieldWizard';
import { motion } from 'framer-motion';
import { isOnline } from '@/utils/isOnline';

interface AddFieldWizardButtonProps extends ButtonProps {
  onFieldAdded?: (field: Field) => void;
  buttonText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function AddFieldWizardButton({
  onFieldAdded,
  buttonText = "Add New Field",
  icon = <MapPin className="h-4 w-4 mr-2" />,
  children,
  variant = "default", 
  size = "default",
  className,
  ...props
}: AddFieldWizardButtonProps) {
  const { logError } = useErrorLogging('AddFieldWizardButton');
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleFieldAdded = (field: Field) => {
    try {
      setDialogOpen(false);
      
      // Show success toast with confetti animation
      toast.success("Field added successfully!", {
        description: `${field.name} has been added to your farm${!isOnline() ? ' (offline)' : ''}`,
        duration: 6000,
        icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
      });
      
      // If there's a custom callback, use it
      if (onFieldAdded) {
        onFieldAdded(field);
        return;
      }
      
      // Otherwise navigate to the field detail
      // For offline fields, navigate to the fields list instead
      if (field.id.startsWith('offline-')) {
        navigate('/fields');
        toast.info("Offline field created", {
          description: "Your field will appear in the list when you're back online"
        });
      } else {
        navigate(`/fields/${field.id}`);
      }
    } catch (error) {
      logError(error as Error, { context: 'handleFieldAdded' });
      toast.error("Error adding field", {
        description: "Please try again or check your connection"
      });
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        {children || (
          <>
            {icon}
            {buttonText}
          </>
        )}
      </Button>
      
      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Add New Field</DialogTitle>
            <DialogDescription>Create a new field for your farm</DialogDescription>
          </DialogHeader>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-0"
          >
            <ErrorBoundary>
              <AddFieldWizard
                onSuccess={handleFieldAdded}
                onCancel={() => setDialogOpen(false)}
              />
            </ErrorBoundary>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}