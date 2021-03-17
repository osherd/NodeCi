const { session } = require("passport");
const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");

let browser, page;
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sanbox"],
  });

  page = await browser.newPage();
  await page.goto("http://localhost:3000");
}, 50000);

afterEach(async () => {
  await browser.close();
});
test("the header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const URL = await page.url();
  expect(URL).toMatch(/accounts\.google\.com/);
}, 50000);

test("when signed in, show logout button", async () => {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);
  await page.setCookie({ name: session, value: session });
  await page.setCookie({ name: session.sig, value: sig });
  await page.goto("localhost:3000");
  await page.waitfor('a[href="/auth/logout"]');

  const text = await page.$eval('a[href="./auth/logout"]', (e) => e.innerHTML);
  expect(text).toEqual("Logout");
});
