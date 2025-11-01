// Debug script to test bookmarklet logic
// Run this in browser console to debug

console.log('🔍 Debugging Bookmarklet...');

// Test field detection
const allFields = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="file"]):not([type="image"]), textarea, select'));
console.log(`Found ${allFields.length} form fields:`, allFields);

// Test field identification
allFields.forEach((field, index) => {
    const fieldIdentifier = [
        field.name || '',
        field.id || '',
        field.placeholder || '',
        field.getAttribute('aria-label') || '',
        field.className || '',
        field.labels ? Array.from(field.labels).map(l => l.textContent).join(' ') : ''
    ].join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    
    console.log(`Field ${index + 1}:`, {
        element: field,
        name: field.name,
        id: field.id,
        placeholder: field.placeholder,
        identifier: fieldIdentifier,
        value: field.value
    });
});

// Test if bookmarklet data exists
if (window.projectData) {
    console.log('✅ Project data found:', window.projectData);
} else {
    console.log('❌ No project data found. Bookmarklet may not have loaded.');
}

// Test custom field matching
function testCustomFieldMatching() {
    const testCustomFields = [
        { key: 'Business License', value: 'BL123456' },
        { key: 'Tax ID', value: 'TAX789' },
        { key: 'Industry Type', value: 'Software Development' }
    ];
    
    console.log('🧪 Testing custom field matching...');
    
    testCustomFields.forEach(cf => {
        console.log(`Testing custom field: "${cf.key}"`);
        
        const searchTerms = [
            cf.key,
            cf.key.replace(/[^a-zA-Z0-9]/g, ''),
            cf.key.replace(/\s+/g, '_'),
            cf.key.replace(/\s+/g, '-'),
            cf.key.split(/\s+/)[0],
            cf.key.split(/\s+/).pop()
        ].filter(Boolean);
        
        console.log('Search terms:', searchTerms);
        
        allFields.forEach(field => {
            const fieldIdentifier = [
                field.name || '',
                field.id || '',
                field.placeholder || '',
                field.getAttribute('aria-label') || '',
                field.className || ''
            ].join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
            
            const score = searchTerms.reduce((acc, term) => {
                return acc + (fieldIdentifier.includes(term.toLowerCase()) ? term.length : 0);
            }, 0);
            
            if (score > 0) {
                console.log(`  ✅ Match found: ${field.name || field.id} (score: ${score})`);
            }
        });
    });
}

testCustomFieldMatching();