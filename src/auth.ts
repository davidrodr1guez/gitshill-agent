import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Cuando el usuario inicia sesión por primera vez
      if (account && profile) {
        const { supabaseAdmin } = await import('@/lib/supabase');
        
        // @ts-expect-error Profile data typing
        const twitterId = profile.data.id;
        // @ts-expect-error Profile data typing
        const username = profile.data.username;

        // Guardar/Actualizar en Supabase
        await supabaseAdmin.from('users').upsert({
          id: twitterId,
          username: username,
          twitter_access_token: account.access_token,
          twitter_refresh_token: account.refresh_token,
        });
        
        // Crear un Webhook único si no existe
        const { data: existingWebhook } = await supabaseAdmin
          .from('webhooks')
          .select('id')
          .eq('user_id', twitterId)
          .single();
          
        if (!existingWebhook) {
          await supabaseAdmin.from('webhooks').insert({ user_id: twitterId });
        }
        
        token.twitterId = twitterId;
        token.username = username;
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error Session user typing
      session.user.twitterId = token.twitterId;
      // @ts-expect-error Session user typing
      session.user.username = token.username;
      return session
    }
  }
})
