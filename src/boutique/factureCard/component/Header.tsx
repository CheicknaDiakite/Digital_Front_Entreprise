
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

export default function Header({ orderNumber, nom, numeroFac, url }: any) {
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
        </Box>

        <Box textAlign="center">
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

