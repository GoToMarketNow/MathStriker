import type { ReactNode } from 'react';

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ScreenContainer({ children, className = '', noPadding = false }: ScreenContainerProps) {
  return (
    <div
      className={`
        mx-auto max-w-[560px] min-h-screen
        ${noPadding ? '' : 'px-4 py-4 md:px-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
