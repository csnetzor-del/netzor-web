export const siteContact = {
  email: "admin@netzor.in",
  whatsappUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/?text=Hello%20NETZOR",
  whatsappLabel: "Chat on WhatsApp",
};

export const companyStats = [
  { value: "500", label: "Projects Completed" },
  { value: "200", label: "Happy Clients" },
  { value: "50", label: "Expert Team" },
  { value: "24/7", label: "Support Available" },
] as const;

export const whyChooseNetzor = {
  title: "Why Choose NETZOR?",
  description:
    "NETZOR is a leading IT solutions provider, delivering comprehensive technology services to businesses of all sizes. Our team of experts combines deep technical knowledge with business acumen to deliver solutions that drive real results.",
};
