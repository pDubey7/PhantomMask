/**
 * Root layout for Next.js App Router
 * Required for App Router structure
 */

export const metadata = {
  title: 'PhantomMask v1',
  description: 'Protocol and tooling project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
