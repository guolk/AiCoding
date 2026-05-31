
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Jewelry } from '../../types';
import { formatPrice, getJewelryTypeLabel, getOccasionLabel } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

interface JewelryCardProps {
  jewelry: Jewelry;
  onDelete: (id: string) => void;
}

const JewelryCard = ({ jewelry, onDelete }: JewelryCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-gold-100 card-hover group">
      <div className="aspect-square overflow-hidden bg-cream-50 relative">
        <img
          src={jewelry.photos[0]?.url || 'https://picsum.photos/400/400'}
          alt={jewelry.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
          <button
            onClick={() => navigate(`/collection/${jewelry.id}`)}
            className="p-2 bg-white rounded-full hover:bg-gold-50 transition-colors"
          >
            <Eye className="w-5 h-5 text-gold-600" />
          </button>
          <button
            onClick={() => navigate(`/collection/${jewelry.id}/edit`)}
            className="p-2 bg-white rounded-full hover:bg-gold-50 transition-colors"
          >
            <Edit className="w-5 h-5 text-gold-600" />
          </button>
          <button
            onClick={() => onDelete(jewelry.id)}
            className="p-2 bg-white rounded-full hover:bg-ruby-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-ruby-500" />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs px-2 py-1 bg-white/90 rounded-full text-gold-600 font-medium">
            {getJewelryTypeLabel(jewelry.type)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-600 truncate">{jewelry.name}</h3>
        <p className="text-sm text-ink-400 mt-1">{jewelry.brand}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {jewelry.suitableOccasions.slice(0, 2).map((occasion) => (
            <span
              key={occasion}
              className="text-xs px-2 py-1 bg-cream-100 text-ink-500 rounded"
            >
              {getOccasionLabel(occasion)}
            </span>
          ))}
          {jewelry.suitableOccasions.length > 2 && (
            <span className="text-xs px-2 py-1 bg-cream-100 text-ink-500 rounded">
              +{jewelry.suitableOccasions.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gold-100">
          <div>
            <p className="text-xs text-ink-400">购入价格</p>
            <p className="text-gold-600 font-bold">{formatPrice(jewelry.purchasePrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">佩戴次数</p>
            <p className="text-ink-600 font-medium">{jewelry.wearCount}次</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JewelryCard;
