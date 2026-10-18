import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  EnvelopeSimple,
  Phone,
  LinkedinLogo,
  GlobeHemisphereEast,
  Check,
  Copy,
  PaperPlaneTilt
} from "@phosphor-icons/react";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ open, onOpenChange }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleCopy = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] bg-card rounded-card shadow-2xl z-50 flex flex-col border border-hairline outline-none animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-hairline flex items-center justify-between shrink-0 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <EnvelopeSimple size={22} weight="bold" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-medium font-display text-text-primary">
                  Contact & Developer Information
                </Dialog.Title>
                <Dialog.Description className="text-xs text-text-secondary">
                  Direct contact with the Secure-Regent development and architecture team
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Developer Contact Card */}
            <div className="p-5 rounded-card bg-canvas/70 border border-hairline shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-soft text-accent font-display font-semibold text-base flex items-center justify-center shrink-0 border border-accent/20">
                    KG
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary font-display flex items-center gap-2">
                      <span>Karthikeya Ganugula</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-positive/10 text-positive border border-positive/20">
                        Lead Developer
                      </span>
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Platform Architect & Frontend Engineer · Secure-Regent
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-hairline text-xs font-medium text-text-secondary">
                  <GlobeHemisphereEast size={14} className="text-accent" />
                  <span>India 🇮🇳</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {/* Email */}
                <div className="p-3 bg-card rounded-tile border border-hairline flex items-center justify-between gap-2">
                  <a
                    href="mailto:karthikeyaganugula07@gmail.com"
                    className="flex items-center gap-2 text-text-primary hover:text-accent font-medium truncate"
                  >
                    <EnvelopeSimple size={16} className="text-accent shrink-0" />
                    <span className="truncate">karthikeyaganugula07@gmail.com</span>
                  </a>
                  <button
                    onClick={() => handleCopy("karthikeyaganugula07@gmail.com", "email")}
                    className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-canvas transition-colors shrink-0"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check size={14} className="text-positive" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Phone */}
                <div className="p-3 bg-card rounded-tile border border-hairline flex items-center justify-between gap-2">
                  <a
                    href="tel:9281461306"
                    className="flex items-center gap-2 text-text-primary hover:text-accent font-medium"
                  >
                    <Phone size={16} className="text-positive shrink-0" />
                    <span>+91 9281461306</span>
                  </a>
                  <button
                    onClick={() => handleCopy("9281461306", "phone")}
                    className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-canvas transition-colors shrink-0"
                    title="Copy phone"
                  >
                    {copiedPhone ? <Check size={14} className="text-positive" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* LinkedIn */}
                <div className="p-3 bg-card rounded-tile border border-hairline flex items-center justify-between gap-2">
                  <a
                    href="https://www.linkedin.com/in/karthikeya-ganugula"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-text-primary hover:text-accent font-medium truncate"
                  >
                    <LinkedinLogo size={16} className="text-[#0A66C2] shrink-0" />
                    <span className="truncate">karthikeya-ganugula</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/karthikeya-ganugula"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-accent hover:underline font-medium shrink-0"
                  >
                    Open ↗
                  </a>
                </div>

                {/* Location */}
                <div className="p-3 bg-card rounded-tile border border-hairline flex items-center gap-2 text-text-secondary">
                  <GlobeHemisphereEast size={16} className="text-accent shrink-0" />
                  <span className="font-medium text-text-primary">Country: India 🇮🇳</span>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <PaperPlaneTilt size={16} className="text-accent" />
                  <span>Send a Direct Message</span>
                </h4>
                <span className="text-[11px] text-text-tertiary">
                  Responses typically within 24 hours
                </span>
              </div>

              {formSubmitted ? (
                <div className="p-5 rounded-tile bg-positive/10 border border-positive/20 text-center space-y-2 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-positive text-white flex items-center justify-center mx-auto">
                    <Check size={18} weight="bold" />
                  </div>
                  <div className="text-sm font-semibold text-positive">
                    Message Sent Successfully!
                  </div>
                  <div className="text-xs text-text-secondary">
                    Thank you. Karthikeya Ganugula has received your inquiry at karthikeyaganugula07@gmail.com.
                  </div>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-2 text-xs text-accent hover:underline font-medium inline-block"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3 py-2 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enterprise deployment, customization, or technical query"
                      className="w-full px-3 py-2 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full px-3 py-2 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-2 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:bg-canvas transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-accent-contrast text-xs font-medium hover:opacity-90 shadow-sm transition-all"
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
