import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import {
  PeopleAlt,
  Assignment,
  LocalHospital,
  TrendingUp,
  Event,
  Person,
  Assessment,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAnalyses: 0,
    recentAnalyses: [],
    recentPatients: [],
    analysesByMonth: [],
    patientsByAge: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [patientsRes, analysesRes] = await Promise.all([
        axios.get('https://localhost:7162/api/Patients'),
        axios.get('https://localhost:7162/api/Analyse')
      ]);

      const patients = patientsRes.data;
      const analyses = analysesRes.data;

      const analysesByMonth = groupAnalysesByMonth(analyses);
      const patientsByAge = groupPatientsByAge(patients);

      setStats({
        totalPatients: patients.length,
        totalAnalyses: analyses.length,
        recentAnalyses: analyses.slice(-5).reverse(),
        recentPatients: patients.slice(-5).reverse(),
        analysesByMonth,
        patientsByAge
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const handleAnalyseClick = (analyseId) => {
    navigate(`/analyses/${analyseId}/detail`);
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  const groupAnalysesByMonth = (analyses) => {
    const months = {};
    analyses.forEach(analyse => {
      const date = new Date(analyse.dateAnalyse);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    return Object.entries(months).map(([month, count]) => ({
      month: month,
      analyses: count
    })).slice(-6);
  };

  const groupPatientsByAge = (patients) => {
    const ageGroups = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61+': 0
    };

    patients.forEach(patient => {
      const age = calculateAge(new Date(patient.dateNaissance));
      if (age <= 20) ageGroups['0-20']++;
      else if (age <= 40) ageGroups['21-40']++;
      else if (age <= 60) ageGroups['41-60']++;
      else ageGroups['61+']++;
    });

    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count
    }));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" color="primary">
          Tableau de bord
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outlined"
        >
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Première ligne - Statistiques uniquement */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#e3f2fd',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box display="flex" alignItems="center">
              <PeopleAlt sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
              <Typography component="h2" variant="h6" color="primary">
                Total Patients
              </Typography>
            </Box>
            <Typography component="p" variant="h3" sx={{ mt: 2 }}>
              {stats.totalPatients}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#e8f5e9',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box display="flex" alignItems="center">
              <Assignment sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
              <Typography component="h2" variant="h6" color="primary">
                Total Analyses
              </Typography>
            </Box>
            <Typography component="p" variant="h3" sx={{ mt: 2 }}>
              {stats.totalAnalyses}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#fff3e0',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 40, color: '#ed6c02', mr: 2 }} />
              <Typography component="h2" variant="h6" color="primary">
                Analyses ce mois
              </Typography>
            </Box>
            <Typography component="p" variant="h3" sx={{ mt: 2 }}>
              {stats.analysesByMonth[stats.analysesByMonth.length - 1]?.analyses || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Deuxième ligne - Graphiques et listes */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Distribution des patients par âge */}
            <Grid item xs={12} md={3}>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 400,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Patients par âge
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={stats.patientsByAge}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {stats.patientsByAge.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Graphique des analyses par mois */}
            <Grid item xs={12} md={3}>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 400,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Évolution des analyses
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={stats.analysesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="analyses" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Analyses récentes */}
            <Grid item xs={12} md={3}>
              <Paper 
                sx={{ 
                  p: 2,
                  height: 400,
                  overflow: 'auto',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Analyses récentes
                </Typography>
                <List>
                  {stats.recentAnalyses.map((analyse, index) => (
                    <React.Fragment key={analyse.id}>
                      <ListItem 
                        button 
                        onClick={() => handleAnalyseClick(analyse.id)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#1976d2' }}>
                            <Assessment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Analyse #${analyse.id}`}
                          secondary={new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        />
                      </ListItem>
                      {index < stats.recentAnalyses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Patients récents */}
            <Grid item xs={12} md={3}>
              <Paper 
                sx={{ 
                  p: 2,
                  height: 400,
                  overflow: 'auto',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Patients récents
                </Typography>
                <List>
                  {stats.recentPatients.map((patient, index) => (
                    <React.Fragment key={patient.id}>
                      <ListItem 
                        button 
                        onClick={() => handlePatientClick(patient.id)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(46, 125, 50, 0.08)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#2e7d32' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${patient.nom}`}
                          secondary={`Né(e) le ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}`}
                        />
                      </ListItem>
                      {index < stats.recentPatients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;