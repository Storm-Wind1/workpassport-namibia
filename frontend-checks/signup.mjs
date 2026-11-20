import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch();
try {
  for (const business of [false, true]) {
    const page = await browser.newPage({ viewport: { width: business ? 390 : 1100, height: 850 } });
    page.on("pageerror", error => console.log("Browser error", error.message));
    page.on("console", msg => { if (msg.type() === "error") console.log(msg.text()); });
    await page.goto("http://127.0.0.1:5173");
    const main = page.getByRole("main");
    await main.getByRole("heading", { name: "What is a WorkPassport?" }).waitFor();
    assert.equal(await main.locator('a[href="/opportunities"], a[href="/talent"], input').count(), 0);
    await main.getByRole("button", { name: "Ask WorkPassport" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "What is WorkPassport?" }).click();
    await dialog.getByRole("log").getByText(/portable work profile/).waitFor();
    await page.keyboard.press("Escape");
    await main.getByRole("link", { name: "Sign up" }).click();
    await main.getByRole("radio", { name: "Individual" }).check();
    await main.getByRole("button", { name: "Next" }).click();
    await main.getByLabel("Full name").fill("Demo Worker");
    if (business) {
      await main.getByRole("button", { name: "Back" }).click();
      await main.getByRole("radio", { name: "Business" }).check();
      await main.getByRole("button", { name: "Next" }).click();
      assert.equal(await main.getByLabel("Business / trading name").inputValue(), "");
      await main.getByLabel("Business / trading name").fill("Demo Workshop");
      await main.getByLabel("Industry / category").selectOption("Carpentry");
      await main.getByLabel("Contact person’s name").fill("Demo Owner");
    }
    await main.getByRole("button", { name: "Help with this step" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByText(business ? /Use a made-up trading name/ : /Use a made-up name, email/).waitFor();
    await page.keyboard.press("Escape");
    await main.getByLabel(business ? "Business email" : "Email", {exact:true}).fill("demo@example.test");
    await main.getByLabel(business ? "City / town" : "Town", {exact:true}).selectOption("Windhoek");
    await main.getByRole("button", { name: "Next" }).click();
    assert.equal(await main.locator('input:checked').count(), 0);
    await main.getByRole("checkbox", {name: business ? "Recruit workers" : "Find work", exact:true}).check();
    await main.getByRole("button", { name: "Next" }).click();
    await main.getByRole("checkbox").check();
    await main.getByRole("button", { name: "Create demo profile" }).click();
    await page.waitForURL("**/dashboard");
    if (business) await main.getByRole("heading", {name:"Business administration"}).waitFor();
    await page.getByRole("button", {name:"Ask WorkPassport", exact:true}).click();
    await page.getByRole("dialog").getByRole("button",{name:"How do I change my activities?"}).click();
    await page.getByRole("log").getByText(/Open Dashboard/).waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button",{name:"Sign out of demo"}).click();
    await page.goto("http://127.0.0.1:5173/login");
    await page.getByRole("button",{name:"Resume saved demo on this device"}).click();
    await page.waitForURL("**/dashboard");
    await page.close();
  }
} finally {
  await browser.close();
}
