import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, Chip, EmptyState, Field, GhostButton, PrimaryButton, SectionTitle, Surface, styles } from "@/components/finance-ui";
import { Bill, useFinance, formatCurrency, formatDate } from "@/lib/finance-store";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function Calendar({ bills, selectedDate, onSelect }: { bills: Bill[]; selectedDate: string; onSelect: (date: string) => void }) {
  const colors = useColors();
  const initial = new Date(`${selectedDate}T12:00:00`);
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear] = useState(initial.getFullYear());
  const days = new Date(year, month + 1, 0).getDate();
  const first = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: first + days }, (_, index) => index < first ? null : index - first + 1);
  const shiftMonth = (offset: number) => { const next = new Date(year, month + offset, 1); setMonth(next.getMonth()); setYear(next.getFullYear()); };
  const dateString = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const billsByDate = new Set(bills.map((bill) => bill.dueDate));
  return <Surface style={{ padding: 14 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><Pressable onPress={() => shiftMonth(-1)} style={styles.calendarArrow}><IconSymbol name="chevron.left" size={18} color={colors.foreground} /></Pressable><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{MONTHS[month]} {year}</Text><Pressable onPress={() => shiftMonth(1)} style={styles.calendarArrow}><IconSymbol name="chevron.right" size={18} color={colors.foreground} /></Pressable></View>
    <View style={{ flexDirection: "row" }}>{WEEKDAYS.map((day, index) => <Text key={`${day}-${index}`} style={{ flex: 1, textAlign: "center", color: colors.muted, fontWeight: "800", fontSize: 11, marginBottom: 7 }}>{day}</Text>)}</View>
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{cells.map((day, index) => day ? <Pressable key={day} onPress={() => onSelect(dateString(day))} style={{ width: "14.285%", aspectRatio: 1, alignItems: "center", justifyContent: "center" }}><View style={{ width: 33, height: 33, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: selectedDate === dateString(day) ? colors.primary : "transparent", borderWidth: billsByDate.has(dateString(day)) ? 2 : 0, borderColor: colors.warning }}><Text style={{ color: colors.foreground, fontWeight: selectedDate === dateString(day) || billsByDate.has(dateString(day)) ? "800" : "500", fontSize: 12 }}>{day}</Text></View></Pressable> : <View key={`empty-${index}`} style={{ width: "14.285%", aspectRatio: 1 }} />)}</View>
  </Surface>;
}

export default function AccountsScreen() {
  const colors = useColors();
  const { bills, saveBill, toggleBillPaid } = useFinance();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("1");
  const [currentInstallment, setCurrentInstallment] = useState("1");
  const [dueDate, setDueDate] = useState(selectedDate);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const sortedBills = useMemo(() => [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [bills]);
  const resetForm = () => { setEditing(null); setTitle(""); setAmount(""); setInstallments("1"); setCurrentInstallment("1"); setDueDate(selectedDate); setReminderEnabled(true); };
  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (bill: Bill) => { setEditing(bill); setTitle(bill.title); setAmount(String(bill.amount)); setInstallments(String(bill.installments)); setCurrentInstallment(String(bill.currentInstallment)); setDueDate(bill.dueDate); setReminderEnabled(bill.reminderEnabled); setShowForm(true); };
  const submit = async () => {
    if (!title.trim() || !amount.trim() || !dueDate.trim()) { Alert.alert("Faltam dados", "Preencha nome, valor e vencimento."); return; }
    await saveBill({ id: editing?.id, title: title.trim(), amount: Number(amount.replace(",", ".")), installments: Number(installments), currentInstallment: Number(currentInstallment), dueDate, paid: editing?.paid ?? false, reminderEnabled });
    setShowForm(false); resetForm();
  };

  return <ScreenContainer className="px-5 pt-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
    <AppHeader eyebrow="Organização" title="Contas" subtitle="Veja os vencimentos e marque o que já foi pago." action={<Pressable onPress={openCreate} style={[styles.fab, { backgroundColor: colors.primary }]}><IconSymbol name="plus" size={22} color={colors.foreground} /></Pressable>} />
    <Calendar bills={bills} selectedDate={selectedDate} onSelect={(date) => { setSelectedDate(date); setDueDate(date); }} />
    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}><Chip label={`${bills.length} cadastradas`} active /><Chip label={`${bills.filter((bill) => bill.paid).length} pagas`} /></View>

    {showForm ? <Surface style={{ marginTop: 18 }}><SectionTitle title={editing ? "Editar conta" : "Nova conta"} action={<Pressable onPress={() => setShowForm(false)}><IconSymbol name="xmark" size={20} color={colors.muted} /></Pressable>} /><Field label="O que você vai pagar?" value={title} onChangeText={setTitle} placeholder="Ex.: Internet" autoFocus /><Field label="Valor da parcela" value={amount} onChangeText={setAmount} placeholder="0,00" keyboardType="decimal-pad" /><View style={{ flexDirection: "row", gap: 10 }}><Field label="Total de parcelas" value={installments} onChangeText={setInstallments} keyboardType="number-pad" style={{ flex: 1 }} /><Field label="Parcela atual" value={currentInstallment} onChangeText={setCurrentInstallment} keyboardType="number-pad" style={{ flex: 1 }} /></View><Field label="Vencimento (AAAA-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="2026-09-15" /><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, marginBottom: 13 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><IconSymbol name="bell.fill" size={18} color={colors.warning} /><Text style={{ color: colors.foreground, fontWeight: "700" }}>Lembrar no celular</Text></View><Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.surface} /></View><PrimaryButton label={editing ? "Salvar alterações" : "Cadastrar conta"} icon="checkmark.circle.fill" onPress={submit} /></Surface> : null}

    <SectionTitle title="Próximos vencimentos" action={bills.length ? <Text style={{ color: colors.muted, fontSize: 12 }}>{bills.filter((bill) => !bill.paid).length} em aberto</Text> : undefined} />
    {sortedBills.length === 0 ? <EmptyState icon="creditcard.fill" title="Nenhuma conta cadastrada" body="Toque no botão + para adicionar um pagamento, definir parcelas e ativar lembretes." /> : sortedBills.map((bill) => <Surface key={bill.id} style={{ marginBottom: 10, padding: 15, opacity: bill.paid ? 0.62 : 1 }}><View style={{ flexDirection: "row", alignItems: "center" }}><Pressable onPress={() => toggleBillPaid(bill)} style={{ marginRight: 12 }}><IconSymbol name={bill.paid ? "checkmark.circle.fill" : "circle"} size={25} color={bill.paid ? colors.success : colors.muted} /></Pressable><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15, textDecorationLine: bill.paid ? "line-through" : "none" }}>{bill.title}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{formatDate(bill.dueDate)} · parcela {bill.currentInstallment}/{bill.installments}</Text></View><View style={{ alignItems: "flex-end" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{formatCurrency(bill.amount)}</Text><Pressable onPress={() => openEdit(bill)} style={{ marginTop: 6 }}><Text style={{ color: colors.success, fontSize: 11, fontWeight: "800" }}>Editar</Text></Pressable></View></View></Surface>)}
  </ScrollView></ScreenContainer>;
}

