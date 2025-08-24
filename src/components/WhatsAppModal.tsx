import React from 'react';
import { WhatsAppOptIn } from '@/components/ai/WhatsAppOptIn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WhatsApp Integration</DialogTitle>
          <DialogDescription>
            Enter your WhatsApp number to get started.
          </DialogDescription>
        </DialogHeader>
        <WhatsAppOptIn onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};