const fs = require('fs');
const path = require('path');

const files = ['checkout.html', 'summary.html'];
files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace('https://oyqxerutdwaiqoiabxyy.supabase.co', process.env.SUPABASE_URL || 'https://oyqxerutdwaiqoiabxyy.supabase.co');
    content = content.replace('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cXhlcnV0ZHdhaXFvaWFieHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjQ5NTYsImV4cCI6MjA2NzUwMDk1Nn0.RTFFE3fptrpflHJLJ8GnuFr0KphJyIQ2XVakcet8i68', process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cXhlcnV0ZHdhaXFvaWFieHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjQ5NTYsImV4cCI6MjA2NzUwMDk1Nn0.RTFFE3fptrpflHJLJ8GnuFr0KphJyIQ2XVakcet8i68');
    fs.writeFileSync(filePath, content);
});
