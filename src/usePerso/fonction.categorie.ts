import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CategorieFormType, SousCategorieFormType } from "../typescript/FormType";
import { useNavigate } from "react-router-dom";
import { CateBouType, DataType, InfoSousType, RecupType, SlugType } from "../typescript/DataType";
import { categorieService, souscategorieService } from "../_services";
import { foncError, handleAuthError } from "./fonctionPerso";
import { CategorieType } from "../typescript/CategorieType";

export function useFetchCategorie(slug: string) {
    const navigate = useNavigate();

    const [unCategorie, setUnCategorie] = useState<CategorieType>({
      uuid: '',
      libelle: '',
      slug: '',
      sous_categorie_count: 0,
    });

    const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["entreRecup", slug],
      queryFn: () =>
        categorieService.getCategorie(slug).then((res) => {
          if (res.data?.etat === true) {
            return res.data.donnee;
          } else {
            toast.error(res.data?.message || "Erreur de chargement");
            throw new Error(res.data?.message);
          }
        }),
    });

    useEffect(() => {
      if (error) handleAuthError(error, navigate);
    }, [error, navigate]);

    useEffect(() => {
      if (us) setUnCategorie(us);
    }, [us]);

    return { unCategorie, setUnCategorie, isLoading, isError };
}

export function useCategoriesEntreprise(slug: string) {
    const navigate = useNavigate();

    const [cateEntreprises, setCateEntreprise] = useState<CateBouType[]>([]);

    const { data: us, isLoading, isError, error } = useQuery({
      queryKey: ["enRecup", slug],
      queryFn: async () => {
        const res = await categorieService.categoriesEntreprise(slug);
        if (res.data?.etat === true) {
          return (res.data.donnee as unknown as CateBouType[]) || [];
        } else {
          // toast.error(res.data?.message);
        }
      },
    });

    useEffect(() => {
      if (error) handleAuthError(error, navigate);
    }, [error, navigate]);

    useEffect(() => {
      if (us) setCateEntreprise(us);
    }, [us]);

    return { cateEntreprises, isLoading, isError };
}

export function useCreateCategorie() {
    const navigate = useNavigate();
    const useQ = useQueryClient();

    const ajout = useMutation({
      mutationFn: (data: CategorieFormType) => {
        return categorieService.addCategorie(data).then((res) => {
          if (res.data?.etat === false) {
            if (res.data?.message !== "requette invalide") {
              toast.error(res.data?.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["enRecup"] });
            // toast.success("Ajouté avec succès");
          }
        });
      },
      onError: (error: any) => {
        if (!handleAuthError(error, navigate)) {
          foncError(error);
        }
      },
    });

    return { ajoutCategorie: (post: CategorieFormType) => ajout.mutate(post) };
}

