import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useOfflineDetection() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
  });

  useEffect(() => {
    let offlineToastId: string | number | undefined;

    const handleOnline = () => {
      console.log('🌐 App is back online');
      setState(prev => ({
        isOnline: true,
        wasOffline: !prev.isOnline,
      }));

      // Show success toast when coming back online
      if (offlineToastId) {
        toast.dismiss(offlineToastId);
        offlineToastId = undefined;
      }
      toast.success('You\'re back online!', {
        duration: 3000,
      });
    };

    const handleOffline = () => {
      console.log('📴 App is offline');
      setState(prev => ({
        isOnline: false,
        wasOffline: prev.wasOffline,
      }));

      // Show persistent toast when going offline
      offlineToastId = toast.error('You\'re offline. Some features may not work.', {
        duration: Infinity,
        id: 'offline-toast',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (offlineToastId) {
        toast.dismiss(offlineToastId);
      }
    };
  }, []);

  return state;
}

export default useOfflineDetection;
