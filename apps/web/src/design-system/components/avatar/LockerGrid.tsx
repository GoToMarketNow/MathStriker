import { motion } from 'framer-motion';

export interface LockerItem {
  id: string;
  name: string;
  category: string;
  rarity: string;
  assetKey: string;
  owned: boolean;
  equipped?: boolean;
}

const rarityColors: Record<string, string> = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-gold-400 bg-gold-50',
};

const rarityBadgeColors: Record<string, string> = {
  common: 'bg-gray-200 text-gray-600',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-gold-100 text-gold-700',
};

const categoryEmoji: Record<string, string> = {
  cleats: '👟', shinguards: '🦵', socks: '🧦', headbands: '🎀',
  gloves: '🧤', jerseys: '👕', balls: '⚽', celebrations: '🎉',
  stadiums: '🏟️', stickers: '⭐', skills: '⚡',
};

interface ItemCardProps {
  item: LockerItem;
  onEquip?: () => void;
}

export function ItemCard({ item, onEquip }: ItemCardProps) {
  return (
    <motion.div
      whileTap={item.owned ? { scale: 0.95 } : undefined}
      onClick={item.owned ? onEquip : undefined}
      className={`
        relative rounded-game p-3 border-2 transition-all
        ${item.owned ? rarityColors[item.rarity] || rarityColors.common : 'border-gray-200 bg-gray-100 opacity-50'}
        ${item.equipped ? 'ring-2 ring-pitch-400' : ''}
        ${item.owned ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <div className="text-2xl text-center mb-1">
        {categoryEmoji[item.category] || '🎁'}
      </div>
      <p className="text-[10px] font-bold text-center text-gray-700 leading-tight truncate">
        {item.name}
      </p>
      <span className={`
        block text-center text-[8px] font-bold mt-1 px-1 py-0.5 rounded-full
        ${rarityBadgeColors[item.rarity] || rarityBadgeColors.common}
      `}>
        {item.rarity}
      </span>
      {!item.owned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">🔒</span>
        </div>
      )}
      {item.equipped && (
        <span className="absolute -top-1 -right-1 bg-pitch-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
          ✓
        </span>
      )}
    </motion.div>
  );
}

interface LockerGridProps {
  items: LockerItem[];
  onEquip?: (itemId: string) => void;
}

export function LockerGrid({ items, onEquip }: LockerGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEquip={() => onEquip?.(item.id)}
        />
      ))}
    </div>
  );
}
