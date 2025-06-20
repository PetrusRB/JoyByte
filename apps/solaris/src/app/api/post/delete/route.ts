// app/api/post/delete/route.ts
import { createClient } from "@/db/server";
import { deletePostSchema } from "@/schemas/post";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1) Check Content-Type
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type deve ser application/json" },
      { status: 415 },
    );
  }

  // 2) Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = deletePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id } = parsed.data; // number

  try {
    const supabase = await createClient();

    // 3) Autenticação
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData) {
      return NextResponse.json(
        { error: authErr?.message ?? "Não autorizado" },
        { status: 401 },
      );
    }
    const userId = authData.user.id; // string (UUID)

    // 4) Deleção segura: filtra pelo id do post (int) e pelo author.id (uuid) dentro do JSONB
    const { data: deleted, error: deleteErr } = await supabase
      .from("posts")
      .delete()
      .eq("id", id) // id INT8
      .eq("author->>id", userId) // author JSONB → id UUID
      .select("id");

    if (deleteErr) {
      console.error("Erro ao deletar post:", deleteErr);
      return NextResponse.json(
        { error: "Erro interno ao deletar" },
        { status: 500 },
      );
    }

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: "Post não encontrado ou sem permissão" },
        { status: 404 },
      );
    }

    // 5) Sucesso
    return NextResponse.json(
      { message: "Post deletado com sucesso" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Erro inesperado na rota de delete:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
