import React, { useState } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Input, Button } from '@mui/material';

function Personalizacao({ onUpdate }) {
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [linha1, setLinha1] = useState('Seu Texto');
    const [linha2, setLinha2] = useState('Seu Texto');
    const [textoExclusivo, setTextoExclusivo] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [fontSize, setFontSize] = useState(16);
    const [textColor, setTextColor] = useState('black');
    const [textShadow, setTextShadow] = useState('none');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = () => {
        onUpdate({ backgroundColor, fontFamily, linha1, linha2, textoExclusivo, backgroundImage: selectedImage, fontSize, textColor, textShadow});
    };

    return (
        <div>
            <TextField label="Cor de Fundo" type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
                <InputLabel id="fonte-label">Fonte</InputLabel>
                <Select labelId="fonte-label" id="fonte" value={fontFamily} label="Fonte" onChange={e => setFontFamily(e.target.value)}>
                    <MenuItem value="Arial">Arial</MenuItem>
                    <MenuItem value="Verdana">Verdana</MenuItem>
                    <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                </Select>
            </FormControl>
            <TextField label="Nome" value={linha1} onChange={e => setLinha1(e.target.value)} fullWidth margin="normal" />
            <TextField label="Complemento" value={linha2} onChange={e => setLinha2(e.target.value)} fullWidth margin="normal" />
            <TextField label="Turma" value={textoExclusivo} onChange={e => setTextoExclusivo(e.target.value)} fullWidth margin="normal" />
            <TextField label="Tamanho da fonte" type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} fullWidth margin="normal"/>
            <TextField label="Cor do texto" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} fullWidth margin="normal" />
            <TextField label="Sombra do texto" value={textShadow} onChange={e => setTextShadow(e.target.value)} fullWidth margin="normal" />
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            <Button variant="contained" onClick={handleUpdate}>Atualizar Etiquetas</Button>
        </div>
    );
}

export default Personalizacao;
