"use client";
import { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import Loader from '../../../components/ui/Loader';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  pricePerWeek: number;
  savings?: number;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
}

interface PromoVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  showOnMainPage: boolean;
  autoPlay: boolean;
  showOnMobile: boolean;
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [promoVideo, setPromoVideo] = useState<PromoVideo | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadSubscriptionPlans();
    loadPromoVideo();
  }, []);

  const loadSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPromoVideo = async () => {
    setIsLoadingVideo(true);
    try {
      const response = await fetch('/api/admin/promo-video');
      if (response.ok) {
        const data = await response.json();
        setPromoVideo(data.promoVideo);
      }
    } catch (error) {
      console.error('Error loading promo video:', error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleToggleActive = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await loadSubscriptionPlans(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Error toggling plan active status:', error);
    }
  };

  const handleTogglePopular = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}/toggle-popular`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await loadSubscriptionPlans(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Error toggling plan popular status:', error);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowAddForm(true);
  };

  const handleSave = async (planData: Partial<SubscriptionPlan>) => {
    setIsSaving(true);
    try {
      const url = editingPlan 
        ? `/api/admin/subscriptions/${editingPlan.id}`
        : '/api/admin/subscriptions';
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });
      
      if (response.ok) {
        await loadSubscriptionPlans();
        setShowAddForm(false);
        setEditingPlan(null);
      }
    } catch (error) {
      console.error('Error saving subscription plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот тариф?')) {
      try {
        const response = await fetch(`/api/admin/subscriptions/${planId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await loadSubscriptionPlans();
        }
      } catch (error) {
        console.error('Error deleting subscription plan:', error);
      }
    }
  };

  const handleSavePromoVideo = async (videoData: Partial<PromoVideo>) => {
    setIsSaving(true);
    try {
      const url = promoVideo 
        ? `/api/admin/promo-video/${promoVideo.id}`
        : '/api/admin/promo-video';
      
      const method = promoVideo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });
      
      if (response.ok) {
        await loadPromoVideo();
        setShowVideoForm(false);
      }
    } catch (error) {
      console.error('Error saving promo video:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <Loader size="lg" text="Загружаем данные..." fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <AdminHeader title="Управление подписками" backFallback="/admin/dashboard" />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Тарифы и подписки</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowVideoForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🎬 Промо видео
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Добавить тариф
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Активные подписки</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {plans.filter(p => p.isActive).length}
            </p>
            <p className="text-sm text-zinc-400">Активных тарифов</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Популярные тарифы</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {plans.filter(p => p.isPopular).length}
            </p>
            <p className="text-sm text-zinc-400">Популярных тарифов</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Всего тарифов</h3>
            <p className="text-3xl font-bold text-emerald-400">{plans.length}</p>
            <p className="text-sm text-zinc-400">Всего доступно</p>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тарифные планы</h2>
          
          {plans.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p>Тарифы не найдены</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-emerald-400 hover:text-emerald-300"
              >
                Создать первый тариф
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {plan.isPopular && (
                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          Популярно
                        </span>
                      )}
                      {plan.savings && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Экономия {plan.savings}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(plan.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          plan.isActive 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-zinc-600 text-zinc-300'
                        }`}
                      >
                        {plan.isActive ? 'Активен' : 'Неактивен'}
                      </button>
                      
                      <button
                        onClick={() => handleTogglePopular(plan.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          plan.isPopular 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-zinc-600 text-zinc-300'
                        }`}
                      >
                        {plan.isPopular ? 'Популярно' : 'Обычный'}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(plan)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Изменить
                      </button>
                      
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Длительность:</span>
                      <p className="text-white">{plan.duration}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Цена:</span>
                      <p className="text-white">₽{plan.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">В неделю:</span>
                      <p className="text-white">₽{plan.pricePerWeek.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-zinc-400 text-sm">Возможности:</span>
                    <ul className="list-disc list-inside text-sm text-zinc-300 mt-1">
                      {plan.features && Array.isArray(plan.features) ? (
                        plan.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))
                      ) : (
                        <li className="text-zinc-500">Возможности не указаны</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo Video Settings */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Промо видео</h2>
          
          {isLoadingVideo ? (
            <div className="text-center py-4">
              <Loader size="md" text="Загружаем настройки видео..." />
            </div>
          ) : (
            <div className="space-y-4">
              {promoVideo ? (
                <div className="bg-zinc-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-zinc-600 rounded-lg p-4 flex-1">
                      <h3 className="font-semibold mb-2">Текущее видео</h3>
                      <div className="text-center">
                        <span className="text-2xl">🎬</span>
                        <p className="text-sm text-zinc-400">{promoVideo.title}</p>
                        <p className="text-xs text-zinc-500">{promoVideo.videoUrl}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => setShowVideoForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Изменить
                      </button>
                      <button 
                        onClick={() => window.open(promoVideo.videoUrl, '_blank')}
                        className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded"
                      >
                        Предпросмотр
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-zinc-600 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Настройки отображения</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={promoVideo.showOnMainPage} 
                          disabled 
                          className="rounded" 
                        />
                        <span>Показывать на главной странице</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={promoVideo.autoPlay} 
                          disabled 
                          className="rounded" 
                        />
                        <span>Автовоспроизведение (без звука)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={promoVideo.showOnMobile} 
                          disabled 
                          className="rounded" 
                        />
                        <span>Показывать в мобильной версии</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <p>Промо видео не настроено</p>
                  <button
                    onClick={() => setShowVideoForm(true)}
                    className="mt-2 text-emerald-400 hover:text-emerald-300"
                  >
                    Настроить промо видео
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showAddForm && (
        <PlanFormModal
          plan={editingPlan}
          onSave={handleSave}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPlan(null);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Add/Edit Video Modal */}
      {showVideoForm && (
        <VideoFormModal
          video={promoVideo}
          onSave={handleSavePromoVideo}
          onCancel={() => setShowVideoForm(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// Компонент формы для тарифов
function PlanFormModal({ plan, onSave, onCancel, isSaving }: {
  plan: SubscriptionPlan | null;
  onSave: (data: Partial<SubscriptionPlan>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    duration: plan?.duration || '',
    price: plan?.price || 0,
    pricePerWeek: plan?.pricePerWeek || 0,
    savings: plan?.savings || 0,
    features: plan?.features && Array.isArray(plan.features) ? plan.features : [''],
    isActive: plan?.isActive ?? true,
    isPopular: plan?.isPopular ?? false
  });

  const [isFree, setIsFree] = useState(plan?.price === 0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Автоматически обновляем цены при изменении чекбокса бесплатного тарифа
  useEffect(() => {
    if (isFree) {
      setFormData(prev => ({
        ...prev,
        price: 0,
        pricePerWeek: 0
      }));
    }
  }, [isFree]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Проверка названия
    if (!formData.name.trim()) {
      newErrors.name = 'Название тарифа обязательно';
    }
    
    // Проверка длительности
    if (!formData.duration.trim()) {
      newErrors.duration = 'Длительность обязательна';
    }
    
    // Проверка цены
    if (!isFree) {
      if (formData.price <= 0) {
        newErrors.price = 'Цена должна быть больше 0';
      }
      if (formData.pricePerWeek <= 0) {
        newErrors.pricePerWeek = 'Цена в неделю должна быть больше 0';
      }
    }
    
    // Проверка возможностей
    if (!formData.features || formData.features.length === 0 || 
        formData.features.some(f => !f.trim())) {
      newErrors.features = 'Добавьте хотя бы одну возможность';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Если тариф бесплатный, устанавливаем цены в 0
    const dataToSave = isFree ? {
      ...formData,
      price: 0,
      pricePerWeek: 0
    } : formData;
    
    onSave(dataToSave);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {plan ? 'Редактировать тариф' : 'Добавить новый тариф'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название тарифа</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                required
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Длительность</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                placeholder="например: 30 дней"
                required
              />
              {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration}</p>}
            </div>
            
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Бесплатный тариф</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Цена (₽)</label>
              <input
                type="number"
                value={isFree ? 0 : formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  // Убираем нули в начале
                  if (value.startsWith('0') && value.length > 1) {
                    const cleanValue = value.replace(/^0+/, '');
                    setFormData(prev => ({ ...prev, price: parseInt(cleanValue) || 0 }));
                  } else {
                    setFormData(prev => ({ ...prev, price: parseInt(value) || 0 }));
                  }
                }}
                className={`w-full border rounded-lg px-3 py-2 text-white ${
                  isFree 
                    ? 'bg-zinc-600 border-zinc-500 cursor-not-allowed' 
                    : 'bg-zinc-700 border-zinc-600'
                }`}
                disabled={isFree}
                min="0"
                required={!isFree}
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Цена в неделю (₽)</label>
              <input
                type="number"
                value={isFree ? 0 : formData.pricePerWeek}
                onChange={(e) => {
                  const value = e.target.value;
                  // Убираем нули в начале
                  if (value.startsWith('0') && value.length > 1) {
                    const cleanValue = value.replace(/^0+/, '');
                    setFormData(prev => ({ ...prev, pricePerWeek: parseFloat(cleanValue) || 0 }));
                  } else {
                    setFormData(prev => ({ ...prev, pricePerWeek: parseFloat(value) || 0 }));
                  }
                }}
                className={`w-full border rounded-lg px-3 py-2 text-white ${
                  isFree 
                    ? 'bg-zinc-600 border-zinc-500 cursor-not-allowed' 
                    : 'bg-zinc-700 border-zinc-600'
                }`}
                disabled={isFree}
                step="0.01"
                min="0"
                required={!isFree}
              />
              {errors.pricePerWeek && <p className="text-red-400 text-sm mt-1">{errors.pricePerWeek}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Экономия (%)</label>
              <input
                type="number"
                value={formData.savings}
                onChange={(e) => {
                  const value = e.target.value;
                  // Убираем нули в начале
                  if (value.startsWith('0') && value.length > 1) {
                    const cleanValue = value.replace(/^0+/, '');
                    setFormData(prev => ({ ...prev, savings: parseInt(cleanValue) || 0 }));
                  } else {
                    setFormData(prev => ({ ...prev, savings: parseInt(value) || 0 }));
                  }
                }}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Возможности</label>
            {formData.features && Array.isArray(formData.features) ? (
              formData.features.map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Описание возможности"
                    required
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-zinc-400 text-sm">Загрузка возможностей...</div>
            )}
            {errors.features && <p className="text-red-400 text-sm">{errors.features}</p>}
            <button
              type="button"
              onClick={addFeature}
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              + Добавить возможность
            </button>
          </div>
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <span>Активен</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="rounded"
              />
              <span>Популярно</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg transition-colors"
            >
              {isSaving ? 'Сохранение...' : (plan ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Компонент формы для промо видео
function VideoFormModal({ video, onSave, onCancel, isSaving }: {
  video: PromoVideo | null;
  onSave: (data: Partial<PromoVideo>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    videoUrl: video?.videoUrl || '',
    thumbnailUrl: video?.thumbnailUrl || '',
    isActive: video?.isActive ?? true,
    showOnMainPage: video?.showOnMainPage ?? true,
    autoPlay: video?.autoPlay ?? true,
    showOnMobile: video?.showOnMobile ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {video ? 'Редактировать промо видео' : 'Добавить промо видео'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Название видео</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">URL видео</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
              placeholder="https://example.com/video.mp4"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">URL превью (опционально)</label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <span>Активно</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.showOnMainPage}
                onChange={(e) => setFormData(prev => ({ ...prev, showOnMainPage: e.target.checked }))}
                className="rounded"
              />
              <span>Показывать на главной</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.autoPlay}
                onChange={(e) => setFormData(prev => ({ ...prev, autoPlay: e.target.checked }))}
                className="rounded"
              />
              <span>Автовоспроизведение</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.showOnMobile}
                onChange={(e) => setFormData(prev => ({ ...prev, showOnMobile: e.target.checked }))}
                className="rounded"
              />
              <span>Показывать на мобильных</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg transition-colors"
            >
              {isSaving ? 'Сохранение...' : (video ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
