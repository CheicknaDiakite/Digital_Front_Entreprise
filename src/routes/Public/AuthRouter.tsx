import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Loadable from '../../components/Loadable'
import MinimalLayout from '../../layout/MinimalLayout'
import { notClick } from '../../usePerso/fonctionPerso'

const AuthLogin = Loadable(lazy(() => import('../../pages/authentication/login')))
const AuthRegister = Loadable(lazy(() => import('../../pages/authentication/register')))
const Mdp = Loadable(lazy(() => import('../../pages/authentication/Mdp')))
const MdpUpdate = Loadable(lazy(() => import('../../pages/authentication/MdpUpdate')))
const ConditionsUtilisation = Loadable(lazy(() => import('../../pages/authentication/ConditionsUtilisation')))

export default function AuthRouter() {
  notClick()
  return (
    <Routes>
      <Route element={<MinimalLayout />}>
        <Route path='login' element={<AuthLogin />} />
        <Route path='mot_de_passe_oublier' element={<Mdp />} />
        <Route path='update-password/:token/:uid' element={<MdpUpdate />} />
        <Route path='register' element={<AuthRegister />} />
        <Route path='conditions-utilisation' element={<ConditionsUtilisation />} />
      </Route>
    </Routes>
  )
}
