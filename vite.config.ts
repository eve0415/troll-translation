import browserEcho from "@browser-echo/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths({ root: ".", configNames: ["tsconfig.cloudflare.json"] }),
		tailwindcss(),
		tanstackStart(),
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		cloudflare(),
		devtoolsJson(),
		browserEcho({
			injectHtml: false,
			stackMode: "condensed",
		}),
	],
	build: { cssMinify: "lightningcss", minify: true },
});
