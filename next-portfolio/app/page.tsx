export default function HomePage() {
  return (
    <main style={{fontFamily:'Inter, system-ui, sans-serif', padding:'3rem 1.5rem', maxWidth:960, margin:'0 auto'}}>
      <header style={{marginBottom:'2.5rem'}}>
        <h1 style={{fontSize:'2.4rem', lineHeight:1.2, margin:'0 0 1rem'}}>Md Akhinoor Islam</h1>
        <p style={{fontSize:'1.05rem', color:'#475569', maxWidth:640}}>Engineering student (Energy Science & Engineering, KUET) – exploring SOLIDWORKS, Arduino, electronics and web technology. This Next.js version is the foundation for a future dynamic portfolio.</p>
      </header>
      <section style={{marginBottom:'3rem'}}>
        <h2 style={{fontSize:'1.4rem'}}>Sections (Planned Migration)</h2>
        <ul style={{lineHeight:1.7, paddingLeft:'1.2rem'}}>
          <li>Hero + Animated intro</li>
          <li>About with stats & skills</li>
          <li>Projects (static data → API driven)</li>
          <li>Interactive SOLIDWORKS navigator (component)</li>
          <li>Contact form (API route + validation)</li>
        </ul>
      </section>
      <section style={{marginBottom:'3rem'}}>
        <h2 style={{fontSize:'1.35rem'}}>Next Steps</h2>
        <ol style={{lineHeight:1.6, paddingLeft:'1.2rem'}}>
          <li>Port current styling into modular CSS / Tailwind</li>
          <li>Add image optimization via next/image</li>
          <li>Introduce structured project data (JSON or CMS)</li>
          <li>Add serverless contact endpoint (/api/contact)</li>
          <li>Enable incremental enhancements (animations, dark mode)</li>
        </ol>
      </section>
      <footer style={{fontSize:'.75rem', color:'#64748b'}}>Draft scaffold • Next.js App Router • Deploy to Vercel for instant previews.</footer>
    </main>
  );
}
