import { createClient } from "@/db/server";
import { createPostSchema } from "@/schemas/post";
import { NextRequest, NextResponse } from "next/server";

// Define cooldown (ms)
const POST_COOLDOWN_MS = 300000; // 5 minutos

export async function POST(request: NextRequest) {
  // Verifica JSON
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type deve ser application/json" },
      { status: 415 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Autenticação
  const supabase = await createClient();
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser) {
    return NextResponse.json(
      { error: authError?.message ?? "Unauthorized" },
      { status: 401 },
    );
  }
  const userId = currentUser.user.id;

  // Validação do payload
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { title, content, image } = parsed.data;

  // Verifica cooldown: último post do usuário
  const { data: lastPosts, error: fetchError } = await supabase
    .from("posts")
    .select("created_at")
    .eq("author->>id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (fetchError) {
    console.error("Erro ao verificar cooldown:", fetchError);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
  if (lastPosts && lastPosts.length > 0) {
    const lastTime = new Date(lastPosts[0].created_at).getTime();
    const now = Date.now();
    if (now - lastTime < POST_COOLDOWN_MS) {
      return NextResponse.json(
        {
          error: `Aguarde ${Math.ceil((POST_COOLDOWN_MS - (now - lastTime)) / 1000)}s antes de criar outro post.`,
        },
        { status: 429 },
      );
    }
  }

  try {
    // Inserção do post
    const author = {
      id: userId,
      ...currentUser.user.user_metadata,
    };
    const { data: postData, error: insertError } = await supabase
      .from("posts")
      .insert([{ title, content, image, author }])
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao salvar no Supabase:", insertError);
      return NextResponse.json(
        { error: "Erro ao salvar post" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { postData } }, { status: 200 });
  } catch (err) {
    console.error("Erro inesperado ao criar post:", err);
    return NextResponse.json(
      { error: "Um erro desconhecido" },
      { status: 500 },
    );
  }
}
