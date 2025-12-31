export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <canvas id="sakuraCanvas" suppressHydrationWarning />
      {children}
      <script src="/js/sakura.js"></script>
    </>
  );
}
