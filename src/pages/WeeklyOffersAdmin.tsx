import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import "./WeeklyOffersAdmin.css";
import { compressImage } from "../utils/compressImage";


const OFFERS_BUCKET = "weekly-offers";
const GALLERY_BUCKET = "about-gallery";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const OUTLETS = [
  { id: "naimarmoola", name: "Naimarmoola", short: "NA", location: "Outlet 01" },
  { id: "cherkala-new", name: "Cherkala New", short: "CN", location: "Outlet 02" },
  { id: "nellikatta", name: "Nellikatta", short: "NL", location: "Outlet 03" },
  { id: "cherkala", name: "Cherkala", short: "CH", location: "Outlet 04" },
] as const;

type OutletId = (typeof OUTLETS)[number]["id"];
type Filter = "all" | "active" | "scheduled" | "expired";
type AdminSection = "offers" | "gallery" | "events" | "careers";

type Poster = {
  id: string;
  outlet: string;
  title: string;
  storage_path: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
};

type GalleryImage = {
  id: string;
  storage_path: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type EventStatus = "UPCOMING" | "ONGOING";

type YmartEvent = {
  id: string;
  title: string;
  description: string | null;
  status: EventStatus,
  image_url: string | null;
  created_at: string;
};

type CareerStatus = "draft" | "actively_hiring" | "limited_openings" | "closing_soon" | "paused" | "position_closed";
type CareerJob = {
  id: string;
  title: string;
  department: string | null;
  outlet: string;
  employment_type: string;
  location: string;
  salary: string | null;
  experience: string | null;
  description: string;
  responsibilities: string | null;
  qualifications: string | null;
  benefits: string | null;
  recruitment_email: string;
  application_deadline: string | null;
  status: CareerStatus;
  created_at: string;
  updated_at: string;
};

type CareerDraft = Omit<CareerJob, "id" | "created_at" | "updated_at">;
const EMPTY_CAREER_DRAFT: CareerDraft = {
  title: "", department: "", outlet: "naimarmoola", employment_type: "Full-time",
  location: "Kasaragod, Kerala", salary: "", experience: "", description: "",
  responsibilities: "", qualifications: "", benefits: "", recruitment_email: "",
  application_deadline: "", status: "draft",
};
const CAREER_STATUS_LABELS: Record<CareerStatus, string> = {
  draft: "Draft", actively_hiring: "Actively Hiring", limited_openings: "Limited Openings",
  closing_soon: "Closing Soon", paused: "Paused", position_closed: "Position Closed",
};
const CAREER_OUTLETS = [
  { value: "naimarmoola", label: "Naimarmoola" },
  { value: "cherkala-new", label: "Cherkala New" },
  { value: "nellikatta", label: "Nellikatta" },
  { value: "cherkala", label: "Cherkala" },
];

function getLocalDateTimeValue(hour: number, minute = 0, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getStatus(poster: Poster, now: number) {
  if (new Date(poster.starts_at).getTime() > now) return "scheduled";
  if (new Date(poster.expires_at).getTime() > now) return "active";
  return "expired";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPublicImageUrl(path: string) {
  return supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    upload: <><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    uploadCloud: <><path d="M12 16V8m-3 3 3-3 3 3" /><path d="M20 16.5a4 4 0 0 0-1.5-7.7A6.5 6.5 0 0 0 6 10a3.5 3.5 0 0 0 .5 7H8" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
  };

  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

export default function WeeklyOffersAdmin() {
  const [sessionReady, setSessionReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [adminSection, setAdminSection] = useState<AdminSection>("offers");
  const [outlet, setOutlet] = useState<OutletId>("naimarmoola");
  const [posters, setPosters] = useState<Poster[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(Date.now());

  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("Weekly Offers");
  const [files, setFiles] = useState<File[]>([]);
  const [startsAt, setStartsAt] = useState(() => getLocalDateTimeValue(9));
  const [expiresAt, setExpiresAt] = useState(() => getLocalDateTimeValue(22));

  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryLink, setGalleryLink] = useState("");
  const [galleryBusy, setGalleryBusy] = useState(false);
  const galleryFileInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [events, setEvents] = useState<YmartEvent[]>([]);
const [eventsLoading, setEventsLoading] = useState(false);
const [eventTitle, setEventTitle] = useState("");
const [eventDescription, setEventDescription] = useState("");
const [eventStatus, setEventStatus] =
  useState<EventStatus>("UPCOMING");

const [eventFile, setEventFile] = useState<File | null>(null);
const [eventBusy, setEventBusy] = useState(false);
const eventFileInput = useRef<HTMLInputElement>(null);

const EVENTS_BUCKET = "event-images";

const [careerJobs, setCareerJobs] = useState<CareerJob[]>([]);
const [careerLoading, setCareerLoading] = useState(false);
const [careerBusy, setCareerBusy] = useState(false);
const [careerDraft, setCareerDraft] = useState<CareerDraft>(EMPTY_CAREER_DRAFT);
const [editingCareerId, setEditingCareerId] = useState<string | null>(null);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  useEffect(() => {
    let alive = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setLoggedIn(Boolean(data.session));
      setSessionReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      setSessionReady(true);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const notify = useCallback((text: string, isError = false) => {
    setMessage(text);
    setError(isError);
  }, []);

  const loadPosters = useCallback(async () => {
    setLoading(true);

    const { data, error: queryError } = await supabase
      .from("weekly_offer_posters")
      .select("*")
      .eq("outlet", outlet)
      .order("starts_at", { ascending: false });

    if (queryError) {
      notify(queryError.message, true);
    } else {
      setPosters((data ?? []) as Poster[]);
    }

    setLoading(false);
  }, [outlet, notify]);

  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);

    const { data, error: queryError } = await supabase
      .from("about_gallery_images")
      .select("id, storage_path, link, is_active, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (queryError) {
      notify(`Could not load About Gallery: ${queryError.message}`, true);
    } else {
      setGalleryImages((data ?? []) as GalleryImage[]);
    }

    setGalleryLoading(false);
  }, [notify]);

  useEffect(() => {
    if (loggedIn) void loadPosters();
  }, [loggedIn, loadPosters]);

  useEffect(() => {
    if (loggedIn && adminSection === "gallery") void loadGallery();
  }, [loggedIn, adminSection, loadGallery]);

  const allCounts = useMemo(() => {
    return posters.reduce(
      (counts, poster) => {
        counts[getStatus(poster, now)] += 1;
        return counts;
      },
      { active: 0, scheduled: 0, expired: 0 },
    );
  }, [posters, now]);

  const filteredPosters = useMemo(() => {
    return posters.filter((poster) => {
      const status = getStatus(poster, now);
      const matchesFilter = filter === "all" || status === filter;
      const matchesSearch = poster.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [posters, filter, search, now]);

  function addFiles(incoming: FileList | File[]) {
    const selected = Array.from(incoming);
    const valid: File[] = [];

    for (const file of selected) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        notify(`${file.name}: use JPG, PNG, or WebP images.`, true);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        notify(`${file.name}: the maximum file size is 5 MB.`, true);
        continue;
      }
      valid.push(file);
    }

    setFiles((previous) => {
      const combined = [...previous, ...valid];
      const unique = combined.filter(
        (file, index, array) =>
          array.findIndex((other) =>
            other.name === file.name &&
            other.size === file.size &&
            other.lastModified === file.lastModified
          ) === index,
      );

      if (unique.length > 20) {
        notify("Upload up to 20 posters at a time.", true);
        return unique.slice(0, 20);
      }

      return unique;
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    notify("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) notify(loginError.message, true);
    setBusy(false);
  }

  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) notify(signOutError.message, true);
  }

  async function uploadPosters(event: FormEvent) {
    event.preventDefault();
    notify("");

    if (!files.length) {
      notify("Select at least one poster image.", true);
      return;
    }

    const start = new Date(startsAt);
    const expiry = new Date(expiresAt);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(expiry.getTime())) {
      notify("Enter valid publication and expiry times.", true);
      return;
    }

    if (expiry <= start) {
      notify("Expiry must be later than the publication time.", true);
      return;
    }

    setBusy(true);
    let uploaded = 0;
    const failures: string[] = [];

    
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${outlet}/${crypto.randomUUID()}-${safeName}`;

      let compressedFile: File;

      try {
        compressedFile = await compressImage(file, "poster");
      } catch (compressionError) {
        failures.push(
          `${file.name}: Image compression failed. ${
            compressionError instanceof Error
              ? compressionError.message
              : "Unknown error"
          }`
        );
        continue;
      }

  const { error: storageError } = await supabase.storage
    .from(OFFERS_BUCKET)
    .upload(path, compressedFile, {
      contentType: compressedFile.type,
      cacheControl: "31536000",
      upsert: false,
    });

      if (storageError) {
        failures.push(`${file.name}: ${storageError.message}`);
        continue;
      }

      const { error: rowError } = await supabase
        .from("weekly_offer_posters")
        .insert({
          outlet,
          title: title.trim() || "Weekly Offers",
          storage_path: path,
          starts_at: start.toISOString(),
          expires_at: expiry.toISOString(),
        });

      if (rowError) {
        const { error: cleanupError } = await supabase.storage
          .from(OFFERS_BUCKET)
          .remove([path]);

        failures.push(
          `${file.name}: ${rowError.message}` +
          (cleanupError ? ` (file cleanup failed: ${cleanupError.message})` : ""),
        );
        continue;
      }

      uploaded += 1;
    }

    setBusy(false);
    setFiles([]);

    if (uploaded > 0) {
      notify(
        failures.length
          ? `${uploaded} uploaded; ${failures.length} failed. ${failures[0]}`
          : `${uploaded} poster${uploaded === 1 ? "" : "s"} uploaded successfully.`,
        failures.length > 0,
      );
      setUploadOpen(false);
      await loadPosters();
    } else {
      notify(failures[0] ?? "No posters were uploaded.", true);
    }
  }

  async function uploadGalleryImage(event: FormEvent) {
    event.preventDefault();
    notify("");

    if (!galleryFile) {
      notify("Choose an image for the About Gallery.", true);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(galleryFile.type)) {
      notify("Use a JPG, PNG, or WebP image.", true);
      return;
    }

    if (galleryFile.size > MAX_FILE_SIZE) {
      notify("The maximum image size is 5 MB.", true);
      return;
    }

    if (galleryLink.trim()) {
      try {
        const url = new URL(galleryLink.trim());
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        notify("Enter a valid link starting with https:// or http://.", true);
        return;
      }
    }

    setGalleryBusy(true);

    const safeName = galleryFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `about/${crypto.randomUUID()}-${safeName}`;
    let compressedGalleryFile: File;
    try {
      compressedGalleryFile = await compressImage(galleryFile, "gallery");
    } catch (compressionError) {
      notify(`Image compression failed: ${compressionError instanceof Error ? compressionError.message : "Unknown error"}`, true);
      setGalleryBusy(false);
      return;
    }

    const { error: storageError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, compressedGalleryFile, {
        contentType: compressedGalleryFile.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (storageError) {
      notify(`Image upload failed: ${storageError.message}`, true);
      setGalleryBusy(false);
      return;
    }

    const nextOrder =
      galleryImages.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0) + 1;

    const { error: rowError } = await supabase
      .from("about_gallery_images")
      .insert({
        storage_path: path,
        link: galleryLink.trim() || null,
        is_active: true,
        sort_order: nextOrder,
      });

    if (rowError) {
      const { error: cleanupError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .remove([path]);

      notify(
        `Could not save the gallery record: ${rowError.message}` +
        (cleanupError ? ` File cleanup also failed: ${cleanupError.message}` : ""),
        true,
      );
      setGalleryBusy(false);
      return;
    }

    setGalleryFile(null);
    setGalleryLink("");
    if (galleryFileInput.current) galleryFileInput.current.value = "";
    await loadGallery();
    notify("Image added to About Gallery.");
    setGalleryBusy(false);
  }

  const loadEvents = useCallback(async () => {
  setEventsLoading(true);

  const { data, error: queryError } = await supabase
    .from("ymart_events")
    .select("id, title, description, status, image_url, created_at")
    .order("created_at", { ascending: false });

  if (queryError) {
    notify(`Could not load events: ${queryError.message}`, true);
  } else {
    setEvents((data ?? []) as YmartEvent[]);
  }

  setEventsLoading(false);
}, [notify]);

useEffect(() => {
  if (loggedIn && adminSection === "events") {
    void loadEvents();
  }
}, [loggedIn, adminSection, loadEvents]);

const loadCareerJobs = useCallback(async () => {
  setCareerLoading(true);
  const { data, error: queryError } = await supabase
    .from("ymart_careers")
    .select("*")
    .order("created_at", { ascending: false });
  if (queryError) {
    notify(`Could not load careers: ${queryError.message}. Run the careers SQL migration first if the table does not exist.`, true);
  } else {
    setCareerJobs((data ?? []) as CareerJob[]);
  }
  setCareerLoading(false);
}, [notify]);

useEffect(() => {
  if (loggedIn && adminSection === "careers") void loadCareerJobs();
}, [loggedIn, adminSection, loadCareerJobs]);

function updateCareerDraft<K extends keyof CareerDraft>(key: K, value: CareerDraft[K]) {
  setCareerDraft((current) => ({ ...current, [key]: value }));
}

function editCareerJob(job: CareerJob) {
  setEditingCareerId(job.id);
  setCareerDraft({
    title: job.title, department: job.department ?? "", outlet: job.outlet,
    employment_type: job.employment_type, location: job.location, salary: job.salary ?? "",
    experience: job.experience ?? "", description: job.description,
    responsibilities: job.responsibilities ?? "", qualifications: job.qualifications ?? "",
    benefits: job.benefits ?? "", recruitment_email: job.recruitment_email,
    application_deadline: job.application_deadline ?? "", status: job.status,
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetCareerDraft() {
  setEditingCareerId(null);
  setCareerDraft(EMPTY_CAREER_DRAFT);
}

async function saveCareerJob(event: FormEvent) {
  event.preventDefault();
  notify("");
  if (!careerDraft.title.trim() || !careerDraft.description.trim() || !careerDraft.recruitment_email.trim()) {
    notify("Enter the job title, description, and recruitment email.", true);
    return;
  }
  setCareerBusy(true);
  const payload = {
    ...careerDraft, title: careerDraft.title.trim(),
    department: (careerDraft.department ?? "").trim() || null,
    salary: (careerDraft.salary ?? "").trim() || null, experience: (careerDraft.experience ?? "").trim() || null,
    responsibilities: (careerDraft.responsibilities ?? "").trim() || null,
    qualifications: (careerDraft.qualifications ?? "").trim() || null, benefits: (careerDraft.benefits ?? "").trim() || null,
    recruitment_email: careerDraft.recruitment_email.trim(),
    application_deadline: careerDraft.application_deadline || null,
    description: careerDraft.description.trim(),
  };
  const wasEditing = Boolean(editingCareerId);
  const query = editingCareerId
    ? supabase.from("ymart_careers").update(payload).eq("id", editingCareerId)
    : supabase.from("ymart_careers").insert(payload);
  const { error: saveError } = await query;
  if (saveError) {
    notify(`Could not save vacancy: ${saveError.message}`, true);
    setCareerBusy(false);
    return;
  }
  resetCareerDraft();
  await loadCareerJobs();
  notify(wasEditing ? "Vacancy updated." : "Vacancy saved.");
  setCareerBusy(false);
}

async function changeCareerStatus(job: CareerJob, status: CareerStatus) {
  setCareerBusy(true);
  const { error: updateError } = await supabase.from("ymart_careers").update({ status }).eq("id", job.id);
  if (updateError) notify(`Could not update vacancy status: ${updateError.message}`, true);
  else { await loadCareerJobs(); notify(`Vacancy status changed to ${CAREER_STATUS_LABELS[status]}.`); }
  setCareerBusy(false);
}

async function deleteCareerJob(job: CareerJob) {
  if (!window.confirm(`Delete the “${job.title}” vacancy permanently?`)) return;
  setCareerBusy(true);
  const { error: deleteError } = await supabase.from("ymart_careers").delete().eq("id", job.id);
  if (deleteError) notify(`Could not delete vacancy: ${deleteError.message}`, true);
  else { if (editingCareerId === job.id) resetCareerDraft(); await loadCareerJobs(); notify("Vacancy deleted."); }
  setCareerBusy(false);
}


function getEventImageUrl(path: string | null) {
  if (!path) return "";

  return supabase.storage
    .from(EVENTS_BUCKET)
    .getPublicUrl(path).data.publicUrl;
}

async function uploadEvent(event: FormEvent) {
  event.preventDefault();
  notify("");

  if (!eventTitle.trim()) {
    notify("Enter an event title.", true);
    return;
  }

  if (!eventFile) {
    notify("Choose an event image.", true);
    return;
  }

  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(eventFile.type)) {
    notify("Use a JPG, PNG, WebP, or GIF image.", true);
    return;
  }

  if (eventFile.size > 8 * 1024 * 1024) {
    notify("The maximum event image size is 8 MB.", true);
    return;
  }

  setEventBusy(true);

  const safeName = eventFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `events/${crypto.randomUUID()}-${safeName}`;
  let compressedEventFile: File;
  try {
    compressedEventFile = await compressImage(eventFile, "poster");
  } catch (compressionError) {
    notify(`Image compression failed: ${compressionError instanceof Error ? compressionError.message : "Unknown error"}`, true);
    setEventBusy(false);
    return;
  }

  const { error: storageError } = await supabase.storage
    .from(EVENTS_BUCKET)
    .upload(path, compressedEventFile, {
      contentType: compressedEventFile.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (storageError) {
    notify(`Image upload failed: ${storageError.message}`, true);
    setEventBusy(false);
    return;
  }

  const { error: rowError } = await supabase
    .from("ymart_events")
    .insert({
      title: eventTitle.trim(),
      description: eventDescription.trim() || null,
      status: eventStatus,
      image_url: path,
    });

  if (rowError) {
    await supabase.storage.from(EVENTS_BUCKET).remove([path]);
    notify(`Could not save event: ${rowError.message}`, true);
    setEventBusy(false);
    return;
  }

  setEventTitle("");
  setEventDescription("");
  setEventStatus("UPCOMING");
  setEventFile(null);

  if (eventFileInput.current) {
    eventFileInput.current.value = "";
  }

  await loadEvents();
  notify("Event published successfully.");
  setEventBusy(false);
}

async function changeEventStatus(
  item: YmartEvent,
  status: EventStatus,
) {
  const { error: updateError } = await supabase
    .from("ymart_events")
    .update({ status })
    .eq("id", item.id);

  if (updateError) {
    notify(`Could not update status: ${updateError.message}`, true);
    return;
  }

  setEvents((previous) =>
    previous.map((event) =>
      event.id === item.id ? { ...event, status } : event,
    ),
  );

  notify(
    `Event status changed to ${
      status === "UPCOMING" ? "Upcoming" : "Ongoing"
    }.`,
  );
}


async function deleteEvent(item: YmartEvent) {
  const confirmed = window.confirm(
    `Delete "${item.title}" and its image?`
  );

  if (!confirmed) return;

  // First remove the image from Supabase Storage.
  if (item.image_url) {
    const { error: imageError } = await supabase.storage
      .from("event-images")
      .remove([item.image_url]);

    if (imageError) {
      notify(
        `Could not delete event image: ${imageError.message}`,
        true
      );
      return;
    }
  }

  // Delete the database record only after image removal succeeds.
  const { error: eventError } = await supabase
    .from("ymart_events")
    .delete()
    .eq("id", item.id);

  if (eventError) {
    notify(
      `Image deleted, but event record could not be deleted: ${eventError.message}`,
      true
    );
    return;
  }

  setEvents((previous) =>
    previous.filter((event) => event.id !== item.id)
  );

  notify("Event and image deleted successfully.");
}


  async function toggleGalleryImage(item: GalleryImage) {
    notify("");

    const { error: updateError } = await supabase
      .from("about_gallery_images")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (updateError) {
      notify(`Could not update image: ${updateError.message}`, true);
      return;
    }

    setGalleryImages((previous) =>
      previous.map((image) =>
        image.id === item.id ? { ...image, is_active: !item.is_active } : image,
      ),
    );
    notify(item.is_active ? "Image hidden from the website." : "Image activated on the website.");
  }

  async function deleteGalleryImage(item: GalleryImage) {
    const confirmed = window.confirm(
      "Permanently delete this gallery image? This cannot be undone.",
    );
    if (!confirmed) return;

    setGalleryBusy(true);
    notify("");

    const { error: rowError } = await supabase
      .from("about_gallery_images")
      .delete()
      .eq("id", item.id);

    if (rowError) {
      notify(`Could not delete gallery record: ${rowError.message}`, true);
      setGalleryBusy(false);
      return;
    }

    const { error: storageError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .remove([item.storage_path]);

    setGalleryImages((previous) => previous.filter((image) => image.id !== item.id));

    if (storageError) {
      notify(`Record deleted, but storage cleanup failed: ${storageError.message}`, true);
    } else {
      notify("Gallery image deleted.");
    }

    setGalleryBusy(false);
  }



  const currentOutlet = OUTLETS.find((item) => item.id === outlet)!;

  if (!sessionReady) {
    return <div className="wo-loading"><span className="wo-spinner" /> Loading YMART admin...</div>;
  }

  if (!loggedIn) {
    return (
      <main className="wo-login-page">
        <motion.div
          className="wo-login-glow wo-login-glow--one"
          animate={{ x: [0, 35, 0], y: [0, -25, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="wo-login-glow wo-login-glow--two"
          animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.form
          className="wo-login-card"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          onSubmit={signIn}
        >
          <div className="wo-brand-mark">Y<span>.</span></div>
          <p className="wo-eyebrow">RETAIL MANAGEMENT</p>
          <h1>Welcome back<span>.</span></h1>
          <p className="wo-muted">Sign in to manage Weekly Offers, About Gallery, Events, and Careers.</p>

          <label className="wo-field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@ymart.com"
              required
            />
          </label>

          <label className="wo-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {message && (
            <div className={error ? "wo-notice wo-notice--error" : "wo-notice"}>
              {message}
            </div>
          )}

          <motion.button
            className="wo-primary-button wo-login-button"
            type="submit"
            disabled={busy}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {busy ? "Signing in..." : "Sign in to dashboard"}
            <Icon name="arrow" />
          </motion.button>

          <div className="wo-login-foot">
            <span className="wo-online-dot" />
            Secure YMART admin access
          </div>
        </motion.form>
      </main>
    );
  }

  return (
    <div className="wo-app">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            className="wo-mobile-overlay"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`wo-sidebar ${sidebarOpen ? "wo-sidebar--open" : ""}`}>
        <div className="wo-brand">
          <div className="wo-brand-mark">Y<span>.</span></div>
          <div>
            <strong>YMART<span className="wo-brand-period">.</span></strong>
            <small>RETAIL CONTROL</small>
          </div>
          <button
            className="wo-icon-button wo-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="wo-nav-label">WORKSPACE</div>

        <button
          className={`wo-nav-item ${adminSection === "offers" ? "wo-nav-item--active" : ""}`}
          onClick={() => {
            setAdminSection("offers");
            setSidebarOpen(false);
            notify("");
          }}
        >
          <Icon name="image" />
          <span>Weekly offers</span>
          <span className="wo-nav-count">{posters.length}</span>
        </button>

        <button
          className={`wo-nav-item ${adminSection === "gallery" ? "wo-nav-item--active" : ""}`}
          onClick={() => {
            setAdminSection("gallery");
            setSidebarOpen(false);
            notify("");
          }}
        >
          <Icon name="grid" />
          <span>About Gallery</span>
          <span className="wo-nav-count">{galleryImages.length}</span>
        </button>

        <button
  className={`wo-nav-item ${
    adminSection === "events" ? "wo-nav-item--active" : ""
  }`}
  onClick={() => {
    setAdminSection("events");
    setSidebarOpen(false);
    notify("");
  }}
>
  <Icon name="calendar" />
  <span>Events</span>
  <span className="wo-nav-count">{events.length}</span>
</button>

        <button
          className={`wo-nav-item ${adminSection === "careers" ? "wo-nav-item--active" : ""}`}
          onClick={() => { setAdminSection("careers"); setSidebarOpen(false); notify(""); }}
        >
          <Icon name="grid" />
          <span>Careers</span>
          <span className="wo-nav-count">{careerJobs.length}</span>
        </button>

        {adminSection === "offers" && (
          <>
            <div className="wo-nav-label wo-outlet-label">HYPERMARKETS</div>
            <div className="wo-outlet-list">
              {OUTLETS.map((item, index) => (
                <motion.button
                  key={item.id}
                  className={`wo-outlet-item ${outlet === item.id ? "wo-outlet-item--active" : ""}`}
                  onClick={() => {
                    setOutlet(item.id);
                    setFilter("all");
                    setSidebarOpen(false);
                    notify("");
                  }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className={`wo-outlet-avatar wo-outlet-avatar--${index + 1}`}>
                    {item.short}
                  </span>
                  <span className="wo-outlet-name">{item.name}</span>
                  {outlet === item.id && <span className="wo-outlet-indicator" />}
                </motion.button>
              ))}
            </div>
          </>
        )}

        <div className="wo-sidebar-bottom">
          <div className="wo-storage-note">
            <span className="wo-storage-icon"><Icon name="uploadCloud" /></span>
            <div>
             <strong>
                {adminSection === "offers"
                  ? "Offer manager"
                  : adminSection === "gallery"
                    ? "Gallery manager"
                    : "Events manager"}
             </strong>
              <small>
                {adminSection === "offers"
                  ? "Images · Scheduling · Publishing"
                  : adminSection === "gallery"
                    ? "Images · Visibility · Permanent storage"
                    : "Events · Images · Status management"}
              </small>
            </div>
          </div>
          <button className="wo-nav-item wo-signout" onClick={signOut}>
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
          <div className="wo-sidebar-version">YMART ADMIN <span>·</span> 1.1</div>
        </div>
      </aside>

      <main className="wo-main">
        <header className="wo-topbar">
          <div className="wo-topbar-left">
            <button
              className="wo-icon-button wo-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>
            <div className="wo-breadcrumb">
              <span>Workspace</span><b>/</b>
              <strong>
                {adminSection === "offers"
                  ? "Weekly offers"
                  : adminSection === "gallery"
                    ? "About Gallery"
                    : "Events"}
              </strong>WORKSPACE
            </div>
          </div>
          <div className="wo-topbar-right">
            <span className="wo-system-status"> All systems operational</span>
            <div className="wo-avatar">Y</div>
          </div>
        </header>

        {adminSection === "offers" ? (
          <div className="wo-content">
            <motion.section
              className="wo-page-heading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div>
                <p className="wo-eyebrow">CAMPAIGN MANAGEMENT <span>/</span> 01</p>
                <h1>Weekly offers<span>.</span></h1>
                <p className="wo-muted">
                  Manage campaigns and poster schedules across all your outlets.
                </p>
              </div>
              <motion.button
                className="wo-primary-button"
                onClick={() => {
                  setTitle("Weekly Offers");
                  setFiles([]);
                  setStartsAt(getLocalDateTimeValue(9));
                  setExpiresAt(getLocalDateTimeValue(22));
                  setUploadOpen(true);
                  notify("");
                }}
                whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(190,255,82,.12)" }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon name="plus" /> New campaign
              </motion.button>
            </motion.section>

            <motion.section
              className="wo-outlet-banner"
              key={outlet}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="wo-banner-orb wo-banner-orb--one" />
              <div className="wo-banner-orb wo-banner-orb--two" />
              <div className="wo-banner-info">
                <span className="wo-banner-kicker"><span /> SELECTED HYPERMARKET</span>
                <h2>{currentOutlet.name}</h2>
                <p>Weekly promotion campaigns and poster management</p>
              </div>
              <div className="wo-banner-meta">
                <span>{currentOutlet.location}</span>
                <strong>
                  {String(OUTLETS.findIndex((item) => item.id === outlet) + 1).padStart(2, "0")}
                  <i> / 04</i>
                </strong>
              </div>
            </motion.section>

            <section className="wo-stats-grid">
              {[
                { label: "TOTAL POSTERS", value: posters.length, icon: "image", color: "lime", note: "Selected outlet" },
                { label: "ACTIVE NOW", value: allCounts.active, icon: "check", color: "green", note: "Visible to customers" },
                { label: "SCHEDULED", value: allCounts.scheduled, icon: "calendar", color: "blue", note: "Awaiting publication" },
                { label: "EXPIRED", value: allCounts.expired, icon: "clock", color: "orange", note: "Awaiting cleanup" },
              ].map((stat, index) => (
                <motion.button
                  type="button"
                  key={stat.label}
                  className={`wo-stat-card wo-stat-card--${stat.color}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setFilter(
                    index === 1 ? "active" :
                    index === 2 ? "scheduled" :
                    index === 3 ? "expired" : "all",
                  )}
                >
                  <div className="wo-stat-top">
                    <span>{stat.label}</span>
                    <span className="wo-stat-icon"><Icon name={stat.icon} /></span>
                  </div>
                  <strong className="wo-stat-value">{stat.value}</strong>
                  <span className="wo-stat-note">{stat.note}</span>
                </motion.button>
              ))}
            </section>

            <section className="wo-section-heading">
              <div>
                <h2>Poster library</h2>
                <p className="wo-muted">Review and monitor your uploaded campaigns.</p>
              </div>
              <motion.button
                className="wo-secondary-button"
                onClick={() => void loadPosters()}
                whileTap={{ scale: 0.96 }}
              >
                <Icon name="refresh" size={17} /> Refresh
              </motion.button>
            </section>

            <section className="wo-library-panel">
              <div className="wo-library-toolbar">
                <div className="wo-filter-tabs">
                  {([
                    ["all", "All posters"],
                    ["active", "Active"],
                    ["scheduled", "Scheduled"],
                    ["expired", "Expired"],
                  ] as [Filter, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      className={`wo-filter-tab ${filter === value ? "wo-filter-tab--active" : ""}`}
                      onClick={() => setFilter(value)}
                    >
                      {label}
                      {filter === value && <motion.span layoutId="wo-filter-underline" />}
                    </button>
                  ))}
                </div>
                <label className="wo-search">
                  <Icon name="search" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search posters..."
                    aria-label="Search posters"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                      <Icon name="close" size={15} />
                    </button>
                  )}
                </label>
              </div>

              {message && (
                <motion.div
                  className={`wo-notice ${error ? "wo-notice--error" : ""}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message}
                  <button onClick={() => notify("")} aria-label="Dismiss message">
                    <Icon name="close" size={16} />
                  </button>
                </motion.div>
              )}

              {loading ? (
                <div className="wo-empty-state">
                  <span className="wo-spinner" />
                  <p>Loading your posters...</p>
                </div>
              ) : filteredPosters.length === 0 ? (
                <motion.div className="wo-empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="wo-empty-icon"><Icon name="image" size={30} /></div>
                  <h3>{posters.length ? "No matching posters" : "Your poster library is empty"}</h3>
                  <p>
                    {posters.length
                      ? "Try another filter or search term."
                      : `Upload your first offer poster for ${currentOutlet.name}.`}
                  </p>
                  {!posters.length && (
                    <button className="wo-primary-button" onClick={() => setUploadOpen(true)}>
                      <Icon name="plus" /> Upload first poster
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div layout className="wo-poster-grid">
                  <AnimatePresence mode="popLayout">
                    {filteredPosters.map((poster, index) => {
                      const status = getStatus(poster, now);
                      const publicUrl = supabase.storage
                        .from(OFFERS_BUCKET)
                        .getPublicUrl(poster.storage_path).data.publicUrl;

                      return (
                        <motion.article
                          key={poster.id}
                          className="wo-poster-card"
                          layout
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ delay: index * 0.035, duration: 0.28 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="wo-poster-image">
                            <img src={publicUrl} alt={poster.title} loading="lazy" />
                            <span className={`wo-status-badge wo-status-badge--${status}`}>
                              <i /> {status}
                            </span>
                            <a className="wo-preview-link" href={publicUrl} target="_blank" rel="noreferrer">
                              Open image <Icon name="arrow" size={15} />
                            </a>
                          </div>
                          <div className="wo-poster-details">
                            <div className="wo-poster-title-row">
                              <h3 title={poster.title}>{poster.title}</h3>
                              <span className="wo-poster-menu-icon">↗</span>
                            </div>
                            <div className="wo-poster-date">
                              <Icon name="calendar" size={15} />
                              <span>{formatDate(poster.starts_at)}</span>
                            </div>
                            <div className="wo-poster-date">
                              <Icon name="clock" size={15} />
                              <span>Expires {formatDate(poster.expires_at)}</span>
                            </div>
                            {status === "expired" && (
                              <div className="wo-expiry-note">
                                Hidden from customers · Awaiting scheduled cleanup
                              </div>
                            )}
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}

              <div className="wo-library-footer">
                <span>Showing {filteredPosters.length} of {posters.length} posters</span>
                <span><i className="wo-online-dot" /> Connected to Supabase</span>
              </div>
            </section>

            <PageFooter />
          </div>
        ) : adminSection === "gallery" ? (
          <div className="wo-content">
            <motion.section
              className="wo-page-heading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <p className="wo-eyebrow">WEBSITE CONTENT <span>/</span> 02</p>
                <h1>About Gallery<span>.</span></h1>
                <p className="wo-muted">
                  Upload and manage the images displayed in the YMART About section.
                </p>
              </div>

              <motion.button
                className="wo-secondary-button"
                onClick={() => void loadGallery()}
                whileTap={{ scale: 0.96 }}
              >
                <Icon name="refresh" size={17} /> Refresh gallery
              </motion.button>
            </motion.section>

            {message && (
              <motion.div
                className={`wo-notice ${error ? "wo-notice--error" : ""}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
                <button onClick={() => notify("")} aria-label="Dismiss message">
                  <Icon name="close" size={16} />
                </button>
              </motion.div>
            )}

            <section className="wo-library-panel" style={{ padding: 20 }}>
              <div className="wo-section-heading" style={{ marginTop: 0 }}>
                <div>
                  <h2>Add an image</h2>
                  <p className="wo-muted">
                    Gallery images are permanent until you delete them. They do not expire with offers.
                  </p>
                </div>
              </div>

              <form onSubmit={uploadGalleryImage} style={{ display: "grid", gap: 16 }}>
                <label className="wo-field">
                  <span>Image file · JPG, PNG or WebP · Maximum 5 MB</span>
                  <input
                    ref={galleryFileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setGalleryFile(event.target.files?.[0] ?? null)}
                    required
                  />
                </label>

                {galleryFile && (
                  <div className="wo-notice">
                    Selected: {galleryFile.name}
                    <button
                      type="button"
                      onClick={() => {
                        setGalleryFile(null);
                        if (galleryFileInput.current) galleryFileInput.current.value = "";
                      }}
                      aria-label="Remove selected image"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                )}

                <label className="wo-field">
                  <span><Icon name="link" size={15} /> Optional click-through link</span>
                  <input
                    type="url"
                    value={galleryLink}
                    onChange={(event) => setGalleryLink(event.target.value)}
                    placeholder="https://example.com (optional)"
                  />
                </label>

                <div>
                  <button className="wo-primary-button" type="submit" disabled={galleryBusy || !galleryFile}>
                    {galleryBusy
                      ? "Uploading image..."
                      : <><Icon name="upload" size={17} /> Upload to About Gallery</>}
                  </button>
                </div>
              </form>
            </section>

            <section className="wo-section-heading">
              <div>
                <h2>Gallery library</h2>
                <p className="wo-muted">
                  {galleryImages.filter((image) => image.is_active).length} active ·{" "}
                  {galleryImages.length} total images
                </p>
              </div>
            </section>

            <section className="wo-library-panel">
              {galleryLoading ? (
                <div className="wo-empty-state">
                  <span className="wo-spinner" />
                  <p>Loading gallery images...</p>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="wo-empty-state">
                  <div className="wo-empty-icon"><Icon name="image" size={30} /></div>
                  <h3>Your About Gallery is empty</h3>
                  <p>Upload an image above to start building the gallery.</p>
                </div>
              ) : (
                <div className="wo-poster-grid">
                  {galleryImages.map((item) => {
                    const imageUrl = getPublicImageUrl(item.storage_path);

                    return (
                      <article className="wo-poster-card" key={item.id}>
                        <div className="wo-poster-image">
                          <img
                            src={imageUrl}
                            alt="YMART About Gallery"
                            loading="lazy"
                          />
                          <span
                            className={`wo-status-badge ${item.is_active ? "wo-status-badge--active" : "wo-status-badge--expired"}`}
                          >
                            <i /> {item.is_active ? "Visible on website" : "Hidden"}
                          </span>
                          <a
                            className="wo-preview-link"
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open image <Icon name="arrow" size={15} />
                          </a>
                        </div>

                        <div className="wo-poster-details">
                          <div className="wo-poster-title-row">
                            <h3 title={item.storage_path}>
                              {item.storage_path.split("/").pop()}
                            </h3>
                          </div>

                          <div className="wo-poster-date">
                            <Icon name="calendar" size={15} />
                            <span>Added {formatDate(item.created_at)}</span>
                          </div>

                          {item.link && (
                            <div className="wo-poster-date">
                              <Icon name="link" size={15} />
                              <a href={item.link} target="_blank" rel="noreferrer">
                                Open linked page
                              </a>
                            </div>
                          )}

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                            <button
                              className="wo-secondary-button"
                              type="button"
                              disabled={galleryBusy}
                              onClick={() => void toggleGalleryImage(item)}
                            >
                              <Icon name={item.is_active ? "eye" : "check"} size={16} />
                              {item.is_active ? "Hide image" : "Activate image"}
                            </button>

                            <button
                              className="wo-secondary-button"
                              type="button"
                              disabled={galleryBusy}
                              onClick={() => void deleteGalleryImage(item)}
                              style={{ color: "#ffb5a1" }}
                            >
                              <Icon name="trash" size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="wo-library-footer">
                <span>{galleryImages.length} gallery images</span>
                <span><i className="wo-online-dot" /> Connected to Supabase</span>
              </div>
            </section>

                        <PageFooter />
          </div>
        ) : adminSection === "events" ? (
          <div className="wo-content">
            <motion.section
              className="wo-page-heading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <p className="wo-eyebrow">
                  WEBSITE CONTENT <span>/</span> 03
                </p>
                <h1>
                  Events<span>.</span>
                </h1>
                <p className="wo-muted">
                  Publish events, manage event images, and update their status.
                </p>
              </div>

              <motion.button
                className="wo-secondary-button"
                type="button"
                onClick={() => void loadEvents()}
                whileTap={{ scale: 0.96 }}
              >
                <Icon name="refresh" size={17} />
                Refresh events
              </motion.button>
            </motion.section>

            {message && (
              <motion.div
                className={`wo-notice ${error ? "wo-notice--error" : ""}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
                <button
                  type="button"
                  onClick={() => notify("")}
                  aria-label="Dismiss message"
                >
                  <Icon name="close" size={16} />
                </button>
              </motion.div>
            )}

            <section className="wo-library-panel" style={{ padding: 20 }}>
              <div className="wo-section-heading" style={{ marginTop: 0 }}>
                <div>
                  <h2>Publish a new event</h2>
                  <p className="wo-muted">
                    Add an event image, description, and current status.
                  </p>
                </div>
              </div>

              <form
                onSubmit={uploadEvent}
                style={{ display: "grid", gap: 16 }}
              >
                <label className="wo-field">
                  <span>Event title</span>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(event) => setEventTitle(event.target.value)}
                    placeholder="e.g. YMART Grand Opening"
                    maxLength={150}
                    required
                  />
                </label>

                <label className="wo-field">
                  <span>Event description</span>
                  <textarea
                    value={eventDescription}
                    onChange={(event) =>
                      setEventDescription(event.target.value)
                    }
                    placeholder="Describe the event..."
                    rows={4}
                  />
                </label>

                <label className="wo-field">
                  <span>Event status</span>
                  <select
                    value={eventStatus}
                    onChange={(event) =>
                      setEventStatus(
                        event.target.value as EventStatus,
                      )
                    }
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                  </select>
                </label>

                <label className="wo-field">
                  <span>
                    Event image · JPG, PNG, WebP or GIF · Maximum 8 MB
                  </span>
                  <input
                    ref={eventFileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) =>
                      setEventFile(event.target.files?.[0] ?? null)
                    }
                    required
                  />
                </label>

                {eventFile && (
                  <div className="wo-notice">
                    Selected: {eventFile.name}
                    <button
                      type="button"
                      aria-label="Remove selected event image"
                      onClick={() => {
                        setEventFile(null);
                        if (eventFileInput.current) {
                          eventFileInput.current.value = "";
                        }
                      }}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                )}

                <div>
                  <button
                    className="wo-primary-button"
                    type="submit"
                    disabled={eventBusy || !eventTitle.trim() || !eventFile}
                  >
                    {eventBusy ? (
                      "Publishing event..."
                    ) : (
                      <>
                        <Icon name="upload" size={17} />
                        Publish event
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <section className="wo-section-heading">
              <div>
                <h2>Event library</h2>
                <p className="wo-muted">
                  {events.filter((item) => item.status === "UPCOMING").length} upcoming ·{" "}
                  {events.filter((item) => item.status === "ONGOING").length} ongoing ·{" "}
                  {events.length} total
                </p>
              </div>
            </section>

            <section className="wo-library-panel">
              {eventsLoading ? (
                <div className="wo-empty-state">
                  <span className="wo-spinner" />
                  <p>Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="wo-empty-state">
                  <div className="wo-empty-icon">
                    <Icon name="calendar" size={30} />
                  </div>
                  <h3>No events published yet</h3>
                  <p>Publish your first event using the form above.</p>
                </div>
              ) : (
                <div className="wo-poster-grid">
                  {events.map((item, index) => {
                    const imageUrl = getEventImageUrl(item.image_url);

                    return (
                      <motion.article
                        className="wo-poster-card"
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.04,
                          duration: 0.3,
                        }}
                        whileHover={{ y: -4 }}
                      >
                        <div className="wo-poster-image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.title}
                              loading="lazy"
                            />
                          ) : (
                            <div className="wo-empty-state">
                              <Icon name="image" size={30} />
                              <p>No event image</p>
                            </div>
                          )}

                          <span
                            className={`wo-status-badge ${
                              item.status === "ONGOING"
                                ? "wo-status-badge--active"
                                : "wo-status-badge--scheduled"
                            }`}
                          >
                            <i />
                            {item.status === "ONGOING"
                              ? "Ongoing"
                              : "Upcoming"}
                          </span>

                          {imageUrl && (
                            <a
                              className="wo-preview-link"
                              href={imageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open image <Icon name="arrow" size={15} />
                            </a>
                          )}
                        </div>

                        <div className="wo-poster-details">
                          <div className="wo-poster-title-row">
                            <h3 title={item.title}>{item.title}</h3>
                          </div>

                          {item.description && (
                            <p className="wo-muted">
                              {item.description}
                            </p>
                          )}

                          <div className="wo-poster-date">
                            <Icon name="calendar" size={15} />
                            <span>
                              Added {formatDate(item.created_at)}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 14,
                            }}
                          >
                            <button
                              className="wo-secondary-button"
                              type="button"
                              disabled={eventBusy}
                              onClick={() =>
                                void changeEventStatus(
                                  item,
                                  item.status === "UPCOMING"
                                    ? "ONGOING"
                                    : "UPCOMING",
                                )
                              }
                            >
                              <Icon
                                name={
                                  item.status === "UPCOMING"
                                    ? "check"
                                    : "clock"
                                }
                                size={16}
                              />
                              Mark as{" "}
                              {item.status === "UPCOMING"
                                ? "Ongoing"
                                : "Upcoming"}
                            </button>

                            <button
                              className="wo-secondary-button"
                              type="button"
                              disabled={eventBusy}
                              onClick={() => void deleteEvent(item)}
                              style={{ color: "#ffb5a1" }}
                            >
                              <Icon name="trash" size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}

              <div className="wo-library-footer">
                <span>{events.length} events</span>
                <span>
                  <i className="wo-online-dot" /> Connected to Supabase
                </span>
              </div>
            </section>

            <PageFooter />
          </div>
        ) : adminSection === "careers" ? (
          <div className="wo-content">
            <motion.section className="wo-page-heading" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div>
                <p className="wo-eyebrow">PEOPLE &amp; HIRING <span>/</span> 04</p>
                <h1>Careers<span>.</span></h1>
                <p className="wo-muted">Manage job vacancies shown on the existing YMART Careers page. Applications open in the applicant’s email app.</p>
              </div>
              <motion.button className="wo-secondary-button" type="button" onClick={() => void loadCareerJobs()} whileTap={{ scale: 0.96 }}><Icon name="refresh" size={17} /> Refresh vacancies</motion.button>
            </motion.section>

            {message && <motion.div className={`wo-notice ${error ? "wo-notice--error" : ""}`} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{message}<button type="button" onClick={() => notify("")} aria-label="Dismiss message"><Icon name="close" size={16} /></button></motion.div>}

            <section className="wo-library-panel" style={{ padding: 20 }}>
              <div className="wo-section-heading" style={{ marginTop: 0 }}>
                <div><h2>{editingCareerId ? "Edit vacancy" : "Create a vacancy"}</h2><p className="wo-muted">Set the role, outlet, hiring status, and email address that applicants should contact.</p></div>
              </div>
              <form onSubmit={saveCareerJob} style={{ display: "grid", gap: 16 }}>
                <div className="career-admin-grid">
                  <label className="wo-field"><span>Job title *</span><input value={careerDraft.title} onChange={(e) => updateCareerDraft("title", e.target.value)} placeholder="e.g. Accountant" maxLength={150} required /></label>
                  <label className="wo-field"><span>Department</span><input value={careerDraft.department ?? ""} onChange={(e) => updateCareerDraft("department", e.target.value)} placeholder="e.g. Finance" maxLength={100} /></label>
                  <label className="wo-field"><span>Outlet location *</span><select value={careerDraft.outlet} onChange={(e) => updateCareerDraft("outlet", e.target.value)} required>{CAREER_OUTLETS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                  <label className="wo-field"><span>Employment type *</span><select value={careerDraft.employment_type} onChange={(e) => updateCareerDraft("employment_type", e.target.value)} required>{["Full-time", "Part-time", "Contract", "Temporary", "Internship"].map((value) => <option key={value}>{value}</option>)}</select></label>
                  <label className="wo-field"><span>Location shown to applicants *</span><input value={careerDraft.location} onChange={(e) => updateCareerDraft("location", e.target.value)} placeholder="Kasaragod, Kerala" required /></label>
                  <label className="wo-field"><span>Salary / pay range</span><input value={careerDraft.salary ?? ""} onChange={(e) => updateCareerDraft("salary", e.target.value)} placeholder="e.g. ₹15,000–₹20,000 per month" /></label>
                  <label className="wo-field"><span>Experience required</span><input value={careerDraft.experience ?? ""} onChange={(e) => updateCareerDraft("experience", e.target.value)} placeholder="e.g. Fresher / 1–2 years" /></label>
                  <label className="wo-field"><span>Application deadline</span><input type="date" value={careerDraft.application_deadline ?? ""} onChange={(e) => updateCareerDraft("application_deadline", e.target.value)} /></label>
                  <label className="wo-field"><span>Recruitment email *</span><input type="email" value={careerDraft.recruitment_email} onChange={(e) => updateCareerDraft("recruitment_email", e.target.value)} placeholder="careers@example.com" required /></label>
                  <label className="wo-field"><span>Vacancy status *</span><select value={careerDraft.status} onChange={(e) => updateCareerDraft("status", e.target.value as CareerStatus)}>{Object.entries(CAREER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>
                <label className="wo-field"><span>Job description *</span><textarea value={careerDraft.description} onChange={(e) => updateCareerDraft("description", e.target.value)} placeholder="Introduce the role and its purpose..." rows={4} required /></label>
                <label className="wo-field"><span>Responsibilities</span><textarea value={careerDraft.responsibilities ?? ""} onChange={(e) => updateCareerDraft("responsibilities", e.target.value)} placeholder="One responsibility per line" rows={4} /></label>
                <label className="wo-field"><span>Qualifications &amp; requirements</span><textarea value={careerDraft.qualifications ?? ""} onChange={(e) => updateCareerDraft("qualifications", e.target.value)} placeholder="Education, skills, experience, languages..." rows={4} /></label>
                <label className="wo-field"><span>Benefits / additional details</span><textarea value={careerDraft.benefits ?? ""} onChange={(e) => updateCareerDraft("benefits", e.target.value)} placeholder="Benefits, shift details, or other information" rows={3} /></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button className="wo-primary-button" type="submit" disabled={careerBusy}>{careerBusy ? "Saving..." : <><Icon name="check" size={17} /> {editingCareerId ? "Save changes" : "Save vacancy"}</>}</button>
                  {editingCareerId && <button className="wo-secondary-button" type="button" disabled={careerBusy} onClick={resetCareerDraft}>Cancel editing</button>}
                </div>
              </form>
            </section>

            <section className="wo-section-heading"><div><h2>Vacancy library</h2><p className="wo-muted">{careerJobs.filter((job) => ["actively_hiring", "limited_openings", "closing_soon"].includes(job.status)).length} open · {careerJobs.filter((job) => job.status === "draft").length} drafts · {careerJobs.length} total</p></div></section>
            <section className="wo-library-panel">
              {careerLoading ? <div className="wo-empty-state"><span className="wo-spinner" /><p>Loading vacancies...</p></div> : careerJobs.length === 0 ? <div className="wo-empty-state"><div className="wo-empty-icon"><Icon name="grid" size={30} /></div><h3>No vacancies created yet</h3><p>Create your first job vacancy using the form above.</p></div> : <div className="career-admin-list">
                {careerJobs.map((job) => (
                  <article className="career-admin-card" key={job.id}>
                    <div className="career-admin-card__top"><div><p className="wo-eyebrow">{job.department || "YMART CAREERS"} · {CAREER_OUTLETS.find((item) => item.value === job.outlet)?.label ?? job.outlet}</p><h3>{job.title}</h3><p className="wo-muted">{job.employment_type} · {job.location}{job.salary ? ` · ${job.salary}` : ""}</p></div><span className={`career-admin-status career-admin-status--${job.status}`}>{CAREER_STATUS_LABELS[job.status]}</span></div>
                    <p className="career-admin-description">{job.description}</p>
                    <p className="wo-muted">Apply email: {job.recruitment_email}{job.application_deadline ? ` · Deadline: ${job.application_deadline}` : ""}</p>
                    <div className="career-admin-actions"><label className="wo-field"><span>Change status</span><select value={job.status} disabled={careerBusy} onChange={(e) => void changeCareerStatus(job, e.target.value as CareerStatus)}>{Object.entries(CAREER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="wo-secondary-button" type="button" disabled={careerBusy} onClick={() => editCareerJob(job)}>Edit</button><button className="wo-secondary-button" type="button" disabled={careerBusy} onClick={() => void deleteCareerJob(job)} style={{ color: "#ffb5a1" }}><Icon name="trash" size={16} /> Delete</button></div>
                  </article>
                ))}
              </div>}
              <div className="wo-library-footer"><span>{careerJobs.length} vacancies</span><span><i className="wo-online-dot" /> Connected to Supabase</span></div>
            </section>
            <PageFooter />
          </div>
        ) : null}
      </main>

      <AnimatePresence>
        {uploadOpen && adminSection === "offers" && (
          <motion.div
            className="wo-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !busy) setUploadOpen(false);
            }}
          >
            <motion.section
              className="wo-upload-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wo-upload-title"
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="wo-modal-header">
                <div>
                  <p className="wo-eyebrow">CAMPAIGN STUDIO</p>
                  <h2 id="wo-upload-title">Create new campaign<span>.</span></h2>
                  <p className="wo-muted">Upload posters and set the publishing window.</p>
                </div>
                <button
                  className="wo-icon-button"
                  onClick={() => !busy && setUploadOpen(false)}
                  aria-label="Close upload window"
                  disabled={busy}
                >
                  <Icon name="close" />
                </button>
              </div>

              <form onSubmit={uploadPosters}>
                <label className="wo-field">
                  <span>Campaign title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. This week's special offers"
                    required
                  />
                </label>

                <label className="wo-field">
                  <span>Hypermarket</span>
                  <select
                    value={outlet}
                    onChange={(event) => setOutlet(event.target.value as OutletId)}
                  >
                    {OUTLETS.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </label>

                <div
                  className={`wo-dropzone ${dragging ? "wo-dropzone--active" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInput.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInput.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    onChange={handleFileChange}
                  />
                  <motion.div
                    className="wo-drop-icon"
                    animate={dragging ? { y: -5, scale: 1.08 } : { y: 0, scale: 1 }}
                  >
                    <Icon name="uploadCloud" size={27} />
                  </motion.div>
                  <strong>{dragging ? "Drop your posters here" : "Drag & drop your posters"}</strong>
                  <span>or <b>browse files</b> from your device</span>
                  <small>JPG, PNG or WebP · Maximum 5 MB each · Up to 20 files</small>
                </div>

                {previews.length > 0 && (
                  <div className="wo-upload-previews">
                    <div className="wo-preview-heading">
                      <strong>Selected images</strong>
                      <span>{files.length} selected</span>
                    </div>
                    <div className="wo-preview-grid">
                      {previews.map(({ file, url }) => (
                        <div className="wo-preview-item" key={`${file.name}-${file.lastModified}`}>
                          <img src={url} alt={file.name} />
                          <span title={file.name}>{file.name}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => setFiles((previous) => previous.filter((item) => item !== file))}
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="wo-date-grid">
                  <label className="wo-field">
                    <span><Icon name="calendar" size={15} /> Publish from</span>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(event) => {
                        const value = event.target.value;
                        setStartsAt(value);
                        if (value && expiresAt.slice(0, 10) !== value.slice(0, 10)) {
                          setExpiresAt(`${value.slice(0, 10)}T22:00`);
                        }
                      }}
                      required
                    />
                  </label>

                  <label className="wo-field">
                    <span><Icon name="clock" size={15} /> Expiry time</span>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      min={startsAt}
                      onChange={(event) => setExpiresAt(event.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="wo-schedule-hint">
                  <Icon name="clock" size={17} />
                  <span>Posters automatically disappear at expiry. Permanent deletion is handled by your scheduled cleanup service.</span>
                </div>

                {message && (
                  <div className={`wo-notice ${error ? "wo-notice--error" : ""}`}>
                    {message}
                  </div>
                )}

                <div className="wo-modal-actions">
                  <button
                    type="button"
                    className="wo-secondary-button"
                    disabled={busy}
                    onClick={() => setUploadOpen(false)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    className="wo-primary-button"
                    type="submit"
                    disabled={busy || files.length === 0}
                    whileTap={{ scale: 0.98 }}
                  >
                    {busy ? (
                      <><span className="wo-button-spinner" /> Uploading...</>
                    ) : (
                      <><Icon name="upload" size={18} /> Upload campaign <Icon name="arrow" size={17} /></>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="wo-page-footer">
      <span>© {new Date().getFullYear()} YMART Retail Group</span>
      <span>Built for better retail experiences <b>✳</b></span>
    </footer>
  );
}
