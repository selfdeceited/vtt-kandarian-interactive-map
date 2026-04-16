export const PATH_COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#9b59b6', // purple
  '#f39c12', // amber
  '#1abc9c', // teal
  '#e91e63', // pink
  '#ff7043', // deep orange
  '#00bcd4', // cyan
  '#8bc34a', // light green
];

/** Deterministic color derived from path id */
export function getPathColor(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PATH_COLORS[hash % PATH_COLORS.length];
}
