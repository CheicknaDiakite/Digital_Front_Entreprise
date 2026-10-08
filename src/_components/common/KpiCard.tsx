import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAppSettings } from '../../themes/AppSettingsContext';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variation?: number; // e.g. +12.5 or -5.2
  variationLabel?: string; // e.g. "vs mois dernier"
  accentColor?: string; // e.g. "#6366f1"
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variation,
  variationLabel = 'vs mois préc.',
  accentColor = '#6366f1',
  onClick,
}) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const isPositive = variation !== undefined && variation >= 0;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: '18px',
        height: '100%',
        p: 0.5,
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(14px)',
        border: '1px solid',
        borderColor: isDark ? `${accentColor}33` : `${accentColor}26`,
        boxShadow: isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.35)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? '0 12px 28px rgba(0, 0, 0, 0.45)'
                : '0 8px 25px rgba(0, 0, 0, 0.08)',
            }
          : undefined,
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: accentColor,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontSize: '0.72rem',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#0f172a',
            letterSpacing: '-0.02em',
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
          }}
        >
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {variation !== undefined && (
            <Chip
              size="small"
              icon={
                isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: '14px !important', color: 'inherit' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: '14px !important', color: 'inherit' }} />
                )
              }
              label={`${isPositive ? '+' : ''}${variation.toFixed(1)}%`}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: isPositive
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(16, 185, 129, 0.12)'
                  : isDark
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(239, 68, 68, 0.12)',
                color: isPositive ? '#10b981' : '#ef4444',
                border: '1px solid',
                borderColor: isPositive
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)',
              }}
            />
          )}

          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                fontSize: '0.75rem',
              }}
            >
              {variation !== undefined ? `${variationLabel}` : subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
