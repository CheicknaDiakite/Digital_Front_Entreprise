import ScrollTop from "./components/ScrollTop";
import ThemeCustomization from "./themes";
import AppRouter from "./routes/AppRouter";
import { ReloadPrompt } from "./Prompt";

export default function App() {
  
  return (<>
    <ReloadPrompt />
    <ThemeCustomization>
      <ScrollTop>
        <AppRouter />
      </ScrollTop>
    </ThemeCustomization>
  </>
  )
}
