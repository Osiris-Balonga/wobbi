import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useStudio } from '../../src/studio/useStudio.js';

it('commits a colour drag as one undoable change', () => {
  const { result } = renderHook(() => useStudio());
  act(() => {
    result.current.preview({ color: '#112233' });
    result.current.preview({ color: '#445566' });
    result.current.preview({ color: '#778899' });
    result.current.commitPreview();
  });
  expect(result.current.config.color).toBe('#778899');
  act(() => result.current.undo());
  expect(result.current.config.color).toBe('#111218');
  expect(result.current.canUndo).toBe(false);
});
