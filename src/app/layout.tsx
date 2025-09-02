
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { dir } from 'i18next';
import { PT_Sans, Space_Grotesk } from 'next/font/google';
import { AnimatedBackground } from '@/components/shared/animated-background';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


export const metadata: Metadata = {
  title: 'Student Toolkit',
  description: 'The ultimate toolkit for students.',
};

export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: {
    lng: string;
  }
}>) {
  const { lng = 'en' } = params;
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'font-body antialiased',
          ptSans.variable,
          spaceGrotesk.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatedBackground />
          <div className="relative z-10">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
