    import { Lightbulb, TrendingUp } from "lucide-react"

    export default function AIInsightBox({ text }: { text: any }) {
    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 my-6 flex gap-4 items-start shadow-sm">
        <div className="bg-green-100 p-2.5 rounded-lg text-green-700 shrink-0">
            <Lightbulb className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-green-900 flex items-center gap-2">
            Insight AI Mingguan <TrendingUp className="w-4 h-4 text-green-600"/>
            </h3>
            <p className="text-sm text-green-800 mt-1.5 leading-relaxed">
            Berdasarkan tren pencarian wisatawan di wilayah Barlingmascakep minggu ini, produk "Oleh-oleh Khas" sedang mengalami lonjakan minat. Pertimbangkan untuk memberikan diskon bundel pada produk unggulanmu untuk memaksimalkan keuntungan!
            </p>
        </div>
        </div>
    )
    }