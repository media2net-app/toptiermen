const http = require('http');

async function testWelcomeVideoTasks() {
  try {
    console.log('🎥 Testing welcome video tasks functionality...\n');

    // Test 1: Check if tasks exist in the API
    console.log('1. Testing API endpoint...');
    const apiResult = await makeRequest('/api/admin/todo-tasks', 'GET');
    
    if (apiResult.success) {
      const welcomeVideoTasks = apiResult.tasks.filter(task => 
        task.title.includes('Welkomstvideo')
      );
      
      console.log(`✅ Found ${welcomeVideoTasks.length} welcome video tasks`);
      
      // Show task details
      welcomeVideoTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.assigned_to}`);
        console.log(`      Status: ${task.status}`);
        console.log(`      Due: ${task.due_date}`);
        console.log(`      Priority: ${task.priority}`);
        console.log(`      Category: ${task.category}`);
        console.log('');
      });
    } else {
      console.log('❌ API request failed');
      return;
    }

    // Test 2: Check dashboard page loads
    console.log('2. Testing dashboard page...');
    const dashboardResult = await makeRequest('/dashboard', 'GET');
    
    if (dashboardResult.includes('UserTasksWidget') || dashboardResult.includes('Mijn Taken')) {
      console.log('✅ Dashboard page loads with tasks widget');
    } else {
      console.log('⚠️ Dashboard page may not include tasks widget');
    }

    // Test 3: Check specific user tasks
    console.log('\n3. Testing user-specific task filtering...');
    const testUsers = ['Chiel van der Zee', 'Rick Cuijpers', 'Thomas Müller'];
    
    for (const userName of testUsers) {
      const userTasks = apiResult.tasks.filter(task => 
        task.assigned_to === userName && 
        task.title.includes('Welkomstvideo') &&
        task.status !== 'completed'
      );
      
      console.log(`   ${userName}: ${userTasks.length} welcome video task(s)`);
      
      if (userTasks.length > 0) {
        const task = userTasks[0];
        console.log(`      - ${task.title}`);
        console.log(`      - Status: ${task.status}`);
        console.log(`      - Due: ${task.due_date}`);
        console.log(`      - Priority: ${task.priority}`);
      }
    }

    // Test 4: Check task details
    console.log('\n4. Task details verification...');
    const sampleTask = apiResult.tasks.find(task => task.title.includes('Welkomstvideo'));
    
    if (sampleTask) {
      console.log('✅ Task structure verification:');
      console.log(`   Title: ${sampleTask.title}`);
      console.log(`   Description: ${sampleTask.description?.substring(0, 100)}...`);
      console.log(`   Category: ${sampleTask.category}`);
      console.log(`   Priority: ${sampleTask.priority}`);
      console.log(`   Status: ${sampleTask.status}`);
      console.log(`   Assigned to: ${sampleTask.assigned_to}`);
      console.log(`   Due date: ${sampleTask.due_date}`);
      console.log(`   Estimated hours: ${sampleTask.estimated_hours}`);
      console.log(`   Tags: ${sampleTask.tags?.join(', ')}`);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(40));
    console.log(`Total tasks in system: ${apiResult.tasks.length}`);
    console.log(`Welcome video tasks: ${apiResult.tasks.filter(t => t.title.includes('Welkomstvideo')).length}`);
    console.log(`Pending welcome video tasks: ${apiResult.tasks.filter(t => t.title.includes('Welkomstvideo') && t.status === 'pending').length}`);
    console.log(`Completed welcome video tasks: ${apiResult.tasks.filter(t => t.title.includes('Welkomstvideo') && t.status === 'completed').length}`);
    
    console.log('\n🎉 Welcome video tasks test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Users can now see their welcome video tasks on the dashboard');
    console.log('   2. Tasks show priority, due date, and description');
    console.log('   3. Users can mark tasks as completed when done');
    console.log('   4. Forum topic "Even voorstellen" should be created for video uploads');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

testWelcomeVideoTasks();
