// src/pages/Admin.jsx
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import ConfigGrupo from '../components/ConfigGrupo';
import GeracaoEscala from '../components/GeracaoEscala';
import Notificacoes from '../components/Notificacoes';
import TrocasTurno from '../components/TrocasTurno';

const Admin = () => {
  const tabs = [
    { name: 'Configurações de Grupo', component: <ConfigGrupo /> },
    { name: 'Geração de Escala', component: <GeracaoEscala /> },
    { name: 'Notificações', component: <Notificacoes /> },
    { name: 'Trocas de Turno', component: <TrocasTurno /> }
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-8">Administração de Escalas</h1>
      <div className="w-full max-w-5xl mx-auto">
        <Tab.Group>
          <Tab.List className="flex space-x-2 bg-white rounded-xl p-1 shadow-md">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg 
                   ${selected ? 'bg-blue-100 shadow' : 'text-blue-500 hover:bg-blue-50'}`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">
            {tabs.map((tab, index) => (
              <Tab.Panel
                key={index}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                {tab.component}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Admin;
