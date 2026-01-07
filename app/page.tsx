/**
 * Minimal demo page (optional)
 * Next.js App Router page
 */

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>PhantomMask v1</h1>
      <p>Protocol and tooling project</p>
      <p>API endpoints:</p>
      <ul>
        <li><code>/api/derive</code></li>
        <li><code>/api/sign</code></li>
      </ul>
    </main>
  );
}
