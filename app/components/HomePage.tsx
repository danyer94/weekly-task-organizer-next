"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import heroImage from "../../images/homepage-admin-hero-dark_new.png";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Layers3,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function PrimaryLink({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`hp-btn hp-btn--primary ${className}`}>
      {children}
      <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="hp-feature-card reveal">
      <div className="hp-feature-card__icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    const handleScroll = () => {
      nav?.classList.toggle("is-scrolled", window.scrollY > 16);
    };

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
      { threshold: 0.12 },
    );

    window.addEventListener("scroll", handleScroll, { passive: true });
    reveals.forEach((element) => observer.observe(element));
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <header ref={navRef} className="hp-nav" role="banner">
        <div className="hp-nav__inner">
          <Link
            href="/"
            className="hp-brand"
            aria-label="Weekly Task Organizer home"
          >
            <Image
              src="/images/calendar-icon.png"
              alt=""
              width={36}
              height={36}
              priority
            />
            <span>Weekly Task Organizer</span>
          </Link>

          <nav className="hp-nav__center" aria-label="Main navigation">
            <a href="#product">Product</a>
            <a href="#workflow">Workflow</a>
            <a href="#results">Results</a>
          </nav>

          <div className="hp-nav__right">
            <button
              className={`hp-menu ${mobileOpen ? "is-open" : ""}`}
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
              <span />
            </button>
            <Link href="/auth/login" className="hp-login-link">
              Log in
            </Link>
            <PrimaryLink href="/auth/login" className="hp-nav-cta">
              Open board
            </PrimaryLink>
          </div>
        </div>
      </header>

      <div className={`hp-mobile-panel ${mobileOpen ? "is-open" : ""}`}>
        <a href="#product" onClick={() => setMobileOpen(false)}>
          Product
        </a>
        <a href="#workflow" onClick={() => setMobileOpen(false)}>
          Workflow
        </a>
        <a href="#results" onClick={() => setMobileOpen(false)}>
          Results
        </a>
        <PrimaryLink href="/auth/login">Open board</PrimaryLink>
      </div>

      <section className="hp-hero" aria-label="Weekly Task Organizer hero">
        <div
          className="hp-hero__desk hp-hero__desk--keyboard"
          aria-hidden="true"
        />
        <div className="hp-hero__desk hp-hero__desk--clip" aria-hidden="true" />
        <div className="hp-hero__inner">
          <div className="hp-hero__copy reveal is-in">
            <p className="hp-kicker">
              <CheckCircle2 size={16} aria-hidden="true" />
              Built for real weekly operations
            </p>
            <h1>Run the week from one calm admin board.</h1>
            <p>
              Plan by ISO week, group priorities, schedule calendar events, and
              keep Ramon&apos;s team synced without chasing scattered task
              lists.
            </p>
            <div className="hp-hero__actions">
              <PrimaryLink href="/auth/login" className="hp-btn--large">
                Open this week
              </PrimaryLink>
              <a href="#product" className="hp-btn hp-btn--ghost">
                See the workflow
              </a>
            </div>
          </div>

          <div className="hp-proof-row reveal" aria-label="Product highlights">
            <span>
              <CalendarCheck size={16} aria-hidden="true" />
              Calendar sync
            </span>
            <span>
              <Clock3 size={16} aria-hidden="true" />
              Carry-over tasks
            </span>
            <span>
              <Bell size={16} aria-hidden="true" />
              Daily summaries
            </span>
          </div>

          <div id="product" className="hp-product-stage reveal">
            <div className="hp-product-stage__halo" aria-hidden="true" />
            <figure className="hp-product-frame">
              <Image
                src={heroImage}
                alt="Weekly Task Organizer admin dashboard showing the Friday operations board with task groups, timeline, quick actions, and weekly stats."
                width={1920}
                height={1080}
                sizes="(max-width: 640px) 820px, min(1120px, 100vw)"
                priority
              />
            </figure>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="hp-section hp-section--workflow"
        aria-label="Workflow"
      >
        <div className="hp-section__inner hp-split">
          <div className="reveal">
            <p className="hp-section-kicker">Admin-first workflow</p>
            <h2>Less ceremony. More operational control.</h2>
          </div>
          <div className="hp-feature-grid">
            <FeatureCard
              icon={<Layers3 size={22} strokeWidth={1.7} />}
              title="One weekly source of truth"
            >
              Switch days, see priority groups, and keep the current week
              visible without rebuilding the board every morning.
            </FeatureCard>
            <FeatureCard
              icon={<CalendarCheck size={22} strokeWidth={1.7} />}
              title="Tasks become calendar events"
            >
              Add timed or all-day events from the same task surface, then sync
              changes back when the calendar moves.
            </FeatureCard>
            <FeatureCard
              icon={<Send size={22} strokeWidth={1.7} />}
              title="Daily summaries are ready to send"
            >
              Admin quick actions turn the selected day into a clean email, SMS,
              or WhatsApp summary for the team.
            </FeatureCard>
          </div>
        </div>
      </section>

      <section
        id="results"
        className="hp-section hp-section--results"
        aria-label="Results"
      >
        <div className="hp-section__inner hp-results-card reveal">
          <div>
            <p className="hp-section-kicker">Why it feels faster</p>
            <h2>Every control is where the admin already works.</h2>
          </div>
          <div className="hp-results-list">
            <p>
              <ShieldCheck size={18} aria-hidden="true" />
              Separate admin and user views keep responsibility clear.
            </p>
            <p>
              <Sparkles size={18} aria-hidden="true" />
              Timeline, list, and grouped priority modes adapt to the day.
            </p>
            <p>
              <Clock3 size={18} aria-hidden="true" />
              Unfinished work carries forward instead of disappearing.
            </p>
          </div>
        </div>
      </section>

      <section className="hp-cta" aria-label="Call to action">
        <div className="hp-cta__inner reveal">
          <p className="hp-section-kicker">Start with today</p>
          <h2>Open the board and plan the next operational week.</h2>
          <PrimaryLink href="/auth/login" className="hp-btn--large">
            Sign in to Weekly Task Organizer
          </PrimaryLink>
        </div>
      </section>

      <footer className="hp-footer" role="contentinfo">
        <p>&copy; 2026 Weekly Task Organizer</p>
        <nav aria-label="Legal links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </>
  );
}
