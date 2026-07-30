import ScrollTop from "./components/ScrollTop";
import ThemeCustomization from "./themes";
import AppRouter from "./routes/AppRouter";
import { ThemeModeProvider } from "./themes/ThemeModeContext";
import { AppSettingsProvider } from "./themes/AppSettingsContext";

export default function App() {
  return (
    <ThemeModeProvider>
      <AppSettingsProvider>
        <ThemeCustomization>
          <ScrollTop>
            <AppRouter />
          </ScrollTop>
        </ThemeCustomization>
      </AppSettingsProvider>
    </ThemeModeProvider>
  );
}
