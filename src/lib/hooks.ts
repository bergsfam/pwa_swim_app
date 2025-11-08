import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

export function useDexieLiveQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const subscription = liveQuery(queryFn).subscribe({
      next: (data) => setValue(data),
      error: (error) => console.error('Dexie liveQuery error', error)
    });
    return () => subscription.unsubscribe();
  }, deps);

  return value;
}
