import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import { FieldBrainProvider } from '@/hooks/useFieldBrain';

interface FieldBrainProviderWrapperProps {
  children: ReactNode;
}

export const FieldBrainProviderWrapper: React.FC<FieldBrainProviderWrapperProps> = ({ children }) => {
  const { user } = useAuthContext();

  // Only provide FieldBrainProvider if user is authenticated
  if (!user?.id) {
    return <>{children}</>;
  }

  return (
    <FieldBrainProvider userId={user.id}>
      {children}
    </FieldBrainProvider>
  );
};