import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const url = formData.get('url') as string

    let content = ''
    let metadata = {
      wordCount: 0,
      readingTime: '0 minutes',
      language: 'English',
      type: 'unknown'
    }

    if (file) {
      // Process file content
      if (file.type === 'application/pdf') {
        content = await extractPDFText(file)
        metadata.type = 'PDF document'
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        content = await extractWordText(file)
        metadata.type = 'Word document'
      } else {
        // Try to read as text
        content = await file.text()
        metadata.type = file.type || 'text file'
      }
    } else if (url) {
      // Fetch URL content
      content = await extractURLContent(url)
      metadata.type = 'webpage'
    }

    if (!content) {
      throw new Error('Could not extract content from the provided input')
    }

    // Calculate metadata
    const words = content.split(/\s+/).filter(word => word.length > 0)
    metadata.wordCount = words.length
    metadata.readingTime = `${Math.ceil(words.length / 200)} minutes`

    // Use OpenAI for summarization
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a document summarizer. Provide a comprehensive summary and extract key points from the given content. Format your response as JSON with keys: summary, keyPoints (array).'
          },
          {
            role: 'user',
            content: `Please summarize this content and extract key points: ${content.substring(0, 4000)}`
          }
        ],
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error('Summarization failed')
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content

    try {
      const analysisData = JSON.parse(analysisText)
      
      return new Response(
        JSON.stringify({
          summary: analysisData.summary,
          keyPoints: Array.isArray(analysisData.keyPoints) ? analysisData.keyPoints : [],
          metadata,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch {
      // Fallback if JSON parsing fails
      return new Response(
        JSON.stringify({
          summary: analysisText,
          keyPoints: ['Document processed successfully'],
          metadata,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function extractPDFText(file: File): Promise<string> {
  // For PDF extraction, you'd typically use a library like pdf-parse
  // This is a simplified version that extracts basic text
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const text = new TextDecoder().decode(uint8Array)
  
  // Basic PDF text extraction (very simplified)
  const matches = text.match(/BT\s*(.*?)\s*ET/g) || []
  return matches.map(match => 
    match.replace(/BT\s*/, '').replace(/\s*ET/, '').replace(/[()]/g, '')
  ).join(' ').substring(0, 5000)
}

async function extractWordText(file: File): Promise<string> {
  // For proper Word document extraction, you'd use a library like mammoth
  // This is a simplified version
  const text = await file.text()
  return text.substring(0, 5000)
}

async function extractURLContent(url: string): Promise<string> {
  const response = await fetch(url)
  const html = await response.text()
  
  // Basic HTML text extraction
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  return textContent.substring(0, 5000)
}