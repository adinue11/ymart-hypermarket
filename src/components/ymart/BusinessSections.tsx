import { lazy, Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock3, Globe, Leaf, Mail, MessageCircle, Phone, ShoppingBag, Sparkles, Utensils, Check, ImagePlus, Trash2, LogIn, LogOut, Upload, X } from "lucide-react";
import { Reveal, toneAccent } from "./ImmersiveSections";
import { MagneticLink } from "./Chrome";
import { AH } from "@/components/fx/Heading";
import Burst from "@/components/fx/Burst";
import CountUp from "@/components/fx/CountUp";
const FloatingGallery = lazy(() => import("./FloatingGallery"));
import { faqItems, featuredProducts } from "@/lib/ymart-content";
import { outletSchedules } from "@/lib/ymart-offers";
import { openOfferCarousel } from "./OfferPosterCarousel";
import { supabase } from "@/lib/supabase";
import FloatingProductSearch from "./FloatingProductSearch";

type GalleryImage = {
  id: string;
  title: string | null;
  storage_path: string;
  link: string;
  sort_order: number;
};

const categoryTabs = ["Naimarmoola", "Cherkala new", "Nellikatta", "Cherkala"];

export function AboutSection() {
  const [galleryImages, setGalleryImages] = useState<
    { src: string; link: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      const { data, error } = await supabase
        .from("about_gallery_images")
        .select("id, title, storage_path, link, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to load about gallery:", error);
        return;
      }

      const images = (data ?? []).map((item: GalleryImage) => ({
        src: supabase.storage
          .from("about-gallery")
          .getPublicUrl(item.storage_path).data.publicUrl,
        link: "",
      }));

      if (!cancelled) {
        setGalleryImages(images);
      }
    }

    loadGallery();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="about-section section-light"
      id="about"
      data-nav-section
    >
      <div className="section-wrap about-section__layout">
        <div className="about-section__copy">
          <Reveal>
            <p className="eyebrow eyebrow--dark">
              <span>OUR STORY / IN THE MAKING</span>
              <span>THE YMART POINT OF VIEW</span>
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <AH as="h2">
              Not just where you shop
              <br />
              <em>How shopping feels.</em>
            </AH>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="about-section__lead">
              We imagine a modern kind of hypermarket — more choice, more
              convenience, more discovery, and a little more inspiration in
              every visit.
            </p>
            <p className="about-section__body">
              YMART brings four distinct hypermarkets together under one
              connected experience. Each destination has its own character,
              while sharing the same commitment to making everyday shopping
              better.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <a
              className="text-link text-link--dark"
              href="#locations"
            >
              <span>Explore the YMART vision</span>
              <ArrowUpRight size={15} />
            </a>
          </Reveal>
        </div>

        <Reveal className="about-object-wrap" delay={0.12}>
          <div className="about-gallery-frame">
            <Suspense fallback={<div aria-hidden="true" style={{ width: "100%", height: "100%" }} />}>
              <FloatingGallery
                interactive={false}
                images={galleryImages}
                background="#f2f0e7"
                cardWidth={185}
                cardHeight={235}
                rounded={10}
                speed={18}
                style={{ width: "100%", height: "100%" }}
              />
            </Suspense>
          </div>

          <p className="about-object-wrap__note">
            One brand. Four destinations. A POV all its own.
          </p>
        </Reveal>

        <div className="about-values">
          <Reveal>
            <div className="about-value">
              <span>01</span>
              <strong>More to discover</strong>
              <p>
                Thoughtfully organised spaces filled with everyday
                essentials, fresh finds, and something new around every
                corner.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="about-value">
              <span>02</span>
              <strong>Made for the everyday life</strong>
              <p>
                From groceries and fresh foods to household essentials and
                more — everything you need, brought together in one place.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="about-value">
              <span>03</span>
              <strong>Shop your way</strong>
              <p>
                Explore at your own pace, find what you need, discover
                something unexpected, and make every visit your own.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const tabAccents = [toneAccent.opal, toneAccent.solstice, toneAccent.verdant, toneAccent.prism];
const EASE = [0.22, 1, 0.36, 1] as const;

