import type { Metadata } from "next";
import BingoCallerGame from "./BingoCallerGame";

export const metadata: Metadata = {
  title: "Bingo Caller — JL Gaming Hub",
};

export default function Page() {
  return <BingoCallerGame />;
}
