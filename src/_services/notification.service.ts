import Axios from './caller.service';

export type AppNotification = {
  uuid: string;
  type: string;
  titre: string;
  message: string;
  lien: string;
  niveau: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  lu: boolean;
};

const getNotifications = (entrepriseUuid: string) =>
  Axios.get<{ etat: boolean; donnee: AppNotification[]; non_lues: number }>(`entreprise/notifications/${entrepriseUuid}`);

const markAsRead = (entrepriseUuid: string, uuids?: string[]) =>
  Axios.post(`entreprise/notifications/${entrepriseUuid}/lire`, { uuids: uuids || [] });

export const notificationService = { getNotifications, markAsRead };
