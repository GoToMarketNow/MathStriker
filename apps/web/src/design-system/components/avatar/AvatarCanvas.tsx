import { SKIN_TONES, HAIR_COLORS, TEAM_COLORS } from '@math-striker/shared';

// Color maps for rendering
const SKIN_HEX: Record<string, string> = {
  tone_01: '#FDDCB5', tone_02: '#F5C8A0', tone_03: '#E8B48A',
  tone_04: '#D4976A', tone_05: '#C0845A', tone_06: '#A06B42',
  tone_07: '#8B5E3C', tone_08: '#6B4226', tone_09: '#553318',
  tone_10: '#3D2410',
};

const HAIR_HEX: Record<string, string> = {
  color_black: '#1a1a2e', color_brown: '#6b4226', color_dark_brown: '#3d2410',
  color_blonde: '#e8c76a', color_red: '#c0392b', color_auburn: '#8b3a2a',
  color_gray: '#95a5a6', color_platinum: '#ecf0f1',
  color_blue: '#3498db', color_pink: '#e84393', color_green: '#27ae60', color_purple: '#8e44ad',
};

const TEAM_HEX: Record<string, string> = {
  green: '#22c55e', blue: '#3b82f6', red: '#ef4444', yellow: '#eab308',
  purple: '#8b5cf6', orange: '#f97316', white: '#f1f5f9', black: '#1e293b',
  teal: '#14b8a6', pink: '#ec4899', navy: '#1e3a8a', maroon: '#881337',
};

// Hair shape paths by style category
function getHairPath(style: string): string {
  if (style.includes('afro')) return 'M20,22 C20,10 80,10 80,22 C85,15 85,5 50,2 C15,5 15,15 20,22Z';
  if (style.includes('long')) return 'M25,25 C25,18 75,18 75,25 L78,50 C78,55 22,55 22,50Z';
  if (style.includes('curly') || style.includes('coily')) return 'M22,24 Q20,12 35,10 Q50,8 65,10 Q80,12 78,24 Q82,20 75,15 Q50,5 25,15 Q18,20 22,24Z';
  if (style.includes('braids') || style.includes('twists') || style.includes('locs')) return 'M25,24 C25,16 75,16 75,24 L73,55 L70,58 L67,55 L64,58 L50,55 L36,58 L33,55 L30,58 L27,55Z';
  if (style.includes('bun')) return 'M30,24 C30,18 70,18 70,24 M43,14 A12,12 0 1,1 57,14Z';
  if (style.includes('ponytail')) return 'M25,24 C25,16 75,16 75,24 L78,30 Q85,45 75,55Z';
  if (style.includes('mohawk')) return 'M42,8 C42,2 58,2 58,8 L58,24 L42,24Z';
  if (style.includes('fade')) return 'M28,24 C28,20 72,20 72,24 Q72,18 60,16 Q50,15 40,16 Q28,18 28,24Z';
  // short default
  return 'M25,24 C25,16 75,16 75,24Z';
}

interface AvatarCanvasProps {
  skinToneKey?: string;
  hairStyleKey?: string;
  hairColorKey?: string;
  eyeColorKey?: string;
  teamPrimaryColorKey?: string;
  teamSecondaryColorKey?: string;
  jerseyNumber?: number;
  freckles?: boolean;
  glassesKey?: string | null;
  size?: number;
}

