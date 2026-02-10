import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vike from "vike/plugin";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		vike({
			prerender: false,
		}),
		devServer({
			entry: "./server/index.ts",
			exclude: [
				/^\/@.+$/,
				/.*\.(ts|tsx|vue)($|\?)/,
				/.*\.(s?css|less)($|\?)/,
				/^\/favicon\.ico$/,
				/.*\.(svg|png|jpg|jpeg|gif|webp|avif)($|\?)/,
				/^\/(public|assets|static|fonts)\/.+/,
				/^\/node_modules\/.*/,
			],
			injectClientScript: false,
		}),
	],
	resolve: {
		alias: {
			"@": import.meta.dirname,
		},
	},
	envPrefix: "PUBLIC_ENV__",
	server: {
		port: 3100,
	},
	ssr: {
		external: [
			"@prisma/client",
			"@prisma/adapter-pg",
			"better-auth",
			"stripe",
			"resend",
			"@aws-sdk/client-s3",
			"@aws-sdk/s3-request-presigner",
			"@sanity/client",
		],
	},
});
