/*import { useEffect } from 'react';
import { initNotificationListeners, registerAndSavePushToken } from './notifications';

type UseNotificationsOptions = {
  autoRegister?: boolean; // call registerAndSavePushToken on mount
};

export default function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoRegister = false } = options;

  useEffect(() => {
    let unsub = () => {};

    // Optionally register token on mount (useful after login)
    if (autoRegister) {
      registerAndSavePushToken().catch(err => console.warn('registerAndSavePushToken failed', err));
    }

    // Initialize listeners
    try {
      unsub = initNotificationListeners({
        onReceive: (n) => {
          // default behavior: just log — consumers can override by calling initNotificationListeners directly
          console.log('Notification received (default handler)', n);
        },
        onResponse: (r) => {
          console.log('Notification response (default handler)', r);
        },
      });
    } catch (err) {
      console.warn('initNotificationListeners failed', err);
    }

    return () => {
      try {
        unsub();
      } catch (err) {
        // ignore
      }
    };
  }, [autoRegister]);
}
*/