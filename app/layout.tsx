import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canecas — feita do seu jeito",
  description: "Escolha um modelo e personalize sua caneca com inteligência artificial.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
