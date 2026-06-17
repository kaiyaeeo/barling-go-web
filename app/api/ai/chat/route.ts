    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Cek user yang login (Aman dari error)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // 2. Ambil payload dari frontend
        const { messages, sessionId } = await request.json()
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
        }

        // 3. Ambil data konteks (DIBUNGKUS TRY-CATCH AGAR AI TIDAK CRASH JIKA DB ERROR)
        let destinations: any[] = []
        let topProducts: any[] = []
        
        try {
        const [destRes, prodRes] = await Promise.all([
            supabase.from("contents").select("title, type, description, location").eq("is_published", true).limit(10),
            supabase.from("products").select("name, price, categories(name, type)").eq("is_active", true).order("rating", { ascending: false }).limit(10),
        ])
        destinations = destRes.data || []
        topProducts = prodRes.data || []
        } catch (dbError) {
        console.error("Supabase Query Warning (Diabaikan, AI tetap lanjut):", dbError)
        }

        // 4. Susun Context
        const contextText = [
        "=== DESTINASI WISATA ===",
        ...destinations.map((d: any) => `- ${d.title} (${d.type}): ${d.description ?? ""} ${d.location ? `· Lokasi: ${d.location}` : ""}`),
        "\n=== PRODUK & KULINER ===",
        ...topProducts.map((p: any) => `- ${p.name} (${p.categories?.name ?? p.categories?.type ?? ""}) - Rp ${Number(p.price).toLocaleString("id-ID")}`),
        ].join("\n")

        const systemPrompt = `Kamu adalah Barling-GO AI Assistant, pemandu wisata dan kuliner interaktif untuk wilayah Barlingmascakep (Banjarnegara, Purbalingga, Banyumas, Cilacap, Kebumen).
    Tugasmu:
    1. Menjawab pertanyaan seputar pariwisata, makanan khas, dan UMKM di wilayah tersebut.
    2. Memberikan rekomendasi itinerary (rencana perjalanan) jika diminta.
    3. Merekomendasikan produk/destinasi yang ada di dalam database.

    Data terkini yang kamu miliki:
    ${contextText}

    Jika ditanya di luar topik wisata/kuliner Barlingmascakep, arahkan kembali ke topik tersebut dengan ramah.
    Jawab secara ringkas, asik, dan padat. Gunakan emoji secukupnya agar lebih menarik.`

        // 5. FORMAT PESAN STRICT KE GEMINI (Filter pesan kosong & pastikan role benar)
        const geminiMessages = messages
        .filter((m: any) => m.content && m.content.trim() !== "") // Buang pesan kosong
        .map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
        }))

        // 6. Validasi API Key
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
        throw new Error("GEMINI_API_KEY belum dipasang di file .env")
        }

        // 7. TEMBAK KE GEMINI API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: {
            parts: [{ text: systemPrompt }]
            },
            contents: geminiMessages
        }),
        })

        const data = await response.json()

        // 8. TANGKAP ERROR GEMINI
        if (!response.ok) {
        console.error("\n=== DETAIL ERROR GEMINI API ===")
        console.error(JSON.stringify(data, null, 2))
        console.error("===============================\n")
        throw new Error(data.error?.message ?? "API Gemini menolak permintaan.")
        }

        const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Maaf, aku bingung mau jawab apa."

        // 9. SIMPAN HISTORY (Jika user login dan tidak ada error DB)
        if (user && sessionId) {
        try {
            const lastUserMsg = messages[messages.length - 1]
            await supabase.from("ai_chat_history").insert([
            { user_id: user.id, session_id: sessionId, role: "user", content: lastUserMsg.content },
            { user_id: user.id, session_id: sessionId, role: "assistant", content: assistantMessage },
            ])
        } catch (historyError) {
            console.error("Gagal menyimpan chat history:", historyError)
        }
        }

        // 10. KEMBALIKAN JAWABAN
        return NextResponse.json({ message: assistantMessage })

    } catch (error: any) {
        console.error("AI Chat Route Error:", error.message)
        // Beri pesan ramah ke user agar web tidak terlihat rusak
        return NextResponse.json({ 
        message: "Aduh, otak AI-ku lagi nge-blank sebentar. Boleh tanya lagi dalam beberapa detik?" 
        }, { status: 500 })
    }
    }