import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const baseConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const config = withMDX(baseConfig) as NextConfig;

// @next/mdx@16.x generates Turbopack rules with an unserializable regex condition
// (condition: { path: /\.mdx$/ }) which crashes Turbopack. Override with a proper
// glob-based rule while preserving the resolveAlias that @next/mdx sets.
config.turbopack = {
  ...(config.turbopack ?? {}),
  rules: {
    "*.{md,mdx}": {
      loaders: [
        {
          loader: "@mdx-js/loader",
          options: { providerImportSource: "next-mdx-import-source-file" },
        },
      ],
      as: "*.tsx",
    },
  },
};

export default config;