function Digits({ value }: { value: string }) {
  return (
    <span className="digits">
      {value.split("").map((ch, i) => (
        <span className="digit" key={i}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              style={{ display: "inline-block" }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

export function FeaturedSection() {
  const [selected, setSelected] = useState(0);
  const schedule = outletSchedules[selected];
  const offerDayLabel = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][schedule.day];
  const time = useWeeklyCountdown(schedule.day, schedule.hour, schedule.minute, schedule.closeHour, schedule.closeMinute);
  const activeProduct = featuredProducts[selected];
  const units = (time.status === "reveal" ? ["hours", "minutes", "seconds"] : ["days", "hours", "minutes", "seconds"]) as ("days" | "hours" | "minutes" | "seconds")[];

  return (
    <section className="featured-section" id="categories">
      <div className="section-wrap">
        <div className="featured-heading">
          <Reveal><p className="eyebrow"><span>THIS WEEK AT YMART</span><span>TEMPORARY OFFER PREVIEW</span></p></Reveal>
          <Reveal delay={0.06}><AH as="h2">Weekly offers.<br /><em>Ready to shop.</em></AH></Reveal>
          <Reveal delay={0.1}><p>Choose a hypermarket to see its weekly offer day. This temporary poster artwork will be replaced when official products and prices are confirmed.</p></Reveal>
        </div>
        <Reveal className="category-switcher" delay={0.12}>
          <span className="category-switcher__label">SELECT AN OUTLET TO VIEW ITS WEEKLY OFFER</span>
          <span className="category-switcher__label">OFFER DAY: {offerDayLabel.toUpperCase()}</span>
          <div className="category-switcher__tabs" role="group" aria-label="Featured category">
            {categoryTabs.map((tab, index) => (
              <button key={tab} className={selected === index ? "is-selected" : ""} onClick={() => setSelected(index)} type="button" aria-pressed={selected === index}>
                {selected === index && <motion.span className="tab-pill" layoutId="tab-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span>0{index + 1}</span>{tab}<ArrowUpRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </Reveal>
        <article className={`featured-product featured-product--${activeProduct.art}`}>
          <div
            className={`featured-product__art${time.status === "reveal" ? " is-offer-active" : ""}`}
            role={time.status === "reveal" ? "button" : undefined}
            tabIndex={time.status === "reveal" ? 0 : undefined}
            aria-label={time.status === "reveal" ? `Open ${schedule.name} offer posters` : undefined}
            onClick={() => {
              if (time.status === "reveal") openOfferCarousel(schedule.id);
            }}
            onKeyDown={(event) => {
              if (time.status === "reveal" && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                openOfferCarousel(schedule.id);
              }
            }}
          >
            <div className="product-orbit product-orbit--outer" aria-hidden="true" />
            <div className="product-orbit product-orbit--inner" aria-hidden="true" />
            <span className="product-art-label">{activeProduct.mark}</span>

            <Reveal className="offers-timer-block" delay={0.12}>
              <AnimatePresence mode="wait">
                {time.status === "reveal" ? (
                  <motion.div
                    key="offer-reveal"
                    className="offer-day-reveal"
                    initial={{ opacity: 0, scale: 0.72, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  >
                    <motion.span className="offer-day-reveal__spark" animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>✦</motion.span>
                    <span className="offers-timer-block__label"><span className="live-dot" /> THE WAIT IS OVER</span>
                    <h3>THIS WEEK'S<br />OFFER</h3>
                    <p>NOW LIVE AT THIS OUTLET</p>
                    <motion.div className="offer-day-reveal__line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.8 }} />
                    <span className="offers-timer-block__caption">YMART OFFER DAY IS LIVE</span>
                    <div className="countdown" role="timer" aria-label={`Offer ends in ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds`}>
                      {units.map((unit) => (
                        <span className="countdown__unit" key={unit}><strong><Digits value={time[unit]} /></strong><small>{unit.slice(0, 3).toUpperCase()}</small></span>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="upcoming" className="offer-day-countdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                    <span className="offers-timer-block__label"><span className="live-dot" />NEXT OFFER AT THIS OUTLET</span>
                    <div className="countdown" role="timer" aria-label={`Next weekly offer in ${time.days} days, ${time.hours} hours and ${time.minutes} minutes`}>
                      {units.map((unit) => (
                        <span className="countdown__unit" key={unit}><strong><Digits value={time[unit]} /></strong><small>{unit.slice(0, 3).toUpperCase()}</small></span>
                      ))}
                    </div>
                    <span className="offers-timer-block__caption">TIME UNTIL THIS OUTLET'S OFFER DAY</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
          <div className="featured-product__info">
            <AnimatePresence mode="wait">
              <motion.div key={activeProduct.title} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: EASE }}>
                <span className="eyebrow"><span>{activeProduct.category}</span><span>IN YMART</span></span>
                <h3>{activeProduct.title}<span>.</span></h3>
                <p>{activeProduct.copy}</p>
                </motion.div>
            </AnimatePresence>
          </div>
        </article>
        <p className="featured-footnote">TEMPORARY PROMOTIONAL ARTWORK · OFFICIAL PRODUCTS, PRICES AND TERMS TO BE ADDED BY YMART.</p>
      </div>
    </section>
  );
}

type OfferCountdown = {
  status: "upcoming" | "reveal" | "live";
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};


function useWeeklyCountdown(
  offerDay: number,
  offerHour: number,
  offerMinute: number,
  closeHour: number,
  closeMinute: number
): OfferCountdown {
  const [time, setTime] = useState<OfferCountdown>({
    status: "upcoming",
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();

      const startToday = new Date(now);
      startToday.setHours(offerHour, offerMinute, 0, 0);

      const endToday = new Date(now);
      endToday.setHours(closeHour, closeMinute, 0, 0);

      const isOfferDay = now.getDay() === offerDay;

      const isOfferActive =
        isOfferDay &&
        now.getTime() >= startToday.getTime() &&
        now.getTime() < endToday.getTime();

      let target: Date;
      let status: OfferCountdown["status"] = "upcoming";

      if (isOfferActive) {
        target = endToday;

        status = "reveal";
      } else {
        target = new Date(now);

        const daysUntil = (offerDay - now.getDay() + 7) % 7;
        target.setDate(now.getDate() + daysUntil);
        target.setHours(offerHour, offerMinute, 0, 0);

        if (target.getTime() <= now.getTime()) {
          target.setDate(target.getDate() + 7);
        }
      }

      const delta = Math.max(0, target.getTime() - now.getTime());
      const two = (value: number) => String(value).padStart(2, "0");

      setTime({
        status,
        days: two(Math.floor(delta / 86_400_000)),
        hours: two(Math.floor((delta % 86_400_000) / 3_600_000)),
        minutes: two(Math.floor((delta % 3_600_000) / 60_000)),
        seconds: two(Math.floor((delta % 60_000) / 1000)),
      });
    };

    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [offerDay, offerHour, offerMinute, closeHour, closeMinute]);

  return time;
}

type EventStatus = "upcoming" | "ongoing";

type YmartEvent = {
  id: string;
  title: string;
  description: string | null;
  status: EventStatus,
  image_url: string | null;
  created_at?: string;
};

export function EventsSection() {
  const [events, setEvents] = useState<YmartEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"upcoming" | "ongoing">("upcoming");
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadEvents() {
    const { data, error } = await supabase.from("ymart_events").select("id,title,description,status,image_url,created_at").order("created_at", { ascending: false });
    if (!error && data) setEvents(data.map((item) => ({ ...item, status: String(item.status).toLowerCase() as EventStatus })) as YmartEvent[]);
    setLoading(false);
  }

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setSessionEmail(data.session?.user.email ?? "");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionEmail(session?.user.email ?? ""));
    void loadEvents();
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const imageUrl = (path: string | null) => path ? supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl : "";

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setNotice(error.message);
    else { setPassword(""); setNotice("Signed in. You can now publish events."); }
  }

  async function publishEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) { setNotice("Add an event title first."); return; }
    if (image && (!image.type.startsWith("image/") || image.size > 8 * 1024 * 1024)) { setNotice("Choose a supported image smaller than 8 MB."); return; }
    setBusy(true); setNotice("");
    let imagePath: string | null = null;
    if (image) {
      const safeName = image.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
      imagePath = `${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("event-images").upload(imagePath, image, { cacheControl: "3600", upsert: false });
      if (uploadError) { setBusy(false); setNotice(`Image upload failed: ${uploadError.message}`); return; }
    }
    const { error } = await supabase.from("ymart_events").insert({ title: title.trim(), description: description.trim() || null, status, image_url: imageUrl });
    if (error) {
      if (imagePath) await supabase.storage.from("event-images").remove([imagePath]);
      setNotice(`Could not publish event: ${error.message}`);
    } else {
      setTitle(""); setDescription(""); setStatus("upcoming"); setImage(null); setNotice("Event published for visitors."); await loadEvents();
    }
    setBusy(false);
  }

  async function changeStatus(item: YmartEvent, nextStatus: EventStatus) {
    const { error } = await supabase.from("ymart_events").update({ status: nextStatus }).eq("id", item.id);
    if (error) setNotice(error.message); else { setNotice("Event status updated."); await loadEvents(); }
  }

  async function removeEvent(item: YmartEvent) {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    const { error } = await supabase.from("ymart_events").delete().eq("id", item.id);
    if (error) setNotice(error.message);
    else { if (item.image_url) await supabase.storage.from("event-images").remove([item.image_url]); setNotice("Event deleted."); await loadEvents(); }
  }

  return (
    <section className="events-section section-light" id="events">
      <div className="section-wrap">
        <div className="events-heading"><Reveal><p className="eyebrow eyebrow--dark"><span>EVENTS & PROMOTIONS</span></p><AH as="h2">A little room<br /><em>for what's next.</em></AH></Reveal><Reveal delay={0.1}><p>New things begin with a note. Official YMART announcements will live here.</p></Reveal></div>
        <AnimatePresence>{manageOpen && <motion.div className="event-manager" initial={{ opacity: 0, height: 0, y: 12 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -8 }}>
          {sessionEmail ? <>
            <div className="event-manager__top"><div><span className="event-manager__eyebrow">EVENT STUDIO</span><h3>Publish an announcement</h3><p>Signed in as {sessionEmail}</p></div><button type="button" className="event-manager__signout" onClick={async () => { await supabase.auth.signOut(); setNotice("Signed out."); }}><LogOut size={14} /> Sign out</button></div>
            <form className="event-manager__form" onSubmit={publishEvent}>
              <label>Event title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="e.g. Grand opening weekend" required /></label>
              <label>Short description<textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} placeholder="What should visitors know?" rows={3} /></label>
              <label>Handwritten status<select value={status} onChange={e => setStatus(e.target.value as "upcoming" | "ongoing")}><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option></select></label>
              <label className="event-upload-drop"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e: ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] ?? null)} /><ImagePlus size={23} /><strong>{image ? image.name : "Choose an event image"}</strong><span>JPG, PNG, WEBP or AVIF · up to 8 MB</span></label>
              {image && <div className="event-image-preview"><img src={URL.createObjectURL(image)} alt="Selected event preview" /><button type="button" onClick={() => setImage(null)} aria-label="Remove selected image"><X size={15} /></button></div>}
              <button className="event-publish-button" disabled={busy} type="submit"><Upload size={15} />{busy ? "Publishing…" : "Publish event"}</button>
            </form>
            {events.length > 0 && <div className="event-manage-list"><h4>Published events</h4>{events.map(item => <div className="event-manage-row" key={item.id}><span>{item.title}</span><select aria-label={`Status for ${item.title}`} value={item.status} onChange={e => void changeStatus(item, e.target.value as EventStatus)}><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option></select><button type="button" aria-label={`Delete ${item.title}`} onClick={() => void removeEvent(item)}><Trash2 size={15} /></button></div>)}</div>}
          </> : <form className="event-login" onSubmit={signIn}><div><LogIn size={20} /><h3>Admin sign-in</h3><p>Sign in with your existing YMART Supabase admin account to upload and manage event images.</p></div><label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label><button className="event-publish-button" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in to manage events"}</button></form>}
          {notice && <p className="event-manager__notice" role="status">{notice}</p>}
        </motion.div>}</AnimatePresence>
        <div className="event-grid">{loading ? <p className="event-empty">Loading announcements…</p> : events.length ? events.map((item, index) => <Reveal delay={index * 0.06} key={item.id}><article className="event-card event-card--published">{item.image_url && <img className="event-card__image" src={imageUrl(item.image_url)} alt={item.title} loading="lazy" />}<span className="event-card__number">{String(index + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}</span><span className={`event-card__status event-card__status--${item.status}`}><span>{item.status === "ongoing" ? "ONGOING NOW" : "COMING SOON"}</span><strong aria-label={item.status === "ongoing" ? "Ongoing" : "Upcoming"}>{item.status === "ongoing" ? "Ongoing" : "Upcoming"}</strong></span><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</article></Reveal>) : <div className="event-empty"><Sparkles size={20} /><p>New moments are on the way.</p><span>Official YMART events will appear here.</span></div>}</div>
      </div>
    </section>
  );
}

export function CustomerExperienceSection() {
  const values = [
    { number: "01", title: "Atmosphere, with a point of view", copy: "Each destination is designed to be remembered—not to look like the one before." },
    { number: "02", title: "Familiar, seen freshly", copy: "Everyday discovery takes center stage, with space for the unexpected." },
    { number: "03", title: "Your way through the day", copy: "Choose a destination to match your mood, time and idea of a good visit." },
  ];
  return (
    <section className="experience-section" id="experience">
      <div className="section-wrap">
        <Reveal><p className="eyebrow"><span>WHY CHOOSE YMART</span><span>MADE FOR YOUR MOMENTS</span></p><AH as="h2">It's more than<br />the <em>things you need.</em></AH></Reveal>
        <div className="experience-copy"><Reveal><p className="experience-copy__lead">A good visit has a feeling. At Ymart, every destination begins with Feelings.</p></Reveal><div className="experience-values">{values.map((value, index) => <Reveal delay={index * 0.06} key={value.number}><article className="experience-value"><span>{value.number}<i /></span><div><h3>{value.title}</h3><p>{value.copy}</p></div><ArrowDownRight size={17} /></article></Reveal>)}</div></div>
        <div className="experience-signoff"><span>THE YMART EXPERIENCE</span><span>THOUGHTFUL BY DESIGN <i /> DIFFERENT BY NATURE</span></div>
      </div>
    </section>
  );
}

export function DeliverySection() {
  return (
    <section className="delivery-section">
      <div className="section-wrap delivery-section__layout">
        <Reveal><p className="eyebrow"><span>DELIVERY / COMING INTO FOCUS</span></p><AH as="h2">Your needs,<br /><em>coming closer.</em></AH></Reveal>
        <Reveal className="delivery-section__aside" delay={0.08}><div className="delivery-mark"><Globe size={25} strokeWidth={1.15} /><span></span></div><p>Delivery availability, locations, timing and fees have not been confirmed. Official details will be added here when they are ready.</p><a href="#contact" className="delivery-link">Ask us about delivery <ArrowUpRight size={15} /></a></Reveal>
      </div>
    </section>
  );
}

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
  };

  return (
    <section className="contact-section section-light" id="contact" data-nav-section>
      <div className="section-wrap">
        <Reveal><p className="eyebrow eyebrow--dark"><span>CONTACT / THE OPEN DOOR</span><span>SAY HELLO TO YMART</span></p></Reveal>
        <div className="contact-heading"><Reveal><AH as="h2">Let's make<br /><em>something of a day.</em></AH></Reveal><Reveal delay={0.08}><p>For a question, a visit or the first note in a new conversation—this is where it begins.</p></Reveal></div>
        <Reveal className="contact-cta-row" delay={0.06}>
          <MagneticLink href="#stores" variant="dark">Explore Stores</MagneticLink>
          <MagneticLink href="#locations" variant="line">Visit YMART</MagneticLink>
          <MagneticLink href="#contact-form" variant="line">Contact Us</MagneticLink>
        </Reveal>
        <div className="contact-layout">
          <div className="contact-details">
            <Reveal><div className="contact-detail"><span><Phone size={16} /></span><div><small>PHONE</small><strong><a href="tel:7277271177">7277271177</a> · customer care</strong></div></div></Reveal>
            <Reveal delay={0.04}><div className="contact-detail"><span><Mail size={16} /></span><div><small>EMAIL</small><strong><a href="mailto:info@ymart.co.in">info@ymart.co.in</a></strong></div></div></Reveal>
            <Reveal delay={0.08}><div className="contact-detail"><span><Clock3 size={16} /></span><div><small>BUSINESS HOURS</small><strong>9AM to 10PM</strong></div></div></Reveal>
            <Reveal delay={0.16}><div className="contact-social"><span>FOLLOW YMART</span><div><a href="https://www.facebook.com/YmartHypermarket" target="_blank" rel="noopener noreferrer" aria-label="YMART on Facebook"><span>FB</span></a><a href="https://twitter.com/YmartL" target="_blank" rel="noopener noreferrer" aria-label="YMART on X (Twitter)"><span>X</span></a><a href="https://www.youtube.com/channel/UC6Ui_xmKeeMzavjbvTf2Vkw" target="_blank" rel="noopener noreferrer" aria-label="YMART on YouTube"><span>YT</span></a></div></div></Reveal>
          </div>
          <Reveal className="contact-form-wrap" delay={0.12}>
            <form className="contact-form" id="contact-form" onSubmit={handleSubmit} onChange={() => setSubmitted(false)}>
              <div className="contact-form__top"><span>01 — YOUR NOTE</span><span className="contact-form__live"><i /></span></div>
              <label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" type="text" placeholder="How should we say hello?" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              <label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              <label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" rows={4} placeholder="What's on your mind?" required />
              <button className={`form-submit${submitted ? " is-sent" : ""}`} type="submit"><span>{submitted ? "Note received" : "Send a note"}</span>{submitted ? <Check size={16} /> : <ArrowUpRight size={16} />}</button>
              {submitted && <Burst className="burst--contact" />}
              <p className="form-note" aria-live="polite">{submitted ? `Thank you${name ? `, ${name}` : ""}. This preview is not connected; your message was not sent.` : "no message stores!, Backend adding later."}</p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ item, index }: { item: { question: string; answer: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 0.05}>
      <div className="faq-item" {...(open ? { "data-open": "" } : {})}>
        <button className="faq-q" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.question}</strong>
          <span className="faq-item__toggle"><ArrowUpRight size={16} /></span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div className="faq-a" key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} style={{ overflow: "hidden" }}>
              <p>{item.answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export function FAQSection() {
  return (
    <section className="faq-section" id="faq">
      <div className="section-wrap faq-layout">
        <div className="faq-intro"><Reveal><p className="eyebrow"><span>GOOD TO KNOW</span><span>FAQ</span></p><AH as="h2">Curious<br />about <em>something?</em></AH><p>A few quick notes for the world behind the worlds.</p><a href="#contact" className="text-link text-link--light"><span>Still have a question?</span><ArrowUpRight size={15} /></a></Reveal></div>
        <div className="faq-list">{faqItems.map((item, index) => <FAQItem item={item} index={index} key={item.question} />)}</div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [subscribed, setSubscribed] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubscribed(true);
  };
  return (
    <section className="community-section section-light">
      <div className="section-wrap community-grid">
        <Reveal id="wa-group" className="wa-card" delay={0.04}>
          <div className="community-card__top"><span>KEEP THE CONVERSATION CLOSE</span><MessageCircle size={18} /></div>
          <div className="wa-card__symbol"><MessageCircle size={34} strokeWidth={1.2} /><span className="wa-card__spark">+</span></div>
          <AH as="h2">Join the<br /><em>YMART circle.</em></AH>
          <p>Official WhatsApp group details are coming soon. We will add the verified invitation here.</p>
          <a className="community-button community-button--dark" href="#contact"><span>WhatsApp group link to follow</span><ArrowUpRight size={15} /></a>
          <span className="community-card__foot">WhatsApp GROUP / INVITE URL NOT YET PROVIDED</span>
        </Reveal>
        <Reveal id="newsletter" className="newsletter-card" delay={0.1}>
          <div className="community-card__top"><span>OCCASIONAL NOTES FROM YMART</span><Mail size={17} /></div>
          <div className="newsletter-card__icon"><Leaf size={27} strokeWidth={1.2} /></div>
          <AH as="h2">A note<br /><em>worth opening.</em></AH>
          <p>Updates from the One Brand, when there is something new to share.</p>
          <form className="newsletter-form" onSubmit={handleSubmit} onChange={() => setSubscribed(false)}>
            <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" name="email" autoComplete="email" placeholder="Your email address" required />
            <button type="submit" aria-label="Sign up for the YMART newsletter">{subscribed ? <Check size={19} /> : <ArrowRight size={19} />}</button>
            {subscribed && <Burst className="burst--news" />}
          </form>
          <p className="newsletter-status" aria-live="polite">{subscribed ? "Preview only — the newsletter is not connected and no subscription was recorded." : "This preview sign-up is not connected to a mailing list."}</p>
          <span className="community-card__foot">NEWSLETTER / PREVIEW INTERACTION ONLY</span>
        </Reveal>
      </div>
    </section>
  );
}
