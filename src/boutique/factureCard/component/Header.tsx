
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

export default function Header({ orderNumber, nom, numeroFac, url, address, numero, coordonne, clientName, invoiceDate, invoiceNumber, email }: any) {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: { xs: "column", xl: "row" },
          justifyContent: { xs: "center", xl: "space-between" },
          alignItems: "center",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src={url} alt="img" className="h-24 w-24" />
          <Typography variant="h6">{nom}</Typography>
          <img src={url} alt="img" className="h-24 w-24" />
        </Box>


        {/* <Box textAlign="center">
          {orderNumber && (
            <Typography variant="h6" sx={{ mt: 2 }}>
              Numéro de la facture : {orderNumber}
            </Typography>
          )}

          {numeroFac && (
            <Typography variant="h4" sx={{ mt: 2 }}>
              Numéro de la facture : {numeroFac}
            </Typography>
          )}
        </Box> */}
      </Toolbar> 
      <div className="header text-center mb-6">
            {/* <h2 className="text-2xl font-bold">DIAKITE DIGITAL</h2> */}
            {/* <p className="text-gray-600">INNOVATION | SIMPLICITÉ | RENTABILITÉ</p> */}
            <p>{address}</p>
            <p>{email}</p>
            <p>{coordonne}</p>
            <p className="font-semibold">Tel : {numero}</p>
            {/* <p className="font-semibold">NINA : 32509194223078D</p> */}
            <hr className="my-4" />
            <h3 className="text-xl font-semibold">FACTURE</h3>
        </div>
        
        <div className="flex justify-between mb-4">
            <div>
                <p><strong>Facture à :</strong> {clientName}</p>
                <p><strong>Tel :</strong> {invoiceNumber}</p>
            </div>
            <div className="text-right">

              <Box textAlign="center">
                {orderNumber && (
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    N° Facture : {orderNumber}
                  </Typography>
                )}

                {numeroFac && (
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    N° Facture : {numeroFac}
                  </Typography>
                )}
              </Box>
                {/* <p><strong>N° Facture :</strong> ___________</p> */}
                <p><strong>Date :</strong> {invoiceDate}</p>
            </div>
        </div>
      
    </AppBar>
  );
}

