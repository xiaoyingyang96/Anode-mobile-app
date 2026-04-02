/**
 * AnimatedMenuButton — faithful port of SentimentX's AnimatedMenuButton.
 *
 * Three bars animate on open/close:
 *   Top    → translateY(+5) + rotate(45°)
 *   Middle → opacity 0 + translateX(-6)
 *   Bottom → translateY(-5) + rotate(-45°)
 *
 * Duration matches SentimentX: 0.25s ease.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';

interface AnimatedMenuButtonProps {
  open: boolean;
  onPress: () => void;
  color?: string;
}

export default function AnimatedMenuButton({
  open,
  onPress,
  color = '#111827',
}: AnimatedMenuButtonProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [open]);

  // ── Top bar ──────────────────────────────────────────────────────────
  const topTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });
  const topRotate     = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  // ── Middle bar ───────────────────────────────────────────────────────
  const midOpacity    = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const midTranslateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  // ── Bottom bar ───────────────────────────────────────────────────────
  const botTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const botRotate     = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] });

  const barStyle = [styles.bar, { backgroundColor: color }];

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.btn}
      activeOpacity={0.7}
      accessibilityLabel={open ? 'Close menu' : 'Open menu'}
      accessibilityRole="button"
    >
      {/* Top */}
      <Animated.View
        style={[
          barStyle,
          styles.top,
          { transform: [{ translateY: topTranslateY }, { rotate: topRotate }] },
        ]}
      />
      {/* Middle */}
      <Animated.View
        style={[
          barStyle,
          styles.mid,
          { opacity: midOpacity, transform: [{ translateX: midTranslateX }] },
        ]}
      />
      {/* Bottom */}
      <Animated.View
        style={[
          barStyle,
          styles.bot,
          { transform: [{ translateY: botTranslateY }, { rotate: botRotate }] },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Container is 20×20, bars positioned exactly like SentimentX's Box layout
  bar: {
    position: 'absolute',
    left: 8,   // (36 - 20) / 2
    right: 8,
    height: 2,
    borderRadius: 999,
  },
  top: { top: 12 },   // (36/2 - 10) + 4  ≈ top: 4 within the 20px box
  mid: { top: 17 },   // top: 9 within box
  bot: { top: 22 },   // top: 14 within box
});
