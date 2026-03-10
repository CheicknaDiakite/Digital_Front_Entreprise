import { ToastContainer } from 'react-toastify'
import { Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Button } from '@mui/material'
import CardTableSortie from './CardTableSortie';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { Money } from '../../_components/icons/Money';
import MyTextField from '../../_components/Input/MyTextField';
import { ABType } from '../../typescript/Account';
import { useAllClients, useFetchEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../usePerso/fonctionPerso';
import Select from 'react-select';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { ChangeEvent, useEffect, useState } from 'react';
import CloseIcon from "@mui/icons-material/Close"
import BarcodeScanner from '../../_components/Input/BarcodeScanner';
import M_Abonnement from '../../_components/Card/M_Abonnement';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

export default function TableSortie({
  ent,
  onSubmit,
  amount,
  list,
  onChange,
  formValues,
  selectedOption,
  handleChange,
  handleClient,
  selectedClient,
  scannedCode,
  functionopen,
  open,
  closeopen,
  handleScanResult,
  basket,
  handleFinalSubmit,
  removeItemFromBasket,
  basketTotalAmount,
  basketTotalQte
}: any) {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);
  const { getClients } = useAllClients(entreprise_uuid!);
  const clients = getClients.filter((info) => info.role === 1 || info.role === 3);

  const sortedLi = list?.sort((a: ABType, b: ABType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return b.id - a.id;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filtrage de la liste triée en fonction du terme de recherche
  const sortedList = sortedLi.filter((post: any) =>
    post?.ref?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Filtrer la liste "ent" en fonction de scannedCode
  // On suppose ici que chaque option de "ent" possède une propriété "ref"
  const filteredEnt = scannedCode
    ? ent.filter((option: any) => option.ref === scannedCode)
    : ent;

  // Optionnel : si vous souhaitez auto-sélectionner l'option lorsque
  // il n'y a qu'un seul résultat, vous pouvez utiliser useEffect :
  useEffect(() => {
    if (filteredEnt && filteredEnt.length === 1) {
      if (handleChange && typeof handleChange === 'function') {
        handleChange(filteredEnt[0]); // met à jour selectedOption via le callback parent
      }
    }
  }, [filteredEnt, handleChange]);

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />

      <TextField
        label="Rechercher par ref"
        variant="outlined"
        className="bg-blue-200 mt-3"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <form onSubmit={onSubmit}>
        <div className="flex flex-col md:mt-1 py-3">
          <div className="my-2">
            <Stack direction="row" spacing={2}>
              <QrCode2Icon onClick={functionopen} color="error" fontSize="large" />
            </Stack>

            <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
              <DialogTitle>
                Barre Code
                <IconButton onClick={closeopen} style={{ float: 'right' }}>
                  <CloseIcon color="primary" />
                </IconButton>
              </DialogTitle>

              <DialogContent>
                <BarcodeScanner onScan={handleScanResult} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="my-2">
            <Typography variant="h5" className="mb-2 text-gray-50">
              Client
            </Typography>
            <Select
              options={clients}
              value={selectedClient}
              onChange={handleClient}
              placeholder="Client"
              isClearable
              getOptionLabel={(option: any) =>
                typeof option === 'string' ? option : option.nom || ''
              }
              getOptionValue={(option: any) => option.uuid.toString()}
            />
          </div>

          <div className="my-2">
            <Typography variant="h5" className="mb-2 text-gray-50">
              Designation : {scannedCode}
            </Typography>
            <Select
              required
              options={filteredEnt} // on utilise maintenant la liste filtrée par le code scanné
              value={selectedOption}
              onChange={handleChange}
              placeholder="Designation"
              isClearable
              getOptionLabel={(option: any) =>
                `${option.categorie_libelle} ${option.libelle ? `(${option.libelle})` : ""} (${option.qte})`
              }
              getOptionValue={(option: any) => option.uuid.toString()}
            />

            {scannedCode && filteredEnt && filteredEnt.length === 0 && (
              <Typography variant="body2" color="error" className="mt-2">
                Aucun article trouvé pour le code scanné.
              </Typography>
            )}
          </div>
        </div>

        <div className="md:grid grid-cols-3 gap-10">
          <div className="flex flex-col">
            <Typography variant="h5" className="mb-2 text-gray-50">
              Quantite {formValues.unite === "kilos" ? '' : `(${formValues.unite})`}
            </Typography>
            <MyTextField
              required
              type="number"
              name="qte"
              inputProps={{
                step: '0.01',
                min: '0',
              }}
              className='bg-white'
              value={formValues.qte}
              id="quantity"
              placeholder="Quantity"
              onChange={onChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuantityLimitsIcon color="error" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="flex flex-col">
            <Typography variant="h5" className="mb-2 text-gray-50">
              Prix Unitaire
            </Typography>
            {formValues.is_prix ?
              <MyTextField
                disabled
                variant="outlined"
                type="number"
                className='bg-white'
                inputProps={{
                  step: '0.01',
                  min: '0',
                  max: '9999999999.99',
                }}
                name="pu"
                onChange={onChange}
                value={formValues.pu}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalAtmIcon color="error" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiFormLabel-asterisk': {
                    color: 'red',
                  },
                }}
              />
              :
              <MyTextField
                disabled={formValues.is_prix}
                variant="outlined"
                className='bg-white'
                type="number"
                inputProps={{
                  step: '0.01',
                  min: '0',
                  max: '9999999999.99',
                }}
                name="pu"
                onChange={onChange}
                value={formValues.pu}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalAtmIcon color="error" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiFormLabel-asterisk': {
                    color: 'red',
                  },
                }}
              />
            }

          </div>

          <div className="flex flex-col text-gray-50">
            <label htmlFor="amount">
              Somme <Money size={40} color='red' />
            </label>
            <p>{formatNumberWithSpaces(amount)}</p>
          </div>
        </div>

        {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <M_Abonnement />
        ) : (
          <button
            type="submit"
            className="bg-blue-500 mb-5 text-white font-bold mt-2 py-2 px-8 rounded hover:bg-blue-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-blue-400"
          >
            Ajouter au panier
          </button>
        )}
      </form>

      {/* Section Panier (Basket) */}
      {basket && basket.length > 0 && (
        <Paper elevation={3} className="p-4 mb-8 bg-gray-800 text-white rounded-lg">
          <Typography variant="h5" className="mb-4 font-bold border-b pb-2 flex flex-col md:flex-row items-center justify-between gap-2">
            <span>Articles Sélectionnés</span>
            <span className="text-blue-400 text-lg md:text-xl">Total: {formatNumberWithSpaces(basketTotalAmount)}</span>
          </Typography>

          {/* Vue Mobile: Liste de cartes */}
          <div className="md:hidden space-y-4">
            {basket.map((item: any, index: number) => (
              <div key={index} className="bg-gray-700 p-4 rounded-md border-l-4 border-blue-500 relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-blue-300 pr-8">
                    {item.categorie_libelle} {item.libelle ? `(${item.libelle})` : ""}
                  </div>
                  <IconButton
                    onClick={() => removeItemFromBasket(index)}
                    color="error"
                    size="small"
                    className="absolute top-2 right-2"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Prix:</div>
                  <div className="text-right">{formatNumberWithSpaces(Number(item.pu || 0))}</div>

                  <div className="text-gray-400">Qté:</div>
                  <div className="text-right">{item.qte} {item.unite === "kilos" ? "" : item.unite}</div>

                  <div className="text-gray-400 font-bold border-t border-gray-600 pt-1 mt-1">Total:</div>
                  <div className="text-right font-bold text-blue-400 border-t border-gray-600 pt-1 mt-1">
                    {formatNumberWithSpaces(Number(item.pu || 0) * Number(item.qte || 0))}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-blue-900 bg-opacity-30 p-3 rounded-md border border-blue-800">
              <div className="flex justify-between items-center font-bold">
                <span>TOTAL ARTICLES:</span>
                <span>{basketTotalQte}</span>
              </div>
            </div>
          </div>

          {/* Vue Desktop: Table standard */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2">Désignation</th>
                  <th className="py-2">Prix</th>
                  <th className="py-2">Qté</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {basket.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                    <td className="py-2">
                      {item.categorie_libelle} {item.libelle ? `(${item.libelle})` : ""}
                    </td>
                    <td className="py-2">{formatNumberWithSpaces(Number(item.pu || 0))}</td>
                    <td className="py-2">{item.qte} {item.unite === "kilos" ? "" : item.unite}</td>
                    <td className="py-2">{formatNumberWithSpaces(Number(item.pu || 0) * Number(item.qte || 0))}</td>
                    <td className="py-2">
                      <IconButton onClick={() => removeItemFromBasket(index)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold text-lg">
                  <td colSpan={2} className="py-4 text-right">TOTAUX :</td>
                  <td className="py-4">{basketTotalQte}</td>
                  <td className="py-4 text-blue-400">{formatNumberWithSpaces(basketTotalAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-end mt-6">
            <Button
              variant="contained"
              color="success"
              fullWidth={true}
              startIcon={<SaveIcon />}
              onClick={handleFinalSubmit}
              className="bg-green-600 hover:bg-green-700 px-6 py-3"
              sx={{
                fontWeight: 'bold',
                width: { xs: '100%', md: 'auto' }
              }}
            >
              Enregistrer l'achat
            </Button>
          </div>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Ref</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Quantite</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Somme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedList.map((row: any) => {
              return <CardTableSortie key={row.id} row={row} />;
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <div>
        <h2 className="flex items-end justify-end text-gray-800 text-4xl font-bold">
          {/* CFA. {totalPrix} */}
        </h2>
      </div>
    </>
  );
}