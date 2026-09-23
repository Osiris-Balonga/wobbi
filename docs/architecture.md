# Architecture

`createConfig()` builds the current project contract. `validateConfig()` rejects unknown fields, unsupported values, and incompatible combinations before import or export. This separation prevents external input from silently changing the requested drawing.

`renderParts(h, config, state)` assembles SVG geometry from three modules: the shape model, reaction effects, and main renderer. React, the standalone DOM adapter, and image exports call the same functions. Head details and accessories use attachment points specific to each shape.

`sampleCharacter(config, state, time, look)` is a pure function of time. `mountCharacter()` manages `requestAnimationFrame`, smoothed gaze tracking, offscreen pause, reduced motion preferences, and resource cleanup. Media exports reuse the same poses without depending on the editor pointer.

The studio keeps the last 40 changes. A continuous interaction, such as dragging in the color picker, produces transient previews followed by one history entry and one `localStorage` write.

Generators copy the validated preset, geometry, and engine into independent files. React and Vue projects use ES modules; the JavaScript delivery exposes rendering through a global API and includes a standalone demo. No remote call or Wobbi runtime is required after export.

`createSvg()` serializes an isolated SVG. PNG draws it on a canvas, GIF uses 54 frames at 15 frames per second, and WebM video uses `MediaRecorder`. Abort signals, Blob URLs, tracks, observers, and listeners are cleaned up on every exit path.