export function AvatarCanvas({
  skinToneKey = 'tone_04',
  hairStyleKey = 'hair_short_01',
  hairColorKey = 'color_brown',
  eyeColorKey = 'eye_brown',
  teamPrimaryColorKey = 'green',
  teamSecondaryColorKey = 'white',
  jerseyNumber = 10,
  freckles = false,
  glassesKey,
  size = 120,
}: AvatarCanvasProps) {
  const skin = SKIN_HEX[skinToneKey] || SKIN_HEX.tone_04;
  const hair = HAIR_HEX[hairColorKey] || HAIR_HEX.color_brown;
  const primary = TEAM_HEX[teamPrimaryColorKey] || TEAM_HEX.green;
  const secondary = TEAM_HEX[teamSecondaryColorKey] || TEAM_HEX.white;
  const eyeHex = eyeColorKey?.includes('blue') ? '#3b82f6' :
                 eyeColorKey?.includes('green') ? '#22c55e' :
                 eyeColorKey?.includes('hazel') ? '#a0845a' :
                 eyeColorKey?.includes('gray') ? '#94a3b8' :
                 eyeColorKey?.includes('amber') ? '#d97706' : '#5c4033';

  return (
    <svg viewBox="0 0 100 130" width={size} height={size * 1.3} aria-label="Player avatar">
      {/* Body / Jersey */}
      <rect x="28" y="70" width="44" height="35" rx="8" fill={primary} />
      {/* Jersey stripes */}
      <rect x="28" y="80" width="44" height="4" fill={secondary} opacity="0.6" />
      {/* Jersey number */}
      <text x="50" y="95" textAnchor="middle" fontSize="12" fontWeight="bold" fill={secondary} fontFamily="sans-serif">
        {jerseyNumber}
      </text>
      {/* Shorts */}
      <rect x="32" y="103" width="16" height="14" rx="4" fill={secondary} />
      <rect x="52" y="103" width="16" height="14" rx="4" fill={secondary} />
      {/* Socks + legs */}
      <rect x="34" y="115" width="12" height="12" rx="3" fill={primary} />
      <rect x="54" y="115" width="12" height="12" rx="3" fill={primary} />

      {/* Head */}
      <ellipse cx="50" cy="38" rx="24" ry="26" fill={skin} />

      {/* Hair (behind head layer) */}
      <path d={getHairPath(hairStyleKey)} fill={hair} />

      {/* Eyes */}
      <ellipse cx="40" cy="38" rx="3.5" ry="4" fill="white" />
      <ellipse cx="60" cy="38" rx="3.5" ry="4" fill="white" />
      <circle cx="40" cy="38" r="2" fill={eyeHex} />
      <circle cx="60" cy="38" r="2" fill={eyeHex} />
      <circle cx="40.5" cy="37.5" r="0.8" fill="white" />
      <circle cx="60.5" cy="37.5" r="0.8" fill="white" />

      {/* Eyebrows */}
      <line x1="35" y1="32" x2="44" y2="31" stroke={hair} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="31" x2="65" y2="32" stroke={hair} strokeWidth="1.5" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="50" cy="43" rx="2" ry="1.5" fill={skin} stroke={skin} strokeWidth="0.5" opacity="0.7" />

      {/* Mouth (smile) */}
      <path d="M44,49 Q50,54 56,49" fill="none" stroke="#c0392b" strokeWidth="1.2" strokeLinecap="round" />

      {/* Freckles */}
      {freckles && (
        <>
          <circle cx="37" cy="44" r="0.6" fill="#c0845a" opacity="0.5" />
          <circle cx="39" cy="45" r="0.5" fill="#c0845a" opacity="0.5" />
          <circle cx="61" cy="44" r="0.6" fill="#c0845a" opacity="0.5" />
          <circle cx="63" cy="45" r="0.5" fill="#c0845a" opacity="0.5" />
        </>
      )}

      {/* Glasses */}
      {glassesKey && (
        <>
          <circle cx="40" cy="38" r="6" fill="none" stroke="#334155" strokeWidth="1.2" />
          <circle cx="60" cy="38" r="6" fill="none" stroke="#334155" strokeWidth="1.2" />
          <line x1="46" y1="38" x2="54" y2="38" stroke="#334155" strokeWidth="1" />
          {glassesKey.includes('sport') && (
            <rect x="30" y="32" width="40" height="12" rx="6" fill="none" stroke="#334155" strokeWidth="1.5" />
          )}
        </>
      )}

      {/* Ears */}
      <ellipse cx="26" cy="38" rx="3" ry="4" fill={skin} />
      <ellipse cx="74" cy="38" rx="3" ry="4" fill={skin} />
    </svg>
  );
}
