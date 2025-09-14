// src/app/not-found.js
import Link from 'next/link'; // next/link component එක import කරන්න

export default function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '50px',
      fontFamily: 'sans-serif'
    }}>
      <h1>404 - පිටුව සොයාගත නොහැක</h1>
      <p>ඔබ සොයන පිටුව නොපවතියි.</p>
      
      {/* login page එකට යාමට link එක */}
      <Link href="/login" style={{
        marginTop: '20px',
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px'
      }}>
        Login පිටුවට යන්න
      </Link>
    </div>
  );
}