import * as React from 'react';

interface WelcomeEmailProps {
  email: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  email,
}) => (
  <div style={{
    fontFamily: 'sans-serif',
    backgroundColor: '#f8fafc',
    padding: '40px 20px',
    color: '#0f172a'
  }}>
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        backgroundColor: '#f43f5e',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>BeachAtlas</h1>
      </div>

      <div style={{ padding: '32px' }}>
        <h2 style={{ marginTop: 0 }}>Welcome to Paradise! 🏖️</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#475569' }}>
          Thanks for joining the BeachAtlas community! We're thrilled to have you on board.
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#475569' }}>
          You'll be the first to know about:
        </p>
        <ul style={{ color: '#475569' }}>
          <li>Hidden gem beaches around the world</li>
          <li>Curated travel tips and guides</li>
          <li>New features to help you find your perfect escape</li>
        </ul>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a href="https://best-beachs.vercel.app" style={{
            backgroundColor: '#f43f5e',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Explore Beaches
          </a>
        </div>
      </div>

      <div style={{
        padding: '24px',
        backgroundColor: '#f1f5f9',
        textAlign: 'center',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <p>You're receiving this because you signed up for BeachAtlas with {email}.</p>
        <p>© 2026 BeachAtlas. All rights reserved.</p>
      </div>
    </div>
  </div>
);
