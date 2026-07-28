// material-ui
import { createTheme } from '@mui/material/styles';

// third-party
import { presetPalettes } from '@ant-design/colors';

// project import
import ThemeOption from './theme';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode: 'light' | 'dark') {
  const colors = presetPalettes;

  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  let greyConstant = ['#fafafb', '#e6ebf1'];
  

  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];


  const paletteColor = ThemeOption(colors);

  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      common: {
        black: '#000',
        white: '#fff'
      },
      ...paletteColor,
      text: {
        primary: isDark ? '#e2e8f0' : '#172033',
        secondary: isDark ? '#94a3b8' : '#52627a',
        disabled: isDark ? '#64748b' : '#8a97aa'
      },
      action: {
        disabled: isDark ? '#475569' : '#b7c1d0',
        disabledBackground: isDark ? 'rgba(71, 85, 105, 0.24)' : 'rgba(183, 193, 208, 0.32)',
        hover: isDark ? 'rgba(129, 140, 248, 0.10)' : 'rgba(37, 99, 235, 0.07)',
        selected: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(37, 99, 235, 0.12)'
      },
      divider: isDark ? '#26354d' : '#dce3ee',
      background: {
        paper: isDark ? '#101c30' : '#ffffff',
        default: isDark ? '#07111f' : '#f5f7fb'
      }
    }
  });
}
