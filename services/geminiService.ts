
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, MonthlySummary } from "../types";

export const getFinancialInsights = async (transactions: Transaction[], summary: MonthlySummary[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise os seguintes dados financeiros pessoais:
  Transações Totais: ${transactions.length}
  Resumo Mensal: ${JSON.stringify(summary)}
  
  Forneça 3 dicas práticas para melhorar a saúde financeira, focando na proporção entre gastos à vista e parcelados. Responda em Português do Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro especialista em controle de gastos e planejamento pessoal.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return "Não foi possível gerar insights no momento. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
