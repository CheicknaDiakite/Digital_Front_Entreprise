import React, { ReactNode } from 'react';
import { Box, Typography, Stack, Breadcrumbs, Link as MuiLink, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAppSettings } from '../../themes/AppSettingsContext';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badge?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions,
  badge,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  return (
    <Box
      sx={{
        mb: { xs: 2.5, md: 3.5 },
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: '16px', sm: '20px' },
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(226, 232, 240, 0.8)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.35)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.disabled' }} />}
          aria-label="breadcrumb"
          sx={{ mb: 1.5 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !item.to) {
              return (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    color: isDark ? '#c7d2fe' : 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Typography>
              );
            }
            return (
              <MuiLink
                key={index}
                component={Link}
                to={item.to}
                underline="hover"
                variant="caption"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: isDark ? '#fff' : 'text.primary',
                  },
                }}
              >
                {item.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: '14px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                color: isDark ? '#a5b4fc' : '#4f46e5',
                border: '1px solid',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              {badge}
            </Stack>

            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'text.secondary',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {actions && (
          <Box
            sx={{
              width: { xs: '100%', sm: 'auto' },
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default PageHeader;
