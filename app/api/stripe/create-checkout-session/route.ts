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

const MINIMUM_CREDIT = 20; // Minimum 20€ de crédit à ajouter

function calculateMonthlyCost(studentCount: number): number {
  if (studentCount <= 0) return 5;
  if (studentCount === 1) return 5;
  return 5 + (studentCount - 1) * 2; // 5€ + (n-1) * 2€
}

export async function POST(req: NextRequest) {
  try {
    const { userId, creditAmount, referralCode } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!creditAmount || creditAmount < MINIMUM_CREDIT) {
      return NextResponse.json({ 
        error: `Le montant minimum est de ${MINIMUM_CREDIT}€` 
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur est un professeur
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Vérifier si le professeur a déjà un customer Stripe
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId: string;

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Créer un nouveau customer Stripe
      const customer = await stripe.customers.create({
        email: teacher.email,
        metadata: {
          user_id: userId,
          user_type: 'teacher',
        },
      });
      customerId = customer.id;
    }

    // Si un code de parrainage est fourni, le valider et l'enregistrer
    if (referralCode) {
      const referralResponse = await fetch(`${req.headers.get('origin')}/api/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, referralCode }),
      });

      if (!referralResponse.ok) {
        const errorData = await referralResponse.json();
        console.log('Referral code validation failed:', errorData);
        // On continue quand même, le code sera juste ignoré
      }
    }

    // Créer la session de paiement unique pour ajouter du crédit
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment', // Paiement unique, pas d'abonnement
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(creditAmount * 100), // Convertir en centimes
            product_data: {
              name: 'Rechargement de crédit Akademos',
              description: `Ajout de ${creditAmount}€ de crédit`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/teacher/account?success=true&amount=${creditAmount}`,
      cancel_url: `${req.headers.get('origin')}/teacher/account?canceled=true`,
      metadata: {
        user_id: userId,
        credit_amount: creditAmount.toString(),
        type: 'credit_recharge',
        referral_code: referralCode || '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
