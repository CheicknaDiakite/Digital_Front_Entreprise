import ScrollTop from "./components/ScrollTop";
import ThemeCustomization from "./themes";
import AppRouter from "./routes/AppRouter";
import { ReloadPrompt } from "./Prompt";

export default function App() {
  
  return (<>
    <ThemeCustomization>
      <ScrollTop>
        <ReloadPrompt />
        <AppRouter />
      </ScrollTop>
    </ThemeCustomization>
  </>
  )
}
