import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DataSlugType, DataType, DepenseType, EntreType, RecupType, SortieType, TypeSlug } from "../typescript/DataType";
import { depenseService, entrerService, sortieService } from "../_services";
import { foncError } from "./fonctionPerso";
import { EntreFormType } from "../typescript/FormType";

// Produit
export function useFetchDepense(slug: string) {
    const [unDepense, setUnDepense] = useState<DepenseType>({
        libelle: '',
        user_id: '',
        somme: 0,
        date: '',
      });
  
    const { data: us, isLoading, isError } = useQuery({
      queryKey: ["entreDepense", slug],
      queryFn: () =>
        depenseService.getDepense(slug).then((res) => {
          if (res.data.etat === true) {
            return res.data.donnee;
          } else {
            // throw new Error("Les identifiants sont incorrects");
            toast.error(res.data.message);
          }
        }),
    });
  
    useEffect(() => {
      if (us) {
        setUnDepense(us);
      }
    }, [us]);
  
    return { unDepense, setUnDepense, isLoading, isError };
}
  
export function useFetchAllDepense(slug: string) {
    const [entres, setDepense] = useState<RecupType[]>([]);

    const {data: us, isLoading, isError} = useQuery({
      queryKey: ["produit", slug],
      queryFn: () =>
        depenseService.allDepense(slug).then((res) => {
          if (res.data.etat === true) {
            return res.data.donnee;
          } else {
            // toast.error("Les identifiants sont incorrects");
            toast.error(res.data.message);
          }
        }),
    });

    useEffect(() => {
        if (us) {
            setDepense(us);
        }
      }, [us]);

    return { entres, setDepense, isLoading, isError };
}

// Pour recuperertous les entrers d'une Entreprise
export function useGetAllDepense(slug: string, uuid: string) {
    const [depensesEntreprise, setDepense] = useState<DepenseType[]>([]);

    const {data: us, isLoading, isError} = useQuery({
      queryKey: ["depenses", slug],
      queryFn: () =>
        depenseService.getAllDepense(slug, uuid).then((res) => {
          if (res.data.etat === true) {
            return res.data.donnee;
          } else {
            // toast.error("Les identifiants sont incorrects");
            toast.error(res.data.message);
          }
        }),
    });

    useEffect(() => {
        if (us) {
            setDepense(us);
        }
      }, [us]);

    return { depensesEntreprise, setDepense, isLoading, isError };
}

export function useCreateDepense() {
    
    const useQ = useQueryClient();
    
    const ajout = useMutation({
      mutationFn: (data: DepenseType) => {
        return depenseService.addDepense(data)
        .then((res) => {
          if (res.data.etat===false) {
            if(res.data.message !== "requette invalide"){
              toast.error(res.data.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["depenses"] });
            toast.success("C'est ajouter avec succès");
            // navigate('/')
          }
      })
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
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
              // navigate("/admin/formation/index")
              navigate(-1);
            } else {
              toast.error(res.data.message);
            }
          })
          .catch((err) => console.log(err));
      },
      onError: (error) => {
        foncError(error);
      },
    });

    const updateDepense = (chap: DepenseType) => {
      modif.mutate(chap);
    };

    return {updateDepense}
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
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
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

    return {deleteDepense}
}

// Inventaire

export function useFetchEntre(slug: string) {
  const [unEntre, setUnEntre] = useState<EntreType>({
      libelle: '',
      user_id: '',
      pu: 0,
      qte: 0,
      categorie_slug: '',
    });

  const { data: us, isLoading, isError } = useQuery({
    queryKey: ["entreRecup", slug],
    queryFn: () =>
      entrerService.getEntre(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // throw new Error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
    if (us) {
      setUnEntre(us);
    }
  }, [us]);

  return { unEntre, setUnEntre, isLoading, isError };
}
 
export function useFetchAllEntre(slug: TypeSlug) {
  const [entres, setEntre] = useState<RecupType[]>([]);

  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["entre", slug],
    queryFn: () =>
      entrerService.allEntre(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
          setEntre(us);
      }
    }, [us]);

  return { entres, setEntre, isLoading, isError };
}

