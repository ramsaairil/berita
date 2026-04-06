const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log("Missing credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testInsert() {
  console.log("Fetching a category...");
  const { data: cat } = await supabaseAdmin.from('Category').select('id').limit(1).single();
  console.log("Fetching a user...");
  const { data: user } = await supabaseAdmin.from('User').select('id').limit(1).single();

  const payload = {
    id: "test-" + Date.now(),
    title: "TEST ARTICLE",
    content: "Content",
    excerpt: "Excerpt",
    featuredImg: null,
    slug: "test-article-" + Date.now(),
    status: "PUBLISHED",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: user ? user.id : 'user',
    categoryId: cat ? cat.id : 'cat',
  };

  console.log("Inserting payload:", payload);
  const { error, data } = await supabaseAdmin.from("Article").insert(payload);
  console.log("Error:", error);
  console.log("Data:", data);
}

testInsert();
