export function renderEffects(kit, config, state, closedEyeInk) {
  const { n, path, ellipse, group } = kit;
  return [
    state === 'thinking'
      ? n(
          'g',
          { 'data-part': 'reaction-effect', 'data-effect': 'idea' },
          n(
            'text',
            {
              x: 211,
              y: 70,
              fontSize: 51,
              textAnchor: 'middle',
              fontFamily:
                'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif',
              style: {
                filter: 'drop-shadow(0 5px 5px rgb(34 23 61 / 28%))',
              },
              'data-idea-bulb': true,
            },
            '💡',
          ),
        )
      : null,
    state === 'sleeping'
      ? n(
          'g',
          { 'data-part': 'reaction-effect', 'data-effect': 'sleep' },
          n(
            'text',
            {
              x: 185,
              y: 79,
              fill: config.accentColor,
              fontSize: 24,
              fontWeight: 900,
              'data-sleep-z': 0,
            },
            'Z',
          ),
          n(
            'text',
            {
              x: 207,
              y: 55,
              fill: config.accentColor,
              fontSize: 19,
              fontWeight: 900,
              'data-sleep-z': 1,
            },
            'Z',
          ),
          n(
            'text',
            {
              x: 225,
              y: 35,
              fill: config.accentColor,
              fontSize: 14,
              fontWeight: 900,
              'data-sleep-z': 2,
            },
            'Z',
          ),
        )
      : null,
    state === 'singing'
      ? n(
          'g',
          { 'data-part': 'reaction-effect', 'data-effect': 'singing' },
          path('M197 82 V51 L221 45 V73', {
            fill: 'none',
            stroke: config.accentColor,
            strokeWidth: 5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
          ellipse(191, 84, 8, 6, { fill: config.accentColor }),
          ellipse(215, 75, 8, 6, { fill: config.accentColor }),
        )
      : null,
    state === 'special' && config.shape === 'drop'
      ? n(
          'g',
          { 'data-part': 'reaction-effect', 'data-effect': 'splash' },
          path('M65 221 Q94 207 116 225 Q142 204 190 222', {
            fill: 'none',
            stroke: config.accentColor,
            strokeWidth: 7,
            strokeLinecap: 'round',
          }),
          ...[
            [77, 205, 69, 187],
            [105, 211, 101, 187],
            [151, 210, 157, 184],
            [180, 205, 190, 190],
          ].map(([x1, y1, x2, y2], i) =>
            path(`M${x1} ${y1} Q${(x1 + x2) / 2} ${y2 - 8} ${x2} ${y2}`, {
              fill: 'none',
              stroke: config.accentColor,
              strokeWidth: 5,
              strokeLinecap: 'round',
              'data-splash-drop': i,
            }),
          ),
        )
      : null,
    state === 'special' && config.shape === 'cloud'
      ? n(
          'g',
          { 'data-part': 'reaction-effect', 'data-effect': 'storm' },
          path('M124 188 L110 216 H126 L116 244 L151 205 H134 L145 188Z', {
            fill: '#ffcc45',
            stroke: closedEyeInk,
            strokeWidth: 2,
            strokeLinejoin: 'round',
            'data-storm-lightning': true,
          }),
          ...[77, 96, 161, 181].map((x, i) =>
            path(`M${x} 196 L${x - 5} 222`, {
              fill: 'none',
              stroke: '#61a9ff',
              strokeWidth: 5,
              strokeLinecap: 'round',
              'data-storm-rain': i,
            }),
          ),
        )
      : null,
    state === 'loading'
      ? group(
          'indicator',
          ...[0, 1, 2].map((i) =>
            ellipse(112 + i * 16, 258, 3, 3, {
              fill: config.accentColor,
              'data-wait-dot': i,
            }),
          ),
        )
      : null,
    state === 'success'
      ? group(
          'spark',
          path(
            'M223 52 L226 62 L236 65 L226 68 L223 78 L220 68 L210 65 L220 62Z',
            { fill: config.accentColor },
          ),
        )
      : null,
  ];
}
