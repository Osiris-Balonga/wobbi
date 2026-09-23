import { useId, useState } from 'react';
import { ChevronDown, Glasses } from 'lucide-react';
import {
  DEPTHS,
  EYES,
  NOSES,
  BROWS,
  MOUTHS,
  SHAPES,
  accessoriesForShape,
  headsForShape,
  mouthsForNose,
} from '../../packages/core/config.js';
import { LASHED_EYES } from '../../packages/core/render-model.js';
import { ChoiceGrid } from './ChoiceGrid.jsx';
import { ColorPicker, Swatches } from './ColorPicker.jsx';
import { DisclosurePanel } from './Disclosure.jsx';
import { catalog } from './catalog.js';
import { useLocale } from '../i18n/index.js';

function InlineColorControl({
  colorKey,
  label,
  ariaLabel = label,
  hideLabel = false,
  value,
  patch,
  preview,
  commitPreview,
  target,
  setTarget,
}) {
  return (
    <div className="inline-color-control" role="group" aria-label={ariaLabel}>
      {!hideLabel && <h3>{label}</h3>}
      {target === colorKey ? (
        <ColorPicker
          label={ariaLabel}
          value={value}
          onChange={(color) => patch({ [colorKey]: color })}
          onPreview={(color) => preview({ [colorKey]: color })}
          onCommit={commitPreview}
          onClose={() => setTarget(null)}
        />
      ) : (
        <Swatches
          label={ariaLabel}
          value={value}
          onChange={(color) => patch({ [colorKey]: color })}
          onCustom={() => setTarget(colorKey)}
        />
      )}
    </div>
  );
}

function AppearanceDisclosure({ title, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <section className={`appearance-disclosure ${className}`}>
      <button
        type="button"
        className="appearance-trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <DisclosurePanel open={open} id={contentId}>
        <div className="appearance-content">{children}</div>
      </DisclosurePanel>
    </section>
  );
}

