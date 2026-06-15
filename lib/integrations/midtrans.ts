    // lib/integrations/midtrans.ts
    // Docs: https://docs.midtrans.com/reference/snap-api

    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
    const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true"
    const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1"
    const MIDTRANS_API_BASE = MIDTRANS_IS_PRODUCTION
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2"

    const authHeader = "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")

    export type MidtransItem = {
    id: string
    price: number
    quantity: number
    name: string
    }

    export type MidtransTransactionParams = {
    orderId: string
    amount: number
    customerName: string
    customerEmail: string
    customerPhone?: string
    items: MidtransItem[]
    shippingAddress?: {
        firstName: string
        address: string
        city: string
        postalCode: string
        phone: string
    }
    }

    // Buat Snap token untuk payment page
    export async function createSnapToken(params: MidtransTransactionParams) {
    const body = {
        transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.amount),
        },
        customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone ?? "",
        shipping_address: params.shippingAddress
            ? {
                first_name: params.shippingAddress.firstName,
                address: params.shippingAddress.address,
                city: params.shippingAddress.city,
                postal_code: params.shippingAddress.postalCode,
                phone: params.shippingAddress.phone,
                country_code: "IDN",
            }
            : undefined,
        },
        item_details: params.items.map((item) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50),
        })),
        callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/pembayaran/${params.orderId}?status=finish`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL}/pembayaran/${params.orderId}?status=error`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pembayaran/${params.orderId}?status=pending`,
        },
    }

    const res = await fetch(`${MIDTRANS_BASE_URL}/transactions`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error_messages?.join(", ") ?? "Midtrans error")
    }

    const data = await res.json()
    return { token: data.token as string, redirectUrl: data.redirect_url as string }
    }

    // Cek status transaksi di Midtrans
    export async function checkTransactionStatus(orderId: string) {
    const res = await fetch(`${MIDTRANS_API_BASE}/${orderId}/status`, {
        headers: { Authorization: authHeader },
    })
    if (!res.ok) throw new Error("Failed to check transaction status")
    return res.json()
    }

    // Verifikasi signature dari webhook Midtrans
    export function verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
    ): boolean {
    const crypto = require("crypto")
    const hash = crypto
        .createHash("sha512")
        .update(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)
        .digest("hex")
    return hash === signatureKey
    }
