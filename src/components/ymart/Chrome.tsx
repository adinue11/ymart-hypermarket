import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { AH } from "@/components/fx/Heading";

const navItems = [
  { label: "Home", id: "home" },
  { label: "Offers", id: "categories" },
  { label: "Stores", id: "stores" },
  { label: "About", id: "about" },
  { label: "Events", id: "events" },
  { label: "Partner", id: "partner" },
  { label: "Contact", id: "contact" },
  { label: "FAQ", id: "faq" },
];

export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`wordmark${inverse ? " wordmark--inverse" : ""}`} href="#home" aria-label="YMART — home">
      <svg className="wordmark__symbol" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="16" stroke="currentColor" strokeWidth="1.25" opacity=".52" />
        <path d="M8 8L19 20L30 8M19 20V31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>YMART<span className="wordmark__period">.</span></span>
    </a>
  );
}

export function MagneticLink({
  href,
  children,
  variant = "lime",
  className = "",
  icon = true,
  onClick,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: "lime" | "glass" | "line" | "dark";
  className?: string;
  icon?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [, setLocation] = useLocation();
  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    const internal = href.startsWith("/") && !href.startsWith("//");
    if (!internal || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setLocation(href);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    event.currentTarget.style.setProperty("--mag-x", `${dx * 0.08}px`);
    event.currentTarget.style.setProperty("--mag-y", `${dy * 0.08}px`);
  };
  const resetPointer = () => {
    ref.current?.style.setProperty("--mag-x", "0px");
    ref.current?.style.setProperty("--mag-y", "0px");
  };

  return (
    <a
      ref={ref}
      href={href}
      className={`action-link action-link--${variant} ${className}`}
      aria-label={ariaLabel}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <span>{children}</span>
      {icon && <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />}
    </a>
  );
}

export function Navigation() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const targets = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);
    if (!("IntersectionObserver" in window) || targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) setActive(visible.target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.12, 0.3, 0.55] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`site-header${open ? " site-header--open" : ""}`}>
      <div className="site-header__inner">
        <Wordmark />
        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              href={`#${item.id}`}
              className={active === item.id ? "is-active" : ""}
              aria-current={active === item.id ? "location" : undefined}
              key={item.id}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-visit" href="#locations" onClick={closeMenu}>
          <span>Find your place</span><ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!open}>
        {navItems.map((item, index) => (
          <a href={`#${item.id}`} onClick={closeMenu} key={item.id} tabIndex={open ? 0 : -1}>
            <span className="mobile-nav__number">0{index + 1}</span>{item.label}<ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
        <a className="mobile-nav__find" href="#locations" onClick={closeMenu} tabIndex={open ? 0 : -1}>
          Find your place <ArrowRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Wordmark inverse />
          <p>Everyday, elsewhere.</p>
        </div>
        <div className="site-footer__links">
          
        <div>
          <span>THE EXPERIENCE</span>
          <a href="#offers">Weekly offers</a>
          <a href="#about">Our story</a>
          <a href="#events">Events</a>
          <a href="#partner">Partner with us</a>
          <a href="#faq">Questions</a>
          <Link href="/careers">Careers</Link>
        </div>

          <div><span>KEEP IN TOUCH</span><a href="#contact">Contact YMART</a><a href="#wa-group">WhatsApp Group</a><a href="#newsletter">Newsletter</a></div>
        </div>
        <a className="back-top" href="#home" aria-label="Back to top"><ArrowUpRight size={18} /></a>
      </div>
      <AH as="h2" className="site-footer__giant" chars>YMART</AH>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} YMART. The next everyday starts here.</span>
        <span>Designed by ........................................................</span>
      </div>
    </footer>
  );
}
