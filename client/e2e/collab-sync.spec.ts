import { test, expect } from "@playwright/test";

test("two users can edit the same room in real-time", async ({ browser }) => {
  const userA = await browser.newContext();
  const userB = await browser.newContext();

  const pageA = await userA.newPage();
  const pageB = await userB.newPage();

  // --- User A: Switch to Register mode FIRST, then fill fields ---
  await pageA.goto("/");
  const emailA = `userA_${Date.now()}@test.com`;

  await pageA.getByText("Don't have an account? Register").click();
  await pageA.getByPlaceholder("Name").fill("User A");
  await pageA.getByPlaceholder("Email").fill(emailA);
  await pageA.getByPlaceholder("Password").fill("password123");
  await pageA.getByRole("button", { name: "Register" }).click();

  await pageA.getByText("Create New Room").click();

  await pageA.waitForSelector("text=Room:");
  const roomText = await pageA.locator("text=Room:").textContent();
  const roomId = roomText?.replace("Room: ", "").trim();

  // --- User B: Switch to Register mode FIRST, then fill fields ---
  await pageB.goto("/");
  const emailB = `userB_${Date.now()}@test.com`;

  await pageB.getByText("Don't have an account? Register").click();
  await pageB.getByPlaceholder("Name").fill("User B");
  await pageB.getByPlaceholder("Email").fill(emailB);
  await pageB.getByPlaceholder("Password").fill("password123");
  await pageB.getByRole("button", { name: "Register" }).click();

  await pageB.getByPlaceholder("Enter room ID").fill(roomId!);
  await pageB.getByText("Join Room").click();

  await pageA.locator(".monaco-editor").click();
await pageA.keyboard.type("console.log('hello from user A')");

// Auto-retrying assertion — waits up to 10s, checking repeatedly
await expect(pageB.locator(".view-lines")).toContainText("hello from user A", {
  timeout: 10000,
});
})