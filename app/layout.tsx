import "./globals.css";

export const metadata = {
  title: "Sakuraverse",
  icons: { icon: "/images/favicon.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // ✅ important for iPhone notch
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sakura page-with-nav">
        {children}
      </body>
    </html>
  );
}
