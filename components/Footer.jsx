import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <span className="font-display font-bold text-xl">⚡ DashFetch</span>
          <p className="mt-3 text-sm text-gray-400 max-w-xs leading-relaxed">
            Transforming job descriptions into interview success.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-navy-light flex items-center justify-center hover:bg-blue transition-colors focus-ring">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-navy-light flex items-center justify-center hover:bg-blue transition-colors focus-ring">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/#faq" className="hover:text-white transition-colors focus-ring rounded">FAQ</Link></li>
            <li><Link href="/#contact" className="hover:text-white transition-colors focus-ring rounded">Contact</Link></li>
            <li><Link href="/#about" className="hover:text-white transition-colors focus-ring rounded">About</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Support</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            DashFetch is a project developed to help candidates transform job descriptions into interview success. Built by Chingu V61 Team 34.
          </p>
        </div>
      </div>

      <div className="border-t border-navy-light">
        <p className="text-center text-xs text-gray-500 py-5">
          © 2026 DashFetch Team. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
