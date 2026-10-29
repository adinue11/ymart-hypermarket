import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Minus, Plus, Search, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import { hypermarkets } from "@/lib/ymart-content";
import { Wordmark } from "@/components/ymart/Chrome";
import "./StorePage.css";

type Unit = "piece" | "kg";
type Product = { id: string; name: string; ml: string; aliases: string[]; category: string; unit: Unit; price: number; note: string; emoji: string; tone: string };
type CartLine = { product: Product; quantity: number };

// Starter catalogue for interaction/UI testing. Replace with each outlet's live inventory feed when available.
const products: Product[] = [
  { id: "banana", name: "Robusta Banana", ml: "റോബസ്റ്റ വാഴപ്പഴം", aliases: ["pazham", "vazhapazham", "ethapazham", "banana", "bananaa", "പഴം", "വാഴപ്പഴം", "ഏത്തപ്പഴം"], category: "Fresh produce", unit: "kg", price: 48, note: "Fresh fruit", emoji: "🍌", tone: "yellow" },
  { id: "tomato", name: "Tomato", ml: "തക്കാളി", aliases: ["thakkali", "thakkali", "tomato", "തക്കാളി"], category: "Fresh produce", unit: "kg", price: 36, note: "Everyday essential", emoji: "🍅", tone: "coral" },
  { id: "onion", name: "Onion", ml: "സവാള", aliases: ["savala", "ulli", "valli ulli", "onion", "സവാള", "ഉള്ളി"], category: "Fresh produce", unit: "kg", price: 42, note: "Kitchen staple", emoji: "🧅", tone: "lilac" },
  { id: "potato", name: "Potato", ml: "ഉരുളക്കിഴങ്ങ്", aliases: ["urulakizhangu", "urulakizhangu", "potato", "ഉരുളക്കിഴങ്ങ്"], category: "Fresh produce", unit: "kg", price: 38, note: "Versatile favourite", emoji: "🥔", tone: "sand" },
  { id: "rice", name: "Matta Rice", ml: "മട്ട അരി", aliases: ["matta ari", "ari", "chorinulla ari", "rice", "മട്ട അരി", "അരി"], category: "Pantry", unit: "kg", price: 64, note: "Kerala pantry pick", emoji: "🍚", tone: "cream" },
  { id: "milk", name: "Milk — 1 L", ml: "പാൽ — 1 ലിറ്റർ", aliases: ["paal", "pal", "milk", "പാൽ"], category: "Dairy & chilled", unit: "piece", price: 38, note: "1 litre pack", emoji: "🥛", tone: "blue" },
  { id: "egg", name: "Farm Eggs", ml: "മുട്ട", aliases: ["mutta", "motta", "egg", "eggs", "മുട്ട"], category: "Dairy & chilled", unit: "piece", price: 7, note: "Price per egg · adjust quantity", emoji: "🥚", tone: "cream" },
  { id: "bread", name: "Sandwich Bread", ml: "ബ്രെഡ്", aliases: ["bread", "bred", "ബ്രെഡ്"], category: "Bakery", unit: "piece", price: 42, note: "One loaf", emoji: "🍞", tone: "sand" },
  { id: "coconut", name: "Coconut", ml: "തേങ്ങ", aliases: ["thenga", "thengaa", "coconut", "തേങ്ങ"], category: "Fresh produce", unit: "piece", price: 35, note: "Sold per piece", emoji: "🥥", tone: "green" },
  { id: "chicken", name: "Fresh Chicken", ml: "കോഴിയിറച്ചി", aliases: ["kozhi", "kozhi irachi", "chicken", "കോഴിയിറച്ചി", "കോഴി"], category: "Fresh counter", unit: "kg", price: 220, note: "Confirm cut preference on WhatsApp", emoji: "🍗", tone: "coral" },
  { id: "soap", name: "Bathing Soap", ml: "കുളിക്കുന്ന സോപ്പ്", aliases: ["soap", "kulikkunna soap", "സോപ്പ്"], category: "Home essentials", unit: "piece", price: 32, note: "Per bar", emoji: "🧼", tone: "blue" },
  { id: "oil", name: "Coconut Oil — 1 L", ml: "വെളിച്ചെണ്ണ — 1 ലിറ്റർ", aliases: ["velichenna", "enna", "coconut oil", "വെളിച്ചെണ്ണ", "എണ്ണ"], category: "Pantry", unit: "piece", price: 185, note: "1 litre bottle", emoji: "🫗", tone: "yellow" },
];
const categories = ["All items", ...Array.from(new Set(products.map((p) => p.category)))];
const money = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const whatsappNumber = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_YMART_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

