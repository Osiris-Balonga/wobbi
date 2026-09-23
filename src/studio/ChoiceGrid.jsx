import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Mascot } from '../mascot/Mascot.jsx';
import { DisclosurePanel } from './Disclosure.jsx';
import { formatChoiceCount, useLocale } from '../i18n/index.js';

function contrastInk(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4),
    );
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? '#111218' : '#ffffff';
}

export function ChoiceGrid({
  title,
  values,
  labels,
  field,
  config,
  onChange,
  kind = 'character',
  children,
  columns = 4,
  collapsedCount = values.length,
  itemLabel = 'options',
  disabledValues = [],
}) {
  const { locale, t } = useLocale();
  const selectedIsHidden = values.indexOf(config[field]) >= collapsedCount;
  const [expanded, setExpanded] = useState(() => selectedIsHidden);
  const canToggle = values.length > collapsedCount;
  const showAll = expanded;
  const defaultPrimaryValues = values.slice(0, collapsedCount);
  const primaryValues = selectedIsHidden
    ? [...defaultPrimaryValues.slice(0, -1), config[field]]
    : defaultPrimaryValues;
  const extraValues = values.filter((value) => !primaryValues.includes(value));
  const renderChoice = (value) => {
    const c = { ...config, [field]: value };
    const contextualPreview = ['eyes', 'mouth', 'nose', 'brows'].includes(kind);
    return (
      <button
        type="button"
        key={value}
        className={`choice ${kind}-choice`}
        aria-label={title + ' : ' + labels[value]}
        aria-pressed={config[field] === value}
        disabled={disabledValues.includes(value)}
        style={
          contextualPreview
            ? {
                '--choice-surface': config.color,
                '--choice-ink': contrastInk(config.color),
              }
            : undefined
        }
        onClick={() => onChange(value)}
      >
        {kind === 'eyes' ? (
          <EyePreview config={c} />
        ) : kind === 'mouth' ? (
          <MouthPreview config={c} />
        ) : kind === 'nose' || kind === 'brows' ? (
          <FaceDetailPreview config={c} kind={kind} />
        ) : (
          <Mascot
            config={
              field === 'shape'
                ? {
                    ...c,
                    head: 'none',
                    accessory: 'none',
                    mouth: 'none',
                  }
                : c
            }
            playing={false}
            size={54}
          />
        )}
        <span>{labels[value]}</span>
      </button>
    );
  };
  return (
    <section className="choice-section">
      <h2>{title}</h2>
      <div className={`choice-grid columns-${columns}`}>
        {primaryValues.map(renderChoice)}
      </div>
      {canToggle && (
        <DisclosurePanel open={showAll} className="choice-more">
          <div className={`choice-grid columns-${columns}`}>
            {extraValues.map(renderChoice)}
          </div>
        </DisclosurePanel>
      )}
      {canToggle && (
        <button
          type="button"
          className="choice-grid-toggle"
          aria-expanded={showAll}
          onClick={() => setExpanded((open) => !open)}
        >
          {showAll
            ? t('Show fewer {item}', { item: title.toLowerCase() })
            : formatChoiceCount(
                locale,
                values.length - collapsedCount,
                itemLabel,
              )}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      )}
      {children}
    </section>
  );
}
function FaceDetailPreview({ config, kind }) {
  if (kind === 'nose' && config.nose === 'none')
    return (
      <span className="face-detail-preview" aria-hidden="true">
        <svg width="58" height="42" viewBox="0 0 64 44">
          <g
            stroke={contrastInk(config.color)}
            strokeOpacity="0.72"
            strokeWidth="2.5"
            fill="none"
          >
            <circle cx="32" cy="22" r="11" />
            <path d="M22 32L42 12" />
          </g>
        </svg>
      </span>
    );
  const detailViewBox =
    kind === 'brows'
      ? '66 78 124 70'
      : config.nose === 'muzzle'
        ? '100 140 56 32'
        : config.nose === 'moustache'
          ? '98 142 60 34'
          : config.nose === 'beak'
            ? '108 138 40 36'
            : '112 144 32 24';
  return (
    <span className="face-detail-preview" aria-hidden="true">
      <Mascot
        config={{
          ...config,
          shape: 'circle',
          color: config.color,
          eyes: kind === 'brows' ? 'classic' : 'dots',
          nose: kind === 'nose' ? config.nose : 'none',
          brows: kind === 'brows' ? config.brows : 'none',
          mouth: 'none',
          head: 'none',
          accessory: 'none',
          outlineWidth: 0,
          depth: 'flat',
        }}
        playing={false}
        size={72}
        viewBox={detailViewBox}
        width="72"
        height="48"
        aria-hidden="true"
      />
    </span>
  );
}
function EyePreview({ config }) {
  return (
    <span className="eye-preview" aria-hidden="true">
      <Mascot
        config={{
          ...config,
          shape: 'circle',
          nose: 'none',
          brows: 'none',
          mouth: 'none',
          head: 'none',
          accessory: 'none',
          outlineWidth: 0,
          color: config.color,
          depth: 'flat',
        }}
        playing={false}
        size={72}
        viewBox="62 76 132 96"
        width="72"
        height="48"
        aria-hidden="true"
      />
    </span>
  );
}
function MouthPreview({ config }) {
  if (config.mouth === 'none')
    return (
      <svg width="58" height="42" viewBox="0 0 64 44" aria-hidden="true">
        <g
          stroke={contrastInk(config.color)}
          strokeOpacity="0.62"
          strokeWidth="2"
          fill="none"
        >
          <circle cx="32" cy="22" r="12" />
          <path d="M21 34L43 10" />
        </g>
      </svg>
    );
  return (
    <span className="mouth-preview" aria-hidden="true">
      <Mascot
        config={{
          ...config,
          shape: 'circle',
          color: config.color,
          eyes: 'dots',
          nose: 'none',
          brows: 'none',
          head: 'none',
          accessory: 'none',
          outlineWidth: 0,
          depth: 'flat',
        }}
        playing={false}
        size={72}
        viewBox="88 146 80 58"
        width="72"
        height="48"
        aria-hidden="true"
      />
    </span>
  );
}
