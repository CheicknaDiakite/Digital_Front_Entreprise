import toast from "react-hot-toast";
import { RecupType, RestrictionType } from "../typescript/DataType";
import { useEffect } from "react";
import { accountService, userService } from "../_services/account.service";

/**
 * Gestion utilitaire centralisée des erreurs d'authentification (401)
 */
export const handleAuthError = (error: any, navigate: (path: string) => void): boolean => {
  if (error?.response?.status === 401) {
    accountService.logout();
    navigate('/auth/login');
    toast.error("Session expirée. Veuillez vous reconnecter.");
    return true;
  }
  return false;
};

export function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

// Pour retourner la multiplication de deux nombres
export function priceRow(qte: number, pu: number) {
  return qte * pu;
}

export function subtotal(items: readonly RecupType[]) {
  return items
    .map(({ prix_total }) => prix_total || 0)
    .reduce((sum, i) => (sum ?? 0) + (i ?? 0), 0);
}

export const generateOrderNumber = (): string => {
  return 'FAC-' + Math.floor(Math.random() * 1000000).toString();
};

// Vérification si la licence est expirée
export const isLicenceExpired = (expirationDate: string): boolean => {
  const currentDate = new Date();
  const licenceExpirationDate = new Date(expirationDate);
  return currentDate > licenceExpirationDate;
};

export function getLicenceDuration(dateStr: string) {
  if (!dateStr) return '';
  const now = new Date();
  const exp = new Date(dateStr);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expirée';
  } else if (diffDays < 30) {
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30);
    return `${months} mois`;
  } else if (diffDays >= 365 * 3) {
    return 'illimitée';
  } else {
    const years = Math.round(diffDays / 365);
    return `${years} an${years > 1 ? 's' : ''}`;
  }
}

export function isRecupType(value: unknown): value is RecupType {
  return typeof value === 'object' && value !== null && 'all' in value && typeof (value as RecupType).all === 'string';
}

export function reloadOnce() {
  const hasReloaded = localStorage.getItem('hasReloaded');
  if (!hasReloaded) {
    localStorage.setItem('hasReloaded', 'true');
    window.location.reload();
  }
}

export function notClick() {
  return useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu, false);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, false);
    };
  }, []);
}

export function formatNumberWithSpaces(number: string | number | null | undefined): string {
  if (number == null || isNaN(Number(number))) return '0,00';
  const num = typeof number === 'string' ? parseFloat(number) : number;
  const formattedNumber = num.toFixed(2).replace('.', ',');
  return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function foncError(error: any) {
  const message = error?.response?.data?.message || error?.message || "Une erreur est survenue";
  return toast.error(message);
}

export const logout = async () => {
  try {
    await userService.userLogout();
  } catch {
    // Ignorer si la session est déjà expirée
  }
  accountService.logout();
};

export const getBgClass = (qte: number, qte_critique?: number): string => {
  if (qte === qte_critique) return 'bg-red-500';
  if (qte <= 5) return 'bg-red-700';
  if (qte <= 20) return 'bg-red-500';
  if (qte <= 50) return 'bg-orange-500';
  if (qte <= 100) return 'bg-green-500';
  return '';
};

export function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export function stringAvatar(name: string) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('.')
    .toUpperCase();

  return {
    sx: { bgcolor: stringToColor(name) },
    children: initials,
  };
}

export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const isAccessAllowed = (getRestruction: RestrictionType) => {
  if (!getRestruction.active) return true;

  const now = new Date();
  const jsDay = now.getDay();
  const backendDay = jsDay === 0 ? 6 : jsDay - 1;

  if (backendDay < getRestruction.day_start || backendDay > getRestruction.day_end) {
    return false;
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startH, startM] = getRestruction.hour_start.split(':').map(Number);
  const startTime = startH * 60 + startM;

  const [endH, endM] = getRestruction.hour_end.split(':').map(Number);
  const endTime = endH * 60 + endM;

  return currentTime >= startTime && currentTime <= endTime;
};
