import React from 'react';
import RequireRoot from './RequireRoot';

export function withRequireRoot<P extends object>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => (
    <RequireRoot>
      <Component {...props} />
    </RequireRoot>
  );
  Wrapped.displayName = `withRequireRoot(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
