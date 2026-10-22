import { NextResponse } from 'next/server'
import { getAllStoreData, setStoreItem, batchSetStoreItems } from '@/lib/db'

export async function GET() {
  try {
    const data = await getAllStoreData()
    return NextResponse.json({
      success: true,
      data,
      source: 'neon_postgres',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database fetch failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.updates && typeof body.updates === 'object') {
      const ok = await batchSetStoreItems(body.updates)
      return NextResponse.json({ success: ok, count: Object.keys(body.updates).length })
    }

    if (body.key && body.value !== undefined) {
      const ok = await setStoreItem(body.key, body.value)
      return NextResponse.json({ success: ok, key: body.key })
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database update failed' },
      { status: 500 }
    )
  }
}
