import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
let mongo, app, User, Session, EmailJob, transporter, processEmailQueue;
const password = "Test-password-42";
let sequence = 0;
const email = () => "test-" + ++sequence + "@example.com";
before(
  async () => {
    mongo = await MongoMemoryServer.create();
    process.env.NODE_ENV = "test";
    Object.assign(process.env, {
      JWT_SECRET: "isolated-test-access-secret-at-least-32-characters",
      JWT_REFRESH_SECRET: "isolated-test-refresh-secret-at-least-32-characters",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "2525",
      SMTP_USER: "test-only",
      SMTP_PASS: "test-only",
      CLIENT_URL: "http://localhost:3000",
    });
    process.env.MONGO_URI = mongo.getUri("auth-tests");
    ({ default: app } = await import("../app.js"));
    ({ User } = await import("../models/User.js"));
    ({ Session } = await import("../models/Session.js"));
    ({ EmailJob } = await import("../models/EmailJob.js"));
    ({ transporter } = await import("../config/nodemailer.js"));
    ({ processEmailQueue } = await import("../utils/emailService.js"));
    transporter.sendMail = async () => ({ messageId: "test-only" });
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([User.init(), Session.init(), EmailJob.init()]);
  },
  { timeout: 180000 },
);
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
const post = (path, body) =>
  request(app)
    .post("/api/auth/" + path)
    .send(body);
async function signup(address = email()) {
  const response = await post("signup", {
    name: "Test <User>",
    email: address,
    password,
  });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  const job = await EmailJob.findOne({
    to: address,
    category: "Email Verification",
  }).sort({ createdAt: -1 });
  const code = job.html.match(/class="code">(\d{6})/)[1];
  return { address, code, response };
}
async function account() {
  const data = await signup();
  const verified = await post("verify-email", {
    email: data.address,
    code: data.code,
  });
  assert.equal(verified.status, 200, JSON.stringify(verified.body));
  return {
    ...data,
    cookies: verified.headers["set-cookie"].map((v) => v.split(";")[0]),
    user: verified.body.user,
  };
}
const auth = (cookies, path, body) =>
  request(app)
    .post("/api/auth/" + path)
    .set("Cookie", cookies)
    .send(body);
