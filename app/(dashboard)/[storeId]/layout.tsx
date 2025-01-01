import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/navbar';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '', 
  process.env.SUPABASE_ANON_KEY || ''
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Query the store from Supabase
  const { data: store, error } = await supabase
    .from('stores') // Assuming the table is called 'stores'
    .select('id')
    .eq('user_id', userId) // Assuming the column is named 'user_id'
    .single();

  if (error) {
    console.error('Error fetching store:', error);
  }

  if (!store) {
    redirect(`/`);
  }

  return (
    <>
    <Navbar/>
      {children}
    </>
  );
}
