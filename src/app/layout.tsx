import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Code_Pro } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex/client-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ThemeProvider } from "next-themes";

import "@/styles/fonts/techna-sans.css";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "react-error-boundary";
import { globalErrorFallback } from "@/components/global-error";

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
  title: "jovochat",
  description: "AI Chat App",
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
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1" />
          <meta name="theme-color" content="#000000" />
          <meta httpEquiv="Pragma" content="cache" />
          <meta name="robots" content="INDEX,FOLLOW" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body
          className={`h-dvh min-h-full w-full overflow-x-hidden ${fontSans.variable} ${fontMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            <ErrorBoundary fallbackRender={globalErrorFallback}>
              <ConvexClientProvider>
                {children}
                <Toaster richColors position="top-center" />
              </ConvexClientProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
