// Shared SVG geometry. Every eye family retains its identity in each expression.
export const BODY_PATHS = {
  wobbi:
    'M42 167 C36 126 70 75 113 52 C157 25 186 40 211 79 C233 112 242 173 217 198 C187 230 90 226 58 201 C46 191 43 180 42 167Z',
  ghost:
    'M43 173 C43 90 70 40 128 40 C186 40 213 91 213 173 Q212 205 190 192 Q169 222 148 197 Q126 225 106 199 Q81 216 67 192 Q39 208 43 173Z',
  circle: 'M218 131 A90 90 0 1 1 38 131 A90 90 0 1 1 218 131Z',
  'rounded-square':
    'M72 43 H184 Q215 43 215 74 V186 Q215 217 184 217 H72 Q41 217 41 186 V74 Q41 43 72 43Z',
  cloud:
    'M57 189 C13 169 21 124 49 112 C33 70 79 43 109 66 C142 25 194 52 195 87 C241 89 251 144 220 164 C235 211 177 234 149 213 C111 239 70 222 57 189Z',
  drop: 'M134 29 C141 85 217 104 217 162 C217 240 41 241 41 162 C41 105 109 85 134 29Z',
  oval: 'M204 130 C204 191 174 228 128 228 C82 228 52 191 52 130 C52 67 82 28 128 28 C174 28 204 67 204 130Z',
  egg: 'M128 27 C160 27 180 62 191 104 C207 164 197 205 164 224 C144 236 112 236 92 224 C59 205 49 164 65 104 C76 62 96 27 128 27Z',
};

export const LASHED_EYES = ['sleepy', 'angry', 'wink'];

// Attachment points are tuned per silhouette instead of assuming every body is
// the same circle. Head details use the crown, while glasses and headphones use
// the actual width around the face.
export const SHAPE_FITS = {
  wobbi: {
    faceY: 0,
    crownX: 128,
    crownY: 55,
    crownHalf: 72,
    sideLeft: 43,
    sideRight: 217,
    templeHalf: 72,
    cheekX: [70, 186],
    cheekRadiusX: 14,
    roundEarX: [84, 192],
    roundEarY: [65, 58],
    hornHalf: 48,
    hornX: [80, 198],
  },
  ghost: {
    faceY: 0,
    crownX: 128,
    crownY: 53,
    crownHalf: 68,
    sideLeft: 43,
    sideRight: 213,
    templeHalf: 77,
    cheekX: [69, 187],
    cheekRadiusX: 14,
  },
  circle: {
    faceY: 0,
    crownX: 128,
    crownY: 53,
    crownHalf: 67,
    sideLeft: 38,
    sideRight: 218,
    templeHalf: 78,
    cheekX: [68, 188],
    cheekRadiusX: 15,
  },
  'rounded-square': {
    faceY: 0,
    crownX: 128,
    crownY: 54,
    crownHalf: 66,
    sideLeft: 41,
    sideRight: 215,
    templeHalf: 76,
    cheekX: [66, 190],
    cheekRadiusX: 15,
  },
  cloud: {
    faceY: 2,
    crownX: 135,
    crownY: 68,
    crownHalf: 78,
    sideLeft: 28,
    sideRight: 232,
    templeHalf: 82,
    cheekX: [62, 194],
    cheekRadiusX: 15,
  },
  drop: {
    faceY: 19,
    crownX: 133,
    crownY: 83,
    crownHalf: 46,
    sideLeft: 42,
    sideRight: 217,
    templeHalf: 67,
    cheekX: [69, 187],
    cheekRadiusX: 14,
  },
  oval: {
    faceY: 0,
    crownX: 128,
    crownY: 39,
    crownHalf: 55,
    sideLeft: 52,
    sideRight: 204,
    templeHalf: 64,
    glassesArms: false,
    cheekX: [72, 184],
    cheekRadiusX: 12,
  },
  egg: {
    faceY: 6,
    crownX: 128,
    crownY: 41,
    crownHalf: 49,
    sideLeft: 57,
    sideRight: 199,
    templeHalf: 61,
    glassesArms: false,
    cheekX: [73, 183],
    cheekRadiusX: 11,
  },
};

export function closedEyeColor(bodyColor) {
  const channels = bodyColor
    .slice(1)
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4),
    );
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance < 0.179 ? '#ffffff' : '#111218';
}
