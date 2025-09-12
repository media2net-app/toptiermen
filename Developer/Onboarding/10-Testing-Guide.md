# 🧪 Testing Guide

## 📋 **OVERZICHT**

Deze guide beschrijft hoe je het Top Tier Men onboarding systeem kunt testen, inclusief test scenarios, test data, en best practices.

---

## **🎯 TESTING STRATEGY**

### **Test Types**
- **Unit Tests**: Individuele componenten en functies
- **Integration Tests**: API endpoints en database interacties
- **E2E Tests**: Volledige user journeys
- **Manual Tests**: Handmatige verificatie van functionaliteit

### **Test Environments**
- **Development**: Lokale ontwikkeling
- **Staging**: Pre-productie testing
- **Production**: Live omgeving monitoring

---

## **👥 TEST ACCOUNTS**

### **Test Gebruikers**
```typescript
const TEST_ACCOUNTS = {
  newUser: {
    email: 'chieltest@toptiermen.eu',
    password: 'TopTierMen2024!',
    package: 'premium',
    status: 'clean'
  },
  existingUser: {
    email: 'rick@toptiermen.eu',
    password: 'TopTierMen2024!',
    package: 'premium',
    status: 'existing'
  },
  adminUser: {
    email: 'chiel@media2net.nl',
    password: 'TopTierMen2024!',
    package: 'premium',
    status: 'admin'
  }
};
```

### **Account Setup**
```typescript
// Create test account
const createTestAccount = async (email, password, packageType) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: 'Test User',
        display_name: 'TestUser',
        role: 'user',
        package_type: packageType,
        subscription_tier: packageType.toLowerCase()
      });

    if (profileError) throw profileError;

    // Create onboarding status
    const { error: onboardingError } = await supabaseAdmin
      .from('onboarding_status')
      .insert({
        user_id: authData.user.id,
        current_step: 0,
        onboarding_completed: false
      });

    if (onboardingError) throw onboardingError;

    console.log('Test account created:', email);
  } catch (error) {
    console.error('Error creating test account:', error);
  }
};
```

---

## **🔄 ONBOARDING FLOW TESTS**

### **Happy Path Test**
```typescript
const testHappyPath = async () => {
  console.log('🧪 Testing happy path onboarding...');
  
  // Step 0: Welcome Video
  await testWelcomeVideo();
  
  // Step 1: Profile Setup
  await testProfileSetup();
  
  // Step 2: Uitdagingen
  await testUitdagingen();
  
  // Step 3: Trainingsschemas
  await testTrainingsschemas();
  
  // Step 4: Voedingsplannen
  await testVoedingsplannen();
  
  // Step 5: Challenges
  await testChallenges();
  
  // Step 6: Brotherhood
  await testBrotherhood();
  
  console.log('✅ Happy path test completed');
};
```

### **Step 0: Welcome Video Test**
```typescript
const testWelcomeVideo = async () => {
  console.log('🎬 Testing welcome video...');
  
  // Navigate to welcome video page
  await page.goto('/dashboard/welcome-video');
  
  // Check if video element exists
  const video = await page.$('video');
  expect(video).toBeTruthy();
  
  // Check video source
  const videoSrc = await page.$eval('video source', el => el.src);
  expect(videoSrc).toContain('welkom-v2.mp4');
  
  // Simulate video completion
  await page.evaluate(() => {
    const video = document.querySelector('video');
    if (video) {
      video.dispatchEvent(new Event('ended'));
    }
  });
  
  // Check if next button is enabled
  const nextButton = await page.$('button:has-text("Volgende stap")');
  expect(nextButton).toBeTruthy();
  
  // Click next button
  await nextButton.click();
  
  // Verify redirect to profile page
  await page.waitForURL('/dashboard/profiel');
  
  console.log('✅ Welcome video test passed');
};
```

### **Step 1: Profile Setup Test**
```typescript
const testProfileSetup = async () => {
  console.log('👤 Testing profile setup...');
  
  // Check if form fields exist
  const fullNameField = await page.$('input[name="full_name"]');
  const mainGoalSelect = await page.$('select[name="main_goal"]');
  
  expect(fullNameField).toBeTruthy();
  expect(mainGoalSelect).toBeTruthy();
  
  // Fill form
  await fullNameField.fill('Test User');
  await mainGoalSelect.selectOption('fitness');
  
  // Submit form
  const submitButton = await page.$('button[type="submit"]');
  await submitButton.click();
  
  // Verify redirect to uitdagingen page
  await page.waitForURL('/dashboard/mijn-uitdagingen');
  
  console.log('✅ Profile setup test passed');
};
```

