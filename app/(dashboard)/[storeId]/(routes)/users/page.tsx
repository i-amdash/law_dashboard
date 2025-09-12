import { createClient } from '@supabase/supabase-js';
import { format } from "date-fns";

import { UsersClient } from "./components/client";
import { User } from "@/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UsersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return <div>Error loading users</div>;
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UsersClient users={users} />
      </div>
    </div>
  );
}
 
export default UsersPage;
