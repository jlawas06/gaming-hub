export const COLS = [
  { letter: "B", cls: "b", min: 1, max: 15 },
  { letter: "I", cls: "i", min: 16, max: 30 },
  { letter: "N", cls: "n", min: 31, max: 45 },
  { letter: "G", cls: "g", min: 46, max: 60 },
  { letter: "O", cls: "o", min: 61, max: 75 },
] as const;

export type CellValue = number | "FREE";

export interface CardData {
  id: string;
  /* columns[col][row] — center of the N column is FREE */
  columns: CellValue[][];
}

// Pick `n` unique numbers in [min, max]
function pick(n: number, min: number, max: number): number[] {
  const pool: number[] = [];
  for (let v = min; v <= max; v++) pool.push(v);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// Build one card: 5 columns x 5 rows, center is FREE
export function buildCard(): CardData {
  const columns: CellValue[][] = COLS.map((c) =>
    pick(c.letter === "N" ? 4 : 5, c.min, c.max)
  );
  columns[2].splice(2, 0, "FREE");
  return { id: crypto.randomUUID(), columns };
}

export function buildCards(count: number): CardData[] {
  return Array.from({ length: count }, () => buildCard());
}
