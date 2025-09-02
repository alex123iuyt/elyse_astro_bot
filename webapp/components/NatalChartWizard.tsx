'use client';
import { useState } from 'react';
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
    image: '/images/profile-step1.jpg'
  },
  {
    id: 2,
    title: 'Дата и время рождения',
    description: 'Точные данные для расчёта',
    icon: '📅',
    image: '/images/profile-step2.jpg'
  },
  {
    id: 3,
    title: 'Место рождения',
    description: 'Город и страна',
    icon: '🌍',
    image: '/images/profile-step3.jpg'
  },
  {
    id: 4,
    title: 'Личные детали',
    description: 'Дополнительная информация',
    icon: '💫',
    image: '/images/profile-step4.jpg'
  },
  {
    id: 5,
    title: 'Интересы',
    description: 'Что вас интересует',
    icon: '⭐',
    image: '/images/profile-step5.jpg'
  }
];

const interests = [
  'Любовь и отношения', 'Карьера', 'Здоровье', 'Финансы',
  'Семья', 'Путешествия', 'Образование', 'Творчество',
  'Спорт', 'Духовность', 'Технологии', 'Природа'
];

export default function NatalChartWizard({ 
  isOpen, 
  onClose, 
  onComplete 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onComplete: (data: NatalChartData) => void; 
}) {
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

  const updateData = (field: keyof NatalChartData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
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
    onComplete(data);
    onClose();
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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-purple-500/20">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">{steps[currentStep - 1].icon}</div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
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

        {/* Step Title */}
        <div className="px-6 pt-4">
          <h2 className="text-xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-zinc-400 text-sm mb-6">{steps[currentStep - 1].description}</p>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6">
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
        <div className="px-6 pb-6 flex space-x-3">
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
      </motion.div>
    </motion.div>
  );
}











