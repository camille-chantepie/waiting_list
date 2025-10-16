import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Récupérer les professeurs connectés à un élève OU les élèves connectés à un prof
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    const teacherId = searchParams.get('teacher_id');

    if (!studentId && !teacherId) {
      return NextResponse.json(
        { error: "student_id or teacher_id is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from('teacher_student_relations')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        teacher:teachers (
          id,
          nom,
          prenom,
          email,
          code_invitation
        ),
        student:students (
          id,
          nom,
          prenom,
          email
        )
      `)
      .eq('status', 'active');

    // Filtrer par étudiant ou professeur
    if (studentId) {
      query = query.eq('student_id', studentId);
    } else if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching relations:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Formatter les données pour le frontend
    const formattedData = data?.map(relation => ({
      relation_id: relation.id,
      status: relation.status,
      connected_at: relation.created_at,
      teacher: relation.teacher,
      student: relation.student
    })) || [];

    return NextResponse.json({ data: formattedData });

  } catch (error) {
    console.error('Error in GET /api/relations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer (désactiver) une relation prof-élève
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relationId = searchParams.get('relation_id');
    const studentId = searchParams.get('student_id');

    if (!relationId || !studentId) {
      return NextResponse.json(
        { error: "relation_id and student_id are required" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut au lieu de supprimer
    const { error } = await supabase
      .from('teacher_student_relations')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', relationId)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error updating relation:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/relations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
