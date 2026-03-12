/**
 * ──────────────────────────────────────────────────────────────
 * dToggl E2E Test Helpers
 * ──────────────────────────────────────────────────────────────
 * Shared utilities used across every test file.
 * Provides registration, login, API shortcuts, and
 * deterministic unique-email generation so tests never collide.
 */
import { Page, expect } from '@playwright/test';

// ── unique email per test run ───────────────────────────────
let counter = 0;
const runId = Date.now().toString(36);

export function uniqueEmail(): string {
  return `e2e_${runId}_${++counter}@test.com`;
}

export const TEST_PASSWORD = 'TestPass123!';

// ── register via API (fastest, no UI) ───────────────────────
export async function apiRegister(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
  name?: string,
) {
  const res = await page.request.post('/api/auth/register', {
    data: { email, password, name: name ?? email.split('@')[0] },
  });
  expect(res.status()).toBe(200);
  return res.json();
}

// ── login via API and store cookie ──────────────────────────
export async function apiLogin(page: Page, email: string, password = TEST_PASSWORD) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password },
  });
  expect(res.status()).toBe(200);
  return res.json();
}

// ── register + login combo (one shot) ───────────────────────
export async function registerAndLogin(page: Page, name?: string) {
  const email = uniqueEmail();
  await apiRegister(page, email, TEST_PASSWORD, name);
  await apiLogin(page, email);
  return email;
}

// ── API helpers for seed data ───────────────────────────────
export async function apiCreateProject(page: Page, data: Record<string, unknown>) {
  const res = await page.request.post('/api/projects', { data });
  expect(res.status()).toBe(200);
  return res.json();
}

export async function apiCreateClient(page: Page, data: Record<string, unknown>) {
  const res = await page.request.post('/api/clients', { data });
  expect(res.status()).toBe(200);
  return res.json();
}

export async function apiCreateTag(page: Page, data: Record<string, unknown>) {
  const res = await page.request.post('/api/tags', { data });
  expect(res.status()).toBe(200);
  return res.json();
}

export async function apiCreateTimeEntry(page: Page, data: Record<string, unknown>) {
  const res = await page.request.post('/api/time-entries', { data });
  expect(res.status()).toBe(200);
  return res.json();
}

// ── wait for navigation to settle ───────────────────────────
export async function waitForApp(page: Page) {
  await page.waitForLoadState('networkidle');
}
