import type { Metadata } from "next";
import DealOrNoDeal from "./DealOrNoDeal";

export const metadata: Metadata = {
  title: "Deal or No Deal — JL Gaming Hub",
};

export default function Page() {
  return <DealOrNoDeal />;
}
