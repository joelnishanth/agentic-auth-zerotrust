// Utility for generating human-readable narratives from JSON data using Ollama

const OLLAMA_URL = 'http://localhost:11434/api/generate'

export const generateNarrative = async (jsonData, context = 'database query') => {
  try {
    // Parse JSON if it's a string
    let data
    try {
      data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    } catch {
      return jsonData // Return as-is if not valid JSON
    }

    // Create a prompt for Ollama to generate a human-readable narrative
    const prompt = `You are a helpful assistant that converts technical database results into clear, human-readable summaries.

Context: ${context}

Raw Data:
${JSON.stringify(data, null, 2)}

Instructions:
1. Create a clear, conversational summary of this data
2. Focus on the key information that would be useful to a healthcare professional
3. Use natural language, not technical jargon
4. If there are multiple records, summarize the key patterns or highlights
5. If it's authorization data, explain what access was granted or denied and why
6. Keep it concise but informative
7. Use bullet points or short paragraphs for readability

Generate a human-readable narrative:`

    const payload = {
      model: 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 300
      }
    }

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000) // 15 second timeout
    })

    if (response.ok) {
      const result = await response.json()
      let narrative = result.response?.trim()
      
      if (narrative) {
        // Clean up the narrative
        narrative = narrative.replace(/^(Here's a|Here is a|This is a).*?summary:?\s*/i, '')
        narrative = narrative.replace(/^Summary:?\s*/i, '')
        return narrative
      }
    }
    
    // Fallback to basic formatting if Ollama fails
    return generateBasicNarrative(data, context)
    
  } catch (error) {
    console.log('Narrative generation failed, using fallback:', error.message)
    // Fallback to basic formatting
    return generateBasicNarrative(jsonData, context)
  }
}

// Fallback function for basic narrative generation
const generateBasicNarrative = (data, context) => {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data

    if (parsed.authorized !== undefined) {
      // Authorization response
      const status = parsed.authorized ? 'Access Granted' : 'Access Denied'
      let narrative = `${status} for ${parsed.resource || 'resource'}`
      if (parsed.database) narrative += ` in ${parsed.database}`
      if (parsed.action) narrative += ` (${parsed.action} operation)`
      if (parsed.reason) narrative += `\n\nReason: ${parsed.reason}`
      return narrative
    }

    if (parsed.data && Array.isArray(parsed.data)) {
      // Database query results
      const count = parsed.data.length
      if (count === 0) {
        return 'No records found matching your query.'
      }
      
      let narrative = `Found ${count} record${count !== 1 ? 's' : ''}`
      if (parsed.query) narrative += ` for query: "${parsed.query}"`
      
      if (count > 0) {
        const firstRecord = parsed.data[0]
        const fields = Object.keys(firstRecord)
        narrative += `\n\nData includes: ${fields.join(', ')}`
        
        if (count <= 3) {
          // Show details for small result sets
          narrative += '\n\nDetails:'
          parsed.data.forEach((record, index) => {
            narrative += `\n${index + 1}. `
            const keyFields = ['name', 'patient_name', 'username', 'title', 'id']
            const keyField = keyFields.find(field => record[field])
            if (keyField) {
              narrative += `${record[keyField]}`
            } else {
              narrative += `Record ${index + 1}`
            }
          })
        }
      }
      
      return narrative
    }

    // Generic object
    const keys = Object.keys(parsed)
    return `Data contains ${keys.length} field${keys.length !== 1 ? 's' : ''}: ${keys.join(', ')}`
    
  } catch {
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }
}

export default generateNarrative