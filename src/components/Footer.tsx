import React from 'react';
import { Phone, Instagram, MapPin, Heart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Footer: React.FC = () => {
  const { state } = useApp();

  const businessSettings = state.businessSettings || {};
  const businessInfo = businessSettings.businessInfo;
  const businessHours = businessSettings.businessHours || [];
  const payment = businessSettings.payment || {};

  if (!businessInfo) return null; // ou: return <div>Carregando informações do negócio...</div>

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Business Info */}
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-4">{businessInfo.name}</h3>
            <p className="text-gray-300 mb-4">A qualidade é nossa diferença!</p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-400" />
                <span className="text-sm">{businessInfo.whatsapp}</span>
              </div>

              {businessInfo.instagram && (
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4 text-red-400" />
                  <span className="text-sm">{businessInfo.instagram}</span>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-red-400 mt-0.5" />
                <div className="text-sm">
                  <p>{businessInfo.address}</p>
                  <p>{businessInfo.city} - {businessInfo.state}</p>
                  <p>CEP: {businessInfo.zipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Horário de Funcionamento</h4>
            <div className="space-y-1">
              {businessHours.map((hour) => (
                <div key={hour.day} className="flex justify-between text-sm">
                  <span className="text-gray-300">{hour.day}:</span>
                  <span className={hour.isOpen ? 'text-green-400' : 'text-red-400'}>
                    {hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : 'Fechado'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Formas de Pagamento</h4>
            <div className="space-y-2">
              {payment.acceptCash && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Dinheiro</span>
                </div>
              )}
              {payment.acceptPix && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>PIX</span>
                </div>
              )}
              {payment.acceptCard && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Cartão de Crédito</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} {businessInfo.name}. Todos os direitos reservados.
            </p>

            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Desenvolvido com</span>
              <Heart className="h-4 w-4 text-red-400" />
              <span>por</span>
              <a
                href="https://crnsistemas.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
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
