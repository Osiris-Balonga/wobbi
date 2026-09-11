import {
  BODY_PATHS,
  LASHED_EYES,
  SHAPE_FITS,
  closedEyeColor,
} from './render-model.js';
import { renderEffects } from './render-effects.js';

export function renderParts(h, config, state = 'idle') {
  let key = 0;
  const n = (tag, props, ...children) =>
    h(tag, { key: key++, ...props }, ...children);
  const path = (d, props = {}) => n('path', { d, ...props });
  const ellipse = (cx, cy, rx, ry, props = {}) =>
    n('ellipse', { cx, cy, rx, ry, ...props });
  const group = (part, ...children) =>
    n('g', { 'data-part': part, 'data-motion': part }, ...children);
  const happy = ['happy', 'success'].includes(state);
  const startled = state === 'surprised';
  const fearful = state === 'sad';
  const thinking = state === 'thinking';
  const sleeping = state === 'sleeping';
  const singing = state === 'singing';
  const angry = state === 'error' || config.eyes === 'angry';
  const shape = BODY_PATHS[config.shape] || BODY_PATHS.wobbi;
  const fit = SHAPE_FITS[config.shape] || SHAPE_FITS.wobbi;
  const depthProfile =
    config.depth === 'deep'
      ? { highlight: 0.42, mid: 0.1, shade: 0.11, edge: 0.4 }
      : { highlight: 0.19, mid: 0.04, shade: 0.035, edge: 0.17 };
  const depthId = `wobbi-depth-${config.shape}-${config.color.slice(1)}-${config.depth}`;
  const depthDefinition =
    config.depth === 'flat'
      ? null
      : n(
          'defs',
          null,
          n(
            'radialGradient',
            {
              id: depthId,
              gradientUnits: 'userSpaceOnUse',
              cx: 77,
              cy: 46,
              r: 225,
              fx: 61,
              fy: 31,
            },
            n('stop', {
              offset: '0%',
              stopColor: '#ffffff',
              stopOpacity: depthProfile.highlight,
            }),
            n('stop', {
              offset: '44%',
              stopColor: '#ffffff',
              stopOpacity: depthProfile.mid,
            }),
            n('stop', {
              offset: '72%',
              stopColor: '#120b20',
              stopOpacity: depthProfile.shade,
            }),
            n('stop', {
              offset: '100%',
              stopColor: '#120b20',
              stopOpacity: depthProfile.edge,
            }),
          ),
        );
  const faceY = fit.faceY;
  const pupilInk = config.pupilColor;
  const mouthInk = config.mouthColor || config.pupilColor;
  const closedEyeInk = closedEyeColor(config.color);
  const eyeStroke = {
    stroke: config.eyeOutlineColor,
    strokeWidth: config.eyeOutlineWidth,
  };
  const eyes = [0, 1].map((i) => {
    const type = config.eyes;
    const x = i ? 160 : 102;
    const y = (config.shape === 'wobbi' ? (i ? 117 : 127) : 123) + faceY;
    const dots = type === 'dots';
    const pixel = type === 'pixel';
    const money = type === 'money';
    const capsule = type === 'capsules' || type === 'asymmetric';
    const wink = type === 'wink' && i === 1 && !startled;
    const pupilled = !dots && !pixel && !money && !capsule && !wink;
    const hasLashes = LASHED_EYES.includes(type);
    const configuredLashInk = config.lashColor || closedEyeInk;
    const lashInk =
      hasLashes &&
      configuredLashInk.toLowerCase() !== config.color.toLowerCase()
        ? configuredLashInk
        : closedEyeInk;
    const lashData = hasLashes ? { 'data-eye-lash': type } : {};
    const width = dots
      ? 7
      : pixel
        ? 12
        : type === 'asymmetric' && i
          ? 7
          : capsule
            ? 10
            : type === 'round'
              ? 21
              : type === 'glossy'
                ? 24
                : type === 'side-eye'
                  ? 24
                  : 22;
    const height = startled
      ? 30
      : type === 'asymmetric' && i
        ? 13
        : dots
          ? 8
          : pixel
            ? 17
            : type === 'round'
              ? 21
              : type === 'glossy'
                ? 31
                : type === 'side-eye'
                  ? 25
                  : 29;
    const eyeParts = [];
    if (sleeping) {
      eyeParts.push(
        path(
          `M${x - width + 2} ${y - 2} Q${x} ${y + 8} ${x + width - 2} ${y - 2}`,
          {
            fill: 'none',
            stroke: lashInk,
            strokeWidth: 6,
            strokeLinecap: 'round',
            'data-eye-lid': 'sleeping',
            ...lashData,
          },
        ),
      );
    } else if (wink && !startled) {
      eyeParts.push(
        path(`M${x - 17} ${y + 1} Q${x} ${y + 14} ${x + 17} ${y - 1}`, {
          fill: 'none',
          stroke: lashInk,
          strokeWidth: 6,
          strokeLinecap: 'round',
          ...lashData,
        }),
      );
    } else if (happy) {
      const d = pixel
        ? `M${x - 12} ${y + 3} V${y - 8} H${x + 12} V${y + 3}`
        : `M${x - width} ${y + 3} Q${x} ${y - (dots ? 10 : 21)} ${x + width} ${y + 3}`;
      eyeParts.push(
        path(d, {
          fill: 'none',
          stroke: lashInk,
          strokeWidth: dots ? 5 : 8,
          strokeLinecap: pixel ? 'square' : 'round',
          ...lashData,
        }),
      );
    } else if (money) {
      eyeParts.push(
        ellipse(x, y, 21, 24, {
          fill: config.eyeColor,
          'data-part': 'eye-white',
          ...eyeStroke,
        }),
        n(
          'text',
          {
            x,
            y: y + 2,
            fill: pupilInk,
            fontSize: 31,
            fontWeight: 900,
            textAnchor: 'middle',
            dominantBaseline: 'middle',
            'data-eye-symbol': 'money',
          },
          '$',
        ),
      );
    } else {
      eyeParts.push(
        pixel
          ? n('rect', {
              x: x - width,
              y: y - height,
              width: width * 2,
              height: height * 2,
              fill: config.eyeColor,
              'data-part': 'eye-white',
              ...eyeStroke,
            })
          : ellipse(x, y, width, height, {
              fill: config.eyeColor,
              'data-part': 'eye-white',
              ...eyeStroke,
            }),
      );
      if (pupilled) {
        const gazeX =
          type === 'side-eye'
            ? 10
            : thinking
              ? 10
              : config.shape === 'wobbi'
                ? 7
                : 2;
        const pupilX = x + gazeX;
        const pupilY = y + (type === 'round' ? -2 : -8);
        const pupilWidth = type === 'glossy' ? 11 : startled ? 6 : 9;
        const pupilHeight =
          type === 'round' ? 10 : type === 'glossy' ? 14 : startled ? 8 : 11;
        eyeParts.push(
          group(
            'pupil',
            ellipse(pupilX, pupilY, pupilWidth, pupilHeight, {
              fill: pupilInk,
            }),
            ...(config.depth === 'flat'
              ? []
              : [
                  ellipse(
                    pupilX - pupilWidth * 0.38,
                    pupilY - pupilHeight * 0.42,
                    type === 'glossy' ? 4 : 2.6,
                    type === 'glossy' ? 5 : 3.2,
                    { fill: '#ffffff', opacity: 0.96 },
                  ),
                  ...(type === 'glossy'
                    ? [
                        ellipse(pupilX + 4, pupilY + 5, 2.2, 2.5, {
                          fill: '#ffffff',
                          opacity: 0.75,
                        }),
                      ]
                    : []),
                ]),
          ),
        );
      }
      const restingLids = type === 'sleepy' && !startled && !fearful && !angry;
      if (fearful || angry || restingLids) {
        const tilt = fearful ? (i ? 9 : -9) : angry ? (i ? -10 : 10) : 0;
        const eyelidMask = `M${x - width - 3} ${y - height - 3} H${x + width + 3} V${y - 6 + tilt} L${x - width - 3} ${y - 6 - tilt}Z`;
        eyeParts.push(
          path(eyelidMask, { fill: config.color }),
          config.depth === 'flat'
            ? null
            : path(eyelidMask, {
                fill: `url(#${depthId})`,
                'data-eye-volume-mask': type,
                pointerEvents: 'none',
              }),
        );
        const lidPath = angry
          ? `M${x - width + 3} ${y - 7 - tilt * 0.84} L${x + width - 3} ${y - 7 + tilt * 0.84}`
          : fearful
            ? `M${x - width + 3} ${y - 7 - tilt * 0.7} Q${x} ${y - 2} ${x + width - 3} ${y - 7 + tilt * 0.7}`
            : `M${x - width + 3} ${y - 7} Q${x} ${y - 9} ${x + width - 3} ${y - 7}`;
        eyeParts.push(
          path(lidPath, {
            fill: 'none',
            stroke: lashInk,
            strokeWidth: 4,
            strokeLinecap: 'round',
            'data-eye-lid': angry ? 'angry' : fearful ? 'fearful' : 'sleepy',
            ...lashData,
          }),
        );
      }
    }
    const expressionClosed = happy || sleeping || (wink && !startled);
    return n(
      'g',
      { 'data-eye-wrap': i },
      n(
        'g',
        {
          'data-eye': i,
          'data-expression-closed': expressionClosed,
          style: { transformBox: 'fill-box', transformOrigin: 'center' },
        },
        ...eyeParts,
      ),
      expressionClosed
        ? null
        : path(`M${x - width + 2} ${y} Q${x} ${y + 7} ${x + width - 2} ${y}`, {
            fill: 'none',
            stroke: closedEyeInk,
            strokeWidth: 5,
            strokeLinecap: 'round',
            opacity: 0,
            'data-blink-line': i,
          }),
    );
  });
  const browY = 88 + faceY;
  const browInk = config.browColor || closedEyeInk;
  const browNeedsOutline = browInk.toLowerCase() === config.color.toLowerCase();
  const browPaths = {
    soft: [
      `M82 ${browY + 5} Q102 ${browY - 3} 121 ${browY + 4}`,
      `M141 ${browY + 4} Q160 ${browY - 3} 180 ${browY + 5}`,
    ],
    straight: [
      `M83 ${browY + 2} L120 ${browY}`,
      `M142 ${browY} L179 ${browY + 2}`,
    ],
    arched: [
      `M82 ${browY + 7} Q101 ${browY - 12} 120 ${browY + 3}`,
      `M142 ${browY + 3} Q161 ${browY - 12} 180 ${browY + 7}`,
    ],
    worried: [
      `M83 ${browY + 1} Q102 ${browY - 5} 120 ${browY + 8}`,
      `M142 ${browY + 8} Q160 ${browY - 5} 179 ${browY + 1}`,
    ],
    thinking: [
      `M83 ${browY + 5} Q102 ${browY - 4} 120 ${browY + 2}`,
      `M142 ${browY - 2} Q160 ${browY - 11} 179 ${browY - 5}`,
    ],
  };
  const effectiveBrows =
    thinking && config.brows !== 'none' ? 'thinking' : config.brows;
  const brows =
    effectiveBrows === 'none'
      ? null
      : group(
          'brows',
          ...browPaths[effectiveBrows].flatMap((d, i) => [
            browNeedsOutline
              ? path(d, {
                  fill: 'none',
                  stroke: closedEyeInk,
                  strokeWidth: 8,
                  strokeLinecap: 'round',
                  opacity: 0.9,
                })
              : null,
            path(d, {
              fill: 'none',
              stroke: browInk,
              strokeWidth: 5,
              strokeLinecap: 'round',
              'data-brow': i,
            }),
          ]),
        );
  const noseY = 156 + faceY * 0.65;
  const noseNeedsOutline =
    config.noseColor.toLowerCase() === config.color.toLowerCase();
  const noseOutline = noseNeedsOutline
    ? { stroke: closedEyeInk, strokeWidth: 2.5 }
    : {};
  let nose = null;
  if (config.nose === 'dot')
    nose = group(
      'nose',
      ellipse(128, noseY, 4.5, 3.5, {
        fill: config.noseColor,
        ...noseOutline,
      }),
    );
  if (config.nose === 'round')
    nose = group(
      'nose',
      ellipse(128, noseY, 8, 6.5, {
        fill: config.noseColor,
        ...noseOutline,
      }),
      ellipse(125, noseY - 2, 2, 1.5, { fill: '#ffffff', opacity: 0.7 }),
    );
  if (config.nose === 'muzzle')
    nose = group(
      'nose',
      ellipse(117, noseY + 5, 15, 12, {
        fill: config.eyeColor,
        opacity: 0.94,
      }),
      ellipse(139, noseY + 5, 15, 12, {
        fill: config.eyeColor,
        opacity: 0.94,
      }),
      ellipse(128, noseY - 1, 7, 5.5, {
        fill: config.noseColor,
        ...noseOutline,
      }),
      path(`M128 ${noseY + 4} V${noseY + 10}`, {
        fill: 'none',
        stroke: config.noseColor,
        strokeWidth: 3,
        strokeLinecap: 'round',
      }),
    );
  if (config.nose === 'moustache')
    nose = group(
      'nose',
      path(
        `M128 ${noseY + 5} C120 ${noseY - 3} 111 ${noseY - 2} 104 ${noseY + 5} C110 ${noseY + 5} 109 ${noseY + 16} 120 ${noseY + 15} C125 ${noseY + 14} 128 ${noseY + 10} 128 ${noseY + 5}Z M128 ${noseY + 5} C136 ${noseY - 3} 145 ${noseY - 2} 152 ${noseY + 5} C146 ${noseY + 5} 147 ${noseY + 16} 136 ${noseY + 15} C131 ${noseY + 14} 128 ${noseY + 10} 128 ${noseY + 5}Z`,
        {
          fill: config.noseColor,
          stroke: noseNeedsOutline ? closedEyeInk : 'none',
          strokeWidth: noseNeedsOutline ? 2 : 0,
          strokeLinejoin: 'round',
          'data-nose-style': 'moustache',
        },
      ),
    );
  if (config.nose === 'beak')
    nose = group(
      'nose',
      path(
        `M112 ${noseY} Q128 ${noseY - 12} 144 ${noseY} Q128 ${noseY + 14} 112 ${noseY}Z`,
        {
          fill: config.noseColor,
          stroke: closedEyeInk,
          strokeWidth: 2,
          strokeLinejoin: 'round',
        },
      ),
      path(`M115 ${noseY} H141`, {
        fill: 'none',
        stroke: closedEyeInk,
        strokeWidth: 1.5,
        opacity: 0.5,
      }),
    );
  const noseSpacing =
    config.nose === 'muzzle'
      ? 3
      : config.nose === 'moustache'
        ? 18
        : config.nose === 'none'
          ? 0
          : 8;
  const mouthY = 174 + faceY * 0.35 + noseSpacing;
  const configuredMouth = ['muzzle', 'beak'].includes(config.nose)
    ? 'none'
    : config.mouth;
  const muzzleSurprise = config.nose === 'muzzle' && startled;
  let mouth = null;
  if (configuredMouth !== 'none' || muzzleSurprise) {
    let d =
      fearful || angry
        ? `M116 ${mouthY + 4} Q128 ${mouthY - 10} 140 ${mouthY + 4}`
        : `M115 ${mouthY - 4} Q128 ${mouthY + 12} 141 ${mouthY - 4}`;
    if (configuredMouth === 'small' && !happy) d = `M122 ${mouthY} H134`;
    let mouthParts;
    if (configuredMouth === 'open' || muzzleSurprise || startled || singing)
      mouthParts = [
        ellipse(128, mouthY, singing ? 13 : 10, singing ? 16 : happy ? 13 : 9, {
          fill: mouthInk,
          'data-mouth-style': muzzleSurprise
            ? 'muzzle-surprise'
            : singing
              ? 'singing'
              : 'open',
        }),
        ...(config.depth === 'flat'
          ? []
          : [
              path(`M121 ${mouthY + 4} Q128 ${mouthY + 10} 135 ${mouthY + 4}`, {
                fill: 'none',
                stroke: config.accentColor,
                strokeWidth: 3,
                strokeLinecap: 'round',
                opacity: 0.85,
              }),
            ]),
      ];
    else if (configuredMouth === 'tooth' && !fearful && !angry)
      mouthParts = [
        path(`M110 ${mouthY - 5} Q128 ${mouthY + 20} 146 ${mouthY - 5}Z`, {
          fill: mouthInk,
        }),
        n('rect', {
          x: 119,
          y: mouthY - 4,
          width: 7,
          height: 6,
          rx: 1,
          fill: '#ffffff',
        }),
        n('rect', {
          x: 130,
          y: mouthY - 4,
          width: 7,
          height: 6,
          rx: 1,
          fill: '#ffffff',
        }),
      ];
    else if (configuredMouth === 'grin')
      mouthParts = [
        path(`M106 ${mouthY - 6} Q128 ${mouthY + 22} 150 ${mouthY - 6}Z`, {
          fill: '#ffffff',
          stroke: mouthInk,
          strokeWidth: 4,
          strokeLinejoin: 'round',
        }),
        path(`M114 ${mouthY + 4} H142`, {
          fill: 'none',
          stroke: mouthInk,
          strokeWidth: 2,
          opacity: 0.35,
        }),
      ];
    else if (configuredMouth === 'pout')
      mouthParts = [
        path(`M116 ${mouthY + 4} Q128 ${mouthY - 10} 140 ${mouthY + 4}`, {
          fill: 'none',
          stroke: mouthInk,
          strokeWidth: 5,
          strokeLinecap: 'round',
        }),
      ];
    else if (configuredMouth === 'fangs')
      mouthParts = [
        path(`M106 ${mouthY - 2} Q128 ${mouthY + 8} 150 ${mouthY - 2}`, {
          fill: 'none',
          stroke: mouthInk,
          strokeWidth: 5,
          strokeLinecap: 'round',
          'data-mouth-style': 'closed-fangs',
        }),
        path(
          `M113 ${mouthY} L120 ${mouthY + 13} L126 ${mouthY + 2}Z M130 ${mouthY + 2} L136 ${mouthY + 13} L143 ${mouthY}Z`,
          {
            fill: '#ffffff',
            stroke: mouthInk,
            strokeWidth: 2,
            strokeLinejoin: 'round',
          },
        ),
      ];
    else
      mouthParts = [
        path(d, {
          fill: 'none',
          stroke: mouthInk,
          strokeWidth: 5,
          strokeLinecap: 'round',
        }),
      ];
    mouth = group('mouth', ...mouthParts);
  }
  const headY = fit.crownY;
  const headX = fit.crownX;
  const crownHalf = fit.crownHalf;
  const crownLeft = headX - crownHalf;
  const crownRight = headX + crownHalf;
  const crownInnerHalf = Math.max(22, crownHalf * 0.38);
  const head = [];
  const depthLayer = (d, part) =>
    config.depth === 'flat'
      ? null
      : path(d, {
          fill: `url(#${depthId})`,
          'data-detail-depth': part,
          pointerEvents: 'none',
        });
  if (config.head === 'tuft') {
    const tuftPath = `M${headX - 20} ${headY + 9} Q${headX - crownHalf * 0.58} ${headY - 35} ${headX - 7} ${headY - 29} Q${headX + 10} ${headY - 30} ${headX - 6} ${headY - 11} Q${headX + crownHalf * 0.55} ${headY - 29} ${headX + 29} ${headY + 8}Z`;
    head.push(
      path(tuftPath, { fill: config.color }),
      depthLayer(tuftPath, 'tuft'),
    );
  }
  if (config.head === 'curl') {
    const curlPath = `M${headX + 3} ${headY + 11} C${headX - 1} ${headY - 5} ${headX - 22} ${headY - 12} ${headX - 18} ${headY - 29} C${headX - 14} ${headY - 47} ${headX + 15} ${headY - 48} ${headX + 18} ${headY - 30} C${headX + 20} ${headY - 18} ${headX + 4} ${headY - 18} ${headX + 7} ${headY - 29}`;
    head.push(
      path(curlPath, {
        fill: 'none',
        stroke: config.color,
        strokeWidth: 11,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      config.depth === 'flat'
        ? null
        : path(curlPath, {
            fill: 'none',
            stroke: `url(#${depthId})`,
            strokeWidth: 11,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            'data-detail-depth': 'curl',
            pointerEvents: 'none',
          }),
    );
  }
  if (config.head === 'bunny-ears')
    [0, 1].forEach((i) => {
      const direction = i ? 1 : -1;
      const baseX = headX + direction * crownHalf * 0.43;
      const tipX = baseX + direction * 8;
      const earHeight = Math.min(72, headY + 14);
      const earScale = earHeight / 72;
      const outerPath = `M${baseX - 13} ${headY + 23} C${baseX - 16} ${headY - 6 * earScale} ${tipX - 17} ${headY - 66 * earScale} ${tipX} ${headY - earHeight} C${tipX + 18} ${headY - 67 * earScale} ${baseX + 17} ${headY - 6 * earScale} ${baseX + 13} ${headY + 23}Z`;
      const innerPath = `M${baseX - 6} ${headY + 8} C${baseX - 7} ${headY - 16 * earScale} ${tipX - 8} ${headY - 52 * earScale} ${tipX} ${headY - 58 * earScale} C${tipX + 9} ${headY - 51 * earScale} ${baseX + 8} ${headY - 15 * earScale} ${baseX + 6} ${headY + 8}Z`;
      head.push(
        group(
          `bunny-ear-${i}`,
          path(outerPath, { fill: config.color }),
          depthLayer(outerPath, `bunny-ear-${i}`),
          path(innerPath, { fill: config.accentColor, opacity: 0.9 }),
        ),
      );
    });
  if (config.head === 'ears')
    [0, 1].forEach((i) => {
      const outerPath = i
        ? `M${headX + crownInnerHalf} ${headY + 15} L${crownRight - 8} ${headY - 22} Q${crownRight + 8} ${headY - 29} ${crownRight + 7} ${headY + 39}Z`
        : `M${crownLeft - 7} ${headY + 39} Q${crownLeft - 8} ${headY - 29} ${crownLeft + 8} ${headY - 22} L${headX - crownInnerHalf} ${headY + 15}Z`;
      const innerPath = i
        ? `M${crownRight - 25} ${headY + 10} L${crownRight - 5} ${headY - 10} L${crownRight - 5} ${headY + 28}Z`
        : `M${crownLeft + 5} ${headY + 28} L${crownLeft + 5} ${headY - 10} L${crownLeft + 25} ${headY + 10}Z`;
      head.push(
        group(
          `ear-${i}`,
          path(outerPath, { fill: config.color }),
          depthLayer(outerPath, `ear-${i}`),
          path(innerPath, { fill: config.accentColor }),
        ),
      );
    });
  if (config.head === 'round-ears')
    [0, 1].forEach((i) => {
      const direction = i ? 1 : -1;
      const earX = fit.roundEarX?.[i] ?? headX + direction * (crownHalf - 8);
      const earY = Array.isArray(fit.roundEarY)
        ? fit.roundEarY[i]
        : (fit.roundEarY ?? headY + 2);
      head.push(
        group(
          `round-ear-${i}`,
          ellipse(earX, earY, 24, 25, { fill: config.color }),
          config.depth === 'flat'
            ? null
            : ellipse(earX, earY, 24, 25, {
                fill: `url(#${depthId})`,
                'data-detail-depth': `round-ear-${i}`,
                pointerEvents: 'none',
              }),
          ellipse(earX, earY + 1, 12, 13, {
            fill: config.accentColor,
            opacity: 0.78,
          }),
        ),
      );
    });
  if (config.head === 'halo') {
    const haloY = headY - (config.shape === 'drop' ? 62 : 35);
    head.push(
      group(
        'halo',
        ellipse(headX, haloY, Math.max(29, crownHalf * 0.48), 10, {
          fill: 'none',
          stroke: config.accentColor,
          strokeWidth: 7,
          opacity: 0.96,
          'data-head-style': 'halo',
        }),
        path(
          `M${headX - crownHalf * 0.34} ${haloY - 4} Q${headX} ${haloY - 12} ${headX + crownHalf * 0.3} ${haloY - 4}`,
          {
            fill: 'none',
            stroke: '#ffffff',
            strokeWidth: 2,
            strokeLinecap: 'round',
            opacity: 0.7,
          },
        ),
      ),
    );
  }
  if (config.head === 'horns') {
    const hornHalf = fit.hornHalf ?? crownHalf;
    const hornLeft = fit.hornX?.[0] ?? headX - hornHalf;
    const hornRight = fit.hornX?.[1] ?? headX + hornHalf;
    const hornInnerHalf = Math.max(22, hornHalf * 0.38);
    const hornPath = `M${hornLeft + 5} ${headY + 25} Q${hornLeft - 16} ${headY - 3} ${hornLeft + 7} ${headY - 24} Q${hornLeft + 1} ${headY - 3} ${headX - hornInnerHalf} ${headY + 10}Z M${headX + hornInnerHalf} ${headY + 10} Q${hornRight - 1} ${headY - 3} ${hornRight - 7} ${headY - 24} Q${hornRight + 16} ${headY - 3} ${hornRight - 5} ${headY + 25}Z`;
    head.push(
      path(hornPath, {
        fill: config.accessoryColor,
        'data-head-style': 'horns',
      }),
      depthLayer(hornPath, 'horns'),
    );
  }
  const accessoriesBehind = [];
  const accessoriesFront = [];
  const ey = 122 + faceY;
  if (config.accessory === 'glasses')
    accessoriesFront.push(
      n(
        'g',
        { fill: 'none', stroke: config.accessoryColor, strokeWidth: 5 },
        ellipse(101, ey, 29, 33),
        ellipse(160, ey, 29, 33),
        path(`M129 ${ey - 4} Q131 ${ey - 8} 133 ${ey - 4}`),
        fit.glassesArms === false
          ? null
          : path(
              `M72 ${ey - 5} L${128 - fit.templeHalf} ${ey - 9} M189 ${ey - 5} L${128 + fit.templeHalf} ${ey - 9}`,
              { 'data-accessory-piece': 'glasses-arms' },
            ),
      ),
    );
  if (config.accessory === 'sunglasses') {
    const lensInk =
      config.accessoryColor.toLowerCase() === config.color.toLowerCase()
        ? closedEyeInk
        : config.accessoryColor;
    const leftLens = `M70 ${ey - 19} L130 ${ey - 13} L126 ${ey + 2} Q119 ${ey + 26} 97 ${ey + 25} Q76 ${ey + 24} 73 ${ey + 4}Z`;
    const rightLens = `M132 ${ey - 13} L192 ${ey - 19} L189 ${ey + 4} Q186 ${ey + 24} 165 ${ey + 25} Q143 ${ey + 26} 136 ${ey + 2}Z`;
    accessoriesFront.push(
      n(
        'g',
        {
          'data-accessory-style': 'sunglasses',
          strokeLinejoin: 'round',
        },
        path(leftLens, {
          fill: lensInk,
          stroke: lensInk,
          strokeWidth: 4,
          'data-accessory-piece': 'left-sunglass-lens',
        }),
        path(rightLens, {
          fill: lensInk,
          stroke: lensInk,
          strokeWidth: 4,
          'data-accessory-piece': 'right-sunglass-lens',
        }),
        path(`M126 ${ey - 5} Q131 ${ey - 10} 136 ${ey - 5}`, {
          fill: 'none',
          stroke: lensInk,
          strokeWidth: 5,
          strokeLinecap: 'round',
        }),
        fit.glassesArms === false
          ? null
          : path(
              `M72 ${ey - 10} L${128 - fit.templeHalf} ${ey - 14} M190 ${ey - 10} L${128 + fit.templeHalf} ${ey - 14}`,
              {
                fill: 'none',
                stroke: lensInk,
                strokeWidth: 5,
                strokeLinecap: 'round',
                'data-accessory-piece': 'sunglasses-arms',
              },
            ),
        path(`M82 ${ey - 10} L103 ${ey - 7}`, {
          fill: 'none',
          stroke: '#ffffff',
          strokeWidth: 3,
          strokeLinecap: 'round',
          opacity: 0.42,
        }),
        path(`M144 ${ey - 7} L165 ${ey - 10}`, {
          fill: 'none',
          stroke: '#ffffff',
          strokeWidth: 3,
          strokeLinecap: 'round',
          opacity: 0.42,
        }),
      ),
    );
  }
  if (config.accessory === 'headphones') {
    const cupTop = ey - 14;
    const cupHeight = 57;
    const leftCupX = fit.sideLeft - 12;
    const rightCupX = fit.sideRight - 12;
    accessoriesBehind.push(
      path(
        `M${fit.sideLeft} ${cupTop + 34} V${cupTop + 5} C${fit.sideLeft} ${headY - 38} ${fit.sideRight} ${headY - 38} ${fit.sideRight} ${cupTop + 5} V${cupTop + 34}`,
        {
          fill: 'none',
          stroke: config.accessoryColor,
          strokeWidth: 12,
        },
      ),
    );
    accessoriesFront.push(
      n('rect', {
        x: leftCupX,
        y: cupTop,
        width: 25,
        height: cupHeight,
        rx: 12,
        fill: config.accessoryColor,
        'data-accessory-piece': 'left-earcup',
      }),
      n('rect', {
        x: rightCupX,
        y: cupTop,
        width: 25,
        height: cupHeight,
        rx: 12,
        fill: config.accessoryColor,
        'data-accessory-piece': 'right-earcup',
      }),
      ...(config.depth === 'flat'
        ? []
        : [
            n('rect', {
              x: leftCupX,
              y: cupTop,
              width: 25,
              height: cupHeight,
              rx: 12,
              fill: `url(#${depthId})`,
              'data-detail-depth': 'left-earcup',
              pointerEvents: 'none',
            }),
            n('rect', {
              x: rightCupX,
              y: cupTop,
              width: 25,
              height: cupHeight,
              rx: 12,
              fill: `url(#${depthId})`,
              'data-detail-depth': 'right-earcup',
              pointerEvents: 'none',
            }),
          ]),
    );
  }
  if (config.accessory === 'bowtie') {
    const bowY = 198 + faceY * 0.35;
    const bowPath = `M126 ${bowY} Q108 ${bowY - 15} 103 ${bowY - 2} Q105 ${bowY + 14} 126 ${bowY + 5}Z M130 ${bowY} Q148 ${bowY - 15} 153 ${bowY - 2} Q151 ${bowY + 14} 130 ${bowY + 5}Z`;
    accessoriesFront.push(
      path(bowPath, { fill: config.accessoryColor }),
      depthLayer(bowPath, 'bowtie'),
      ellipse(128, bowY + 2, 7, 7, {
        fill: config.accentColor,
        'data-accessory-piece': 'bowtie-knot',
      }),
    );
  }
  if (config.accessory === 'monocle')
    accessoriesFront.push(
      ellipse(160, ey, 31, 35, {
        fill: 'none',
        stroke: config.accessoryColor,
        strokeWidth: 5,
      }),
      path(`M187 ${ey + 19} Q198 ${ey + 43} 189 ${ey + 64}`, {
        fill: 'none',
        stroke: config.accessoryColor,
        strokeWidth: 3,
        strokeLinecap: 'round',
        'data-accessory-piece': 'monocle-chain',
      }),
    );
  if (config.accessory === 'blush')
    accessoriesFront.push(
      ellipse(fit.cheekX[0], ey + 39, fit.cheekRadiusX, 7, {
        fill: config.accentColor,
        opacity: 0.56,
        'data-accessory-piece': 'left-blush',
      }),
      ellipse(fit.cheekX[1], ey + 39, fit.cheekRadiusX, 7, {
        fill: config.accentColor,
        opacity: 0.56,
        'data-accessory-piece': 'right-blush',
      }),
    );
  if (config.accessory === 'freckles')
    accessoriesFront.push(
      ...[
        [103, ey + 31],
        [111, ey + 34],
        [118, ey + 30],
        [143, ey + 30],
        [150, ey + 34],
        [158, ey + 31],
      ].map(([cx, cy], i) =>
        ellipse(cx, cy, 2.1, 1.8, {
          fill: config.accessoryColor,
          opacity: 0.72,
          'data-accessory-piece': i === 0 ? 'freckles' : undefined,
        }),
      ),
    );
  if (config.accessory === 'bandage')
    accessoriesFront.push(
      n(
        'g',
        {
          transform: `rotate(-14 176 ${ey + 31})`,
          'data-accessory-piece': 'bandage',
        },
        n('rect', {
          x: 158,
          y: ey + 23,
          width: 36,
          height: 16,
          rx: 7,
          fill: config.accessoryColor,
        }),
        n('rect', {
          x: 171,
          y: ey + 24,
          width: 10,
          height: 14,
          rx: 3,
          fill: config.accentColor,
          opacity: 0.72,
        }),
        ...[0, 1, 2].map((i) =>
          ellipse(164 + i * 12, ey + 31, 1.2, 1.2, {
            fill: '#ffffff',
            opacity: 0.65,
          }),
        ),
      ),
    );
  const body = group(
    'body',
    n(
      'g',
      {
        'data-part': 'head',
        'data-motion': 'head',
        'data-fit-shape': config.shape,
      },
      ...head,
    ),
    accessoriesBehind.length
      ? n(
          'g',
          {
            'data-part': 'accessory-back',
            'data-motion': 'accessory',
            'data-fit-shape': config.shape,
          },
          ...accessoriesBehind,
        )
      : null,
    path(shape, {
      'data-shape': config.shape,
      fill: config.color,
      stroke: config.outlineColor,
      strokeWidth: config.outlineWidth,
      strokeLinejoin: 'round',
    }),
    config.depth === 'flat'
      ? null
      : path(shape, {
          fill: `url(#${depthId})`,
          'data-part': 'body-depth',
          'data-depth': config.depth,
          pointerEvents: 'none',
        }),
    group(
      'gaze',
      n('g', { 'data-part': 'eyes', 'data-eyes': config.eyes }, ...eyes),
    ),
    brows,
    nose,
    mouth,
    n(
      'g',
      {
        'data-part': 'accessory',
        'data-motion': 'accessory',
        'data-fit-shape': config.shape,
      },
      ...accessoriesFront,
    ),
  );
  return n(
    'g',
    null,
    depthDefinition,
    group(
      'shadow',
      ellipse(128, 238, 55, 6, { fill: '#30214c', opacity: 0.1 }),
    ),
    body,
    ...renderEffects({ n, path, ellipse, group }, config, state),
  );
}
