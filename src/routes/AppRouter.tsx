import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicRouter from './Public/PublicRouter'
import AuthRouter from './Public/AuthRouter'
import AuthGuard from '../_helpers/AuthGuard'
import MdpUpdate from '../pages/authentication/MdpUpdate'
import TermsGuard from '../_helpers/TermsGuard'
import ConditionsUtilisation from '../pages/authentication/ConditionsUtilisation'

export default function AppRouter() {
  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route path="/*" element={
            <AuthGuard>
              <TermsGuard><PublicRouter /></TermsGuard>
            </AuthGuard>
            } />
          <Route path="/admin" element={
            <AuthGuard>
              <TermsGuard><PublicRouter /></TermsGuard>
            </AuthGuard>
            } />
          <Route path='/auth/*' element={<AuthRouter />}/>
          <Route path='/utilisateur/update-password/:slug/:uid' element={<MdpUpdate />}/>
          <Route path='/conditions-utilisation' element={<ConditionsUtilisation />}/>
        </Routes>
    </BrowserRouter>
    </>
  )
}
