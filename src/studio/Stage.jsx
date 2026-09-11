import { useState } from 'react';
import { Pause, Play, ChevronDown } from 'lucide-react';
import { Mascot } from '../mascot/Mascot.jsx';
import { specialLabel } from '../../packages/core/motion.js';
import { reactionLabels } from './catalog.js';
export function Stage({
  config,
  reaction,
  reactTo,
  playing,
  setPlaying,
  replay,
}) {
  const [more, setMore] = useState(false);
  const [hovered, setHovered] = useState(null);
  const states = [
    'idle',
    'happy',
    'thinking',
    'surprised',
    'sleeping',
    'special',
    ...(more ? ['loading', 'singing', 'sad', 'success', 'error'] : []),
  ];
  return (
    <main className="stage">
      <section
        className={
          'mascot-stage ' +
          (config.background.type === 'transparent' ? 'checkerboard' : '')
        }
        style={{
          backgroundColor:
            config.background.type === 'transparent'
              ? undefined
              : config.background.color,
        }}
        aria-label="Aperçu de votre mascotte"
        data-gaze-zone
      >
        <button
          className="icon-button pause-button"
          aria-label={playing ? 'Mettre en pause' : 'Animer la mascotte'}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="mascot-center">
          <button
            className="mascot-hit"
            aria-label="Faire réagir la mascotte"
            onClick={() =>
              reactTo(
                ['ears', 'bunny-ears', 'round-ears', 'halo'].includes(
                  config.head,
                )
                  ? 'special'
                  : 'happy',
              )
            }
          >
            <Mascot
              config={config}
              state={reaction}
              size={380}
              playing={playing}
              replay={replay}
              interactive
            />
          </button>
        </div>
      </section>
      <section className="reactions">
        <div className="reaction-heading">
          <h2>Faites-le réagir</h2>
          <button
            className="text-button"
            aria-expanded={more}
            onClick={() => setMore(!more)}
          >
            {more ? 'Moins' : 'Tout voir'} <ChevronDown size={13} />
          </button>
        </div>
        <div className="reaction-grid">
          {states.map((state) => (
            <button
              key={state}
              className="reaction-tile"
              aria-label={
                'Réaction : ' +
                (state === 'special'
                  ? specialLabel(config)
                  : reactionLabels[state])
              }
              aria-pressed={reaction === state}
              onPointerEnter={() => setHovered(state)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(state)}
              onBlur={() => setHovered(null)}
              onClick={() => reactTo(state)}
            >
              <Mascot
                config={config}
                state={state}
                size={80}
                playing={hovered === state && playing}
              />
              <span>
                {state === 'special'
                  ? specialLabel(config)
                  : reactionLabels[state]}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
