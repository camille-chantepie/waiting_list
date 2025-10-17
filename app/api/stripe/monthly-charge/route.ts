import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function calculateMonthlyCost(studentCount: number): number {
  if (studentCount <= 0) return 5;
  if (studentCount === 1) return 5;
  return 5 + (studentCount - 1) * 2; // 5€ + (n-1) * 2€
}

// API pour déduire les frais mensuels
// Cette fonction doit être appelée via un cron job mensuel (ex: Vercel Cron, GitHub Actions, etc.)
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification (Bearer token ou Vercel Cron)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    // Vercel Cron envoie automatiquement un header spécifique
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isValidCron = authHeader === `Bearer ${cronSecret}`;
    
    if (!isVercelCron && !isValidCron) {
      console.error('Unauthorized cron attempt:', { authHeader: authHeader ? 'present' : 'missing' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer tous les abonnements actifs
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    const results = [];
    const now = new Date();

    for (const subscription of subscriptions || []) {
      try {
        // Compter le nombre d'élèves actifs
        const { count: studentCount } = await supabase
          .from('teacher_student_relations')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', subscription.user_id)
          .eq('status', 'active');

        const actualStudentCount = studentCount || 0;
        const monthlyCost = calculateMonthlyCost(actualStudentCount);
        const currentBalance = subscription.credit_balance || 0;
        const newBalance = currentBalance - monthlyCost;

        // Vérifier si le solde est suffisant
        if (newBalance < 0) {
          // Solde insuffisant
          await supabase
            .from('subscriptions')
            .update({
              status: 'insufficient_funds',
              monthly_cost: monthlyCost,
              quota_used: actualStudentCount,
              low_balance_alerted: true,
              updated_at: now.toISOString(),
            })
            .eq('user_id', subscription.user_id);

          results.push({
            user_id: subscription.user_id,
            status: 'insufficient_funds',
            balance: currentBalance,
            cost: monthlyCost,
          });
        } else {
          // Déduire le coût mensuel
          await supabase
            .from('subscriptions')
            .update({
              credit_balance: newBalance,
              monthly_cost: monthlyCost,
              quota_used: actualStudentCount,
              last_charge_date: now.toISOString(),
              next_charge_date: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString(),
              low_balance_alerted: newBalance < monthlyCost, // Alerte si le solde est insuffisant pour le mois prochain
              updated_at: now.toISOString(),
            })
            .eq('user_id', subscription.user_id);

          results.push({
            user_id: subscription.user_id,
            status: 'charged',
            old_balance: currentBalance,
            new_balance: newBalance,
            cost: monthlyCost,
            alert: newBalance < monthlyCost,
          });
        }
      } catch (error) {
        console.error(`Error processing subscription for user ${subscription.user_id}:`, error);
        results.push({
          user_id: subscription.user_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in monthly charge process:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET pour vérifier manuellement les abonnements
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Récupérer l'abonnement
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Compter les élèves
    const { count: studentCount } = await supabase
      .from('teacher_student_relations')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', userId)
      .eq('status', 'active');

    const actualStudentCount = studentCount || 0;
    const monthlyCost = calculateMonthlyCost(actualStudentCount);
    const currentBalance = subscription.credit_balance || 0;
    const canAffordNextMonth = currentBalance >= monthlyCost;

    return NextResponse.json({
      subscription,
      student_count: actualStudentCount,
      monthly_cost: monthlyCost,
      current_balance: currentBalance,
      can_afford_next_month: canAffordNextMonth,
      months_remaining: Math.floor(currentBalance / monthlyCost),
    });
  } catch (error: any) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
