// src/components/TrocasTurno.jsx
import React, { useState, useEffect } from 'react';
import supabase from '../config/supabase';

const TrocasTurno = () => {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [trocaComAprovacao, setTrocaComAprovacao] = useState(true);
  const [historicoTrocas, setHistoricoTrocas] = useState([]);

  useEffect(() => {
    fetchGrupos();
  }, []);

  useEffect(() => {
    if (selectedGrupo) {
      fetchConfiguracaoTroca();
      fetchHistoricoTrocas();
    }
  }, [selectedGrupo]);

  const fetchGrupos = async () => {
    const { data, error } = await supabase.from('configuracoes_grupo').select('*');
    if (error) console.log('Erro ao buscar grupos:', error);
    else setGrupos(data || []);
  };

  const fetchConfiguracaoTroca = async () => {
    const { data, error } = await supabase
      .from('configuracoes_grupo')
      .select('troca_com_aprovacao')
      .eq('grupo', selectedGrupo)
      .single();

    if (error) console.log('Erro ao buscar configuração de troca:', error);
    else setTrocaComAprovacao(data?.troca_com_aprovacao || false);
  };

  const fetchHistoricoTrocas = async () => {
    const { data, error } = await supabase
      .from('trocas_escalas')
      .select('*, usuario_original ( email ), usuario_novo ( email )')
      .order('data_troca', { ascending: false });
    if (error) console.log('Erro ao buscar histórico de trocas:', error);
    else setHistoricoTrocas(data || []);
  };

  const salvarConfiguracao = async () => {
    const { error } = await supabase
      .from('configuracoes_grupo')
      .update({ troca_com_aprovacao: trocaComAprovacao })
      .eq('grupo', selectedGrupo);
    if (error) console.log('Erro ao salvar configuração:', error);
    else alert('Configuração de troca salva com sucesso!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Configuração de Trocas de Turno</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Grupo:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={selectedGrupo}
          onChange={(e) => setSelectedGrupo(e.target.value)}
        >
          <option value="">Selecione um grupo</option>
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.grupo}>
              {grupo.grupo}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox text-blue-600"
            checked={trocaComAprovacao}
            onChange={(e) => setTrocaComAprovacao(e.target.checked)}
          />
          <span className="ml-2">
            Requer aprovação do administrador para trocas de turno
          </span>
        </label>
      </div>

      <button
        onClick={salvarConfiguracao}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Salvar Configuração
      </button>

      <h3 className="text-xl font-bold mt-6 mb-4">Histórico de Trocas de Turno</h3>
      <ul className="space-y-4">
        {historicoTrocas.map((troca) => (
          <li key={troca.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p>
              <strong>Data:</strong> {new Date(troca.data_troca).toLocaleDateString()}
            </p>
            <p>
              <strong>Original:</strong> {troca.usuario_original.email}
            </p>
            <p>
              <strong>Substituto:</strong> {troca.usuario_novo.email}
            </p>
            <p>
              <strong>Aprovado:</strong> {troca.aprovado ? 'Sim' : 'Não'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrocasTurno;
