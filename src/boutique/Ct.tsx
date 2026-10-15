import { CheckIcon } from '@heroicons/react/20/solid';
import { useTheme } from '@mui/material/styles';

type PricingTier = {
  name: string;
  id: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
  contactLabel: string;
};

const pricingTiers: PricingTier[] = [
  {
    name: 'Stock Simple',
    id: 'tier-simple',
    price: '40 000 F',
    period: 'par an',
    description: 'Les outils essentiels pour gérer et suivre votre stock avec votre équipe.',
    features: [
      'Jusqu\'à 2 entreprises',
      '1 personnel (collaborateur)',
      'Suivi des stocks et ventes',
      'Factures et historique',
      'Statistiques de vente',
      'Archivage des opérations',
    ],
    contactLabel: 'Choisir Simple',
  },
  {
    name: 'Stock Pro',
    id: 'tier-pro',
    price: '75 000 F',
    period: 'par an',
    description: 'Une gestion avancée pour piloter votre activité multi-boutiques.',
    features: [
      'Jusqu\'à 5 entreprises',
      'Jusqu\'à 5 personnels',
      'Tout Stock Simple',
      'Suivi des achats et dépenses',
      'États des produits et utilisateurs',
      'Rapports détaillés et support prioritaire',
    ],
    featured: true,
    contactLabel: 'Choisir Pro',
  },
  {
    name: 'Stock Premium',
    id: 'tier-premium',
    price: 'Sur devis',
    period: 'selon vos besoins',
    description: 'Une offre personnalisée pour les organisations sans limites.',
    features: [
      'Entreprises illimitées',
      'Personnels illimités',
      'Tout Stock Pro',
      'Multi-boutiques sans restriction',
      'Support dédié & sur-mesure',
    ],
    contactLabel: 'Demander un devis',
  },
];

const whatsappUrl = (tier: PricingTier) =>
  `https://wa.me/22391154834?text=${encodeURIComponent(`Bonjour, je souhaite des informations sur l'abonnement ${tier.name}.`)}`;

const PricingCard = ({ tier }: { tier: PricingTier }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-1 ${
        tier.featured
          ? isDark
            ? 'border-indigo-500 bg-slate-900/95 shadow-lg shadow-indigo-500/20'
            : 'border-indigo-500 bg-slate-950 shadow-sm shadow-indigo-200'
          : isDark
            ? 'border-slate-700/80 bg-slate-800/70 shadow-none'
            : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
          Recommandé
        </span>
      )}
      <h3
        id={tier.id}
        className={`text-lg font-bold ${
          tier.featured
            ? 'text-indigo-300'
            : isDark
              ? 'text-indigo-400'
              : 'text-indigo-700'
        }`}
      >
        {tier.name}
      </h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={`text-3xl font-extrabold tracking-tight ${
            tier.featured
              ? 'text-white'
              : isDark
                ? 'text-slate-100'
                : 'text-slate-900'
          }`}
        >
          {tier.price}
        </span>
        <span
          className={`text-sm ${
            tier.featured
              ? 'text-slate-400'
              : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
          }`}
        >
          {tier.period}
        </span>
      </div>
      <p
        className={`mt-4 min-h-12 text-sm leading-6 ${
          tier.featured
            ? 'text-slate-300'
            : isDark
              ? 'text-slate-300'
              : 'text-slate-600'
        }`}
      >
        {tier.description}
      </p>
      <ul
        className={`mt-5 space-y-2.5 text-sm ${
          tier.featured
            ? 'text-slate-200'
            : isDark
              ? 'text-slate-300'
              : 'text-slate-600'
        }`}
      >
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <CheckIcon
              className={`h-5 w-5 shrink-0 ${
                tier.featured
                  ? 'text-indigo-300'
                  : isDark
                    ? 'text-indigo-400'
                    : 'text-indigo-600'
              }`}
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={whatsappUrl(tier)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 block rounded-lg px-3 py-2.5 text-center text-sm font-bold transition-colors ${
          tier.featured
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : isDark
              ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
        }`}
      >
        {tier.contactLabel}
      </a>
    </article>
  );
};

export default function PricingSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <section className="px-1 pb-2 pt-1">
      <header className="mx-auto max-w-3xl text-center">
        <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
          Gest Stocks
        </p>
        <h2 className={`mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Choisissez l'offre adaptée à votre entreprise
        </h2>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Les offres Simple et Pro sont valables un an. Premium est construit selon vos besoins.
        </p>
      </header>
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        {pricingTiers.map((tier) => <PricingCard key={tier.id} tier={tier} />)}
      </div>
    </section>
  );
}

