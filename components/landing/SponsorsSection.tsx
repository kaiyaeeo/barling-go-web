    "use client"

    import Link from "next/link"
    import { useEffect, useRef } from "react"

    // ─── Data dummy lengkap ────────────────────────────────────────────────────────
    const ROW_1 = [
    { name: "ASTON",       type: "text",  color: "text-gray-800",   sub: "Hotel & Resort"          },
    { name: "DISPAR",      type: "badge", bg: "bg-blue-50",         color: "text-blue-700",  sub: "Dinas Pariwisata"    },
    { name: "BANK JATENG", type: "text",  color: "text-blue-900",   sub: "Mitra Keuangan"          },
    { name: "BMS",         type: "badge", bg: "bg-red-50",          color: "text-red-700",   sub: "Kab. Banjarnegara"   },
    { name: "UMKM",        type: "badge", bg: "bg-[#E6F7F8]",      color: "text-[#6EB8BB]", sub: "Pusat UMKM"          },
    { name: "DINAS",       type: "badge", bg: "bg-emerald-50",      color: "text-emerald-700",sub: "Dinas Perdagangan"  },
    { name: "TELKOM",      type: "text",  color: "text-red-800",    sub: "Mitra Teknologi"         },
    { name: "KAB",         type: "badge", bg: "bg-amber-50",        color: "text-amber-700", sub: "Kab. Banyumas"       },
    { name: "BRI",         type: "text",  color: "text-blue-700",   sub: "Mitra Perbankan"         },
    { name: "CILACAP",     type: "badge", bg: "bg-purple-50",       color: "text-purple-700",sub: "Kab. Cilacap"        },
    { name: "INDOSAT",     type: "text",  color: "text-yellow-700", sub: "Mitra Telekomunikasi"    },
    { name: "KEBUMEN",     type: "badge", bg: "bg-green-50",        color: "text-green-700", sub: "Kab. Kebumen"        },
    ]

    const ROW_2 = [
    { name: "PURBALINGGA", type: "badge", bg: "bg-orange-50",       color: "text-orange-700",sub: "Kab. Purbalingga"    },
    { name: "GRAB",        type: "text",  color: "text-green-700",  sub: "Mitra Transportasi"      },
    { name: "GOJEK",       type: "text",  color: "text-green-800",  sub: "Super App Mitra"         },
    { name: "BNI",         type: "text",  color: "text-orange-800", sub: "Mitra Perbankan"         },
    { name: "MANDIRI",     type: "text",  color: "text-blue-800",   sub: "Mitra Perbankan"         },
    { name: "PARIWISATA",  type: "badge", bg: "bg-teal-50",         color: "text-teal-700",  sub: "Kemenpar RI"         },
    { name: "TOKOPEDIA",   type: "text",  color: "text-green-600",  sub: "Mitra E-Commerce"        },
    { name: "SHOPEE",      type: "text",  color: "text-orange-600", sub: "Mitra E-Commerce"        },
    { name: "KOMINFO",     type: "badge", bg: "bg-sky-50",          color: "text-sky-700",   sub: "Kemenkominfo RI"     },
    { name: "BSI",         type: "text",  color: "text-emerald-800",sub: "Bank Syariah"            },
    { name: "INDOMARET",   type: "text",  color: "text-red-700",    sub: "Mitra Ritel"             },
    { name: "PEGADAIAN",   type: "badge", bg: "bg-green-50",        color: "text-green-800", sub: "Mitra Keuangan"      },
    ]

    // Duplikat untuk seamless loop
    const TRACK_1 = [...ROW_1, ...ROW_1]
    const TRACK_2 = [...ROW_2, ...ROW_2]

    type SponsorItem = {
    name: string; type: string; color: string
    sub: string; bg?: string
    }

    function SponsorCard({ s }: { s: SponsorItem }) {
    return (
        <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-default select-none group px-1">
        {s.type === "text" ? (
            <span className={`text-lg font-black ${s.color} tracking-wider group-hover:text-[#6EB8BB] transition-colors whitespace-nowrap`}>
            {s.name}
            </span>
        ) : (
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center border border-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
            <span className={`text-[10px] font-black ${s.color} text-center leading-tight px-1`}>{s.name}</span>
            </div>
        )}
        <p className="text-[10px] text-gray-400 font-medium text-center max-w-[80px] leading-tight">{s.sub}</p>
        </div>
    )
    }

    function MarqueeRow({
    items,
    speed = 0.6,
    direction = "ltr",
    }: {
    items: SponsorItem[]
    speed?: number
    direction?: "ltr" | "rtl"
    }) {
    const trackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        let x = direction === "rtl" ? -(track.scrollWidth / 2) : 0
        let paused = false
        let raf: number

        const step = () => {
        if (!paused) {
            if (direction === "ltr") {
            x -= speed
            if (Math.abs(x) >= track.scrollWidth / 2) x = 0
            } else {
            x += speed
            if (x >= 0) x = -(track.scrollWidth / 2)
            }
            track.style.transform = `translateX(${x}px)`
        }
        raf = requestAnimationFrame(step)
        }

        raf = requestAnimationFrame(step)
        track.addEventListener("mouseenter", () => { paused = true })
        track.addEventListener("mouseleave", () => { paused = false })

        return () => cancelAnimationFrame(raf)
    }, [speed, direction])

    return (
        <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div ref={trackRef} className="flex items-center gap-10 w-max will-change-transform py-2">
            {items.map((s, i) => <SponsorCard key={i} s={s} />)}
        </div>
        </div>
    )
    }

    export default function SponsorsSection() {
    return (
        <section className="py-14 bg-white border-y border-gray-100 overflow-hidden">

        {/* Header — sama gaya dengan WhySection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
            <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
            <span className="text-xs font-black text-[#6EB8BB] uppercase tracking-widest">Dipercaya Oleh</span>
            <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Partner & Sponsor Resmi Barling-GO</h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-md mx-auto">
            Berkolaborasi dengan instansi pemerintah, korporasi, dan komunitas untuk memajukan pariwisata Barlingmascakep
            </p>
        </div>

        {/* Double row marquee */}
        <div className="space-y-6">
            {/* Row 1 → kiri */}
            <MarqueeRow items={TRACK_1} speed={0.55} direction="ltr" />
            {/* Row 2 → kanan (berlawanan) */}
            <MarqueeRow items={TRACK_2} speed={0.45} direction="rtl" />
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-10">
            <p className="text-sm text-gray-400">
            Ingin menjadi partner Barling-GO?{" "}
            <Link href="/kontak" className="text-[#6EB8BB] hover:underline font-bold">
                Hubungi kami →
            </Link>
            </p>
        </div>
        </section>
    )
    }