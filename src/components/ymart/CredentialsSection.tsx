import { useState } from "react";
import { ArrowUpRight, FileCheck2, Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "./ImmersiveSections";
import { AH } from "@/components/fx/Heading";
import { companyDetails, credentials, type Credential } from "@/lib/ymart-content";

const isPdf = (file: string) => file.toLowerCase().endsWith(".pdf");

function CredentialRow({ item, index }: { item: Credential; index: number }) {
  const [thumbOk, setThumbOk] = useState(true);
  const showThumb = item.file && !isPdf(item.file) && thumbOk;
  return (
    <li className="cred-row">
      <span className="cred-row__thumb" aria-hidden="true">
        {showThumb ? (
          <img src={item.file} alt="" loading="lazy" onError={() => setThumbOk(false)} />
        ) : (
          <FileCheck2 size={22} strokeWidth={1.3} />
        )}
      </span>
      <div className="cred-row__main">
        <strong>{item.title}</strong>
        <p>
          {[item.issuer, item.number && `No. ${item.number}`, item.validUntil && `Valid until ${item.validUntil}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {item.file && (
        <a
          className="cred-row__view"
          href={item.file}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${item.title}`}
          data-index={index}
        >
          View <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
    </li>
  );
}

export function CredentialsSection() {
  const c = companyDetails;
  return (
    <section className="cred-section" id="credentials" data-nav-section>
      <div className="section-wrap cred-layout">
        <div className="cred-intro">
          <Reveal>
            <AH as="h2">Certified,<br /><em>and on record.</em></AH>
            <p className="cred-lead">The registered details and certificates behind {c.legalName}.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="cred-facts">
              <div><dt>Registered name</dt><dd>{c.legalName}</dd></div>
              <div><dt><MapPin size={13} aria-hidden="true" /> Registered office</dt><dd>{c.registeredOffice}</dd></div>
              <div><dt><Phone size={13} aria-hidden="true" /> Phone</dt><dd><a href={`tel:${c.phone}`}>{c.phone}</a> · <a href={`tel:${c.mobile.replace(/\s/g, "")}`}>{c.mobile}</a></dd></div>
              <div><dt><Mail size={13} aria-hidden="true" /> Email</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd></div>
            </dl>
          </Reveal>
        </div>
        <Reveal className="cred-register" delay={0.12}>
          <h3 className="cred-register__title">Certificates &amp; licences</h3>
          <ul className="cred-list">
            {credentials.map((item, i) => <CredentialRow item={item} index={i} key={item.id} />)}
          </ul>
          <ul className="cred-bullets">
            {c.facts.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
