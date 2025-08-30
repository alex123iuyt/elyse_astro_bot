'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Save, 
  Eye, 
  Download,
  Sparkles,
  FileText,
  Image,
  Video
} from 'lucide-react'

interface ContentFormProps {
  isOpen: boolean
  onClose: () => void
  content?: any
  mode: 'create' | 'edit'
}

const contentTypes = [
  { id: 'daily-tips', label: 'Ежедневные советы', description: 'Советы на каждый день' },
  { id: 'weekly-forecasts', label: 'Недельные прогнозы', description: 'Прогнозы на неделю' },
  { id: 'compatibility', label: 'Совместимость', description: 'Анализ совместимости знаков' },
  { id: 'natal-chart', label: 'Натальная карта', description: 'Интерпретация натальной карты' },
  { id: 'onboarding', label: 'Онбординг', description: 'Приветственные сообщения' },
  { id: 'push-notifications', label: 'Push-уведомления', description: 'Уведомления для пользователей' }
]

export default function ContentForm({ isOpen, onClose, content, mode }: ContentFormProps) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    type: content?.type || 'daily-tips',
    content: content?.content || '',
    status: content?.status || 'draft',
    tags: content?.tags || [],
    scheduledAt: content?.scheduledAt || ''
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика сохранения
    console.log('Saving content:', formData)
    onClose()
  }

  const handleGenerate = async (type: 'title' | 'content' | 'tags') => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          input: formData.title || 'астрологический контент',
          generationType: type
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        switch (type) {
          case 'title':
            setFormData(prev => ({
              ...prev,
              title: result.content
            }))
            break
          case 'content':
            setFormData(prev => ({
              ...prev,
              content: result.content
            }))
            break
          case 'tags':
            setFormData(prev => ({
              ...prev,
              tags: result.content
            }))
            break
        }
      } else {
        console.error('Generation failed:', result.error)
        // Fallback на заглушку
        switch (type) {
          case 'title':
            setFormData(prev => ({
              ...prev,
              title: `[AI] Сгенерированный заголовок для ${contentTypes.find(t => t.id === prev.type)?.label}`
            }))
            break
          case 'content':
            setFormData(prev => ({
              ...prev,
              content: `[AI] Сгенерированный контент для ${contentTypes.find(t => t.id === prev.type)?.label}.\n\nЭто автоматически созданный текст, который можно отредактировать под ваши нужды.`
            }))
            break
          case 'tags':
            setFormData(prev => ({
              ...prev,
              tags: ['астрология', 'прогноз', 'совет']
            }))
            break
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      // Fallback на заглушку при ошибке
      switch (type) {
        case 'title':
          setFormData(prev => ({
            ...prev,
            title: `[AI] Сгенерированный заголовок для ${contentTypes.find(t => t.id === prev.type)?.label}`
          }))
          break
        case 'content':
          setFormData(prev => ({
            ...prev,
            content: `[AI] Сгенерированный контент для ${contentTypes.find(t => t.id === prev.type)?.label}.\n\nЭто автоматически созданный текст, который можно отредактировать под ваши нужды.`
          }))
          break
        case 'tags':
          setFormData(prev => ({
            ...prev,
            tags: ['астрология', 'прогноз', 'совет']
          }))
          break
      }
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-800 border-zinc-700">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-white">
            {mode === 'create' ? 'Создать новый контент' : 'Редактировать контент'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Тип контента */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Тип контента
              </label>
              <Select value={formData.type} onValueChange={(value: string) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-700 border-zinc-600">
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-white hover:bg-zinc-600">
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-400">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Заголовок */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  Заголовок
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate('title')}
                  disabled={isGenerating}
                  className="border-zinc-600 text-white hover:bg-zinc-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Генерирую...' : 'Сгенерировать'}
                </Button>
              </div>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите заголовок контента..."
                className="bg-zinc-700 border-zinc-600 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Контент */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  Содержимое
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate('content')}
                  disabled={isGenerating}
                  className="border-zinc-600 text-white hover:bg-zinc-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Генерирую...' : 'Сгенерировать'}
                </Button>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Введите содержимое контента..."
                rows={8}
                className="bg-zinc-700 border-zinc-600 text-white placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Теги */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  Теги
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate('tags')}
                  disabled={isGenerating}
                  className="border-zinc-600 text-white hover:bg-zinc-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Генерирую...' : 'Сгенерировать'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-zinc-600 text-white">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_: string, i: number) => i !== index)
                      }))}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Добавить тег..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    if (input.value.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, input.value.trim()]
                      }))
                      input.value = ''
                    }
                  }
                }}
                className="mt-2 bg-zinc-700 border-zinc-600 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Статус и планирование */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Статус
                </label>
                <Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-700 border-zinc-600">
                    <SelectItem value="draft" className="text-white hover:bg-zinc-600">Черновик</SelectItem>
                    <SelectItem value="published" className="text-white hover:bg-zinc-600">Опубликовано</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Запланировать на
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" className="border-zinc-600 text-white hover:bg-zinc-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Предварительный просмотр
                </Button>
                <Button type="button" variant="outline" className="border-zinc-600 text-white hover:bg-zinc-700">
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose} className="border-zinc-600 text-white hover:bg-zinc-700">
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Создать' : 'Сохранить'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