test("signup exposes no secrets and verification creates a usable authenticated session", async () => {
  const a = await account();
  for (const key of [
    "password",
    "verificationToken",
    "sessionVersion",
    "isDeleted",
  ])
    assert.equal(a.response.body.user[key], undefined);
  assert.equal(
    (await request(app).get("/api/auth/check-auth").set("Cookie", a.cookies))
      .body.user.email,
    a.address,
  );
  const stored = await User.findById(a.user._id).select("+password");
  assert.notEqual(stored.password, password);
  assert.equal(
    (await post("verify-email", { email: a.address, code: a.code })).status,
    400,
  );
});
test("operator injection, role escalation, bad passwords and cross-origin requests are rejected", async () => {
  assert.equal(
    (await post("verify-email", { email: email(), code: { $ne: null } }))
      .status,
    400,
  );
  assert.equal(
    (await post("confirm-email-change", { token: { $ne: null } })).status,
    400,
  );
  assert.equal(
    (
      await post("signup", {
        name: "Test",
        email: email(),
        password,
        role: "Admin",
      })
    ).status,
    400,
  );
  assert.equal(
    (await post("signup", { name: "Test", email: email(), password: "short" }))
      .status,
    400,
  );
  assert.equal(
    (
      await post("signup", {
        name: "Test",
        email: email(),
        password: "é".repeat(40),
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/logout")
        .set("Origin", "https://untrusted.example")
        .send({})
    ).status,
    403,
  );
});
test("verification belongs to one email and locks after five wrong codes", async () => {
  const a = await signup(),
    b = await signup();
  let bad = "000000";
  assert.notEqual(a.code, bad);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await post("verify-email", { email: a.address, code: bad })).status,
      400,
    );
  assert.equal(
    (await post("verify-email", { email: a.address, code: a.code })).status,
    400,
  );
  assert.equal((await User.findOne({ email: a.address })).isVerified, false);
  assert.equal((await User.findOne({ email: b.address })).isVerified, false);
  await post("resend-verification-email", { email: a.address });
  const job = await EmailJob.findOne({
    to: a.address,
    category: "Email Verification",
  }).sort({ createdAt: -1 });
  assert.equal(
    (
      await post("verify-email", {
        email: a.address,
        code: job.html.match(/class="code">(\d{6})/)[1],
      })
    ).status,
    200,
  );
});
test("login supplies user; profile allowlist and current password checks work", async () => {
  const a = await account();
  const login = await post("login", {
    email: a.address.toUpperCase(),
    password,
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.email, a.address);
  assert.equal(
    (await post("login", { email: a.address, password: "wrong" })).status,
    401,
  );
  const changed = await request(app)
    .put("/api/auth/update-profile")
    .set("Cookie", a.cookies)
    .send({ name: "Updated" });
  assert.equal(changed.body.user.name, "Updated");
  assert.equal(
    (
      await request(app)
        .put("/api/auth/update-profile")
        .set("Cookie", a.cookies)
        .send({ role: "Admin" })
    ).status,
    400,
  );
  assert.equal(
    (
      await auth(a.cookies, "request-email-change", {
        newEmail: email(),
        password: "wrong",
      })
    ).status,
    400,
  );
});
test("refresh rotates tokens and replay revokes the session, including access token", async () => {
  const a = await account();
  const refreshed = await auth(a.cookies, "refresh-token", {});
  assert.equal(refreshed.status, 200);
  const next = refreshed.headers["set-cookie"].map((v) => v.split(";")[0]);
  assert.notDeepEqual(a.cookies, next);
  assert.equal((await auth(a.cookies, "refresh-token", {})).status, 401);
  assert.equal(
    (await request(app).get("/api/auth/me").set("Cookie", next)).status,
    401,
  );
});
test("logout revokes a copied access and refresh cookie", async () => {
  const a = await account();
  assert.equal((await auth(a.cookies, "logout", {})).status, 200);
  assert.equal(
    (await request(app).get("/api/auth/check-auth").set("Cookie", a.cookies))
      .status,
    401,
  );
  assert.equal((await auth(a.cookies, "refresh-token", {})).status, 401);
});
test("password change revokes all sessions and reset is single-use under concurrency", async () => {
  const a = await account();
  const login = await post("login", { email: a.address, password });
  const old = login.headers["set-cookie"].map((v) => v.split(";")[0]);
  assert.equal(
    (
      await auth(a.cookies, "change-password", {
        oldPassword: password,
        newPassword: "Changed-password-42",
      })
    ).status,
    200,
  );
  assert.equal((await auth(old, "refresh-token", {})).status, 401);
  assert.equal(
    (await post("login", { email: a.address, password })).status,
    401,
  );
  assert.equal(
    (await post("forgot-password", { email: a.address })).status,
    200,
  );
  const job = await EmailJob.findOne({
    to: a.address,
    subject: "Reset your password",
  }).sort({ createdAt: -1 });
  const token = job.html.match(/reset-password\/([a-f0-9]{64})/)[1];
  const responses = await Promise.all([
    post("reset-password/" + token, { password }),
    post("reset-password/" + token, { password }),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 400]);
  const stored = await User.findOne({ email: a.address }).select(
    "+resetPasswordToken",
  );
  assert.equal(stored.resetPasswordToken, undefined);
});
test("forgot-password has the same public response for missing accounts", async () => {
  const a = await account();
  const found = await post("forgot-password", { email: a.address });
  const missing = await post("forgot-password", { email: email() });
  assert.deepEqual(found.body, missing.body);
  assert.equal(found.status, missing.status);
});
test("email change needs current password; link is public, single use, and revokes sessions", async () => {
  const a = await account(),
    nextEmail = email();
  const sent = await auth(a.cookies, "request-email-change", {
    newEmail: nextEmail,
    password,
  });
  assert.equal(sent.status, 200);
  assert.equal(sent.body.user.email, a.address);
  assert.equal(sent.body.user.emailChangeToken, undefined);
  const job = await EmailJob.findOne({
    to: nextEmail,
    category: "Email Change Confirmation",
  });
  const token = job.html.match(/confirm-email-change\/([a-f0-9]{64})/)[1];
  assert.equal((await post("confirm-email-change", { token })).status, 200);
  assert.equal((await post("confirm-email-change", { token })).status, 400);
  assert.equal((await auth(a.cookies, "refresh-token", {})).status, 401);
  const login = await post("login", { email: nextEmail, password });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.pendingEmailChange, undefined);
});
test("deletion unsets credentials and old sessions cannot perform any protected action", async () => {
  const a = await account();
  assert.equal(
    (await auth(a.cookies, "delete-account", { password: "wrong" })).status,
    400,
  );
  assert.equal(
    (await auth(a.cookies, "delete-account", { password })).status,
    200,
  );
  const stored = await User.findById(a.user._id).select(
    "+isDeleted +password +verificationToken +resetPasswordToken +emailChangeToken",
  );
  assert.equal(stored.isDeleted, true);
  assert.equal(stored.password, undefined);
  assert.equal(stored.verificationToken, undefined);
  assert.equal(await Session.countDocuments({ userId: a.user._id }), 0);
  for (const route of ["check-auth", "me"])
    assert.equal(
      (
        await request(app)
          .get("/api/auth/" + route)
          .set("Cookie", a.cookies)
      ).status,
      401,
    );
  assert.equal(
    (
      await auth(a.cookies, "change-password", {
        oldPassword: password,
        newPassword: "Another-password",
      })
    ).status,
    401,
  );
  assert.equal(
    (await post("login", { email: a.address, password })).status,
    401,
  );
});
test("SMTP failure leaves queued mail retriable without reverting account changes; HTML is escaped", async () => {
  const a = await account();
  const welcome = await EmailJob.findOne({
    to: a.address,
    category: "Welcome Email",
  });
  assert.ok(welcome.html.includes("Test &lt;User&gt;"));
  assert.ok(!welcome.html.includes("Test <User>"));
  transporter.sendMail = async () => {
    throw new Error("simulated SMTP failure");
  };
  await processEmailQueue();
  assert.ok(
    (await EmailJob.countDocuments({
      status: "pending",
      attempts: { $gt: 0 },
    })) > 0,
  );
  assert.equal((await User.findOne({ email: a.address })).isVerified, true);
  transporter.sendMail = async () => ({ messageId: "test-only" });
  await EmailJob.updateMany(
    { status: "pending" },
    { $set: { nextAttemptAt: new Date(0) } },
  );
  for (let i = 0; i < 5; i++) await processEmailQueue();
  const sent = await EmailJob.findOne({ status: "sent" });
  assert.equal(sent.html, undefined);
  assert.equal(sent.to, undefined);
});
test("repeated failed login attempts are rate limited", async () => {
  const address = email();
  let response;
  for (let i = 0; i < 11; i++)
    response = await post("login", { email: address, password: "wrong" });
  assert.equal(response.status, 429);
});
