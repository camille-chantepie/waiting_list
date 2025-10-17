import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Vérifier s'il s'agit d'un rechargement de crédit
        if (session.metadata?.type === 'credit_recharge') {
          const creditAmount = parseFloat(session.metadata.credit_amount || '0');
          const userId = session.metadata.user_id;

          // Récupérer l'abonnement existant
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('credit_balance, quota_used, referral_credited, referred_by')
            .eq('user_id', userId)
            .single();

          const currentBalance = existingSub?.credit_balance || 0;
          const newBalance = currentBalance + creditAmount;
          const isFirstRecharge = currentBalance === 0;

          // Mettre à jour le solde de crédit
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              credit_balance: newBalance,
              status: 'active',
              low_balance_alerted: false,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Error updating credit balance:', error);
          }

          // Système de parrainage : créditer le parrain si c'est le premier rechargement
          if (isFirstRecharge && existingSub?.referred_by && !existingSub?.referral_credited) {
            const referralCode = existingSub.referred_by;
            
            // Trouver le parrain
            const { data: referrer } = await supabase
              .from('subscriptions')
              .select('user_id, credit_balance, referral_count, referral_earnings')
              .eq('referral_code', referralCode)
              .single();

            if (referrer) {
              const REFERRAL_BONUS = 5; // 5€ de bonus
              const newReferrerBalance = (referrer.credit_balance || 0) + REFERRAL_BONUS;
              const newReferralCount = (referrer.referral_count || 0) + 1;
              const newReferralEarnings = (referrer.referral_earnings || 0) + REFERRAL_BONUS;

              // Créditer le parrain
              await supabase
                .from('subscriptions')
                .update({
                  credit_balance: newReferrerBalance,
                  referral_count: newReferralCount,
                  referral_earnings: newReferralEarnings,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', referrer.user_id);

              // Marquer le filleul comme ayant donné son bonus
              await supabase
                .from('subscriptions')
                .update({
                  referral_credited: true,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

              console.log(`Referral bonus credited: ${REFERRAL_BONUS}€ to ${referrer.user_id} from ${userId}`);
            }
          }
        }
        break;
      }

      // Les événements d'abonnement ne sont plus utilisés avec le système de crédit

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
