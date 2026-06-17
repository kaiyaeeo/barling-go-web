    import { Star, Quote } from "lucide-react"
    import type { Testimonial } from "@/lib/queries/landing-types"

    const avatarColors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700",
    blue:  "bg-blue-100 text-blue-700",
    green: "bg-[#E6F7F8] text-[#6EB8BB]",
    teal:  "bg-[#E6F7F8] text-[#6EB8BB]",
    red:   "bg-red-100 text-red-700",
    }

    type Props = { testimonials: Testimonial[] }

    export default function TestimonialsSection({ testimonials }: Props) {
    const avgRating = testimonials.length
        ? testimonials.reduce((s, t) => s + (t.rating ?? 5), 0) / testimonials.length
        : 5

    return (
        <section className="py-24 bg-[#E6F7F8]/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
                <span className="text-xs font-black text-[#6EB8BB] uppercase tracking-widest">Testimoni</span>
                <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Apa Kata Mereka?
            </h2>

            {/* Overall rating */}
            <div className="inline-flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm mt-3">
                <p className="text-3xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
                <div>
                <div className="flex items-center gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                    ))}
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">dari {testimonials.length} ulasan</p>
                </div>
            </div>
            </div>

            {testimonials.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Belum ada testimoni.</p>
            ) : (
            <div className="grid md:grid-cols-3 gap-5">
                {testimonials.map((t, i) => (
                <div
                    key={t.id}
                    className={`bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${i === 1 ? "md:-translate-y-3" : ""}`}
                >
                    {/* Decorative quote */}
                    <div className="absolute top-4 right-4 opacity-5">
                    <Quote size={48} className="text-[#6EB8BB]" />
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(5)].map((_, si) => (
                        <Star key={si} size={13} className={si < t.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                    ))}
                    <span className="text-[10px] font-bold text-gray-400 ml-1">{t.rating}.0</span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 relative z-10">"{t.content}"</p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${avatarColors[t.avatar_color] ?? "bg-gray-100 text-gray-600"}`}>
                        {t.avatar_initials}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm">{t.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Wisatawan Terverifikasi</p>
                    </div>
                    <div className="ml-auto">
                        <span className="text-[9px] font-bold text-[#6EB8BB] bg-[#E6F7F8] px-2 py-0.5 rounded-full">✓ Terpercaya</span>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </section>
    )
    }