import { useState } from 'react';
import { palette } from './catalog.js';
import { hexToHsv, hsvToHex } from './color.js';
export function Swatches({ value, onChange, onCustom, label = 'Couleur' }) {
  return (
    <div className="swatches">
      {palette.map((color) => (
        <button
          key={color}
          type="button"
          className="swatch"
          style={{ background: color }}
          aria-label={label + ' ' + color}
          aria-pressed={color.toLowerCase() === value.toLowerCase()}
          onClick={() => onChange(color)}
        />
      ))}
      {onCustom && (
        <button
          type="button"
          className="rainbow-button"
          aria-label={
            label === 'Couleur'
              ? 'Couleur personnalisée'
              : label + ' personnalisée'
          }
          onClick={onCustom}
        >
          <span>+</span>
        </button>
      )}
    </div>
  );
}

function HexInput({ value, onChange, onClose }) {
  const [error, setError] = useState('');
  return (
    <div className="hex-controls">
      <label htmlFor="hex-color">HEX</label>
      <input
        id="hex-color"
        aria-invalid={!!error}
        defaultValue={value.toUpperCase()}
        maxLength={7}
        onChange={(event) => {
          const next = event.target.value;
          if (/^#[0-9a-f]{6}$/i.test(next)) {
            setError('');
            onChange(next);
          } else setError('Six chiffres après #.');
        }}
      />
      <span className="color-error">{error}</span>
      <button
        className="primary"
        type="button"
        disabled={!!error}
        onClick={onClose}
      >
        Terminé
      </button>
    </div>
  );
}

export function ColorPicker({
  value,
  onChange,
  onPreview = onChange,
  onCommit,
  onClose,
  label,
}) {
  const [draft, setDraft] = useState(() => ({ value, hsv: hexToHsv(value) }));
  if (value !== draft.value) setDraft({ value, hsv: hexToHsv(value) });
  const { hsv } = draft;
  const update = (next, notify = onChange) => {
    const c = hsvToHex(next);
    setDraft({ value: c, hsv: next });
    notify(c);
  };
  function square(e, notify) {
    const r = e.currentTarget.getBoundingClientRect();
    update(
      {
        ...hsv,
        s: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
        v: 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
      },
      notify,
    );
  }
  const drag = (handler) => ({
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      handler(e, onPreview);
    },
    onPointerMove: (e) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) handler(e, onPreview);
    },
    onPointerUp: (e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      handler(e, onPreview);
      e.currentTarget.releasePointerCapture(e.pointerId);
      onCommit?.();
    },
    onPointerCancel: (e) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      onCommit?.();
    },
  });
  return (
    <div
      className="color-picker"
      role="group"
      aria-label={'Couleur personnalisée : ' + label}
    >
      <Swatches value={value} onChange={onChange} />
      <div className="picker-layout">
        <div
          className="color-plane"
          style={{ backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
          {...drag(square)}
        >
          <i
            style={{ left: hsv.s * 100 + '%', top: (1 - hsv.v) * 100 + '%' }}
          />
        </div>
        <label className="hue-control">
          <span>Teinte</span>
          <input
            aria-label="Teinte"
            type="range"
            min="0"
            max="359"
            value={Math.round(hsv.h)}
            onChange={(event) =>
              update({ ...hsv, h: Number(event.target.value) })
            }
          />
        </label>
        <HexInput
          key={value}
          value={value}
          onChange={onChange}
          onClose={onClose}
        />
      </div>
      <div className="sr-only">
        <label>
          Saturation
          <input
            type="range"
            min="0"
            max="100"
            value={hsv.s * 100}
            onChange={(e) =>
              update({ ...hsv, s: Number(e.target.value) / 100 })
            }
          />
        </label>
        <label>
          Luminosité
          <input
            type="range"
            min="0"
            max="100"
            value={hsv.v * 100}
            onChange={(e) =>
              update({ ...hsv, v: Number(e.target.value) / 100 })
            }
          />
        </label>
      </div>
    </div>
  );
}
