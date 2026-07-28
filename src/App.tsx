import ScrollTop from "./components/ScrollTop";
import ThemeCustomization from "./themes";
import AppRouter from "./routes/AppRouter";
import { ThemeModeProvider } from "./themes/ThemeModeContext";

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemeCustomization>
        <ScrollTop>
          <AppRouter />
        </ScrollTop>
      </ThemeCustomization>
    </ThemeModeProvider>
  );
}
