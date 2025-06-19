import { createClient } from "@/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
  const supabase = await createClient()
  try{
    // Authentication
    const {data: currentUser, error: authError} = await supabase.auth.getSession()
    if(authError || !currentUser){
      return NextResponse.json({
        error: authError ?? "Unauthorized"
      }, {status: 401})
    }
    return NextResponse.json({

    }, {status: 200})
  }catch(err){
    return NextResponse.json({
      error: err
    }, {status: 500})
  }
}
