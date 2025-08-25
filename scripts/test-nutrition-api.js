const http = require('http');

async function testNutritionAPI() {
  try {
    console.log('🧪 Testing nutrition ingredients API...\n');

    // Test GET request
    console.log('1. Testing GET request...');
    const getResult = await makeRequest('/api/admin/nutrition-ingredients', 'GET');
    console.log('✅ GET request successful');
    console.log(`   Found ${getResult.ingredients?.length || 0} ingredients\n`);

    // Test PUT request (update)
    console.log('2. Testing PUT request...');
    const updateData = {
      id: 'ef6484d0-e52d-4ea1-bf0a-46b383f67060', // Amandelen ID
      name: 'Amandelen Test Update',
      category: 'Noten',
      calories_per_100g: 622,
      protein_per_100g: 21,
      carbs_per_100g: 22,
      fat_per_100g: 50,
      description: 'Test update via API'
    };

    const putResult = await makeRequest('/api/admin/nutrition-ingredients', 'PUT', updateData);
    console.log('✅ PUT request successful');
    console.log(`   Updated: ${putResult.ingredient?.name}\n`);

    // Test PUT request again to revert the change
    console.log('3. Reverting the change...');
    const revertData = {
      id: 'ef6484d0-e52d-4ea1-bf0a-46b383f67060',
      name: 'Amandelen',
      category: 'Noten',
      calories_per_100g: 622,
      protein_per_100g: 21,
      carbs_per_100g: 22,
      fat_per_100g: 50,
      description: 'Amandelen - gezonde noten'
    };

    const revertResult = await makeRequest('/api/admin/nutrition-ingredients', 'PUT', revertData);
    console.log('✅ Revert successful');
    console.log(`   Reverted to: ${revertResult.ingredient?.name}\n`);

    console.log('🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

function makeRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

testNutritionAPI();
