    "use client"

    import { useState, useRef, useEffect } from "react"
    import { Send, Loader2, Sparkles, MapPin, UtensilsCrossed, ShoppingBag, RefreshCw } from "lucide-react"
    import Link from "next/link"

    type Message = { role: "user" | "assistant"; content: string }

    const SUGGESTIONS = [
    { icon: MapPin, text: "Rekomendasikan destinasi wisata di Banyumas" },
    { icon: UtensilsCrossed, text: "Kuliner khas Purwokerto yang wajib dicoba" },
    { icon: ShoppingBag, text: "Oleh-oleh terbaik dari Barlingmascakep" },
    { icon: Sparkles, text: "Buat itinerary 2 hari di Cilacap" },
    ]

    export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [sessionId] = useState(() => `session-${Date.now()}`)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function sendMessage(text: string) {
        if (!text.trim() || loading) return
        const userMsg: Message = { role: "user", content: text }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput("")
        setLoading(true)

        try {
        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages, sessionId }),
        })
        const data = await res.json()
        setMessages((prev) => [...prev, { role: "assistant", content: data.message ?? "Maaf, terjadi kesalahan." }])
        } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Maaf, saya sedang tidak bisa dihubungi. Coba lagi nanti." }])
        }
        setLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-16 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6EB8BB] flex items-center justify-center shrink-0">
                <Sparkles size={17} className="text-white" />
            </div>
            <div>
                <h1 className="text-base font-bold text-gray-900">AI Assistant Barling-GO</h1>
                <p className="text-xs text-gray-400">Teman perjalananmu di Barlingmascakep</p>
            </div>
            {messages.length > 0 && (
                <button
                onClick={() => setMessages([])}
                className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                title="Reset percakapan"
                >
                <RefreshCw size={15} />
                </button>
            )}
            </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
                /* Welcome screen */
                <div className="text-center pt-8">
                <div className="w-16 h-16 rounded-2xl bg-[#6EB8BB]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-[#6EB8BB]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Halo! Ada yang bisa saya bantu?</h2>
                <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
                    Tanyakan apa saja seputar wisata, kuliner, dan oleh-oleh khas Barlingmascakep.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {SUGGESTIONS.map((s) => {
                    const Icon = s.icon
                    return (
                        <button
                        key={s.text}
                        onClick={() => sendMessage(s.text)}
                        className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl text-left text-sm text-gray-700 hover:border-[#6EB8BB] hover:bg-green-50 hover:text-[#6EB8BB] transition-all group"
                        >
                        <Icon size={16} className="shrink-0 text-gray-400 group-hover:text-[#6EB8BB]" />
                        {s.text}
                        </button>
                    )
                    })}
                </div>
                </div>
            ) : (
                /* Messages */
                <div className="space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg bg-[#6EB8BB] flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={13} className="text-white" />
                        </div>
                    )}
                    <div
                        className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                            ? "bg-[#6EB8BB] text-white rounded-tr-sm"
                            : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"
                        }`}
                    >
                        {msg.content}
                    </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-[#6EB8BB] flex items-center justify-center shrink-0">
                        <Sparkles size={13} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                        </div>
                    </div>
                    </div>
                )}
                <div ref={bottomRef} />
                </div>
            )}
            </div>
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-gray-100 px-4 py-4">
            <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tanya seputar wisata, kuliner, atau oleh-oleh Barlingmascakep..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none leading-relaxed"
                    style={{ maxHeight: "120px", overflowY: "auto" }}
                />
                </div>
                <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-11 h-11 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
                >
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 text-center">
                Enter untuk kirim · Shift+Enter untuk baris baru
            </p>
            </div>
        </div>
        </main>
    )
    }
