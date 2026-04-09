// Vox-style category color system — each category gets a consistent accent color
const PALETTE = [
  '#e62000', // Vox signature red-orange
  '#7c3aed', // purple
  '#0070cc', // blue
  '#059669', // green
  '#d97706', // amber
  '#db2777', // pink
  '#0891b2', // cyan
  '#dc2626', // red
  '#ea580c', // orange
  '#4f46e5', // indigo
];

export function getCategoryColor(categoryName: string): string {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
