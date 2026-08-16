import { Mastra } from "@mastra/core";

/**
 * Primary Mastra instance entrypoint for Sapphire agent orchestration.
 */
export const mastra = Mastra.init({
  name: "sapphire",
  systemHostURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  routeRegistrationPath: "/api/mastra",
  db: {
    provider: "postgresql",
    uri: process.env.DATABASE_URL || "postgresql://localhost:5432/sapphire",
  },
  workflows: {
    blueprintDirPath: "./src/mastra/workflows",
    systemApis: [],
    systemEvents: {},
  },
  agents: {
    agentDirPath: "./src/mastra/agents",
    vectorProvider: [],
  },
  integrations: [],
});
