/** Local AI-generated marketing imagery — self-hosted in /public/marketing */

const img = (name: string) => `/marketing/${name}.webp`;

export const siteImages = {
  hero: {
    portal: img("hero-portal"),
    ai: img("hero-ai"),
    consulting: img("hero-consulting"),
  },
  home: {
    servicesBg: img("services-bg"),
    softwareDelivery: img("software-delivery"),
    cloudSecurity: img("cloud-security"),
    portalCta: img("portal-cta"),
  },
  sections: {
    about: img("about"),
    contact: img("contact"),
    contactStats: img("contact-stats"),
    contactForm: img("contact-form"),
    services: img("services-bg"),
    delivery: img("software-delivery"),
    security: img("cloud-security"),
    data: img("hero-portal"),
    cta: img("portal-cta"),
  },
} as const;

/** One distinct image per service slug (home cards + previews) */
export const serviceImagesBySlug: Record<string, string> = {
  cybersecurity: img("cybersecurity"),
  "help-desk-support": img("contact-form"),
  "managed-it-services": img("managed-it-services"),
  "network-support": img("network-support"),
  "ai-machine-learning": img("hero-ai"),
  "data-analytics": img("hero-portal"),
  "it-consulting": img("hero-consulting"),
  "digital-transformation": img("digital-transformation"),
  "software-development": img("software-development"),
  "internet-of-things": img("internet-of-things"),
  "hardware-installation": img("hardware-installation"),
  "technical-support": img("technical-support"),
  "data-backup-recovery": img("data-backup-recovery"),
  "qa-testing": img("qa-testing"),
};

const fallbackByIcon: Record<string, string> = {
  shield: serviceImagesBySlug.cybersecurity,
  headphones: serviceImagesBySlug["help-desk-support"],
  cloud: serviceImagesBySlug["network-support"],
  code: serviceImagesBySlug["software-development"],
  palette: serviceImagesBySlug["digital-transformation"],
};

export function getServiceImage(slug: string, iconKey?: string): string {
  if (serviceImagesBySlug[slug]) return serviceImagesBySlug[slug];
  if (iconKey && fallbackByIcon[iconKey]) return fallbackByIcon[iconKey];
  return siteImages.home.servicesBg;
}

export function getServiceImageAlt(slug: string, title: string): string {
  const alts: Record<string, string> = {
    cybersecurity: "Cybersecurity and threat monitoring",
    "help-desk-support": "IT help desk support team",
    "managed-it-services": "Managed IT operations and servers",
    "network-support": "Network infrastructure and cabling",
    "ai-machine-learning": "Artificial intelligence technology",
    "data-analytics": "Business data analytics dashboards",
    "it-consulting": "IT consulting strategy session",
    "digital-transformation": "Digital transformation planning",
    "software-development": "Software development team coding",
    "internet-of-things": "Internet of Things connected devices",
    "hardware-installation": "Hardware installation and setup",
    "technical-support": "On-site technical support engineer",
    "data-backup-recovery": "Data backup and recovery systems",
    "qa-testing": "Quality assurance and software testing",
  };
  return alts[slug] ?? `${title} service`;
}
