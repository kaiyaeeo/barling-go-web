    "use client"

    import { useState } from "react"
    import { Loader2, Download, FileSpreadsheet } from "lucide-react"

    export default function ExportButton({ reportId, label }: { reportId: string; label: string }) {
    const [loading, setLoading] = useState<"excel" | "html" | null>(null)

    async function handleExport(format: "excel" | "html") {
        setLoading(format)
        const res = await fetch(`/api/laporan?type=${reportId}&format=${format}`)
        if (!res.ok) { setLoading(null); return }

        const blob = await res.blob()
        const ext = format === "excel" ? "xlsx" : "html"
        const filename = `${reportId}-${new Date().toISOString().slice(0, 10)}.${ext}`
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        setLoading(null)
    }

    return (
        <div className="flex gap-2">
        <button
            onClick={() => handleExport("excel")}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-all"
        >
            {loading === "excel" ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
            Excel
        </button>
        <button
            onClick={() => handleExport("html")}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-600 text-xs font-semibold rounded-lg transition-all"
        >
            {loading === "html" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            HTML
        </button>
        </div>
    )
    }
