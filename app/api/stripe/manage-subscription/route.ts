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

function calculatePrice(studentCount: number): number {
  if (studentCount <= 0) return 500;
  if (studentCount === 1) return 500;
  return 500 + (studentCount - 1) * 200; // 5€ + (n-1) * 2€
}

export async function POST(req: NextRequest) {
  try {
    const { userId, action, studentCount } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Récupérer l'abonnement existant
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    switch (action) {
      case 'cancel': {
        // Annuler l'abonnement Stripe
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });

        return NextResponse.json({ success: true, message: 'Subscription will be canceled at period end' });
      }

      case 'update': {
        if (!studentCount) {
          return NextResponse.json({ error: 'Student count required for update' }, { status: 400 });
        }

        // Calculer le nouveau prix
        const newPriceAmount = calculatePrice(studentCount);

        // Créer un nouveau prix
        const newPrice = await stripe.prices.create({
          unit_amount: newPriceAmount,
          currency: 'eur',
          recurring: { interval: 'month' },
          product_data: {
            name: `Abonnement Akademos - ${studentCount} élève${studentCount > 1 ? 's' : ''}`,
          },
          metadata: {
            student_count: studentCount.toString(),
          },
        });

        // Mettre à jour l'abonnement
        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            items: [
              {
                id: (await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)).items.data[0].id,
                price: newPrice.id,
              },
            ],
            metadata: {
              student_count: studentCount.toString(),
            },
            proration_behavior: 'always_invoice',
          }
        );

        // Mettre à jour dans Supabase
        await supabase
          .from('subscriptions')
          .update({
            stripe_price_id: newPrice.id,
            quota_limit: studentCount,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        return NextResponse.json({ 
          success: true, 
          subscription: updatedSubscription,
          message: `Subscription updated for ${studentCount} student(s)` 
        });
      }

      case 'reactivate': {
        // Réactiver un abonnement annulé
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: false,
        });

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        return NextResponse.json({ success: true, message: 'Subscription reactivated' });
      }

      case 'portal': {
        // Créer une session du portail client Stripe
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: subscription.stripe_customer_id,
          return_url: `${req.headers.get('origin')}/teacher/account`,
        });

        return NextResponse.json({ url: portalSession.url });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    if (error) {
      return NextResponse.json({ subscription: null });
    }

    // Récupérer les détails Stripe si disponibles
    let stripeSubscription = null;
    if (subscription?.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
      } catch (err) {
        console.error('Error fetching Stripe subscription:', err);
      }
    }

    return NextResponse.json({ 
      subscription, 
      stripeSubscription 
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
