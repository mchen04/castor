import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Castor · Local workspace', description: 'Business facts, reference pages and approved public sources in one local workspace.' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
