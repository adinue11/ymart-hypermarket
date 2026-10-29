
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Wordmark } from "@/components/ymart/Chrome";
import { AH } from "@/components/fx/Heading";
import { Reveal } from "@/components/ymart/ImmersiveSections";
import { supabase } from "@/lib/supabase";

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
  status: string;
};

const OUTLET_NAMES: Record<string, string> = {
  naimarmoola: "Naimarmoola",
  "cherkala-new": "Cherkala New",
  nellikatta: "Nellikatta",
  cherkala: "Cherkala",
};

const PUBLIC_STATUSES = [
  "actively_hiring",
  "limited_openings",
  "closing_soon",
];

function lines(value: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDeadline(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function emailApplication(job: CareerJob) {
  const outlet = OUTLET_NAMES[job.outlet] ?? job.outlet;
  const subject = `Application for ${job.title} – YMART ${outlet}`;

  const body = [
    "Dear YMART Hiring Team,",
    "",
    `I would like to apply for the ${job.title} position at YMART ${outlet}.`,
    "",
    "Please find my CV attached for your consideration.",
    "",
    "Thank you for your time.",
    "",
    "Best regards,",
    "[Your Name]",
  ].join("\n");

  window.location.href =
    `mailto:${job.recruitment_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CareerJobDetails() {
  const [, params] = useRoute("/careers/:id");
  const jobId = params?.id;

  const [job, setJob] = useState<CareerJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadJob() {
      setLoading(true);
      setLoadError(false);

      if (!jobId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ymart_careers")
        .select("*")
        .eq("id", jobId)
        .in("status", PUBLIC_STATUSES)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setLoadError(true);
        setJob(null);
      } else {
        const result = data as CareerJob | null;
        const expired =
          result?.application_deadline &&
          new Date(`${result.application_deadline}T00:00:00`) <
            new Date(new Date().setHours(0, 0, 0, 0));

        setJob(result && !expired ? result : null);
      }

      setLoading(false);
    }

    void loadJob();

    return () => {
      alive = false;
    };
  }, [jobId]);

  return (
    <main className="careers-page">
      <header className="careers-header">
        <Wordmark />
        <Link href="/careers">
          <span className="careers-back">
            <ArrowLeft size={15} /> Back to Careers
          </span>
        </Link>
      </header>

      <section className="careers-opportunities">
        {loading ? (
          <div className="careers-empty">
            <RefreshCw
              className="careers-loading-icon"
              size={22}
            />
            <h3>Loading job details...</h3>
          </div>
        ) : loadError ? (
          <div className="careers-empty">
            <h3>Unable to load this vacancy.</h3>
            <p>Please try again later.</p>
            <Link href="/careers">Return to Careers</Link>
          </div>
        ) : !job ? (
          <div className="careers-empty">
            <h3>This vacancy is no longer available.</h3>
            <p>It may have closed or reached its application deadline.</p>
            <Link href="/careers">View other opportunities</Link>
          </div>
        ) : (
          <Reveal>
            <p className="careers-eyebrow">
              {job.department || "CAREERS AT YMART"}
            </p>

            <AH as="h1">{job.title}</AH>

            <div className="careers-job-meta">
              <span>
                <MapPin size={15} />
                {OUTLET_NAMES[job.outlet] ?? job.outlet} · {job.location}
              </span>

              <span>
                <BriefcaseBusiness size={15} />
                {job.employment_type}
              </span>

              {job.experience && <span>{job.experience}</span>}
              {job.salary && <span>{job.salary}</span>}

              {job.application_deadline && (
                <span>
                  <CalendarDays size={15} />
                  Apply by {formatDeadline(job.application_deadline)}
                </span>
              )}
            </div>

            <article className="careers-job-card">
              <div className="careers-job-detail">
                <h4>Job Description</h4>
                <p className="careers-job-description">
                  {job.description}
                </p>
              </div>

              {lines(job.responsibilities).length > 0 && (
                <div className="careers-job-detail">
                  <h4>Responsibilities</h4>
                  <ul>
                    {lines(job.responsibilities).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lines(job.qualifications).length > 0 && (
                <div className="careers-job-detail">
                  <h4>Qualifications &amp; Requirements</h4>
                  <ul>
                    {lines(job.qualifications).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lines(job.benefits).length > 0 && (
                <div className="careers-job-detail">
                  <h4>Benefits &amp; Additional Details</h4>
                  <ul>
                    {lines(job.benefits).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="careers-job-card__footer">
                <span>
                  <Mail size={15} /> Apply by email
                </span>

                <button
                  type="button"
                  className="careers-apply"
                  onClick={() => emailApplication(job)}
                >
                  Apply by Email <ArrowUpRight size={16} />
                </button>
              </div>
            </article>
          </Reveal>
        )}
      </section>

      <footer className="careers-footer">
        <Wordmark inverse />
        <Link href="/">Return to the YMART experience ↗</Link>
      </footer>
    </main>
  );
}
