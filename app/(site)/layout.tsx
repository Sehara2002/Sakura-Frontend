import Navbar from "@/components/Navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <canvas id="sakuraCanvas" suppressHydrationWarning />
      <Navbar />
      {children}
      <script src="/js/sakura.js"></script>
    </>
  );
}
