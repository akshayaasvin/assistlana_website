import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { hrId, fileCount } = await req.json()
    if (!hrId) return NextResponse.json({ error: 'No hrId' }, { status: 400 })

    const { data: hr, error } = await supabase
      .from('hr_registry')
      .select('plan, daily_upload_count, last_upload_date')
      .eq('id', hrId)
      .single()

    if (error || !hr) {
      return NextResponse.json({ error: 'HR not found' }, { status: 404 })
    }

    if (hr.plan === 'premium') {
      return NextResponse.json({
        allowed: true, plan: 'premium', remaining: 9999, used: 0, limit: 9999
      })
    }

    const DAILY_LIMIT = 10
    const today = new Date().toISOString().split('T')[0]
    let currentCount = hr.daily_upload_count || 0

    if (hr.last_upload_date !== today) {
      currentCount = 0
      await supabase
        .from('hr_registry')
        .update({ daily_upload_count: 0, last_upload_date: today })
        .eq('id', hrId)
    }

    const remaining = DAILY_LIMIT - currentCount
    const requestedCount = fileCount || 0

    if (requestedCount > remaining) {
      return NextResponse.json({
        allowed: false,
        plan: 'free',
        used: currentCount,
        limit: DAILY_LIMIT,
        remaining: remaining,
        message: remaining === 0
          ? `Daily limit reached! You have used all ${DAILY_LIMIT} free uploads today. Resets at midnight.`
          : `You selected ${requestedCount} files but only ${remaining} upload(s) remaining today. Remove ${requestedCount - remaining} file(s) or upgrade to Premium.`
      })
    }

    return NextResponse.json({
      allowed: true, plan: 'free',
      used: currentCount, limit: DAILY_LIMIT, remaining: remaining
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
