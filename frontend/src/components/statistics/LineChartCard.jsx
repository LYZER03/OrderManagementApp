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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

const LineChartCard = ({ 
  title, 
  subtitle,
  data, 
  lines = [{ dataKey: 'value', color: '#2196f3', name: 'Valeur' }],
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
      
      <Box sx={{ p: isMobile ? 1 : 3, height: isMobile ? 250 : height || 300, width: width }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 300 : 500}>
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: isMobile ? 10 : 30,
              left: isMobile ? 0 : 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xAxisDataKey} 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: isMobile ? 10 : 12,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: theme.shadows[3]
              }}
            />
            {lines.length > 1 && (
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                iconSize={8}
              />
            )}
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                name={line.name}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
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

export default LineChartCard;
