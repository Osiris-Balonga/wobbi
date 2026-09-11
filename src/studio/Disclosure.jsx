import { useEffect, useState } from 'react';

export function DisclosurePanel({ open, id, className = '', children }) {
  const [retained, setRetained] = useState(open);

  useEffect(() => {
    if (open && !retained) {
      const retain = window.setTimeout(() => setRetained(true), 0);
      return () => window.clearTimeout(retain);
    }
    if (!open && retained) {
      const release = window.setTimeout(() => setRetained(false), 260);
      return () => window.clearTimeout(release);
    }
    return undefined;
  }, [open, retained]);

  const finishClosing = (event) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'grid-template-rows' &&
      !open
    )
      setRetained(false);
  };

  return (
    <div
      id={id}
      className={`disclosure-motion ${open ? 'is-open' : ''} ${className}`}
      aria-hidden={!open}
      inert={!open}
      onTransitionEnd={finishClosing}
    >
      {(open || retained) && (
        <div className="disclosure-motion-clip">{children}</div>
      )}
    </div>
  );
}
