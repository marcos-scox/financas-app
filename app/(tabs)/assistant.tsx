import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, Field, PrimaryButton, SectionTitle, Surface } from "@/components/finance-ui";
import { useFinance, formatCurrency } from "@/lib/finance-store";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

type Message = { role: "user" | "assistant"; text: string };

function localAnswer(question: string, context: { bills: number; investments: number; piggy: number }) {
  const normalized = question.toLowerCase();
  if (normalized.includes("conta") || normalized.includes("vencimento")) return `Você tem ${context.bills} conta(s) em aberto. Uma boa prática é separar o valor das contas fixas assim que receber e revisar os vencimentos uma vez por semana.`;
  if (normalized.includes("invest") || normalized.includes("cripto") || normalized.includes("fundo")) return `Sua carteira tem ${context.investments} investimento(s) cadastrado(s). Compare objetivo, prazo e risco antes de aumentar uma posição; a diversificação não elimina riscos, mas ajuda a não depender de um único ativo.`;
  if (normalized.includes("guardar") || normalized.includes("cofrinho") || normalized.includes("reserva")) return `Você tem ${context.piggy} cofrinho(s). Para uma reserva de emergência, priorize liquidez e segurança; defina um valor mensal automático que caiba no orçamento.`;
  return "Posso ajudar a organizar seu orçamento, priorizar contas, explicar conceitos de investimentos ou montar um plano de reserva. Escreva sua dúvida de forma simples.";
}

export default function AssistantScreen() {
  const colors = useColors();
  const { bills, investments, piggies, assistantApiUrl, assistantApiKey, saveAssistantConfig } = useFinance();
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Olá. Sou seu assistente de finanças. Posso ajudar a organizar contas, investimentos e objetivos — sem substituir orientação profissional." }]);
  const [question, setQuestion] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(assistantApiUrl);
  const [apiKey, setApiKey] = useState(assistantApiKey);
  const [sending, setSending] = useState(false);
  const context = useMemo(() => ({ bills: bills.filter((bill) => !bill.paid).length, investments: investments.length, piggy: piggies.length }), [bills, investments, piggies]);

  const send = async () => {
    const text = question.trim();
    if (!text || sending) return;
    setQuestion(""); setMessages((current) => [...current, { role: "user", text }]); setSending(true);
    let answer = "";
    if (assistantApiUrl.trim()) {
      try {
        const response = await fetch(assistantApiUrl, { method: "POST", headers: { "Content-Type": "application/json", ...(assistantApiKey ? { Authorization: `Bearer ${assistantApiKey}` } : {}) }, body: JSON.stringify({ message: text, question: text, context }) });
        const payload = await response.json();
        answer = payload.answer ?? payload.message ?? payload.text ?? "A API respondeu sem um campo answer, message ou text.";
      } catch { answer = "Não consegui falar com a API configurada. Verifique a URL, a rede e o formato de resposta."; }
    } else answer = localAnswer(text, context);
    setMessages((current) => [...current, { role: "assistant", text: answer }]); setSending(false);
  };

  const saveConfig = async () => { await saveAssistantConfig(apiUrl, apiKey); setShowSettings(false); Alert.alert("Configuração salva", "A URL será usada nas próximas perguntas. A API deve aceitar POST com message e responder answer, message ou text."); };

  return <ScreenContainer className="px-5 pt-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
    <AppHeader eyebrow="Orientação" title="Assistente" subtitle="Pergunte sobre seus próximos passos financeiros." action={<Pressable onPress={() => setShowSettings((current) => !current)}><IconSymbol name="gearshape.fill" size={23} color={colors.muted} /></Pressable>} />
    <Surface style={{ backgroundColor: colors.foreground, borderColor: colors.foreground, padding: 17 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><IconSymbol name="sparkles" size={20} color={colors.foreground} /></View><View><Text style={{ color: colors.surface, fontWeight: "800", fontSize: 15 }}>Assistente financeiro</Text><Text style={{ color: "#B9CDC4", fontSize: 11, marginTop: 3 }}>{assistantApiUrl ? "API personalizada conectada" : "Modo local pronto para ajudar"}</Text></View></View></Surface>
    {showSettings ? <Surface style={{ marginTop: 15 }}><SectionTitle title="Configurar API" action={<Pressable onPress={() => setShowSettings(false)}><IconSymbol name="xmark" size={20} color={colors.muted} /></Pressable>} /><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>Opcional: informe uma API compatível com POST. Se ficar vazio, o assistente usa orientações locais básicas.</Text><Field label="URL da API" value={apiUrl} onChangeText={setApiUrl} placeholder="https://sua-api.com/chat" autoCapitalize="none" autoCorrect={false} keyboardType="url" /><Field label="Chave da API (opcional)" value={apiKey} onChangeText={setApiKey} placeholder="Bearer token" secureTextEntry autoCapitalize="none" autoCorrect={false} /><PrimaryButton label="Salvar configuração" icon="checkmark.circle.fill" onPress={saveConfig} /></Surface> : null}
    <View style={{ marginTop: 18 }}>{messages.map((message, index) => <View key={`${message.role}-${index}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", backgroundColor: message.role === "user" ? colors.primary : colors.surface, borderWidth: 1, borderColor: message.role === "user" ? colors.primary : colors.border, borderRadius: 18, borderBottomRightRadius: message.role === "user" ? 5 : 18, borderBottomLeftRadius: message.role === "assistant" ? 5 : 18, padding: 14, marginBottom: 10 }}><Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 20 }}>{message.text}</Text></View>)}</View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 3, marginBottom: 15 }}><Pressable onPress={() => setQuestion("Como organizar minhas contas?")} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>Organizar contas</Text></Pressable><Pressable onPress={() => setQuestion("Como montar uma reserva?")} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>Montar reserva</Text></Pressable><Pressable onPress={() => setQuestion("O que devo saber antes de investir?")} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>Antes de investir</Text></Pressable></View>
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}><View style={{ flex: 1 }}><Field label="Sua pergunta" value={question} onChangeText={setQuestion} placeholder="Escreva aqui..." multiline /></View><View style={{ paddingBottom: 12 }}><PrimaryButton label={sending ? "..." : "Enviar"} icon="paperplane.fill" onPress={send} disabled={sending || !question.trim()} /></View></View>
    <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 10 }}>As respostas são educativas e não constituem recomendação de investimento.</Text>
  </ScrollView></ScreenContainer>;
}
