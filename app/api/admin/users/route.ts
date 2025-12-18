import { auth } from "@/app/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * PATCH /api/admin/users/:userId
 * Update user role (admin only/superadmin)
 * Body: { role: "user" | "admin" | "superadmin" }
 */
export async function PATCH(
  request: NextRequest, 
  { params }: { params: { userId: string } } 
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or superadmin
    const isAdmin =
      session.user.role === "admin" || session.user.role === "superadmin";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update user roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["user", "admin", "superadmin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user', 'admin', or 'superadmin'" },
        { status: 400 }
      );
    }

    const db = client.db();
    const usersCollection = db.collection("users");

    // Update user role
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(params.userId) },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User role updated successfully",
      userId: params.userId,
      role,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or superadmin
    const isAdmin =
      session.user.role === "admin" || session.user.role === "superadmin";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can view users" },
        { status: 403 }
      );
    }

    const db = client.db();
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({})
      .project({ password: 0 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
