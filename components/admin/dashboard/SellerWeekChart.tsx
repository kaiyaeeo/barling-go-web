    export default function SellerWeekChart({ data }: { data: any }) {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    const heights = ['h-[40%]', 'h-[60%]', 'h-[45%]', 'h-[80%]', 'h-[75%]', 'h-[100%]', 'h-[85%]']

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
        <h3 className="font-bold text-gray-800 mb-6">Statistik Penjualan Minggu Ini</h3>
        
        <div className="h-64 flex items-end justify-between gap-3 border-b border-gray-100 pb-2">
            {days.map((day, i) => (
            <div key={day} className="w-full flex flex-col items-center gap-2 group">
                <div className={`w-full bg-green-100 rounded-t-md relative ${heights[i]} group-hover:bg-green-200 transition-colors`}>
                <div className="absolute bottom-0 w-full bg-[#6EB8BB] rounded-t-md opacity-90" style={{ height: heights[i] }}></div>
                </div>
                <span className="text-xs font-medium text-gray-500">{day}</span>
            </div>
            ))}
        </div>
        </div>
    )
    }