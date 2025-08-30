'use client';

import { useState, useEffect } from 'react';

interface ContentType {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface ContentItem {
  id: string;
  title: string;
  status: string;
  effectiveDate?: string;
  dateFrom?: string;
  dateTo?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentManagementProps {
  contentType: ContentType;
  selectedSign?: string;
  selectedStatus?: string;
}

export function ContentManagement({ contentType, selectedSign, selectedStatus }: ContentManagementProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedSign) params.append('sign', selectedSign);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`/api/admin/content/${contentType.id}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.data || []);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload content when filters change
  useEffect(() => {
    loadContent();
  }, [contentType, selectedSign, selectedStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Черновик', className: 'bg-yellow-600 text-white' },
      PUBLISHED: { label: 'Опубликовано', className: 'bg-green-600 text-white' },
      SCHEDULED: { label: 'Запланировано', className: 'bg-blue-600 text-white' },
      ARCHIVED: { label: 'Архив', className: 'bg-gray-600 text-white' },
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по заголовку или содержимому..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder:text-gray-400"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {content.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-400 text-lg">Контент не найден</p>
            <p className="text-gray-500">Попробуйте изменить фильтры или создать новый контент</p>
          </div>
        ) : (
          content.map((item) => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{contentType.icon}</span>
                    <span className="text-sm text-gray-400">
                      {contentType.name}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <span>Создано: {formatDate(item.createdAt)}</span>
                      <span>Обновлено: {formatDate(item.updatedAt)}</span>
                      {item.authorName && <span>Автор: {item.authorName}</span>}
                      {item.effectiveDate && <span>Дата: {formatDate(item.effectiveDate)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(item.status)}
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                    ✏️
                  </button>
                  <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                    👁️
                  </button>
                  <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


