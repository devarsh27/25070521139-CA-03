process.env.NODE_ENV = 'test';

import { predictSentiment } from '../controllers/mlService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import mongoose from 'mongoose';
import http from 'http';

const runTests = async () => {
  console.log('\n========================================');
  console.log('🧪 UNIVERSE FULL-STACK VERIFICATION SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      failed++;
    }
  };

  // ----------------------------------------------------
  // TEST GROUP 1: ML Model & Negation Parsing
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: ML Model & Negation Parsing ---');

  // Test 1.1: Positive Feedback
  const resPos = await predictSentiment('The technical workshop was amazing and very helpful');
  assert(
    resPos.status === 'success' && resPos.sentiment === 'Positive' && resPos.confidence > 70,
    `Positive feedback detected: "${resPos.sentiment}" (${resPos.confidence}%)`
  );

  // Test 1.2: Negative Feedback
  const resNeg = await predictSentiment('The canteen food was terrible and dirty');
  assert(
    resNeg.status === 'success' && resNeg.sentiment === 'Negative' && resNeg.confidence > 70,
    `Negative feedback detected: "${resNeg.sentiment}" (${resNeg.confidence}%)`
  );

  // Test 1.3: Neutral Feedback
  const resNeu = await predictSentiment('The lecture started at 10 AM in hall B');
  assert(
    resNeu.status === 'success' && resNeu.sentiment === 'Neutral',
    `Neutral feedback detected: "${resNeu.sentiment}" (${resNeu.confidence}%)`
  );

  // Test 1.4: Negation Nuance ("not bad")
  const resNegation = await predictSentiment('The event was not bad at all');
  assert(
    resNegation.status === 'success' && resNegation.sentiment === 'Positive',
    `Negation nuance parsed ("was not bad" -> Positive): "${resNegation.sentiment}"`
  );

  // ----------------------------------------------------
  // TEST GROUP 2: Password Security & Token Verification
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Password Security & Token Verification ---');

  // Test 2.1: Bcrypt Hashing
  const rawPassword = 'StudentSecret#2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);
  const isCorrect = await bcrypt.compare(rawPassword, hash);
  const isIncorrect = await bcrypt.compare('WrongPassword', hash);

  assert(isCorrect && !isIncorrect && hash !== rawPassword, 'Bcrypt hashing and salt verification verified');

  // Test 2.2: JWT Sign & Verify
  const secret = process.env.JWT_SECRET || 'universe_dev_secret_jwt';
  const testPayload = { id: 'user_123', email: 'student@campus.edu' };
  const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);

  assert(decoded.id === testPayload.id && decoded.email === testPayload.email, 'JWT token signing and claims verified');

  // ----------------------------------------------------
  // TEST GROUP 3: Complete Authentication & API Lifecycle
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Complete Authentication & API Lifecycle ---');

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  try {
    // Test 3.1: Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    assert(
      healthRes.status === 200 && healthJson.status === 'online',
      `GET /api/health returned 200 OK (${healthJson.status})`
    );

    // Test 3.2: User Registration
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Patel',
        email: 'aarav.patel@campus.edu',
        password: 'SecurePassword123',
        role: 'student',
      }),
    });
    const regJson = await regRes.json();
    assert(
      regRes.status === 201 && regJson.success === true && regJson.user.email === 'aarav.patel@campus.edu',
      `POST /api/auth/register created user (${regJson.user?.name})`
    );

    // Test 3.3: Duplicate Account Prevention
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Duplicate',
        email: 'aarav.patel@campus.edu',
        password: 'AnotherPassword',
      }),
    });
    assert(
      dupRes.status === 409,
      `POST /api/auth/register prevented duplicate email (409 Conflict)`
    );

    // Test 3.4: Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aarav.patel@campus.edu',
        password: 'SecurePassword123',
      }),
    });
    const loginJson = await loginRes.json();
    const cookieHeader = loginRes.headers.get('set-cookie');
    assert(
      loginRes.status === 200 && loginJson.success === true && cookieHeader && cookieHeader.includes('token='),
      `POST /api/auth/login succeeded and issued HttpOnly cookie`
    );

    // Test 3.5: Login with invalid credentials
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aarav.patel@campus.edu',
        password: 'WrongPassword!',
      }),
    });
    assert(
      badLoginRes.status === 401,
      `POST /api/auth/login rejected invalid credentials (401 Unauthorized)`
    );

    // Extract cookie token for subsequent authenticated requests
    const tokenMatch = cookieHeader ? cookieHeader.match(/token=([^;]+)/) : null;
    const authToken = tokenMatch ? tokenMatch[1] : loginJson.token;

    // Test 3.6: Protected Route /api/auth/me with Cookie
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Cookie': `token=${authToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const meJson = await meRes.json();
    assert(
      meRes.status === 200 && meJson.success === true && meJson.user.email === 'aarav.patel@campus.edu',
      `GET /api/auth/me authenticated session successfully via HttpOnly cookie`
    );

    // Test 3.7: Submit Feedback (Authenticated)
    const submitRes = await fetch(`${baseUrl}/api/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${authToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        feedbackText: 'The college fest was amazing and the cultural event was fantastic',
        category: 'Events & Culture',
      }),
    });
    const submitJson = await submitRes.json();
    assert(
      submitRes.status === 201 &&
      submitJson.success === true &&
      submitJson.data.sentiment === 'Positive',
      `POST /api/feedback/submit classified & saved positive feedback (Confidence: ${submitJson.data?.confidence}%)`
    );

    // Test 3.8: Dashboard Stats reflects submitted feedback
    const dashRes = await fetch(`${baseUrl}/api/dashboard/stats`);
    const dashJson = await dashRes.json();
    assert(
      dashRes.status === 200 &&
      dashJson.success === true &&
      dashJson.stats.total >= 1 &&
      dashJson.stats.positive >= 1,
      `GET /api/dashboard/stats dynamically reflects submissions (Total: ${dashJson.stats.total}, Positive: ${dashJson.stats.positive})`
    );

    // Test 3.9: Feedback History contains recent submission
    const historyRes = await fetch(`${baseUrl}/api/feedback/history?category=${encodeURIComponent('Events & Culture')}`);
    const historyJson = await historyRes.json();
    assert(
      historyRes.status === 200 &&
      historyJson.success === true &&
      historyJson.data.length >= 1,
      `GET /api/feedback/history retrieved filtered records (${historyJson.data.length} found)`
    );

    // Test 3.10: User Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert(
      logoutRes.status === 200 && logoutCookie && logoutCookie.includes('token=;'),
      `POST /api/auth/logout cleared session cookie`
    );
  } finally {
    await new Promise((resolve) => testServer.close(resolve));
    await mongoose.disconnect();
  }

  console.log('\n========================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
