import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, EmptyState, Field, PrimaryButton, SectionTitle, Surface, styles } from "@/components/finance-ui";
import { Piggy, useFinance, formatCurrency } from "@/lib/finance-store";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function PiggyScreen() {
  const colors = useColors();
  const { piggies, savePiggy } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Piggy | null>(null);
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const total = piggies.reduce((sum, item) => sum + item.amount, 0);
  const reset = () => { setEditing(null); setBank(""); setAmount(""); };
  const edit = (item: Piggy) => { setEditing(item); setBank(item.bank); setAmount(String(item.amount)); setShowForm(true); };
  const submit = async () => { if (!bank.trim() || !amount.trim()) { Alert.alert("Faltam dados", "Informe o banco e o valor guardado."); return; } await savePiggy({ id: editing?.id, bank: bank.trim(), amount: Number(amount.replace(",", ".")) }); setShowForm(false); reset(); };

  return <ScreenContainer className="px-5 pt-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
    <AppHeader eyebrow="Reserva" title="Cofrinho" subtitle="Dê nome aos seus objetivos e saiba quanto já guardou." action={<Pressable onPress={() => { reset(); setShowForm(true); }} style={[styles.fab, { backgroundColor: colors.primary }]}><IconSymbol name="plus" size={22} color={colors.foreground} /></Pressable>} />
    <Surface style={{ backgroundColor: colors.primary, borderColor: colors.primary, alignItems: "center", paddingVertical: 24 }}><IconSymbol name="lock.fill" size={27} color={colors.foreground} /><Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "800", marginTop: 10, letterSpacing: 1 }}>TOTAL GUARDADO</Text><Text style={{ color: colors.foreground, fontSize: 31, fontWeight: "800", marginTop: 5 }}>{formatCurrency(total)}</Text><Text style={{ color: "#446A5A", fontSize: 12, marginTop: 5 }}>{piggies.length} {piggies.length === 1 ? "cofrinho" : "cofrinhos"}</Text></Surface>
    {showForm ? <Surface style={{ marginTop: 18 }}><SectionTitle title={editing ? "Editar cofrinho" : "Novo cofrinho"} action={<Pressable onPress={() => setShowForm(false)}><IconSymbol name="xmark" size={20} color={colors.muted} /></Pressable>} /><Field label="Nome do banco" value={bank} onChangeText={setBank} placeholder="Ex.: Banco principal" autoFocus /><Field label="Quanto você tem?" value={amount} onChangeText={setAmount} placeholder="0,00" keyboardType="decimal-pad" /><PrimaryButton label={editing ? "Salvar alterações" : "Criar cofrinho"} icon="checkmark.circle.fill" onPress={submit} /></Surface> : null}
    <SectionTitle title="Seus cofrinhos" />
    {piggies.length === 0 ? <EmptyState icon="lock.fill" title="Comece sua reserva" body="Cadastre o banco onde está seu dinheiro e acompanhe a evolução dos seus objetivos." /> : piggies.map((item) => <Surface key={item.id} style={{ marginBottom: 10, flexDirection: "row", alignItems: "center" }}><View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: colors.foreground, alignItems: "center", justifyContent: "center" }}><IconSymbol name="lock.fill" size={21} color={colors.primary} /></View><View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{item.bank}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Reserva disponível</Text></View><View style={{ alignItems: "flex-end" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{formatCurrency(item.amount)}</Text><Pressable onPress={() => edit(item)} style={{ marginTop: 6 }}><Text style={{ color: colors.success, fontSize: 11, fontWeight: "800" }}>Editar</Text></Pressable></View></Surface>)}
  </ScrollView></ScreenContainer>;
}

