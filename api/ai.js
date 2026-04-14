import { handleAIRequest } from '../server/ai-handler.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const result = await handleAIRequest(req.body, process.env)
  res.status(result.status).json(result.body)
}
