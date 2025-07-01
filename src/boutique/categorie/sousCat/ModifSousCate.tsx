import { useParams } from "react-router-dom"
import { RouteParams } from "../../../typescript/DataType"
import { 
  Button, 
  IconButton, 
  Paper,
  Typography,
  Tooltip,
  Fade,
  Box
} from "@mui/material"
import { ChangeEvent, FormEvent, useState } from "react";
import { connect } from "../../../_services/account.service";
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import { useDeleteSousCate, useFetchSousCate, useUpdateSousCate } from "../../../usePerso/fonction.categorie";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";
import { BASE } from '../../../_services/caller.service';
import img from '../../../../public/icon-192x192.png';

export default function ModifSousCate() {
  const { slug } = useParams<RouteParams>()

  // const {unSousCate, setUnSousCate, updateSousCate, deleteSousCate} = useSousCategorie(slug!)
  const { unSousCate, setUnSousCate } = useFetchSousCate(slug!)
  unSousCate["user_id"] = connect
  const {deleteSousCate} = useDeleteSousCate()

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleDelete = () => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?");
    if (confirmation) {
      deleteSousCate(unSousCate);
    }
  };
  
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnSousCate({
      ...unSousCate,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const { updateSousCate } = useUpdateSousCate()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unSousCate.user_id = connect;
    unSousCate.image = image || unSousCate.image;
    updateSousCate(unSousCate);
  };

  const url = unSousCate.image ? BASE(unSousCate.image) : img;

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Tooltip title="Retour" arrow TransitionComponent={Fade}>
              <IconButton 
                onClick={() => window.history.back()}
                className="bg-white hover:bg-gray-50 shadow-sm"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" className="font-semibold text-gray-900">
              Modifier le produit
            </Typography>
          </div>

          <Tooltip title="Supprimer" arrow TransitionComponent={Fade}>
            <IconButton 
              onClick={handleDelete}
              className="bg-white hover:bg-red-50 text-red-600 shadow-sm"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>

        <Paper elevation={0} className="border rounded-lg overflow-hidden">
          <form onSubmit={onSubmit}>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="subtitle2" className="mb-2 text-gray-600">
                    Informations du produit
                  </Typography>
                  <MyTextField
                    fullWidth
                    label="Nom du produit"
                    name="libelle"
                    value={unSousCate.libelle}
                    onChange={onChange}
                    required
                  />
                </div>

                <div>
                  <Typography variant="subtitle2" className="mb-2 text-gray-600">
                    Image du produit
                  </Typography>
                  <div className="space-y-4">
                    <Box className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      {(previewUrl || url) && (
                        <img 
                          src={previewUrl || url} 
                          alt={unSousCate.libelle} 
                          className="max-h-full object-contain"
                        />
                      )}
                    </Box>
                    <MyTextField
                      fullWidth
                      type="file"
                      onChange={handleImageChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <ImageIcon className="mr-2 text-gray-400" />,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <Button
                type="submit"
                variant="contained"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </div>
  )
}
