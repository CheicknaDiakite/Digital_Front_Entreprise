import { CheckIcon } from '@heroicons/react/20/solid'

// Types
interface PricingTier {
  name: string;
  id: string;
  href: string;
  priceMonthly: string;
  price?: string;
  description: string;
  features: string[];
  featured: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Stocks simple',
    id: 'tier-simple',
    href: '#',
    priceMonthly: '40 000 f',
    description: "L'essentiel pour commencer à gérer votre stock efficacement.",
    features: [
      'Suivi des stocks',
      'Ventes effectuées (par mois)',
      'Produits les plus vendus',
      'Gestion de facture',
      'Gestion d\'historique',
      'Gestion d\'archive',
    ],
    featured: false,
  },
  {
    name: 'Stocks Basic',
    id: 'tier-basic',
    href: '#',
    priceMonthly: '75 000 f',
    description: "Le plan idéal pour une gestion complète de votre activité commerciale.",
    features: [
      'Tout dans Stocks simple',
      'Suivi des dépenses',
      'Envoi des factures en PDF',
      'Rapports détaillés',
      'Support prioritaire',
    ],
    featured: false,
  },
  {
    name: 'Stocks Premium',
    id: 'tier-premium',
    href: '#',
    priceMonthly: 'Illimité',
    description: "La puissance totale pour les entreprises sans limites de croissance.",
    features: [
      'Tout dans Stocks Basic',
      'Utilisateurs illimités',
      'Multi-boutiques',
      'Personnalisation avancée',
    ],
    featured: true,
  },
];

const PricingCard: React.FC<{ tier: PricingTier }> = ({ tier }) => (
  <div
    className={`rounded-3xl p-8 ring-1 ring-gray-900/10 ${tier.featured
      ? 'relative bg-gray-900 shadow-2xl'
      : 'bg-white/60'
      }`}
  >
    <h3
      id={tier.id}
      className={`${tier.featured ? 'text-indigo-400' : 'text-indigo-600'
        } text-base/7 font-semibold`}
    >
      {tier.name}
    </h3>

    {tier.price &&
      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10 line-through">
        {tier.price}
      </span>
    }

    <p className="mt-4 flex items-baseline gap-x-2">
      <span
        className={`${tier.featured ? 'text-white' : 'text-gray-900'
          } text-5xl font-semibold tracking-tight`}
      >
        {tier.priceMonthly}
      </span>
      <span className={`${tier.featured ? 'text-gray-400' : 'text-gray-500'} text-base`}>
        .
      </span>
    </p>

    <p className={`${tier.featured ? 'text-gray-300' : 'text-gray-600'} mt-6 text-base/7`}>
      {tier.description}
    </p>

    <ul
      role="list"
      className={`${tier.featured ? 'text-gray-300' : 'text-gray-600'
        } mt-8 space-y-3 text-sm/6`}
    >
      {tier.features.map((feature) => (
        <li key={feature} className="flex gap-x-3">
          <CheckIcon
            className={`${tier.featured ? 'text-indigo-400' : 'text-indigo-600'
              } h-6 w-5 flex-none`}
            aria-hidden="true"
          />
          {feature}
        </li>
      ))}
    </ul>

    <a
      href="https://wa.me/91154834"
      aria-describedby={tier.id}
      className={`
        mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${tier.featured
          ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500'
          : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600'
        }
      `}
    >
      Contactez-nous !
    </a>
  </div>
);

export default function PricingSection() {
  return (
    <div>

      {/* Content */}
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-indigo-200">
          Gest Stocks
        </h2>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-50 sm:text-5xl">
          Pour l'abonnement de votre entreprise !
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-gray-100">
        Choisissez un plan abordable qui contient les meilleures fonctionnalités pour engager
        votre entreprise, fidéliser vos clients et stimuler les ventes.
      </p>

      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-stretch gap-y-6 sm:mt-20 lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.id} tier={tier} />
        ))}
      </div>
    </div>
  );
}
