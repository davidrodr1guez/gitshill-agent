import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  // @ts-expect-error Session user typing
  const twitterId = session.user.twitterId as string | undefined;
  const userName = session.user.name || "Usuario";

  let webhookUrl = "Error: No se pudo obtener tu ID de Twitter. Intenta cerrar sesión y volver a iniciar.";

  if (twitterId) {
    // Verificar que el usuario existe en Supabase, si no crearlo
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', twitterId)
      .single();

    if (!existingUser) {
      await supabaseAdmin.from('users').upsert({
        id: twitterId,
        // @ts-expect-error Session user typing
        username: session.user.username || userName,
      });
    }

    // Obtener o crear el webhook único
    let { data: webhook } = await supabaseAdmin
      .from('webhooks')
      .select('id')
      .eq('user_id', twitterId)
      .single();

    if (!webhook) {
      const { data: newWebhook } = await supabaseAdmin
        .from('webhooks')
        .insert({ user_id: twitterId })
        .select('id')
        .single();
      webhook = newWebhook;
    }

    webhookUrl = webhook
      ? `https://gitshill.vercel.app/api/webhook/${webhook.id}`
      : "Error al generar webhook. Recarga la página.";
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4 sm:px-8">
      <div className="max-w-3xl w-full bg-surface p-8 rounded-2xl border border-gray-800">
        <h1 className="text-3xl font-bold mb-2">Bienvenido, {userName}</h1>
        <p className="text-gray-400 mb-8">Esta es tu consola de GitShill. Conecta tu repositorio de GitHub para empezar a twittear automáticamente.</p>
        
        <div className="bg-black p-6 rounded-xl border border-neon/30 relative">
          <h2 className="text-neon font-mono font-bold mb-4">Tu Webhook de GitHub</h2>
          <p className="text-sm text-gray-400 mb-2">Copia esta URL y pégala en los ajustes de Webhooks de tu repositorio en GitHub:</p>
          
          <code className="block w-full bg-gray-900 p-4 rounded text-green-300 font-mono text-sm break-all">
            {webhookUrl}
          </code>
          
          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <p>• Payload URL: <span className="text-white">Arriba</span></p>
            <p>• Content type: <span className="text-white">application/json</span></p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="px-6 py-2 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition-all">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
