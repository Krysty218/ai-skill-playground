import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      throw new Error('No audio file provided')
    }

    // Convert audio to base64 for OpenAI Whisper API
    const audioBytes = await audioFile.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBytes)))

    // Use OpenAI Whisper for transcription
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: (() => {
        const form = new FormData()
        form.append('file', new Blob([audioBytes], { type: audioFile.type }), audioFile.name)
        form.append('model', 'whisper-1')
        form.append('response_format', 'verbose_json')
        form.append('timestamp_granularities[]', 'word')
        return form
      })(),
    })

    if (!transcriptionResponse.ok) {
      throw new Error('Transcription failed')
    }

    const transcriptionData = await transcriptionResponse.json()
    const transcript = transcriptionData.text

    // Simple speaker diarization using sentence breaks and timing
    const words = transcriptionData.words || []
    const diarization = performSimpleDiarization(words, transcript)

    // Generate summary using OpenAI
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a conversation summarizer. Provide a concise summary of the conversation.'
          },
          {
            role: 'user',
            content: `Please summarize this conversation: ${transcript}`
          }
        ],
        max_tokens: 150,
      }),
    })

    const summaryData = await summaryResponse.json()
    const summary = summaryData.choices[0]?.message?.content || 'Summary not available'

    return new Response(
      JSON.stringify({
        transcript,
        diarization,
        summary,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

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

function performSimpleDiarization(words: any[], transcript: string) {
  // Simple heuristic-based diarization
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const diarization = []
  
  let currentSpeaker = 1
  let timeOffset = 0

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    if (sentence) {
      // Alternate speakers for demo - in real implementation, use more sophisticated analysis
      const speaker = `Speaker ${currentSpeaker}`
      const timestamp = formatTime(timeOffset)
      
      diarization.push({
        speaker,
        text: sentence,
        timestamp,
      })

      // Switch speaker occasionally based on sentence patterns
      if (i > 0 && (sentence.length > 50 || Math.random() > 0.7)) {
        currentSpeaker = currentSpeaker === 1 ? 2 : 1
      }
      
      timeOffset += sentence.length * 0.1 // Rough timing estimate
    }
  }

  return diarization
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}