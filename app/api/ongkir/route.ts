    import { NextRequest, NextResponse } from "next/server"
    import { calculateShipping } from "@/lib/integrations/rajaongkir"

    // POST /api/ongkir
    export async function POST(request: NextRequest) {
    const { originCityId, destinationCityId, weightGram, courier } = await request.json()

    if (!originCityId || !destinationCityId || !weightGram || !courier) {
        return NextResponse.json({ error: "Parameter tidak lengkap." }, { status: 400 })
    }

    try {
        const results = await calculateShipping({
        originCityId,
        destinationCityId,
        weightGram,
        courier,
        })
        return NextResponse.json(results)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
    }