export function useUpdateCategorie() {
    const navigate = useNavigate();
    const useQ = useQueryClient();

    const modif = useMutation({
      mutationFn: (data: CategorieType) => {
        return categorieService.updateCategorie(data).then((res) => {
          if (res.data?.etat === true) {
            // toast.success("Modification réussie");
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

    return { updateCategorie: (chap: CategorieType) => modif.mutate(chap) };
}

export function useDeleteCategorie() {
    const navigate = useNavigate();
    const useQ = useQueryClient();

    const del = useMutation({
      mutationFn: (post: CategorieType) => {
        return categorieService.deleteCategorie(post).then((res) => {
          if (res.data?.etat !== true) {
            toast.error(res.data?.message);
          } else {
            useQ.invalidateQueries({ queryKey: ["entre"] });
            navigate(-1);
            toast.success("Supprimée avec succès");
          }
        });
      },
      onError: (error: any) => {
        if (!handleAuthError(error, navigate)) {
          foncError(error);
        }
      }
    });

    return { deleteCategorie: (post: CategorieType) => del.mutate(post) };
}

// ── SOUS_CATEGORIE ──

export function useFetchSousCate(slug: string) {
  const navigate = useNavigate();

  const [unSousCate, setUnSousCate] = useState<SousCategorieFormType>({
    libelle: '',
    user_id: '',
    categorie_slug: '',
  });

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["sortieRecup", slug],
    queryFn: () =>
      souscategorieService.getSousCategorie(slug).then((res) => {
        if (res.data?.etat === true) {
          return res.data.donnee;
        } else {
          throw new Error(res.data?.message || "Erreur lors de la récupération");
        }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setUnSousCate(us);
  }, [us]);

  return { unSousCate, setUnSousCate, isLoading, isError };
}

export function useAllGetSousCate(slug: string) {
  const navigate = useNavigate();

  const [getSousCates, setSousCate] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["SouCategorie", slug],
    queryFn: () =>
      souscategorieService.getAllSousCategorie(slug).then((res) => {
        if (res.data?.etat === true) {
          return res.data.donnee;
        } else {
          throw new Error(res.data?.message || "Erreur lors de la récupération");
        }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setSousCate(us);
  }, [us]);

  return { getSousCates, setSousCate, isLoading, isError };
}

export function useFetchAllSousCate(slug: string) {
  const navigate = useNavigate();

  const [souscategories, setSousCate] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["SouCategorie", slug],
    queryFn: () =>
      souscategorieService.getSousCategoriesUser(slug).then((res) => {
        if (res.data?.etat === true) {
          return res.data.donnee;
        } else {
          throw new Error(res.data?.message || "Erreur lors de la récupération");
        }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setSousCate(us);
  }, [us]);

  return { souscategories, setSousCate, isLoading, isError };
}

export function useInfoSousCate(slug: SlugType) {
  const navigate = useNavigate();

  const [infos, setInfo] = useState<InfoSousType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["info", slug],
    queryFn: () =>
      souscategorieService.getInfo(slug).then((res) => {
        if (res.data?.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error(res.data?.message);
        }
      }),
  });

  useEffect(() => {
    if (error) handleAuthError(error, navigate);
  }, [error, navigate]);

  useEffect(() => {
    if (us) setInfo(us);
  }, [us]);

  return { infos, isLoading, isError };
}

export function useCateSousCate(slug: SlugType) {
  const navigate = useNavigate();

  const [sousCate, setSousCate] = useState<InfoSousType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["info", slug],
    queryFn: () =>
      souscategorieService.allSousCategorie(slug).then((res) => {
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
    if (us) setSousCate(us);
  }, [us]);

  return { sousCate, isLoading, isError };
}

export function useCreateSousCate() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const ajout = useMutation({
    mutationFn: (data: SousCategorieFormType) => {
      return souscategorieService.addSousCategorie(data).then((res) => {
        if (res.data?.etat === false) {
          if (res.data?.message !== "requette invalide") {
            // toast.error(res.data?.message);
          }
        } else {
          useQ.invalidateQueries({ queryKey: ["SouCategorie"] });
          // toast.success("Ajouté avec succès");
        }
      });
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  return { ajoutSousCate: (post: SousCategorieFormType) => ajout.mutate(post) };
}

export function useUpdateSousCate() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
    mutationFn: (data: SousCategorieFormType) => {
      return souscategorieService.updateSousCategorie(data).then((res) => {
        if (res.data?.etat === true) {
          // toast.success("Modification réussie");
          useQ.invalidateQueries({ queryKey: ["SouCategorie"] });
          navigate(-1);
        } else {
          toast.error(res.data?.message);
        }
      });
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  return { updateSousCate: (chap: SousCategorieFormType) => modif.mutate(chap) };
}

export function useDeleteSousCate() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const del = useMutation({
    mutationFn: (post: DataType) => {
      return souscategorieService.deleteSousCategorie(post).then((res) => {
        if (res.data?.etat !== true) {
          toast.error(res.data?.message);
        } else {
          useQ.invalidateQueries({ queryKey: ["SouCategorie"] });
          navigate(-1);
          toast.success("Supprimée avec succès");
        }
      });
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  return { deleteSousCate: (post: DataType) => del.mutate(post) };
}
