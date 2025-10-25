/*
  Provider helpers for keyword and competitor data.
  - Uses free sources where possible (Google Autocomplete).
  - Integrates optional paid APIs when env keys are present.
*/

export type KeywordMetric = {
  searchVolume: number | null
  cpcUSD: number | null
  competition: number | null // 0–100 scale when available
}

export async function getAutocompleteSuggestions(seed: string): Promise<string[]> {
  try {
    if (!seed || seed.trim().length === 0) return []
    const endpoint = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`
    const res = await fetch(endpoint)
    if (!res.ok) return []
    const data = await res.json()
    // Format: ["seed", ["suggest1", "suggest2", ...], ...]
    const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : []
    return suggestions.filter((s: unknown) => typeof s === 'string')
  } catch (e) {
    return []
  }
}

export async function getSearchVolumeDataForKeywords(
  keywords: string[],
  opts?: { locationCode?: number; languageCode?: string }
): Promise<Record<string, KeywordMetric>> {
  const out: Record<string, KeywordMetric> = {}
  if (!Array.isArray(keywords) || keywords.length === 0) return out

  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) {
    // No provider credentials; return empty to allow caller fallback
    return out
  }

  try {
    const endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live'
    const body = {
      keywords,
      location_code: opts?.locationCode ?? 2840, // 2840: United States
      language_code: opts?.languageCode ?? 'en'
    }
    const auth = Buffer.from(`${login}:${password}`).toString('base64')
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      return out
    }
    const json = await res.json()
    // Expected structure: data array with items per keyword
    const items = json?.tasks?.[0]?.result?.[0]?.items || json?.items || []
    for (const item of items) {
      const keyword = item?.keyword
      if (!keyword) continue
      const vol = item?.search_volume ?? item?.monthly_searches ?? null
      const cpc = item?.cpc ?? item?.cpc_value ?? null
      const comp = item?.competition_index ?? item?.competition ?? null
      out[keyword] = {
        searchVolume: typeof vol === 'number' ? vol : null,
        cpcUSD: typeof cpc === 'number' ? cpc : null,
        competition: typeof comp === 'number' ? Math.round(comp * 100) : null
      }
    }
    return out
  } catch {
    return out
  }
}

export async function getTrendsFromSerpApi(
  keyword: string,
  opts?: { geo?: string }
): Promise<Array<{ time: string; value: number }>> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) return []
  try {
    const endpoint = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(keyword)}${opts?.geo ? `&geo=${encodeURIComponent(opts.geo)}` : ''}&api_key=${apiKey}`
    const res = await fetch(endpoint)
    if (!res.ok) return []
    const json: unknown = await res.json()
    const isTrendPoint = (x: unknown): x is { time?: string | number; value?: number | string } => {
      if (typeof x !== 'object' || x === null) return false
      const rec = x as Record<string, unknown>
      const time = rec.time
      const value = rec.value
      const timeOk = typeof time === 'string' || typeof time === 'number' || time === undefined
      const valueOk = typeof value === 'number' || typeof value === 'string' || value === undefined
      return timeOk && valueOk
    }

    let timeline: unknown = []
    if (typeof json === 'object' && json !== null) {
      const root = json as Record<string, unknown>
      const interest = root['interest_over_time']
      if (typeof interest === 'object' && interest !== null) {
        const interestRec = interest as Record<string, unknown>
        timeline = interestRec['timeline'] ?? []
      }
    }

    return Array.isArray(timeline)
      ? timeline.filter(isTrendPoint).map((t) => ({ time: String(t.time ?? ''), value: Number(t.value ?? 0) }))
      : []
  } catch {
    return []
  }
}