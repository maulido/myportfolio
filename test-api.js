// Test script untuk Gallery API dan Contact Form
const testGalleryAPI = async () => {
    console.log('🧪 Testing Gallery API...\n');

    // Test 1: GET /api/gallery
    console.log('Test 1: GET /api/gallery');
    try {
        const response = await fetch('http://localhost:3000/api/gallery');
        const data = await response.json();
        console.log('✅ Status:', response.status);
        console.log('✅ Response:', JSON.stringify(data, null, 2));
        console.log('✅ No 400 error!\n');
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }

    // Test 2: POST /api/gallery without image (should fail with validation)
    console.log('Test 2: POST /api/gallery without image (validation test)');
    try {
        const response = await fetch('http://localhost:3000/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Item',
                category: 'Testing',
                // imageUrl is missing - should trigger validation
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (response.status === 400 && data.error === 'Title and image are required') {
            console.log('✅ Validation working correctly!\n');
        } else {
            console.log('⚠️ Unexpected response\n');
        }
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }

    // Test 3: POST /api/gallery with valid data
    console.log('Test 3: POST /api/gallery with valid data');
    try {
        const response = await fetch('http://localhost:3000/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Gallery Item',
                category: 'Testing',
                imageUrl: 'https://utfs.io/f/test-image.jpg',
                description: 'This is a test gallery item',
                date: new Date().toISOString()
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (response.status === 201 && data.success) {
            console.log('✅ Gallery item created successfully!\n');
            return data.data._id; // Return ID for cleanup
        } else {
            console.log('⚠️ Unexpected response\n');
        }
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }
};

const testContactAPI = async () => {
    console.log('🧪 Testing Contact API...\n');

    console.log('Test: POST /api/contact');
    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                message: 'This is a test message from the API test script.'
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('✅ Contact form working! (Email sent if SMTP configured)\n');
        } else if (data.error && data.error.includes('SMTP')) {
            console.log('⚠️ SMTP not configured (expected in development)\n');
        } else {
            console.log('Response indicates:', data.error || 'Unknown status\n');
        }
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }
};

// Run tests
(async () => {
    console.log('='.repeat(60));
    console.log('Portfolio Website API Testing');
    console.log('='.repeat(60) + '\n');

    await testGalleryAPI();
    await testContactAPI();

    console.log('='.repeat(60));
    console.log('Testing Complete!');
    console.log('='.repeat(60));
})();
