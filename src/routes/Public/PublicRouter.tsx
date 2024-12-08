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
import TableHistory from '../../boutique/proprietaire/historique/TableHistory'
import HistoriqueSupp from '../../boutique/proprietaire/historique/HistoriqueSupp'
import Entreprise from '../../boutique/proprietaire/Admin/Entreprise'
import EntrepriseDetail from '../../boutique/proprietaire/Admin/EntrepriseDetail'
import Personnel from '../../boutique/proprietaire/Personnel/Personnel'
import { PersonnelModif } from '../../boutique/proprietaire/Personnel/PersonnelModif'
import { notClick } from '../../usePerso/fonctionPerso'
import SortieInventaire from '../../boutique/proprietaire/historique/inventaire/SortieInventaire'
import EntrerInventaire from '../../boutique/proprietaire/historique/inventaire/EntrerInventaire'

export default function PublicRouter() {
  notClick()
  return (<div className='bg-zinc-200'>

    <Routes>
      <Route element={<Dashboard />}>
      <Route index element={ <Entreprise />} />
        {/* <Route index element={ <DashboardDefault />} /> */}
        

        <Route path='entreprise'>
          <Route index element={<DashboardDefault />} />
          <Route path='detail' element={<EntrepriseDetail />} />
          <Route path='PreFacture' element={<Facture />} />
          <Route path='historique' element={<TableHistory />} />
          <Route path='inventaire/sortie' element={<SortieInventaire />} />
          <Route path='inventaire/entrer' element={<EntrerInventaire />} />
          <Route path='historique/sppression' element={<HistoriqueSupp />} />

          <Route path='depense'>
            <Route index element={<Depense />} />
            <Route path=':uuid' element={<DepenseModif />} />
          </Route>

          <Route path='personnel' >

            <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
              <Route index element={<Personnel />} />
              <Route path='modif/:uuid' element={<PersonnelModif />} />
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

        <Route path='categorie' >
          <Route index element={<ComponentShadow />} />
          <Route path=':slug' element={<Sortie />} />
          <Route path='modif/:slug' element={<ModifCate />} /> 

          <Route path='sous'>
            <Route path=':uuid'  element={<SousCat />} />
            <Route path='modif/:slug'  element={<ModifSousCate />} />
          </Route>

          <Route path='info/:uuid'  element={<Info />} />
                   
        </Route>

        <Route path='entre'>
          <Route index element={<Entre />} />
          <Route path='modif/:uuid' element={<ModifEntre />} />
        </Route>

        <Route path='sortie' >
          <Route index element={<Sortie />} />
          
          <Route path='entreprise/:uuid' element={<Sortie />} />
          {/* <Route path='entreprise' element={<EseSortie />} /> */}
          <Route path='modif/:uuid' element={<ModifSortie />} />
        </Route>

        <Route path='user'>

          <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
            <Route path="admin" element={<Users />} />
            <Route path='admin/modif/:uuid' element={<UserModif />} />
          </Route>

          <Route path='modif/:id' element={<Admin />} />
        </Route>

      </Route>
    </Routes>
  </div>
  )
}
