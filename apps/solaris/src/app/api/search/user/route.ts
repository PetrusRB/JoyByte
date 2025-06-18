import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/db/server'
import { usernameSlugSchema } from '@/schemas/user'
import { slugToSearchQuery } from '@/libs/utils'

export async function GET(request: NextRequest) {
  try {
    // Extract and validate query parameters
    const params = request.nextUrl.searchParams
    const query = params.get('user')?.trim() // Trim whitespace instead of replacing
    const limit = Math.min(parseInt(params.get('limit') ?? '10', 10), 50) // Cap limit at 50
    const offset = Math.max(parseInt(params.get('offset') ?? '0', 10), 0) // Ensure non-negative offset

    // Authentication
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Input validation
    if (!query) {
      return NextResponse.json(
        { error: 'User query parameter is required' },
        { status: 400 }
      )
    }

    const parsed = usernameSlugSchema.safeParse(query)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid username format', details: parsed.error.issues },
        { status: 400 }
      )
    }

    // Search query
    const searchQuery = slugToSearchQuery(query).toLowerCase()

    // Database query with specific fields and pagination
    const { data, error: dbError, count } = await supabase
      .from('profiles')
      .select(
        `id, raw_user_meta_data, created_at, banner, email, bio, badge, twitter, youtube, tiktok, kwai, linkedin, instagram, website, followers, following`,
        { count: 'exact' }
      )
      .ilike('raw_user_meta_data->>name', `%${searchQuery}%`) // Case-insensitive name search
      .order('raw_user_meta_data->>name', { ascending: true }) // Consistent ordering
      .range(offset, offset + limit - 1) // Proper pagination

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `No users found for query: ${query}` },
        { status: 404 }
      )
    }

    // Transform response data
    const response = {
      data: {
        users: data.map(user => ({
          ...user
        })),
        pagination: {
          total: count ?? 0,
          offset,
          limit,
          hasMore: (count ?? 0) > offset + limit
        }
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59'
      }
    })

  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
