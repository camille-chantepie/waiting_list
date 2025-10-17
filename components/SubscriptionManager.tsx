'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Subscription {
  id: string;
  status: string;
  quota_limit: number;
  quota_used: number;
  credit_balance: number;
  monthly_cost: number;
  last_charge_date: string;
  next_charge_date: string;
  low_balance_alerted: boolean;
}

interface SubscriptionManagerProps {
  userId: string;
}

interface SubscriptionCheck {
  student_count: number;
  monthly_cost: number;
  current_balance: number;
  can_afford_next_month: boolean;
  months_remaining: number;
}

interface ReferralData {
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
}

export default function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionCheck, setSubscriptionCheck] = useState<SubscriptionCheck | null>(null);
  const [creditAmount, setCreditAmount] = useState(20);
  const [referralCode, setReferralCode] = useState('');
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [enteredReferralCode, setEnteredReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      // Récupérer les infos de l'abonnement
      const response = await fetch(`/api/stripe/monthly-charge?userId=${userId}`);
      const data = await response.json();
      
      if (data.subscription) {
        setSubscription(data.subscription);
        setSubscriptionCheck({
          student_count: data.student_count,
          monthly_cost: data.monthly_cost,
          current_balance: data.current_balance,
          can_afford_next_month: data.can_afford_next_month,
          months_remaining: data.months_remaining,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralData = async () => {
    try {
      const response = await fetch(`/api/referral?userId=${userId}`);
      const data = await response.json();
      
      if (data.referral_code) {
        setReferralData({
          referral_code: data.referral_code,
          referral_count: data.referral_count || 0,
          referral_earnings: data.referral_earnings || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const copyReferralCode = async () => {
    if (referralData?.referral_code) {
      try {
        await navigator.clipboard.writeText(referralData.referral_code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const saveReferralCode = async () => {
    if (!enteredReferralCode.trim()) {
      alert('Veuillez entrer un code de parrainage');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          referralCode: enteredReferralCode.trim() 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Code de parrainage enregistré ! Vous recevrez 5€ lors de votre premier rechargement.');
        setEnteredReferralCode('');
        setReferralCode(data.referral_code);
      } else {
        alert(data.error || 'Erreur lors de l&apos;enregistrement du code');
      }
    } catch (error) {
      console.error('Error saving referral code:', error);
      alert('Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCredit = async () => {
    if (creditAmount < 20) {
      alert('Le montant minimum est de 20€');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          creditAmount,
          referralCode: enteredReferralCode.trim() || undefined
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p>Chargement...</p>
      </div>
    );
  }

  const currentBalance = subscription?.credit_balance || 0;
  const monthlyCost = subscriptionCheck?.monthly_cost || 0;
  const studentCount = subscriptionCheck?.student_count || 0;
  const canAffordNextMonth = subscriptionCheck?.can_afford_next_month || false;
  const monthsRemaining = subscriptionCheck?.months_remaining || 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Gestion de l&apos;abonnement</h2>

      {/* Affichage du solde et des informations */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Solde de crédit</p>
            <p className="text-2xl font-bold text-indigo-600">{currentBalance.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Coût mensuel actuel</p>
            <p className="text-2xl font-bold text-gray-800">{monthlyCost.toFixed(2)}€/mois</p>
            <p className="text-xs text-gray-500">{studentCount} élève{studentCount > 1 ? 's' : ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mois restants</p>
            <p className="text-2xl font-bold text-green-600">
              {monthsRemaining > 0 ? `~${monthsRemaining} mois` : '0 mois'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerte si solde insuffisant */}
      {!canAffordNextMonth && currentBalance > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-semibold text-orange-800 mb-1">Solde insuffisant pour le mois prochain</p>
              <p className="text-sm text-orange-700">
                Votre solde actuel ({currentBalance.toFixed(2)}€) ne couvrira pas le coût du mois prochain ({monthlyCost.toFixed(2)}€). 
                Veuillez recharger votre compte pour continuer à utiliser Akademos.
              </p>
            </div>
          </div>
        </div>
      )}

      {subscription?.status === 'insufficient_funds' && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-start">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <p className="font-semibold text-red-800 mb-1">Abonnement suspendu</p>
              <p className="text-sm text-red-700">
                Votre compte n&apos;a pas de crédit suffisant. Rechargez maintenant pour réactiver votre accès.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section de rechargement de crédit */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Recharger mon crédit</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ajoutez du crédit à votre compte. Le montant minimum est de 20€.
        </p>
        
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Montant à ajouter (€)
            </label>
            <input
              type="number"
              min="20"
              step="5"
              value={creditAmount}
              onChange={(e) => setCreditAmount(parseFloat(e.target.value) || 20)}
              className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddCredit}
            disabled={actionLoading || creditAmount < 20}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? 'Chargement...' : 'Recharger'}
          </button>
        </div>

        {/* Suggestions de montant */}
        <div className="mt-3 flex gap-2">
          <p className="text-sm text-gray-600 mr-2">Suggestions :</p>
          {[20, 50, 100, 200].map((amount) => (
            <button
              key={amount}
              onClick={() => setCreditAmount(amount)}
              className="text-sm px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {amount}€
            </button>
          ))}
        </div>
      </div>

      {/* Section de parrainage */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold mb-3 text-green-900">🎁 Parrainage</h3>
        
        {referralData ? (
          <div>
            <p className="text-sm text-green-800 mb-3">
              Partagez votre code avec d&apos;autres professeurs et gagnez <strong>5€ de crédit</strong> quand ils font leur premier rechargement de 20€ !
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white border-2 border-green-300 rounded px-4 py-2">
                <p className="text-xs text-gray-600 mb-1">Votre code de parrainage</p>
                <p className="text-2xl font-bold text-green-700 tracking-wider">
                  {referralData.referral_code}
                </p>
              </div>
              <button
                onClick={copyReferralCode}
                className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors"
              >
                {copySuccess ? '✓ Copié' : '📋 Copier'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded p-3 border border-green-200">
                <p className="text-xs text-gray-600">Filleuls parrainés</p>
                <p className="text-xl font-bold text-green-700">{referralData.referral_count}</p>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <p className="text-xs text-gray-600">Gains de parrainage</p>
                <p className="text-xl font-bold text-green-700">{referralData.referral_earnings.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-green-800 mb-3">
              Un professeur vous a parrainé ? Entrez son code ci-dessous et gagnez tous les deux 5€ lors de votre premier rechargement !
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Code de parrainage"
                value={enteredReferralCode}
                onChange={(e) => setEnteredReferralCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 border-2 border-green-300 rounded px-4 py-2 focus:border-green-500 focus:outline-none uppercase"
              />
              <button
                onClick={saveReferralCode}
                disabled={actionLoading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Valider
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informations sur le système de tarification */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Comment fonctionne la tarification ?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>5€/mois</strong> pour le premier élève</li>
          <li>• <strong>+2€/mois</strong> par élève supplémentaire</li>
          <li>• Le montant est automatiquement déduit chaque mois</li>
          <li>• Rechargez minimum 20€ à chaque fois</li>
          <li>• Vous recevrez une alerte si votre solde est insuffisant</li>
        </ul>
      </div>

      {/* Détails de l'abonnement */}
      {subscription && subscription.last_charge_date && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Détails de l&apos;abonnement</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Dernier prélèvement</p>
              <p className="font-medium">
                {new Date(subscription.last_charge_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Prochain prélèvement</p>
              <p className="font-medium">
                {subscription.next_charge_date 
                  ? new Date(subscription.next_charge_date).toLocaleDateString('fr-FR')
                  : 'Non planifié'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
