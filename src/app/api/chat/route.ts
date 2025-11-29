import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um assistente pessoal inteligente e prestativo. Responda de forma clara, objetiva e amigável. Ajude o usuário com suas dúvidas, forneça informações úteis e seja sempre educado.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Erro na API de chat:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem", details: error.message },
      { status: 500 }
    );
  }
}
