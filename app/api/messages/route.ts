import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Récupérer les messages d'une relation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relationId = searchParams.get('relation_id');
    const userId = searchParams.get('user_id');

    if (!relationId || !userId) {
      return NextResponse.json(
        { error: "relation_id and user_id are required" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à cette relation
    const { data: relation, error: relationError } = await supabase
      .from('teacher_student_relations')
      .select('teacher_id, student_id')
      .eq('id', relationId)
      .single();

    if (relationError || !relation) {
      return NextResponse.json(
        { error: "Relation not found" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est soit le prof soit l'élève
    if (relation.teacher_id !== userId && relation.student_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Récupérer les messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('relation_id', relationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    // Marquer comme lus les messages reçus par l'utilisateur
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('relation_id', relationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (updateError) {
      console.error('Error updating read status:', updateError);
    }

    return NextResponse.json({ data: messages || [] });

  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un nouveau message
export async function POST(req: NextRequest) {
  try {
    const { relation_id, sender_id, sender_type, content } = await req.json();

    if (!relation_id || !sender_id || !sender_type || !content) {
      return NextResponse.json(
        { error: "relation_id, sender_id, sender_type, and content are required" },
        { status: 400 }
      );
    }

    if (!['teacher', 'student'].includes(sender_type)) {
      return NextResponse.json(
        { error: "sender_type must be 'teacher' or 'student'" },
        { status: 400 }
      );
    }

    // Vérifier que la relation existe et que l'utilisateur a le droit d'envoyer
    const { data: relation, error: relationError } = await supabase
      .from('teacher_student_relations')
      .select('teacher_id, student_id, status')
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

    // Vérifier que le sender_id correspond au sender_type
    const expectedId = sender_type === 'teacher' ? relation.teacher_id : relation.student_id;
    if (expectedId !== sender_id) {
      return NextResponse.json(
        { error: "Unauthorized: sender_id does not match sender_type" },
        { status: 403 }
      );
    }

    // Insérer le message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        relation_id,
        sender_id,
        sender_type,
        content,
        is_read: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
