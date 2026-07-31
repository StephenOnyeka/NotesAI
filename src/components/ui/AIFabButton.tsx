import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Magicpen } from 'iconsax-react-nativejs';

import { Spacing } from '@/constants/theme';

interface AIFabButtonProps {
  onPress: () => void;
  bottomOffset?: number;
}

export function AIFabButton({ onPress, bottomOffset = 124 }: AIFabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.fabContainer, { bottom: bottomOffset }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.gradientInner}>
        <Magicpen size={26} color="#FFFFFF" variant="Bold" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: Spacing.four,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    zIndex: 99,
  },
  gradientInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
