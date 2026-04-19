import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 300000, // 5 min 
  headers: { 'Content-Type': 'application/json' },
})

/**
 * send a chat message to the backend pipeline
 * first turn requires disease. Follow-up turns only need query + sessionId
 */
export const sendMessage = async ({ disease, query, location, sessionId }) => {
  const { data } = await client.post('/chat', { disease, query, location, sessionId })
  return data.data
}

export default client
