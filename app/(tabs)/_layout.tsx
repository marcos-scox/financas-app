import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarLabelStyle: { fontSize: 9, fontWeight: "900", marginBottom: 2 }, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 62 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 } }}>
    <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={22} color={color} /> }} />
    <Tabs.Screen name="accounts" options={{ title: "Contas", tabBarIcon: ({ color }) => <IconSymbol name="creditcard.fill" size={22} color={color} /> }} />
    <Tabs.Screen name="investments" options={{ title: "Investir", tabBarIcon: ({ color }) => <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={color} /> }} />
    <Tabs.Screen name="piggy" options={{ title: "Cofrinho", tabBarIcon: ({ color }) => <IconSymbol name="lock.fill" size={22} color={color} /> }} />
    <Tabs.Screen name="assistant" options={{ title: "Assistente", tabBarIcon: ({ color }) => <IconSymbol name="sparkles" size={22} color={color} /> }} />
  </Tabs>;
}
