import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nabaa Al-Mawaheb - Stadium Booking",
  description: "Book your stadium instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
