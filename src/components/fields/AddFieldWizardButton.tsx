import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Plus, MapPin, Sparkles } from 'lucide-react';

import { Field } from '@/types/field';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleFieldAdded = (field: Field) => {
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
      
      {dialogOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <AddFieldWizard
            onSuccess={handleFieldAdded}
            onCancel={() => setDialogOpen(false)}
          />
        </div>
      )}
    </>
  );
}