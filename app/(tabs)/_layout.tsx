import { Stack } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "主页",
        }}
      />
      <Stack.Screen
        name="learn"
        options={{
          title: "学习",
        }}
      />
      <Stack.Screen
        name="kana-list"
        options={{
          title: "假名表",
        }}
      />
      <Stack.Screen
        name="quiz"
        options={{
          title: "测验",
        }}
      />
      <Stack.Screen
        name="input-learn"
        options={{
          title: "输入学习",
        }}
      />
    </Stack>
  );
}
