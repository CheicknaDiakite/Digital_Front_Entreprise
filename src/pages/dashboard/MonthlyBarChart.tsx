import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
// chart options
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
  details: { libelle: string; count: number }[];
}

export default function MonthlyBarChart({ details }: ChartProps) {
  const theme = useTheme();

  const { primary, secondary } = theme.palette.text;
  const info = theme.palette.info.light;

  // const [series] = useState([
  //   {
  //     data: [80, 95, 70, 42, 65, 55, 78]
  //   }
  // ]);

  const [options, setOptions] = useState(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [info],
      xaxis: {
        labels: {
          style: {
            colors: [secondary, secondary, secondary, secondary, secondary, secondary, secondary]
          }
        }
      }
    }));
  }, [primary, info, secondary]);
  
  // Mappez les données pour le graphique
  const chartData = details.map((post) => ({
    month: post.libelle || 'Inconnu', // Utilisez "Inconnu" si `libelle` est vide ou manquant
    count: post.count || 0, // Par défaut, utilisez 0 si `count` est vide ou manquant
  }));

  // Trier les données par `count` de manière décroissante et prendre les 15 premiers
  const topChartData = chartData
    .sort((a, b) => b.count - a.count) // Trier par `count` décroissant
    .slice(0, 25); // Prendre les 15 premiers

  // Extraire les données pour les axes X et Y
  const xAxisData = topChartData.map((item) => item.month); // Labels des mois
  const seriesData = topChartData.map((item) => item.count); // Valeurs associées

  // Mise à jour de l'objet options en y intégrant xAxisData
  const updatedOptions = {
    ...options,
    xaxis: {
      ...options.xaxis,
      categories: xAxisData,
    },
  };

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      <ReactApexChart
        options={updatedOptions}
        series={[{ name: 'nombre', data: seriesData }]}  // La série doit être un tableau d'objets
        type="bar"
        height={365}
      />
    </Box>
  );

  

}
