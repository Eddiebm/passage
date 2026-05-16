import { generateObituaryStream } from '@/lib/claude-copy'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.memorial?.deceased_name || !body.memorial?.date_of_passing) {
    return Response.json({ error: 'deceased_name and date_of_passing are required' }, { status: 400 })
  }

  const stream = await generateObituaryStream({ memorial: body.memorial })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
