import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { hrId, count } = await req.json()
    if (!hrId) return NextResponse.json({ error: 'No hrId' }, { status: 400 })

    const { data: hr } = await supabase
      .from('hr_registry')
      .select('plan, daily_upload_count, last_upload_date')
      .eq('id', hrId)
      .single()

    if (hr?.plan === 'premium') {
      return NextResponse.json({ success: true })
    }

    const today = new Date().toISOString().split('T')[0]
    const prevCount = hr?.last_upload_date === today ? (hr?.daily_upload_count || 0) : 0
    const newCount = prevCount + (count || 1)

    await supabase
      .from('hr_registry')
      .update({ daily_upload_count: newCount, last_upload_date: today })
      .eq('id', hrId)

    return NextResponse.json({ success: true, newCount })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