function ScrollSlide({ product, index, count, progress, reduced }: { product: Product; index: number; count: number; progress: ReturnType<typeof useScroll>["scrollYProgress"]; reduced: boolean }) {
  const start = index / count;
  const end = (index + 1) / count;
  const opacity = useTransform(
    progress,
    index === 0 ? [0, Math.min(1, start + 0.16), Math.min(1, end)] : [Math.max(0, start - 0.12), start, Math.min(1, start + 0.16), Math.min(1, end)],
    index === 0 ? [1, 1, 0] : [0, 1, 1, index === count - 1 ? 1 : 0],
  );
  const y = useTransform(progress, [start, Math.min(1, start + 0.18)], reduced ? [0, 0] : [48, 0]);
  return <motion.div className={`store-scroll-product store-product-art--${product.tone}`} style={{ opacity, y }} aria-hidden="true">
    <span className="store-scroll-product__index">0{index + 1} / 04</span><span className="store-scroll-product__emoji">{product.emoji}</span><div><small>{product.category}</small><h3>{product.name}</h3><p>{product.ml}</p><strong>{money(product.price)} <small>/{product.unit === "kg" ? "kg" : "piece"}</small></strong></div>
  </motion.div>;
}

function ScrollShowcase({ storeName }: { storeName: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0.02, 1]);
  const slides = products.slice(0, 4);
  return <section ref={ref} className="store-scroll-showcase" aria-label="Scroll to discover products">
    <div className="store-scroll-sticky">
      <div className="store-scroll-copy"><span className="store-kicker">THE EVERYDAY EDIT · {storeName}</span><h2>Good things,<br/><em>one scroll at a time.</em></h2><p>Scroll to move through a few everyday favourites.</p><span className="store-scroll-progress"><motion.span style={{ scaleX: progressScale }} /></span></div>
      <div className="store-scroll-slides">
        {slides.map((product, index) => <ScrollSlide key={product.id} product={product} index={index} count={slides.length} progress={scrollYProgress} reduced={reduced} />)}
      </div>
      <div className="store-scroll-hint">KEEP SCROLLING <span>↓</span></div>
    </div>
  </section>;
}

