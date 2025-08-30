"use client";

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ size = 'md', text = 'Загрузка...', fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const planetSizes = {
    sm: { sun: 'w-8 h-8', planet1: 'w-3 h-3', planet2: 'w-2 h-2', planet3: 'w-2.5 h-2.5' },
    md: { sun: 'w-12 h-12', planet1: 'w-4 h-4', planet2: 'w-3 h-3', planet3: 'w-3.5 h-3.5' },
    lg: { sun: 'w-16 h-16', planet1: 'w-6 h-6', planet2: 'w-4 h-4', planet3: 'w-5 h-5' }
  };

  const loader = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Солнце в центре */}
        <div className={`absolute inset-0 ${planetSizes[size].sun} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse`}></div>
        
        {/* Орбита 1 - планета 1 */}
        <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
          <div 
            className={`absolute ${planetSizes[size].planet1} bg-blue-500 rounded-full -top-1 left-1/2 transform -translate-x-1/2`}
            style={{ animation: 'orbit1 3s linear infinite' }}
          ></div>
        </div>
        
        {/* Орбита 2 - планета 2 */}
        <div className="absolute inset-2 border-2 border-green-400/30 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
          <div 
            className={`absolute ${planetSizes[size].planet2} bg-green-500 rounded-full -top-1 left-1/2 transform -translate-x-1/2`}
            style={{ animation: 'orbit2 4s linear infinite reverse' }}
          ></div>
        </div>
        
        {/* Орбита 3 - планета 3 */}
        <div className="absolute inset-4 border-2 border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '5s' }}>
          <div 
            className={`absolute ${planetSizes[size].planet3} bg-purple-500 rounded-full -top-1 left-1/2 transform -translate-x-1/2`}
            style={{ animation: 'orbit3 5s linear infinite' }}
          ></div>
        </div>
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-zinc-300 font-medium">{text}</p>
          <div className="flex space-x-1 mt-2 justify-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
}

// CSS анимации для орбит
const styles = `
  @keyframes orbit1 {
    0% { transform: rotate(0deg) translateX(0px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(0px) rotate(-360deg); }
  }
  
  @keyframes orbit2 {
    0% { transform: rotate(0deg) translateX(0px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(0px) rotate(-360deg); }
  }
  
  @keyframes orbit3 {
    0% { transform: rotate(0deg) translateX(0px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(0px) rotate(-360deg); }
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

