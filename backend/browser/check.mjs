import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch();
try {
  const owner = await browser.newPage();
  const worker = await browser.newPage();
  async function register(page, name) {
    page.on("response", res => { if (res.url().includes("/api/")) console.log(new URL(res.url()).pathname, res.status()); });
    await page.goto("http://127.0.0.1:8000");
    await page.getByText("Sign in to post a job or apply.").waitFor();
    await page.getByLabel("Email", {exact:true}).fill(name + Date.now() + "@example.test");
    await page.getByLabel("Password", {exact:true}).fill("a long browser test password");
    await page.getByLabel("Name for a new account").fill(name);
    await page.getByRole("button",{name:"Create account"}).click();
    await page.getByText("Signed in.", {exact:true}).waitFor();
    assert.equal((await page.request.get("http://127.0.0.1:8000/api/me")).status(), 200);
  }
  await register(owner, "TestEmployer");
  const post = owner.locator("#post");
  for (const [field, value] of Object.entries({Title:"Repair classroom desks",Town:"Windhoek",Category:"Carpentry",Description:"Repair three desks"})) {
    await post.getByLabel(field,{exact:true}).fill(value);
  }
  await post.getByRole("button",{name:"Publish job"}).click();
  await owner.getByText("Job published.",{exact:true}).waitFor();
  await register(worker, "TestApplicant");
  const job = worker.getByRole("article").filter({has:worker.getByRole("heading",{name:"Repair classroom desks"})});
  await job.getByLabel("Application message").fill("I can repair these desks.");
  await job.getByRole("button",{name:"Apply",exact:true}).click();
  await worker.getByText("Application submitted.",{exact:true}).waitFor();
  await owner.reload();
  const inbox = owner.locator("#applications");
  await inbox.getByText("I can repair these desks.",{exact:true}).waitFor();
  assert.equal(await inbox.getByRole("heading",{name:"Repair classroom desks"}).count(),1);
} finally {
  await browser.close();
}
