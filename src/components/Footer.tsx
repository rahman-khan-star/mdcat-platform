import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Subjects", href: "/subjects" },
    { label: "Quizzes", href: "/quiz" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Leaderboard", href: "/leaderboard" },
  ],
  Resources: [
    { label: "Study Guides", href: "#" },
    { label: "Past Papers", href: "#" },
    { label: "Video Lectures", href: "#" },
    { label: "Flashcards", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                MDCAT<span className="text-primary">Pro</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Your comprehensive platform for MDCAT preparation with practice quizzes, progress tracking, and more.
            </p>
            <div className="mt-6 space-y-2">
              <a href="mailto:info@mdcatpro.com" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                info@mdcatpro.com
              </a>
              <a href="tel:+923001234567" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +92 300 123 4567
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-6">
          <p className="text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} MDCAT Pro. All rights reserved. Built for Pakistani medical aspirants.
          </p>
        </div>
      </div>
    </footer>
  );
}
