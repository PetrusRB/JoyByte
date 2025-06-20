import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/db/server";
import { z } from "zod";

export const revalidate = 60; // ISR: regenera a cada 60s

const GetUserPostsSchema = z.object({
  user_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // Validação do body
    const body = await request.json();
    const parsed = GetUserPostsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 },
      );
    }
    const { user_id } = parsed.data;

    // Busca o array completo de posts cacheados
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("posts")
      .eq("id", user_id)
      .single();

    if (error) {
      console.error("Failed to fetch cached posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch cached posts" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { posts: data.posts ?? [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err: any) {
    console.error("Unexpected error in POST /api/post/user/get:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
