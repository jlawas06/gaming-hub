import { fredoka, archivo } from "../fonts";

export default function BingoCardGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${fredoka.variable} ${archivo.variable}`}>{children}</div>
  );
}
