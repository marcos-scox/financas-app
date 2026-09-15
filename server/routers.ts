import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assistant: router({
    chat: publicProcedure
      .input(z.object({
        question: z.string().min(1).max(4000),
        context: z.object({
          bills: z.number().int().min(0),
          investments: z.number().int().min(0),
          piggy: z.number().int().min(0),
          assistantInstructions: z.string().min(1).max(6000),
        }),
      }))
      .mutation(async ({ input }) => {
        if (!ENV.groqApiKey) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A chave segura do assistente ainda não foi configurada." });
        }
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${ENV.groqApiKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.35,
            max_tokens: 900,
            messages: [
              { role: "system", content: input.context.assistantInstructions },
              { role: "system", content: `Contexto local resumido: ${input.context.bills} conta(s) em aberto, ${input.context.investments} investimento(s) e ${input.context.piggy} cofrinho(s).` },
              { role: "user", content: input.question },
            ],
          }),
        });
        if (!response.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: "A API de IA não respondeu agora." });
        const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const answer = payload.choices?.[0]?.message?.content?.trim();
        if (!answer) throw new TRPCError({ code: "BAD_GATEWAY", message: "A IA respondeu sem texto." });
        return { answer };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
