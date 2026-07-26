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

  return createTheme({
    palette: {
      mode,
      common: {
        black: '#000',
        white: '#fff'
      },
      ...paletteColor,
      text: {
        primary: '#e2e8f0',
        secondary: '#94a3b8',
        disabled: '#64748b'
      },
      action: {
        disabled: '#475569',
        hover: 'rgba(129, 140, 248, 0.08)',
        selected: 'rgba(99, 102, 241, 0.16)'
      },
      divider: '#26354d',
      background: {
        paper: '#101c30',
        default: '#07111f'
      }
    }
  });
}
