import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

interface NavigationTriggerProps {
  onPress: () => void;
  isOpen?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const NavigationTrigger: React.FC<NavigationTriggerProps> = ({
  onPress,
  isOpen = false,
  position = 'top-left',
  showLabel = false,
  size = 'medium',
}) => {
  // 根据位置确定样式
  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return styles.topLeft;
      case 'top-right':
        return styles.topRight;
      case 'bottom-left':
        return styles.bottomLeft;
      case 'bottom-right':
        return styles.bottomRight;
      default:
        return styles.topLeft;
    }
  };

  // 根据大小确定图标大小
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  // 根据大小确定按钮大小
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const iconSize = getIconSize();
  const buttonStyle = getButtonSize();
  const positionStyle = getPositionStyle();

  return (
    <View style={[styles.container, positionStyle]}>
      <TouchableOpacity
        style={[styles.button, buttonStyle, isOpen && styles.activeButton]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isOpen ? "close" : "menu"}
          size={iconSize}
          color={isOpen ? "#007AFF" : "#666"}
        />
        {showLabel && (
          <ThemedText style={[
            styles.label,
            isOpen && styles.activeLabel
          ]}>
            {isOpen ? '关闭菜单' : '菜单'}
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  topLeft: {
    top: 50,
    left: 16,
  },
  topRight: {
    top: 50,
    right: 16,
  },
  bottomLeft: {
    bottom: 80,
    left: 16,
  },
  bottomRight: {
    bottom: 80,
    right: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 6,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
