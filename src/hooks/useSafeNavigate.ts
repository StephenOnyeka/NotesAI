import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Navigation is in-flight from the moment we dispatch until this screen is focused
 * again, so taps that land during the transition are dropped instead of queued.
 */
export function useSafeNavigate() {
  const router = useRouter();
  const navigatingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
    }, []),
  );

  const push = useCallback(
    (href: Href) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      router.push(href);
    },
    [router],
  );

  return { push };
}
