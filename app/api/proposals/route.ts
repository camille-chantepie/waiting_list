import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Récupérer les propositions de créneaux
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacher_id');
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');

    if (!teacherId && !studentId) {
      return NextResponse.json(
        { error: "teacher_id or student_id is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from('time_slots')
      .select(`
        id,
        start_time,
        end_time,
        title,
        description,
        status,
        proposed_by_type,
        created_at,
        updated_at,
        relation:teacher_student_relations (
          id,
          teacher:teachers (
            id,
            nom,
            prenom,
            email
          ),
          student:students (
            id,
            nom,
            prenom,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Filtrer par professeur ou étudiant
    if (teacherId) {
      // Récupérer les relations du professeur
      const { data: relations } = await supabase
        .from('teacher_student_relations')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('status', 'active');
      
      if (relations && relations.length > 0) {
        const relationIds = relations.map(r => r.id);
        query = query.in('relation_id', relationIds);
      } else {
        // Aucune relation = aucune proposition
        return NextResponse.json({ data: [] });
      }
    } else if (studentId) {
      // Récupérer les relations de l'étudiant
      const { data: relations } = await supabase
        .from('teacher_student_relations')
        .select('id')
        .eq('student_id', studentId)
        .eq('status', 'active');
      
      if (relations && relations.length > 0) {
        const relationIds = relations.map(r => r.id);
        query = query.in('relation_id', relationIds);
      } else {
        return NextResponse.json({ data: [] });
      }
    }

    // Filtrer par statut si demandé
    if (status && ['pending', 'accepted', 'rejected', 'proposed', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching proposals:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Formatter les données
    const formattedData = data?.map(proposal => ({
      id: proposal.id,
      start_time: proposal.start_time,
      end_time: proposal.end_time,
      title: proposal.title || 'Cours particulier',
      description: proposal.description,
      status: proposal.status,
      proposed_by_type: proposal.proposed_by_type,
      created_at: proposal.created_at,
      updated_at: proposal.updated_at,
      teacher: Array.isArray(proposal.relation) ? proposal.relation[0]?.teacher?.[0] : (proposal.relation as any)?.teacher,
      student: Array.isArray(proposal.relation) ? proposal.relation[0]?.student?.[0] : (proposal.relation as any)?.student,
      relation_id: Array.isArray(proposal.relation) ? proposal.relation[0]?.id : (proposal.relation as any)?.id
    })) || [];

    return NextResponse.json({ data: formattedData });

  } catch (error) {
    console.error('Error in GET /api/proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle proposition de créneau
export async function POST(req: NextRequest) {
  try {
    const { relation_id, start_time, end_time, title, description, proposed_by_id, proposed_by_type } = await req.json();

    if (!relation_id || !start_time || !end_time || !proposed_by_id || !proposed_by_type) {
      return NextResponse.json(
        { error: "relation_id, start_time, end_time, proposed_by_id, and proposed_by_type are required" },
        { status: 400 }
      );
    }

    // Vérifier que la relation existe et est active
    const { data: relation, error: relationError } = await supabase
      .from('teacher_student_relations')
      .select('id, teacher_id, student_id, status')
      .eq('id', relation_id)
      .single();

    if (relationError || !relation) {
      return NextResponse.json(
        { error: "Relation not found" },
        { status: 404 }
      );
    }

    if (relation.status !== 'active') {
      return NextResponse.json(
        { error: "This relation is not active" },
        { status: 403 }
      );
    }

    // Vérifier que proposed_by_id correspond bien à l'étudiant ou au professeur de la relation
    if (proposed_by_type === 'student' && proposed_by_id !== relation.student_id) {
      return NextResponse.json(
        { error: "Proposed_by_id does not match the student in this relation" },
        { status: 403 }
      );
    }
    
    if (proposed_by_type === 'teacher' && proposed_by_id !== relation.teacher_id) {
      return NextResponse.json(
        { error: "Proposed_by_id does not match the teacher in this relation" },
        { status: 403 }
      );
    }

    // Créer la proposition
    const { data: proposal, error: insertError } = await supabase
      .from('time_slots')
      .insert({
        relation_id,
        start_time,
        end_time,
        title: title || null,
        description: description || null,
        proposed_by_id,
        proposed_by_type,
        status: 'proposed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating proposal:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      proposal: proposal
    });

  } catch (error) {
    console.error('Error in POST /api/proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une proposition (accepter/rejeter)
export async function PATCH(req: NextRequest) {
  try {
    const { proposal_id, status, teacher_id } = await req.json();

    if (!proposal_id || !status || !teacher_id) {
      return NextResponse.json(
        { error: "proposal_id, status, and teacher_id are required" },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Récupérer la proposition avec la relation
    const { data: proposal, error: proposalError } = await supabase
      .from('time_slots')
      .select(`
        id,
        relation_id,
        status,
        relation:teacher_student_relations (
          teacher_id
        )
      `)
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Vérifier que c'est bien le professeur de cette relation
    const relationTeacherId = Array.isArray(proposal.relation) 
      ? proposal.relation[0]?.teacher_id 
      : (proposal.relation as any)?.teacher_id;
      
    if (relationTeacherId !== teacher_id) {
      return NextResponse.json(
        { error: "Unauthorized: You are not the teacher of this relation" },
        { status: 403 }
      );
    }

    // Vérifier que la proposition est en attente
    if (proposal.status !== 'proposed') {
      return NextResponse.json(
        { error: "This proposal has already been processed" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const { data: updatedProposal, error: updateError } = await supabase
      .from('time_slots')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      proposal: updatedProposal
    });

  } catch (error) {
    console.error('Error in PATCH /api/proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
