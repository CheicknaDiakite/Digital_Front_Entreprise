import { ToastContainer } from 'react-toastify'
import { Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import CardTableSortie from './CardTableSortie';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { Money } from '../../_components/icons/Money';
import MyTextField from '../../_components/Input/MyTextField';
import { ABType } from '../../typescript/Account';
import { useAllClients, useFetchEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { isLicenceExpired } from '../../usePerso/fonctionPerso';
import Select from 'react-select';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { ChangeEvent, useEffect, useState } from 'react';
import CloseIcon from "@mui/icons-material/Close"
import BarcodeScanner from '../../_components/Input/BarcodeScanner';

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
  handleScanResult
}: any) {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid!);
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
      handleChange(filteredEnt[0]); // ou une fonction qui met à jour selectedOption
    }
  }, [filteredEnt]);
  console.log("gg ...", formValues)
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
              <QrCode2Icon onClick={functionopen} color="info" fontSize="large" />
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
            <Typography variant="h5" className="mb-2">
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
            <Typography variant="h5" className="mb-2">
              Designation : {scannedCode}
            </Typography>
            <Select
              options={ent} // Ici, vous pouvez également filtrer si besoin
              value={selectedOption}
              onChange={handleChange}
              placeholder="Designation"
              isClearable
              getOptionLabel={(option: any) =>
                `${option.categorie_libelle} (${option.libelle}) [${option.qte}]`
              }
              getOptionValue={(option: any) => option.uuid.toString()}
            />
          </div>
        </div>

        <div className="md:grid grid-cols-3 gap-10">
          <div className="flex flex-col">
            <Typography variant="h5" className="mb-2">
              Quantite <QuantityLimitsIcon fontSize="large" />
            </Typography>
            <MyTextField
              type="number"
              name="qte"
              value={formValues.qte}
              id="quantity"
              placeholder="Quantity"
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col">
            <Typography variant="h5" className="mb-2">
              Prix Unitaire <LocalAtmIcon fontSize="large" />
            </Typography>
            {formValues.is_prix ? 
              <MyTextField
                disabled
                variant="outlined"
                type="number"
                inputProps={{
                  step: '0.01',
                  min: '0',
                  max: '9999999999.99',
                }}
                name="pu"
                onChange={onChange}
                value={formValues.pu}
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
                type="number"
                inputProps={{
                  step: '0.01',
                  min: '0',
                  max: '9999999999.99',
                }}
                name="pu"
                onChange={onChange}
                value={formValues.pu}
                sx={{
                  '& .MuiFormLabel-asterisk': {
                    color: 'red',
                  },
                }}
              />
            }
            
          </div>

          <div className="flex flex-col">
            <label htmlFor="amount">
              Somme <Money size={40} className="inline" />
            </label>
            <p>{amount}</p>
          </div>
        </div>

        {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <Typography variant="h5" color="error" sx={{ mt: 1 }}>
            L'abonnement de cet Entreprise a expiré !
          </Typography>
        ) : (
          <button
            type="submit"
            className="bg-blue-500 mb-5 text-white font-bold mt-2 py-2 px-8 rounded hover:bg-blue-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-blue-400"
          >
            Ajouter
          </button>
        )}
      </form>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
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