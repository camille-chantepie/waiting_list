import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubscriptionStatus {
  canAddStudent: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

/**
 * Vérifie si un professeur peut ajouter un nouvel élève selon son abonnement
 * @param teacherId - L'ID du professeur
 * @returns Un objet contenant l'état de l'abonnement et si l'ajout est possible
 */
export async function checkSubscriptionLimit(teacherId: string): Promise<SubscriptionStatus> {
  try {
    // Récupérer l'abonnement du professeur
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', teacherId)
      .single();

    // Si pas d'abonnement ou erreur
    if (subError || !subscription) {
      return {
        canAddStudent: false,
        currentCount: 0,
        limit: 0,
        message: 'Aucun abonnement actif. Veuillez souscrire à un abonnement pour ajouter des élèves.',
      };
    }

    // Vérifier le statut de l'abonnement
    if (subscription.status !== 'active') {
      return {
        canAddStudent: false,
        currentCount: subscription.quota_used || 0,
        limit: subscription.quota_limit || 0,
        message: `Abonnement ${subscription.status}. Veuillez réactiver votre abonnement.`,
      };
    }

    // Compter le nombre actuel d'élèves
    const { count: studentCount, error: countError } = await supabase
      .from('teacher_student_relations')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('status', 'active');

    if (countError) {
      console.error('Error counting students:', countError);
      return {
        canAddStudent: false,
        currentCount: 0,
        limit: subscription.quota_limit || 0,
        message: 'Erreur lors de la vérification du quota.',
      };
    }

    const currentStudentCount = studentCount || 0;

    // Mettre à jour quota_used dans la base de données
    await supabase
      .from('subscriptions')
      .update({ quota_used: currentStudentCount })
      .eq('user_id', teacherId);

    // Vérifier si la limite est atteinte
    const canAdd = currentStudentCount < (subscription.quota_limit || 0);

    return {
      canAddStudent: canAdd,
      currentCount: currentStudentCount,
      limit: subscription.quota_limit || 0,
      message: canAdd 
        ? undefined 
        : `Limite d'élèves atteinte (${currentStudentCount}/${subscription.quota_limit}). Augmentez votre abonnement pour ajouter plus d'élèves.`,
    };
  } catch (error) {
    console.error('Error checking subscription limit:', error);
    return {
      canAddStudent: false,
      currentCount: 0,
      limit: 0,
      message: 'Erreur lors de la vérification de l\'abonnement.',
    };
  }
}

/**
 * Calcule le prix en fonction du nombre d'élèves
 * @param studentCount - Le nombre d'élèves
 * @returns Le prix en euros
 */
export function calculateSubscriptionPrice(studentCount: number): number {
  if (studentCount <= 0) return 5;
  if (studentCount === 1) return 5;
  return 5 + (studentCount - 1) * 2; // 5€ + (n-1) * 2€
}

/**
 * Récupère le statut de l'abonnement d'un professeur
 * @param teacherId - L'ID du professeur
 * @returns Les détails de l'abonnement ou null
 */
export async function getTeacherSubscription(teacherId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', teacherId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error getting teacher subscription:', error);
    return null;
  }
}
