import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    {
      id: "twitter",
      name: "Twitter",
      type: "oauth",
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      authorization: {
        url: "https://x.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read tweet.write offline.access",
          code_challenge_method: "S256",
        },
      },
      token: "https://api.x.com/2/oauth2/token",
      userinfo: "https://api.x.com/2/users/me",
      profile(profile: { data: { id: string; name: string; username: string; profile_image_url?: string } }) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: null,
          image: profile.data.profile_image_url,
        };
      },
      checks: ["pkce", "state"],
      style: { bg: "#1DA1F2", text: "#fff" },
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          const { supabaseAdmin } = await import('@/lib/supabase');
          
          // @ts-expect-error Profile data typing
          const twitterId = profile.data.id;
          // @ts-expect-error Profile data typing
          const username = profile.data.username;

          // Guardar/Actualizar en Supabase
          const { error: upsertError } = await supabaseAdmin.from('users').upsert({
            id: twitterId,
            username: username,
            twitter_access_token: account.access_token,
            twitter_refresh_token: account.refresh_token,
          });
          
          if (upsertError) console.error("Supabase Upsert Error:", upsertError);

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
        } catch (error) {
          console.error("JWT Callback Error:", error);
        }
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
