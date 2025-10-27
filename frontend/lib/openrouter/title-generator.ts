/**
 * Generate conversation titles using OpenRouter's free models
 * Implements cascading fallback strategy for resilience
 */

export interface GenerateTitleParams {
  query: string
  response: string
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Cascade of models (try in order)
const MODEL_CASCADE = [
  'meta-llama/llama-3.3-8b-instruct:free',  // Tier 1: FREE, fast, quality
  'openai/gpt-oss-20b:free',                // Tier 2: FREE, backup
  'google/gemma-3-4b-it',                   // Tier 3: PAID ($0.0000015/title), stable, won't disappear
]

/**
 * Generate conversation title using LLM with 4-tier fallback cascade
 * Tier 1-2: Free models ($0)
 * Tier 3: Cheap stable model (~$0.0000015/title)
 * Tier 4: Smart capitalization (instant, no cost)
 */
export async function generateConversationTitle(
  params: GenerateTitleParams
): Promise<string> {
  const { query, response } = params

  // Try each model in cascade
  for (const model of MODEL_CASCADE) {
    try {
      const title = await callOpenRouter(model, query, response)
      if (title && title.trim().length > 0) {
        return title.trim()
      }
    } catch (error) {
      console.warn(`Model ${model} failed:`, error)
      // Continue to next model
    }
  }

  // Tier 4 fallback: Smart capitalization fix
  return smartCapitalization(query)
}

/**
 * Call OpenRouter API with specific model
 */
async function callOpenRouter(
  model: string,
  query: string,
  response: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  // Truncate response to first 200 chars for context efficiency
  const responseSnippet = response.substring(0, 200)

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a conversation title generator. Generate a concise, descriptive title (max 40 characters) from the user question and assistant response. Return ONLY the title text, no quotes, no explanation.',
      },
      {
        role: 'user',
        content: `Question: "${query}"\n\nAnswer: "${responseSnippet}"\n\nGenerate a short, descriptive conversation title (max 40 chars):`,
      },
    ],
    max_tokens: 20,  // Short titles only
    temperature: 0.3,  // Low creativity for consistency
  }

  const openRouterResponse = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://trycastor.dev',
      'X-Title': 'Castor GEO',
    },
    body: JSON.stringify(requestBody),
  })

  if (!openRouterResponse.ok) {
    const errorText = await openRouterResponse.text()
    throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`)
  }

  const data = await openRouterResponse.json()
  const title = data.choices?.[0]?.message?.content?.trim()

  if (!title) {
    throw new Error('No title generated from OpenRouter')
  }

  return title
}

/**
 * Tier 4 fallback: Smart capitalization and common grammar fixes
 * No external APIs - instant, lightweight, always works
 */
function smartCapitalization(text: string): string {
  if (!text || text.length === 0) return 'New Conversation'

  // Trim to 40 characters max
  let result = text.length > 40 ? text.substring(0, 40).trim() + '...' : text.trim()

  // Common contraction fixes
  const contractionFixes: Record<string, string> = {
    'whats': "what's",
    'Whats': "What's",
    'im': "I'm",
    'Im': "I'm",
    'cant': "can't",
    'Cant': "Can't",
    'dont': "don't",
    'Dont': "Don't",
    'wont': "won't",
    'Wont': "Won't",
    'isnt': "isn't",
    'Isnt': "Isn't",
  }

  // Apply contraction fixes (word boundaries)
  Object.entries(contractionFixes).forEach(([wrong, right]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g')
    result = result.replace(regex, right)
  })

  // Title case: Capitalize first letter of each word (except small words)
  const smallWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of'])

  result = result
    .split(' ')
    .map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      // Don't capitalize small words unless they're first
      if (smallWords.has(word.toLowerCase())) {
        return word.toLowerCase()
      }
      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')

  return result
}
