import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Explorium Audience Builder",
  description: "Build targeted prospect lists with Explorium data intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
