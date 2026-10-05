import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUsers, createUser, deleteUser } from "@/lib/auth/users";

async function checkSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return false;
  }
  return true;
}

export async function GET() {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  return NextResponse.json(await getUsers());
}

export async function POST(request: Request) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  try {
    const body = (await request.json()) as { username?: string; password?: string; role?: any };
    const { username, password, role } = body;
    
    if (!username || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const user = await createUser({ username, password, role });
    return NextResponse.json(user, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }
  
  try {
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
