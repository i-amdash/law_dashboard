import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'supabase', 'add_columns_to_users.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // Execute the SQL
    console.log('Executing SQL script...');
    const { data, error } = await supabase.rpc('pgfunction_sql', { 
      query_text: sqlContent 
    });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('SQL script executed successfully!');
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
