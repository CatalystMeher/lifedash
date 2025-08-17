import React from "react";
import { Play, Youtube, ArrowRight, Video, Menu } from "lucide-react";

/**
 * PR ki Duniya — Single‑file React Website (Light Theme)
 * Style: YouTube‑inspired light UI, red accents, elegant fonts
 * Fonts: Inter (UI) + Playfair Display (headings) via Google Fonts
 */

const YT_CHANNEL_ID = "UCu6pR0YEOSkrMwsUg3NV0ag"; // PR ki Duniya (canonical channel URL)
const YT_UPLOADS_PLAYLIST = "UUu6pR0YEOSkrMwsUg3NV0ag"; // Uploads playlist derived from the channel ID
const YT_CHANNEL_URL = "https://www.youtube.com/c/PRkiDuniya";
const YT_SUBSCRIBE_URL = "https://www.youtube.com/c/PRkiDuniya?sub_confirmation=1";

function NavBar() {
  const [open, setOpen] = React.useState(false);
  const links = [
    { href: "#home", label: "Home" },
    { href: "#videos", label: "Videos" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-red-600 text-white grid place-items-center">
            <Youtube className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">PR ki Duniya</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-slate-600 hover:text-slate-900 transition">
              {l.label}
            </a>
          ))}
          <a
            href={YT_SUBSCRIBE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-3 py-1.5 hover:bg-red-700 transition"
          >
            <Play className="h-4 w-4" /> Subscribe
          </a>
        </nav>
        <button className="md:hidden p-2 rounded-xl border border-slate-200 bg-white" onClick={() => setOpen((v) => !v)}>
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-3">
            <a href="#home" className="text-slate-700 hover:text-slate-900">Home</a>
            <a href="#videos" className="text-slate-700 hover:text-slate-900">Videos</a>
            <a href="#about" className="text-slate-700 hover:text-slate-900">About</a>
            <a href="#contact" className="text-slate-700 hover:text-slate-900">Contact</a>
            <a href={YT_SUBSCRIBE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-3 py-1.5 hover:bg-red-700 transition w-max">
              <Play className="h-4 w-4" /> Subscribe
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_-10%,rgba(255,0,0,0.06),rgba(0,0,0,0)_60%)]" />
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Welcome to <span className="text-slate-700">PR ki Duniya</span>
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Short, uplifting videos, tips & everyday hacks. Watch the latest uploads and dive into curated playlists — all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={YT_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 transition"
              >
                <Youtube className="h-5 w-5 text-red-600" /> Watch on YouTube
              </a>
              <a
                href="#videos"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 hover:bg-black transition"
              >
                Browse Videos <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center max-w-md">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-2xl font-semibold">Daily</div>
                <div className="text-xs text-slate-600">Fresh Shorts</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-2xl font-semibold">Tips</div>
                <div className="text-xs text-slate-600">Life & Home</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-2xl font-semibold">Playlists</div>
                <div className="text-xs text-slate-600">Curated Themes</div>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              {/* Uploads playlist — always newest first */}
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/videoseries?list=${YT_UPLOADS_PLAYLIST}`}
                title="PR ki Duniya – Latest Uploads"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="absolute -bottom-4 -right-4 hidden md:block rounded-2xl bg-white text-slate-900 px-3 py-2 shadow">
              <div className="flex items-center gap-2 text-sm font-semibold"><Video className="h-4 w-4 text-red-600" /> Latest uploads</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Videos() {
  return (
    <section id="videos" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Watch Videos</h2>
        <a
          href={`${YT_CHANNEL_URL}/videos`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          See all on YouTube →
        </a>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Main continuous playlist player */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="aspect-video w-full overflow-hidden rounded-2xl">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/videoseries?list=${YT_UPLOADS_PLAYLIST}`}
              title="PR ki Duniya – Uploads Playlist"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="p-3 text-sm text-slate-600">Autoplays newest uploads from the channel.</div>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href={`${YT_CHANNEL_URL}/shorts`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition shadow-sm"
          >
            <div className="text-lg font-semibold">Shorts</div>
            <p className="mt-1 text-sm text-slate-600">Bite‑sized, daily inspiration.</p>
            <div className="mt-8 inline-flex items-center gap-2 text-sm group-hover:translate-x-0.5 transition">
              Open <ArrowRight className="h-4 w-4" />
            </div>
          </a>
          <a
            href={`${YT_CHANNEL_URL}/playlists`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition shadow-sm"
          >
            <div className="text-lg font-semibold">Playlists</div>
            <p className="mt-1 text-sm text-slate-600">Curated themes & series.</p>
            <div className="mt-8 inline-flex items-center gap-2 text-sm group-hover:translate-x-0.5 transition">
              Open <ArrowRight className="h-4 w-4" />
            </div>
          </a>
          <a
            href={`${YT_CHANNEL_URL}/streams`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition sm:col-span-2 shadow-sm"
          >
            <div className="text-lg font-semibold">Live</div>
            <p className="mt-1 text-sm text-slate-600">Catch streams and premiere events.</p>
            <div className="mt-8 inline-flex items-center gap-2 text-sm group-hover:translate-x-0.5 transition">
              Open <ArrowRight className="h-4 w-4" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">About the Channel</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            PR ki Duniya shares practical life tips, self‑care ideas, home hacks and short motivational clips — mostly in Marathi/Hinglish — crafted to brighten your day. Explore the latest uploads above or jump into themed playlists.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">• Family‑friendly content</li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">• Shorts + long videos</li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">• Regular updates</li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">• Simple, helpful hacks</li>
          </ul>
          <div className="mt-6">
            <a href={YT_SUBSCRIBE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition">
              <Play className="h-4 w-4" /> Subscribe on YouTube
            </a>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
            <div className="font-display text-5xl font-semibold">PR</div>
            <div className="mt-2 text-slate-600">ki Duniya</div>
            <p className="mt-6 text-sm text-slate-600">
              This website is a lightweight homepage for the channel — fast, mobile‑first and easy to customize.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Contact</h2>
        <p className="mt-3 text-slate-600">For collaborations and business enquiries, reach out via the YouTube channel page or DM on your preferred platform.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={YT_CHANNEL_URL + "/about"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 transition">
            <Youtube className="h-5 w-5 text-red-600" /> Channel About
          </a>
          <a href={YT_CHANNEL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 transition">
            <Video className="h-5 w-5 text-red-600" /> Open Channel
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} PR ki Duniya • Unofficial fan site</div>
          <div className="flex items-center gap-4">
            <a href={YT_CHANNEL_URL} target="_blank" rel="noreferrer" className="hover:text-slate-900 inline-flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-600" /> YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PRKiDuniyaSite() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Elegant fonts (Inter + Playfair Display) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        :root{--font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji'; --font-display:'Playfair Display', Georgia, 'Times New Roman', serif;}
        .font-display{font-family:var(--font-display);} 
        .font-sans{font-family:var(--font-sans);} 
      `}</style>
      <NavBar />
      <Hero />
      <Videos />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
