import "./globals.css";

export const metadata = {
  title: "Sakura",
  description: "The story of unseen truth of life",
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-sakura">
        {children}
      </body>
    </html>
  );
}
