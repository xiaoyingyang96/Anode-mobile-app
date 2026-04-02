import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export type FlashDir = 'up' | 'down' | null;

type Options = {
  /** Minimum absolute delta to trigger the flash (filters out noise). */
  threshold?: number;
  /** Total animation duration in ms — matches SentimentX default. */
  durationMs?: number;
};

/**
 * Port of SentimentX's useColorPulse hook.
 *
 * Returns an Animated.Value (0→1→0) and the current flash direction so the
 * consumer can interpolate a text color: normal → green/red → normal.
 */
export function usePriceFlash(
  value: number | null | undefined,
  opts: Options = {},
) {
  const { threshold = 0, durationMs = 1500 } = opts;

  const prevRef = useRef<number | null | undefined>(undefined);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  // progress drives the color interpolation (0 = base color, 1 = flash color)
  const progress = useRef(new Animated.Value(0)).current;

  // dir triggers a re-render so the interpolation picks up the new color target
  const [dir, setDir] = useState<FlashDir>(null);

  useEffect(() => {
    if (typeof value !== 'number') return;

    const prev = prevRef.current;
    if (typeof prev === 'number') {
      const diff = value - prev;
      if (Math.abs(diff) > threshold) {
        const newDir: FlashDir = diff > 0 ? 'up' : 'down';

        // Stop any in-flight animation and reset before starting fresh
        animRef.current?.stop();
        progress.setValue(0);
        setDir(newDir);

        // Rise to peak (35 % of duration) then fade back (65 %)
        animRef.current = Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: durationMs * 0.35,
            useNativeDriver: false,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: durationMs * 0.65,
            useNativeDriver: false,
          }),
        ]);

        animRef.current.start(() => setDir(null));
      }
    }

    prevRef.current = value;
  }, [value]);

  return { progress, dir };
}
