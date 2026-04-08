import { Route, Routes } from 'react-router-dom'
import Dashboard from '../../layout/Dashboard'
import DashboardDefault from '../../pages/dashboard'
import Sortie from '../../boutique/sortie/Sortie'
import Entre from '../../boutique/inventaire/Entre'
import ComponentShadow from '../../pages/component-overview/shadows'
import ModifCate from '../../boutique/categorie/ModifCate'
import ModifSousCate from '../../boutique/categorie/sousCat/ModifSousCate'
import ModifEntre from '../../boutique/inventaire/ModifEntre'
import ModifSortie from '../../boutique/sortie/ModifSortie'
import Info from '../../boutique/categorie/sousCat/info/Info'
import Client from '../../boutique/proprietaire/client/Client'
import ClientInfo from '../../boutique/proprietaire/client/ClientInfo'
import Admin from '../../boutique/proprietaire/Admin/Admin'
import SousCat from '../../boutique/categorie/sousCat/SousCat'
import Facture from '../../boutique/factureCard/PreFacture/Facture'
import ProtectedRoute from '../ProtectedRoute'
import FacEntre from '../../boutique/proprietaire/Produit/Entre/FacEntre'
import FacSortie from '../../boutique/proprietaire/Produit/Sortie/FacSortie'
import ModifProduitEntre from '../../boutique/proprietaire/Produit/Entre/ModifProduitEntre'
import ModifProduitSortie from '../../boutique/proprietaire/Produit/Sortie/ModifProduitSortie'
import Users from '../../boutique/proprietaire/users/Users'
import { UserModif } from '../../boutique/proprietaire/users/UserModif'
import Depense from '../../boutique/proprietaire/Produit/Depense'
import DepenseModif from '../../boutique/proprietaire/Produit/DepenseModif'
import HistoriqueSupp from '../../boutique/proprietaire/historique/HistoriqueSupp'
import Entreprise from '../../boutique/proprietaire/Admin/Entreprise'
import EntrepriseDetail from '../../boutique/proprietaire/Admin/EntrepriseDetail'
import Personnel from '../../boutique/proprietaire/Personnel/Personnel'
import { PersonnelModif } from '../../boutique/proprietaire/Personnel/PersonnelModif'
import PersonnelInfo from '../../boutique/proprietaire/Personnel/PersonnelInfo'
import SortieInventaire from '../../boutique/proprietaire/historique/inventaire/SortieInventaire'
import EntrerInventaire from '../../boutique/proprietaire/historique/inventaire/EntrerInventaire'
import EtaVente from '../../boutique/categorie/eta/EtaVente'
import Avis from '../../boutique/proprietaire/users/Avis'
import EtaProduits from '../../boutique/categorie/eta/EtaProduits'
import VenteUsers from '../../boutique/categorie/eta/VenteUsers'
import MesInscrit from '../../boutique/proprietaire/users/MesInscrit'
import backgroundImage from '../../../public/assets/img/img.jpg'
import { notClick } from '../../usePerso/fonctionPerso'
import { Box } from '@mui/material'
import { useStoreUuid } from '../../usePerso/store'
import { useFetchEntreprise } from '../../usePerso/fonction.user'
import { BASE } from '../../_services/caller.service'
import FactureDetail from '../../boutique/sortie/FactureDetail'
import Historique from '../../boutique/proprietaire/historique/Historique'


export default function PublicRouter() {
  // notClick()

  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;
  // const url = backgroundImage;

  return (
    <Box

      sx={{
        background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: { sm: '24px', md: '32px' },
      }}
    >
      <Routes>
        <Route element={<Dashboard />}>
          <Route index element={<Entreprise />} />
          {/* <Route index element={ <DashboardDefault />} /> */}

          <Route path='entreprise'>
            <Route index element={<DashboardDefault />} />
            <Route path='Avis' element={<Facture />} />
            <Route path='PreFacture' element={<Facture />} />
            <Route path='EtaDeVente' element={<EtaVente />} />
            <Route path='inventaire/EtaDesProduits' element={<EtaProduits />} />
            <Route path='inventaire/VenteUsers' element={<VenteUsers />} />

            <Route element={<ProtectedRoute requiredRole={[1, 2]} redirectPath="/" />}>
              <Route path='detail' element={<EntrepriseDetail />} />
              <Route path='historique' element={<Historique />} />
              <Route path='inventaire/sortie' element={<SortieInventaire />} />
              <Route path='inventaire/entrer' element={<EntrerInventaire />} />
              <Route path='historique/sppression' element={<HistoriqueSupp />} />
            </Route>

            <Route path='depense'>
              <Route index element={<Depense />} />
              <Route path=':uuid' element={<DepenseModif />} />
            </Route>

            <Route path='personnel' >

              <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
                <Route index element={<Personnel />} />
                <Route path='modif/:uuid' element={<PersonnelModif />} />
                <Route path='info/:uuid' element={<PersonnelInfo />} />
              </Route>

            </Route>

            <Route path='produit'>
              {/* <Route index element={<Produit />} /> */}

              <Route element={<ProtectedRoute requiredRole={[1, 2]} redirectPath="/" />}>
                <Route path='entre'>
                  <Route index element={<FacEntre />} />
                  <Route path='modif/:uuid' element={<ModifProduitEntre />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredRole={[1, 2, 3]} redirectPath="/" />}>
                <Route path='sortie'>
                  <Route index element={<FacSortie />} />
                  <Route path='modif/:uuid' element={<ModifProduitSortie />} />
                </Route>
              </Route>

              <Route path='modif/:slug' element={<ModifEntre />} />
            </Route>

            <Route path='client' >
              {/* <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}> */}
              <Route index element={<Client />} />
              {/* </Route> */}
              <Route path='info/:uuid' element={<ClientInfo />} />
            </Route>

            <Route path='utilisateur'>
              <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
                <Route path="admin" element={<Users />} />
                <Route path='admin/modif/:uuid' element={<UserModif />} />
              </Route>

              <Route path='modif/:uuid' element={<Admin />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requiredRole={[1, 2]} redirectPath="/" />}>
            <Route path='categorie' >
              <Route index element={<ComponentShadow />} />
              <Route path=':slug' element={<Sortie />} />
              <Route path='modif/:uuid' element={<ModifCate />} />

              <Route path='sous'>
                <Route path=':uuid' element={<SousCat />} />
                <Route path='modif/:uuid' element={<ModifSousCate />} />
              </Route>

              <Route path='info/:uuid' element={<Info />} />

            </Route>
          </Route>

          <Route path='entre'>
            <Route index element={<Entre />} />
            <Route path='modif/:uuid' element={<ModifEntre />} />
          </Route>

          <Route path='sortie' >
            <Route index element={<Sortie />} />

            <Route path='remise' element={<FactureDetail />} />
            <Route path='entreprise/:uuid' element={<Sortie />} />
            {/* <Route path='entreprise' element={<EseSortie />} /> */}
            <Route path='modif/:uuid' element={<ModifSortie />} />
          </Route>

          <Route path='user'>

            <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
              <Route path="admin" element={<Users />} />
              <Route path="avis" element={<Avis />} />

            </Route>

            <Route path="mesInscrit" element={<MesInscrit />} />
            <Route path='admin/modif/:uuid' element={<UserModif />} />

            <Route path='modif/:id' element={<Admin />} />
          </Route>

        </Route>
      </Routes>
    </Box>
  )
}
