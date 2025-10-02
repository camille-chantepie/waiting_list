import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, classe, matiere } = await req.json();

    // Validation basique
    if (!nom || !prenom || !classe || !matiere) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const { error } = await supabase
      .from("students")
      .insert([
        {
          nom,
          prenom,
          classe,
          matiere,
        }
      ]);

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}