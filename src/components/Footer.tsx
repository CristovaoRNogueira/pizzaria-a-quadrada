import React from 'react';
import { MapPin, Phone, Instagram, Mail, ExternalLink } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Footer: React.FC = () => {
  const { state } = useApp();
  const establishment = state.businessSettings.establishment;

  const openWhatsApp = () => {
    const phone = establishment.phone.replace(/\D/g, '');
    const message = 'Olá! Gostaria de fazer um pedido.';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openInstagram = () => {
    const instagramUrl = `https://instagram.com/${establishment.instagram.replace('@', '')}`;
    window.open(instagramUrl, '_blank');
  };

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações da Pizzaria */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
              {establishment.name}
            </h3>
            <p className="text-gray-300 mb-4">A qualidade é nossa diferença!</p>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-300">{establishment.address}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-red-500" />
                <a 
                  href={`mailto:${establishment.email}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {establishment.email}
                </a>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <button
                onClick={openWhatsApp}
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm">{establishment.phone}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
              
              <button
                onClick={openInstagram}
                className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span className="text-sm">{establishment.instagram}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Horário de Funcionamento</h4>
            <div className="space-y-1">
              {state.businessSettings.businessHours.map((hour) => (
                <div key={hour.day} className="flex justify-between text-sm">
                  <span className="text-gray-300">{hour.day}:</span>
                  <span className={hour.isOpen ? 'text-green-400' : 'text-red-400'}>
                    {hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : 'Fechado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-2 md:mb-0">
              © 2024 {establishment.name}. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Desenvolvido por</span>
              <a
                href="https://crnsistemas.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                CRNsistemas
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;