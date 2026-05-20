export type ServiceCategory = "core" | "advanced";

export type ServiceCatalogItem = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  shortDesc: string;
  features: string[];
  category: ServiceCategory;
  icon: string;
  sortOrder: number;
};

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  core: "Core IT Services",
  advanced: "Specialized & Advanced Services",
};

export const servicesCatalog: ServiceCatalogItem[] = [
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    emoji: "🛡️",
    description:
      "Protecting systems and data through comprehensive security services including network security, firewall management, and 24/7 threat monitoring to keep your business safe.",
    shortDesc: "Network security, firewalls, and 24/7 threat monitoring.",
    features: [
      "Network Security",
      "Firewall Management",
      "Threat Monitoring",
      "Security Audits",
    ],
    category: "core",
    icon: "shield",
    sortOrder: 1,
  },
  {
    slug: "help-desk-support",
    title: "Help Desk Support",
    emoji: "💬",
    description:
      "Round-the-clock technical support for all your IT needs. Quick resolution of software bugs, password resets, and user problems to keep your team productive.",
    shortDesc: "24/7 support for software, access, and user issues.",
    features: [
      "24/7 Support",
      "Software Bug Resolution",
      "Password Resets",
      "User Problem Solving",
    ],
    category: "core",
    icon: "headphones",
    sortOrder: 2,
  },
  {
    slug: "managed-it-services",
    title: "Managed IT Services",
    emoji: "⚙️",
    description:
      "Complete outsourcing of your IT infrastructure and operations. Let us handle your technology so you can focus on your core business.",
    shortDesc: "Full IT operations outsourced and proactively managed.",
    features: [
      "Infrastructure Management",
      "Proactive Monitoring",
      "Cost Optimization",
      "Scalable Solutions",
    ],
    category: "core",
    icon: "cloud",
    sortOrder: 3,
  },
  {
    slug: "network-support",
    title: "Network Support",
    emoji: "🌐",
    description:
      "Expert services for setup, management, and maintenance of your network infrastructure. Ensuring reliable connectivity and optimal performance.",
    shortDesc: "Setup, management, and maintenance of your networks.",
    features: [
      "Network Setup",
      "Infrastructure Management",
      "Performance Optimization",
      "Maintenance & Updates",
    ],
    category: "core",
    icon: "cloud",
    sortOrder: 4,
  },
  {
    slug: "ai-machine-learning",
    title: "AI & Machine Learning",
    emoji: "🤖",
    description:
      "Developing cutting-edge AI-driven solutions including intelligent agent development and custom machine learning models to automate and enhance your business processes.",
    shortDesc: "AI agents, ML models, and intelligent automation.",
    features: [
      "AI Agent Development",
      "Machine Learning Models",
      "Natural Language Processing",
      "Predictive Analytics",
    ],
    category: "advanced",
    icon: "code",
    sortOrder: 5,
  },
  {
    slug: "data-analytics",
    title: "Data Analytics",
    emoji: "📊",
    description:
      "Transform your data into actionable insights through advanced business intelligence and data visualization services that drive informed decision-making.",
    shortDesc: "BI, visualization, and predictive modeling.",
    features: [
      "Business Intelligence",
      "Data Visualization",
      "Predictive Modeling",
      "Custom Dashboards",
    ],
    category: "advanced",
    icon: "palette",
    sortOrder: 6,
  },
  {
    slug: "it-consulting",
    title: "IT Consulting",
    emoji: "💼",
    description:
      "Expert advice on technology strategy, architecture, and implementation. Strategic guidance to align technology with your business objectives.",
    shortDesc: "Strategy, architecture, and implementation guidance.",
    features: [
      "Technology Strategy",
      "Architecture Design",
      "Implementation Planning",
      "Best Practices",
    ],
    category: "advanced",
    icon: "headphones",
    sortOrder: 7,
  },
  {
    slug: "digital-transformation",
    title: "Digital Transformation",
    emoji: "🚀",
    description:
      "Modernize and automate your business processes through innovative technology solutions. Drive efficiency and competitive advantage.",
    shortDesc: "Automation, cloud migration, and modernization.",
    features: [
      "Process Automation",
      "Cloud Migration",
      "Workflow Optimization",
      "Technology Modernization",
    ],
    category: "advanced",
    icon: "cloud",
    sortOrder: 8,
  },
  {
    slug: "software-development",
    title: "Software Development",
    emoji: "💻",
    description:
      "Building custom software, mobile applications, and enterprise-level solutions tailored to your specific business requirements.",
    shortDesc: "Custom software, mobile apps, and enterprise systems.",
    features: [
      "Custom Software",
      "Mobile Applications",
      "Enterprise Solutions",
      "Web Applications",
    ],
    category: "advanced",
    icon: "code",
    sortOrder: 9,
  },
  {
    slug: "internet-of-things",
    title: "Internet of Things (IoT)",
    emoji: "🔌",
    description:
      "Developing and managing IoT solutions for connected devices. Enable smart operations and real-time data collection across your infrastructure.",
    shortDesc: "Connected devices, management, and smart operations.",
    features: [
      "IoT Development",
      "Device Management",
      "Data Integration",
      "Smart Solutions",
    ],
    category: "advanced",
    icon: "code",
    sortOrder: 10,
  },
  {
    slug: "hardware-installation",
    title: "Hardware Installation & Maintenance",
    emoji: "🔧",
    description:
      "Professional installation, configuration, and upkeep of computer hardware. Ensuring optimal performance and longevity of your equipment.",
    shortDesc: "Install, configure, and maintain your hardware.",
    features: [
      "Hardware Installation",
      "Configuration",
      "Preventive Maintenance",
      "Equipment Upgrades",
    ],
    category: "advanced",
    icon: "shield",
    sortOrder: 11,
  },
  {
    slug: "technical-support",
    title: "Technical Support & Troubleshooting",
    emoji: "🔍",
    description:
      "Rapid diagnosis and resolution of technical problems. Expert troubleshooting to minimize downtime and maintain productivity.",
    shortDesc: "Fast diagnosis and resolution, remote or on-site.",
    features: [
      "Problem Diagnosis",
      "Rapid Resolution",
      "Remote Support",
      "On-Site Service",
    ],
    category: "advanced",
    icon: "headphones",
    sortOrder: 12,
  },
  {
    slug: "data-backup-recovery",
    title: "Data Backup & Recovery",
    emoji: "💾",
    description:
      "Comprehensive backup solutions and disaster recovery planning. Protect your critical data with automated backups and recovery strategies.",
    shortDesc: "Automated backups and disaster recovery planning.",
    features: [
      "Automated Backups",
      "Disaster Recovery Plans",
      "Data Restoration",
      "Business Continuity",
    ],
    category: "advanced",
    icon: "cloud",
    sortOrder: 13,
  },
  {
    slug: "qa-testing",
    title: "QA & Testing",
    emoji: "✅",
    description:
      "Ensuring software quality through comprehensive testing methods. From unit testing to integration and performance testing.",
    shortDesc: "Quality assurance across the full testing lifecycle.",
    features: [
      "Quality Assurance",
      "Automated Testing",
      "Performance Testing",
      "Security Testing",
    ],
    category: "advanced",
    icon: "code",
    sortOrder: 14,
  },
];

export function parseServiceFeatures(features: string): string[] {
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
