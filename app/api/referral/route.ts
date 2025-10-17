import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fonction pour générer un code de parrainage unique
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans O, 0, I, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - Récupérer le code de parrainage et les stats d'un professeur
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Récupérer l'abonnement avec les infos de parrainage
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('referral_code, referral_count, referral_earnings, referred_by, status, credit_balance')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching referral info:', error);
      return NextResponse.json({ error: 'Failed to fetch referral info' }, { status: 500 });
    }

    // Si pas de code de parrainage, en créer un
    if (!subscription?.referral_code) {
      let newCode = generateReferralCode();
      let attempts = 0;
      let codeExists = true;

      // Vérifier l'unicité du code
      while (codeExists && attempts < 10) {
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('referral_code')
          .eq('referral_code', newCode)
          .single();

        if (!existing) {
          codeExists = false;
        } else {
          newCode = generateReferralCode();
          attempts++;
        }
      }

      // Créer ou mettre à jour l'abonnement avec le code
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          referral_code: newCode,
          referral_count: 0,
          referral_earnings: 0,
          status: subscription?.status || 'active',
          credit_balance: subscription?.credit_balance || 0,
          updated_at: new Date().toISOString(),
        })
        .select('referral_code, referral_count, referral_earnings, referred_by')
        .single();

      if (updateError) {
        console.error('Error creating referral code:', updateError);
        return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
      }

      return NextResponse.json({
        referral_code: updated.referral_code,
        referral_count: updated.referral_count || 0,
        referral_earnings: updated.referral_earnings || 0,
        referred_by: updated.referred_by,
      });
    }

    return NextResponse.json({
      referral_code: subscription.referral_code,
      referral_count: subscription.referral_count || 0,
      referral_earnings: subscription.referral_earnings || 0,
      referred_by: subscription.referred_by,
    });
  } catch (error: any) {
    console.error('Error in referral GET:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Valider et enregistrer un code de parrainage pour un nouveau professeur
export async function POST(req: NextRequest) {
  try {
    const { userId, referralCode } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Vérifier que le code existe
    const { data: referrer, error: referrerError } = await supabase
      .from('subscriptions')
      .select('user_id, referral_code')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json({ 
        error: 'Code de parrainage invalide',
        valid: false 
      }, { status: 404 });
    }

    // Vérifier que ce n'est pas son propre code
    if (referrer.user_id === userId) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez pas utiliser votre propre code de parrainage',
        valid: false 
      }, { status: 400 });
    }

    // Enregistrer le code de parrainage pour ce professeur
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        referred_by: referralCode.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error saving referral code:', updateError);
      return NextResponse.json({ error: 'Failed to save referral code' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'Code de parrainage enregistré avec succès',
    });
  } catch (error: any) {
    console.error('Error in referral POST:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
