import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import App from './App'

const mockNewsData = {
  news: [
    {
      id: '1',
      title: 'Старая новость про ИИ',
      link: 'https://example.com/old',
      source: 'Хабр',
      date: '2026-11-15T10:00:00Z',
      summary: 'Старый текст про нейросети',
      tags: 'наука, ИИ',
    },
    {
      id: '2',
      title: 'Новая новость про железо',
      link: 'https://example.com/new',
      source: 'iXBT',
      date: '2026-11-16T12:00:00Z',
      summary: 'Новый текст про видеокарты',
      tags: 'железо',
    },
  ],
}

describe('App (Дайджест - Фильтры и localStorage)', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderApp = async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNewsData,
    }))
    render(<App />)
    await screen.findByText('Новая новость про железо')
  }

  it('фильтрует новости по тексту поиска', async () => {
    await renderApp()
    const user = userEvent.setup()

    const searchInput = screen.getByLabelText('Поиск')
    await user.type(searchInput, 'ИИ')

    expect(screen.queryByText('Новая новость про железо')).not.toBeInTheDocument()
    expect(screen.getByText('Старая новость про ИИ')).toBeInTheDocument()
    expect(screen.getByText('Показано 1 из 2')).toBeInTheDocument()
  })

  it('фильтрует новости по выбранному тегу', async () => {
    await renderApp()
    const user = userEvent.setup()

    const tagSelect = screen.getByLabelText('Тег')
    await user.selectOptions(tagSelect, 'железо')

    expect(screen.queryByText('Старая новость про ИИ')).not.toBeInTheDocument()
    expect(screen.getByText('Новая новость про железо')).toBeInTheDocument()
    expect(screen.getByText('Показано 1 из 2')).toBeInTheDocument()
  })

  it('скрывает прочитанную новость при включении "Только непрочитанные"', async () => {
    await renderApp()
    const user = userEvent.setup()

    const card = screen.getByText('Старая новость про ИИ').closest('article')
    const button = within(card!).getByRole('button', { name: 'Отметить прочитанным' })
    
    await user.click(button)

    const unreadCheckbox = screen.getByLabelText('Только непрочитанные')
    await user.click(unreadCheckbox)

    expect(screen.queryByText('Старая новость про ИИ')).not.toBeInTheDocument()
    expect(screen.getByText('Новая новость про железо')).toBeInTheDocument()
  })

  it('показывает "Ничего не найдено", если фильтры не дают результатов', async () => {
    await renderApp()
    const user = userEvent.setup()

    const searchInput = screen.getByLabelText('Поиск')
    await user.type(searchInput, 'несуществующий текст')

    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
    expect(screen.queryByText('Новая новость про железо')).not.toBeInTheDocument()
    expect(screen.getByText('Показано 0 из 2')).toBeInTheDocument()
  })

  // --- ЗАДАНИЕ 3: Новые тесты ---

  it('сохраняет прочитанную новость в localStorage', async () => {
    await renderApp()
    const user = userEvent.setup()

    const card = screen.getByText('Старая новость про ИИ').closest('article')
    const button = within(card!).getByRole('button', { name: 'Отметить прочитанным' })
    await user.click(button)

    const saved = localStorage.getItem('digest-read-ids')
    expect(JSON.parse(saved!)).toContain('1')
  })

  it('восстанавливает прочитанные новости из localStorage', async () => {
    // Предварительно записываем ID новости '1' как прочитанную
    localStorage.setItem('digest-read-ids', JSON.stringify(['1']))
    
    await renderApp()

    // Проверяем, что кнопка этой новости имеет статус "Прочитано"
    const card = screen.getByText('Старая новость про ИИ').closest('article')
    expect(within(card!).getByRole('button', { name: /Прочитано/ })).toBeInTheDocument()

    // Проверяем, что при включении фильтра новость исчезает
    const user = userEvent.setup()
    const unreadCheckbox = screen.getByLabelText('Только непрочитанные')
    await user.click(unreadCheckbox)

    expect(screen.queryByText('Старая новость про ИИ')).not.toBeInTheDocument()
  })

  it('игнорирует невалидные данные в localStorage', async () => {
    // Записываем испорченную строку
    localStorage.setItem('digest-read-ids', 'not-a-json')
    
    await renderApp()

    // Приложение должно рендериться без ошибок, новости не считаются прочитанными
    const card = screen.getByText('Старая новость про ИИ').closest('article')
    expect(within(card!).getByRole('button', { name: 'Отметить прочитанным' })).toBeInTheDocument()
  })
})