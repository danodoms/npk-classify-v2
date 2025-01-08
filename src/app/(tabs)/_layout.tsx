import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/src/components/HapticTab";
import { IconSymbol } from "@/src/components/ui/IconSymbol";
import TabBarBackground from "@/src/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { House, Scan, History, UserRound } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          title: "Home",
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarShowLabel: false,
          title: "Scan",
          tabBarIcon: ({ color }) => <Scan color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          tabBarShowLabel: false,
          title: "Results",
          tabBarIcon: ({ color }) => <History color={color} />,
        }}
      />

      {/* <Tabs.Screen
        name="account"
        options={{
          tabBarShowLabel: false,
          title: "Account",
          tabBarIcon: ({ color }) => <UserRound color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
