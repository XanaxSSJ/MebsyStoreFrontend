import { Link } from 'react-router-dom';

function SocialIcon({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:text-purple-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </a>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Row 1: Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
          {[
            'Sobre nosotros',
            'Blog',
            'Accesibilidad',
            'Socios',
          ].map((label) => (
            <Link
              key={label}
              to="/"
              className="hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Row 2: Social */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <SocialIcon label="Facebook" href="https://facebook.com">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22 12a10 10 0 10-11.563 9.874v-6.987H7.898V12h2.539V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.461h-1.261c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.887h-2.33v6.987A10.003 10.003 0 0022 12z" />
            </svg>
          </SocialIcon>

          <SocialIcon label="Instagram" href="https://instagram.com">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3.5A4.5 4.5 0 1016.5 12 4.505 4.505 0 0012 7.5zm0 2A2.5 2.5 0 1110.5 12 2.503 2.503 0 0112 9.5zM17.75 6a.75.75 0 10.75.75.75.75 0 00-.75-.75z" />
            </svg>
          </SocialIcon>

          <SocialIcon label="X" href="https://x.com">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.9 2H22l-6.8 7.78L23.2 22h-6.6l-5.2-6.7L5.9 22H2.8l7.3-8.35L1 2h6.8l4.7 6.1L18.9 2zm-1.2 18h1.7L7.9 3.9H6.1L17.7 20z" />
            </svg>
          </SocialIcon>

          <SocialIcon label="LinkedIn" href="https://linkedin.com">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4.98 3.5A2.5 2.5 0 102.5 6a2.5 2.5 0 002.48-2.5zM3 8h4v13H3V8zm7 0h3.8v1.8h.1A4.2 4.2 0 0117.7 7.8c4 0 4.7 2.6 4.7 6V21h-4v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-4V8z" />
            </svg>
          </SocialIcon>

          <SocialIcon label="GitHub" href="https://github.com/xanaxssj">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5A11.5 11.5 0 000 12a11.5 11.5 0 008 10.95c.6.11.82-.26.82-.58v-2.02c-3.26.71-3.95-1.4-3.95-1.4-.54-1.37-1.31-1.73-1.31-1.73-1.07-.73.08-.72.08-.72 1.18.08 1.8 1.21 1.8 1.21 1.05 1.8 2.75 1.28 3.42.98.11-.76.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.78 0-1.28.46-2.33 1.2-3.15-.12-.3-.52-1.52.12-3.18 0 0 .98-.31 3.2 1.2a11.1 11.1 0 015.82 0c2.22-1.51 3.2-1.2 3.2-1.2.64 1.66.24 2.88.12 3.18.75.82 1.2 1.87 1.2 3.15 0 4.5-2.75 5.48-5.37 5.77.42.36.8 1.07.8 2.16v3.2c0 .32.22.7.83.58A11.5 11.5 0 0024 12 11.5 11.5 0 0012 .5z" />
            </svg>
          </SocialIcon>
        </div>

        {/* Row 3: Copyright */}
        <p className="mt-2 text-center text-sm text-gray-600">
          © 2026 <span className="font-medium text-purple-600">XanaxSSJ</span>, Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

