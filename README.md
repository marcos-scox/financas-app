# Finanças — Controle pessoal

Aplicativo Android para organizar contas, vencimentos, investimentos, reservas e dúvidas financeiras em um só lugar.

## Download

<a href="https://github.com/marcos-scox/financas-app/releases/latest/download/Financas.apk">**Baixar o APK Android**</a>

> O APK de release é gerado pelo GitHub Actions a cada atualização na branch `main` e publicado automaticamente na release mais recente.

## O que já está disponível

- **Início:** resumo de contas em aberto, valores guardados, próximo vencimento, investimentos e lembretes ativos.
- **Contas:** cadastro e edição de conta, valor, quantidade de parcelas, parcela atual, vencimento em calendário mensal e check-in de pagamento.
- **Lembretes:** opção de agendar uma notificação local do Android para cada conta cadastrada.
- **Investimentos:** cadastro por nome, categoria (fundos, cripto ou pessoal), valor investido e webhook/API opcional para atualização de cotação.
- **Cofrinho:** cadastro de banco, valor guardado e edição dos registros.
- **Assistente:** conversa sobre organização financeira com modo local e configuração opcional de uma API externa compatível com `POST`.
- **Persistência local:** os dados ficam salvos no próprio aparelho usando AsyncStorage.

## Como instalar

1. Baixe o arquivo `Financas.apk` pelo link acima.
2. No Android, permita a instalação de aplicativos desta fonte quando solicitado.
3. Abra o APK e conclua a instalação.
4. Para receber lembretes, aceite a permissão de notificações quando o app solicitar.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Verificações locais:

```bash
pnpm test
pnpm check
```

O workflow em `.github/workflows/android-apk.yml` prepara o projeto nativo com Expo, compila `assembleRelease`, salva o APK como artefato e publica uma release no GitHub com o arquivo `Financas.apk`.

## Formato esperado das integrações

Para cotações, o webhook configurado em um investimento deve retornar JSON com um campo numérico chamado `value`, `price`, `quote` ou `rate` — também é aceito o mesmo campo dentro de `data`.

Para o assistente, a URL configurada recebe um `POST` com `message`, `question` e um resumo do contexto local. A resposta pode usar `answer`, `message` ou `text`. A chave, quando preenchida, é enviada como `Authorization: Bearer ...`.

> As respostas do assistente são educativas e não substituem orientação profissional. O app não executa ordens de compra ou venda.
