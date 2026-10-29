export type Destination = {
  id: string;
  number: string;
  name: string;
  title: string;
  eyebrow: string;
  descriptor: string;
  image: string;
  tone: string;
  destinationLabel: string;
};

export const hypermarkets: Destination[] = [
  {
    id: "hypermarket-1",
    number: "01",
    name: "YMART NAIMARMOOLA",
    title: "Everyday, Elevated.",
    eyebrow: "A world of everyday discovery",
    descriptor: "Follow the journey. Discover fresh finds, everyday essentials, and everything you need along the way.",
    image: "/images/hypermarket-1.svg",
    tone: "opal",
    destinationLabel: "YMART NAIMARMOOLA",
  },
  {
    id: "hypermarket-2",
    number: "02",
    name: "YMART CHERKALA-NEW",
    title: "Fresh Moment",
    eyebrow: "A different rhythm of everyday.",
    descriptor: "Move through the aisles. Discover something new, find what you need, and make every visit feel different.",
    image: "/images/hypermarket-2.svg",
    tone: "solstice",
    destinationLabel: "YMART CHERKALA-NEW",
  },
  {
    id: "hypermarket-3",
    number: "03",
    name: "YMART NELLIKATTA",
    title: "Endless Aisles",
    eyebrow: "A world of choice.",
    descriptor: "More is more. Dive into a world of choice, quality, and unexpected finds.",
    image: "/images/hypermarket-3.svg",
    tone: "verdant",
    destinationLabel: "YMART NELLIKATTA",
  },
  {
    id: "hypermarket-4",
    number: "04",
    name: "YMART CHERKALA",
    title: "The Fresh Beginning",
    eyebrow: "Your neighborhood, refreshed.",
    descriptor: "The same place with a fresh take.",
    image: "/images/hypermarket-4.svg",
    tone: "prism",
    destinationLabel: "YMART CHERKALA",
  },
];




export const destinations = [...hypermarkets];

export const weeklyOffers = [
  {
    store: "Naimarmoola",
    number: "01",
    title: "The citrus edit",
    description: "A bright, seasonal-table preview for a week of new discoveries.",
    badge: "SAMPLE OFFER",
    tone: "opal",
  },
  {
    store: "Cherkala-new",
    number: "02",
    title: "Pantry, reframed",
    description: "A fresh look at everyday essentials, gathered in one special edit.",
    badge: "WEEKLY DROP",
    tone: "solstice",
  },
  {
    store: "Nellikkata",
    number: "03",
    title: "A little greener",
    description: "A produce-inspired promotion concept with a lighter point of view.",
    badge: "SPECIAL PICK",
    tone: "verdant",
  },
  {
    store: "Cherkala",
    number: "04",
    title: "The good-things list",
    description: "A rotating sample selection for everyday finds worth a second look.",
    badge: "PREVIEW EDIT",
    tone: "prism",
  },
];

export const featuredProducts = [
  {
    category: "MADE FOR EVERYDAY",
    title: "Good days start here",
    copy: "From fresh ingredients to everyday must-haves, find the things that bring comfort, convenience and joy to your home.",
    art: "style",
    mark: "Everything you need for everyday life, all under one roof.",
  },
  {
    category: "KITCHEN ESSENTIALS",
    title: "Your world of shopping",
    copy: "Discover fresh groceries, fresh chickens and more — all in one place.",
    art: "kitchenware",
    mark: "Everything you need for everyday life, all under one roof.",
  },
  {
    category: "AT YMART",
    title: "Your everyday, made better",
    copy: "Discover something new with every visit — from fresh produce and everyday essentials to unexpected finds.",
    art: "objects",
    mark: "Everything you need for everyday life, all under one roof.",
  },
  {
    category: "THE YMART EXPERIENCE",
    title: "Made for your kitchen",
    copy: "From everyday cookware to kitchen essentials, discover the tools that bring convenience, creativity and joy to every meal.",
    mark: "Everything you need for everyday life, all under one roof.",
  },
  
];

export const faqItems = [
  {
    question: "Are the weekly offers live?",
    answer:
      "The offers shown here are sample creative for this website preview. Official promotions, prices and terms will be added once confirmed by YMART.",
  },
  {
    question: "Where can I find the stores?",
    answer:
      "This page introduces Hypermarkets 1–4. Verified addresses and maps are installed above.",
  },
  {
    question: "Can I arrange delivery?",
    answer:
      "Delivery availability, areas, fees and timings are not yet provided. Check this section again once the official service details are announced.",
  },
  {
    question: "How do I join the YMART WhatsApp group?",
    answer:
      "The official WhatsApp invite link has not yet been provided. The group panel will be ready to connect when YMART shares its verified link.",
  },
  {
    question: "Does the contact form send my message?",
    answer:
      "No. This interactive preview validates your entries locally; it is not connected to an inbox and does not send or store your message.",
  },
];


/* ------------------------------------------------------------------ */
/* Company details + certificates                                      */
/* Details below come from the original ymart.co.in site.              */
/* To add a certificate: drop the file in /public/certificates/ and    */
/* add one entry to `credentials`. Entries show only what you fill in. */
/* ------------------------------------------------------------------ */

