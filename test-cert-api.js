// Test script to check if certificateFileUrl is being fetched
// Run this in browser console on the certifications page

fetch('/api/certifications')
    .then(res => res.json())
    .then(data => {
        console.log('=== Certifications API Response ===');
        console.log('Success:', data.success);
        console.log('Total certifications:', data.data?.length || 0);

        if (data.data && data.data.length > 0) {
            console.log('\n=== First Certification ===');
            console.log(data.data[0]);

            console.log('\n=== Certificates with PDF files ===');
            const withFiles = data.data.filter(cert => cert.certificateFileUrl);
            console.log('Count:', withFiles.length);
            withFiles.forEach((cert, i) => {
                console.log(`\n${i + 1}. ${cert.title}`);
                console.log('   File URL:', cert.certificateFileUrl);
            });

            if (withFiles.length === 0) {
                console.log('\n⚠️ No certifications have certificate files uploaded yet.');
                console.log('💡 Upload a certificate PDF in /admin/certifications/new to test.');
            }
        }
    })
    .catch(err => console.error('Error:', err));
