import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type PressableProps } from "react-native";

export function AppHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()} <Text style={styles.dot}>✦</Text></Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Surface({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionTitleText}>{title}</Text>{action}</View>;
}

export function PrimaryButton({ label, icon = "plus", onPress, disabled }: { label: string; icon?: "plus" | "checkmark.circle.fill" | "arrow.clockwise" | "paperplane.fill"; onPress?: PressableProps["onPress"]; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed, disabled && styles.disabled]}><IconSymbol name={icon} size={17} color="#0A0A0E" /><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

export function GhostButton({ label, icon, onPress }: { label: string; icon?: "pencil" | "calendar" | "bell.fill" | "gearshape.fill"; onPress?: PressableProps["onPress"] }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, { borderColor: colors.border }, pressed && styles.pressed]}>{icon ? <IconSymbol name={icon} size={16} color={colors.foreground} /> : null}<Text style={styles.ghostButtonText}>{label}</Text></Pressable>;
}

export function Field({ label, style, ...props }: TextInputProps & { label: string; style?: object }) {
  const colors = useColors();
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={[styles.field, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }, style]} {...props} /></View>;
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.surface }]}><Text style={[styles.chipText, { color: active ? "#0A0A0E" : colors.muted }]}>{label}</Text></Pressable>;
}

export function EmptyState({ icon, title, body }: { icon: "creditcard.fill" | "chart.line.uptrend.xyaxis" | "lock.fill" | "calendar" | "sparkles"; title: string; body: string }) {
  const colors = useColors();
  return <View style={[styles.empty, { borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: colors.primary }]}><IconSymbol name={icon} size={24} color="#0A0A0E" /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}

export const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 },
  headerCopy: { flex: 1, paddingRight: 12 },
  eyebrow: { color: "#B7FF45", fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 9 },
  dot: { color: "#A981FF" },
  title: { color: "#F5F5EF", fontSize: 34, fontWeight: "900", letterSpacing: -1.4, lineHeight: 38 },
  subtitle: { color: "#9B9BA6", fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 310 },
  surface: { backgroundColor: "#14141A", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#2A2A34" },
  sectionTitle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 28, marginBottom: 12 },
  sectionTitleText: { color: "#F5F5EF", fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  primaryButton: { minHeight: 47, borderRadius: 999, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#0A0A0E", fontWeight: "900", fontSize: 13 },
  ghostButton: { minHeight: 38, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ghostButtonText: { color: "#F5F5EF", fontWeight: "800", fontSize: 12 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  fieldWrap: { marginBottom: 13 },
  fieldLabel: { color: "#9B9BA6", fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginBottom: 7, textTransform: "uppercase" },
  field: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  chip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, marginRight: 8 },
  chipText: { fontSize: 11, fontWeight: "900" },
  empty: { minHeight: 190, borderWidth: 1, borderStyle: "dashed", borderRadius: 22, padding: 22, justifyContent: "center", alignItems: "center", backgroundColor: "#101015" },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 13 },
  emptyTitle: { color: "#F5F5EF", fontWeight: "900", fontSize: 16, textAlign: "center" },
  emptyBody: { color: "#9B9BA6", lineHeight: 19, fontSize: 13, textAlign: "center", marginTop: 7, maxWidth: 280 },
  fab: { width: 45, height: 45, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  calendarArrow: { width: 32, height: 32, borderRadius: 999, backgroundColor: "#23232C", alignItems: "center", justifyContent: "center" },
});
