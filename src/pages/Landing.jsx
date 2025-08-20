import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Check,
  CheckSquare,
  Timer,
  Shield,
  Cloud,
  Smartphone,
  ArrowRight,
  Github,
  Sparkles,
} from "lucide-react"

// 👉 How to use
// 1) Ensure Tailwind is set up in your app.
// 2) Drop this file into your React project and route it as the homepage.
// 3) Put a screenshot at /public/images/lifedash-hero.png (or change the src below).
// 4) Tweak the ACCENT color or hook it to your theme.

const ACCENT = "#22c55e" // Tailwind green-500 by default

export default function LandingPage() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <div
      className="min-h-screen bg-[#202123] text-white selection:bg-white/10"
      style={{ "--accent": ACCENT }}
    >
      <GradientBackdrop />
      <Navbar />
      <Hero />
      <Kickers />
      <Features />
      <HowItWorks />
      <Showcase />
      <Pricing />
      <FAQ />
      <Footer year={year} />
    </div>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#202123]/70 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-[var(--accent)] grid place-items-center shadow-[0_0_32px_-6px_var(--accent)]">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div className="leading-tight">
            <p className="text-xl font-semibold">LifeDash</p>
            <p className="text-xs text-white/60">Command center</p>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            <Github className="h-4 w-4" /> View GitHub
          </a>
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 active:opacity-80"
          >
            Get the app <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-14">
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
          >
            Your life, at a glance.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-lg text-white/70 max-w-xl"
          >
            LifeDash unifies <span className="text-white">stats</span>,
            <span className="text-white"> habits</span>, <span className="text-white">focus</span>
            , and <span className="text-white">money</span> in one clean, fast dashboard.
          </motion.p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-black hover:opacity-90 shadow-[0_10px_30px_-10px_var(--accent)]"
            >
              <Smartphone className="h-5 w-5" /> Install PWA / Android
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-base hover:bg-white/5"
            >
              Live demo
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--accent)]"/> No ads</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--accent)]"/> Works offline</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--accent)]"/> Private by design</li>
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10 blur-3xl opacity-60" aria-hidden>
            <div className="mx-auto h-72 w-72 rounded-full bg-[var(--accent)]/20" />
          </div>
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  )
}

