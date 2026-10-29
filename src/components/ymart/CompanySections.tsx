import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./ImmersiveSections";
import { AH } from "@/components/fx/Heading";
import { aboutStory, companyDetails, partnerTracks, productCategories, team, whyYmart } from "@/lib/ymart-content";

function Avatar({ initials, photo, name }: { initials: string; photo: string; name: string }) {
  const [ok, setOk] = useState(true);
  return (
    <span className="team-avatar">
      {ok ? <img src={photo} alt={name} loading="lazy" onError={() => setOk(false)} /> : null}
      {!ok && <span aria-hidden="true">{initials}</span>}
    </span>
  );
}

/** Vision, mission, and the people behind YMART. Sits directly under AboutSection. */
export function VisionTeamSection() {
  return (
    <section className="vt-section" id="team" data-nav-section>
      <div className="section-wrap">
        <div className="vt-statements">
          <Reveal>
            <h3>Our vision</h3>
            <p>{aboutStory.vision}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h3>Our mission</h3>
            <p>{aboutStory.mission}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <h3>The YMART family</h3>
            <p>{aboutStory.family}</p>
          </Reveal>
        </div>
        <Reveal><AH as="h2" className="vt-heading">The people <em>behind YMART.</em></AH></Reveal>
        <ul className="team-list">
          {team.map((m, i) => (
            <li key={m.name}>
              <Reveal delay={i * 0.07}>
                <Avatar initials={m.initials} photo={m.photo} name={m.name} />
                <strong>{m.name}</strong>
                <span className="team-role">{m.role}</span>
                <p>{m.bio}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The nine product categories from the original catalogue. */
export function CategoriesSection() {
  return (
    <section className="cat-section" id="categories-list" data-nav-section>
      <div className="section-wrap cat-layout">
        <Reveal className="cat-intro">
          <AH as="h2">Nine aisles, <em>one roof.</em></AH>
          <p>{aboutStory.intro}</p>
        </Reveal>
        <ul className="cat-list">
          {productCategories.map((c, i) => (
            <li key={c.name}>
              <Reveal delay={Math.min(i, 5) * 0.04}>
                <strong>{c.name}</strong>
                <span>{c.note}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const mailHref = (subject: string) => `mailto:${companyDetails.email}?subject=${encodeURIComponent(`YMART — ${subject}`)}`;

/** Suppliers, landlords, franchise, bulk buyers. */
export function PartnerSection() {
  const [active, setActive] = useState(partnerTracks[0].id);
  const track = partnerTracks.find((t) => t.id === active) ?? partnerTracks[0];
  return (
    <section className="partner-section section-light" id="partner" data-nav-section>
      <div className="section-wrap">
        <Reveal><AH as="h2" className="partner-heading">Partner <em>with us.</em></AH></Reveal>
        <div className="partner-layout">
          <div className="partner-tabs" role="tablist" aria-label="Ways to partner with YMART">
            {partnerTracks.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls="partner-panel"
                type="button"
                onClick={() => setActive(t.id)}
              >
                <strong>{t.title}</strong>
                <span>{t.who}</span>
              </button>
            ))}
          </div>
          <div className="partner-panel" id="partner-panel" role="tabpanel" aria-labelledby={`tab-${track.id}`} key={track.id}>
            <p>{track.copy}</p>
            <a className="partner-cta" href={mailHref(track.subject)}>{track.cta} <ArrowUpRight size={15} aria-hidden="true" /></a>
            <p className="partner-note">Opens an email to {companyDetails.email}. Include your name, company, location and phone number.</p>
          </div>
        </div>
        <ul className="why-list" aria-label="Why partner with YMART">
          {whyYmart.map((w) => <li key={w}>{w}</li>)}
        </ul>
      </div>
    </section>
  );
}
