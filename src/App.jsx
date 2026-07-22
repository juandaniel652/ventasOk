import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Trash2, 
  PhoneCall, 
  X 
} from 'lucide-react';

// --- ESTADOS DEL KANBAN ---
const STAGES = [
  { id: 'nueva', label: 'Nueva Consulta', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'esperando', label: 'Esperando Pago', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'pagado', label: 'Pagado / Por Enviar', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'enviado', label: 'Enviado / Entregado', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

// --- DATOS DE PRUEBA INICIALES ---
const INITIAL_CLIENTS = [
  { id: '1', name: 'Laura Gómez', handle: 'laura_g', platform: 'instagram', phone: '+54911223344', order: 'Remera Oversize M', price: 15000, stage: 'nueva', notes: 'Preguntó por stock en negro.' },
  { id: '2', name: 'Carlos Ruíz', handle: 'carlos_mkt', platform: 'facebook', phone: '+54911556677', order: 'Zapatillas Urbanas 42', price: 42000, stage: 'esperando', notes: 'Pidió CBU para transferencia.' },
];

const INITIAL_TEMPLATES = [
  { id: '1', title: 'Datos Bancarios', text: '¡Hola! Te dejo los datos para la transferencia:\nCBU: 0000003100012345678901\nAlias: MI.TIENDA.PAGO\nTitular: Juan Pérez\n¡Avisame cuando envíes el comprobante! 🚀' },
  { id: '2', title: 'Info de Envío', text: 'Hacemos envíos a todo el país por Correo. Necesito que me pases:\n- Nombre y Apellido:\n- DNI:\n- Dirección / Sucursal:\n- Código Postal:' },
];

export default function MicroCRM() {
  // --- ESTADOS PRINCIPALES CON PERSISTENCIA ---
  const [activeTab, setActiveTab] = useState('board');
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('crm_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('crm_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  // UI States
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', handle: '', platform: 'instagram', phone: '', order: '', price: '', notes: ''
  });
  const [newTemplate, setNewTemplate] = useState({ title: '', text: '' });

  // Sincronizar con LocalStorage
  useEffect(() => {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('crm_templates', JSON.stringify(templates));
  }, [templates]);

  // --- ACCIONES ---
  const handleAddClient = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.order) return;

    const newClient = {
      ...formData,
      id: Date.now().toString(),
      price: Number(formData.price) || 0,
      stage: 'nueva'
    };

    setClients([newClient, ...clients]);
    setFormData({ name: '', handle: '', platform: 'instagram', phone: '', order: '', price: '', notes: '' });
    setShowModal(false);
  };

  const moveStage = (clientId, direction) => {
    setClients(clients.map(client => {
      if (client.id !== clientId) return client;
      const currentIndex = STAGES.findIndex(s => s.id === client.stage);
      const nextIndex = currentIndex + direction;
      if (nextIndex >= 0 && nextIndex < STAGES.length) {
        return { ...client, stage: STAGES[nextIndex].id };
      }
      return client;
    }));
  };

  const deleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.text) return;
    setTemplates([...templates, { ...newTemplate, id: Date.now().toString() }]);
    setNewTemplate({ title: '', text: '' });
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  // Filtrado de clientes
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.handle.toLowerCase().includes(search.toLowerCase()) ||
    c.order.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 select-none">
      {/* HEADER FIX */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            VendeOK
          </h1>
          <p className="text-xs text-slate-400">JDDev Services</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-4 max-w-md mx-auto">
        
        {/* PANTALLA 1: TABLERO KANBAN SIMPLIFICADO */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            {STAGES.map((stage) => {
              const stageClients = clients.filter(c => c.stage === stage.id);
              return (
                <section key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${stage.color}`}>
                      {stage.label} ({stageClients.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stageClients.length === 0 ? (
                      <div className="p-3 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-600">
                        Sin pedidos acá
                      </div>
                    ) : (
                      stageClients.map((client) => (
                        <div key={client.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-sm text-slate-100">{client.name}</h3>
                              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                {client.platform === 'instagram' ? (
                                  <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-1 rounded">IG</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1 rounded">FB</span>
                                )}
                                @{client.handle}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-indigo-400">
                              ${client.price.toLocaleString()}
                            </span>
                          </div>

                          <div className="text-xs bg-slate-950/50 p-2 rounded-lg text-slate-300 border border-slate-800/50">
                            {client.order}
                          </div>

                          {/* Acciones de transición rápida */}
                          <div className="flex justify-between items-center pt-1 border-t border-slate-800/50 text-xs">
                            <button 
                              onClick={() => moveStage(client.id, -1)}
                              disabled={stage.id === STAGES[0].id}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-20"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Mover estado</span>
                            <button 
                              onClick={() => moveStage(client.id, 1)}
                              disabled={stage.id === STAGES[STAGES.length - 1].id}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-20"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* PANTALLA 2: LISTA Y BÚSQUEDA DE CLIENTES */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nombre, usuario o producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Listado */}
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No se encontraron clientes.
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div key={client.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-100">{client.name}</h3>
                        <p className="text-xs text-slate-400">@{client.handle} • {client.platform}</p>
                      </div>
                      <button 
                        onClick={() => deleteClient(client.id)}
                        className="text-slate-600 hover:text-red-400 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg space-y-1">
                      <p><span className="text-slate-500">Pedido:</span> {client.order}</p>
                      <p><span className="text-slate-500">Monto:</span> ${client.price.toLocaleString()}</p>
                      {client.notes && <p><span className="text-slate-500">Notas:</span> {client.notes}</p>}
                    </div>

                    {client.phone && (
                      <a 
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-600/20 active:scale-98 transition-all"
                      >
                        <PhoneCall size={14} /> WhatsApp
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PANTALLA 3: PLANTILLAS DE TEXTO */}
        {activeTab === 'templates' && (
          <div className="space-y-5">
            {/* Formulario rápido para nueva plantilla */}
            <form onSubmit={handleAddTemplate} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nueva Plantilla</h3>
              <input 
                type="text" 
                placeholder="Título (Ej: Datos CBU)" 
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <textarea 
                rows={3}
                placeholder="Texto del mensaje..." 
                value={newTemplate.text}
                onChange={(e) => setNewTemplate({ ...newTemplate, text: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit" 
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
              >
                Guardar Mensaje
              </button>
            </form>

            {/* Lista de plantillas */}
            <div className="space-y-3">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-slate-200">{tpl.title}</h4>
                    <button 
                      onClick={() => deleteTemplate(tpl.id)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-pre-line bg-slate-950 p-2.5 rounded-lg border border-slate-800/50">
                    {tpl.text}
                  </p>
                  <button 
                    onClick={() => handleCopy(tpl.id, tpl.text)}
                    className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                      copiedId === tpl.id 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {copiedId === tpl.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === tpl.id ? '¡Copiado!' : 'Copiar Texto'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: REGISTRO EXPRESS DE CLIENTE */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="font-bold text-slate-100">Nuevo Cliente / Pedido</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Nombre</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej: Sofía Martínez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Red Social</label>
                  <select 
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Usuario (@)</label>
                  <input 
                    type="text" 
                    placeholder="sofia_m"
                    value={formData.handle}
                    onChange={(e) => setFormData({...formData, handle: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Precio ($)</label>
                  <input 
                    type="number" 
                    placeholder="25000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    placeholder="+549..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Detalle del Pedido</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej: Buzo Canguro XL - Color Negro"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Notas</label>
                <textarea 
                  rows={2} 
                  placeholder="Ej: Pasa a retirar por el local el viernes."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all mt-2"
              >
                Guardar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN INFERIOR (TABBAR MOBILE-FIRST) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-6 py-2">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button 
            onClick={() => setActiveTab('board')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTab === 'board' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Tablero</span>
          </button>

          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTab === 'clients' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Users size={20} />
            <span>Clientes</span>
          </button>

          <button 
            onClick={() => setActiveTab('templates')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTab === 'templates' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare size={20} />
            <span>Plantillas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}