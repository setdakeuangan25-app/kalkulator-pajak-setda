import type {Metadata, Viewport} from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Kalkulator Pajak Indonesia (PPh 21 TER, UMKM, Badan & PPN)',
  description: 'Aplikasi kalkulator pajak profesional dan akurat sesuai regulasi perpajakan terbaru di Indonesia (UU HPP, PP 58/2023, PMK 168/2023, PP 55/2022).',
  openGraph: {
    title: 'Kalkulator Pajak Indonesia (PPh 21 TER, UMKM, Badan & PPN)',
    description: 'Aplikasi kalkulator pajak profesional dan akurat sesuai regulasi perpajakan terbaru di Indonesia (UU HPP, PP 58/2023, PMK 168/2023, PP 55/2022).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalkulator Pajak Indonesia (PPh 21 TER, UMKM, Badan & PPN)',
    description: 'Aplikasi kalkulator pajak profesional dan akurat sesuai regulasi perpajakan terbaru di Indonesia (UU HPP, PP 58/2023, PMK 168/2023, PP 55/2022).',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
