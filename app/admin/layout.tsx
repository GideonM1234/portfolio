import type { Metadata } from "next";

// The admin page is private: keep it out of search results and link previews.
export const metadata: Metadata = {
  title: "Site admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
