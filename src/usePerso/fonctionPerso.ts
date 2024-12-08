import toast from "react-hot-toast";
import { RecupType } from "../typescript/DataType";
import { useEffect } from "react";
import { accountService, userService } from "../_services/account.service";

export function ccyFormat(num: number) {
    return `${num.toFixed(2)}`;
  }

// Pour retouner la multiplication de deux numbres
export function priceRow(qte: number, pu: number) {
    return qte * pu;
  }

export function subtotal(items: readonly RecupType[]) {
  return items
    .map(({ prix_total }) => prix_total || 0) // Assurez-vous que prix_total est défini
    .reduce((sum, i) => (sum ?? 0) + (i ?? 0), 0); // Assurez-vous que sum et i sont définis
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
      // Nettoyer l'écouteur d'événements lors du démontage du composant
      document.removeEventListener('contextmenu', handleContextMenu, false);
    };
  }, []);
}

export function formatNumberWithSpaces(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}


export function foncError(error: any)  {

  const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
  
  return toast.error(message);
}

export const logout = () => {
  accountService.logout();
  userService.userLogout();
  toast.success("Déconneter");
};

export const getBgClass = (qte: number): string => {
  if (qte <= 5) return 'bg-red-600';
  if (qte <= 20) return 'bg-red-100';
  if (qte <= 50) return 'bg-orange-100';
  if (qte <= 100) return 'bg-green-100';
  return ''; // Pas de classe supplémentaire si qte >= 100
};
export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function stringAvatar(name: string) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('.')
    .toUpperCase();

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

