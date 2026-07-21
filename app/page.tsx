import Link from "next/link";
import s from "./page.module.css";

const booths = [
  {
    className: s["booth-bingo"],
    token: "🎱",
    title: "BINGO Caller",
    description:
      "Host a bingo night with automatic number calling, a spoken caller, and a live board that tracks every ball drawn.",
    facts: "75 balls · voice caller · keyboard controls",
    href: "/bingo-caller",
  },
  {
    className: s["booth-cards"],
    token: "🖨️",
    title: "Bingo Cards",
    description:
      "Generate fresh 75-ball bingo cards for the whole table, then print them or dab numbers right on screen.",
    facts: "75-ball cards · tap to dab · print-ready",
    href: "/bingo-card-generator",
  },
  {
    className: s["booth-dice"],
    token: "🎲",
    title: "Color Dice",
    description:
      "Roll three color dice, watch them tumble across the felt, and track which colors the booth favors.",
    facts: "3 dice · 6 colors · live color board",
    href: "/color-game",
  },
  {
    className: s["booth-deal"],
    token: "💼",
    title: "Deal or No Deal",
    description:
      "Pick a case, open the rest, and stare down the banker's offers on the way to the top prize.",
    facts: "26 cases · banker offers · $200 top prize",
    href: "/deal-or-no-deal",
  },
];

export default function Home() {
  return (
    <div className={s.page}>
      <main className={s.midway}>
        <header className={s.marquee}>
          <p className={s["marquee-eyebrow"]}>Open nightly · four booths</p>
          <h1 className={s["marquee-title"]}>JL Gaming Hub</h1>
          <div className={s["bulb-string"]} aria-hidden="true"></div>
          <p className={s["marquee-subtitle"]}>
            Pick a booth and play — right in your browser.
          </p>
        </header>

        <section className={s.booths} aria-label="Games">
          {booths.map((booth) => (
            <article
              key={booth.href}
              className={`${s.booth} ${booth.className}`}
            >
              <div className={s.awning} aria-hidden="true"></div>
              <div className={s["booth-body"]}>
                <div className={s["booth-token"]} aria-hidden="true">
                  {booth.token}
                </div>
                <h2 className={s["booth-title"]}>{booth.title}</h2>
                <p className={s["booth-description"]}>{booth.description}</p>
                <p className={s["booth-facts"]}>{booth.facts}</p>
                <Link href={booth.href} className={s["booth-play"]}>
                  Play now
                </Link>
              </div>
            </article>
          ))}
        </section>

        <footer className={s["midway-footer"]}>
          <p>© JL Gaming Hub · built for game night</p>
        </footer>
      </main>
    </div>
  );
}
