import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EntreType, RecupType } from "../typescript/DataType";
import { facEntrerService, facSortieService } from "../_services/facture.service";
import { foncError, handleAuthError } from "./fonctionPerso";
import { FacSorType } from "../typescript/fac";

// ── Factures Entrées ──

export function useFacEntre(slug: string) {
    const navigate = useNavigate();

    const [unFacEntre, setUnFacEntre] = useState<FacSorType>({
        libelle: '',
        user_id: '',
        ref: '',
        date: '',
    });

    const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["entreRecup", slug],
      queryFn: () =>
        facEntrerService.getFacEntre(slug).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message);
            throw new Error(res.data?.message);
          }
        }),
    });

    useEffect(() => {
      if (error) handleAuthError(error, navigate);
    }, [error, navigate]);

    useEffect(() => {
      if (us) setUnFacEntre(us);
    }, [us]);

    return { unFacEntre, setUnFacEntre, isLoading, isError };
}

export function useAllFacEntre(slug: string) {
  const navigate = useNavigate();

  const [entres, setEntre] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["entre", slug],
      queryFn: () =>
      facEntrerService.allFacEntre(slug).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message);
            throw new Error(res.data?.message);
          }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setEntre(us);
  }, [us]);

  return { entres, setEntre, isLoading, isError };
}

export function useGetAllFacEntre(slug: string, uuid: string) {
  const navigate = useNavigate();

  const [facEntresUtilisateur, setEntre] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["facEntre", slug],
      queryFn: () =>
      facEntrerService.getAllFacEntre(slug, uuid).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message);
            throw new Error(res.data?.message);
          }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setEntre(us);
  }, [us]);

  return { facEntresUtilisateur, setEntre, isLoading, isError };
}

export function useCreateFacEntre() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const ajout = useMutation({
      mutationFn: (data: FacSorType) => {
        return facEntrerService.addFacEntre(data).then((res) => {
          if (res.data?.etat === false) {
            if (res.data?.message !== "requette invalide") {
              toast.error(res.data?.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["facEntre"] });
            toast.success("Ajouté avec succès");
          }
        });
      },
      onError: (error) => {
        if (!handleAuthError(error, navigate)) {
          foncError(error);
        }
      },
  });

  return { ajoutFacEntre: (post: FacSorType) => ajout.mutate(post) };
}

export function useUpdateFacEntre() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
      mutationFn: (data: FacSorType) => {
        return facEntrerService.updateFacEntre(data).then((res) => {
          if (res.data?.etat === true) {
            toast.success("Modification réussie");
            useQ.invalidateQueries({ queryKey: ["facEntre"] });
            navigate(-1);
          } else {
            toast.error(res.data?.message);
          }
        });
      },
      onError: (error) => {
        if (!handleAuthError(error, navigate)) {
          foncError(error);
        }
      },
  });

  return { updateFacEntre: (chap: FacSorType) => modif.mutate(chap) };
}

export function useDeleteFacEntre() {
    const navigate = useNavigate();
    const useQ = useQueryClient();

    const del = useMutation({
        mutationFn: (post: FacSorType) => {
          return facEntrerService.deleteFacEntre(post).then((res) => {
            if (res.data?.etat !== true) {
              toast.error(res.data?.message);
            }
          });
        },
        onError: (error) => {
          if (!handleAuthError(error, navigate)) {
            foncError(error);
          }
        },
        onSuccess: () => {
          useQ.invalidateQueries({ queryKey: ["facEntre"] });
          navigate(-1);
          toast.success("Supprimée avec succès");
        },
    });

    return { deleteFacEntre: (post: FacSorType) => del.mutate(post) };
}

// ── Factures Sorties ──

export function useFacSortie(slug: string) {
    const navigate = useNavigate();

    const [unFacSortie, setUnFacSortie] = useState<EntreType>({
        libelle: '',
        user_id: '',
        pu: 0,
        qte: 0,
        categorie_slug: '',
    });

    const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["sortieFacRecup", slug],
      queryFn: () =>
        facSortieService.getFacSortie(slug).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message);
            throw new Error(res.data?.message);
          }
        }),
    });

    useEffect(() => {
      if (error) handleAuthError(error, navigate);
    }, [error, navigate]);

    useEffect(() => {
      if (us) setUnFacSortie(us);
    }, [us]);

    return { unFacSortie, setUnFacSortie, isLoading, isError };
}

export function useAllFacSortie(slug: string) {
  const navigate = useNavigate();

  const [entres, setEntre] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["entre", slug],
      queryFn: () =>
      facSortieService.allFacSortie(slug).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message);
            throw new Error(res.data?.message);
          }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setEntre(us);
  }, [us]);

  return { entres, setEntre, isLoading, isError };
}

export function useGetAllFacSortie(slug: string, uuid: string) {
  const navigate = useNavigate();

  const [facSortiesUtilisateur, setEntre] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["facSortie", slug],
      queryFn: () =>
          facSortieService.getAllFacSortie(slug, uuid).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message);
            throw new Error(res.data?.message);
          }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setEntre(us);
  }, [us]);

  return { facSortiesUtilisateur, setEntre, isLoading, isError };
}

export function useCreateFacSortie() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const ajout = useMutation({
      mutationFn: (data: FacSorType) => {
        return facSortieService.addFacSortie(data).then((res) => {
          if (res.data?.etat === false) {
            if (res.data?.message !== "requette invalide") {
              toast.error(res.data?.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["facSortie"] });
            toast.success("Ajouté avec succès");
          }
        });
      },
      onError: (error) => {
        if (!handleAuthError(error, navigate)) {
          foncError(error);
        }
      },
  });

  return { ajoutFacSortie: (post: FacSorType) => ajout.mutate(post) };
}

export function useUpdateFacSortie() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
      mutationFn: (data: EntreType) => {
        return facSortieService.updateFacSortie(data).then((res) => {
          if (res.data?.etat === true) {
            toast.success("Modification réussie");
            useQ.invalidateQueries({ queryKey: ["entre"] });
            navigate(-1);
          } else {
            toast.error(res.data?.message);
          }
        });
      },
      onError: (error) => {
        if (!handleAuthError(error, navigate)) {
          foncError(error);
        }
      },
  });

  return { updateFacSortie: (chap: EntreType) => modif.mutate(chap) };
}

export function useDeleteFacSortie() {
    const navigate = useNavigate();
    const useQ = useQueryClient();

    const del = useMutation({
        mutationFn: (post: EntreType) => {
          return facSortieService.deleteFacSortie(post).then((res) => {
            if (res.data?.etat !== true) {
              toast.error(res.data?.message);
            }
          });
        },
        onError: (error) => {
          if (!handleAuthError(error, navigate)) {
            foncError(error);
          }
        },
        onSuccess: () => {
          useQ.invalidateQueries({ queryKey: ["entre"] });
          navigate(-1);
          toast.success("Supprimée avec succès");
        },
    });

    return { deleteFacSortie: (post: EntreType) => del.mutate(post) };
}
