
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
const Careers = lazy(() => import("./pages/Careers"));
const StorePage = lazy(() => import("./pages/StorePage"));
const WeeklyOffersAdmin = lazy(() => import("./pages/WeeklyOffersAdmin"));
const CareerJobDetails = lazy(() => import("./pages/CareerJobDetails"));

/** Two-layer curtain that wipes up whenever the route changes. */
function RouteCurtain({ id }: { id: string }) {
  return (
    <>
      <motion.div
        key={`a${id}`}
        className="page-curtain"
        initial={{ scaleY: id === "init" ? 0 : 1 }}
        animate={{ scaleY: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
      <motion.div
        key={`b${id}`}
        className="page-curtain page-curtain--2"
        initial={{ scaleY: id === "init" ? 0 : 1 }}
        animate={{ scaleY: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.1,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    </>
  );
}

export default function App() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Keep metadata aligned with client-side routes so SPA navigation does not
    // leave every store page with the homepage title/canonical URL.
    const isStore = location.startsWith("/store/");
    const storeSlug = isStore ? location.split("/")[2] : "";
    const storeNames: Record<string, string> = {
      naimarmoola: "Naimarmoola",
      "cherkala-new": "Cherkala New",
      nellikatta: "Nellikatta",
      cherkala: "Cherkala",
    };
    const pageTitle = isStore && storeNames[storeSlug]
      ? `YMART ${storeNames[storeSlug]} Hypermarket | Kasaragod, Kerala`
      : location.startsWith("/careers")
        ? "Careers at YMART | Jobs in Kasaragod, Kerala"
        : "YMART Hypermarkets | Everyday Shopping in Kasaragod, Kerala";
    const pageDescription = isStore && storeNames[storeSlug]
      ? `Explore the YMART ${storeNames[storeSlug]} hypermarket in Kasaragod, Kerala. Check store information and browse everyday essentials.`
      : location.startsWith("/careers")
        ? "Explore career opportunities at YMART and learn about working with our hypermarket team in Kasaragod, Kerala."
        : "Discover YMART hypermarkets in Kasaragod, Kerala. Explore everyday groceries, fresh produce, household essentials, outlet locations and current weekly offers.";
    document.title = pageTitle;

    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = pageDescription;

    const canonicalUrl = `https://ymart.co.in${location === "/" ? "/" : location}`;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = pageTitle;
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = pageDescription;
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = canonicalUrl;
  }, [location]);

  return (
    <ErrorBoundary>
      <RouteCurtain id={location === "/" ? "init" : location} />

      <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">Loading YMART…</div>}>
      <Switch>
        <Route path="/Home" component={Home} />
        <Route path="/careers/:id" component={CareerJobDetails} />
        <Route path="/careers" component={Careers} />
        <Route path="/store/:storeId" component={StorePage} />
        <Route
          path="/owner/add-here"
          component={WeeklyOffersAdmin}
        />
        <Route>
          <Home />
        </Route>
      </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}
