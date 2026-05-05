import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // 1. Buscar a qué usuario pertenece este webhook
    const { data: webhook } = await supabaseAdmin
      .from('webhooks')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook no encontrado o inválido.' }, { status: 404 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('twitter_access_token, twitter_refresh_token, username')
      .eq('id', webhook.user_id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const payload = await req.json();

    // 2. Extraer contexto de GitHub
    if (payload.commits && payload.commits.length > 0) {
      const author = payload.commits[0]?.author.name || payload.pusher.name;
      const repoName = payload.repository.name;

      const allCommitMessages = payload.commits.map((c: any) => c.message).join(" | ");
      const addedFiles = new Set<string>();
      const modifiedFiles = new Set<string>();
      const removedFiles = new Set<string>();
      
      payload.commits.forEach((c: any) => {
        c.added?.forEach((f: string) => addedFiles.add(f));
        c.modified?.forEach((f: string) => modifiedFiles.add(f));
        c.removed?.forEach((f: string) => removedFiles.add(f));
      });

      console.log(`\n🟢 [WEBHOOK] Push de ${author} para cliente @${user.username}`);
      
      let finalTweetText = '';

      // 3. Generar Tweet con Gemini
      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        try {
          const prompt = `Eres un experto en marketing cripto y de software. Tu trabajo es tomar datos de un avance de código (push) y convertirlos en UN SOLO tweet corto, viral y emocionante (máximo 200 caracteres, SIN HASHTAGS). Siempre menciona que los devs están construyendo. Usa emojis.\n\nDatos:\nRepositorio: ${repoName}\nAutor: ${author}\nMensajes: "${allCommitMessages}"\nArchivos nuevos: ${Array.from(addedFiles).join(', ') || '0'}\nArchivos modificados: ${Array.from(modifiedFiles).join(', ') || '0'}\n\nEscribe el tweet ahora:`;
          
          const result = await model.generateContent(prompt);
          const aiGeneratedText = result.response.text().trim();
          finalTweetText = `${aiGeneratedText}\n\n$SHILL Buyback & Burn incoming 🔥`;
        } catch (error) {
          finalTweetText = `🚀 Just shipped ${payload.commits.length} updates to ${repoName}!\n\nBuilt by ${author}. $SHILL buyback & burn incoming! 🔥`;
        }
      } else {
        finalTweetText = `🚀 Just shipped ${payload.commits.length} updates to ${repoName}!\n\nBuilt by ${author}. $SHILL buyback incoming! 🔥`;
      }

      // 4. Publicar en el Twitter del Cliente (OAuth 2.0)
      try {
        const client = new TwitterApi({
          clientId: process.env.TWITTER_CLIENT_ID!,
          clientSecret: process.env.TWITTER_CLIENT_SECRET!,
        });

        // Refrescar el token usando el refresh_token del usuario guardado en DB
        const { client: refreshedClient, accessToken, refreshToken } = await client.refreshOAuth2Token(user.twitter_refresh_token);

        // Guardar los nuevos tokens en Supabase para el futuro
        await supabaseAdmin.from('users').update({
          twitter_access_token: accessToken,
          twitter_refresh_token: refreshToken
        }).eq('id', webhook.user_id);

        // Twittear!
        await refreshedClient.v2.tweet(finalTweetText);
        console.log(`✅ Tweet publicado exitosamente en la cuenta de @${user.username}`);
        
      } catch (twitterError) {
        console.error(`❌ Error publicando en Twitter de cliente:`, twitterError);
        return NextResponse.json({ error: 'Error publicando en X' }, { status: 500 });
      }

      return NextResponse.json({ success: true, tweet: finalTweetText });
    }

    return NextResponse.json({ success: true, message: 'Ping received' });
  } catch (error) {
    console.error('Error general del webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook SaaS is Live.' });
}
