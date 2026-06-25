"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/job-summary", label: "Job Summary" },
  { href: "/interview-questions", label: "Interview Questions" },
  { href: "/mock-interview", label: "Mock Interview" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="md:w-60 md:shrink-0 md:border-r md:border-gray-200 md:min-h-screen md:py-10 md:px-5 border-b border-gray-200 px-4 py-3 md:flex md:flex-col bg-white">
      <Link href="/" className="hidden md:block font-display text-lg font-bold text-blue mb-10 focus-ring rounded">
        ⚡ DashFetch
      </Link>
      <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-ring ${
                  isActive ? "bg-blue text-white shadow-sm" : "text-gray-600 hover:bg-blue-pale hover:text-blue"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hidden md:block mt-auto pt-10">
        <Link href="/" className="block w-full text-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-pale hover:text-blue transition-colors focus-ring">
          New Analysis
        </Link>
      </div>
    </nav>
  );
}
