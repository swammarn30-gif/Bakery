import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const email = "swammarn30@gmail.com";
const password = process.env.BAKERY_ADMIN_PASSWORD;
const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.SUPABASE_DATABASE_URL;

if (!url || !serviceRoleKey || !password || !databaseUrl) throw new Error("Required secure environment variables are missing");
const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: existing, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
let authUser = existing.users.find(user => user.email?.toLowerCase() === email);
if (!authUser) {
  const result = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: email } });
  if (result.error || !result.data.user) throw result.error ?? new Error("Supabase Auth user was not created");
  authUser = result.data.user;
} else {
  const result = await supabase.auth.admin.updateUserById(authUser.id, { password, email_confirm: true });
  if (result.error || !result.data.user) throw result.error ?? new Error("Supabase Auth user was not updated");
  authUser = result.data.user;
}
const sql = postgres(databaseUrl, { prepare: false });
await sql`insert into "users" ("openId", "email", "name", "loginMethod", "role") values (${authUser.id}, ${email}, ${email}, ${"supabase-password"}, ${"admin"}) on conflict ("openId") do update set "email" = excluded."email", "name" = excluded."name", "loginMethod" = excluded."loginMethod", "role" = ${"admin"}, "updatedAt" = now()`;
await sql.end({ timeout: 5 });
console.log(JSON.stringify({ email, authUserId: authUser.id, role: "admin" }));
