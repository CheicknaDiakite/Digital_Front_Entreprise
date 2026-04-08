import { useEffect, useState } from 'react';

// material-ui
import { useTheme, useMediaQuery, Avatar } from '@mui/material';
import Box from '@mui/material/Box';
import img from '../../../public/assets/img/img.jpg';

// third-party
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
// chart options
import { BASE } from '../../_services/caller.service';

const barChartOptions: ApexOptions = {
  chart: {
    type: 'bar',
    height: 365,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  grid: {
    show: false
  }
};

// ==============================|| MONTHLY BAR CHART ||============================== //
interface ChartProps {
  details: { libelle: string; somme_qte: number; image?: string | null }[];
}

export default function MonthlyBarChart({ details }: ChartProps) {
  const theme = useTheme();

  const { secondary } = theme.palette.text;
  const primary = theme.palette.primary.main;

  const [options, setOptions] = useState(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [primary],
      xaxis: {
        labels: {
          style: {
            colors: [secondary, secondary, secondary, secondary, secondary, secondary, secondary]
          }
        }
      }
    }));
  }, [primary, secondary]);

  // Mappez les données pour le graphique
  const chartData = details.map((post) => ({
    month: post.libelle || 'Inconnu', // Utilisez "Inconnu" si `libelle` est vide ou manquant
    count: post.somme_qte || 0, // Par défaut, utilisez 0 si `count` est vide ou manquant
    image: post.image || null,
  }));

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Trier les données par `count` de manière décroissante et prendre les x premiers
  const topChartData = chartData
    .sort((a, b) => b.count - a.count) // Trier par `count` décroissant
    .slice(0, isMobile ? 25 : 50); // Prendre les 6 premiers sur mobile, 50 sur desktop

  // Extraire les données pour les axes X et Y
  const xAxisData = topChartData.map((item) => item.month); // Labels des mois
  const seriesData = topChartData.map((item) => item.count); // Valeurs associées

  // Mise à jour de l'objet options en y intégrant xAxisData
  const updatedOptions: ApexOptions = {
    ...options,
    xaxis: {
      ...options.xaxis,
      categories: xAxisData,
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const item = topChartData[dataPointIndex];
        if (!item) return '';

        const imageUrl = item.image ? BASE(item.image) : img;
        console.log('Image URL dans tooltip:', imageUrl);
        const imageHtml = imageUrl
          ? `<div style="width: 100%; display: flex; justify-content: center; margin: 6px 0;">
               <img src="${imageUrl}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid ${theme.palette.background.paper};" />
             </div>`
          : '';

        return `
          <div style="padding: 12px; background: #fff; border: 1px solid ${theme.palette.divider}; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); font-family: ${theme.typography.fontFamily}; min-width: 140px; text-align: center;">
            <div style="font-weight: 700; color: ${theme.palette.text.primary}; font-size: 14px;">${item.month}</div>
            ${imageHtml}
            <div style="color: ${theme.palette.primary.main}; font-weight: 600; font-size: 13px; margin-top: 2px;">
              Quantité: ${item.count}
            </div>
          </div>
        `;
      }
    }
  };

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      <ReactApexChart
        options={updatedOptions}
        series={[{ name: 'nombre', data: seriesData }]}  // La série doit être un tableau d'objets
        type="bar"
        height={isMobile ? 280 : 343}
      />
    </Box>
  );



}
