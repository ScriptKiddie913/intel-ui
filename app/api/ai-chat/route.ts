import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
})

export async function POST(request: NextRequest) {
  try {
    const { message, sourceChannel } = await request.json()
    
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
      messages: [
        {
          role: 'system',
          content: `You are a cyber intelligence analyst analyzing Telegram data from channel ${sourceChannel}.
Analyze search results for patterns, emails, phones, credentials, and generate actionable intelligence reports.
Be precise, technical, and provide structured analysis.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    })

    const response = completion.choices[0]?.message?.content || 'No response'
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}

