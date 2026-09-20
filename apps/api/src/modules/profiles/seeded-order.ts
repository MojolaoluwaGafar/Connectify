// Orders ids "randomly" but reproducibly for a given seed — the basis of the
// Discover "All" tab, which has to look shuffled yet never repeat or skip
// anyone while the user pages through.
//
// Each id gets its own sort key derived only from (seed, id). Unlike shuffling
// the whole list, an id's position relative to any other id never depends on
// what else is in the list, the order the database returned it in, or how many
// profiles exist. So a search narrowing the list, or a new profile appearing
// mid-session, can't reshuffle everyone else.

// FNV-1a: cheap, well-distributed 32-bit string hash.
function hash32(input: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// Extra mixing so ids that differ by one character (ObjectIds created
// back-to-back are nearly identical) still land far apart.
function mix32(value: number) {
  let x = value | 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}

export function orderBySeed(ids: string[], seed: number): string[] {
  const keyed = ids.map((id) => ({
    id,
    key: mix32(hash32(`${seed}:${id}`)),
  }));

  // id is the tiebreaker so equal keys still give a stable, total order.
  keyed.sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  return keyed.map((entry) => entry.id);
}
