
import { Gem, Star } from 'lucide-react';
import { Jewelry } from '../../types';
import { formatPrice, getJewelryTypeLabel } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

interface RecentJewelryProps {
  jewelries: Jewelry[];
}

const RecentJewelry = ({ jewelries }: RecentJewelryProps) => {
  const navigate = useNavigate();
  const recentJewelries = [...jewelries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-gold-500" />
          <h2 className="font-display text-xl font-bold text-ink-600">最近收藏</h2>
        </div>
        <button
          onClick={() => navigate('/collection')}
          className="text-gold-500 hover:text-gold-600 text-sm font-medium"
        >
          查看全部 →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {recentJewelries.map((jewelry) => (
          <div
            key={jewelry.id}
            onClick={() => navigate(`/collection/${jewelry.id}`)}
            className="group cursor-pointer rounded-xl overflow-hidden border border-gold-100 hover:shadow-gold transition-all duration-300"
          >
            <div className="aspect-square overflow-hidden bg-cream-50">
              <img
                src={jewelry.photos[0]?.url || 'https://picsum.photos/400/400'}
                alt={jewelry.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <h3 className="font-display font-semibold text-ink-600 truncate">{jewelry.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-ink-400 bg-cream-100 px-2 py-1 rounded">
                  {getJewelryTypeLabel(jewelry.type)}
                </span>
                <span className="text-gold-600 font-semibold text-sm">
                  {formatPrice(jewelry.purchasePrice)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentJewelry;
