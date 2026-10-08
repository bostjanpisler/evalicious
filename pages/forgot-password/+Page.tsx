import { Head } from "vike-react/Head";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
			<Head>
				<meta name="robots" content="noindex" />
			</Head>
			<ForgotPasswordForm />
		</div>
	);
}