function ThicknessControl({ label, ariaLabel = label, value, max, onChange }) {
  return (
    <label className="thickness-control">
      <span>{label}</span>
      <output>{value} px</output>
      <input
        aria-label={ariaLabel}
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function CustomizePanel({
  config,
  patch,
  preview,
  commitPreview,
  details,
  setDetails,
}) {
  const { locale, t } = useLocale();
  const {
    accessoryLabels,
    eyeLabels,
    noseLabels,
    browLabels,
    headLabels,
    mouthLabels,
    shapeLabels,
  } = catalog(locale);
  const [target, setTarget] = useState(null);
  const hasPupils = [
    'classic',
    'glossy',
    'round',
    'sleepy',
    'angry',
    'side-eye',
    'wink',
  ].includes(config.eyes);
  const hasLashes = LASHED_EYES.includes(config.eyes);
  const availableHeads = headsForShape(config.shape);
  const availableAccessories = accessoriesForShape(config.shape);
  const labels = {
    color: t('Body'),
    eyeColor: t('Eyes'),
    pupilColor: t('Pupils'),
    lashColor: t('Lashes'),
    mouthColor: t('Mouth'),
    noseColor: t('Nose'),
    browColor: t('Eyebrows'),
    outlineColor: t('Body outline'),
    eyeOutlineColor: t('Eye outline'),
    accessoryColor: t('Accessory'),
    accentColor: t('Accent'),
    background: t('Background'),
  };
  const changeColor = (key, value) =>
    patch(
      key === 'background'
        ? { background: { ...config.background, color: value } }
        : { [key]: value },
    );
  const previewColor = (key, value) =>
    preview(
      key === 'background'
        ? { background: { ...config.background, color: value } }
        : { [key]: value },
    );
  const detailColorKeys = [
    ...(config.accessory !== 'none' || config.head === 'horns'
      ? ['accessoryColor']
      : []),
    'accentColor',
    'background',
  ];

  return (
    <aside className="customizer" aria-label={t('Customize your mascot')}>
      <h1>
        {t('Make it yours')}
        <span className="violet-dot">.</span>
      </h1>
      <p className="intro">{t('A few choices, your character.')}</p>
      <label className="mascot-name-field">
        <span>{t('Name')}</span>
        <input
          aria-label={t('Mascot name')}
          maxLength={40}
          value={config.name}
          onChange={(event) => patch({ name: event.target.value })}
        />
      </label>

      <ChoiceGrid
        title={t('Shape')}
        field="shape"
        values={SHAPES}
        labels={shapeLabels}
        config={config}
        columns={3}
        collapsedCount={3}
        itemLabel={{ one: t('shape'), other: t('shapes') }}
        onChange={(shape) =>
          patch({
            shape,
            head: headsForShape(shape).includes(config.head)
              ? config.head
              : 'none',
            accessory: accessoriesForShape(shape).includes(config.accessory)
              ? config.accessory
              : 'none',
          })
        }
      />

      <AppearanceDisclosure
        title={t('Body appearance')}
        className="body-settings"
      >
        <InlineColorControl
          colorKey="color"
          label={t('Hue')}
          ariaLabel={t('Body color')}
          value={config.color}
          patch={patch}
          preview={preview}
          commitPreview={commitPreview}
          target={target}
          setTarget={setTarget}
        />
        <div
          className="depth-control"
          role="group"
          aria-label={t('Body depth')}
        >
          <h3>{t('Depth')}</h3>
          <div>
            {DEPTHS.map((depth) => (
              <button
                type="button"
                key={depth}
                aria-pressed={config.depth === depth}
                onClick={() => patch({ depth })}
              >
                {{ flat: t('Flat'), soft: t('Soft'), deep: t('Deep') }[depth]}
              </button>
            ))}
          </div>
        </div>
        <InlineColorControl
          colorKey="outlineColor"
          label={t('Outline')}
          ariaLabel={t('Outline color')}
          value={config.outlineColor}
          patch={patch}
          preview={preview}
          commitPreview={commitPreview}
          target={target}
          setTarget={setTarget}
        />
        <ThicknessControl
          label={t('Thickness')}
          ariaLabel={t('Body outline thickness')}
          value={config.outlineWidth}
          max={16}
          onChange={(outlineWidth) => patch({ outlineWidth })}
        />
      </AppearanceDisclosure>

      <ChoiceGrid
        title={t('Eyes')}
        field="eyes"
        values={EYES}
        labels={eyeLabels}
        config={config}
        kind="eyes"
        columns={3}
        collapsedCount={3}
        itemLabel={{ one: t('eye style'), other: t('eye styles') }}
        onChange={(eyes) => patch({ eyes })}
      >
        <AppearanceDisclosure title={t('Eye appearance')}>
          <InlineColorControl
            colorKey="eyeColor"
            label={t('Hue')}
            ariaLabel={hasPupils ? t('Eye color') : t('Eyes color')}
            value={config.eyeColor}
            patch={patch}
            preview={preview}
            commitPreview={commitPreview}
            target={target}
            setTarget={setTarget}
          />
          {hasPupils && (
            <InlineColorControl
              colorKey="pupilColor"
              label={t('Pupil')}
              ariaLabel={t('Pupil color')}
              value={config.pupilColor}
              patch={patch}
              preview={preview}
              commitPreview={commitPreview}
              target={target}
              setTarget={setTarget}
            />
          )}
          {hasLashes && (
            <InlineColorControl
              colorKey="lashColor"
              label={t('Lashes')}
              ariaLabel={t('Lash color')}
              value={config.lashColor}
              patch={patch}
              preview={preview}
              commitPreview={commitPreview}
              target={target}
              setTarget={setTarget}
            />
          )}
          <InlineColorControl
            colorKey="eyeOutlineColor"
            label={t('Outline')}
            ariaLabel={t('Eye outline color')}
            value={config.eyeOutlineColor}
            patch={patch}
            preview={preview}
            commitPreview={commitPreview}
            target={target}
            setTarget={setTarget}
          />
          <ThicknessControl
            label={t('Thickness')}
            ariaLabel={t('Eye outline thickness')}
            value={config.eyeOutlineWidth}
            max={6}
            onChange={(eyeOutlineWidth) => patch({ eyeOutlineWidth })}
          />
        </AppearanceDisclosure>
      </ChoiceGrid>

      <ChoiceGrid
        title={t('Nose, muzzle or beak')}
        field="nose"
        values={NOSES}
        labels={noseLabels}
        config={config}
        kind="nose"
        columns={3}
        collapsedCount={3}
        itemLabel={{ one: t('nose'), other: t('noses') }}
        onChange={(nose) =>
          patch(
            mouthsForNose(nose).includes(config.mouth)
              ? { nose }
              : { nose, mouth: 'none' },
          )
        }
      >
        <AppearanceDisclosure title={t('Nose hue')}>
          <InlineColorControl
            colorKey="noseColor"
            label={t('Hue')}
            ariaLabel={t('Nose color')}
            hideLabel
            value={config.noseColor}
            patch={patch}
            preview={preview}
            commitPreview={commitPreview}
            target={target}
            setTarget={setTarget}
          />
        </AppearanceDisclosure>
      </ChoiceGrid>

      <ChoiceGrid
        title={t('Eyebrows')}
        field="brows"
        values={BROWS}
        labels={browLabels}
        config={config}
        kind="brows"
        columns={3}
        collapsedCount={3}
        itemLabel={{ one: t('eyebrow'), other: t('eyebrows') }}
        onChange={(brows) => patch({ brows })}
      >
        <AppearanceDisclosure title={t('Eyebrow hue')}>
          <InlineColorControl
            colorKey="browColor"
            label={t('Hue')}
            ariaLabel={t('Eyebrow color')}
            hideLabel
            value={config.browColor}
            patch={patch}
            preview={preview}
            commitPreview={commitPreview}
            target={target}
            setTarget={setTarget}
          />
        </AppearanceDisclosure>
      </ChoiceGrid>

      <ChoiceGrid
        title={t('Mouth')}
        field="mouth"
        values={MOUTHS}
        labels={mouthLabels}
        config={config}
        kind="mouth"
        columns={3}
        collapsedCount={3}
        itemLabel={{ one: t('mouth'), other: t('mouths') }}
        disabledValues={MOUTHS.filter(
          (mouth) => !mouthsForNose(config.nose).includes(mouth),
        )}
        onChange={(mouth) => patch({ mouth })}
      >
        <AppearanceDisclosure title={t('Mouth hue')}>
          <InlineColorControl
            colorKey="mouthColor"
            label={t('Hue')}
            ariaLabel={t('Mouth color')}
            hideLabel
            value={config.mouthColor}
            patch={patch}
            preview={preview}
            commitPreview={commitPreview}
            target={target}
            setTarget={setTarget}
          />
        </AppearanceDisclosure>
      </ChoiceGrid>

      <button
        type="button"
        className="details-button"
        aria-expanded={details}
        aria-controls="character-details"
        onClick={() => {
          setDetails(!details);
          setTarget(null);
        }}
      >
        <Glasses size={23} />
        <span>{t('Accessories & details')}</span>
        <ChevronDown className="details-chevron" size={15} />
      </button>

      <DisclosurePanel
        open={details}
        id="character-details"
        className="details-motion"
      >
        <div className="details-disclosure">
          <ChoiceGrid
            title={t('Head')}
            field="head"
            values={availableHeads}
            labels={headLabels}
            config={config}
            columns={3}
            collapsedCount={3}
            itemLabel={{ one: t('head detail'), other: t('head details') }}
            onChange={(head) => patch({ head })}
          />
          <ChoiceGrid
            title={t('Accessories')}
            field="accessory"
            values={availableAccessories}
            labels={accessoryLabels}
            config={config}
            columns={3}
            collapsedCount={3}
            itemLabel={{ one: t('accessory'), other: t('accessories') }}
            onChange={(accessory) => patch({ accessory })}
          />

          <section className="choice-section detail-colors">
            <h2>{t('Detail colors')}</h2>
            <div className="color-targets">
              {detailColorKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="color-target"
                  aria-pressed={target === key}
                  onClick={() => setTarget(target === key ? null : key)}
                >
                  <span
                    style={{
                      background:
                        key === 'background'
                          ? config.background.color
                          : config[key],
                    }}
                  >
                    {key === 'pupilColor' ? (
                      '◉'
                    ) : key === 'accessoryColor' ? (
                      <Glasses size={22} />
                    ) : (
                      ''
                    )}
                  </span>
                  {labels[key]}
                </button>
              ))}
            </div>
            {target && detailColorKeys.includes(target) && (
              <ColorPicker
                key={target}
                label={labels[target]}
                value={
                  target === 'background'
                    ? config.background.color
                    : config[target]
                }
                onChange={(value) => changeColor(target, value)}
                onPreview={(value) => previewColor(target, value)}
                onCommit={commitPreview}
                onClose={() => setTarget(null)}
              />
            )}
          </section>

          <label className="detail-row">
            {t('Transparent preview background')}
            <input
              type="checkbox"
              checked={config.background.type === 'transparent'}
              onChange={(event) =>
                patch({
                  background: {
                    ...config.background,
                    type: event.target.checked ? 'transparent' : 'solid',
                  },
                })
              }
            />
          </label>
        </div>
      </DisclosurePanel>
    </aside>
  );
}
