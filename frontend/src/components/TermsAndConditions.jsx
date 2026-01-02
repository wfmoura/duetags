import React from "react";
import { Box, Typography, FormControlLabel, Checkbox } from "@mui/material";

const TermsAndConditions = ({ accepted, onAccept }) => {
  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", backgroundColor: "#f9f9f9" }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#4CAF50" }}>
        Termos e Condições
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ao finalizar sua compra, você concorda com os seguintes termos:
      </Typography>
      <Box sx={{ maxHeight: "200px", overflowY: "auto", mb: 2 }}>
        <ul style={{ paddingLeft: "20px" }}>
          <li>
            <strong>Responsabilidade pelo Conteúdo:</strong> O cliente é o único responsável pelo conteúdo das etiquetas personalizadas.
          </li>
          <li>
            <strong>Direitos Autorais:</strong> O cliente garante que possui os direitos autorais ou autorização para utilizar as imagens e textos enviados para personalização.
          </li>
          <li>
            <strong>Isenção de Responsabilidade:</strong> O vendedor não se responsabiliza por qualquer violação de direitos autorais ou uso indevido das etiquetas personalizadas.
          </li>
          <li>
            <strong>Aprovação da Arte:</strong> As etiquetas serão produzidas conforme a arte final aprovada pelo cliente no preview. Após a aprovação, não serão aceitas solicitações de alteração.
          </li>
          <li>
            <strong>Cores e Impressão:</strong> Podem ocorrer pequenas variações de cores entre a arte visualizada na tela e o produto final, devido a diferenças nos processos de impressão e calibração de monitores.
          </li>
          <li>
            <strong>Política de Trocas e Devoluções:</strong> As etiquetas personalizadas são produzidas sob encomenda e, por isso, não aceitamos trocas ou devoluções, exceto em casos de defeitos de fabricação.
          </li>
          <li>
            <strong>Dados Cadastrais:</strong> O cliente é responsável pela veracidade dos dados cadastrais fornecidos.
          </li>
        </ul>
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={accepted}
            onChange={onAccept}
            color="primary"
            sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} // Aumenta o tamanho do checkbox
          />
        }
        label={
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Li e concordo com os Termos e Condições.
          </Typography>
        }
      />
    </Box>
  );
};

export default TermsAndConditions;