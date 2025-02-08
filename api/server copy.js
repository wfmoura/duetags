const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const JSZip = require('jszip');
const app = express();
const port = 3001;

// Middleware para permitir requisições de diferentes origens (CORS)
//app.use(cors());

const corsOptions = {
  origin: 'http://localhost:3000', // Substitua pela URL do frontend
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


// Middleware para processar JSON com limite aumentado
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Função para aplicar bordas arredondadas
function applyRoundedCorners(png, radius) {
  console.log(`Aplicando bordas arredondadas com raio ${radius}...`);
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;

      // Verificar se o pixel está fora do círculo das bordas arredondadas
      if (
        (x < radius && y < radius && Math.sqrt((x - radius) ** 2 + (y - radius) ** 2) > radius) || // Canto superior esquerdo
        (x > png.width - radius && y < radius && Math.sqrt((x - (png.width - radius)) ** 2 + (y - radius) ** 2) > radius) || // Canto superior direito
        (x < radius && y > png.height - radius && Math.sqrt((x - radius) ** 2 + (y - (png.height - radius)) ** 2) > radius) || // Canto inferior esquerdo
        (x > png.width - radius && y > png.height - radius && Math.sqrt((x - (png.width - radius)) ** 2 + (y - (png.height - radius)) ** 2) > radius) // Canto inferior direito
      ) {
        // Tornar o pixel transparente
        png.data[idx + 3] = 0; // Canal alpha = 0 (transparente)
      }
    }
  }
  console.log('Bordas arredondadas aplicadas com sucesso.');
}

// Rota para salvar múltiplas etiquetas
app.post('/api/saveEtiquetas', async (req, res) => {
  const { etiquetas } = req.body;

  if (!etiquetas || !Array.isArray(etiquetas)) {
    return res.status(400).json({ success: false, message: 'Dados incompletos ou inválidos' });
  }

  try {
    const savedEtiquetas = [];
    const timestamp = Date.now();

    for (let i = 0; i < etiquetas.length; i++) {
      const { image, metadata, options } = etiquetas[i];

      if (!image || !metadata) {
        console.error(`Etiqueta ${i} está incompleta.`);
        continue;
      }

      const imagePath = path.join(__dirname, 'etiquetas_salvas', `etiqueta_${i}_${timestamp}.png`);
      const metadataPath = path.join(__dirname, 'etiquetas_salvas', `metadados_${i}_${timestamp}.json`);

      const base64Data = image.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const png = new PNG({
        width: options?.width || 800,
        height: options?.height || 600,
        filterType: options?.filterType || -1,
      });

      await new Promise((resolve, reject) => {
        png.parse(buffer, (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          // Aplicar bordas arredondadas (se solicitado)
          if (options?.roundedCorners) {
            applyRoundedCorners(png, options.roundedCorners.radius);
          }

          png.pack().pipe(fs.createWriteStream(imagePath)).on('finish', () => {
            resolve();
          });
        });
      });

      // Adicionar metadados com a data do pedido
      metadata.dataPedido = new Date().toISOString();
      fs.writeFileSync(metadataPath, JSON.stringify(metadata));

      savedEtiquetas.push({ imagePath, metadataPath });
    }

    res.json({ success: true, savedEtiquetas });
  } catch (error) {
    console.error('Erro ao salvar etiquetas:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar etiquetas' });
  }
});


app.get('/api/getPedidos', (req, res) => {
  console.log('Endpoint /api/getPedidos foi chamado');
  const pedidosDir = path.join(__dirname, 'etiquetas_salvas');

  // Verifica se a pasta existe
  if (!fs.existsSync(pedidosDir)) {
    console.error('Pasta etiquetas_salvas não encontrada.');
    return res.json([]); // Retorna uma lista vazia se a pasta não existir
  }

  // Lê os arquivos da pasta
  const pedidos = fs.readdirSync(pedidosDir)
    .filter(file => file.endsWith('.json')) // Filtra apenas arquivos JSON
    .map(file => {
      const filePath = path.join(pedidosDir, file);
      const metadata = JSON.parse(fs.readFileSync(filePath, 'utf-8')); // Lê o conteúdo do arquivo JSON
      console.error('Lendo conteúdo do Json.');
      return {
        id: file.replace('metadados_', '').replace('.json', ''), // Extrai o ID do nome do arquivo
        ...metadata, // Inclui todos os metadados do arquivo JSON
      };
    });

  console.log('Pedidos encontrados:', pedidos); // Log para depuração
  res.json(pedidos); // Retorna a lista de pedidos
});

// Rota para baixar todas as etiquetas de um pedido em um arquivo ZIP
app.get('/api/downloadPedido/:id', (req, res) => {
  const pedidoId = req.params.id;
  const pedidosDir = path.join(__dirname, 'etiquetas_salvas');
  const zip = new JSZip();

  // Verificar se a pasta de pedidos existe
  if (!fs.existsSync(pedidosDir)) {
    return res.status(404).json({ success: false, message: 'Nenhum pedido encontrado.' });
  }

  // Adicionar todas as imagens e metadados do pedido ao ZIP
  fs.readdirSync(pedidosDir)
    .filter(file => file.includes(pedidoId))
    .forEach(file => {
      const filePath = path.join(pedidosDir, file);
      if (file.endsWith('.png')) {
        zip.file(file, fs.readFileSync(filePath));
      } else if (file.endsWith('.json')) {
        zip.file(file, fs.readFileSync(filePath));
      }
    });

  // Configurar o cabeçalho da resposta para download do ZIP
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=pedido_${pedidoId}.zip`);

  // Gerar o arquivo ZIP e enviar como resposta
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(res)
    .on('finish', () => {
      console.log(`Arquivo ZIP para o pedido ${pedidoId} gerado com sucesso.`);
    });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});