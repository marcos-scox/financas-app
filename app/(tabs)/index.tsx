import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, EmptyState, SectionTitle, Surface, styles } from "@/components/finance-ui";
import { useFinance, formatCurrency, formatDate } from "@/lib/finance-store";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScrollView, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();
  const { bills, investments, piggies } = useFinance();
  const openBills = bills.filter((bill) => !bill.paid);
  const totalBills = openBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPiggy = piggies.reduce((sum, item) => sum + item.amount, 0);
  const nextBill = [...openBills].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <ScreenContainer className="px-5 pt-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <AppHeader eyebrow="Finanças pessoais" title="Tudo sob controle." subtitle="Organize seu dinheiro com clareza, no seu ritmo." />

        <Surface style={{ backgroundColor: colors.foreground, borderColor: colors.foreground, padding: 20 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.1 }}>VISÃO GERAL</Text>
          <Text style={{ color: colors.surface, fontSize: 25, fontWeight: "800", marginTop: 8 }}>Seu próximo passo começa aqui.</Text>
          <Text style={{ color: "#B9CDC4", lineHeight: 20, fontSize: 13, marginTop: 7 }}>Cadastre contas, acompanhe seus investimentos e crie reservas para seus objetivos.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
            <View style={{ flex: 1, backgroundColor: "#1B322B", borderRadius: 15, padding: 13 }}><Text style={{ color: "#99B0A7", fontSize: 11 }}>Contas em aberto</Text><Text style={{ color: colors.surface, fontWeight: "800", fontSize: 17, marginTop: 5 }}>{formatCurrency(totalBills)}</Text></View>
            <View style={{ flex: 1, backgroundColor: "#1B322B", borderRadius: 15, padding: 13 }}><Text style={{ color: "#99B0A7", fontSize: 11 }}>Cofrinhos</Text><Text style={{ color: colors.surface, fontWeight: "800", fontSize: 17, marginTop: 5 }}>{formatCurrency(totalPiggy)}</Text></View>
          </View>
        </Surface>

        <SectionTitle title="Próximo vencimento" />
        {nextBill ? (
          <Surface style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <View style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><IconSymbol name="calendar" size={22} color={colors.foreground} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{nextBill.title}</Text><Text style={{ color: colors.muted, marginTop: 3, fontSize: 12 }}>Vence em {formatDate(nextBill.dueDate)}</Text></View>
            <Text style={{ color: colors.foreground, fontWeight: "800" }}>{formatCurrency(nextBill.amount)}</Text>
          </Surface>
        ) : (
          <EmptyState icon="calendar" title="Seu calendário está livre" body="As próximas contas aparecerão aqui assim que você cadastrar o primeiro vencimento." />
        )}

        <SectionTitle title="Seus espaços" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}><IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.success} /><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 12 }}>Investimentos</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{investments.length} cadastrados</Text></View>
          <View style={{ flex: 1, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}><IconSymbol name="bell.fill" size={20} color={colors.warning} /><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 12 }}>Lembretes</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{bills.filter((bill) => bill.reminderEnabled).length} ativos</Text></View>
        </View>

        <View style={{ alignItems: "center", marginTop: 28 }}><Text style={{ color: colors.muted, fontSize: 12 }}>Navegue pelas abas abaixo para começar.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