### **Step 2: Uitdagingen Test**
```typescript
const testUitdagingen = async () => {
  console.log('🎯 Testing uitdagingen...');
  
  // Wait for challenges to load
  await page.waitForSelector('[data-testid="challenge-card"]');
  
  // Select 3 challenges
  const challengeCards = await page.$$('[data-testid="challenge-card"]');
  expect(challengeCards.length).toBeGreaterThan(0);
  
  // Click first 3 challenges
  for (let i = 0; i < 3; i++) {
    await challengeCards[i].click();
  }
  
  // Check if challenges are selected
  const selectedChallenges = await page.$$('[data-testid="challenge-card"].selected');
  expect(selectedChallenges.length).toBe(3);
  
  // Submit selection
  const submitButton = await page.$('button:has-text("Bevestigen")');
  await submitButton.click();
  
  // Verify redirect to trainingsschemas page
  await page.waitForURL('/dashboard/trainingsschemas');
  
  console.log('✅ Uitdagingen test passed');
};
```

---

## **🔧 API TESTING**

### **API Endpoint Tests**
```typescript
// Test missions-simple API
const testMissionsAPI = async () => {
  console.log('🔍 Testing missions-simple API...');
  
  const response = await fetch('/api/missions-simple?userId=test-user-id');
  expect(response.status).toBe(200);
  
  const data = await response.json();
  expect(data.missions).toBeDefined();
  expect(data.summary).toBeDefined();
  expect(Array.isArray(data.missions)).toBe(true);
  
  console.log('✅ Missions API test passed');
};

// Test onboarding API
const testOnboardingAPI = async () => {
  console.log('🔍 Testing onboarding API...');
  
  const response = await fetch('/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: 0 })
  });
  
  expect(response.status).toBe(200);
  
  const data = await response.json();
  expect(data.success).toBe(true);
  
  console.log('✅ Onboarding API test passed');
};
```

### **Database Tests**
```typescript
// Test database operations
const testDatabaseOperations = async () => {
  console.log('🗄️ Testing database operations...');
  
  // Test onboarding status update
  const { data: onboardingData, error: onboardingError } = await supabase
    .from('onboarding_status')
    .update({ current_step: 1 })
    .eq('user_id', 'test-user-id')
    .select();
  
  expect(onboardingError).toBeNull();
  expect(onboardingData).toBeDefined();
  
  // Test profile update
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: 'Test User' })
    .eq('id', 'test-user-id')
    .select();
  
  expect(profileError).toBeNull();
  expect(profileData).toBeDefined();
  
  console.log('✅ Database operations test passed');
};
```

---

## **🚨 ERROR SCENARIO TESTS**

### **Network Error Tests**
```typescript
const testNetworkErrors = async () => {
  console.log('🌐 Testing network error scenarios...');
  
  // Simulate network failure
  await page.route('**/api/missions-simple', route => route.abort());
  
  // Navigate to uitdagingen page
  await page.goto('/dashboard/mijn-uitdagingen');
  
  // Check if error message is displayed
  const errorMessage = await page.$('[data-testid="error-message"]');
  expect(errorMessage).toBeTruthy();
  
  // Check if retry button exists
  const retryButton = await page.$('button:has-text("Opnieuw proberen")');
  expect(retryButton).toBeTruthy();
  
  console.log('✅ Network error test passed');
};
```

### **Validation Error Tests**
```typescript
const testValidationErrors = async () => {
  console.log('✅ Testing validation errors...');
  
  // Navigate to profile page
  await page.goto('/dashboard/profiel');
  
  // Try to submit empty form
  const submitButton = await page.$('button[type="submit"]');
  await submitButton.click();
  
  // Check if validation errors are displayed
  const errorMessages = await page.$$('[data-testid="validation-error"]');
  expect(errorMessages.length).toBeGreaterThan(0);
  
  console.log('✅ Validation error test passed');
};
```

---

## **📱 MOBILE TESTING**

### **Responsive Design Tests**
```typescript
const testResponsiveDesign = async () => {
  console.log('📱 Testing responsive design...');
  
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Navigate to uitdagingen page
  await page.goto('/dashboard/mijn-uitdagingen');
  
  // Check if mobile layout is applied
  const mobileLayout = await page.$('[data-testid="mobile-layout"]');
  expect(mobileLayout).toBeTruthy();
  
  // Test touch interactions
  const challengeCard = await page.$('[data-testid="challenge-card"]');
  await challengeCard.tap();
  
  // Check if selection works on mobile
  const selectedCard = await page.$('[data-testid="challenge-card"].selected');
  expect(selectedCard).toBeTruthy();
  
  console.log('✅ Responsive design test passed');
};
```

### **Touch Event Tests**
```typescript
const testTouchEvents = async () => {
  console.log('👆 Testing touch events...');
  
  // Test swipe gestures
  await page.touchscreen.tap(100, 100);
  await page.touchscreen.tap(200, 100);
  
  // Test long press
  await page.touchscreen.tap(100, 100, { delay: 1000 });
  
  console.log('✅ Touch events test passed');
};
```

