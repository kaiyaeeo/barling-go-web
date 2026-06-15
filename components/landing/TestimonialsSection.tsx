    import type { Testimonial } from "@/lib/queries/landing-types"

    const avatarColors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700",
    blue:  "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    teal:  "bg-teal-100 text-teal-700",
    red:   "bg-red-100 text-red-700",
    }

    type Props = { testimonials: Testimonial[] }

    export default function TestimonialsSection({ testimonials }: Props) {
    return (
        <section className="py-20 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What They Say About Us</h2>
            {testimonials.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">Belum ada testimoni.</p>
            ) : (
            <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${avatarColors[t.avatar_color] ?? "bg-gray-100 text-gray-700"}`}>
                        {t.avatar_initials}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                            <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        ))}
                        </div>
                    </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{t.content}</p>
                </div>
                ))}
            </div>
            )}
        </div>
        </section>
    )
    }
