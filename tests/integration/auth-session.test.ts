import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("Auth password verify", () => {
  it("validates correct password and rejects wrong one", async () => {
    const passwordHash = await hashPassword("secret123");
    await expect(verifyPassword("secret123", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong", passwordHash)).resolves.toBe(false);
  });
});
