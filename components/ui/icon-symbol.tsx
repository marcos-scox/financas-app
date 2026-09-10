import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName =
  | "house.fill"
  | "creditcard.fill"
  | "chart.line.uptrend.xyaxis"
  | "lock.fill"
  | "sparkles"
  | "calendar"
  | "bell.fill"
  | "plus"
  | "pencil"
  | "checkmark.circle.fill"
  | "circle"
  | "arrow.clockwise"
  | "gearshape.fill"
  | "arrow.up.right"
  | "chevron.left"
  | "chevron.right"
  | "paperplane.fill"
  | "xmark";

type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>["name"]>;

const MAPPING: IconMapping = {
  "house.fill": "home",
  "creditcard.fill": "account-balance-wallet",
  "chart.line.uptrend.xyaxis": "trending-up",
  "lock.fill": "savings",
  sparkles: "auto-awesome",
  calendar: "calendar-month",
  "bell.fill": "notifications-none",
  plus: "add",
  pencil: "edit",
  "checkmark.circle.fill": "check-circle",
  circle: "radio-button-unchecked",
  "arrow.clockwise": "refresh",
  "gearshape.fill": "settings",
  "arrow.up.right": "north-east",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "paperplane.fill": "send",
  xmark: "close",
};

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
