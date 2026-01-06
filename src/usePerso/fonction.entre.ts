import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DataSlugType, DataType, DepenseType, DepenseSumType, EntreType, RecupType, SortieType, TypeSlug } from "../typescript/DataType";
import { depenseService, entrerService, sortieService } from "../_services";
import { foncError } from "./fonctionPerso";
import { EntreFormType } from "../typescript/FormType";
import { accountService } from "../_services/account.service";

// Fonction utilitaire pour gérer les erreurs d'authentification
const handleAuthError = (error: any, navigate: any) => {
  if (error?.response?.status === 401) {
    // Token expiré et refresh échoué
    accountService.logout();
    navigate('/login');
    toast.error("Session expirée. Veuillez vous reconnecter.");
    return true;
  }
  return false;
};

// Produit
export function useFetchDepense(slug: string) {
  const navigate = useNavigate();

  const [unDepense, setUnDepense] = useState<DepenseType>({
    libelle: '',
    user_id: '',
    somme: 0,
    date: '',
  });

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["entreDepense", slug],
    queryFn: () =>
      depenseService.getDepense(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setUnDepense(us);
    }
  }, [us]);

  return { unDepense, setUnDepense, isLoading, isError };
}

export function useFetchAllDepense(slug: string) {
  const navigate = useNavigate();

  const [entres, setDepense] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["produit", slug],
    queryFn: () =>
      depenseService.allDepense(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setDepense(us);
    }
  }, [us]);

  return { entres, setDepense, isLoading, isError };
}

// Pour recuperertous les entrers d'une Entreprise
export function useGetAllDepense(slug: string) {
  const navigate = useNavigate();

  const [depensesEntreprise, setDepense] = useState<DepenseType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["depenses", slug],
    queryFn: () =>
      depenseService.getAllDepense(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setDepense(us);
    }
  }, [us]);

  return { depensesEntreprise, setDepense, isLoading, isError };
}

export function useGetSumDepense(slug: string) {
  const navigate = useNavigate();

  const [depensesSum, setSum] = useState<DepenseSumType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["depens", slug],
    queryFn: () =>
      depenseService.getSumDepense(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setSum(us);
    }
  }, [us]);

  return { depensesSum, setSum, isLoading, isError };
}

export function useCreateDepense() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const ajout = useMutation({
    mutationFn: (data: DepenseType) => {
      return depenseService.addDepense(data)
        .then((res) => {
          if (res.data.etat === false) {
            if (res.data.message !== "requette invalide") {
              toast.error(res.data.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["depenses"] });
            toast.success("C'est ajouter avec succès");
          }
        })
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      }
    },
  });

  const ajoutDepense = (post: DepenseType) => {
    ajout.mutate(post);
  };

  return { ajoutDepense }
}

export function useUpdateDepense() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
    mutationFn: (data: DepenseType) => {
      return depenseService
        .updateDepense(data)
        .then((res) => {
          if (res.data.etat === true) {
            toast.success("Modification reuissi");
            useQ.invalidateQueries({ queryKey: ["depenses"] });
            navigate(-1);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  const updateDepense = (chap: DepenseType) => {
    modif.mutate(chap);
  };

  return { updateDepense }
}

export function useDeleteDepense() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const del = useMutation({
    mutationFn: (post: DepenseType) => {
      return depenseService.deleteDepense(post).then((res) => {
        if (res.data.etat !== true) {
          toast.error(res.data.message);
        }
      });
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      }
    },
    onSuccess: () => {
      useQ.invalidateQueries({ queryKey: ["depenses"] });
      navigate(-1);
      toast.success("Supprimée avec succès");
    },
  });

  const deleteDepense = (post: DepenseType) => {
    del.mutate(post);
  };

  return { deleteDepense }
}

// Inventaire

export function useFetchEntre(slug: string) {
  const navigate = useNavigate();

  const [unEntre, setUnEntre] = useState<EntreType>({
    libelle: '',
    user_id: '',
    pu: 0,
    pu_achat: 0,
    qte: 0,
    categorie_slug: '',
  });

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["entreRecup", slug],
    queryFn: () =>
      entrerService.getEntre(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setUnEntre(us);
    }
  }, [us]);

  return { unEntre, setUnEntre, isLoading, isError };
}

export function useFetchAllEntre(slug: TypeSlug) {
  const navigate = useNavigate();

  const [entres, setEntre] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["entre", slug],
    queryFn: () =>
      entrerService.allEntre(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setEntre(us);
    }
  }, [us]);

  return { entres, setEntre, isLoading, isError };
}

// Pour recuperertous les entrers d'une Entreprise
export function useGetAllEntre(slug: string) {
  const navigate = useNavigate();

  const [entresEntreprise, setEntre] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["entre", slug],
    queryFn: () =>
      entrerService.getAllEntre(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setEntre(us);
    }
  }, [us]);

  return { entresEntreprise, setEntre, isLoading, isError, refetch };
}

