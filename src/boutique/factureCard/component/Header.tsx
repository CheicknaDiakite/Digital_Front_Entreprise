import { Typography, Divider } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

export default function Header({ 
  orderNumber, 
  nom, 
  numeroFac, 
  url, 
  address, 
  numero, 
  coordonne, 
  clientName, 
  invoiceDate, 
  invoiceNumber, 
  email 
}: any) {
  return (
    <div className="mb-8">
      {/* Company Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img src={url} alt="Logo" className="h-16 w-16 object-contain" />
          <div>
            <Typography variant="h5" className="font-bold text-gray-900">
              {nom}
            </Typography>
          </div>
        </div>
        <div className="text-right">
          {(orderNumber || numeroFac) && (
            <Typography variant="h6" className="text-gray-700 mb-1">
              N° Facture : {orderNumber || numeroFac}
            </Typography>
          )}
          <Typography variant="body2" className="text-gray-600">
            Date : {invoiceDate}
          </Typography>
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-2">
          <Typography variant="subtitle2" className="text-gray-500 font-medium">
            Informations de l'entreprise
          </Typography>
          <div className="space-y-1">
            {address && (
              <div className="flex items-center text-gray-600">
                <LocationOnIcon className="w-4 h-4 mr-2" />
                <Typography variant="body2">{address}</Typography>
              </div>
            )}
            {email && (
              <div className="flex items-center text-gray-600">
                <EmailIcon className="w-4 h-4 mr-2" />
                <Typography variant="body2">{email}</Typography>
              </div>
            )}
            {numero && (
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <Typography variant="body2">{numero}</Typography>
              </div>
            )}
            {coordonne && (
              <Typography variant="body2" className="text-gray-600">
                {coordonne}
              </Typography>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="space-y-2">
          <Typography variant="subtitle2" className="text-gray-500 font-medium">
            Informations du client
          </Typography>
          <div className="space-y-1">
            <Typography variant="body2" className="text-gray-600">
              <span className="font-medium">Nom :</span> {clientName}
            </Typography>
            {invoiceNumber && (
              <Typography variant="body2" className="text-gray-600">
                <span className="font-medium">Téléphone :</span> {invoiceNumber}
              </Typography>
            )}
          </div>
        </div>
      </div>

      {/* Facture Title */}
      <div className="text-center mb-8">
        <Divider className="mb-4" />
        <Typography variant="h4" className="font-bold text-gray-900">
          FACTURE
        </Typography>
      </div>
    </div>
  );
}

