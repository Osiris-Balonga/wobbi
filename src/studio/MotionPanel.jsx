import { titleCase } from '../ui/labels.js';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  MoveVertical,
  Waves,
  RotateCw,
  Eye,
  MoveHorizontal,
  Smile,
  GripVertical,
} from 'lucide-react';
import { useState } from 'react';
import { REACTIONS, MOVEMENTS, EASINGS } from '../../packages/core/config.js';
import { Switch, Range, Field, Segmented } from '../ui/Controls.jsx';
const labels = {
  bounce: 'Bounce',
  squash: 'Squash & stretch',
  tilt: 'Tilt',
  shake: 'Shake',
  blink: 'Blink',
  'eye-movement': 'Eye movement',
  mouth: 'Mouth transformation',
};
const icons = {
  bounce: MoveVertical,
  squash: Waves,
  tilt: RotateCw,
  shake: MoveHorizontal,
  blink: Eye,
  'eye-movement': MoveHorizontal,
  mouth: Smile,
};
export function MotionPanel({ config, reaction, onReaction, patch }) {
  const [newMove, setNewMove] = useState('shake');
  const motion = config.reactions[reaction];
  const update = (changes) =>
    patch({
      reactions: { ...config.reactions, [reaction]: { ...motion, ...changes } },
    });
  const available = MOVEMENTS.filter(
    (type) =>
      !motion.movements.some((m) => m.type === type) &&
      (type !== 'mouth' || config.mouth !== 'none'),
  );
  const selected = available.includes(newMove) ? newMove : available[0];
  function move(index, offset) {
    const next = [...motion.movements];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    update({ movements: next });
  }
  return (
    <div className="panel-body motion-controls">
      <Field label="Reaction">
        <select
          aria-label="Reaction to edit"
          value={reaction}
          onChange={(e) => onReaction(e.target.value)}
        >
          {REACTIONS.map((state) => (
            <option key={state} value={state}>
              {titleCase(state)}
            </option>
          ))}
        </select>
      </Field>
      <section className="control-section">
        <div className="section-heading">
          <h2>Movements</h2>
          <span>In playback order</span>
        </div>
        <div className="movement-list">
          {motion.movements.map((movement, index) => {
            const Icon = icons[movement.type];
            return (
              <div
                className="movement-row"
                data-testid="movement-row"
                key={movement.type}
              >
                <GripVertical size={13} className="muted" />
                <Icon size={17} className="accent" />
                <span>{labels[movement.type]}</span>
                <div className="move-order">
                  <button
                    aria-label={`Move ${labels[movement.type]} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    aria-label={`Move ${labels[movement.type]} down`}
                    disabled={index === motion.movements.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={11} />
                  </button>
                </div>
                <Switch
                  label={labels[movement.type]}
                  checked={movement.enabled}
                  onChange={(enabled) =>
                    update({
                      movements: motion.movements.map((m, i) =>
                        i === index ? { ...m, enabled } : m,
                      ),
                    })
                  }
                />
              </div>
            );
          })}
        </div>
        {available.length > 0 && (
          <div className="add-movement">
            <select
              aria-label="Movement to add"
              value={selected}
              onChange={(e) => setNewMove(e.target.value)}
            >
              {available.map((type) => (
                <option value={type} key={type}>
                  {labels[type]}
                </option>
              ))}
            </select>
            <button
              className="secondary"
              onClick={() =>
                update({
                  movements: [
                    ...motion.movements,
                    { type: selected, enabled: true },
                  ],
                })
              }
            >
              <Plus size={15} />
              Add movement
            </button>
          </div>
        )}
      </section>
      <section className="control-section">
        <h2>Playback</h2>
        <Segmented
          label="Playback"
          value={motion.playback}
          options={['loop', 'once']}
          onChange={(playback) => update({ playback })}
        />
      </section>
      <section className="control-section">
        <Range
          label="Duration"
          value={motion.duration}
          min={200}
          max={5000}
          step={50}
          unit=" ms"
          onChange={(duration) => update({ duration })}
        />
      </section>
      <section className="control-section">
        <Range
          label="Intensity"
          value={motion.intensity}
          min={0}
          max={100}
          unit="%"
          onChange={(intensity) => update({ intensity })}
        />
      </section>
      <Field label="Easing">
        <select
          value={motion.easing}
          onChange={(e) => update({ easing: e.target.value })}
        >
          {EASINGS.map((easing) => (
            <option value={easing} key={easing}>
              {easing.startsWith('cubic') ? 'Spring' : titleCase(easing)}
            </option>
          ))}
        </select>
      </Field>
      <p className="panel-tip">
        A little movement goes a long way.
        <br />
        Play your reaction to see it in action.
      </p>
    </div>
  );
}
