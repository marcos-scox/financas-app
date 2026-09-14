import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
export { formatCurrency, formatDate } from "@/lib/finance-utils";
import { formatCurrency } from "@/lib/finance-utils";

export type Bill = {
  id: string;
  title: string;
  amount: number;
  installments: number;
  currentInstallment: number;
  dueDate: string;
  paid: boolean;
  reminderEnabled: boolean;
  reminderId?: string;
};

export type InvestmentCategory = "Fundos" | "Cripto" | "Pessoal";

export type Investment = {
  id: string;
  name: string;
  category: InvestmentCategory;
  investedAmount: number;
  quantity?: number;
  apiUrl: string;
  apiMethod?: string;
  pricePath?: string;
  currentQuote?: number;
  currentValue?: number;
  updatedAt?: string;
};

export type Piggy = {
  id: string;
  bank: string;
  amount: number;
};

type FinanceState = {
  bills: Bill[];
  investments: Investment[];
  piggies: Piggy[];
  assistantApiUrl: string;
  assistantApiKey: string;
};

type FinanceContextValue = FinanceState & {
  hydrated: boolean;
  saveBill: (bill: Omit<Bill, "id"> & { id?: string }) => Promise<void>;
  toggleBillPaid: (bill: Bill) => Promise<void>;
  saveInvestment: (investment: Omit<Investment, "id"> & { id?: string }) => Promise<void>;
  refreshInvestment: (investment: Investment) => Promise<{ ok: boolean; message: string }>;
  savePiggy: (piggy: Omit<Piggy, "id"> & { id?: string }) => Promise<void>;
  saveAssistantConfig: (apiUrl: string, apiKey: string) => Promise<void>;
};

const STORAGE_KEY = "financas-local-v1";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseMoney(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

async function scheduleReminder(bill: Bill) {
  if (Platform.OS === "web" || !bill.reminderEnabled) return undefined;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bills", {
      name: "Lembretes de contas",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 100, 180],
      lightColor: "#92F2C0",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return undefined;

  const triggerDate = new Date(`${bill.dueDate}T09:00:00`);
  if (Number.isNaN(triggerDate.getTime())) return undefined;
  if (triggerDate.getTime() <= Date.now()) triggerDate.setMinutes(new Date().getMinutes() + 1);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Conta vencendo",
      body: `${bill.title} · ${formatCurrency(bill.amount)}`,
      data: { billId: bill.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, repeats: false, seconds: Math.max(1, Math.floor((triggerDate.getTime() - Date.now()) / 1000)) },
  });
}

async function cancelReminder(reminderId?: string) {
  if (Platform.OS !== "web" && reminderId) {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
  }
}

const initialState: FinanceState = {
  bills: [],
  investments: [],
  piggies: [],
  assistantApiUrl: "",
  assistantApiKey: "",
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            setState({ ...initialState, ...JSON.parse(stored) });
          } catch {
            setState(initialState);
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const persist = async (next: FinanceState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveBill = async (input: Omit<Bill, "id"> & { id?: string }) => {
    const existing = input.id ? state.bills.find((item) => item.id === input.id) : undefined;
    if (existing?.reminderId) await cancelReminder(existing.reminderId);
    const bill: Bill = {
      ...input,
      id: input.id ?? id(),
      amount: parseMoney(input.amount),
      installments: Math.max(1, Math.round(input.installments || 1)),
      currentInstallment: Math.min(Math.max(1, Math.round(input.currentInstallment || 1)), Math.max(1, Math.round(input.installments || 1))),
    };
    const reminderId = await scheduleReminder(bill);
    const saved = { ...bill, reminderId };
    const bills = existing ? state.bills.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...state.bills];
    await persist({ ...state, bills });
  };

  const toggleBillPaid = async (bill: Bill) => {
    const next = { ...bill, paid: !bill.paid };
    const bills = state.bills.map((item) => (item.id === bill.id ? next : item));
    await persist({ ...state, bills });
  };

  const saveInvestment = async (input: Omit<Investment, "id"> & { id?: string }) => {
    const investment: Investment = { ...input, id: input.id ?? id(), investedAmount: parseMoney(input.investedAmount) };
    const exists = state.investments.some((item) => item.id === investment.id);
    const investments = exists ? state.investments.map((item) => (item.id === investment.id ? investment : item)) : [investment, ...state.investments];
    await persist({ ...state, investments });
  };

  const readPath = (payload: unknown, path: string) => {
    if (!path.trim()) return undefined;
    return path.trim().split(".").reduce<unknown>((value, key) => {
      if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
      return undefined;
    }, payload);
  };

  const findQuote = (payload: any, path: string) => {
    const explicit = readPath(payload, path);
    const candidates = [explicit, payload?.value, payload?.price, payload?.quote, payload?.rate, payload?.last, payload?.result?.price, payload?.result?.value, payload?.result?.quote, payload?.data?.value, payload?.data?.price, payload?.data?.quote, payload?.result?.data?.price];
    for (const candidate of candidates) {
      const value = typeof candidate === "number" ? candidate : Number(String(candidate ?? "").replace(",", "."));
      if (Number.isFinite(value) && value > 0) return value;
    }
    return undefined;
  };

  const refreshInvestment = async (investment: Investment) => {
    if (!investment.apiUrl.trim()) return { ok: false, message: "Cole uma URL de webhook para atualizar esta cotação." };
    try {
      const isJsonRpc = Boolean(investment.apiMethod?.trim()) || /quiknode\.pro|jsonrpc/i.test(investment.apiUrl);
      const response = await fetch(investment.apiUrl.trim(), isJsonRpc ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: investment.apiMethod?.trim() || "getblockchaininfo", params: [] }) } : undefined);
      if (!response.ok) throw new Error("Resposta não disponível");
      const payload = await response.json();
      const value = findQuote(payload, investment.pricePath || "");
      if (!value) throw new Error(isJsonRpc ? "A API respondeu, mas esse método não trouxe uma cotação. Um nó Bitcoin informa blockchain/blocos; use uma API de preço ou informe o campo do preço." : "A resposta não contém um valor numérico reconhecível. Informe o caminho do campo, por exemplo data.price.");
      const quantity = Number(investment.quantity || 0);
      const total = quantity > 0 ? parseMoney(quantity * value) : value;
      const updated = { ...investment, currentQuote: value, currentValue: total, updatedAt: new Date().toISOString() };
      const investments = state.investments.map((item) => (item.id === investment.id ? updated : item));
      await persist({ ...state, investments });
      return { ok: true, message: `Atualizado em ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.` };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Não foi possível atualizar agora." };
    }
  };

  const savePiggy = async (input: Omit<Piggy, "id"> & { id?: string }) => {
    const piggy: Piggy = { ...input, id: input.id ?? id(), amount: parseMoney(input.amount) };
    const exists = state.piggies.some((item) => item.id === piggy.id);
    const piggies = exists ? state.piggies.map((item) => (item.id === piggy.id ? piggy : item)) : [piggy, ...state.piggies];
    await persist({ ...state, piggies });
  };

  const saveAssistantConfig = async (apiUrl: string, apiKey: string) => {
    await persist({ ...state, assistantApiUrl: apiUrl.trim(), assistantApiKey: apiKey.trim() });
  };

  const value = useMemo(() => ({ ...state, hydrated, saveBill, toggleBillPaid, saveInvestment, refreshInvestment, savePiggy, saveAssistantConfig }), [state, hydrated]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value) throw new Error("useFinance precisa estar dentro de FinanceProvider");
  return value;
}
