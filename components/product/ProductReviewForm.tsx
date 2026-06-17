    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Star, Loader2, Send, Camera, Smile, Image, X, CheckCircle2, AlertCircle } from "lucide-react"

    type Props = {
    productId: string
    userName?: string
    }

    export default function ProductReviewForm({ productId, userName = "Pembeli" }: Props) {
    const router = useRouter()
    const supabase = createClient()

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    // Emoji reactions
    const emojis = ["😍", "👍", "😊", "🤔", "😤"]

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length + images.length > 3) {
        alert("Maksimal 3 foto")
        return
        }
        setImages(prev => [...prev, ...files])
        const newPreviews = files.map(file => URL.createObjectURL(file))
        setImagePreviews(prev => [...prev, ...newPreviews])
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!rating) {
        setError("Mohon beri rating terlebih dahulu")
        return
        }
        if (!body.trim()) {
        setError("Mohon tulis komentar Anda")
        return
        }

        setLoading(true)

        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        const { error } = await supabase.from("product_reviews").insert({
            product_id: productId,
            user_id: user.id,
            rating: rating,
            body: body.trim(),
            // images: imagePreviews // jika ada kolom gambar
        })

        if (error) {
            console.error("Error submitting review:", error)
            setError("Gagal menambahkan review. Silakan coba lagi.")
            return
        }

        setSubmitted(true)
        setRating(0)
        setBody("")
        setImages([])
        setImagePreviews([])
        setError(null)

        router.refresh()

        setTimeout(() => setSubmitted(false), 3000)
        } catch (error) {
        console.error("Error:", error)
        setError("Terjadi kesalahan. Silakan coba lagi.")
        } finally {
        setLoading(false)
        }
    }

    const ratingLabels = ["Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"]

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-white">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                <Star size={16} className="text-teal-600 fill-teal-600" />
            </div>
            <div>
                <h2 className="text-sm font-black text-gray-900">Tulis Ulasan</h2>
                <p className="text-[10px] text-gray-400 font-medium">Bagikan pengalaman Anda</p>
            </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                <Camera size={12} /> {images.length}/3
            </span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ── Rating Selector ── */}
            <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
                Berapa rating Anda? <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all duration-200 hover:scale-110 focus:outline-none"
                    >
                    <Star
                        size={32}
                        className={`${
                        star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "fill-gray-200 text-gray-200"
                        } transition-colors duration-200`}
                    />
                    </button>
                ))}
                </div>
                {rating > 0 && (
                <span className="ml-1 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    {ratingLabels[rating - 1]}
                </span>
                )}
            </div>
            </div>

            {/* ── Quick Emoji Reactions ── */}
            {rating > 0 && (
            <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
                <span className="text-xs text-gray-400 font-medium mr-1">Bagaimana perasaanmu?</span>
                {emojis.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                    // Bisa digunakan untuk menambahkan emoji ke komentar
                    }}
                    className="text-2xl hover:scale-125 transition-transform duration-200 hover:bg-gray-50 p-1 rounded-lg"
                >
                    {emoji}
                </button>
                ))}
            </div>
            )}

            {/* ── Review Text ── */}
            <div>
            <label htmlFor="review" className="block text-sm font-bold text-gray-800 mb-2">
                Komentar Anda <span className="text-red-400">*</span>
            </label>
            <div className={`relative rounded-xl border-2 transition-all ${
                isFocused ? "border-teal-400 shadow-md shadow-teal-100/50" : "border-gray-200"
            } ${error && !body.trim() ? "border-red-300" : ""}`}>
                <textarea
                id="review"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ceritakan pengalaman Anda menggunakan produk ini. Kelebihan, kekurangan, dan kesan secara keseluruhan..."
                className="w-full px-4 py-3 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none rounded-xl min-h-[120px]"
                rows={4}
                maxLength={500}
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                {body.length}/500
                </div>
            </div>
            {error && !body.trim() && (
                <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
                </p>
            )}
            </div>

            {/* ── Image Upload ── */}
            <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
                Tambahkan Foto <span className="text-xs font-normal text-gray-400">(Opsional, maks 3)</span>
            </label>
            
            {/* Image previews */}
            {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                    <img
                        src={preview}
                        alt={`preview-${index}`}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X size={12} />
                    </button>
                    </div>
                ))}
                </div>
            )}

            <label
                className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                imagePreviews.length >= 3
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                    : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/30"
                }`}
            >
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <Image size={20} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-700">
                    {imagePreviews.length >= 3 ? "Maksimal 3 foto" : "Upload Foto"}
                    </p>
                    <p className="text-[10px] text-gray-400">PNG, JPG • Maks 2MB</p>
                </div>
                </div>
                <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={imagePreviews.length >= 3}
                className="hidden"
                />
            </label>
            </div>

            {/* ── Submit Button ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
                type="submit"
                disabled={loading || (!rating && !body.trim())}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                loading || (!rating && !body.trim())
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : submitted
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
                {loading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                </>
                ) : submitted ? (
                <>
                    <CheckCircle2 size={18} />
                    Ulasan Terkirim!
                </>
                ) : (
                <>
                    <Send size={18} />
                    Kirim Ulasan
                </>
                )}
            </button>
            
            {!loading && !submitted && (
                <button
                type="reset"
                onClick={() => {
                    setBody("")
                    setRating(0)
                    setImages([])
                    setImagePreviews([])
                    setError(null)
                }}
                className="px-6 py-3.5 rounded-xl font-medium text-sm text-gray-500 hover:bg-gray-50 border border-gray-200 transition-all"
                >
                Reset
                </button>
            )}
            </div>

            {/* ── Error Message ── */}
            {error && error !== "Mohon beri rating terlebih dahulu" && error !== "Mohon tulis komentar Anda" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                <AlertCircle size={16} />
                {error}
            </div>
            )}

            {/* ── Info ── */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-500 text-xs font-black">i</span>
            </div>
            <div>
                <p className="text-xs font-semibold text-blue-700">Tips menulis ulasan yang bermanfaat</p>
                <ul className="text-[10px] text-blue-600/80 mt-1 space-y-0.5 list-disc list-inside">
                <li>Ceritakan pengalaman nyata Anda menggunakan produk</li>
                <li>Sebutkan kelebihan dan kekurangan secara jujur</li>
                <li>Tambahkan foto untuk memperkuat ulasan Anda</li>
                </ul>
            </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-4">
            <span>Dengan mengirim ulasan, Anda setuju dengan <a href="/syarat" className="text-teal-600 hover:underline">Syarat & Ketentuan</a></span>
            <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Ulasan akan dipublikasikan setelah verifikasi
            </span>
            </div>
        </form>
        </div>
    )
    }