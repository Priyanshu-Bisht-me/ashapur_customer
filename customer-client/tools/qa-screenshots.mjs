import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const BASE_URL = process.env.QA_BASE_URL || "http://localhost:5174";
const API_BASE_URL = process.env.QA_API_BASE_URL || "http://localhost:5000";
const OUT_DIR = process.env.QA_OUT_DIR || "qa-screenshots";
const CUSTOMER_STORAGE_STATE_PATH = process.env.QA_STORAGE_STATE || "qa-storage-state.json";
const ADMIN_STORAGE_STATE_PATH = process.env.QA_ADMIN_STORAGE_STATE || "qa-admin-storage-state.json";
const ADMIN_SEED_KEY = process.env.QA_ADMIN_SEED_KEY || "aasapure_secure_key";
const QA_CUSTOMER_EMAIL = process.env.QA_CUSTOMER_EMAIL || "qa.screenshots@aasapure.local";
const QA_CUSTOMER_PASSWORD = process.env.QA_CUSTOMER_PASSWORD || "QaScreenshots_123!";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 }
];

const ROUTES = [
  { key: "login", path: "/login", auth: false },
  { key: "signup", path: "/signup", auth: false },
  { key: "dashboard", path: "/dashboard", auth: "customer" },
  { key: "shop", path: "/shop", auth: "customer" },
  { key: "product-milk", path: "/products/milk", auth: "customer" },
  { key: "cart", path: "/cart", auth: "customer" },
  { key: "checkout", path: "/checkout", auth: "customer" },
  { key: "orders", path: "/orders", auth: "customer" },
  { key: "subscriptions", path: "/subscriptions", auth: "customer" },
  { key: "rewards", path: "/rewards", auth: "customer" },
  { key: "profile", path: "/profile", auth: "customer" },
  { key: "admin-login", path: "/admin/login", auth: false },
  { key: "admin-dashboard", path: "/admin/dashboard", auth: "admin" },
  { key: "admin-orders", path: "/admin/orders", auth: "admin" },
  { key: "admin-products", path: "/admin/products", auth: "admin" },
  { key: "admin-customers", path: "/admin/customers", auth: "admin" },
  { key: "admin-subscriptions", path: "/admin/subscriptions", auth: "admin" }
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function safeFileKey(value) {
  return value
    .replaceAll("/", "-")
    .replaceAll("?", "-")
    .replaceAll("=", "-")
    .replaceAll("&", "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/(^-|-$)/g, "")
    .toLowerCase();
}

async function waitForAppIdle(page) {
  await page.waitForLoadState("domcontentloaded");

  // Best-effort waits to avoid capturing loader states.
  await page
    .waitForFunction(() => !document.querySelector(".loader-block"), null, { timeout: 8000 })
    .catch(() => {});

  await page
    .waitForFunction(
      () =>
        Array.from(document.images).every((image) => {
          if (!image.currentSrc) {
            return true;
          }

          return image.complete;
        }),
      null,
      { timeout: 8000 }
    )
    .catch(() => {});

  await page.waitForTimeout(250);
}

async function ensureAuthStorage(browser) {
  if (await fileExists(CUSTOMER_STORAGE_STATE_PATH)) {
    return CUSTOMER_STORAGE_STATE_PATH;
  }

  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(QA_CUSTOMER_EMAIL);
  await page.locator('input[name="password"]').fill(QA_CUSTOMER_PASSWORD);

  try {
    await Promise.all([
      page.waitForURL(/\/dashboard(\?|$)/, { timeout: 10000 }),
      page.getByRole("button", { name: "Login" }).click()
    ]);
  } catch {
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "domcontentloaded" });

    await page.locator('input[name="name"]').fill("QA Customer");
    await page.locator('input[name="email"]').fill(QA_CUSTOMER_EMAIL);
    await page.locator('input[name="password"]').fill(QA_CUSTOMER_PASSWORD);
    await page.locator('input[name="phone"]').fill("9999999999");
    await page.locator('input[name="line1"]').fill("123 Test Street");
    await page.locator('input[name="city"]').fill("Pune");
    await page.locator('input[name="state"]').fill("MH");
    await page.locator('input[name="pincode"]').fill("411001");

    await Promise.all([
      page.waitForURL(/\/dashboard(\?|$)/, { timeout: 20000 }),
      page.getByRole("button", { name: "Create account" }).click()
    ]);
  }

  // Seed cart so Cart/Checkout pages render realistic content.
  await page.goto(`${BASE_URL}/products/milk`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await waitForAppIdle(page);
  const addToCartButton = page.getByRole("button", { name: "Add to cart" });
  if (await addToCartButton.count()) {
    await addToCartButton.first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
  }

  await context.storageState({ path: CUSTOMER_STORAGE_STATE_PATH });
  await context.close();

  console.log(`Created QA account storage state at ${CUSTOMER_STORAGE_STATE_PATH}`);
  console.log(`Email: ${QA_CUSTOMER_EMAIL}`);
  console.log(`Password: ${QA_CUSTOMER_PASSWORD}`);

  return CUSTOMER_STORAGE_STATE_PATH;
}

async function ensureAdminStorage(browser) {
  if (await fileExists(ADMIN_STORAGE_STATE_PATH)) {
    return ADMIN_STORAGE_STATE_PATH;
  }

  await fetch(`${API_BASE_URL}/api/auth/seed-admin`, {
    method: "POST",
    headers: {
      "x-seed-key": ADMIN_SEED_KEY
    }
  });

  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill("admin@aasapure.com");
  await page.locator('input[name="password"]').fill("admin123");

  await Promise.all([
    page.waitForURL(/\/admin\/dashboard(\?|$)/, { timeout: 20000 }),
    page.getByRole("button", { name: "Login to admin" }).click()
  ]);

  await context.storageState({ path: ADMIN_STORAGE_STATE_PATH });
  await context.close();

  console.log(`Created admin QA storage state at ${ADMIN_STORAGE_STATE_PATH}`);

  return ADMIN_STORAGE_STATE_PATH;
}

function getStorageStateByRoute(route, customerStorageStatePath, adminStorageStatePath) {
  if (route.auth === "customer") {
    return customerStorageStatePath;
  }

  if (route.auth === "admin") {
    return adminStorageStatePath;
  }

  return undefined;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const reportRows = [];

  try {
    const customerStorageStatePath = await ensureAuthStorage(browser);
    const adminStorageStatePath = await ensureAdminStorage(browser);

    for (const viewport of VIEWPORTS) {
      for (const route of ROUTES) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          storageState: getStorageStateByRoute(route, customerStorageStatePath, adminStorageStatePath)
        });
        const page = await context.newPage();
        const consoleMessages = [];
        const pageErrors = [];
        page.on("console", (message) => {
          consoleMessages.push({
            type: message.type(),
            text: message.text()
          });
        });
        page.on("pageerror", (error) => {
          pageErrors.push(error.message);
        });

        const url = `${BASE_URL}${route.path}`;
        const startedAt = new Date().toISOString();

        const errors = [];
        const warnings = [];

        await page.goto(url, { waitUntil: "domcontentloaded" });
        await waitForAppIdle(page);

        for (const msg of consoleMessages) {
          if (msg.type === "error") {
            errors.push(msg.text);
          } else if (msg.type === "warning") {
            warnings.push(msg.text);
          }
        }

        errors.push(...pageErrors);

        const overflowX = await page
          .evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
          .catch(() => false);

        const fileName = `${safeFileKey(route.key)}-${viewport.name}.png`;
        const outPath = path.join(OUT_DIR, fileName);

        await page.screenshot({ path: outPath, fullPage: true });

        reportRows.push({
          startedAt,
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          key: route.key,
          path: route.path,
          url,
          overflowX,
          errors,
          warnings,
          screenshot: fileName
        });

        process.stdout.write(
          `${viewport.name.padEnd(7)} ${route.key.padEnd(14)} overflowX=${overflowX ? "YES" : "no"}\n`
        );

        await context.close();
      }
    }

    await fs.writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(reportRows, null, 2), "utf8");
    console.log(`\nSaved ${reportRows.length} screenshots to ${OUT_DIR}/`);
    console.log(`Saved report to ${OUT_DIR}/report.json`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
