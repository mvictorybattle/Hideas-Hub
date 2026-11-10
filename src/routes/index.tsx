import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { PodcastSection } from "@/components/PodcastSection";
import { IntroBeam } from "@/components/IntroBeam";
import { CartButton } from "@/components/CartDrawer";
import { EventsSection } from "@/components/EventsSection";
import { TeamSection } from "@/components/TeamSection";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { CeremonyGuide, GuideButton } from "@/components/CeremonyGuide";
import { FaqSection } from "@/components/FaqSection";
import { ContactSection } from "@/components/ContactSection";
import { Newsletter } from "@/components/Newsletter";
import { Testimonials } from "@/components/Testimonials";
import { SocialLinks } from "@/components/SocialLinks";
import { CONTACT_EMAIL } from "@/data/hideas";


import { CircleCards } from "@/components/CircleCards";
import { SpotifySection } from "@/components/SpotifySection";
import heroBanner from "@/assets/banner-forest.webp";
import heroBannerPhone from "@/assets/banner-forest-phone.webp";
import goldenFrequencyWide from "@/assets/golden-frequency-wide.webp";
import goldenFrequencyPhone from "@/assets/golden-frequency-phone.webp";
import privateCeremonyImg from "@/assets/private-ceremony.webp";
import talkMedicineBanner from "@/assets/talk-medicine-banner.webp";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hideas — Silent Disco Meditation, Breathwork & Cacao" },
      {
        name: "description",
        content:
          "Hideas hosts meditation, breathwork and cacao ceremonies in a silent-disco format in British Columbia. Ceremony bookings only — no physical products for sale.",
      },
      { property: "og:title", content: "Hideas — Silent Disco Ceremonies" },
      {
        property: "og:description",
        content:
          "Hosted meditation, breathwork and cacao ceremonies in a silent-disco format. Explore events, private sittings and the Hideas podcast.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hideas — Silent Disco Ceremonies" },
      {
        name: "twitter:description",
        content:
          "Hosted meditation, breathwork and cacao ceremonies in a silent-disco format. Explore events, private sittings and the Hideas podcast.",
      },
    ],
  }),
  component: Home,
});

const NAV = [
  { id: "ceremony", label: "Ceremony" },
  { id: "calendar", label: "Events" },
  { id: "podcast", label: "Podcast" },
  { id: "spotify", label: "Spotify" },
  { id: "about", label: "About" },
  { id: "connect", label: "Connect" },
];