export default function StorePage() {
  const [, params] = useRoute("/store/:storeId");
  const store = hypermarkets.find((item) => item.id === params?.storeId) ?? hypermarkets[0];
  const [query, setQuery] = useState("");

  const productSearchRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("focusSearch") !== "1") return;

  const timer = window.setTimeout(() => {
    const input = productSearchRef.current;

    if (!input) return;

    input.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    input.focus({ preventScroll: true });
  }, 350);

  return () => window.clearTimeout(timer);
}, []);

  const [category, setCategory] = useState("All items");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sentReady, setSentReady] = useState(false);
  const [draftQty, setDraftQty] = useState<Record<string, string>>({});
  const [flyItem, setFlyItem] = useState<{ id: number; emoji: string; left: number; top: number; x: number; y: number } | null>(null);
  const floatingCartRef = useRef<HTMLButtonElement>(null);
  const flyId = useRef(0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase().normalize("NFC");
    return products.filter((p) => {
      const inCategory = category === "All items" || p.category === category;
      const terms = [p.name, p.ml, p.category, ...p.aliases].join(" ").toLocaleLowerCase().normalize("NFC");
      const inSearch = !normalized || terms.includes(normalized) || normalized.split(/\s+/).every((word) => terms.includes(word));
      return inCategory && inSearch;
    });
  }, [query, category]);

  const add = (product: Product, quantity = product.unit === "kg" ? 0.5 : 1, source?: HTMLElement | null) => {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    const safeQuantity = product.unit === "piece" ? Math.max(1, Math.floor(quantity)) : Math.max(0.01, quantity);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) return current.map((line) => line.product.id === product.id ? { ...line, quantity: Number((line.quantity + safeQuantity).toFixed(2)) } : line);
      return [...current, { product, quantity: safeQuantity }];
    });
    setSentReady(false);
    const from = source?.getBoundingClientRect();
    const to = floatingCartRef.current?.getBoundingClientRect();
    if (from && to) {
      const id = ++flyId.current;
      setFlyItem({ id, emoji: product.emoji, left: from.left + from.width / 2 - 18, top: from.top + from.height / 2 - 18, x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2) });
    }
  };
  const changeQty = (id: string, delta: number) => setCart((current) => current.map((line) => line.product.id !== id ? line : { ...line, quantity: Number((line.quantity + delta).toFixed(2)) }).filter((line) => line.quantity > 0));
  const remove = (id: string) => setCart((current) => current.filter((line) => line.product.id !== id));
  const total = cart.reduce((sum, line) => sum + line.quantity * line.product.price, 0);
  const orderText = `Hello YMART! Take an Order of these items.\nOutlet: ${store.name}\n\n${cart.map((line) => `• ${line.product.name} (${line.product.ml}) — ${line.quantity} ${line.product.unit === "kg" ? "kg" : "piece(s)"} × ${money(line.product.price)} = ${money(line.quantity * line.product.price)}`).join("\n")}\n\nEstimated total: ${money(total)}\nPlease confirm availability and final prices.`;
  const waHref = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}` : "";

  return <main className="store-page">
    <header className="store-header">
      <Wordmark /> 
      <div className="store-header__meta"><span>{store.name}</span><button className="store-cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${cart.length} product types`}><ShoppingCart size={17}/><span>Cart</span><b>{cart.length}</b></button></div></header>
    <section className={`store-hero store-hero--${store.tone}`}>
      <div className="store-hero__top"><Link href="/" className="store-back"><ArrowLeft size={15}/> Back to YMART</Link></div>
      <div className="store-hero__content"><p className="store-kicker">YOUR LOCAL EVERYDAY DESTINATION</p><h1>{store.name.replace("YMART ", "")}<span>.</span></h1><p>{store.descriptor}</p><a href="#store-catalog" className="store-hero__cta">Explore products <ArrowUpRight size={16}/></a></div>
      <div className="store-hero__art" aria-hidden="true"><span className="store-hero__orb store-hero__orb--one"/><span className="store-hero__orb store-hero__orb--two"/><span className="store-hero__giant">Y</span><span className="store-hero__stamp">FRESH<br/>FINDS<br/>DAILY</span></div>
      <div className="store-hero__footer"><span>{store.number} — 04</span><span>SHOP YOUR WAY</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>
    <ScrollShowcase storeName={store.name}/>
    <section id="store-catalog" className="store-catalog">
      <div className="store-catalog__heading"><div><p className="store-kicker">THE STORE, AT YOUR FINGERTIPS</p><h2>Find your <em>everyday.</em></h2></div><p>Search in English, മലയാളം, or Manglish — try “paal”, “thakkali”, “അരി”.</p></div>
      
      <div className="store-search">
  <Search size={20} />

  <input
    ref={productSearchRef}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search products · paal · പാൽ · milk"
    aria-label="Search products in English, Malayalam or Manglish"
  />

  <kbd>⌕</kbd>

  {query && (
    <button
      type="button"
      onClick={() => setQuery("")}
      aria-label="Clear search"
    >
      <X size={17} />
    </button>
  )}
