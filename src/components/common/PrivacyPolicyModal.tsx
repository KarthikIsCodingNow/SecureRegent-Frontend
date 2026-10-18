import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ShieldCheck, LockKey, FileText, EnvelopeSimple, Phone, LinkedinLogo, GlobeHemisphereEast } from "@phosphor-icons/react";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-card rounded-card shadow-2xl z-50 flex flex-col border border-hairline outline-none animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-hairline flex items-center justify-between shrink-0 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <ShieldCheck size={22} weight="bold" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-medium font-display text-text-primary">
                  Privacy Policy & Governance
                </Dialog.Title>
                <Dialog.Description className="text-xs text-text-secondary">
                  Secure-Regent Enterprise Data Sovereignty & Protection Standards
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-canvas transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-text-secondary leading-relaxed">
            <div className="p-3.5 rounded-tile bg-accent-soft/50 border border-accent/20 flex items-start gap-3">
              <LockKey size={18} className="text-accent shrink-0 mt-0.5" weight="fill" />
              <div>
                <div className="font-semibold text-text-primary text-xs">
                  Zero Third-Party Telemetry & Client-Side Sovereignty
                </div>
                <div className="text-[11px] text-text-secondary mt-0.5">
                  Secure-Regent runs entirely client-side without third-party trackers, ad cookies, or cross-site tracking scripts. Your business metrics, contracts, and financial records stay under your absolute operational control.
                </div>
              </div>
            </div>

            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                <span>1. Regulatory Compliance (DPDP Act & GDPR)</span>
              </h4>
              <p>
                Secure-Regent operates in strict adherence to the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act) of India</strong> as well as internationally recognized data stewardship principles embodied in the EU General Data Protection Regulation (GDPR). We ensure lawfulness, purpose limitation, data minimization, and accuracy across all data models.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary">
                2. Information Processed
              </h4>
              <p>
                The Secure-Regent platform processes commercial metadata necessary for business administration and operational analytics:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                <li><strong>Lead inquiries:</strong> Contact names, enterprise companies, Indian cities, and acquisition channels.</li>
                <li><strong>Commercial proposals:</strong> Itemized estimates, services requested, and acceptance/rejection timestamps.</li>
                <li><strong>Deals & contracts:</strong> Contract values, stages, priorities, and sales personnel attribution.</li>
                <li><strong>Financial records:</strong> Invoices, realization dates, and transaction settlement channels (UPI, Bank transfer, Card).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary">
                3. Data Storage & Security Controls
              </h4>
              <p>
                All local simulator datasets and administrative customization settings (palettes, company branding, and KPI targets) are stored in client-side secure browser storage (`localStorage`) using partitioned keys. No corporate data is sold, transferred, or disclosed to advertising brokers.
              </p>
            </section>

            <section className="space-y-3 pt-2 border-t border-hairline">
              <h4 className="text-sm font-semibold text-text-primary">
                4. Data Protection Officer & Platform Developer
              </h4>
              <p>
                For data privacy inquiries, enterprise audits, or technical support regarding Secure-Regent, please contact the developer and platform architect directly:
              </p>

              <div className="p-4 rounded-tile bg-canvas border border-hairline space-y-2 text-xs">
                <div className="font-semibold text-text-primary text-sm">
                  Karthikeya Ganugula
                </div>
                <div className="text-text-tertiary text-[11px]">
                  Lead Platform Architect & Frontend Engineer · Secure-Regent
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <a
                    href="mailto:karthikeyaganugula07@gmail.com"
                    className="flex items-center gap-2 text-accent hover:underline"
                  >
                    <EnvelopeSimple size={14} />
                    <span>karthikeyaganugula07@gmail.com</span>
                  </a>
                  <a
                    href="tel:9281461306"
                    className="flex items-center gap-2 text-text-primary hover:text-accent"
                  >
                    <Phone size={14} />
                    <span>+91 9281461306</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/karthikeya-ganugula"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-accent hover:underline"
                  >
                    <LinkedinLogo size={14} />
                    <span>linkedin.com/in/karthikeya-ganugula</span>
                  </a>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <GlobeHemisphereEast size={14} />
                    <span>Residence: India 🇮🇳</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-hairline bg-canvas/40 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-text-tertiary">
              Last updated: October 2026 · Secure-Regent Enterprise
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2 rounded-full bg-text-primary text-card text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Acknowledge & Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
