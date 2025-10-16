import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Diagnostic de la base de données
export async function GET(req: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Vérifier la table teachers
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('id, nom, prenom, email, code_invitation')
      .limit(5);

    results.checks.teachers = {
      exists: !teachersError,
      error: teachersError?.message,
      count: teachers?.length || 0,
      sample: teachers,
      hasCodeInvitation: teachers?.every(t => t.code_invitation) || false
    };

    // Vérifier la table students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, nom, prenom, email')
      .limit(5);

    results.checks.students = {
      exists: !studentsError,
      error: studentsError?.message,
      count: students?.length || 0,
      sample: students
    };

    // Vérifier la table teacher_student_relations
    const { data: relations, error: relationsError } = await supabase
      .from('teacher_student_relations')
      .select('*')
      .limit(5);

    results.checks.relations = {
      exists: !relationsError,
      error: relationsError?.message,
      count: relations?.length || 0,
      sample: relations
    };

    // Vérifier la table messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);

    results.checks.messages = {
      exists: !messagesError,
      error: messagesError?.message,
      count: messages?.length || 0,
      sample: messages
    };

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('Error in diagnostic:', error);
    return NextResponse.json(
      { 
        error: 'Diagnostic failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
