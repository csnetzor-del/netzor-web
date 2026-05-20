import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  await trackEvent("layout_view", "/public");

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
