    // lib/integrations/rajaongkir.ts
    // Docs: https://rajaongkir.com/dokumentasi

    const RAJAONGKIR_KEY = process.env.RAJAONGKIR_API_KEY!
    const BASE_URL = "https://api.rajaongkir.com/starter"

    export type ShippingCostResult = {
    courier: string
    service: string
    description: string
    cost: number
    etd: string
    }

    // Ambil daftar kota berdasarkan nama (untuk autocomplete)
    export async function searchCity(query: string) {
    const res = await fetch(`${BASE_URL}/city`, {
        headers: { key: RAJAONGKIR_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    const cities: any[] = data?.rajaongkir?.results ?? []
    return cities
        .filter((c) => c.city_name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((c) => ({ id: c.city_id, name: `${c.city_name}, ${c.province}`, type: c.type }))
    }

    // Hitung ongkos kirim
    export async function calculateShipping({
    originCityId,
    destinationCityId,
    weightGram,
    courier,
    }: {
    originCityId: string
    destinationCityId: string
    weightGram: number
    courier: "jne" | "tiki" | "pos"
    }): Promise<ShippingCostResult[]> {
    const res = await fetch(`${BASE_URL}/cost`, {
        method: "POST",
        headers: {
        key: RAJAONGKIR_KEY,
        "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
        origin: originCityId,
        destination: destinationCityId,
        weight: weightGram.toString(),
        courier,
        }),
    })

    if (!res.ok) return []
    const data = await res.json()
    const services: any[] = data?.rajaongkir?.results?.[0]?.costs ?? []

    return services.map((s) => ({
        courier: courier.toUpperCase(),
        service: s.service,
        description: s.description,
        cost: s.cost?.[0]?.value ?? 0,
        etd: s.cost?.[0]?.etd ?? "-",
    }))
    }
