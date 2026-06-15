const STORAGE_KEY = 'element-p2p-starred-prs';

export function getStarredIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function isStarred(prId: string): boolean {
  return getStarredIds().has(prId);
}

export function toggleStarred(prId: string): boolean {
  const ids = getStarredIds();
  const next = ids.has(prId);
  if (next) ids.delete(prId);
  else ids.add(prId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  return !next;
}

export function setStarred(prId: string, starred: boolean): void {
  const ids = getStarredIds();
  if (starred) ids.add(prId);
  else ids.delete(prId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}
