// app/api/posts/route.ts
import { createClient } from "@/db/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar posts:", error);
      return NextResponse.json(
        { error: "Erro ao buscar posts" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: posts });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
