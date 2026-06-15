    "use client"

    import { useState, useRef, useEffect } from "react"
    import { Sparkles, X, Send, Loader2, Minimize2 } from "lucide-react"
    import Link from "next/link"

    type Message = { role: "user" | "assistant"; content: string }

    export default function ChatbotWidget() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, open])

    async function sendMessage() {
        if (!input.trim() || loading) return
        const userMsg: Message = { role: "user", content: input }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput("")
        setLoading(true)

        try {
        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages, sessionId: "widget" }),
        })
        const data = await res.json()
        setMessages((prev) => [...prev, { role: "assistant", content: data.message ?? "Maaf, terjadi kesalahan." }])
        } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Maaf, saya sedang tidak bisa dihubungi." }])
        }
        setLoading(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
        {/* Chat window */}
        {open && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ height: "420px" }}>
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#6EB8BB] shrink-0">
                <Sparkles size={15} className="text-white" />
                <div className="flex-1">
                <p className="text-sm font-bold text-white">AI Assistant</p>
                <p className="text-[10px] text-green-200">Barling-GO</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <Minimize2 size={15} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                <div className="text-center pt-4">
                    <p className="text-xs text-gray-400 mb-3">Tanya seputar wisata Barlingmascakep!</p>
                    {["Destinasi wisata terbaik?", "Kuliner khas apa?"].map((s) => (
                    <button key={s} onClick={() => { setInput(s); sendMessage() }}
                        className="block w-full text-left text-xs px-3 py-2 bg-gray-50 hover:bg-green-50 hover:text-[#6EB8BB] rounded-lg mb-1.5 transition-colors">
                        {s}
                    </button>
                    ))}
                </div>
                )}
                {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                        ? "bg-[#6EB8BB] text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-700 rounded-tl-sm"
                    }`}>
                    {msg.content}
                    </div>
                </div>
                ))}
                {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1">
                        {[0,1,2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                        ))}
                    </div>
                    </div>
                </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-gray-100 shrink-0">
                <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tanya sesuatu..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6EB8BB]"
                />
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="w-8 h-8 bg-[#6EB8BB] disabled:opacity-40 text-white rounded-lg flex items-center justify-center">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>
            </div>

            {/* Link to full page */}
            <div className="px-3 pb-2 shrink-0">
                <Link href="/ai-assistant" className="text-[10px] text-[#6EB8BB] hover:underline">
                Buka AI Assistant penuh →
                </Link>
            </div>
            </div>
        )}

        {/* Toggle button */}
        <button
            onClick={() => setOpen(!open)}
            className="w-14 h-14 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/30 transition-all hover:scale-105"
        >
            {open ? <X size={22} /> : <Sparkles size={22} />}
        </button>
        </div>
    )
    }
