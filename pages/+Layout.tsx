import "@/pages/globals.css";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HreflangLinks } from "@/components/layout/HreflangLinks";
import { ChatWidget } from "@/components/shared/ChatWidget";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { PostHogProvider } from "@/components/shared/PostHogProvider";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<HreflangLinks />
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
			<ChatWidget />
			<CookieConsent />
			<PostHogProvider />
		</div>
	);
}