export const companyDetails = {
  legalName: "Ymart Hypermarket LLP",
  registeredOffice: "BKM Towers, Ground Floor, Nr. Golden Bakery, P.O Vidyanagar, Nayanmarmoola, Kasaragod, Kerala 671123",
  phone: "7277271177",
  mobile: "+91 8589 977 160",
  cherkala: {
    name: "Ymart Cherkala",
    address: "Ymart Tower, Nr Chengala Panchayath, Kasargod, Kerala 671541",
    mobile: "+91 8589 977 150",
  },
  social: {
    facebook: "https://www.facebook.com/YmartHypermarket",
    twitter: "https://twitter.com/YmartL",
    youtube: "https://www.youtube.com/channel/UC6Ui_xmKeeMzavjbvTf2Vkw",
  },
  email: "info@ymart.co.in",
  website: "ymart.co.in",
  facts: [
    "One-stop supermarket chain for everyday home and personal products",
    "Food, toiletries, beauty, garments, kitchenware, bed & bath linen, home appliances",
    "Four stores across Kasaragod district, Kerala",
  ],
};

export type Credential = {
  id: string;
  title: string;
  issuer?: string;
  number?: string;
  validUntil?: string;
  /** file inside /public/certificates/, image (.png .jpg .webp) or .pdf */
  file?: string;
};

export const credentials: Credential[] = [
  {
    id: "iso",
    title: "ISO certification",
    issuer: "Add issuing body",
    file: "/certificates/iso.png",
  },
  // { id: "fssai", title: "FSSAI food licence", number: "…", validUntil: "…", file: "/certificates/fssai.pdf" },
  // { id: "gst", title: "GST registration", number: "…", file: "/certificates/gst.pdf" },
  // { id: "trade", title: "Trade licence", issuer: "…", file: "/certificates/trade-licence.pdf" },
  // { id: "llp", title: "LLP incorporation", number: "…", file: "/certificates/llp.pdf" },
];


/* ------------------------------------------------------------------ */
/* From the original site: about, categories, partnerships            */
/* ------------------------------------------------------------------ */

export const aboutStory = {
  intro:
    "YMART is a one-stop supermarket chain that offers a wide range of basic home and personal products under one roof, from food and toiletries to beauty, garments, kitchenware, bed and bath linen, and home appliances, at prices customers appreciate.",
  family:
    "YMART is committed to being a responsible partner to all its associates and treats everyone as a member of the YMART family. We support the health and well-being of our customers and society, and take special care of the environment.",
  vision:
    "To uphold utmost customer satisfaction by offering best-value products in a hygienic environment, to retain staff satisfaction, and to maintain transparency with suppliers while sustaining better logistics management.",
  mission:
    "To deliver customer satisfaction through the best quality management system, and to become the most reliable supermarket in the city: where people love to shop and work, and get the best products at the best price.",
};

export const team = [
  {
    name: "Abdul Jaleel K",
    role: "Operations & Finance",
    initials: "AJ",
    photo: "/team/abdul-jaleel.jpg",
    bio: "From a lineage of traditional business for over 20 years, he handles the entire operations and finance of the group, structuring strategy and overseeing administration.",
  },
  {
    name: "Muhammed Haris K",
    role: "Logistics & Store Design",
    initials: "MH",
    photo: "/team/muhammed-haris.jpg",
    bio: "With hands-on experience in the poultry business, he focuses on building supermarkets with the most efficient, customer-friendly ambience, and manages the group's logistics and communication strategy.",
  },
  {
    name: "Noorudeen K",
    role: "Strategy & Technology",
    initials: "NK",
    photo: "/team/noorudeen.jpg",
    bio: "Rooted in the distribution business and well versed in information technology, he drives innovative systems and strategic management through strong research and development.",
  },
];

export const productCategories = [
  { name: "Fresh Products", note: "Fruit, vegetables and everyday fresh" },
  { name: "Beverages", note: "Soft drinks, juices and more" },
  { name: "Grocery, Pulses & FMCG", note: "Staples and daily-use packaged goods" },
  { name: "Home Care", note: "Cleaning and household essentials" },
  { name: "Health, Beauty & Fashion", note: "Personal care, beauty and garments" },
  { name: "Baby Care", note: "Everything for the little ones" },
  { name: "Confectionery", note: "Sweets, chocolates and treats" },
  { name: "Bakery Products", note: "Breads, cakes and bakes" },
  { name: "Stationery", note: "School and office supplies" },
];

export type PartnerTrack = {
  id: string;
  title: string;
  who: string;
  copy: string;
  subject: string;
  cta: string;
};

export const partnerTracks: PartnerTrack[] = [
  {
    id: "suppliers",
    title: "Suppliers",
    who: "Manufacturers, distributors, importers",
    copy: "Have a quality product that needs an audience? YMART joins hands with the right partners to bring high-quality, affordable products to customers, building long-term, commercially satisfying relationships.",
    subject: "Supplier enquiry",
    cta: "Become a supplier",
  },
  {
    id: "landlords",
    title: "Landlords",
    who: "Owners, developers, consultants",
    copy: "As YMART expands it looks for land and property that meets its needs, across Kasaragod, Kannur and Calicut. If you own property to sell or rent, tell us about it and we will get in touch.",
    subject: "Property enquiry",
    cta: "Offer a property",
  },
  {
    id: "franchise",
    title: "Franchise",
    who: "Entrepreneurs ready to open a YMART",
    copy: "Run your own YMART with training programmes, marketing support for growth, continuous hand-holding from start to finish, and a model built on low investment and quick returns.",
    subject: "Franchise enquiry",
    cta: "Ask about a franchise",
  },
  {
    id: "bulk",
    title: "Bulk & institutional",
    who: "Businesses and institutions, B2B and B2C",
    copy: "Buying in volume for an organisation? Share your company details, an approximate quantity or value, and your product list, and we will respond with how we can supply you.",
    subject: "Bulk purchase enquiry",
    cta: "Request a quote",
  },
];

export const whyYmart = [
  "Helpful training programmes",
  "Marketing initiatives for business growth",
  "Continuous hand-holding from start to end",
  "Low investment and quick returns",
];
