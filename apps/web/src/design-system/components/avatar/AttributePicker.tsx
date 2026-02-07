import { motion } from 'framer-motion';

interface AttributePickerProps {
  label: string;
  options: readonly (string | null)[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  renderOption?: (value: string | null, isSelected: boolean) => React.ReactNode;
  colorMap?: Record<string, string>;
}

export function AttributePicker({
  label,
  options,
  selected,
  onSelect,
  renderOption,
  colorMap,
}: AttributePickerProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {options.map((opt) => {
          const isSelected = opt === selected;
          return (
            <motion.button
              key={opt ?? 'none'}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(opt)}
              aria-label={`${label}: ${opt ?? 'None'}`}
              aria-pressed={isSelected}
              className={`
                flex-shrink-0 min-w-[48px] h-12 rounded-game flex items-center justify-center
                text-xs font-semibold transition-all
                ${isSelected
                  ? 'border-2 border-pitch-500 bg-pitch-50 shadow-sm'
                  : 'border-2 border-gray-200 bg-white'}
              `}
            >
              {renderOption ? (
                renderOption(opt, isSelected)
              ) : colorMap && opt && colorMap[opt] ? (
                <div
                  className="w-8 h-8 rounded-full border border-gray-200"
                  style={{ backgroundColor: colorMap[opt] }}
                />
              ) : (
                <span className="px-2 truncate max-w-[80px]">
                  {opt ?? 'None'}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

interface ColorSwatchPickerProps {
  label: string;
  colors: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  colorMap: Record<string, string>;
}

export function ColorSwatchPicker({ label, colors, selected, onSelect, colorMap }: ColorSwatchPickerProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {colors.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.85 }}
            onClick={() => onSelect(c)}
            aria-label={`${label}: ${c}`}
            aria-pressed={c === selected}
            className={`
              w-10 h-10 rounded-full border-2 transition-all
              ${c === selected ? 'border-pitch-500 ring-2 ring-pitch-200 scale-110' : 'border-gray-200'}
            `}
            style={{ backgroundColor: colorMap[c] || '#ccc' }}
          />
        ))}
      </div>
    </div>
  );
}