function Kickers() {
  const items = [
    { icon: BarChart3, label: "Custom stats" },
    { icon: CheckSquare, label: "Daily habits" },
    { icon: Timer, label: "Focus minutes" },
    { icon: Cloud, label: "Sync ready" },
  ]
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/80">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Features() {
  const cards = [
    {
      title: "Track anything",
      desc: "Numbers, text, and timers. Create your own metrics and watch them grow.",
      icon: BarChart3,
    },
    {
      title: "Habit engine",
      desc: "Tap-to-complete streaks with gentle nudges—no noisy gamification.",
      icon: CheckSquare,
    },
    {
      title: "Laser focus",
      desc: "Built-in focus timer that feeds your stats automatically.",
      icon: Timer,
    },
    {
      title: "Insights",
      desc: "Trends and micro-charts to spot patterns across weeks and months.",
      icon: Sparkles,
    },
    {
      title: "Private by default",
      desc: "Your data stays on your device unless you choose to sync.",
      icon: Shield,
    },
    {
      title: "PWA + Android",
      desc: "Install on desktop or phone. Optimized for speed and low battery use.",
      icon: Smartphone,
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to run your day</h2>
          <p className="mt-3 text-white/70">A lightweight system that replaces five apps—without the clutter.</p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ title, desc, icon: Icon }) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={title}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--accent)]/15 grid place-items-center mb-4">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/70">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: "Create a stat or habit",
      desc: "Stocks, steps, study minutes, expenses—make it yours.",
    },
    {
      title: "Log in seconds",
      desc: "Quick Log and widgets make updates effortless.",
    },
    {
      title: "See the story",
      desc: "Micro-insights reveal trends and keep you consistent.",
    },
  ]

  return (
    <section id="how" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-10">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold">How it works</h2>
              <p className="mt-3 text-white/70 max-w-sm">LifeDash is designed for zero-friction logging and clear feedback loops.</p>
            </div>
            <ol className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-black font-bold">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-sm text-white/70">{s.desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function Showcase() {
  return (
    <section id="demo" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold">A dashboard that actually motivates</h2>
          <p className="mt-3 text-white/70">Minimal UI. Instant feedback. Your numbers look good here.</p>
        </div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center">
          <PhoneMockup large />
          <div className="space-y-5">
            <Blurb title="Zero-friction logging">
              Add a stat, set a habit, or start a focus timer—no menus inside menus.
            </Blurb>
            <Blurb title="Micro insights">
              Tiny charts and week views keep you honest without overwhelming you.
            </Blurb>
            <Blurb title="Works anywhere">
              PWA on desktop, Android via Capacitor. Fast, offline-first.
            </Blurb>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold">Simple, honest pricing</h2>
          <p className="mt-3 text-white/70">Start free. Upgrade when you want more power and sync.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <Plan
            name="Free"
            price="₹0"
            tagline="For individuals getting started"
            bullets={[
              "Unlimited custom stats",
              "Habit tracking",
              "Focus timer",
              "Local-only data",
            ]}
          />
          <Plan
            name="Pro"
            price="₹249/mo"
            highlight
            tagline="Advanced insights & cloud sync"
            bullets={[
              "Cloud backup & sync",
              "Advanced insights",
              "Priority updates",
              "Early features access",
            ]}
          />
        </div>

        <p className="text-center text-xs text-white/50 mt-4">Pricing is placeholder — update to match your offering.</p>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    {
      q: "Is my data private?",
      a: "Yes. LifeDash is offline-first. You control when to sync to the cloud.",
    },
    { q: "Does it work without internet?", a: "Absolutely. Everything is cached locally and works offline." },
    { q: "Can I import my existing data?", a: "CSV import/export is supported for most stats (customizable)." },
    { q: "Is there an iOS app?", a: "Use the PWA on iOS today. Native widget support is on the roadmap." },
  ]
  return (
    <section id="faq" className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-2 text-sm text-white/70">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer({ year }) {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/60 text-sm">© {year} LifeDash. Built with ❤️ by Monish.</p>
        <div className="flex items-center gap-3 text-sm">
          <a href="#privacy" className="text-white/60 hover:text-white">Privacy</a>
          <span className="text-white/20">•</span>
          <a href="#terms" className="text-white/60 hover:text-white">Terms</a>
          <span className="text-white/20">•</span>
          <a href="#contact" className="text-white/60 hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  )
}

// ——— UI bits ———
function GradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[var(--accent)]/15 blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[120px]" />
    </div>
  )
}

function PhoneMockup({ large = false }) {
  return (
    <div className={
      "relative mx-auto w-[290px] sm:w-[320px] " + (large ? "lg:w-[380px]" : "")
    }>
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-b from-[var(--accent)]/25 to-transparent blur-2xl" />
      <div className="rounded-[2.2rem] border border-white/10 bg-black/80 p-2 shadow-2xl">
        <div className="mx-auto h-[560px] w-[260px] sm:h-[600px] sm:w-[280px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#111]">
          {/* Notch */}
          <div className="mx-auto mt-2 h-5 w-28 rounded-b-2xl bg-black/70" />
          <img
            src="/images/lifedash-hero.png"
            alt="LifeDash app screenshot"
            className="h-[calc(100%-1.25rem)] w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

function Blurb({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{children}</p>
    </div>
  )
}

function Plan({ name, price, tagline, bullets, highlight = false }) {
  return (
    <div className={
      "relative rounded-3xl border bg-white/5 p-6 sm:p-8 " +
      (highlight
        ? "border-[var(--accent)]/60 shadow-[0_0_0_6px_rgba(34,197,94,0.05)]"
        : "border-white/10")
    }>
      {highlight && (
        <div className="absolute -top-3 left-6 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-black">Popular</div>
      )}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold">{name}</h3>
          <p className="mt-1 text-sm text-white/70">{tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold">{price}</p>
          <p className="text-xs text-white/60">incl. taxes</p>
        </div>
      </div>
      <ul className="mt-6 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-white/80">
            <Check className="mt-0.5 h-4 w-4 text-[var(--accent)]" /> {b}
          </li>
        ))}
      </ul>
      <a
        href="#download"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-black hover:opacity-90"
      >
        Get started <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  )
}
