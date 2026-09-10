// The same editable SVG geometry is used by the studio and copied into exports.
export function renderParts(h, config, state) {
  const shapePaths = {
    ghost:
      'M 47 159 C 48 101 73 39 131 36 C 190 32 211 94 213 156 C 217 177 208 188 190 187 C 181 207 166 207 151 195 C 131 207 121 208 110 194 C 88 208 77 200 74 183 C 50 187 35 178 47 159 Z',
    circle: 'M 218 128 A 90 90 0 1 1 38 128 A 90 90 0 1 1 218 128 Z',
    'rounded-square':
      'M 67 42 H 189 Q 214 42 214 67 V 189 Q 214 214 189 214 H 67 Q 42 214 42 189 V 67 Q 42 42 67 42 Z',
    blob: 'M 42 141 C 27 105 59 72 89 67 C 113 66 123 28 145 34 C 166 41 162 71 188 85 C 230 109 227 166 199 191 C 160 226 61 217 45 177 C 41 168 40 155 42 141 Z',
    triangle:
      'M 112 44 Q 128 18 144 44 L 224 186 Q 239 211 207 213 H 49 Q 18 211 33 186 Z',
  };
  const path = (d, props = {}) => h('path', { d, ...props });
  const eye = (x, y, rx = 18, ry = 27) =>
    h('ellipse', { cx: x, cy: y, rx, ry });
  const line = {
    fill: 'none',
    stroke: config.eyeColor,
    strokeWidth: 9,
    strokeLinecap: 'round',
  };
  let eyes;
  if (state === 'happy' || state === 'success')
    eyes = [
      path('M 80 130 C 80 105 113 105 113 130', line),
      path('M 138 130 C 138 105 171 105 171 130', line),
    ];
  else if (state === 'sad')
    eyes = [
      path(
        'M 110 105 C 113 129 108 148 88 146 C 71 144 77 135 87 133 Q 104 127 110 105 Z',
      ),
      path(
        'M 141 105 C 138 129 143 148 163 146 C 180 144 174 135 164 133 Q 147 127 141 105 Z',
      ),
    ];
  else if (state === 'error' || config.eyes === 'angry')
    eyes = [
      path('M 79 112 L 113 124 Q 108 150 91 140 Q 80 135 79 112 Z'),
      path('M 172 112 L 138 124 Q 143 150 160 140 Q 171 135 172 112 Z'),
    ];
  else if (state === 'loading')
    eyes = [path('M 139 87 A 32 32 0 1 0 162 139 A 29 29 0 0 1 139 87 Z')];
  else if (config.eyes === 'sleepy' && state !== 'surprised')
    eyes = [
      path('M 79 120 Q 96 149 113 120 Z'),
      path('M 137 120 Q 154 149 171 120 Z'),
    ];
  else {
    const dots = config.eyes === 'dots';
    const surprised = state === 'surprised';
    eyes = [
      eye(99, 123, dots ? 11 : 19, surprised ? 29 : dots ? 18 : 27),
      eye(154, 116, dots ? 11 : 19, surprised ? 29 : dots ? 18 : 27),
    ];
    if (!dots)
      eyes.push(
        h(
          'g',
          { fill: config.color },
          h('circle', {
            cx: surprised ? 100 : state === 'thinking' ? 107 : 107,
            cy: surprised ? 123 : 109,
            r: surprised ? 5 : 8,
          }),
          h('circle', {
            cx: surprised ? 155 : 162,
            cy: surprised ? 116 : 102,
            r: surprised ? 5 : 8,
          }),
        ),
      );
  }
  let mouth = null;
  if (config.mouth !== 'none')
    mouth = h(
      'g',
      { 'data-motion': 'mouth', 'data-part': 'mouth' },
      state === 'surprised'
        ? eye(128, 163, 8, 11)
        : path(
            state === 'sad'
              ? 'M 115 166 Q 128 153 141 166'
              : config.mouth === 'small'
                ? 'M 122 163 L 134 163'
                : 'M 113 158 Q 128 176 143 158',
            { ...line, strokeWidth: 5 },
          ),
    );
  const face = h(
    'g',
    { 'data-motion': 'face' },
    h(
      'g',
      { 'data-motion': 'eye-movement' },
      h(
        'g',
        {
          'data-motion': 'blink',
          'data-part': 'eyes',
          'data-eyes': config.eyes,
          fill: config.eyeColor,
        },
        ...eyes,
      ),
    ),
    mouth,
  );
  const outline =
    state === 'error'
      ? '#ef445a'
      : state === 'success'
        ? '#22be70'
        : config.outlineColor;
  const body = h(
    'g',
    null,
    path(shapePaths[config.shape] || shapePaths.ghost, {
      'data-part': 'body',
      'data-shape': config.shape,
      fill: config.color,
      stroke: outline,
      strokeWidth: config.outlineWidth,
      strokeLinejoin: 'round',
    }),
    face,
  );
  let badge = null;
  if (state === 'thinking')
    badge = h(
      'g',
      null,
      h('rect', {
        x: 171,
        y: 34,
        width: 51,
        height: 29,
        rx: 14,
        fill: config.color,
        stroke: config.outlineColor,
        strokeWidth: 3,
      }),
      ...[183, 196, 209].map((cx) =>
        h('circle', { key: cx, cx, cy: 48, r: 2.5, fill: config.eyeColor }),
      ),
    );
  if (state === 'success')
    badge = path(
      'M 217 48 Q 217 64 232 67 Q 217 70 217 86 Q 213 70 199 67 Q 213 64 217 48',
      { fill: '#22be70' },
    );
  if (state === 'error')
    badge = h(
      'g',
      null,
      h('circle', { cx: 218, cy: 54, r: 15, fill: '#ef445a' }),
      path('M 218 46 V 55 M 218 61 V 62', {
        stroke: '#fff',
        strokeWidth: 3,
        strokeLinecap: 'round',
      }),
    );
  if (state === 'loading')
    badge = h(
      'g',
      { fill: config.color },
      ...[0, 1, 2].map((i) =>
        h('circle', { key: i, cx: 192 + i * 12, cy: 201 - i * 5, r: 3 + i }),
      ),
    );
  return h(
    'g',
    null,
    h(
      'g',
      { 'data-motion': 'bounce' },
      h(
        'g',
        { 'data-motion': 'squash' },
        h(
          'g',
          { 'data-motion': 'tilt' },
          h('g', { 'data-motion': 'shake' }, body),
        ),
      ),
    ),
    badge,
  );
}
