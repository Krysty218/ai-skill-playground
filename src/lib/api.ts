// API utility functions for AI processing

export const analyzeConversation = async (audioFile: File) => {
  const formData = new FormData()
  formData.append('audio', audioFile)

  const response = await fetch('/api/conversation-analysis', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Conversation analysis failed')
  }

  return response.json()
}

export const analyzeImage = async (imageFile: File) => {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch('/api/image-analysis', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Image analysis failed')
  }

  return response.json()
}

export const analyzeDocument = async (file?: File, url?: string) => {
  const formData = new FormData()
  
  if (file) {
    formData.append('file', file)
  } else if (url) {
    formData.append('url', url)
  }

  const response = await fetch('/api/document-analysis', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Document analysis failed')
  }

  return response.json()
}