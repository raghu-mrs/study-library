const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lxhjcpymphifhrirrhnx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5p2qpKFA56XIywfl99d29w_vLdsW1KN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('Testing upload...');
  
  // Create a dummy file
  const fileContent = 'dummy content';
  
  try {
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(`test-${Date.now()}.txt`, fileContent, {
        contentType: 'text/plain',
        upsert: false
      });
      
    if (error) {
      console.error('Upload Error:', error);
    } else {
      console.log('Upload Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testUpload();
