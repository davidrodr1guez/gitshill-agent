import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // 1. Verificar si es un push event de GitHub
    if (payload.commits && payload.commits.length > 0) {
      const commit = payload.commits[0];
      const commitMessage = commit.message;
      const author = commit.author.name;
      const repoName = payload.repository.name;

      console.log(`\n\n🟢 [WEBHOOK] ¡Nuevo Commit Detectado!`);
      console.log(`- Repositorio: ${repoName}`);
      console.log(`- Autor: ${author}`);
      console.log(`- Mensaje: ${commitMessage}`);
      
      let finalTweetText = '';

      // 2. Conectar a Gemini (Google) para generar un texto épico
      if (process.env.GEMINI_API_KEY) {
        console.log(`\n🧠 Conectando con Gemini (Google) para redactar el tweet...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        try {
          const prompt = `Eres un experto en marketing de startups tecnológicas y criptomonedas (degens). Tu trabajo es tomar mensajes aburridos de commits de código y convertirlos en tweets cortos, virales, y emocionantes (máximo 200 caracteres, SIN HASHTAGS aburridos). Siempre menciona de forma ingeniosa que los fundadores están construyendo sin parar. Usa emojis.\n\nConvierte este commit en un tweet:\nRepositorio: ${repoName}\nAutor: ${author}\nCommit: "${commitMessage}"`;
          
          const result = await model.generateContent(prompt);
          const aiGeneratedText = result.response.text().trim();
          finalTweetText = `${aiGeneratedText}\n\n$SHILL Buyback & Burn incoming 🔥`;
        } catch (aiError) {
          console.error('❌ Error de Gemini:', aiError);
          // Fallback si falla Gemini
          finalTweetText = `🚀 The dev team just shipped an update to ${repoName}!\n\n"${commitMessage}"\n\nBuilt by ${author}. $SHILL buyback & burn incoming! 🔥`;
        }
      } else {
        console.log(`\n⚠️  No hay GEMINI_API_KEY en .env.local. Usando tweet de prueba.`);
        finalTweetText = `🚀 Just shipped an update to ${repoName}!\n\n"${commitMessage}"\n\nBuilt by ${author}. Another step forward. $SHILL buyback incoming! 🔥`;
      }
      
      console.log(`\n🐦 [TWEET FINAL]:\n${finalTweetText}\n\n`);

      // 3. Publicar en X (Twitter)
      if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET) {
        console.log(`📡 Conectando con la API de X...`);
        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY,
          appSecret: process.env.TWITTER_API_SECRET,
          accessToken: process.env.TWITTER_ACCESS_TOKEN,
          accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        const rwClient = twitterClient.readWrite;
        try {
          await rwClient.v2.tweet(finalTweetText);
          console.log(`✅ ¡Tweet publicado exitosamente en X!`);
        } catch (twitterError) {
          console.error(`❌ Error al publicar en X:`, twitterError);
        }
      } else {
        console.log(`⚠️  Keys de X (Twitter) no detectadas en .env.local. El tweet solo se imprimió en consola.`);
      }

      return NextResponse.json({ success: true, tweet: finalTweetText });
    }

    return NextResponse.json({ success: true, message: 'Ping received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook is live and waiting for commits.' });
}
