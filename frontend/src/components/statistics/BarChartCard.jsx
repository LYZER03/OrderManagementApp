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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const BarChartCard = ({ 
  title, 
  subtitle,
  data, 
  dataKey = 'value',
  color = '#51158C',
  xAxisDataKey = 'name',
  lastUpdated,
  height = 300,
  width = '100%'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      
      <Box sx={{ p: 3, height: height || 300, width: width }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={500}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: isMobile ? 0 : 10,
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: theme.shadows[3]
              }}
            />
            <Bar 
              dataKey={dataKey} 
              fill={color}
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 15 : 30}
            />
          </BarChart>
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

export default BarChartCard;
