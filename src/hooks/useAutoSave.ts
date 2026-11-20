import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => void | Promise<void>,
  delayMs = 3000
) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const initialMount = useRef(true);

  dataRef.current = data;

  const triggerSave = useCallback(async () => {
    try {
      setStatus('saving');
      await onSave(dataRef.current);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('AutoSave failed', err);
      setStatus('error');
    }
  }, [onSave]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      triggerSave();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, delayMs, triggerSave]);

  return { status, triggerSave };
}
