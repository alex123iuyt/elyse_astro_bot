"use client";

interface BannerData {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaAction: string;
  ctaLink: string;
}

interface BannerProps {
  banner: BannerData;
}

export default function Banner({ banner }: BannerProps) {
  const handleBannerClick = () => {
    if (banner.ctaAction === 'CHAT_ADVISOR') {
      // Переход на страницу чата
      window.location.href = banner.ctaLink;
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Background Image */}
      <div className="relative h-48">
        <img 
          src={banner.backgroundImage} 
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-white mb-2">{banner.title}</h3>
          <p className="text-white/90 text-sm mb-4">{banner.subtitle}</p>
          <button
            onClick={handleBannerClick}
            className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-xl transition-colors font-medium self-start"
          >
            {banner.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}

