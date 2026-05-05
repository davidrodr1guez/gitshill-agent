export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4 sm:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-neon opacity-10 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-neon/30 text-neon text-sm font-mono mb-8 animate-glow">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          Live on Pump.fun
        </div>
        
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          The AI Agent that turns <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-green-300">
            Commits into Hype
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-12">
          You build. We shill. Connect your GitHub repository and let our agent automatically tweet your updates. 100% of revenue buys back and burns $SHILL.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button className="px-8 py-4 bg-neon text-background font-bold rounded-lg hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] flex items-center justify-center gap-2">
            Install on GitHub
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </button>
          <a href="https://pump.fun" target="_blank" rel="noreferrer" className="px-8 py-4 bg-surface text-foreground font-bold rounded-lg border border-gray-800 hover:border-gray-600 transition-all">
            Buy $SHILL on Pump.fun
          </a>
        </div>
      </div>

      {/* Flywheel Stats Section */}
      <div className="relative z-10 w-full max-w-5xl mt-32 mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">The Buyback & Burn Flywheel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
              <span className="text-2xl">💻</span>
            </div>
            <h3 className="text-xl font-bold mb-2">1. You Commit</h3>
            <p className="text-gray-400 text-sm">Push code to your repository. Our webhook detects the changes instantly.</p>
          </div>
          <div className="bg-surface p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center relative">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-neon/30 animate-glow">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-2">2. We Shill</h3>
            <p className="text-gray-400 text-sm">The agent generates a viral tweet translating tech-jargon to marketing.</p>
          </div>
          <div className="bg-surface p-8 rounded-2xl border border-neon/20 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neon/5 pointer-events-none" />
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-neon/50">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-neon">3. Buyback & Burn</h3>
            <p className="text-gray-400 text-sm">Revenue is sent directly to the agent wallet, automatically buying and burning $SHILL.</p>
          </div>
        </div>
      </div>

      {/* Live Stats Mockup */}
      <div className="w-full border-t border-gray-800 mt-auto">
        <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col sm:flex-row justify-around items-center gap-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Commits Processed</p>
            <p className="text-4xl font-mono font-bold text-white">0</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Revenue Generated</p>
            <p className="text-4xl font-mono font-bold text-green-400">$0.00</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">$SHILL Burned</p>
            <p className="text-4xl font-mono font-bold text-red-500">0</p>
          </div>
        </div>
      </div>
    </main>
  )
}
