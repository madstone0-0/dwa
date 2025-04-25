/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MODE: string;
	readonly VITE_API_BASE: string;
	readonly VITE_BASE_URL: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "*.svg" {
	const content: string;
	export default content;
}

declare module "*.css" {
	const content: { [className: string]: string };
	export default content;
}
