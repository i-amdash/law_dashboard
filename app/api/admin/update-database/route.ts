import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "supabase", "add_columns_to_users.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // Execute the SQL directly
    const { error } = await supabase.rpc("pgfunction_exec_sql", {
      query_text: sqlContent,
    });

    if (error) {
      console.error("Error executing SQL:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "SQL script executed successfully!" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
