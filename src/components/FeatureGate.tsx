import React from 'react';
import { LockClosedIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface FeatureGateProps {
  hasAccess: boolean;
  requiredPlan: 'Stock Simple' | 'Stock Pro' | 'Stock Premium';
  featureTitle?: string;
  description?: string;
  expired?: boolean;
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  hasAccess,
  requiredPlan,
  featureTitle,
  description,
  expired = false,
  children,
  onUpgradeClick,
}) => {
  if (hasAccess) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Ouvre WhatsApp avec un message pré-rempli pour activer le plan
      const text = encodeURIComponent(
        `Bonjour, je souhaite activer la formule ${requiredPlan} pour débloquer ${featureTitle || 'cette fonctionnalité'}.`
      );
      window.open(`https://wa.me/22391154834?text=${text}`, '_blank');
    }
  };

  return (
    <div className="relative mx-auto my-6 max-w-2xl overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-slate-50 p-8 text-center shadow-md">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
        <LockClosedIcon className="h-8 w-8" />
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-3 py-1 text-xs font-bold text-indigo-700">
        <SparklesIcon className="h-3.5 w-3.5" />
        Formule requise : {requiredPlan}
      </div>

      <h3 className="mt-3 text-xl font-extrabold text-slate-900">
        {expired
          ? 'Votre licence a expiré'
          : featureTitle
          ? `${featureTitle} réservé(e)`
          : `Fonctionnalité disponible avec ${requiredPlan}`}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {expired
          ? 'Vos données passées sont conservées en consultation. Renouvelez votre abonnement pour continuer à ajouter et modifier.'
          : description ||
            `Cette fonctionnalité fait partie de la formule ${requiredPlan}. Passez à la formule supérieure pour débloquer votre entreprise sans limites.`}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleUpgrade}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-indigo-300 active:scale-95"
        >
          <SparklesIcon className="h-4 w-4" />
          Activer la formule {requiredPlan}
        </button>
      </div>
    </div>
  );
};

export default FeatureGate;
