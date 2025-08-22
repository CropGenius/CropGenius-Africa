import React from "react";
import { cn } from "@/lib/utils";

interface LoaderFiveProps {
  text?: string;
  className?: string;
}

export function LoaderFive({ text = "Loading...", className }: LoaderFiveProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm text-muted-foreground ml-2">{text}</span>
    </div>
  );
}