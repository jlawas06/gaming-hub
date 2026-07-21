import type { Metadata } from "next";
import BingoCardGenerator from "./BingoCardGenerator";

export const metadata: Metadata = {
  title: "Bingo Card Generator",
};

export default function Page() {
  return <BingoCardGenerator />;
}
