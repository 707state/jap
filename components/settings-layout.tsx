import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTrigger } from "./settings-trigger";

interface SettingsLayoutProps {
  children: React.ReactNode;
  showTrigger?: boolean;
  triggerPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  triggerSize?: "small" | "medium" | "large";
  triggerShowLabel?: boolean;
}

/**
 * 带全局设置侧边栏的页面包装器组件
 * 自动在每个页面中添加设置触发按钮和侧边栏
 */
export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  showTrigger = true,
  triggerPosition = "top-right",
  triggerSize = "medium",
  triggerShowLabel = false,
}) => {
  return (
    <View style={styles.container}>
      {/* 页面内容 */}
      <View style={styles.content}>{children}</View>

      {/* 设置触发按钮 */}
      {showTrigger && (
        <SettingsTrigger
          position={triggerPosition}
          size={triggerSize}
          showLabel={triggerShowLabel}
        />
      )}

      {/* 设置侧边栏 */}
      <SettingsSidebar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
  },
});
