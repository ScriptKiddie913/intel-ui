export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold mb-8">
          Telegram Search Bot
        </h1>
        <p className="text-2xl mb-8">
          Web Interface for the Telegram Search Bot
        </p>
        <div className="bg-white/10 p-8 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>/api/search?query=keyword</li>
            <li>/api/stats</li>
            <li>/api/index</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

