import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, CalendarDays, MapPin, Mail, RefreshCw } from "lucide-react";
import { Wordmark } from "@/components/ymart/Chrome";
import { AH } from "@/components/fx/Heading";
import { Reveal } from "@/components/ymart/ImmersiveSections";
import { supabase } from "@/lib/supabase";

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
};

const OUTLET_NAMES: Record<string, string> = {
  naimarmoola: "Naimarmoola",
  "cherkala-new": "Cherkala New",
  nellikatta: "Nellikatta",
  cherkala: "Cherkala",
};
const STATUS_LABELS: Record<CareerStatus, string> = {
  draft: "Draft", actively_hiring: "Actively Hiring", limited_openings: "Limited Openings",
  closing_soon: "Closing Soon", paused: "Paused", position_closed: "Position Closed",
};
const PUBLIC_STATUSES: CareerStatus[] = ["actively_hiring", "limited_openings", "closing_soon"];

function formatDeadline(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}
function lines(value: string | null) {
  return (value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
function emailApplication(job: CareerJob) {
  const outletName = OUTLET_NAMES[job.outlet] ?? job.outlet;
  const subject = `Application for ${job.title} – YMART ${outletName}`;
  const body = [
    "Dear YMART Hiring Team,", "", `I would like to apply for the ${job.title} position at YMART ${outletName}.`,
    "", "Please find my CV attached for your consideration.", "", "Thank you for your time.", "", "Best regards,", "[Your Name]",
  ].join("\n");
  window.location.href = `mailto:${job.recruitment_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Careers() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadJobs() {
      setLoading(true);
      const { data, error } = await supabase.from("ymart_careers").select("*")
        .in("status", PUBLIC_STATUSES).order("created_at", { ascending: false });
      if (!alive) return;
      if (error) {
        setLoadError(true);
        setJobs([]);
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setLoadError(false);
        setJobs(((data ?? []) as CareerJob[]).filter((job) => !job.application_deadline || new Date(`${job.application_deadline}T00:00:00`) >= today));
      }
      setLoading(false);
    }
    void loadJobs();
    return () => { alive = false; };
  }, []);

  return (
    <main className="careers-page">
      <header className="careers-header">
        <Wordmark />
        <Link href="/"><span className="careers-back"><ArrowLeft size={15} /> Back to YMART</span></Link>
      </header>

      <section className="careers-hero">
        <p className="careers-eyebrow">CAREERS AT YMART</p>
        <AH as="h1" delay={0.6}>Your next chapter starts here.</AH>
        <p className="careers-intro">Great experiences begin with great people. Join the team making everyday shopping better.</p>
        <a className="careers-cta" href="#opportunities">Explore opportunities <ArrowUpRight size={17} /></a>
        <span className="careers-index">PEOPLE MAKE THE DIFFERENCE — YMART</span>
      </section>

      <section className="careers-opportunities" id="opportunities">
        <p className="careers-eyebrow">GROW WITH US</p>
        <AH as="h2">Current opportunities</AH>
        {loading ? (
          <div className="careers-empty"><RefreshCw className="careers-loading-icon" size={22} /><h3>Finding your next opportunity.</h3><p>Loading current vacancies from YMART.</p></div>
        ) : loadError ? (
          <div className="careers-empty"><h3>Vacancies are temporarily unavailable.</h3><p>Please try again in a little while, or check back later.</p><button className="careers-retry" onClick={() => window.location.reload()}>Try again <RefreshCw size={15} /></button></div>
        ) : jobs.length === 0 ? (
          <Reveal><div className="careers-empty"><h3>No open positions right now.</h3><p>We're not listing any vacancies at the moment. Please check back later for future opportunities.</p></div></Reveal>
        ) : (
          <div className="careers-job-list">
            {jobs.map((job, index) => {
              const statusLabel = STATUS_LABELS[job.status];

            return (
            <Reveal key={job.id}>
            <Link href={`/careers/${job.id}`}>
            <article
              className="careers-job-card"
              style={{ animationDelay: `${index * 50}ms` }}>
            <div className="careers-job-card__top">
              <div>
                <p className="careers-job-department">
                  {job.department || "CAREERS AT YMART"}
                </p>
                <h3>{job.title}</h3>
              </div>

              <span
                className={`careers-job-status careers-job-status--${job.status}`}>
                {statusLabel}
              </span>
            </div>

            <div className="careers-job-meta">
              <span>
              <MapPin size={15} />
              {OUTLET_NAMES[job.outlet] ?? job.outlet} · {job.location}
              </span>

              <span>
                <BriefcaseBusiness size={15} />
                {job.employment_type}
              </span>

              <span className="careers-job-view">
                View job details <ArrowUpRight size={16} />
              </span>
            </div>
            </article>
            </Link>
            </Reveal>
            );
        })}
          </div>
        )}
      </section>

      <footer className="careers-footer"><Wordmark inverse /><Link href="/">Return to the YMART experience ↗</Link></footer>
    </main>
  );
}
