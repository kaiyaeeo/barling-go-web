    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // POST /api/invoice  — generate invoice HTML, simpan ke storage, update order
    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { orderId } = await request.json()
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })

    // Ambil data order lengkap
    const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*, order_items(product_name, price, qty, subtotal)")
        .eq("id", orderId)
        .single()

    if (orderErr || !order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 })

    // Generate HTML invoice
    const html = generateInvoiceHTML(order)
    const buffer = Buffer.from(html, "utf-8")
    const filename = `invoice-${order.order_number}.html`
    const storagePath = `invoices/${filename}`

    // Upload ke Supabase Storage bucket "invoices"
    const { error: uploadErr } = await supabase.storage
        .from("invoices")
        .upload(storagePath, buffer, {
        contentType: "text/html",
        upsert: true,
        })

    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

    // Ambil public URL
    const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(storagePath)
    const invoiceUrl = urlData.publicUrl

    // Update order dengan invoice_url
    await supabase.from("orders").update({ invoice_url: invoiceUrl }).eq("id", orderId)

    return NextResponse.json({ invoiceUrl })
    }

    function generateInvoiceHTML(order: any): string {
    const items = order.order_items ?? []
    const rows = items
        .map(
        (item: any) => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.product_name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.qty}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">Rp ${item.price.toLocaleString("id-ID")}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">Rp ${item.subtotal.toLocaleString("id-ID")}</td>
        </tr>`
        )
        .join("")

    return `<!DOCTYPE html>
    <html lang="id">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${order.order_number}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; max-width: 700px; margin: 0 auto; padding: 40px 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .logo { font-size: 22px; font-weight: 900; color: #6EB8BB; }
        .logo span { color: #111; }
        .invoice-title { font-size: 28px; font-weight: 800; color: #111; margin-bottom: 4px; }
        .badge { display: inline-block; background: #e8f5ee; color: #6EB8BB; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 99px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th { text-align: left; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; padding: 8px 0; border-bottom: 2px solid #eee; }
        th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
        th:nth-child(2) { text-align: center; }
        .total-row td { font-weight: 700; font-size: 15px; color: #6EB8BB; padding-top: 12px; }
        .section { margin-top: 32px; padding: 20px; background: #f8f9f8; border-radius: 12px; }
        .section h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
        .footer { margin-top: 48px; text-align: center; color: #aaa; font-size: 12px; }
    </style>
    </head>
    <body>
    <div class="header">
        <div>
        <div class="logo"><span>BARLING</span>GO</div>
        <p style="color:#888;font-size:13px;margin-top:4px">Platform wisata Barlingmascakep</p>
        </div>
        <div style="text-align:right">
        <div class="invoice-title">INVOICE</div>
        <div style="font-size:14px;color:#555;margin-bottom:6px">${order.order_number}</div>
        <div class="badge">${order.status.toUpperCase()}</div>
        <p style="font-size:12px;color:#888;margin-top:8px">
            ${new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
        </p>
        </div>
    </div>

    <div class="section">
        <h3>Dikirim Kepada</h3>
        <p style="font-weight:600;margin:0">${order.shipping_name}</p>
        <p style="color:#555;margin:4px 0;font-size:14px">${order.shipping_phone}</p>
        <p style="color:#555;font-size:14px;margin:0">${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province} ${order.shipping_postal_code}</p>
    </div>

    <table>
        <thead>
        <tr>
            <th>Produk</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
        </tr>
        </thead>
        <tbody>
        ${rows}
        <tr>
            <td colspan="3" style="padding:8px 0;text-align:right;color:#888;font-size:13px">Subtotal</td>
            <td style="padding:8px 0;text-align:right">Rp ${order.subtotal.toLocaleString("id-ID")}</td>
        </tr>
        <tr>
            <td colspan="3" style="padding:8px 0;text-align:right;color:#888;font-size:13px">Ongkos Kirim (${(order.courier ?? "").toUpperCase()} ${order.courier_service ?? ""})</td>
            <td style="padding:8px 0;text-align:right">Rp ${order.shipping_cost.toLocaleString("id-ID")}</td>
        </tr>
        <tr class="total-row">
            <td colspan="3" style="text-align:right;padding-top:12px;border-top:2px solid #eee">TOTAL</td>
            <td style="text-align:right;border-top:2px solid #eee">Rp ${order.total_amount.toLocaleString("id-ID")}</td>
        </tr>
        </tbody>
    </table>

    <div class="section" style="margin-top:24px">
        <h3>Pembayaran</h3>
        <p style="margin:0;font-size:14px;color:#555;text-transform:capitalize">${(order.payment_method ?? "").replace("_", " ")}</p>
        <p style="margin:4px 0 0;font-size:13px;color:${order.payment_status === "paid" ? "#6EB8BB" : "#F59E0B"};font-weight:600">
        ${order.payment_status === "paid" ? "✓ Sudah Dibayar" : "⏳ Menunggu Pembayaran"}
        </p>
    </div>

    <div class="footer">
        <p>Terima kasih telah berbelanja di Barling-GO 🌿</p>
        <p>© 2026 Barling-GO · Rooted in Barlingmascakep</p>
    </div>
    </body>
    </html>`
    }