export function useCreateEntre() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const ajout = useMutation({
    mutationFn: (data: EntreFormType) => {
      return entrerService.addEntre(data)
        .then((res) => {
          if (res.data.etat === false) {
            if (res.data.message !== "requette invalide") {
              toast.error(res.data.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["entre"] });
            toast.success("C'est ajouter avec succès");
          }
        })
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      }
    },
  });

  const ajoutEntre = (post: EntreFormType) => {
    ajout.mutate(post);
  };

  return { ajoutEntre }
}

export function useUpdateEntre() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
    mutationFn: (data: EntreType) => {
      return entrerService
        .updateEntre(data)
        .then((res) => {
          if (res.data.etat === true) {
            toast.success("Modification reuissi");
            useQ.invalidateQueries({ queryKey: ["entre"] });
            navigate(-1);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  const updateEntre = (chap: EntreType) => {
    modif.mutate(chap);
  };

  return { updateEntre }
}

export function useDeleteEntre() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const del = useMutation({
    mutationFn: (post: DataType) => {
      return entrerService.deleteEntre(post).then((res) => {
        console.log(res)
        if (res.data.etat !== true) {
          toast.error(res.data.message);
        } else {
          useQ.invalidateQueries({ queryKey: ["entre"] });
          navigate(-1);
          toast.success("Supprimée avec succès");
        }
      });
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      }
    },
  });

  const deleteEntre = (post: DataType) => {
    del.mutate(post);
  };

  return { deleteEntre }
}

// SORTIE

export function useFetchSortie(slug: string) {
  const navigate = useNavigate();

  const [unSortie, setUnSortie] = useState<SortieType>({
    user_id: '',
    pu: 0,
    qte: 0,
    entre_id: '',

  });

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["sortieRecup", slug],
    queryFn: () =>
      sortieService.getSortie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setUnSortie(us);
    }
  }, [us]);

  return { unSortie, setUnSortie, isLoading, isError };
}

export function useFetchAllSortie(slug: DataSlugType) {
  const navigate = useNavigate();

  const [sorties, setSortie] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["sortie", slug],
    queryFn: () =>
      sortieService.allSortie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setSortie(us);
    }
  }, [us]);

  return { sorties, setSortie, isLoading, isError };
}


export function useGetAllSortie(slug: string, params?: any) {
  const navigate = useNavigate();

  const [sortiesEntreprise, setSortie] = useState<RecupType[]>([]);

  const { data: us, isLoading, isError, error } = useQuery({
    queryKey: ["sortie", slug, params],
    queryFn: () =>
      sortieService.getAllSortie(slug, params).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          toast.error(res.data.message);
          throw new Error(res.data.message);
        }
      }),
  });

  // Gestion des erreurs d'auth
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      handleAuthError(error, navigate);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (us) {
      setSortie(us);
    }
  }, [us]);

  return { sortiesEntreprise, setSortie, isLoading, isError };
}

export function useCreateSortie() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const ajout = useMutation({
    mutationFn: (data: SortieType) => {
      return sortieService.addSortie(data)
        .then((res) => {
          if (res.data.etat === false) {
            if (res.data.message !== "requette invalide") {
              toast.error(res.data.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["sortie"] });
            toast.success("C'est ajouter avec succès");
          }
        })
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      }
    },
  });

  const ajoutSortie = (post: SortieType) => {
    ajout.mutate(post);
  };

  return { ajoutSortie }
}

export function useUpdateSortie() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
    mutationFn: (data: SortieType) => {
      return sortieService
        .updateSortie(data)
        .then((res) => {
          if (res.data.etat === true) {
            toast.success("Remise effectuer");
            useQ.invalidateQueries({ queryKey: ["sortie"] });
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  const updateSortie = (chap: any) => {
    modif.mutate(chap);
  };

  return { updateSortie }
}

export function useUpdateRemiseSortie() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
    mutationFn: (data: SortieType) => {
      return sortieService
        .updateFacSortie(data)
        .then((res) => {
          if (res.data.etat === true) {
            toast.success("Remise annuler");
            useQ.invalidateQueries({ queryKey: ["sortie"] });
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error);
      }
    },
  });

  const updateRemiseSortie = (chap: any) => {
    modif.mutate(chap);
  };

  return { updateRemiseSortie }
}

export function useDeleteSortie() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const del = useMutation({
    mutationFn: (post: DataType) => {
      return sortieService.deleteSortie(post).then((res) => {
        if (res.data.etat !== true) {
          toast.error(res.data.message);
        }
      });
    },
    onError: (error: any) => {
      if (!handleAuthError(error, navigate)) {
        foncError(error)
      }
    },
    onSuccess: () => {
      useQ.invalidateQueries({ queryKey: ["sortie"] });
      navigate(-1);
      toast.success("Supprimée avec succès");
    },
  });

  const deleteSortie = (post: DataType) => {
    del.mutate(post);
  };

  return { deleteSortie }
}