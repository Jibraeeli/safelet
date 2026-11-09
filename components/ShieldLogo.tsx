import Svg, { Path } from 'react-native-svg';

import { colours } from '../constants/colours';

interface ShieldLogoProps {
  /** Rendered width in px. Defaults to the full 160 x 180 logo size. */
  width?: number;
  /** Rendered height in px. */
  height?: number;
}

/**
 * SafeLet shield logo - a white shield outline with a simple green house
 * drawn inside it, built entirely from SVG primitives (no image assets).
 *
 * The shape is authored against a 160 x 180 viewBox, so passing smaller
 * width/height scales it proportionally.
 */
export default function ShieldLogo({
  width = 160,
  height = 180,
}: ShieldLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 180">
      {/* Shield body */}
      <Path
        d="M80 6 L150 34 L150 96 C150 140 118 166 80 176 C42 166 10 140 10 96 L10 34 Z"
        fill={colours.white}
      />
      {/* House roof */}
      <Path
        d="M52 92 L80 64 L108 92"
        stroke={colours.green}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* House walls */}
      <Path
        d="M60 90 L60 124 L100 124 L100 90"
        stroke={colours.green}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
