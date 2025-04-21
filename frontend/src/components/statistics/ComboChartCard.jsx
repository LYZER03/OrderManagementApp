import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Divider
} from '@mui/material';
import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

const ComboChartCard = ({ 
  title, 
  subtitle,
  data, 
  barDataKey = 'barres',
  lineDataKey = 'courbe',
  barColor = '#51158C',
  lineColor = '#f44336',
  xAxisDataKey = 'name',
  lastUpdated,
  height = 300,
  width = '100%'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const details = payload[0].payload.details;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            maxWidth: 280
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {`Total: ${payload[0].value} commandes`}
          </Typography>
          {details && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {details}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" fontWeight="medium">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ p: 3, height: height || 300, width: width, overflowX: 'auto', overflowY: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 300 : 500}>
          <ComposedChart
            data={data}
            margin={{
              top: 5,
              right: isMobile ? 5 : 10,
              left: isMobile ? 5 : 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xAxisDataKey} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar 
              dataKey={barDataKey} 
              name="Commandes" 
              fill={barColor}
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 15 : 30}
            />
            <Line 
              type="monotone" 
              name="Tendance" 
              dataKey={lineDataKey} 
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      
      {lastUpdated && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'right' }}>
          {lastUpdated}
        </Typography>
      )}
    </Paper>
  );
};

export default ComboChartCard;
