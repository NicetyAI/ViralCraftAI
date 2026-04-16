import { ClientSwitcher } from "@/components/client-switcher";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralCraftAI",
  description: "Bootstrap app shell for ViralCraftAI"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-6">
              <Link
                className="font-serif text-lg font-bold text-blue-800"
                href="/"
              >
                ViralCraft AI
              </Link>
              <nav className="flex gap-4 text-sm font-medium text-stone-600">
                <Link className="hover:text-blue-700" href="/clients">
                  Clients
                </Link>
              </nav>
            </div>
            <ClientSwitcher />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
