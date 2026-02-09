import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { ThemedText } from "./themed-text";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8;
const MAX_SIDEBAR_WIDTH = 320;

interface NavigationItem {
  id: string;
  title: string;
  iconName: string;
  route: string;
}

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const navigationItems: NavigationItem[] = [
    {
      id: "home",
      title: "主页",
      iconName: "home",
      route: "/(tabs)",
    },
    {
      id: "learn",
      title: "学习",
      iconName: "book",
      route: "/(tabs)/learn",
    },
    {
      id: "kana-list",
      title: "假名表",
      iconName: "list",
      route: "/(tabs)/kana-list",
    },
    {
      id: "quiz",
      title: "测验",
      iconName: "checkmark-circle",
      route: "/(tabs)/quiz",
    },
    {
      id: "input-learn",
      title: "输入学习",
      iconName: "keyboard",
      route: "/(tabs)/input-learn",
    },
  ];

  React.useEffect(() => {
    const sidebarWidth = Math.min(SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX]);

  const handleNavigation = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const isActive = (route: string) => {
    return (
      pathname === route ||
      (route === "/(tabs)" && pathname === "/(tabs)/index")
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* 侧边栏 */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: Math.min(SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH),
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* 头部 */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Ionicons name="menu" size={24} color="#007AFF" />
                <ThemedText type="title" style={styles.title}>
                  导航菜单
                </ThemedText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 导航项目 */}
            <View style={styles.navigationSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                功能模块
              </ThemedText>

              {navigationItems.map((item) => {
                const active = isActive(item.route);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.navItem, active && styles.activeNavItem]}
                    onPress={() => handleNavigation(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.navItemContent}>
                      <Ionicons
                        name={item.iconName as any}
                        size={22}
                        color={active ? "#007AFF" : "#666"}
                        style={styles.navIcon}
                      />
                      <ThemedText
                        style={[styles.navText, active && styles.activeNavText]}
                      >
                        {item.title}
                      </ThemedText>
                    </View>
                    {active && (
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#007AFF"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 应用信息 */}
            <View style={styles.infoSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                应用信息
              </ThemedText>

              <View style={styles.infoItem}>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color="#666"
                  style={styles.infoIcon}
                />
                <ThemedText style={styles.infoText}>
                  日语50音学习应用
                </ThemedText>
              </View>

              <View style={styles.infoItem}>
                <Ionicons
                  name="star"
                  size={18}
                  color="#666"
                  style={styles.infoIcon}
                />
                <ThemedText style={styles.infoText}>版本 1.0.0</ThemedText>
              </View>

              <View style={styles.infoItem}>
                <Ionicons
                  name="time"
                  size={18}
                  color="#666"
                  style={styles.infoIcon}
                />
                <ThemedText style={styles.infoText}>持续更新中</ThemedText>
              </View>
            </View>

            {/* 使用提示 */}
            <View style={styles.tipsSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                使用提示
              </ThemedText>

              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <ThemedText style={styles.tipText}>
                  点击左上角菜单按钮可随时打开此导航
                </ThemedText>
              </View>

              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <ThemedText style={styles.tipText}>
                  点击任意功能模块可快速切换页面
                </ThemedText>
              </View>

              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <ThemedText style={styles.tipText}>
                  当前页面会以高亮显示
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "white",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  navigationSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#333",
  },
  navItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeNavItem: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navIcon: {
    marginRight: 12,
  },
  navText: {
    fontSize: 16,
    color: "#333",
  },
  activeNavText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
