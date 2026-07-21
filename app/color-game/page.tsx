import type { Metadata } from "next";
import ColorGame from "./ColorGame";

export const metadata: Metadata = {
  title: "Color Game",
};

export default function Page() {
  return <ColorGame />;
}
