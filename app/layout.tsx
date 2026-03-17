import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greater Sudbury Snow Plow Cost Calculator",
  description: "Estimate citywide residential driveway plowing costs for the City of Greater Sudbury",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
