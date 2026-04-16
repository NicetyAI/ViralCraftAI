import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("app shell bootstrap", () => {
  it("includes required environment variables in .env.example", () => {
    const envExamplePath = resolve(process.cwd(), ".env.example");

    expect(existsSync(envExamplePath)).toBe(true);

    const contents = readFileSync(envExamplePath, "utf8");
    expect(contents).toContain("DATABASE_URL=");
    expect(contents).toContain("NEXTAUTH_SECRET=");
    expect(contents).toContain("KIE_API_KEY=");
  });
});
