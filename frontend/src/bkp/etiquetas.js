// Frontend (App.js)
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [etiquetas, setEtiquetas] = useState([]);
    const [nome, setNome] = useState('');
    const [complemento, setComplemento] = useState('');
    const [turma, setTurma] = useState('');
    const [fontFamily, setFontFamily] = useState('Roboto');
    const [textColor, setTextColor] = useState('#000000');

    const etiquetasConfig = [
        { id: 1, label: 'lol-8x4-1.png', width: 8, height: 4 },
        { id: 2, label: 'lol-8x4-2.png', width: 8, height: 4 },
        { id: 3, label: 'lol2 2,5x2,5.png', width: 2.5, height: 2.5 },
        { id: 4, label: 'lol2 5x1.png', width: 5, height: 1 },
        { id: 5, label: 'lol2 6x2,5.png', width: 6, height: 2.5 },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/api/generate-pdf', {
                etiquetas,
                nome,
                complemento,
                turma,
                fontFamily,
                textColor,
            });
            alert('PDF gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar o PDF:', error);
            alert('Erro ao gerar o PDF.');
        }
    };

    return (
        <div className="App">
            <h1>Gerador de Etiquetas</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input
                        type="text"
                        value={nome}
                        maxLength="20"
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>
                <div>
                    <label>Complemento:</label>
                    <input
                        type="text"
                        value={complemento}
                        maxLength="20"
                        onChange={(e) => setComplemento(e.target.value)}
                    />
                </div>
                <div>
                    <label>Turma:</label>
                    <input
                        type="text"
                        value={turma}
                        maxLength="20"
                        onChange={(e) => setTurma(e.target.value)}
                    />
                </div>
                <div>
                    <label>Fonte:</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                        <option value="Roboto">Roboto</option>
                        <option value="A4SPEEDBold">A4SPEEDBold</option>
                        <option value="BatmanForeverAlternate">BatmanForeverAlternate</option>
                        {/* Adicione outras fontes conforme necessário */}
                    </select>
                </div>
                <div>
                    <label>Cor do Texto:</label>
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                    />
                </div>
                <div className="etiquetas-container">
                    {etiquetasConfig.map((etiqueta) => (
                        <div key={etiqueta.id} className="etiqueta" style={{ width: `${etiqueta.width}cm`, height: `${etiqueta.height}cm` }}>
                            <img src={`./images/${etiqueta.label}`} alt="Etiqueta" />
                            <input
                                type="text"
                                maxLength="20"
                                placeholder="Texto"
                                onChange={(e) =>
                                    setEtiquetas((prev) => {
                                        const updated = [...prev];
                                        updated[etiqueta.id - 1] = e.target.value;
                                        return updated;
                                    })
                                }
                            />
                        </div>
                    ))}
                </div>
                <button type="submit">Gerar PDF</button>
            </form>
        </div>
    );
}

export default App; // Lembre-se de atualizar o estilo no CSS conforme necessário."
}
