    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") ?? "penjualan"
    const format = searchParams.get("format") ?? "html"

    let rows: any[] = []
    let columns: string[] = []
    let title = ""

    if (type === "penjualan") {
        title = "Laporan Penjualan"
        const { data } = await supabase
        .from("orders")
        .select("order_number, shipping_name, shipping_city, total_amount, payment_method, paid_at, status, created_at")
        .eq("payment_status", "paid")
        .order("paid_at", { ascending: false })
        rows = data ?? []
        columns = ["No. Pesanan", "Nama", "Kota", "Total", "Metode Bayar", "Tanggal Bayar", "Status", "Tanggal Order"]

    } else if (type === "stok") {
        title = "Laporan Stok"
        const { data } = await supabase
        .from("products")
        .select("name, sku, stock, price, is_active, categories(name)")
        .eq("is_active", true)
        .order("stock", { ascending: true })
        rows = (data ?? []).map((p: any) => ({ ...p, category: p.categories?.name ?? "-", categories: undefined }))
        columns = ["Nama Produk", "SKU", "Stok", "Harga", "Kategori"]

    } else if (type === "transaksi") {
        title = "Laporan Transaksi"
        const { data } = await supabase
        .from("orders")
        .select("order_number, shipping_name, total_amount, payment_method, payment_status, status, created_at")
        .order("created_at", { ascending: false })
        rows = data ?? []
        columns = ["No. Pesanan", "Nama", "Total", "Metode Bayar", "Status Bayar", "Status Order", "Tanggal"]

    } else if (type === "produk") {
        title = "Performa Produk"
        const { data } = await supabase
        .from("top_products")
        .select("name, total_sold, total_revenue, category_name, price")
        rows = data ?? []
        columns = ["Nama Produk", "Terjual", "Pendapatan", "Kategori", "Harga"]
    }

    const dateStr = new Date().toLocaleDateString("id-ID", { dateStyle: "long" })

    if (format === "html") {
        const html = generateHTMLReport(title, columns, rows, type, dateStr)
        return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0,10)}.html"`,
        },
        })
    }

    // Excel format — generate CSV-based XLSX using basic approach
    const csvContent = generateCSV(columns, rows, type)
    return new NextResponse(csvContent, {
        headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0,10)}.xlsx"`,
        },
    })
    }

    function formatValue(val: any, key: string): string {
    if (val == null) return "-"
    if (typeof val === "boolean") return val ? "Ya" : "Tidak"
    if (key.includes("amount") || key.includes("total") || key.includes("price") || key.includes("revenue")) {
        return `Rp ${Number(val).toLocaleString("id-ID")}`
    }
    if (key.includes("at") && typeof val === "string" && val.includes("T")) {
        return new Date(val).toLocaleDateString("id-ID")
    }
    return String(val)
    }

    function generateHTMLReport(title: string, columns: string[], rows: any[], type: string, dateStr: string): string {
    const keys = Object.keys(rows[0] ?? {})
    const tableRows = rows.map((row) =>
        `<tr>${keys.map((k) => `<td>${formatValue(row[k], k)}</td>`).join("")}</tr>`
    ).join("")

    return `<!DOCTYPE html>
    <html lang="id">
    <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body{font-family:'Segoe UI',sans-serif;color:#333;padding:32px;max-width:1100px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #eee}
        .logo{font-size:20px;font-weight:900;color:#6EB8BB}.logo span{color:#111}
        h1{font-size:22px;font-weight:800;margin:0 0 4px}
        p.sub{font-size:13px;color:#888;margin:0}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#f8f9f8;text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;color:#888;font-weight:600;border-bottom:2px solid #eee}
        td{padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#444}
        tr:hover td{background:#fafaf9}
        .footer{margin-top:32px;text-align:center;font-size:12px;color:#aaa}
        @media print{body{padding:16px}}
    </style>
    </head>
    <body>
    <div class="header">
        <div>
        <div class="logo"><span>BARLING</span>GO</div>
        <p class="sub" style="margin-top:4px">Platform wisata Barlingmascakep</p>
        </div>
        <div style="text-align:right">
        <h1>${title}</h1>
        <p class="sub">Dibuat: ${dateStr}</p>
        <p class="sub">${rows.length} data</p>
        </div>
    </div>
    <table>
        <thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
        <tbody>${tableRows}</tbody>
    </table>
    <div class="footer">Barling-GO · © 2026 · Rooted in Barlingmascakep</div>
    <script>
        // Auto print dialog on open
        // window.onload = () => window.print()
    </script>
    </body>
    </html>`
    }

    function generateCSV(columns: string[], rows: any[], type: string): string {
    if (rows.length === 0) return columns.join(",")
    const keys = Object.keys(rows[0])
    const header = columns.join(",")
    const body = rows.map((row) =>
        keys.map((k) => {
        const val = formatValue(row[k], k)
        return `"${String(val).replace(/"/g, '""')}"`
        }).join(",")
    ).join("\n")
    return `${header}\n${body}`
    }
