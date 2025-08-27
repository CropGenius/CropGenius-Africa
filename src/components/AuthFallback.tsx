
import { ReactNode } from 'react';

interface AuthFallbackProps {
  children: ReactNode;
}

export default function AuthFallback({ children }: AuthFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
