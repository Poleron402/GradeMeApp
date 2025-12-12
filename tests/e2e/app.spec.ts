import {test, expect} from "@playwright/test"
import { _electron as electron } from "playwright";

// import path from "path";
// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

async function launchApp() {
  return await electron.launch({
    args: ['.'],
  });
}

// test to ensure the application opens and all necessary UI is present
test("launch app and ensure all necessary UI is present", async () => {
  const app = await launchApp();

  const window = await app.firstWindow();

  await expect(window).toHaveTitle(/GradeMe/);
  await window.waitForTimeout(2000)
  expect(window.getByRole("button", {name: "Select Submissions Folder"})).toBeVisible();
  expect(window.getByRole("button", {name: "Select Submissions Folder"})).toBeVisible();

  expect(window.getByRole("button", {name: "Grade"})).toBeVisible();
  expect(window.getByRole("button", {name: "Grade"})).toBeDisabled();
  
  app.process()?.kill("SIGTERM");
  
});
