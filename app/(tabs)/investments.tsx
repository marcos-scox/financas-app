import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, Chip, EmptyState, Field, PrimaryButton, SectionTitle, Surface, styles } from "@/components/finance-ui";
import { Investment, InvestmentCategory, useFinance, formatCurrency } from "@/lib/finance-store";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

const categories: InvestmentCategory[] = ["Fundos", "Cripto", "Pessoal"];

export default function InvestmentsScreen() {
  const colors = useColors();
  const { investments, saveInvestment, refreshInvestment } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InvestmentCategory>("Fundos");
  const [investedAmount, setInvestedAmount] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const reset = () => { setEditing(null); setName(""); setCategory("Fundos"); setInvestedAmount(""); setApiUrl(""); };
  const edit = (investment: Investment) => { setEditing(investment); setName(investment.name); setCategory(investment.category); setInvestedAmount(String(investment.investedAmount)); setApiUrl(investment.apiUrl); setShowForm(true); };
  const submit = async () => { if (!name.trim() || !investedAmount.trim()) { Alert.alert("Faltam dados", "Preencha o nome e o valor investido."); return; } await saveInvestment({ id: editing?.id, name: name.trim(), category, investedAmount: Number(investedAmount.replace(",", ".")), apiUrl }); setShowForm(false); reset(); };
  const refresh = async (investment: Investment) => { setRefreshingId(investment.id); const result = await refreshInvestment(investment); setRefreshingId(null); Alert.alert(result.ok ? "Cotação atualizada" : "Não foi possível atualizar", result.message); };

  return <ScreenContainer className="px-5 pt-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
    <AppHeader eyebrow="Patrimônio" title="Investimentos" subtitle="Registre onde seu dinheiro está e acompanhe as cotações." action={<Pressable onPress={() => { reset(); setShowForm(true); }} style={[styles.fab, { backgroundColor: colors.primary }]}><IconSymbol name="plus" size={22} color={colors.foreground} /></Pressable>} />
    <Surface style={{ backgroundColor: colors.foreground, borderColor: colors.foreground }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>COMO FUNCIONA</Text><Text style={{ color: colors.surface, fontSize: 17, lineHeight: 23, fontWeight: "800", marginTop: 7 }}>Cole um webhook para acompanhar qualquer preço em tempo real.</Text><Text style={{ color: "#B9CDC4", fontSize: 12, lineHeight: 18, marginTop: 6 }}>A resposta deve conter um campo numérico como value, price, quote ou rate.</Text></Surface>
    {showForm ? <Surface style={{ marginTop: 18 }}><SectionTitle title={editing ? "Editar investimento" : "Novo investimento"} action={<Pressable onPress={() => setShowForm(false)}><IconSymbol name="xmark" size={20} color={colors.muted} /></Pressable>} /><Field label="Nome do investimento" value={name} onChangeText={setName} placeholder="Ex.: Dólar" autoFocus /><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>Categoria</Text><View style={{ flexDirection: "row", marginBottom: 13 }}>{categories.map((item) => <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</View><Field label="Quanto investi?" value={investedAmount} onChangeText={setInvestedAmount} placeholder="0,00" keyboardType="decimal-pad" /><Field label="Webhook / API de cotação (opcional)" value={apiUrl} onChangeText={setApiUrl} placeholder="https://..." autoCapitalize="none" autoCorrect={false} keyboardType="url" /><PrimaryButton label={editing ? "Salvar alterações" : "Cadastrar investimento"} icon="checkmark.circle.fill" onPress={submit} /></Surface> : null}
    <SectionTitle title="Sua carteira" />
    {investments.length === 0 ? <EmptyState icon="chart.line.uptrend.xyaxis" title="Nenhum investimento ainda" body="Cadastre fundos, cripto ou investimentos pessoais e adicione uma fonte de cotação quando quiser." /> : investments.map((investment) => <Surface key={investment.id} style={{ marginBottom: 10 }}><View style={{ flexDirection: "row", alignItems: "flex-start" }}><View style={{ flex: 1 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }}>{investment.name}</Text><View style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 }}><Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "800" }}>{investment.category}</Text></View></View><Text style={{ color: colors.muted, fontSize: 12, marginTop: 7 }}>Investido: {formatCurrency(investment.investedAmount)}</Text>{investment.currentValue !== undefined ? <Text style={{ color: colors.success, fontSize: 13, fontWeight: "800", marginTop: 5 }}>Cotação lida: {investment.currentValue.toLocaleString("pt-BR", { maximumFractionDigits: 6 })}</Text> : <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>Sem cotação atualizada</Text>}</View><Pressable onPress={() => edit(investment)}><IconSymbol name="pencil" size={18} color={colors.muted} /></Pressable></View><View style={{ flexDirection: "row", gap: 8, marginTop: 15 }}>{investment.apiUrl ? <Pressable onPress={() => refresh(investment)} disabled={refreshingId === investment.id} style={[styles.ghostButton, { borderColor: colors.border, flex: 1 }]}><IconSymbol name="arrow.clockwise" size={16} color={colors.foreground} /><Text style={styles.ghostButtonText}>{refreshingId === investment.id ? "Atualizando..." : "Atualizar cotação"}</Text></Pressable> : null}<View style={{ flex: 1, justifyContent: "center" }}><Text style={{ color: colors.muted, fontSize: 11, textAlign: "right" }}>{investment.updatedAt ? `Atualizado ${new Date(investment.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Webhook não configurado"}</Text></View></View></Surface>)}
  </ScrollView></ScreenContainer>;
}

