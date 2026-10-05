import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin, isSupabaseServerConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const writableTables = [
  "ponds",
  "cycles",
  "feed_batches",
  "mortalities",
  "harvests",
  "sales",
  "stock_adjustments",
  "expenses",
  "assets",
] as const;

type WritableTable = (typeof writableTables)[number];

async function requireSession() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

function configurationError() {
  return NextResponse.json(
    { error: "Supabase belum dikonfigurasi di environment server." },
    { status: 503 }
  );
}

export async function GET() {
  if (!(await requireSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseServerConfigured) return configurationError();

  const db = getSupabaseAdmin();
  const [species, ponds, assets, cycles] = await Promise.all([
    db.from("species").select("*").order("name"),
    db.from("ponds").select("*").order("name"),
    db.from("assets").select("*").order("bought_at", { ascending: false }),
    db.from("cycles").select(`
      *,
      species:species_id (*),
      feed_batches (*),
      mortalities (*),
      harvests (*),
      sales (*),
      stock_adjustments (*),
      expenses (*)
    `).order("stocked_at", { ascending: false }),
  ]);

  const failed = [species, ponds, assets, cycles].find((result) => result.error);
  if (failed?.error) {
    return NextResponse.json({ error: `Gagal mengambil data: ${failed.error.message}` }, { status: 502 });
  }

  return NextResponse.json({
    species: species.data ?? [],
    ponds: ponds.data ?? [],
    assets: assets.data ?? [],
    cycles: cycles.data ?? [],
  });
}

export async function POST(request: Request) {
  if (!(await requireSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseServerConfigured) return configurationError();

  let body: { operation?: string; table?: WritableTable; record?: Record<string, unknown>; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  if (!body.table || !writableTables.includes(body.table)) {
    return NextResponse.json({ error: "Tabel data tidak valid." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  if (body.operation === "upsert" && body.record && typeof body.record.id === "string") {
    const { error } = await db.from(body.table).upsert(body.record);
    if (error) return NextResponse.json({ error: `Gagal menyimpan data: ${error.message}` }, { status: 422 });
    return NextResponse.json({ success: true });
  }

  if (body.operation === "delete" && typeof body.id === "string") {
    const { error } = await db.from(body.table).delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: `Gagal menghapus data: ${error.message}` }, { status: 422 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Operasi data tidak valid." }, { status: 400 });
}
