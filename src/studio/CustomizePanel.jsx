import { useState } from 'react';
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
} from '../../packages/core/config.js';
import { ChoiceGrid } from './ChoiceGrid.jsx';
import { ColorPicker, Swatches } from './ColorPicker.jsx';
import {
  accessoryLabels,
  eyeLabels,
  noseLabels,
  browLabels,
  headLabels,
  mouthLabels,
  shapeLabels,
} from './catalog.js';

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
  return (
    <details className={`appearance-disclosure ${className}`}>
      <summary>
        <span>{title}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="appearance-content">{children}</div>
    </details>
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
  const availableHeads = headsForShape(config.shape);
  const availableAccessories = accessoriesForShape(config.shape);
  const labels = {
    color: 'Corps',
    eyeColor: 'Yeux',
    pupilColor: 'Pupilles',
    mouthColor: 'Bouche',
    noseColor: 'Nez',
    browColor: 'Sourcils',
    outlineColor: 'Contour du corps',
    eyeOutlineColor: 'Contour des yeux',
    accessoryColor: 'Accessoire',
    accentColor: 'Accent',
    background: 'Fond',
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
    <aside className="customizer" aria-label="Personnalisation">
      <h1>
        À vous de jouer<span className="violet-dot">.</span>
      </h1>
      <p className="intro">Quelques choix, votre personnage.</p>
      <label className="mascot-name-field">
        <span>Nom</span>
        <input
          aria-label="Nom de la mascotte"
          maxLength={40}
          value={config.name}
          onChange={(event) => patch({ name: event.target.value })}
        />
      </label>

      <ChoiceGrid
        title="Forme"
        field="shape"
        values={SHAPES}
        labels={shapeLabels}
        config={config}
        columns={4}
        collapsedCount={4}
        itemLabel="formes"
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
        title="Apparence du corps"
        className="body-settings"
      >
        <InlineColorControl
          colorKey="color"
          label="Teinte"
          ariaLabel="Couleur du corps"
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
          aria-label="Volume du corps"
        >
          <h3>Volume</h3>
          <div>
            {DEPTHS.map((depth) => (
              <button
                type="button"
                key={depth}
                aria-pressed={config.depth === depth}
                onClick={() => patch({ depth })}
              >
                {{ flat: 'Plat', soft: 'Doux', deep: 'Profond' }[depth]}
              </button>
            ))}
          </div>
        </div>
        <InlineColorControl
          colorKey="outlineColor"
          label="Contour"
          ariaLabel="Couleur du contour"
          value={config.outlineColor}
          patch={patch}
          preview={preview}
          commitPreview={commitPreview}
          target={target}
          setTarget={setTarget}
        />
        <ThicknessControl
          label="Épaisseur"
          ariaLabel="Épaisseur du contour du corps"
          value={config.outlineWidth}
          max={16}
          onChange={(outlineWidth) => patch({ outlineWidth })}
        />
      </AppearanceDisclosure>

      <ChoiceGrid
        title="Yeux"
        field="eyes"
        values={EYES}
        labels={eyeLabels}
        config={config}
        kind="eyes"
        columns={3}
        collapsedCount={3}
        itemLabel="regards"
        onChange={(eyes) => patch({ eyes })}
      >
        <AppearanceDisclosure title="Apparence des yeux">
          <InlineColorControl
            colorKey="eyeColor"
            label="Teinte"
            ariaLabel={hasPupils ? 'Couleur de l’œil' : 'Couleur des yeux'}
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
              label="Pupille"
              ariaLabel="Couleur des pupilles"
              value={config.pupilColor}
              patch={patch}
              preview={preview}
              commitPreview={commitPreview}
              target={target}
              setTarget={setTarget}
            />
          )}
          <InlineColorControl
            colorKey="eyeOutlineColor"
            label="Contour"
            ariaLabel="Couleur du contour des yeux"
            value={config.eyeOutlineColor}
            patch={patch}
            preview={preview}
            commitPreview={commitPreview}
            target={target}
            setTarget={setTarget}
          />
          <ThicknessControl
            label="Épaisseur"
            ariaLabel="Épaisseur du contour des yeux"
            value={config.eyeOutlineWidth}
            max={6}
            onChange={(eyeOutlineWidth) => patch({ eyeOutlineWidth })}
          />
        </AppearanceDisclosure>
      </ChoiceGrid>

      <ChoiceGrid
        title="Nez, museau ou bec"
        field="nose"
        values={NOSES}
        labels={noseLabels}
        config={config}
        kind="nose"
        columns={3}
        collapsedCount={3}
        itemLabel="nez"
        onChange={(nose) =>
          patch(nose === 'beak' ? { nose, mouth: 'none' } : { nose })
        }
      >
        <AppearanceDisclosure title="Teinte du nez">
          <InlineColorControl
            colorKey="noseColor"
            label="Teinte"
            ariaLabel="Couleur du nez"
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
        title="Sourcils"
        field="brows"
        values={BROWS}
        labels={browLabels}
        config={config}
        kind="brows"
        columns={3}
        collapsedCount={3}
        itemLabel="sourcils"
        onChange={(brows) => patch({ brows })}
      >
        <AppearanceDisclosure title="Teinte des sourcils">
          <InlineColorControl
            colorKey="browColor"
            label="Teinte"
            ariaLabel="Couleur des sourcils"
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
        title="Bouche"
        field="mouth"
        values={MOUTHS}
        labels={mouthLabels}
        config={config}
        kind="mouth"
        columns={3}
        collapsedCount={3}
        itemLabel="bouches"
        disabledValues={
          config.nose === 'beak'
            ? MOUTHS.filter((mouth) => mouth !== 'none')
            : []
        }
        onChange={(mouth) => patch({ mouth })}
      >
        <AppearanceDisclosure title="Teinte de la bouche">
          <InlineColorControl
            colorKey="mouthColor"
            label="Teinte"
            ariaLabel="Couleur de la bouche"
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
        <span>Accessoires & détails</span>
        <ChevronDown className="details-chevron" size={15} />
      </button>

      {details && (
        <div className="details-disclosure" id="character-details">
          <ChoiceGrid
            title="Tête"
            field="head"
            values={availableHeads}
            labels={headLabels}
            config={config}
            columns={3}
            collapsedCount={3}
            itemLabel="détails de tête"
            onChange={(head) => patch({ head })}
          />
          <ChoiceGrid
            title="Accessoires"
            field="accessory"
            values={availableAccessories}
            labels={accessoryLabels}
            config={config}
            columns={3}
            collapsedCount={3}
            itemLabel="accessoires"
            onChange={(accessory) => patch({ accessory })}
          />

          <section className="choice-section detail-colors">
            <h2>Couleurs des détails</h2>
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
            Fond transparent dans l’aperçu
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
      )}
    </aside>
  );
}
