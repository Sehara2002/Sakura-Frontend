import "./globals.css";

export const metadata = {
  title: "Sakuraverse",
  icons: { icon: "/images/favicon.png" },
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
