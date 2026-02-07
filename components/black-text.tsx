import { StyleSheet, Text, type TextProps } from "react-native";

export type BlackTextProps = TextProps & {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

/**
 * 黑色文本组件，专门用于在卡片等背景上显示黑色文字
 * 在亮色和暗色模式下都使用黑色，确保在浅色背景上的可读性
 */
export function BlackText({
  style,
  type = "default",
  ...rest
}: BlackTextProps) {
  return (
    <Text
      style={[
        { color: "#000000" }, // 始终使用黑色
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
