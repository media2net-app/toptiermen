import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ebooks Setup - Admin Panel',
  description: 'Setup ebooks database and add first ebook for Academy lessons',
};

export default function EbooksSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      {children}
    </>
  );
}
