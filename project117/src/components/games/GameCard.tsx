import { Link } from 'react-router-dom';
import { Game, CollectionItem } from '@/types';
import {
  Users,
  Clock,
  MapPin,
} from 'lucide-react';
import {
  getCollectionStatusLabel,
  getCollectionStatusColor,
  getComplexityLabel,
  getComplexityColor,
} from '@/utils/helpers';

interface GameCardProps {
  game: Game;
  collectionItem?: CollectionItem;
}

export default function GameCard({ game, collectionItem }: GameCardProps) {
  return (
    <Link
      to={`/collection/${game.id}`}
      className="card card-hover overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-400 via-transparent to-transparent" />
        {collectionItem && (
          <div className="absolute top-3 right-3">
            <span className={`tag ${getCollectionStatusColor(collectionItem.status)}`}>
              {getCollectionStatusLabel(collectionItem.status)}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg font-bold text-white truncate">
            {game.name}
          </h3>
          <p className="text-xs text-gray-300">{game.publisher}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span>{game.minPlayers}-{game.maxPlayers}人</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{game.minPlayTime}-{game.maxPlayTime}分钟</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getComplexityColor(game.complexity)}`}>
            {getComplexityLabel(game.complexity)}
          </span>
          <span className="text-xs text-gray-500">
            ({game.complexity.toFixed(1)})
          </span>
        </div>

        {collectionItem && collectionItem.cabinet && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{collectionItem.cabinet} · {collectionItem.shelf}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="tag bg-surface-200 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
