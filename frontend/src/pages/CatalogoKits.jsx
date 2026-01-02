import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Stack,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../contexts/ProductContext";
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const CatalogoKits = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { kits: rawKits, etiquetas, isLoading: loading, error } = useProduct();
  const [filtro, setFiltro] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const kits = useMemo(() => {
    let result = [...rawKits];
    // Add filtering logic here if needed beyond "todos"

    result.sort((a, b) => {
      if (ordenacao === "nome") {
        return a.nome.localeCompare(b.nome, undefined, { numeric: true, sensitivity: 'base' });
      }

      const priceA = typeof a.preco === 'number' ? a.preco : parseFloat(a.preco?.toString().replace('R$', '').replace(',', '.') || '0');
      const priceB = typeof b.preco === 'number' ? b.preco : parseFloat(b.preco?.toString().replace('R$', '').replace(',', '.') || '0');

      return ordenacao === "crescente" ? priceA - priceB : priceB - priceA;
    });
    return result;
  }, [rawKits, ordenacao, filtro]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 8 }}>
      {/* Header Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 8,
        mb: 6,
        borderRadius: '0 0 40px 40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            fontWeight="800"
            align="center"
            color="#333"
            gutterBottom
            sx={{ textShadow: '0 2px 4px rgba(255,255,255,0.5)' }}
          >
            Nossos Kits
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="#555"
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 500 }}
          >
            Escolha o kit perfeito para organizar o material escolar, uniformes e objetos do dia a dia.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Filters Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 6,
            borderRadius: 4,
            bgcolor: '#fff',
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 3,
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="action" />
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Filtros & Ordenação</Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <FormControl size="small" sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>Filtrar por</InputLabel>
              <Select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                label="Filtrar por"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="preco">Preço</MenuItem>
                <MenuItem value="popularidade">Popularidade</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                label="Ordenar por"
                sx={{ borderRadius: 2 }}
                startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />}
              >
                <MenuItem value="nome">Nome (A-Z)</MenuItem>
                <MenuItem value="crescente">Menor Preço</MenuItem>
                <MenuItem value="decrescente">Maior Preço</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Loading & Error States */}
        {loading && (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Kits Grid */}
        {!loading && !error && (
          <Grid container spacing={4}>
            {kits.map((kit) => (
              <Grid item key={kit.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      borderColor: theme.palette.primary.main
                    }
                  }}
                  elevation={0}
                >
                  <CardActionArea onClick={() => navigate('/Customize', { state: { selectedKit: kit } })} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '65%', // Slightly taller aspect ratio
                      bgcolor: '#f0f2f5', // Light background for contain padding
                      borderRadius: '16px 16px 0 0',
                      overflow: 'hidden'
                    }}>
                      {!imgErrors[kit.id] ? (
                        <CardMedia
                          component="img"
                          image={kit.thumbnail}
                          alt={kit.nome}
                          onError={() => handleImgError(kit.id)}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 1 // Add a bit of padding for contain
                          }}
                        />
                      ) : (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.primary.light} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff'
                        }}>
                          <ShoppingBagIcon sx={{ fontSize: 60, opacity: 0.8 }} />
                        </Box>
                      )}

                      {/* Price Tag */}
                      <Chip
                        label={`R$ ${typeof kit.preco === 'number' ? kit.preco.toFixed(2).replace('.', ',') : (kit.preco || '0,00')}`}
                        color="secondary"
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: 16,
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, width: '100%', pt: 3 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom color="#333">
                        {kit.nome}
                      </Typography>

                      {kit.etiquetas && kit.etiquetas.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Contém:
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.5}>
                            {kit.etiquetas.slice(0, 3).map((item, idx) => {
                              const info = etiquetas?.find(e => e.id === item.id);
                              return (
                                <Chip
                                  key={idx}
                                  label={`${item.quantidade}x ${item.nome || item.id}${info ? ` (${info.width}x${info.height}cm)` : ''}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1,
                                    fontSize: '0.7rem',
                                    maxWidth: '100%',
                                    '& .MuiChip-label': {
                                      whiteSpace: 'normal',
                                      lineHeight: 1.2,
                                      py: 0.5
                                    },
                                    height: 'auto'
                                  }}
                                />
                              );
                            })}
                            {kit.etiquetas.length > 3 && (
                              <Chip label={`+${kit.etiquetas.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>

                  <Box sx={{ p: 2, width: '100%' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<ShoppingBagIcon />}
                      onClick={() => navigate('/Customize', { state: { selectedKit: kit } })}
                      sx={{
                        borderRadius: 50,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Personalizar este Kit
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CatalogoKits;
