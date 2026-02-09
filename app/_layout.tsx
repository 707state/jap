import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SettingsProvider } from "@/contexts/settings-context";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { NavigationTrigger } from "@/components/navigation-trigger";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNavigation = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNavigation = () => {
    setIsNavOpen(false);
  };

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>

            {/* 导航触发器 */}
            <NavigationTrigger
              onPress={toggleNavigation}
              isOpen={isNavOpen}
              position="top-left"
              showLabel={false}
              size="medium"
            />

            {/* 导航侧边栏 */}
            <NavigationSidebar isOpen={isNavOpen} onClose={closeNavigation} />

            <StatusBar style="auto" />
          </SafeAreaView>
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
