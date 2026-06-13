// src/pages/LogsPage.js
import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { Box, Typography, Paper, CircularProgress, Container } from '@mui/material';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/users/logs', { withCredentials: true });
        setLogs(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          Error loading logs: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" align="center" gutterBottom>
          User Activity Logs
        </Typography>
        <Box>
          {logs.map(log => (
            <Paper key={log.id} elevation={3} style={{ marginBottom: '16px', padding: '16px' }}>
              <Typography variant="h6">
                <strong>{log.action}</strong>
              </Typography>
              <Typography variant="body1">
                {log.details}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                User Email: {log.userEmail}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Timestamp: {log.timestamp}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Logs;
