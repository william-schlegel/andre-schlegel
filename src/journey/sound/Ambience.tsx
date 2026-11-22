import { useEffect } from 'react';
import { LOOKS, type LookName } from '../stage/looks';
import { setAmbience } from './sounds';

/** The room's sound follows the room's light. */
export function Ambience({ look, active }: { look: LookName; active: boolean }) {
  useEffect(() => {
    setAmbience(active ? (LOOKS[look].day > 0.5 ? 'day' : 'night') : null);
  }, [look, active]);
  useEffect(() => () => setAmbience(null), []);
  return null;
}
