import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { SettingsForm } from "./components/settings-form";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SettingsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch store from Supabase
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', params.storeId)
    .eq('user_id', userId) // Assuming your user ID column is named 'user_id'
    .single(); // Get a single store record

  if (storeError || !store) {
    redirect('/');
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
}

export default SettingsPage;
