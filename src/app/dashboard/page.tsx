import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  // @ts-ignore
  const twitterId = session.user.twitterId;

  // Obtener el webhook único
  const { data: webhook } = await supabaseAdmin
    .from('webhooks')
    .select('id')
    .eq('user_id', twitterId)
    .single();

  const webhookUrl = webhook 
    ? `https://gitshill.vercel.app/api/webhook/${webhook.id}`
    : "Generando...";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4 sm:px-8">
      <div className="max-w-3xl w-full bg-surface p-8 rounded-2xl border border-gray-800">
        <h1 className="text-3xl font-bold mb-2">Bienvenido, {session.user.name}</h1>
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
