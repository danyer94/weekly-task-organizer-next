"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  LayoutGrid,
  CalendarCheck,
  Users,
  Zap,
  Bell,
  RefreshCw,
  Shield,
} from "lucide-react";

/* ─── Magnetic Button (perpetual micro-interaction) ─── */
function MagneticButton({
  children,
  className,
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = "translate(0, 0)";
      el.style.transition =
        "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
    };

    const handleMouseEnter = () => {
      el.style.transition = "transform 0.1s ease-out";
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  const Tag = href ? Link : "a";
  const extra = href ? { href } : {};

  return (
    // @ts-expect-error -- Link vs a union
    <Tag
      ref={ref}
      className={`hp-btn hp-btn--primary ${className || ""}`}
      style={{ display: "inline-flex" }}
      onClick={onClick}
      {...extra}
    >
      {children}
    </Tag>
  );
}

/* ─── Loading Skeleton ─── */
function HeroSkeleton() {
  return (
    <div className="hp-hero-skeleton" aria-busy="true" aria-label="Loading">
      <div className="hp-skeleton hp-skeleton--title" />
      <div className="hp-skeleton hp-skeleton--lede" />
      <div className="hp-skeleton hp-skeleton--btn" />
    </div>
  );
}

/* ─── Main Component ─── */
export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    /* Nav frost on scroll */
    const handleScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    /* Reveal on scroll — one orchestrated entrance */
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  /* ─── Error state ─── */
  if (hasError) {
    return (
      <div className="hp-error" role="alert">
        <h2>Something went wrong</h2>
        <p>Please refresh the page or try again later.</p>
        <Link href="/" className="hp-btn hp-btn--primary">
          Reload
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ─── Nav · N1b SaaS three-section ─── */}
      <header ref={navRef} className="hp-nav" role="banner">
        <div className="hp-nav__inner">
          <span className="hp-nav__brand">Weekly Task Organizer</span>
          <nav className="hp-nav__center" aria-label="Main navigation">
            <a href="#features" className="hp-nav__link">
              Features
            </a>
            <a href="#advantages" className="hp-nav__link">
              Advantages
            </a>
          </nav>
          <div className="hp-nav__right">
            <button
              className={`hp-hamburger ${mobileOpen ? "is-open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <span className="hp-hamburger__line" />
              <span className="hp-hamburger__line" />
              <span className="hp-hamburger__line" />
            </button>
            <MagneticButton href="/auth/login">Sign in</MagneticButton>
          </div>
        </div>
      </header>

      {/* ─── Mobile nav ─── */}
      <div className={`hp-nav__mobile ${mobileOpen ? "is-open" : ""}`}>
        <a
          href="#features"
          className="hp-nav__link"
          onClick={() => setMobileOpen(false)}
        >
          Features
        </a>
        <a
          href="#advantages"
          className="hp-nav__link"
          onClick={() => setMobileOpen(false)}
        >
          Advantages
        </a>
        <MagneticButton href="/auth/login" onClick={() => setMobileOpen(false)}>
          Sign in
        </MagneticButton>
      </div>

      {/* ─── Hero · Marquee ─── */}
      <section className="hp-hero" aria-label="Hero">
        <div className="hp-hero__inner">
          <h1 className="hp-hero__display">
            Plan your week.
            <br />
            Ship your tasks.
          </h1>
          <p className="hp-hero__lede">
            Organize tasks by ISO week, group by priority, sync with Google
            Calendar. One view for your entire week.
          </p>
          <div className="hp-hero__cta">
            <MagneticButton href="/auth/login" className="hp-btn--lg">
              Get started
            </MagneticButton>
          </div>
        </div>
        <div className="hp-hero__accent" aria-hidden="true" />
      </section>

      {/* ─── Features · Bento 2.0 ─── */}
      <section id="features" className="hp-section" aria-label="Features">
        <div className="hp-section__inner">
          <h2 className="hp-section__title reveal">What you can do</h2>
          <div className="hp-features">
            {/* Span-2 wide card */}
            <div
              className="hp-feature hp-feature--wide reveal"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              <Calendar
                className="hp-feature__icon"
                size={24}
                strokeWidth={1.5}
              />
              <h3 className="hp-feature__title">Weekly Planning</h3>
              <p className="hp-feature__desc">
                Organize tasks by ISO week and day. Drag, reorder, and carry
                over unfinished items to the next day automatically. See your
                entire week at a glance with priority grouping.
              </p>
            </div>
            <div
              className="hp-feature reveal"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              <LayoutGrid
                className="hp-feature__icon"
                size={20}
                strokeWidth={1.5}
              />
              <h3 className="hp-feature__title">Priority Grouping</h3>
              <p className="hp-feature__desc">
                Group tasks by high, medium, or low priority. See your most
                important work at a glance.
              </p>
            </div>
            <div
              className="hp-feature reveal"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              <CalendarCheck
                className="hp-feature__icon"
                size={20}
                strokeWidth={1.5}
              />
              <h3 className="hp-feature__title">Calendar Sync</h3>
              <p className="hp-feature__desc">
                Sync tasks with Google Calendar. Create all-day or timed events
                directly from your task list.
              </p>
            </div>
            <div
              className="hp-feature reveal"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <Users
                className="hp-feature__icon"
                size={20}
                strokeWidth={1.5}
              />
              <h3 className="hp-feature__title">Admin &amp; User Views</h3>
              <p className="hp-feature__desc">
                Admins manage the full task list. Users see their own completion
                view. Multi-tenant by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Advantages · Bento 2.0 ─── */}
      <section
        id="advantages"
        className="hp-section hp-section--alt"
        aria-label="Advantages"
      >
        <div className="hp-section__inner">
          <h2 className="hp-section__title reveal">Why this app</h2>
          <div className="hp-advantages">
            {/* Span-2 wide card */}
            <div
              className="hp-advantage hp-advantage--wide reveal"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              <Zap
                className="hp-advantage__icon"
                size={24}
                strokeWidth={1.5}
              />
              <h3 className="hp-advantage__title">Real-time Sync</h3>
              <p className="hp-advantage__desc">
                Changes reflect instantly across all connected devices. No manual
                refresh, no lost updates. Stay in sync whether you are on your
                phone, tablet, or desktop.
              </p>
            </div>
            <div
              className="hp-advantage reveal"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              <Bell
                className="hp-advantage__icon"
                size={20}
                strokeWidth={1.5}
              />
              <h3 className="hp-advantage__title">Daily Notifications</h3>
              <p className="hp-advantage__desc">
                Get email and SMS summaries of your daily tasks. Never miss a
                deadline.
              </p>
            </div>
            <div
              className="hp-advantage reveal"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              <RefreshCw
                className="hp-advantage__icon"
                size={20}
                strokeWidth={1.5}
              />
              <h3 className="hp-advantage__title">Task Carry-over</h3>
              <p className="hp-advantage__desc">
                Unfinished tasks automatically move to the next day. Your list
                stays current without manual work.
              </p>
            </div>
            <div
              className="hp-advantage reveal"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <Shield
                className="hp-advantage__icon"
                size={20}
                strokeWidth={1.5}
              />
              <h3 className="hp-advantage__title">Multi-tenancy</h3>
              <p className="hp-advantage__desc">
                Each user has their own workspace. Personal settings, tasks, and
                calendar integrations per account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA · Split layout ─── */}
      <section className="hp-cta-section" aria-label="Call to action">
        <div className="hp-cta-section__inner reveal">
          <h2 className="hp-cta-section__title">
            Start organizing your week
          </h2>
          <MagneticButton href="/auth/login" className="hp-btn--lg">
            Sign in to begin
          </MagneticButton>
        </div>
      </section>

      {/* ─── Footer · Ft2 inline single line ─── */}
      <footer className="hp-footer" role="contentinfo">
        <p>
          &copy; 2026 &middot; Weekly Task Organizer &middot; Built with
          Next.js + Firebase
        </p>
      </footer>
    </>
  );
}
