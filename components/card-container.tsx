import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";

export interface CardContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  titleType?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  marginBottom?: number;
}

/**
 * 卡片容器组件
 * 自动将其内部的所有 ThemedText 组件渲染为黑色文本
 * 适用于学习功能、数据统计、快速入口等卡片区域
 */
export function CardContainer({
  children,
  style,
  title,
  titleType = "subtitle",
  backgroundColor = "#F8F9FA",
  borderRadius = 8,
  padding = 16,
  marginBottom = 20,
}: CardContainerProps) {
  // 递归处理子元素，将 ThemedText 组件转换为黑色版本
  const renderChildrenWithBlackText = (children: ReactNode): ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      const typedChild = child as React.ReactElement<any>;

      // 先递归处理子元素的 children
      let newChildren = typedChild.props.children;
      if (newChildren) {
        newChildren = renderChildrenWithBlackText(newChildren);
      }

      // 如果是 ThemedText 组件，添加 black={true} 属性
      if (typedChild.type === ThemedText) {
        return React.cloneElement(typedChild, {
          black: true,
          ...(newChildren ? { children: newChildren } : {}),
        });
      }

      // 如果不是 ThemedText 组件但有子元素，返回处理后的子元素
      if (newChildren && newChildren !== typedChild.props.children) {
        return React.cloneElement(typedChild, { children: newChildren });
      }

      return child;
    });
  };

  const containerStyle = {
    backgroundColor,
    borderRadius,
    padding,
    marginBottom,
  };

  return (
    <ThemedView style={[containerStyle, styles.container, style]}>
      {title && (
        <ThemedText type={titleType} black={true} style={styles.title}>
          {title}
        </ThemedText>
      )}
      <View style={styles.content}>
        {renderChildrenWithBlackText(children)}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  title: {
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
});
