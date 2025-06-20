import { createClient } from "@/db/server";
import { createPostSchema } from "@/schemas/post";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type deve ser application/json" },
      { status: 415 },
    );
  }
  try {
    // Authentication
    const { data: currentUser, error: authError } =
      await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json(
        {
          error: authError ?? "Unauthorized",
        },
        { status: 401 },
      );
    }

    const parsed = createPostSchema.safeParse(body);
    // Check if the data on body is valid
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }
    // Get body data
    const { title, content, image } = parsed.data;
    // Create post
    const author = {
      id: currentUser.user.id,
      ...currentUser.user.user_metadata, // Nome, avatar_url, etc.
    };
    const { data: postData, error: insertError } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          image,
          author: author,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao salvar no Supabase:", insertError);
      return NextResponse.json(
        { error: "Erro ao salvar post" },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        data: { postData },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Um erro desconhecido",
      },
      { status: 500 },
    );
  }
}