function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e?.isIntersecting && setShown(true),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, shown } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Marquee({ words, tone }: { words: string[]; tone: "marigold" | "magenta" | "jade" }) {
  const bg =
    tone === "marigold" ? "bg-marigold" : tone === "magenta" ? "bg-magenta" : "bg-jade";
  const fg = tone === "marigold" ? "text-ink" : "text-cream";
  const row = [...words, ...words, ...words, ...words];
  return (
    <div className={`${bg} ${fg} overflow-hidden border-y-2 border-ink py-2`}>
      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((w, i) => (
          <span
            key={i}
            className="font-display text-xl uppercase tracking-tight sm:text-2xl"
          >
            {w}
            <span className="ml-8 opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({
  n,
  children,
  tone = "text-marigold",
}: {
  n: string;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${tone}`}>
      <span className="mr-3 inline-block bg-magenta px-2 py-0.5 text-cream">{n}</span>
      {children}
    </p>
  );
}


function Home() {
  return (
    <div className="grain relative min-h-screen bg-ink text-cream [overflow-x:clip]">
      <IntroBeam />
      <CeremonyGuide />
      <WhatsAppWidget />
      <div className="grain-overlay pointer-events-none fixed inset-0 z-50" aria-hidden="true" />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b-2 border-cream/15 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 sm:px-8">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-display text-2xl uppercase tracking-tight text-cream">
              H!DEAS
            </span>
            <span className="hidden font-script text-lg text-marigold sm:inline">
              socials + ceremony
            </span>
          </a>
          <div className="order-2 flex items-center gap-3 md:order-3">
          <CartButton />
          <a
            href="#calendar"
            className="border-2 border-ink bg-marigold px-4 py-2 font-display text-sm uppercase text-ink shadow-[4px_4px_0_var(--magenta)] transition-transform hover:-translate-y-0.5 md:order-3"
          >
            Sit with us
          </a>
          </div>
          <nav className="order-3 -mx-5 w-screen overflow-x-auto border-t-2 border-cream/10 px-5 py-2 md:order-2 md:mx-0 md:w-auto md:overflow-visible md:border-0 md:p-0">
            <ul className="flex items-center gap-5 whitespace-nowrap md:gap-6">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/70 transition-colors hover:text-marigold"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>


      {/* BANNER */}
      <picture>
        <source media="(max-width: 640px)" srcSet={heroBannerPhone} width={960} height={960} />
        <img
          src={heroBanner}
          alt="Guests in headphones meditating in a forest clearing beneath a swirling, luminous sky"
          width={2160}
          height={864}
          fetchPriority="high"
          decoding="async"
          className="block w-full border-b-2 border-ink"
        />
      </picture>

      {/* HERO */}
      <section id="top" className="relative px-5 pt-10 pb-16 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="relative">
              {/* Matches the H!DEAS wordmark in the menu bar. The subheading is sized in em so it
                  always spans the same width as H!DEAS (Caveat at 0.3325em matches tightly tracked Anton). */}
              <h1 className="inline-block text-[clamp(4.5rem,26vw,10rem)] text-cream">
                <span className="sr-only">Hideas</span>
                <span aria-hidden="true" className="block font-display uppercase leading-[0.9] tracking-tight">
                  H!DEAS
                </span>
                <span className="mt-[0.06em] block whitespace-nowrap font-script text-[0.3325em] leading-none text-marigold">
                  Socials and Ceremony
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream/80">
                Hideas creates intimate gatherings for people who want more from their time.
                Alongside our curated social events, we host small, private ceremonies centred
                on the safe and thoughtful use of plant medicine. We don&apos;t sell plant
                medicine. We design the experience, and we work only with experienced
                practitioners who operate properly and within the law. Our guests often describe
                leaving lighter and clearer, with a renewed sense of purpose and a quiet release
                of patterns that no longer serve them.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#circles"
                  className="border-2 border-ink bg-ember px-6 py-3 font-display text-lg uppercase text-cream shadow-[6px_6px_0_var(--marigold)] transition-transform hover:-translate-y-1"
                >
                  Join a circle
                </a>
                <a
                  href="#private"
                  className="border-2 border-cream/40 px-6 py-3 font-display text-lg uppercase text-cream transition-colors hover:border-marigold hover:text-marigold"
                >
                  Private ceremonies
                </a>
              </div>
              <p className="mt-6 font-script text-2xl text-marigold">
                come as you are, leave lighter ✦
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CIRCLES */}
      <section id="circles" className="relative scroll-mt-24 px-5 pb-20 sm:px-8">
        <Reveal>
          <CircleCards />
        </Reveal>
      </section>

      <Marquee
        tone="marigold"
        words={[
          "Socials and Ceremony",
          "Nature Loves Courage",
          "Golden Frequency",
          "Token of Gratitude",
          "Private Ceremony",
          "Hideas.ca",
        ]}
      />

      {/* CEREMONY */}
      <section id="ceremony" className="torn-top relative -mt-1 bg-cream px-5 py-20 text-ink sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <figure className="relative overflow-hidden border-2 border-ink shadow-[9px_9px_0_var(--ink)]">
              <picture>
                <source media="(max-width: 640px)" srcSet={goldenFrequencyPhone} width={1000} height={750} />
                <img
                  src={goldenFrequencyWide}
                  alt="Guests in glowing headphones lying on cushions in a log cabin beneath a painted, geometric ceiling"
                  width={1792}
                  height={1008}
                  loading="lazy"
                  className="block w-full"
                />
              </picture>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/60 to-transparent" aria-hidden="true" />
              <h2 className="poster absolute inset-x-0 top-0 p-4 text-center text-2xl text-cream sm:p-8 sm:text-5xl lg:p-10 lg:text-7xl">
                Headphones on, sitting comfortably. <span className="text-marigold">The journey is about to begin.</span>
              </h2>
            </figure>
          </Reveal>

          <div className="mt-14">
            <Reveal delay={120}>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-ink/80">
                Set and setting are everything. Before the journey begins, every guest is
                settled in comfortably and knows exactly what to expect. We walk you through
                each step, from finding a headphone volume that feels just right for your
                intention to knowing who is there to support you. Nothing is rushed, and
                nothing is left to chance, so you can let go and be fully present.
              </p>

              <div className="mt-10 grid gap-5 lg:grid-cols-2">
                {[
                  { k: "Intention Setting", v: "Every meaningful journey starts with a clear intention. Before the ceremony begins, we take a quiet moment for you to name what you'd like to bring into your journey, whether that's clarity, healing, or simply letting go. Then we turn to the breath. Not deep or forced, just steady and aware. With each focused breath, your intention settles a little deeper, gently carrying you into the ceremony." },
                  { k: "Ceremony", v: "This is the heart of it all. A single ceremony holds several journeys, often three, four, five or more in one practice. With your intention set and your breath steady, there's nothing left to do but let go. Experienced sitters are with you throughout, holding space and looking after you, so you can drift into the experience completely. This is where the real depth of the practice unfolds." },
                  { k: "Notebook", v: "As you return from the journey, insights often arrive with remarkable clarity. That's why we invite you to bring a notebook. Many guests reach for theirs straight away, capturing what they experienced, what it meant to them, and the new ways of thinking it opened up. It's a little like writing down a dream before it fades, except these reflections tend to stay vivid, becoming something you can return to long after the ceremony ends." },
                  { k: "Integration Circle", v: "Once you've had time to write or simply sit quietly with your experience, you rejoin the group in the same circle where the ceremony began, only now everyone has returned to the same shared reality. This is a time to share, to listen, and to draw out the deeper meaning of each journey together. Something special happens here. Individual experiences weave into one another, and the circle becomes a force of one." },
                ].map((s, i) => (
                  <div
                    key={s.k}
                    className="flex flex-col gap-3 border-2 border-ink bg-paper p-5 shadow-[5px_5px_0_var(--ink)]"
                    style={{ transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)` }}
                  >
                    <span className="font-display text-3xl uppercase text-ember">{s.k}</span>
                    <span className="text-base leading-relaxed text-ink/75">{s.v}</span>
                  </div>
                ))}
              </div>

            </Reveal>
          </div>
        </div>
      </section>

      {/* CALENDAR */}
      <section id="calendar" className="relative bg-paper px-5 py-20 text-ink sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                 <SectionLabel n="02">Socials + Ceremonies Calendar</SectionLabel>
                <h2 className="poster mt-5 text-6xl sm:text-8xl">
                   Gather with <span className="text-ember">us</span>
                </h2>
              </div>
              <p className="max-w-sm text-ink/70">
                Small circles, held across British Columbia — Kelowna, Vernon, Kamloops,
                Vancouver and Lake Country. Seats are limited on purpose.
              </p>
            </div>
            <div className="mt-8 border-t-2 border-cream/15 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-marigold">Follow the process</p>
              <div className="mt-4"><SocialLinks tone="dark" /></div>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <EventsSection />
          </Reveal>
          <Reveal delay={140} className="mt-10">
            <div className="border-2 border-ink bg-cream p-6 shadow-[8px_8px_0_var(--jade)] sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember">
                    Before you sit with us
                  </p>
                  <h3 className="poster mt-2 text-3xl sm:text-4xl">
                   Everything you need, <span className="text-ember">before you arrive</span>
                  </h3>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-ink/70">
                  Every seat is screened. Reserving holds your place — it&rsquo;s confirmed
                  once a facilitator reads your intake. Your form opens in your email app
                  so you can review it before sending.
                </p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { tab: "prepare" as const, t: "Prepare & integrate", s: "Eat, rest, pack, land" },
                  { tab: "safety" as const, t: "Safety & screening", s: "Meds, health, honesty" },
                  { tab: "intake" as const, t: "Intake form", s: "5 min · confidential" },
                  { tab: "policy" as const, t: "Booking & refunds", s: "Deposits & changes" },
                ].map((b, i) => (
                  <GuideButton
                    key={b.tab}
                    tab={b.tab}
                    className="border-2 border-ink bg-paper p-4 text-left transition-transform hover:-translate-y-1 hover:shadow-[5px_5px_0_var(--magenta)]"
                  >
                    <span className="block font-display text-lg uppercase leading-tight">
                      {b.t}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                      {b.s}
                    </span>
                    <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
                      Open {i === 2 ? "form" : "guide"} →
                    </span>
                  </GuideButton>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>




      {/* PRIVATE & COUPLES SITTINGS */}
      <section id="private" className="relative bg-jade px-5 py-20 text-cream sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <SectionLabel n="03">Private &amp; Couples Sittings</SectionLabel>
              <h2 className="poster mt-5 text-6xl sm:text-8xl">
                The ceremony
                <br />
                <span className="text-marigold">made for you.</span>
              </h2>
              <p className="mt-7 max-w-lg text-xl leading-relaxed text-cream/85">
                We bring the ceremony to you. Whether it&apos;s just for you, for you and your
                partner, or for a small group you trust, every private ceremony is shaped around
                your intention and your space. We currently offer private ceremonies in Vancouver
                and throughout Central BC.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {["Private", "Couples", "Small groups", "Vancouver", "Central BC"].map((t) => (
                  <span
                    key={t}
                    className="border-2 border-ink bg-cream px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a href="#book-private" className="mt-9 inline-block border-2 border-ink bg-marigold px-6 py-3 font-display text-lg uppercase text-ink shadow-[6px_6px_0_var(--magenta)] transition-transform hover:-translate-y-1">
                Book a private sitting
              </a>
            </Reveal>

            <Reveal delay={100} className="relative">
              <div className="sticker rotate-[2.5deg]">
                <img
                  src={privateCeremonyImg}
                  alt="A guest resting on a daybed in headphones while a sitter watches over them in a colourful room"
                  width={1280}
                  height={720}
                  loading="lazy"
                  className="w-full object-cover"
                />
              </div>
              <div className="tape -bottom-3 right-12 rotate-[-4deg]" aria-hidden="true" />
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee
        tone="magenta"
        words={["Meditation", "Breathwork", "Cacao ceremonies", "Silent disco"]}
      />

      {/* PODCAST */}
      <section
        id="podcast"
        className="torn-both relative bg-marigold px-5 py-24 text-ink sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionLabel n="04" tone="text-ink">Hideas Episodes</SectionLabel>
            <div className="relative mt-6 overflow-hidden border-2 border-ink shadow-[9px_9px_0_var(--ink)]">
              <img
                src={talkMedicineBanner}
                alt="Collage of figures from psychedelic history including Terence McKenna and Timothy Leary"
                width={1680}
                height={945}
                loading="lazy"
                className="block w-full"
              />
              <h2 className="talk-medicine-title absolute bottom-[29%] left-[61%] right-[3.5%] top-[25%] flex items-center justify-center text-center font-talk text-[clamp(1.9rem,8.75vw,7.8rem)] leading-[0.92] text-ink">
                <span>
                  Talk
                  <br />
                  Medicine
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal className="relative">
              <p className="max-w-sm text-lg leading-relaxed text-ink/75">
                 Useful information, the history of psychedelic medicine, and ceremony
                 playlists gathered under one roof.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <PodcastSection />
            </Reveal>
          </div>
        </div>
      </section>

      {/* SPOTIFY */}
      <section id="spotify" className="relative bg-ink-soft px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel n="05">Hideas Playlists</SectionLabel>
                <h2 className="poster mt-5 text-6xl text-cream sm:text-8xl">
                  <span className="text-jade">Spotify</span>
                </h2>
              </div>
              <p className="max-w-sm text-cream/70">
                The soundscapes behind Nature Loves Courage and Golden Frequency. Press play
                and listen right here.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <SpotifySection />
          </Reveal>
        </div>
      </section>


      {/* ABOUT */}
      <section id="about" className="relative bg-ink px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <SectionLabel n="06">About Hideas</SectionLabel>
            <p className="poster mt-8 text-4xl leading-[0.95] text-cream sm:text-6xl">
              Celebrating the virtues of{" "}
              <span className="text-marigold">gratitude</span> and{" "}
              <span className="text-magenta">intention setting</span> through hosted meditation, breathwork, and cacao ceremonies
              in a silent-disco format.
            </p>
          </Reveal>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="relative bg-ink-soft px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel n="07">Who Holds The Circle</SectionLabel>
                <h2 className="poster mt-5 text-6xl text-cream sm:text-8xl">
                  The <span className="text-marigold">Facilitators</span>
                </h2>
              </div>
              <p className="max-w-sm text-cream/70">
                 Victory brings years of experience holding live rooms; Salar brings visual
                 storytelling and a long personal relationship with plant-medicine culture.
                 Together they balance structure with imagination, helping people feel held
                 without making the experience feel clinical.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <TeamSection />
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="voices" className="relative bg-ink px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel n="08">Audio Feedback</SectionLabel>
          </Reveal>
          <Reveal delay={80} className="mt-8">
            <Testimonials />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative bg-ink-soft px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel n="09">Questions</SectionLabel>
                <h2 className="poster mt-5 text-6xl text-cream sm:text-8xl">
                  Ask <span className="text-marigold">anything</span>
                </h2>
              </div>
              <p className="max-w-sm text-cream/70">
                 It is normal to have questions before joining a circle. Here are clear,
                 honest answers about safety, cost, preparation, and what the experience is like.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <FaqSection />
          </Reveal>
        </div>
      </section>

      {/* CONNECT — contact, socials & newsletter */}
      <section id="connect" className="relative bg-ink px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel n="10">Contact &amp; Socials</SectionLabel>
                <h2 className="poster mt-5 text-6xl text-cream sm:text-8xl">
                  Follow + <span className="text-magenta">contact</span>
                </h2>
              </div>
              <p className="max-w-sm text-cream/70">
                Message us, follow along, or join the mailing list if you&rsquo;re not ready
                to sit yet.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-12">
            <ContactSection />
          </Reveal>
          <Reveal delay={140} className="mt-12">
            <Newsletter />
          </Reveal>
        </div>
      </section>

      <Marquee
        tone="jade"
        words={["Socials + Ceremonies", "Nature Loves Courage", "Meditation + Breathwork + Cacao"]}
      />



      {/* FOOTER */}
      <footer className="bg-ink px-5 py-14 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-display text-5xl uppercase text-cream">H!DEAS</span>
            <p className="mt-2 font-script text-2xl text-marigold">socials + ceremony</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 block font-mono text-[11px] uppercase tracking-[0.2em] text-cream/60 hover:text-marigold"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-marigold"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-7xl font-mono text-[10px] uppercase tracking-[0.22em] text-cream/40">
          © {new Date().getFullYear()} Hideas — made by hand, in colour. Nothing here is
          medical advice.
        </p>

      </footer>
    </div>
  );
}
