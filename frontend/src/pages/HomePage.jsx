import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  useTheme,
  Stack,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../contexts/ProductContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { kits } = useProduct();

  const heroStyle = {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, #9089e6 100%)`,
    color: '#fff',
    pt: 10,
    pb: 10,
    borderRadius: '0 0 50% 50% / 40px',
    position: 'relative',
    overflow: 'hidden'
  };

  const [imgErrors, setImgErrors] = React.useState({});

  const handleImgError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const features = [
    {
      icon: <ColorLensIcon fontSize="large" color="primary" />,
      title: 'Totalmente Personalizável',
      desc: 'Escolha cores, fontes e personagens para criar etiquetas únicas.'
    },
    {
      icon: <VerifiedIcon fontSize="large" color="primary" />,
      title: 'Alta Durabilidade',
      desc: 'Material à prova d\'água e resistente para o dia a dia escolar.'
    },
    {
      icon: <LocalShippingIcon fontSize="large" color="primary" />,
      title: 'Entrega Rápida',
      desc: 'Produção agilizada e envio para todo o Brasil.'
    }
  ];

  const popularKits = React.useMemo(() => {
    return kits.slice(0, 3).map(kit => ({
      ...kit,
      title: kit.nome,
      image: kit.thumbnail,
      price: typeof kit.preco === 'number' ? `R$ ${kit.preco.toFixed(2).replace('.', ',')}` : (kit.preco || '0,00'),
      desc: kit.descricao || 'Kits personalizados de alta qualidade.'
    }));
  }, [kits]);

  const renderKitImage = (kit) => {
    return (
      <Box sx={{
        position: 'relative',
        width: '100%',
        pt: '65%',
        bgcolor: '#f0f2f5',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden'
      }}>
        {!imgErrors[kit.id] && kit.image ? (
          <CardMedia
            component="img"
            image={kit.image}
            alt={kit.title}
            onError={() => handleImgError(kit.id)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              p: 1
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
            <AutoAwesomeIcon sx={{ fontSize: 50, opacity: 0.8 }} />
          </Box>
        )}

        {/* Price Tag */}
        <Chip
          label={kit.price}
          color="secondary"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            fontWeight: 'bold',
            fontSize: '0.9rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: 8 }}>

      {/* Hero Section */}
      <Box sx={heroStyle}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="800"
                gutterBottom
                sx={{
                  textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Identifique tudo com estilo e diversão!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: '400' }}>
                Etiquetas personalizadas à prova d'água para material escolar, uniformes e muito mais. Crie a sua agora mesmo!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/kits')}
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: '50px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Ver Catálogo de Kits
              </Button>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
              {/* Placeholder for a cool hero image */}
              {!imgErrors['hero'] ? (
                <Box
                  component="img"
                  src="https://illustrations.popsy.co/amber/student.svg" // Example free illustration
                  alt="Hero Illustration"
                  sx={{ maxWidth: '80%', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}
                  onError={() => handleImgError('hero')}
                />
              ) : (
                <Box sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 4
                }}>
                  <AutoAwesomeIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.3)' }} />
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Paper elevation={3} sx={{ borderRadius: 4, p: 4, bgcolor: 'rgba(255,255,255,0.95)' }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index} textAlign="center">
                <Box sx={{ mb: 2, transform: 'scale(1.2)' }}>{feature.icon}</Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Popular Kits Section */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="overline" color="secondary" fontWeight="bold" fontSize="1rem">
            Nossos Favoritos
          </Typography>
          <Typography variant="h4" fontWeight="800" color="#333">
            Kits Mais Vendidos
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {popularKits.map((kit) => (
            <Grid item xs={12} sm={6} md={4} key={kit.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 }
                }}
                elevation={1}
              >
                <CardActionArea onClick={() => navigate('/Customize', { state: { selectedKit: kit } })} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {renderKitImage(kit)}
                  <CardContent sx={{ flexGrow: 1, width: '100%', pt: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="#333">
                      {kit.title}
                    </Typography>

                    {kit.etiquetas && kit.etiquetas.length > 0 && (
                      <Box mt={1}>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {kit.etiquetas.slice(0, 2).map((item, idx) => (
                            <Chip
                              key={idx}
                              label={`${item.quantidade}x ${item.nome || item.id}`}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                            />
                          ))}
                          {kit.etiquetas.length > 2 && (
                            <Chip label={`+${kit.etiquetas.length - 2}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          )}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
                <Box sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 'bold' }}
                    onClick={() => navigate('/Customize', { state: { selectedKit: kit } })}
                  >
                    Personalizar agora
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={6}>
          <Button
            variant="outlined"
            size="large"
            color="secondary"
            onClick={() => navigate('/kits')}
            sx={{ borderRadius: '50px', px: 5, border: '2px solid' }}
          >
            Ver Todos os Kits
          </Button>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ mt: 10, bgcolor: '#fff', py: 8, borderTop: '1px solid #eee' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Stack alignItems="center" spacing={3}>
            <Typography variant="h4" fontWeight="800" align="center">
              Pronto para organizar?
            </Typography>
            <Typography variant="h6" color="text.secondary" align="center" maxWidth="600px">
              Junte-se a milhares de pais e mães que já facilitaram a rotina escolar com a DueTags.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/kits')}
              sx={{
                py: 1.5,
                px: 6,
                borderRadius: '50px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              Criar Minhas Etiquetas
            </Button>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
};

export default HomePage;
