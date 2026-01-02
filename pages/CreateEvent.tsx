import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Image as ImageIcon, Ticket, 
  Video, Plus, Trash2, Eye, Save, Send, AlertCircle, Info, CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { EventStatus, Event } from '../types';

type Step = 'info' | 'media' | 'tickets' | 'preview';

interface TicketTypeData {
  id: string;
  name: string;
  price: number;
  quota: number;
  description: string;
  sold: number;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    location: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    tickets: [] as TicketTypeData[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      tickets: [
        ...formData.tickets,
        { id: Date.now().toString(), name: '', price: 0, quota: 100, description: '', sold: 0 }
      ]
    });
  };

  const updateTicket = (id: string, field: keyof TicketTypeData, value: string | number) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  const removeTicket = (id: string) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter(t => t.id !== id)
    });
  };

  // Helper to extract YouTube Video ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(formData.videoUrl);

  const handleSave = async (status: EventStatus) => {
    setIsSaving(true);
    
    // Construct the event object compliant with UI and API
    const newEvent: Event = {
        id: Date.now().toString(), // Will be overwritten by API response ID
        title: formData.title || 'Yeni Etkinlik',
        date: formData.date ? `${formData.date}T${formData.time || '00:00:00'}` : new Date().toISOString(),
        location: formData.location || 'Konum Belirtilmedi',
        status: status,
        ticketTypes: formData.tickets,
        revenue: 0,
        image: formData.imageUrl || `https://picsum.photos/400/200?random=${Date.now()}`
    };

    try {
        await addEvent(newEvent);
        navigate('/events');
    } catch (e) {
        alert('Etkinlik oluşturulurken bir hata oluştu.');
    } finally {
        setIsSaving(false);
    }
  };

  const steps = [
    { id: 'info', label: 'Genel Bilgiler', icon: Info },
    { id: 'media', label: 'Görsel & Medya', icon: ImageIcon },
    { id: 'tickets', label: 'Biletler', icon: Ticket },
    { id: 'preview', label: 'Önizleme', icon: Eye },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Etkinlik Oluştur</h1>
          <p className="text-slate-500 text-sm">Etkinlik detaylarını girerek hemen satışa başla.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          {steps.map((step, index) => {
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const isCurrent = step.id === currentStep;
            
            return (
              <button 
                key={step.id}
                onClick={() => setCurrentStep(step.id as Step)}
                className={`flex flex-col items-center gap-2 group bg-slate-50 p-2 rounded-xl transition-all ${isCurrent ? 'scale-110' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30' 
                      : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  isCurrent ? 'text-brand-700' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Step 1: Info */}
        {currentStep === 'info' && (
          <div className="p-8 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Temel Bilgiler</h2>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Etkinlik Adı</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Örn: Yaz Festivali 2024"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Kategori</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="music">Konser & Festival</option>
                    <option value="theater">Tiyatro & Sahne</option>
                    <option value="education">Eğitim & Workshop</option>
                    <option value="sports">Spor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Konum / Mekan</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Mekan ara..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tarih</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Saat</label>
                  <input 
                    type="time" 
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Açıklama</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6} 
                  placeholder="Etkinlik detayları, sanatçılar, kurallar..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {currentStep === 'media' && (
          <div className="p-8 animate-in slide-in-from-right-4 duration-300">
             <h2 className="text-lg font-bold text-slate-900 mb-6">Görsel ve Medya</h2>
             <div className="space-y-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Etkinlik Afişi</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors text-slate-400">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-slate-900 font-medium">Görseli sürükleyip bırakın</p>
                        <p className="text-slate-500 text-sm mt-1">veya dosya seçmek için tıklayın</p>
                        <p className="text-xs text-slate-400 mt-4">PNG, JPG (Max. 5MB)</p>
                        <input type="file" className="hidden" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tanıtım Videosu (Opsiyonel)</label>
                    <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="url" 
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleInputChange}
                            placeholder="Youtube video bağlantısı..."
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
                        />
                    </div>
                    
                    {formData.videoUrl && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            {youtubeId ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200 group">
                                    <img 
                                        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`} 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                                        }}
                                        alt="Video Thumbnail" 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                                             <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1.5 text-white text-xs font-medium">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                        Youtube Önizleme
                                    </div>
                                    <a 
                                      href={formData.videoUrl} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg text-white transition-colors"
                                    >
                                      <ExternalLink size={16} />
                                    </a>
                                </div>
                            ) : (
                                <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm flex items-start gap-2 border border-amber-100">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>Önizleme oluşturulamadı. Lütfen geçerli bir Youtube bağlantısı girdiğinizden emin olun.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}

        {/* Step 3: Tickets */}
        {currentStep === 'tickets' && (
          <div className="p-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Bilet Türleri</h2>
                <button 
                    onClick={addTicketType}
                    className="text-sm font-medium text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Plus size={16} /> Bilet Ekle
                </button>
            </div>

            <div className="space-y-4">
                {formData.tickets.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Ticket className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-slate-500">Henüz bilet türü eklenmedi.</p>
                        <button onClick={addTicketType} className="text-brand-600 font-medium text-sm mt-2 hover:underline">İlk bileti ekle</button>
                    </div>
                )}

                {formData.tickets.map((ticket, index) => (
                    <div key={ticket.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative group">
                        <button 
                            onClick={() => removeTicket(ticket.id)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Bilet Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Genel Giriş"
                                    value={ticket.name}
                                    onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Fiyat (₺)</label>
                                <input 
                                    type="number" 
                                    value={ticket.price}
                                    onChange={(e) => updateTicket(ticket.id, 'price', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-all" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Kontenjan</label>
                                <input 
                                    type="number" 
                                    value={ticket.quota}
                                    onChange={(e) => updateTicket(ticket.id, 'quota', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-all" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Açıklama (Opsiyonel)</label>
                                <input 
                                    type="text" 
                                    placeholder="Bu bilet neleri kapsıyor?"
                                    value={ticket.description}
                                    onChange={(e) => updateTicket(ticket.id, 'description', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-all" 
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 'preview' && (
          <div className="p-8 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Önizleme</h2>
            
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg max-w-sm mx-auto">
                <div className="h-48 bg-slate-200 relative group cursor-pointer">
                     {/* Placeholder for image */}
                     <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 overflow-hidden">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Event Cover" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={48} />
                        )}
                        
                        {youtubeId && (
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              {/* Simple Play Icon overlay if video exists */}
                           </div>
                        )}
                     </div>
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm z-10">
                        {formData.category || 'Kategori'}
                     </div>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{formData.title || 'Etkinlik Başlığı'}</h3>
                    <div className="flex flex-col gap-2 text-sm text-slate-600 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-brand-500" />
                            <span>{formData.date || 'Tarih'} • {formData.time || 'Saat'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-brand-500" />
                            <span>{formData.location || 'Konum'}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        {formData.tickets.length > 0 ? (
                             formData.tickets.map(t => (
                                <div key={t.id} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">{t.name}</span>
                                    <span className="font-bold text-brand-600">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.price)}
                                    </span>
                                </div>
                             ))
                        ) : (
                            <p className="text-sm text-slate-400 text-center italic">Bilet bilgisi girilmedi</p>
                        )}
                    </div>

                    <button className="w-full mt-6 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors">
                        Bilet Al
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800 text-sm max-w-2xl mx-auto">
                <AlertCircle className="flex-shrink-0" size={20} />
                <p>Yayınlamadan önce tüm bilgilerin doğruluğundan emin olun. Etkinlik yayınlandıktan sonra tarih ve bilet fiyatlarında yapılan değişiklikler kısıtlanabilir.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
             <button 
                onClick={() => {
                    const idx = steps.findIndex(s => s.id === currentStep);
                    if (idx > 0) setCurrentStep(steps[idx - 1].id as Step);
                }}
                disabled={currentStep === 'info'}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Geri
             </button>

             <div className="flex items-center gap-3">
                <button 
                    onClick={() => handleSave(EventStatus.DRAFT)}
                    disabled={isSaving}
                    className="px-6 py-2.5 text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Save size={18} />
                    {isSaving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
                </button>
                
                {currentStep !== 'preview' ? (
                    <button 
                        onClick={() => {
                            const idx = steps.findIndex(s => s.id === currentStep);
                            if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id as Step);
                        }}
                        className="px-6 py-2.5 bg-brand-600 text-white font-medium hover:bg-brand-700 rounded-lg transition-colors shadow-lg shadow-brand-500/30"
                    >
                        Devam Et
                    </button>
                ) : (
                    <button 
                        onClick={() => handleSave(EventStatus.PUBLISHED)}
                        className="px-8 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors shadow-lg shadow-green-500/30 flex items-center gap-2"
                    >
                        <Send size={18} />
                        Yayınla
                    </button>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;