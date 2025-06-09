import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Code_Pro } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex/client-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ThemeProvider } from "next-themes";

import "@/styles/fonts/techna-sans.css";
import "@/styles/globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  preload: true,
  display: "swap",
  variable: "--font-sans",
});

const fontMono = Source_Code_Pro({
  subsets: ["latin"],
  preload: true,
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AI Chat App",
  description: "Chat with AI's",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <head>
          <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1" />
          <meta name="theme-color" content="#000000" />
          <meta httpEquiv="Pragma" content="cache" />
          <meta name="robots" content="INDEX,FOLLOW" />
          <link rel="manifest" href="/manifest.json" />
        </head>

        <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
