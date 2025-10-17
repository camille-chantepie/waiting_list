import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkSubscriptionLimit } from "@/utils/subscriptionCheck";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Connecter un élève à un professeur via son code d'invitation
export async function POST(req: NextRequest) {
  try {
    const { student_id, teacher_code } = await req.json();

    console.log('=== API Connect - Start ===');
    console.log('Student ID:', student_id);
    console.log('Teacher Code:', teacher_code);

    if (!student_id || !teacher_code) {
      console.log('Error: Missing parameters');
      return NextResponse.json(
        { error: "student_id and teacher_code are required" },
        { status: 400 }
      );
    }

    // Étape 1: Vérifier que l'élève existe
    console.log('Step 1: Checking if student exists...');
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, nom, prenom')
      .eq('id', student_id)
      .single();

    if (studentError) {
      console.error('Student error:', studentError);
      return NextResponse.json(
        { error: `Student not found: ${studentError.message}` },
        { status: 404 }
      );
    }

    if (!student) {
      console.log('Error: Student not found in database');
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    console.log('Student found:', student);

    // Étape 2: Trouver le professeur avec ce code d'invitation
    console.log('Step 2: Looking for teacher with code...');
    const normalizedCode = teacher_code.toUpperCase().trim();
    console.log('Normalized code:', normalizedCode);
    
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, nom, prenom, email, code_invitation')
      .eq('code_invitation', normalizedCode)
      .single();

    if (teacherError) {
      console.error('Teacher error:', teacherError);
      
      // Vérifier si c'est parce qu'aucun professeur n'a été trouvé
      if (teacherError.code === 'PGRST116') {
        // Essayons de voir tous les codes pour debug
        const { data: allTeachers } = await supabase
          .from('teachers')
          .select('code_invitation')
          .limit(10);
        
        console.log('Available codes:', allTeachers?.map(t => t.code_invitation));
        
        return NextResponse.json(
          { 
            error: "Code professeur invalide. Veuillez vérifier le code et réessayer.",
            debug: {
              providedCode: normalizedCode,
              availableCodes: allTeachers?.map(t => t.code_invitation).filter(Boolean)
            }
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Teacher lookup error: ${teacherError.message}` },
        { status: 500 }
      );
    }

    if (!teacher) {
      console.log('Error: Teacher not found');
      return NextResponse.json(
        { error: "Code professeur invalide. Veuillez vérifier le code et réessayer." },
        { status: 404 }
      );
    }

    console.log('Teacher found:', teacher);

    // Étape 3: Vérifier l'abonnement du professeur
    console.log('Step 3: Checking teacher subscription...');
    const subscriptionStatus = await checkSubscriptionLimit(teacher.id);
    
    if (!subscriptionStatus.canAddStudent) {
      console.log('Error: Subscription limit reached or inactive');
      return NextResponse.json(
        { 
          error: subscriptionStatus.message || "Le professeur ne peut pas ajouter de nouveaux élèves.",
          subscriptionStatus: {
            currentCount: subscriptionStatus.currentCount,
            limit: subscriptionStatus.limit
          }
        },
        { status: 403 }
      );
    }
    
    console.log('Subscription check passed:', subscriptionStatus);

    // Étape 4: Vérifier si la relation existe déjà
    console.log('Step 4: Checking existing relation...');
    const { data: existingRelation, error: relationCheckError } = await supabase
      .from('teacher_student_relations')
      .select('id, status')
      .eq('teacher_id', teacher.id)
      .eq('student_id', student_id)
      .single();

    if (relationCheckError && relationCheckError.code !== 'PGRST116') {
      console.error('Relation check error:', relationCheckError);
    }

    if (existingRelation) {
      console.log('Existing relation found:', existingRelation);
      
      if (existingRelation.status === 'active') {
        console.log('Error: Already connected');
        return NextResponse.json(
          { error: "Vous êtes déjà connecté à ce professeur" },
          { status: 400 }
        );
      } else {
        console.log('Reactivating inactive relation...');
        // Réactiver la relation si elle était inactive
        const { error: updateError } = await supabase
          .from('teacher_student_relations')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRelation.id);

        if (updateError) {
          console.error('Update error:', updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }

        console.log('Successfully reconnected');
        return NextResponse.json({
          success: true,
          message: "Reconnexion réussie au professeur",
          teacher: teacher
        });
      }
    }

    // Étape 5: Créer la nouvelle relation
    console.log('Step 5: Creating new relation...');
    const { data: newRelation, error: insertError } = await supabase
      .from('teacher_student_relations')
      .insert({
        teacher_id: teacher.id,
        student_id: student_id,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création de la relation: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log('Relation created successfully:', newRelation);
    console.log('=== API Connect - Success ===');

    return NextResponse.json({
      success: true,
      message: "Connexion réussie au professeur",
      teacher: teacher,
      relation: newRelation
    });

  } catch (error) {
    console.error('=== API Connect - Error ===');
    console.error('Error in POST /api/relations/connect:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
