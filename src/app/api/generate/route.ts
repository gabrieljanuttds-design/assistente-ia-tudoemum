import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em geração de textos. Crie conteúdo de alta qualidade baseado nas instruções do usuário. Seja criativo, claro e profissional. Adapte o tom e estilo conforme solicitado.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const result = completion.choices[0]?.message?.content || "Erro ao gerar texto.";

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Erro na API de geração:", error);
    return NextResponse.json(
      { error: "Erro ao gerar texto", details: error.message },
      { status: 500 }
    );
  }
}
