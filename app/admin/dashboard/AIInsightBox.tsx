    "use client"

    import { Sparkles } from "lucide-react"

    export default function AIInsightBox({ text }: { text: string }) {
    return (
        <div className="mt-4 flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3.5">
        <div className="w-7 h-7 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} className="text-[#6EB8BB]" />
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
        </div>
    )
    }
