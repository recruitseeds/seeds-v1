import baseConfig from "@seeds/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}", "../../packages/editor/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