// Pour recuperertous les entrers d'une Entreprise
export function useGetAllEntre(slug: string, uuid: string) {
  const [entresEntreprise, setEntre] = useState<RecupType[]>([]);

  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["entre", slug],
    queryFn: () =>
      entrerService.getAllEntre(slug, uuid).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
          setEntre(us);
      }
    }, [us]);

  return { entresEntreprise, setEntre, isLoading, isError };
}

export function useCreateEntre() {

  const useQ = useQueryClient();
  
  const ajout = useMutation({
    mutationFn: (data: EntreFormType) => {
      return entrerService.addEntre(data)
      .then((res) => {
        if (res.data.etat===false) {
          if(res.data.message !== "requette invalide"){
            toast.error(res.data.message);
          }
        } else {
          useQ.invalidateQueries({ queryKey: ["entre"] });
          toast.success("C'est ajouter avec succès");
          // navigate('/')
        }
    })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(message);
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
            // navigate("/admin/formation/index")
            navigate(-1);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      foncError(error);
    },
  });

  const updateEntre = (chap: EntreType) => {
    modif.mutate(chap);
  };

  return {updateEntre}
}

export function useDeleteEntre() {
  const navigate = useNavigate();
  const useQ = useQueryClient();
  
  const del = useMutation({
    mutationFn: (post: DataType) => {
      return entrerService.deleteEntre(post).then((res) => {
        if (res.data.etat !== true) {
          toast.error(res.data.message);
        }
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(message);
    },
    onSuccess: () => {
      useQ.invalidateQueries({ queryKey: ["entre"] });
      navigate(-1);
      toast.success("Supprimée avec succès");
    },
  });

  const deleteEntre = (post: DataType) => {
    del.mutate(post);
  };

  return {deleteEntre}
}

// SORTIE

export function useFetchSortie(slug: string) {
  const [unSortie, setUnSortie] = useState<SortieType>({
      user_id: '',
      pu: 0,
      qte: 0,
      entre_id: '',
      
    });

  const { data: us, isLoading, isError } = useQuery({
    queryKey: ["sortieRecup", slug],
    queryFn: () =>
      sortieService.getSortie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // throw new Error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
    if (us) {
      setUnSortie(us);
    }
  }, [us]);

  return { unSortie, setUnSortie, isLoading, isError };
}

export function useFetchAllSortie(slug: DataSlugType) {
  const [sorties, setSortie] = useState<RecupType[]>([]);

  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["sortie", slug],
    queryFn: () =>
      sortieService.allSortie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
          setSortie(us);
      }
    }, [us]);

  return { sorties, setSortie, isLoading, isError };
}


export function useGetAllSortie(slug: string) {
  const [sortiesEntreprise, setSortie] = useState<RecupType[]>([]);

  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["sortie", slug],
    queryFn: () =>
      sortieService.getAllSortie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
          setSortie(us);
      }
    }, [us]);

  return { sortiesEntreprise, setSortie, isLoading, isError };
}

export function useCreateSortie() {

  const useQ = useQueryClient();
  
  const ajout = useMutation({
    mutationFn: (data: SortieType) => {
      return sortieService.addSortie(data)
      .then((res) => {
        if (res.data.etat===false) {
          if(res.data.message !== "requette invalide"){
            toast.error(res.data.message);
          }
        } else {
          useQ.invalidateQueries({ queryKey: ["sortie"] });
          toast.success("C'est ajouter avec succès");
          // navigate('/')
        }
    })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(message);
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
            toast.success("Modification reuissi");
            useQ.invalidateQueries({ queryKey: ["sortie"] });
            // navigate("/admin/formation/index")
            navigate(-1);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      foncError(error);
    },
  });

  const updateSortie = (chap: SortieType) => {
    modif.mutate(chap);
  };

  return {updateSortie}
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
      foncError(error)
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

  return {deleteSortie}
}