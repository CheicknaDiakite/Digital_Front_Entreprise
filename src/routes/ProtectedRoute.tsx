import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useFetchUser } from '../usePerso/fonction.user';
import { connect } from '../_services/account.service';

interface ProtectedRouteProps {
  requiredRole: number | number[];  // Accepte un seul rôle ou plusieurs rôles
  redirectPath?: string;            // Chemin vers lequel rediriger si l'utilisateur n'est pas autorisé
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectPath = '/', // Par défaut, redirige vers la page d'accueil ou une autre page
}) => {
  
  const { us } = useFetchUser(); // Récupérer l'utilisateur connecté
  
  // Si l'utilisateur n'est pas connecté, rediriger
  if (!us) {
    return <Navigate to={redirectPath} replace />;
  }

  // Vérification du rôle
  // Si l'utilisateur n'a pas encore de rôle assigné (compte nouvellement créé / en attente),
  // il bénéficie de l'accès aux opérations de base (rôles 1 et 2 pour son entreprise en Mode Découverte).
  // Les accès avancés (personnel, etc.) et fonctionnalités bridées sont sécurisés par FeatureGate.
  const isDecouverteUser = !us.role || us.role === 0;
  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.includes(us.role) || (isDecouverteUser && (requiredRole.includes(1) || requiredRole.includes(2)))
    : us.role === requiredRole || (isDecouverteUser && (requiredRole === 1 || requiredRole === 2));

  // Si l'utilisateur n'a pas le bon rôle, rediriger
  if (!hasAccess) {
    return <Navigate to={redirectPath} replace />;
  }

  // Si tout est correct, permettre l'accès aux enfants (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
