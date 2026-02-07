interface FractionBarData {
  numerator: number;
  denominator: number;
  label?: string;
}

interface PatternGridData {
  grid: (string | null)[][]; // emoji or null
  missingIndex: [number, number];
  options?: string[];
}

interface VisualMathRendererProps {
  type: 'fractionBars' | 'patternGrid' | 'arraysMultiplication';
  data: FractionBarData | PatternGridData | { rows: number; cols: number };
}

function FractionBars({ data }: { data: FractionBarData }) {
  const { numerator, denominator, label } = data;
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-sm font-semibold text-gray-500">{label}</span>}
      <div className="flex gap-1">
        {Array.from({ length: denominator }).map((_, i) => (
          <div
            key={i}
            className={`
              w-10 h-14 rounded-lg border-2 transition-colors
              ${i < numerator
                ? 'bg-electric-400 border-electric-500'
                : 'bg-gray-100 border-gray-200'}
            `}
            aria-label={i < numerator ? 'filled' : 'empty'}
          />
        ))}
      </div>
      <span className="text-base font-bold text-gray-700">
        {numerator}/{denominator}
      </span>
    </div>
  );
}

function PatternGrid({ data }: { data: PatternGridData }) {
  const { grid, missingIndex } = data;
  return (
    <div className="flex flex-col items-center gap-1">
      {grid.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((cell, ci) => {
            const isMissing = ri === missingIndex[0] && ci === missingIndex[1];
            return (
              <div
                key={ci}
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center text-xl
                  ${isMissing
                    ? 'bg-gold-100 border-2 border-dashed border-gold-400'
                    : 'bg-white border border-gray-200'}
                `}
              >
                {isMissing ? '❓' : cell}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ArraysMultiplication({ data }: { data: { rows: number; cols: number } }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: data.rows }).map((_, ri) => (
        <div key={ri} className="flex gap-1">
          {Array.from({ length: data.cols }).map((_, ci) => (
            <div
              key={ci}
              className="w-8 h-8 rounded-md bg-pitch-200 border border-pitch-300 flex items-center justify-center text-xs"
            >
              ⚽
            </div>
          ))}
        </div>
      ))}
      <span className="text-sm font-bold text-gray-600 mt-1">
        {data.rows} × {data.cols} = {data.rows * data.cols}
      </span>
    </div>
  );
}

export function VisualMathRenderer({ type, data }: VisualMathRendererProps) {
  switch (type) {
    case 'fractionBars':
      return <FractionBars data={data as FractionBarData} />;
    case 'patternGrid':
      return <PatternGrid data={data as PatternGridData} />;
    case 'arraysMultiplication':
      return <ArraysMultiplication data={data as { rows: number; cols: number }} />;
    default:
      return null;
  }
}
