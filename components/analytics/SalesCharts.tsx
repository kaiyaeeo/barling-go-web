    "use client"

    import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend
    } from "recharts"

    type DailySale = { date: string; revenue: number; order_count: number }

    function formatRp(value: number) {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`
    return `Rp ${value}`
    }

    function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    }

    export function RevenueChart({ data }: { data: DailySale[] }) {
    const formatted = data.map((d) => ({ ...d, date: formatDate(d.date) }))
    return (
        <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6EB8BB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6EB8BB" stopOpacity={0} />
            </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatRp} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <Tooltip
            formatter={(val: any) => [`Rp ${Number(val || 0).toLocaleString("id-ID")}`, "Omzet"]}
            labelStyle={{ fontWeight: 600, color: "#111" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6EB8BB" strokeWidth={2} fill="url(#colorRevenue)" />
        </AreaChart>
        </ResponsiveContainer>
    )
    }

    export function OrdersChart({ data }: { data: DailySale[] }) {
    const formatted = data.map((d) => ({ ...d, date: formatDate(d.date) }))
    return (
        <ResponsiveContainer width="100%" height={180}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <Tooltip
            formatter={(val: any) => [Number(val || 0), "Pesanan"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
            />
            <Bar dataKey="order_count" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Pesanan" />
        </BarChart>
        </ResponsiveContainer>
    )
    }
