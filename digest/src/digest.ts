export type NewsItem = {
  id: string | number
  title: string
  link: string
  source: string
  date: string
  summary: string
  tags: string[]
}

export async function loadDigest(url: string): Promise<NewsItem[]> {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Дайджест не загрузился: код ${response.status}.`)
  }

  const data = await response.json()
  
  const news: NewsItem[] = data.news.map((item: any) => ({
    id: item.id ?? Math.random().toString(),
    title: item.title,
    link: item.link,
    source: item.source,
    date: item.date,
    summary: item.summary,
    tags: typeof item.tags === 'string' 
      ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : item.tags ?? []
  }))

  return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}