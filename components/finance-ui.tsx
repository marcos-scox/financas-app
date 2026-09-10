import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type PressableProps } from "react-native";

export function AppHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
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
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed, disabled && styles.disabled]}>
      <IconSymbol name={icon} size={18} color={colors.foreground} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, icon, onPress }: { label: string; icon?: "pencil" | "calendar" | "bell.fill" | "gearshape.fill"; onPress?: PressableProps["onPress"] }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, { borderColor: colors.border }, pressed && styles.pressed]}>
      {icon ? <IconSymbol name={icon} size={16} color={colors.foreground} /> : null}
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string; style?: object }) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.field, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }, style]}
        {...props}
      />
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.surface }]}>
      <Text style={[styles.chipText, { color: active ? colors.foreground : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, body }: { icon: "creditcard.fill" | "chart.line.uptrend.xyaxis" | "lock.fill" | "calendar" | "sparkles"; title: string; body: string }) {
  const colors = useColors();
  return (
    <View style={[styles.empty, { borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary }]}><IconSymbol name={icon} size={24} color={colors.foreground} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  headerCopy: { flex: 1, paddingRight: 12 },
  eyebrow: { color: "#5A756B", fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 7 },
  title: { color: "#10221E", fontSize: 31, fontWeight: "800", letterSpacing: -0.7, lineHeight: 36 },
  subtitle: { color: "#71817C", fontSize: 14, lineHeight: 20, marginTop: 6 },
  surface: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#DCE8E2" },
  sectionTitle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 11 },
  sectionTitleText: { color: "#10221E", fontSize: 17, fontWeight: "800" },
  primaryButton: { minHeight: 47, borderRadius: 15, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#10221E", fontWeight: "800", fontSize: 14 },
  ghostButton: { minHeight: 38, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ghostButtonText: { color: "#10221E", fontWeight: "700", fontSize: 12 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { color: "#5A756B", fontSize: 12, fontWeight: "800", marginBottom: 6 },
  field: { minHeight: 46, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontSize: 15 },
  chip: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 30, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: "800" },
  empty: { minHeight: 185, borderWidth: 1, borderStyle: "dashed", borderRadius: 20, padding: 22, justifyContent: "center", alignItems: "center" },
  emptyIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: "#10221E", fontWeight: "800", fontSize: 16, textAlign: "center" },
  emptyBody: { color: "#71817C", lineHeight: 19, fontSize: 13, textAlign: "center", marginTop: 7, maxWidth: 280 },
  fab: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  calendarArrow: { width: 32, height: 32, borderRadius: 11, backgroundColor: "#F5F7F6", alignItems: "center", justifyContent: "center" },
});
