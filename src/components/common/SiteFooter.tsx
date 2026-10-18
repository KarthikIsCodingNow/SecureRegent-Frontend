import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  EnvelopeSimple,
  Phone,
  LinkedinLogo,
  GlobeHemisphereEast,
  LockKey,
  ArrowRight,
  UserCheck
} from "@phosphor-icons/react";
import { BrandLogo } from "./BrandLogo";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { ContactModal } from "./ContactModal";
import { useSettingsStore } from "../../store/settingsStore";

export const LandingFooter: React.FC = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const productName = useSettingsStore((s) => s.landing.productName);

  return (
    <>
      <footer className="relative bg-card border-t border-hairline pt-16 pb-12 px-6 sm:px-10 text-text-primary z-10 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-hairline">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={32} />
              <span className="font-display font-semibold text-sm tracking-[0.2em] uppercase text-text-primary">
                {productName}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
              Enterprise financial intelligence, commercial quotation issuance, sales pipeline tracking, and revenue realization platform.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-canvas border border-hairline text-text-secondary">
                <ShieldCheck size={14} className="text-positive" weight="fill" />
                <span>DPDP Act 2023 Compliant</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-canvas border border-hairline text-text-secondary">
                <LockKey size={14} className="text-accent" weight="fill" />
                <span>Zero External Trackers</span>
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-display">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link to="/app" className="hover:text-accent transition-colors">
                  Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/leads" className="hover:text-accent transition-colors">
                  Lead Qualification
                </Link>
              </li>
              <li>
                <Link to="/app/quotations" className="hover:text-accent transition-colors">
                  Quotations & Estimates
                </Link>
              </li>
              <li>
                <Link to="/app/deals" className="hover:text-accent transition-colors">
                  Deals & Revenue Pipeline
                </Link>
              </li>
              <li>
                <Link to="/app/orders" className="hover:text-accent transition-colors">
                  Orders & Collections
                </Link>
              </li>
              <li>
                <Link to="/app/admin" className="hover:text-accent transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-display">
              Governance & Support
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-accent transition-colors text-left font-medium"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="hover:text-accent transition-colors text-left font-medium"
                >
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <span className="text-text-tertiary">
                  Data Sovereignty: Client-Side
                </span>
              </li>
              <li>
                <span className="text-text-tertiary">
                  Encryption: TLS 1.3 / In-Memory
                </span>
              </li>
              <li>
                <span className="text-text-tertiary">
                  Indian Currency: Standard (₹)
                </span>
              </li>
            </ul>
          </div>

          {/* Website Developer Contact Info Showcase */}
          <div className="lg:col-span-4 p-5 rounded-card bg-canvas/70 border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Website Developer Contact
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary">
                <GlobeHemisphereEast size={13} className="text-accent" />
                <span>India 🇮🇳</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-soft text-accent font-display font-semibold text-sm flex items-center justify-center shrink-0 border border-accent/20">
                KG
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">
                  Karthikeya Ganugula
                </div>
                <div className="text-[11px] text-text-secondary truncate">
                  Platform Architect & Frontend Developer
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <a
                href="mailto:karthikeyaganugula07@gmail.com"
                className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors truncate"
              >
                <EnvelopeSimple size={14} className="text-accent shrink-0" />
                <span className="truncate">karthikeyaganugula07@gmail.com</span>
              </a>

              <a
                href="tel:9281461306"
                className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
              >
                <Phone size={14} className="text-positive shrink-0" />
                <span>+91 9281461306</span>
              </a>

              <a
                href="https://www.linkedin.com/in/karthikeya-ganugula"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors truncate"
              >
                <LinkedinLogo size={14} className="text-[#0A66C2] shrink-0" />
                <span className="truncate">linkedin.com/in/karthikeya-ganugula</span>
              </a>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setContactOpen(true)}
                className="flex-1 py-1.5 px-3 rounded-full bg-text-primary text-card text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <span>Send Direct Inquiry</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span>© 2026 {productName}. Enterprise Performance Analytics.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-text-primary transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setContactOpen(true)}
              className="hover:text-text-primary transition-colors underline-offset-4 hover:underline"
            >
              Contact Developer
            </button>
            <span>·</span>
            <span className="text-text-tertiary">
              Developed by Karthikeya Ganugula (India)
            </span>
          </div>
        </div>
      </footer>

      <PrivacyPolicyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
};

export const DashboardFooter: React.FC = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const productName = useSettingsStore((s) => s.landing.productName);

  return (
    <>
      <footer className="mt-12 pt-6 pb-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span className="font-medium text-text-primary">{productName} v1.0</span>
          </div>
          <span className="text-hairline">|</span>
          <span className="text-text-tertiary">Enterprise Analytics</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setPrivacyOpen(true)}
            className="hover:text-text-primary transition-colors hover:underline"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            onClick={() => setContactOpen(true)}
            className="hover:text-text-primary transition-colors hover:underline"
          >
            Contact
          </button>
          <span>·</span>
          <button
            onClick={() => setContactOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card hover:bg-canvas border border-hairline text-text-primary transition-colors font-medium shadow-sm"
          >
            <UserCheck size={14} className="text-accent" />
            <span>Developer: Karthikeya Ganugula (India)</span>
          </button>
        </div>
      </footer>

      <PrivacyPolicyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
};
