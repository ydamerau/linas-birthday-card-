import React, { useState, useRef, useCallback } from 'react';
import { Heart, Download, Star, StarHalf, Plus, User, Camera } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { ReviewState } from './types.ts';

// Letterboxd Theme Colors
const COLORS = {
  bg: '#14181c',
  green: '#00e054',
  orange: '#ff8000',
  text: '#99aabb',
  white: '#ffffff',
  divider: '#2c3440',
  button: '#00c030', // Action green
};

const StarIcon = ({ fill = 'currentColor', className = '', ...props }: { fill?: string; className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill} {...props}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const HalfStarIcon = ({ fill = 'currentColor', className = '', ...props }: { fill?: string; className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" className={className} {...props}>
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor={fill} />
        <stop offset="50%" stopColor="transparent" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="url(#half)" />
  </svg>
);

// Fun Movie-related Icons (Emojis)
const AVATAR_ICONS = ['🍿', '🎬', '🎥', '🎟️', '🌟', '📼', '📺', '📽️', '🎭', '🦄', '🦖', '🍕', '🍦', '🎈', '🎁', '⚡', '🛸', '👻', '🍭', '🎡'];

export default function App() {
  // Generate a random seed once when the component mounts
  const [randomSeed] = useState(() => Math.floor(Math.random() * 10000));

  const [review, setReview] = useState<ReviewState>({
    username: '',
    reviewText: '',
    rating: 3.5,
    hasHeart: false,
    avatarUrl: AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)]
  });

  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleRatingClick = (val: number) => {
    setReview(prev => ({ ...prev, rating: prev.rating === val ? 0 : val }));
  };

  const exportAsPng = useCallback(async () => {
    if (previewRef.current === null) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `letterboxd-review-${review.username.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  }, [review.username]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} fill={COLORS.green} className="w-5 h-5" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<HalfStarIcon key={i} fill={COLORS.green} className="w-5 h-5" />);
      } else {
        // stars.push(<StarIcon key={i} fill="transparent" className="w-5 h-5 opacity-10" />); // Don't show empty stars in review feed usually
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="mb-12 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-[#00e054]"></div>
            <div className="w-5 h-5 rounded-full bg-[#ff8000]"></div>
            <div className="w-5 h-5 rounded-full bg-[#40bcf4]"></div>
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">If Lina was a movie...</h1>
      </header>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Editor Form */}
        <div className="bg-[#1a2028] p-8 rounded-xl shadow-2xl border border-[#2c3440]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#00e054]" />
            What would be your review?
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#99aabb] mb-2 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={review.username}
                onChange={(e) => setReview({ ...review, username: e.target.value })}
                className="w-full bg-[#14181c] border border-[#2c3440] rounded px-4 py-3 focus:outline-none focus:border-[#00e054] transition-colors"
                placeholder="your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#99aabb] mb-2 uppercase tracking-wider">Rating</label>
              <div className="flex items-center gap-1 group">
                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleRatingClick(val)}
                    className={`relative p-1 transition-transform hover:scale-110 ${review.rating >= val ? 'text-[#00e054]' : 'text-[#333]'}`}
                  >
                    {val % 1 !== 0 ? (
                      <StarHalf className="w-8 h-8 rotate-[180deg] scale-x-[-1]" />
                    ) : (
                      <Star className="w-8 h-8 fill-current" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <button
                  onClick={() => setReview({ ...review, hasHeart: !review.hasHeart })}
                  className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${
                    review.hasHeart 
                      ? 'bg-[#ff8000]/10 border-[#ff8000] text-[#ff8000]' 
                      : 'border-[#2c3440] text-[#99aabb] hover:border-[#ff8000]/50'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${review.hasHeart ? 'fill-current' : ''}`} />
                </button>
                <span className="text-sm font-medium text-[#99aabb] uppercase tracking-wider">Like</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#99aabb] mb-2 uppercase tracking-wider">Review</label>
              <textarea
                value={review.reviewText}
                onChange={(e) => setReview({ ...review, reviewText: e.target.value })}
                className="w-full h-40 bg-[#14181c] border border-[#2c3440] rounded px-4 py-3 focus:outline-none focus:border-[#00e054] transition-colors resize-none"
                placeholder="Write your birthday wishes or thoughts..."
              />
            </div>

            <button
              onClick={exportAsPng}
              disabled={isExporting}
              className="w-full bg-[#00c030] hover:bg-[#00e054] text-white font-bold py-4 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExporting ? <span className="animate-spin text-white"><Download size={20} /></span> : <Download size={20} />}
              GENERATE PNG
            </button>
          </div>
        </div>

        {/* Preview Column */}
        <div className="flex flex-col gap-6 sticky top-8">
          {/* Film Poster Window */}
          <div className="space-y-3">
             <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-bold text-[#99aabb] uppercase tracking-[0.2em]">Lina's Birthday Card</h2>
              <Camera className="w-4 h-4 text-[#99aabb] opacity-50" />
            </div>
            
            <div className="relative aspect-[2/3] max-h-[400px] rounded-xl overflow-hidden shadow-2xl border border-[#2c3440] bg-[#1a2028]">
              <img 
                src="https://images.unsplash.com/photo-1542204113-e93526289547?auto=format&fit=crop&q=80&w=1000" 
                className="w-full h-full object-cover blur-md opacity-70 scale-105" 
                alt="Blurred Film Poster"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2028] via-transparent to-[#1a2028]/20"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-1 bg-[#ff8000] mx-auto rounded-full"></div>
                  <h3 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg uppercase leading-none">
                    Film Poster<br/>tbd
                  </h3>
                  <p className="text-[#00e054] font-bold text-sm tracking-widest uppercase">Lina's Birthday</p>
                  <div className="w-16 h-1 bg-[#00e054] mx-auto rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Window */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-bold text-[#99aabb] uppercase tracking-[0.2em]">Live Preview</h2>
              <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-[#ff4b4b]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#f6bb42]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#37bc9b]"></div>
              </div>
            </div>
            
            <div className="relative group">
              {/* The Actual Captured View */}
              <div 
                ref={previewRef}
                className="bg-[#14181c] p-6 min-w-[500px] w-full border-y border-[#2c3440] shadow-2xl relative overflow-hidden"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
              {/* Header: Stars & Heart + Profile */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  {review.hasHeart && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Heart className="w-5 h-5 fill-[#ff8000] text-[#ff8000]" />
                    </motion.div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[#99aabb] font-bold text-[14px] hover:text-[#fff] cursor-pointer">{review.username}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#556677] bg-[#2c3440] flex items-center justify-center text-lg">
                    {review.avatarUrl ? (
                      review.avatarUrl.startsWith('http') ? (
                        <img src={review.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{review.avatarUrl}</span>
                      )
                    ) : (
                      <User className="w-4 h-4 text-[#99aabb]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className="text-[17px] leading-relaxed text-[#99aabb] whitespace-pre-wrap">
                {review.reviewText}
              </div>
            </div>

            {/* Hint overlay */}
            <div className="absolute inset-0 border-2 border-[#00e054] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>

      <footer className="mt-20 py-8 border-t border-[#2c3440] w-full max-w-5xl text-center text-[#556677] text-sm">
        <p>&copy; 2026 ReviewGen. Not affiliated with Letterboxd Limited.</p>
      </footer>
    </div>
  );
}
