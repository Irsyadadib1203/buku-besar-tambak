import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getSupabaseAdmin, isSupabaseServerConfigured } from "@/lib/supabase/server";

const scrypt = promisify(scryptCallback);

export type UserRole = "SUPERADMIN" | "OWNER";

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
}

type StoredUser = Omit<User, "password"> & { password_hash: string };

function getInitialAdmin() {
  const username = process.env.SUPERADMIN_USERNAME?.trim();
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!username || !password) return null;
  return { id: "superadmin", username, password, role: "SUPERADMIN" as const };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const derivedKey = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

function publicUser(user: User): Omit<User, "password"> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function getUsers(): Promise<Omit<User, "password">[]> {
  if (!isSupabaseServerConfigured) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("app_users")
    .select("id, username, role")
    .order("username");

  if (error) throw new Error(`Gagal mengambil pengguna: ${error.message}`);
  return (data ?? []) as Omit<User, "password">[];
}

export async function authenticateUser(username: string, password: string): Promise<Omit<User, "password"> | null> {
  const initialAdmin = getInitialAdmin();
  if (initialAdmin && username === initialAdmin.username && password === initialAdmin.password) {
    return publicUser(initialAdmin);
  }

  if (!isSupabaseServerConfigured) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("app_users")
    .select("id, username, role, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(`Gagal memverifikasi pengguna: ${error.message}`);
  if (!data || !(await verifyPassword(password, (data as StoredUser).password_hash))) return null;

  return publicUser(data as StoredUser);
}

export async function createUser(data: { username: string; password: string; role: UserRole }): Promise<Omit<User, "password">> {
  const username = data.username.trim();
  if (!/^[a-zA-Z0-9_.-]{3,64}$/.test(username)) {
    throw new Error("Username harus 3–64 karakter dan hanya berisi huruf, angka, titik, garis bawah, atau strip.");
  }
  if (data.password.length < 12) {
    throw new Error("Password harus minimal 12 karakter.");
  }
  if (data.role !== "OWNER" && data.role !== "SUPERADMIN") {
    throw new Error("Peran pengguna tidak valid.");
  }
  if (!isSupabaseServerConfigured) {
    throw new Error("Supabase belum dikonfigurasi di server.");
  }

  const { data: newUser, error } = await getSupabaseAdmin()
    .from("app_users")
    .insert({ username, password_hash: await hashPassword(data.password), role: data.role })
    .select("id, username, role")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Username sudah terdaftar.");
    throw new Error(`Gagal membuat pengguna: ${error.message}`);
  }

  return newUser as Omit<User, "password">;
}

export async function deleteUser(id: string): Promise<void> {
  if (!isSupabaseServerConfigured) throw new Error("Supabase belum dikonfigurasi di server.");
  const { error } = await getSupabaseAdmin().from("app_users").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus pengguna: ${error.message}`);
}
