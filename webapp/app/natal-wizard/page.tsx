'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface NatalChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  gender: string;
  relationshipStatus: string;
  occupation: string;
  interests: string[];
}

const steps = [
  {
    id: 1,
    title: 'Основная информация',
    description: 'Расскажите о себе',
    icon: '👤',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 2,
    title: 'Дата и время рождения',
    description: 'Точные данные для расчёта',
    icon: '📅',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 3,
    title: 'Место рождения',
    description: 'Город и страна',
    icon: '🌍',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 4,
    title: 'Личные детали',
    description: 'Дополнительная информация',
    icon: '💫',
    color: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 5,
    title: 'Интересы',
    description: 'Что вас интересует',
    icon: '⭐',
    color: 'from-yellow-500/20 to-amber-500/20'
  }
];

const interests = [
  'Любовь и отношения', 'Карьера', 'Здоровье', 'Финансы',
  'Семья', 'Путешествия', 'Образование', 'Творчество',
  'Спорт', 'Духовность', 'Технологии', 'Природа'
];

export default function NatalWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<NatalChartData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthCountry: '',
    gender: '',
    relationshipStatus: '',
    occupation: '',
    interests: []
  });

  useEffect(() => {
    // Загружаем сохраненные данные
    const saved = ls.get('elyse.natalChart', null);
    if (saved) {
      setData(saved);
    }
  }, []);

  const updateData = (field: keyof NatalChartData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    ls.set('elyse.natalChart', newData);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    ls.set('elyse.natalChart', data);
    // После заполнения профиля перенаправляем на главную страницу с прогнозами
    router.push('/');
  };

  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest];
    updateData('interests', newInterests);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Как вас зовут?</h3>
              <p className="text-zinc-400">Введите ваше полное имя для персонального гороскопа</p>
            </div>
            <input
              type="text"
              placeholder="Ваше имя"
              value={data.name}
              onChange={(e) => updateData('name', e.target.value)}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Дата и время рождения</h3>
              <p className="text-zinc-400">Точные данные необходимы для расчёта натальной карты</p>
            </div>
            <div className="space-y-4">
              <input
                type="date"
                value={data.birthDate}
                onChange={(e) => updateData('birthDate', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <input
                type="time"
                value={data.birthTime}
                onChange={(e) => updateData('birthTime', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Место рождения</h3>
              <p className="text-zinc-400">Укажите город и страну для точного расчёта</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Город рождения"
                value={data.birthCity}
                onChange={(e) => updateData('birthCity', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Страна рождения"
                value={data.birthCountry}
                onChange={(e) => updateData('birthCountry', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Личные детали</h3>
              <p className="text-zinc-400">Дополнительная информация для персонализации</p>
            </div>
            <div className="space-y-4">
              <select
                value={data.gender}
                onChange={(e) => updateData('gender', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">Выберите пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
              
              <select
                value={data.relationshipStatus}
                onChange={(e) => updateData('relationshipStatus', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">Семейное положение</option>
                <option value="single">Холост/Не замужем</option>
                <option value="relationship">В отношениях</option>
                <option value="married">Женат/Замужем</option>
                <option value="complicated">Сложно</option>
              </select>
              
              <input
                type="text"
                placeholder="Профессия"
                value={data.occupation}
                onChange={(e) => updateData('occupation', e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Ваши интересы</h3>
              <p className="text-zinc-400">Выберите темы, которые вас интересуют больше всего</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-xl border transition-all ${
                    data.interests.includes(interest)
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold">Натальная карта</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Шаг {currentStep} из {steps.length}</span>
          <span className="text-sm text-emerald-400">{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <motion.div
            className="bg-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="px-4">
        <div className={`h-32 bg-gradient-to-br ${steps[currentStep - 1].color} rounded-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">{steps[currentStep - 1].icon}</div>
          </div>
        </div>
        
        <div className="text-center mt-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-zinc-400">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex space-x-3">
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="flex-1 py-3 px-4 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Назад
          </button>
        )}
        
        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Далее
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Завершить
          </button>
        )}
      </div>
    </div>
  );
}

