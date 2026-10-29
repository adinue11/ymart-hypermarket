import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import "./FloatingProductSearch.css";

const searchTexts = [
  "Search the product",
  "സാധനം തിരയുക",
  "பொருளைத் தேடுங்கள்",
  "प्रोडक्ट खोजें",
  "ابحث عن المنتج",
  "Produkt suchen",
];

export default function FloatingProductSearch() {
  const [, setLocation] = useLocation();
  const [languageIndex, setLanguageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLanguageIndex((current) => (current + 1) % searchTexts.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  const openSearch = () => {
    // Replace this route with the actual Naimarmoola shop route.
    setLocation("/naimarmoola?focusSearch=1");
  };

  return (
    <button
      type="button"
      className="ymart-floating-search"
      onClick={openSearch}
      aria-label="Search products in the Naimarmoola shop"
    >
      <span className="ymart-floating-search-icon" aria-hidden="true">
        ⌕
      </span>

      <span key={languageIndex} className="ymart-search-animated-text">
        {searchTexts[languageIndex]}
      </span>

      <span className="ymart-floating-search-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}