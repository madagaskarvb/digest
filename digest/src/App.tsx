import { useEffect, useState } from 'react'
import { loadDigest, type NewsItem } from './digest'

function App() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Состояния для фильтров
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('все')
  const [unreadOnly, setUnreadOnly] = useState(false)

  // ЗАДАНИЕ 3: Ленивая инициализация из localStorage с обработкой ошибок
  const [readIds, setReadIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem('digest-read-ids')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch {
      // Если JSON невалидный, просто игнорируем ошибку
    }
    return []
  })

  // ЗАДАНИЕ 3: Сохранение в localStorage при каждом изменении readIds
  useEffect(() => {
    localStorage.setItem('digest-read-ids', JSON.stringify(readIds))
  }, [readIds])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const url = import.meta.env.VITE_DIGEST_URL || ''
        const items = await loadDigest(url)
        
        if (!ignore) {
          setNews(items)
          setLoading(false)
        }
      } catch (e) {
        if (!ignore) {
          setError((e as Error).message)
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  if (loading) {
    return <p role="status" className="status-message">Загрузка дайджеста…</p>
  }

  if (error) {
    return <p role="alert" className="error-message">{error}</p>
  }

  const allTags = Array.from(new Set(news.flatMap((item) => item.tags)))

  // Вычисляем отфильтрованный список
  const filteredNews = news.filter((item) => {
    const searchLower = search.toLowerCase()
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) || 
      item.summary.toLowerCase().includes(searchLower)
    const matchesTag = selectedTag === 'все' || item.tags.includes(selectedTag)
    const matchesUnread = !unreadOnly || !readIds.includes(item.id)

    return matchesSearch && matchesTag && matchesUnread
  })

  const toggleRead = (id: string | number) => {
    setReadIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    )
  }

  return (
    <>
      <header className="header">
        <h1>Дайджест новостей</h1>
        <p>Новости Хабра, 3DNews и iXBT, пересказанные моделью</p>
      </header>

      <main className="main">
        <div className="filters">
          <label className="filter-group">
            <span>Поиск</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Введите текст..."
            />
          </label>

          <label className="filter-group">
            <span>Тег</span>
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
              <option value="все">все</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </label>

          <label className="filter-group filter-group--checkbox">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            <span>Только непрочитанные</span>
          </label>
        </div>

        <p className="stats-counter">
          Показано {filteredNews.length} из {news.length}
        </p>

        {filteredNews.length === 0 ? (
          <p className="empty-message">Ничего не найдено</p>
        ) : (
          <div className="digest-list">
            {filteredNews.map((item) => {
              const isRead = readIds.includes(item.id)
              
              return (
                <article key={item.id} className={`digest-card ${isRead ? 'digest-card--read' : ''}`}>
                  <h2 className="digest-card__title">
                    <a href={item.link} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h2>
                  <div className="digest-card__meta">
                    {item.source} · {new Date(item.date).toLocaleString('ru-RU', { 
                      day: '2-digit', month: '2-digit', year: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                  <p className="digest-card__summary">{item.summary}</p>
                  
                  <div className="digest-card__footer">
                    <div className="digest-card__tags">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="digest-tag">{tag}</span>
                      ))}
                    </div>
                    <button 
                      className={`read-button ${isRead ? 'read-button--active' : ''}`}
                      onClick={() => toggleRead(item.id)}
                    >
                      {isRead ? 'Прочитано ✓' : 'Отметить прочитанным'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}

export default App