---

## **⚡ PERFORMANCE TESTING**

### **Load Time Tests**
```typescript
const testLoadTimes = async () => {
  console.log('⚡ Testing load times...');
  
  // Test page load times
  const startTime = Date.now();
  await page.goto('/dashboard/mijn-uitdagingen');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  
  // Test API response times
  const apiStartTime = Date.now();
  await fetch('/api/missions-simple?userId=test-user-id');
  const apiResponseTime = Date.now() - apiStartTime;
  
  expect(apiResponseTime).toBeLessThan(1000); // API should respond within 1 second
  
  console.log('✅ Load times test passed');
};
```

### **Memory Usage Tests**
```typescript
const testMemoryUsage = async () => {
  console.log('💾 Testing memory usage...');
  
  // Get initial memory usage
  const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  
  // Navigate through multiple pages
  await page.goto('/dashboard/welcome-video');
  await page.goto('/dashboard/profiel');
  await page.goto('/dashboard/mijn-uitdagingen');
  
  // Get final memory usage
  const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  
  // Check for memory leaks
  const memoryIncrease = finalMemory - initialMemory;
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
  
  console.log('✅ Memory usage test passed');
};
```

---

## **🔐 SECURITY TESTING**

### **Authentication Tests**
```typescript
const testAuthentication = async () => {
  console.log('🔐 Testing authentication...');
  
  // Test unauthorized access
  await page.goto('/dashboard/mijn-uitdagingen');
  
  // Should redirect to login if not authenticated
  const currentUrl = page.url();
  expect(currentUrl).toContain('/login');
  
  // Test with valid credentials
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard after login
  await page.waitForURL('/dashboard/**');
  
  console.log('✅ Authentication test passed');
};
```

### **Authorization Tests**
```typescript
const testAuthorization = async () => {
  console.log('🛡️ Testing authorization...');
  
  // Test admin-only endpoints
  const response = await fetch('/api/admin/users');
  expect(response.status).toBe(403); // Should be forbidden for non-admin users
  
  // Test user data access
  const userResponse = await fetch('/api/user/profile');
  expect(userResponse.status).toBe(200); // Should be allowed for authenticated users
  
  console.log('✅ Authorization test passed');
};
```

---

## **📊 TEST REPORTING**

### **Test Results**
```typescript
const generateTestReport = async () => {
  console.log('📊 Generating test report...');
  
  const testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testDuration: 0,
    testSuites: []
  };
  
  // Run all test suites
  const testSuites = [
    'onboarding-flow',
    'api-endpoints',
    'database-operations',
    'error-scenarios',
    'mobile-responsiveness',
    'performance',
    'security'
  ];
  
  for (const suite of testSuites) {
    const suiteResults = await runTestSuite(suite);
    testResults.testSuites.push(suiteResults);
    testResults.totalTests += suiteResults.total;
    testResults.passedTests += suiteResults.passed;
    testResults.failedTests += suiteResults.failed;
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    results: testResults,
    summary: {
      successRate: (testResults.passedTests / testResults.totalTests) * 100,
      status: testResults.failedTests === 0 ? 'PASSED' : 'FAILED'
    }
  };
  
  console.log('Test Report:', JSON.stringify(report, null, 2));
  
  return report;
};
```

---

## **🔄 CONTINUOUS TESTING**

### **Automated Test Pipeline**
```yaml
# .github/workflows/onboarding-tests.yml
name: Onboarding Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Generate test report
      run: npm run test:report
```

### **Test Monitoring**
```typescript
// Monitor test results
const monitorTestResults = async () => {
  const results = await generateTestReport();
  
  if (results.summary.status === 'FAILED') {
    // Send alert to development team
    await sendAlert({
      type: 'test_failure',
      message: 'Onboarding tests failed',
      details: results
    });
  }
  
  // Store results in database
  await storeTestResults(results);
};
```

---

## **📋 TEST CHECKLIST**

### **Pre-Release Testing**
- [ ] Happy path onboarding flow
- [ ] All API endpoints working
- [ ] Database operations successful
- [ ] Error handling working
- [ ] Mobile responsiveness
- [ ] Performance within limits
- [ ] Security measures in place
- [ ] Cross-browser compatibility
- [ ] Accessibility compliance
- [ ] User experience validation

### **Post-Release Monitoring**
- [ ] Error rates monitoring
- [ ] Performance metrics tracking
- [ ] User feedback collection
- [ ] Analytics data review
- [ ] Bug report handling
- [ ] Performance optimization
- [ ] Security updates
- [ ] Feature usage analysis

---

*Laatste update: $(date)*
*Versie: 3.1.0*
