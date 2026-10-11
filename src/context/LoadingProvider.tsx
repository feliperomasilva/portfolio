import { type PropsWithChildren, useMemo, useState } from 'react';
import { LoadingContext, type LoadingType } from './LoadingContext';

// Sem personagem 3D: loading curto só para a intro (preloader).
// Nunca prende a página: libera em ~1.2s ou no frs:ready.
export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(100);

  const value = useMemo<LoadingType>(
    () => ({ isLoading, setIsLoading, setLoading, loading }),
    [isLoading, loading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
