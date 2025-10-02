import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, password } = await req.json();

    // Validation basique
    if (!nom || !prenom || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    // Vérifier le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 });
    }

    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom,
        prenom,
        role: 'teacher'
      }
    });

    if (authError) {
      console.error("Erreur Auth:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Insérer les données supplémentaires dans la table teachers
    const { error: dbError } = await supabase
      .from("teachers")
      .insert([
        {
          id: authData.user.id,
          nom,
          prenom,
          email,
        }
      ]);

    if (dbError) {
      console.error("Erreur DB:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}