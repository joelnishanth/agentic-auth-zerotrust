import { useState } from 'react'

export default function App() {
  const [token, setToken] = useState('')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')

  const send = async () => {
    try {
      const res = await fetch('http://agent:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: query
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setResult('error')
    }
  }

  return (
    <div>
      <h1>Offlyn.ai Zero Trust Demo</h1>
      <p>This demo showcases an agentic zero‑trust access pattern across US, EU and sandbox
      databases. Paste a JWT from Keycloak and a JSON query to explore the scenario.</p>
      <textarea
        placeholder="JWT"
        value={token}
        onChange={e => setToken(e.target.value)}
        style={{width:'100%',height:'4rem'}}
      />
      <textarea
        placeholder='{"resource":"patients","db":"us_db","action":"read"}'
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{width:'100%',height:'4rem'}}
      />
      <button onClick={send}>Send</button>
      <pre>{result}</pre>
    </div>
  )
}
