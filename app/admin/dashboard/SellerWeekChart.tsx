    "use client"

    import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
    } from "recharts"

    type DayData = { date: string; revenue: number; order_count: number }

    function formatRp(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
    return `${value}`
    }

    export default function SellerWeekChart({ data }: { data: DayData[] }) {
    if (!data || data.length === 0) {
        return (
        <div className="h-44 flex items-center justify-center text-sm text-gray-300">
            Belum ada data penjualan minggu ini
        </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            />
            <YAxis
            tickFormatter={formatRp}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            width={36}
            />
            <Tooltip
            formatter={(val: any) => [`Rp ${Number(val || 0).toLocaleString("id-ID")}`, "Omzet"]}
            labelStyle={{ fontWeight: 600, color: "#111", marginBottom: 4 }}
            contentStyle={{
                borderRadius: 12,
                border: "1px solid #eee",
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,.08)",
            }}
            cursor={{ fill: "rgba(45,125,70,.06)" }}
            />
            <Bar
            dataKey="revenue"
            fill="#5DB07A"
            radius={[6, 6, 0, 0]}
            maxBarSize={52}
            />
        </BarChart>
        </ResponsiveContainer>
    )
    }
