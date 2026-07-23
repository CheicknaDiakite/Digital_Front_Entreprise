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
    height: 350,
    toolbar: {
      show: false
    },
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      columnWidth: '50%',
      borderRadius: 6,
      borderRadiusApplication: 'end',
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
    },
    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '12px',
        fontWeight: 600,
      }
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const primary = '#6366f1';

  const [options, setOptions] = useState(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [primary],
    }));
  }, []);

  // Mappez les données pour le graphique
  const chartData = details.map((post) => ({
    month: post.libelle || 'Inconnu',
    count: post.somme_qte || 0,
    image: post.image || null,
  }));

  // Trier les données par `count` de manière décroissante et prendre les x premiers
  const topChartData = [...chartData]
    .sort((a, b) => b.count - a.count)
    .slice(0, isMobile ? 12 : 30);

  // Extraire les données pour les axes X et Y
  const xAxisData = topChartData.map((item) => item.month);
  const seriesData = topChartData.map((item) => item.count);

  const updatedOptions: ApexOptions = {
    ...options,
    colors: ['#6366f1'],
    xaxis: {
      ...options.xaxis,
      categories: xAxisData,
      labels: {
        style: {
          colors: xAxisData.map(() => '#94a3b8'),
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: 600,
        }
      }
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const item = topChartData[dataPointIndex];
        if (!item) return '';

        const imageUrl = item.image ? BASE(item.image) : img;
        const imageHtml = imageUrl
          ? `<div style="width: 100%; display: flex; justify-content: center; margin: 8px 0;">
               <img src="${imageUrl}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid rgba(99,102,241,0.4);" />
             </div>`
          : '';

        return `
          <div style="padding: 14px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.4); font-family: ${theme.typography.fontFamily}; min-width: 140px; text-align: center;">
            <div style="font-weight: 700; color: #e0e7ff; font-size: 13px; letter-spacing: 0.3px;">${item.month}</div>
            ${imageHtml}
            <div style="display: inline-block; margin-top: 6px; padding: 4px 10px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); border-radius: 20px; color: #c4b5fd; font-weight: 700; font-size: 12px;">
              Quantité: ${item.count}
            </div>
          </div>
        `;
      }
    }
  };

  return (
    <Box id="chart" sx={{ width: '100%', pt: 1 }}>
      <ReactApexChart
        options={updatedOptions}
        series={[{ name: 'Quantité', data: seriesData }]}
        type="bar"
        height={isMobile ? 260 : 320}
      />
    </Box>
  );
}
