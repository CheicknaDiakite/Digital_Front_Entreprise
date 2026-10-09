export type FeatureKey =
  | 'upload_media'
  | 'depenses'
  | 'collaborateurs'
  | 'clients'
  | 'stats_basiques'
  | 'stats_detaillees'
  | 'stats_personnalisees';

export interface Capabilities {
  plan: 0 | 1 | 2 | 3;
  plan_label: string;
  type_souscrit: 0 | 1 | 2 | 3;
  is_valid: boolean;
  date_expiration: string | null;
  features: Record<FeatureKey, boolean>;
  limits: {
    entreprises: number | null;
    utilisateurs: number | null;
    articles: number | null;
  };
}

const DEFAULT_CAPABILITIES: Capabilities = {
  plan: 0,
  plan_label: 'Mode Découverte',
  type_souscrit: 0,
  is_valid: true,
  date_expiration: null,
  features: {
    upload_media: false,
    depenses: false,
    collaborateurs: false,
    clients: false,
    stats_basiques: false,
    stats_detaillees: false,
    stats_personnalisees: false,
  },
  limits: {
    entreprises: 1,
    utilisateurs: 1,
    articles: 50,
  },
};

export function usePlanAccess(capabilities?: Capabilities | null) {
  const caps = capabilities ?? DEFAULT_CAPABILITIES;

  const joursRestants = caps.date_expiration
    ? Math.ceil((new Date(caps.date_expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    plan: caps.plan,
    planLabel: caps.plan_label,
    isDecouverte: caps.plan === 0,
    isSimple: caps.plan === 1,
    isPro: caps.plan === 2,
    isPremium: caps.plan === 3,
    isPaid: caps.plan >= 1,
    isValid: caps.is_valid,
    isExpired: !caps.is_valid && caps.type_souscrit > 0,
    joursRestants,
    expireBientot: joursRestants !== null && joursRestants <= 15 && joursRestants >= 0,
    limits: caps.limits,

    // Permissions directes
    can: (feature: FeatureKey) => caps.features?.[feature] === true,
    canUploadMedia: caps.features?.upload_media === true,
    canManageExpenses: caps.features?.depenses === true,
    canAddCollaborators: caps.features?.collaborateurs === true,
    canManageClients: caps.features?.clients === true,
    canViewStats: caps.features?.stats_basiques === true,
  };
}
