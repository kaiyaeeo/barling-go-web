    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // POST /api/ai/chat
    export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // Boleh diakses tanpa login, tapi history disimpan jika login
    const { data: { user } } = await supabase.auth.getUser()

    const { messages, sessionId } = await request.json()
    if (!messages?.length) return NextResponse.json({ error: "messages required" }, { status: 400 })

    // Ambil data konteks: produk & destinasi terpopuler untuk AI
    const [{ data: destinations }, { data: topProducts }] = await Promise.all([
        supabase.from("contents")
        .select("title, type, description, location")
        .eq("is_published", true)
        .limit(20),
        supabase.from("products")
        .select("name, price, categories(name, type)")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(20),
    ])

    const contextText = [
        "=== DESTINASI WISATA ===",
        ...(destinations ?? []).map((d) => `- ${d.title} (${d.type}): ${d.description ?? ""} ${d.location ? `· Lokasi: ${d.location}` : ""}`),
        "\n=== PRODUK & KULINER ===",
        ...(topProducts ?? []).map((p: any) => `- ${p.name} (${p.categories?.name ?? p.categories?.type ?? ""}) - Rp ${Number(p.price).toLocaleString("id-ID")}`),
    ].join("\n")

    const systemPrompt = `Kamu adalah Barling-GO AI Assistant, pemandu wisata dan kuliner interaktif untuk wilayah Barlingmascakep (Banjarnegara, Purbalingga, Banyumas, Cilacap, Kebumen).
    Tugasmu:
    1. Menjawab pertanyaan seputar pariwisata, makanan khas, dan UMKM di wilayah tersebut.
    2. Memberikan rekomendasi itinerary (rencana perjalanan) jika diminta.
    3. Merekomendasikan produk/destinasi yang ada di dalam database.

    Data terkini yang kamu miliki:
    ${contextText}

    Jika ditanya di luar topik wisata/kuliner Barlingmascakep, arahkan kembali ke topik tersebut dengan ramah.
    Jawab secara ringkas dan padat, gunakan emoji secukupnya agar lebih menarik.`

    // Mengubah format pesan agar sesuai dengan standar Gemini API
    const geminiMessages = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
    }))

    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
        throw new Error("GEMINI_API_KEY tidak ditemukan di .env.local")
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            // FITUR BARU: Menggunakan systemInstruction bawaan Gemini
            systemInstruction: {
            parts: [{ text: systemPrompt }]
            },
            contents: geminiMessages
        }),
        })

        if (!response.ok) {
        const err = await response.json()
        // Tampilkan error asli di terminal VS Code jika masih gagal
        console.error("DETAIL ERROR GEMINI:", JSON.stringify(err, null, 2))
        throw new Error(err.error?.message ?? "AI error")
        }

        const data = await response.json()
        const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Maaf, saya sedang tidak bisa merespons saat ini."

        // Simpan history jika user login
        if (user && sessionId) {
        const lastUserMsg = messages[messages.length - 1]
        await supabase.from("ai_chat_history").insert([
            { user_id: user.id, session_id: sessionId, role: "user", content: lastUserMsg.content },
            { user_id: user.id, session_id: sessionId, role: "assistant", content: assistantMessage },
        ])
        }

        return NextResponse.json({ message: assistantMessage })
    } catch (error: any) {
        console.error("AI Chat Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    }