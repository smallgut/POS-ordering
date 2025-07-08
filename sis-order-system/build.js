const fs = require('fs');
     const path = require('path');

     const files = ['checkout.html', 'summary.html'];
     files.forEach(file => {
         const filePath = path.join(__dirname, file);
         let content = fs.readFileSync(filePath, 'utf8');
         content = content.replace('YOUR_SUPABASE_URL', process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL');
         content = content.replace('YOUR_SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY');
         fs.writeFileSync(filePath, content);
     });