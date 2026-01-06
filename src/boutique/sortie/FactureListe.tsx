import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Skeleton } from '@mui/material';
import { useStoreUuid } from '../../usePerso/store';
import { useGetAllSortie } from '../../usePerso/fonction.entre';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { RecupType } from '../../typescript/DataType';
import { useMemo } from 'react';

// const TAX_RATE = 0.07; // Assuming this is not needed or fixed for now. If needed, can be re-added.

export default function FactureListe() {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { sortiesEntreprise, isLoading, isError } = useGetAllSortie(entreprise_uuid!, { is_remise: true });

  // Grouper les sorties par remise_code
  const groupedSorties = useMemo(() => {
    if (!sortiesEntreprise) return {};

    return sortiesEntreprise.reduce((acc, sortie) => {
      const code = sortie.remise_code || 'no-code';
      if (!acc[code]) {
        acc[code] = [];
      }
      acc[code].push(sortie);
      return acc;
    }, {} as Record<string, RecupType[]>);
  }, [sortiesEntreprise]);

  // Trier les codes (optionnel, par exemple pour afficher les plus récents en premier si le code est temporel ou séquentiel)
  // Comme on utilise un UUID, l'ordre n'est pas garanti. Si on veut l'ordre d'ajout, il faudrait peut-être utiliser la date de création ou un autre champ.
  // Pour l'instant, on affiche dans l'ordre de récupération (qui dépend de l'API).
  const groups = Object.entries(groupedSorties).reverse(); // Reverse pour avoir potentiellement les derniers en premier, selon comment le backend renvoie

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton animation="wave" height={40} />
        <Skeleton animation="wave" height={40} />
        <Skeleton animation="wave" height={40} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" align="center">
        Erreur lors du chargement des données.
      </Typography>
    );
  }

  if (!sortiesEntreprise || sortiesEntreprise.length === 0) {
    return (
      <Typography align="center" sx={{ py: 4 }} color="text.secondary">
        Aucune facture remisée trouvée.
      </Typography>
    );
  }

  return (
    <Box>
      {groups.map(([code, items], index) => {
        const totalAmount = items.reduce((acc, row) => acc + (row.prix_total || 0), 0);

        return (
          <Box key={code} sx={{ mb: 4 }}>
            {/* <Typography variant="h6" sx={{ mb: 1, px: 1 }}>
               Lot : {code !== 'no-code' ? code.substring(0, 8) : 'Sans code'}
            </Typography> */}
            <TableContainer component={Paper} elevation={2} sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 700 }} aria-label={`table-${code}`}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={3}>
                      Détails (Lot {index + 1})
                    </TableCell>
                    <TableCell align="right">Prix</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Qté.</TableCell>
                    <TableCell align="right">Unité</TableCell>
                    <TableCell align="right">Somme</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row: RecupType) => (
                    <TableRow key={row.id}>
                      <TableCell>

                        <div>

                            <Typography variant="body2" className="font-medium text-gray-900">
                                {row.categorie_libelle}
                            </Typography>
                            {/* <Typography variant="body2" className="text-gray-400">
                                {row.ref}
                            </Typography> */}
                            
                        </div>
                      </TableCell>
                      <TableCell align="right">{row.qte}</TableCell>
                      <TableCell align="right">{formatNumberWithSpaces(row.pu || 0)}</TableCell>
                      <TableCell align="right">{formatNumberWithSpaces(row.prix_total || 0)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell rowSpan={3} />
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total Lot</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumberWithSpaces(totalAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Box>
  );
}
