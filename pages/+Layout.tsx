import "@/pages/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/shared/ChatWidget";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { PostHogProvider } from "@/components/shared/PostHogProvider";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
			<ChatWidget />
			<CookieConsent />
			<PostHogProvider />
		</div>
	);
}
