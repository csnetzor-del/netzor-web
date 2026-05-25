/** Curated Unsplash imagery — each URL is unique and matched to its section/service */

const u = (id: string, w = 1920) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const siteImages = {
  hero: {
    /** Client portal, dashboards, tracking */
    portal: u("photo-1551288049-bebda4e38f71"),
    /** AI / machine learning */
    ai: u("photo-1677442136019-21780ecad995"),
    /** Consulting & integration — leadership meeting */
    consulting: u("photo-1600880292203-757bb62b4baf"),
  },
  home: {
    /** “Our services” section background — developer workspace */
    servicesBg: u("photo-1498050108023-c5249f4df85a"),
    /** “Secure software delivery” — agile engineering team */
    softwareDelivery: u("photo-1517245386807-b57a40573477", 1200),
    /** “Cloud, data & cybersecurity” — secure data center */
    cloudSecurity: u("photo-1633265486064-07b01f68e0d5", 1200),
    /** “Ready for your client portal?” — modern workspace */
    portalCta: u("photo-1497366754035-fa8fbcd9334f"),
  },
  sections: {
    about: u("photo-1497366216548-37526070297c"),
    contact: u("photo-1577563908411-ef7fdfbc731c"),
    contactStats: u("photo-1521737711864-8a490f34f06f"),
    contactForm: u("photo-1423666639045-b65e1c40e2cd"),
    /** Legacy aliases */
    services: u("photo-1498050108023-c5249f4df85a"),
    delivery: u("photo-1517245386807-b57a40573477", 1200),
    security: u("photo-1633265486064-07b01f68e0d5", 1200),
    data: u("photo-1551288049-bebda4e38f71", 1200),
    cta: u("photo-1497366754035-fa8fbcd9334f"),
  },
} as const;

/** One distinct image per service slug (home cards + previews) */
export const serviceImagesBySlug: Record<string, string> = {
  cybersecurity: u("photo-1555949963-ff6ffe3c8bc1", 800),
  "help-desk-support": u("photo-1577563908411-ef7fdfbc731c", 800),
  "managed-it-services": u("photo-1558494949-ef010cbdcc31", 800),
  "network-support": u("photo-1544197150-99ba2634fbaa", 800),
  "ai-machine-learning": u("photo-1677442136019-21780ecad995", 800),
  "data-analytics": u("photo-1551288049-bebda4e38f71", 800),
  "it-consulting": u("photo-1600880292203-757bb62b4baf", 800),
  "digital-transformation": u("photo-1454165804606-c3d57bc86b40", 800),
  "software-development": u("photo-1461743480684-dccba630e2f6", 800),
  "internet-of-things": u("photo-1518770660439-4636190af475", 800),
  "hardware-installation": u("photo-1581092160562-40aa08f7881a", 800),
  "technical-support": u("photo-1521791136064-7986c2920216", 800),
  "data-backup-recovery": u("photo-1591693113595-bf6129495769", 800),
  "qa-testing": u("photo-1581091226825-a6a2a5aee158", 800),
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