</div>
      
      <div className="store-category-tabs" role="group" aria-label="Filter products by category">{categories.map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="store-results-meta"><span>{filtered.length} ITEMS TO DISCOVER</span><span>Sample catalogue · prices need outlet confirmation</span></div>
      {filtered.length ? <div className="store-product-grid">{filtered.map((product, index) => <motion.article key={product.id} className="store-product-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: Math.min(index * 0.035, 0.2), duration: 0.45 }}>
        <div className={`store-product-card__art store-product-art--${product.tone}`}><span className="store-product-card__category">{product.category}</span><span className="store-product-card__emoji">{product.emoji}</span><span className="store-product-card__unit">PER {product.unit.toUpperCase()}</span></div>
        <div className="store-product-card__info"><h3>{product.name}</h3><p>{product.ml}</p><span className="store-product-card__note">{product.note}</span><div className="store-product-card__buy"><div><strong>{money(product.price)}</strong><small> / {product.unit === "kg" ? "kg" : "piece"}</small></div><div className="store-product-card__quantity"><label htmlFor={`qty-${product.id}`}>Qty {product.unit === "kg" ? "(kg)" : "(pcs)"}</label><div><button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => setDraftQty((q) => { const current = Number(q[product.id] ?? (product.unit === "kg" ? "0.5" : "1")); return { ...q, [product.id]: String(Math.max(product.unit === "kg" ? 0.25 : 1, current - (product.unit === "kg" ? 0.25 : 1))) }; })}><Minus size={13}/></button><input id={`qty-${product.id}`} inputMode="decimal" type="number" min={product.unit === "kg" ? "0.25" : "1"} step={product.unit === "kg" ? "0.25" : "1"} value={draftQty[product.id] ?? (product.unit === "kg" ? "0.5" : "1")} onChange={(e) => setDraftQty((q) => ({ ...q, [product.id]: e.target.value }))} aria-label={`${product.name} quantity`} /><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => setDraftQty((q) => { const current = Number(q[product.id] ?? (product.unit === "kg" ? "0.5" : "1")); return { ...q, [product.id]: String(current + (product.unit === "kg" ? 0.25 : 1)) }; })}><Plus size={13}/></button></div></div><button onClick={(e) => add(product, Number(draftQty[product.id] ?? (product.unit === "kg" ? "0.5" : "1")), e.currentTarget)} aria-label={`Add ${product.name} to cart`}><Plus size={18}/><span>Add</span></button></div></div>
      </motion.article>)}</div> : <div className="store-empty"><Search size={24}/><h3>No matching products yet</h3><p>Try another spelling, English name, Malayalam name, or Manglish keyword.</p><button onClick={() => { setQuery(""); setCategory("All items"); }}>Clear search</button></div>}
    </section>
    <section className="store-other-outlets"><p className="store-kicker">KEEP EXPLORING</p><h2>Four stores.<br/><em>Your everyday, your way.</em></h2><div>{hypermarkets.filter((item) => item.id !== store.id).map((item) => <Link key={item.id} href={`/store/${item.id}`} className="store-other-outlet"><span>{item.number}</span><strong>{item.name}</strong><ArrowUpRight size={17}/></Link>)}</div></section>
    <footer className="store-footer"><Wordmark inverse/><span>© {new Date().getFullYear()} YMART · THE NEXT EVERYDAY STARTS HERE.</span><Link href="/">Return to home ↗</Link></footer>

    <button ref={floatingCartRef} className="store-floating-cart" onClick={() => setCartOpen(true)} aria-label={`Open shopping cart with ${cart.reduce((sum, line) => sum + line.quantity, 0)} total units`}><ShoppingCart size={21}/><span>View cart</span><b>{cart.length}</b><strong>{money(total)}</strong></button>
    <AnimatePresence>{flyItem && <motion.div key={flyItem.id} className="store-fly-item" initial={{ left: flyItem.left, top: flyItem.top, x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }} animate={{ left: flyItem.left, top: flyItem.top, x: flyItem.x, y: flyItem.y, scale: 0.25, opacity: 0.15, rotate: 18 }} transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }} onAnimationComplete={() => setFlyItem((current) => current?.id === flyItem.id ? null : current)} aria-hidden="true">{flyItem.emoji}</motion.div>}</AnimatePresence>
    <AnimatePresence>{cartOpen && <><motion.button className="store-cart-backdrop" aria-label="Close cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}/><motion.aside className="store-cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} aria-label="Shopping cart"><div className="store-cart-drawer__head"><div><p className="store-kicker">YOUR EVERYDAY LIST</p><h2>Your cart <span>({cart.length})</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20}/></button></div>
      {cart.length ? <><div className="store-cart-lines">{cart.map((line) => <div className="store-cart-line" key={line.product.id}><div className={`store-cart-line__icon store-product-art--${line.product.tone}`}>{line.product.emoji}</div><div className="store-cart-line__body"><strong>{line.product.name}</strong><small>{money(line.product.price)} / {line.product.unit === "kg" ? "kg" : "piece"}</small><div className="store-qty"><button onClick={() => changeQty(line.product.id, -(line.product.unit === "kg" ? 0.25 : 1))} aria-label="Decrease quantity"><Minus size={13}/></button><input className="store-qty-input" aria-label={`Quantity for ${line.product.name}`} type="number" min={line.product.unit === "kg" ? "0.25" : "1"} step={line.product.unit === "kg" ? "0.25" : "1"} value={line.quantity} onChange={(e) => { const value = Number(e.target.value); if (e.target.value === "") { changeQty(line.product.id, -line.quantity); return; } if (Number.isFinite(value) && value > 0) setCart((current) => current.map((item) => item.product.id === line.product.id ? { ...item, quantity: line.product.unit === "piece" ? Math.max(1, Math.floor(value)) : value } : item)); }} /><small>{line.product.unit === "kg" ? "kg" : "pcs"}</small><button onClick={() => changeQty(line.product.id, line.product.unit === "kg" ? 0.25 : 1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><div className="store-cart-line__end"><strong>{money(line.quantity * line.product.price)}</strong><button onClick={() => remove(line.product.id)} aria-label={`Remove ${line.product.name}`}><Trash2 size={14}/></button></div></div>)}</div><div className="store-cart-summary"><div><span>Estimated subtotal</span><strong>{money(total)}</strong></div><p>Prices and stock are illustrative. The outlet will confirm your enquiry.</p>{whatsappNumber ? <a className="store-whatsapp-cta" href={waHref} target="_blank" rel="noreferrer" onClick={() => setSentReady(true)}><ShoppingBag size={18}/> Send enquiry on WhatsApp <ArrowUpRight size={17}/></a> : <div className="store-wa-config"><strong>WhatsApp number not configured</strong><p>Add <code>VITE_YMART_WHATSAPP_NUMBER</code> to your <code>.env.local</code> using the official number with country code, without + or spaces.</p></div>}{sentReady && <p className="store-cart-confirm"><Check size={14}/> WhatsApp enquiry opened in a new tab.</p>}<button className="store-cart-clear" onClick={() => setCart([])}>Clear cart</button></div></> : <div className="store-cart-empty"><span><ShoppingBag size={28}/></span><h3>Your cart is waiting.</h3><p>Add a few everyday essentials and send your list to the outlet on WhatsApp.</p><button onClick={() => setCartOpen(false)}>Browse products</button></div>}
    </motion.aside></>}</AnimatePresence>
  </main>;
}
