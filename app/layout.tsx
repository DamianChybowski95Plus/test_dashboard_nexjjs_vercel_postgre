import "@/app/ui/global.css"
import { inter } from "./ui/fonts";
import { Metadata } from 'next';

// Wygodny sposób dodawania metadanych; choć można też w html'u poniżej
export const metadata: Metadata = {
  title: 'Acme Dashboard',
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({ children, } : { children: React.ReactNode; }) {
    return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
