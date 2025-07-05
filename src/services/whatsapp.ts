import axios from 'axios';

const WPPCONNECT_API_URL = 'http://localhost:21465'; // URL padrão do WPPConnect
const SESSION_NAME = 'pizzaria-quadrada';
const PHONE_NUMBER = '5577999742491';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

class WhatsAppService {
  private baseURL: string;
  private sessionName: string;
  private isConnected: boolean = false;
  private serverAvailable: boolean = false;

  constructor() {
    this.baseURL = WPPCONNECT_API_URL;
    this.sessionName = SESSION_NAME;
    // Verificar disponibilidade do servidor na inicialização
    this.checkServerAvailability();
  }

  // Verificar se o servidor WPPConnect está disponível
  async checkServerAvailability(): Promise<void> {
    try {
      console.log('🔄 Verificando disponibilidade do WPPConnect...');
      
      const healthCheck = await axios.get(`${this.baseURL}/api/health`, {
        timeout: 5000
      });
      
      if (healthCheck.status === 200) {
        console.log('✅ Servidor WPPConnect encontrado e funcionando');
        this.serverAvailable = true;
        await this.initializeConnection();
      }
    } catch (error: any) {
      console.log('ℹ️ WPPConnect não está disponível. Para usar a integração automática:');
      console.log('1. Instale: npm install --global @wppconnect-team/wppconnect-server');
      console.log('2. Execute: wppconnect-server --port 21465');
      console.log('3. Acesse: http://localhost:21465 para configurar');
      console.log('📱 Sistema funcionará com fallback para WhatsApp Web.');
      this.serverAvailable = false;
      this.isConnected = false;
    }
  }

  // Inicializar conexão com WPPConnect
  async initializeConnection(): Promise<void> {
    if (!this.serverAvailable) {
      return;
    }

    try {
      console.log('🔄 Inicializando conexão com WPPConnect...');
      await this.startSession();
    } catch (error: any) {
      console.warn('⚠️ Erro na inicialização do WPPConnect:', error.message);
      this.isConnected = false;
    }
  }

  // Iniciar sessão no WPPConnect
  async startSession(): Promise<boolean> {
    if (!this.serverAvailable) {
      return false;
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/${this.sessionName}/start-session`, {
        webhook: '',
        waitQrCode: true
      }, {
        timeout: 15000
      });

      if (response.status === 200) {
        console.log('✅ Sessão WPPConnect iniciada com sucesso');
        this.isConnected = true;
        
        // Verificar status da sessão periodicamente
        this.monitorSession();
        return true;
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('ℹ️ Servidor WPPConnect não está rodando. Execute: wppconnect-server --port 21465');
        this.serverAvailable = false;
      } else {
        console.error('❌ Erro ao iniciar sessão WPPConnect:', error.message);
      }
      this.isConnected = false;
    }
    return false;
  }

  // Monitorar status da sessão
  private async monitorSession(): Promise<void> {
    setInterval(async () => {
      if (!this.serverAvailable) {
        // Tentar reconectar ao servidor
        await this.checkServerAvailability();
        return;
      }

      try {
        const status = await this.getSessionStatus();
        this.isConnected = status === 'CONNECTED';
        
        if (!this.isConnected && status !== 'QRCODE') {
          console.log('🔄 Tentando reconectar WPPConnect...');
          await this.startSession();
        }
      } catch (error) {
        this.isConnected = false;
        this.serverAvailable = false;
      }
    }, 30000); // Verificar a cada 30 segundos
  }

  // Enviar mensagem via WPPConnect
  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      // Limpar e formatar número
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

      if (this.isConnected && this.serverAvailable) {
        console.log(`📱 Enviando mensagem via WPPConnect para ${formattedPhone}`);
        
        const response = await axios.post(`${this.baseURL}/api/${this.sessionName}/send-message`, {
          phone: formattedPhone,
          message: message,
          isGroup: false
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200 && response.data.result === 'success') {
          console.log('✅ Mensagem enviada via WPPConnect com sucesso');
          return true;
        }
      }
      
      // Fallback para WhatsApp Web
      throw new Error('WPPConnect não disponível');
      
    } catch (error: any) {
      console.log('📱 Usando WhatsApp Web como fallback (WPPConnect não disponível)');
      return this.sendViaWhatsAppWeb(phone, message);
    }
  }

  // Fallback: abrir WhatsApp Web
  private sendViaWhatsAppWeb(phone: string, message: string): boolean {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      console.log('📱 WhatsApp Web aberto para envio manual');
      return true;
    } catch (error) {
      console.error('❌ Erro no fallback WhatsApp Web:', error);
      return false;
    }
  }

  // Enviar notificação de novo pedido
  async sendOrderNotification(phone: string, orderData: any): Promise<boolean> {
    const message = this.formatOrderMessage(orderData);
    return this.sendMessage(phone, message);
  }

  // Enviar atualização de status
  async sendStatusUpdate(phone: string, status: string, orderData: any): Promise<boolean> {
    const message = this.formatStatusMessage(status, orderData);
    return this.sendMessage(phone, message);
  }

  // Formatar mensagem de pedido
  private formatOrderMessage(orderData: any): string {
    const { customer, items, total, id } = orderData;
    
    let message = `🍕 *PIZZARIA A QUADRADA*\n`;
    message += `_A qualidade é nossa diferença!_\n\n`;
    message += `📋 *NOVO PEDIDO #${id}*\n\n`;
    message += `👤 *Cliente:* ${customer.name}\n`;
    message += `📱 *Telefone:* ${customer.phone}\n`;
    message += `📍 *Endereço:* ${customer.address}, ${customer.neighborhood}\n`;
    if (customer.reference) {
      message += `🏠 *Referência:* ${customer.reference}\n`;
    }
    message += `\n🛒 *ITENS DO PEDIDO:*\n`;
    
    items.forEach((item: any, index: number) => {
      const sizeLabel = this.getSizeLabel(item.selectedSize);
      message += `${index + 1}. ${item.quantity}x Pizza ${sizeLabel}\n`;
      
      if (item.selectedFlavors && item.selectedFlavors.length > 1) {
        message += `   *Sabores:*\n`;
        item.selectedFlavors.forEach((flavor: any) => {
          message += `   • ${flavor.name}\n`;
        });
      } else {
        message += `   • ${item.name}\n`;
      }
      message += `   💰 R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `💵 *TOTAL: R$ ${total.toFixed(2)}*\n\n`;
    message += `⏰ *Tempo estimado:* 30-40 minutos\n\n`;
    message += `✅ Pedido recebido e será preparado em breve!\n`;
    message += `📱 Você receberá atualizações sobre o status do seu pedido.`;
    
    return message;
  }

  // Formatar mensagem de status
  private formatStatusMessage(status: string, orderData: any): string {
    const { customer, id } = orderData;
    
    const statusMessages = {
      accepted: `✅ *PEDIDO ACEITO*\n\nOlá ${customer.name}!\n\nSeu pedido #${id} foi aceito e está sendo preparado!\n\n⏰ Tempo estimado: 30-40 minutos\n\n🍕 *PIZZARIA A QUADRADA*\n_A qualidade é nossa diferença!_`,
      production: `🔥 *PIZZA NO FORNO*\n\nOlá ${customer.name}!\n\nSua pizza está sendo preparada! 🍕\n\nPedido #${id} em produção.\n\n🍕 *PIZZARIA A QUADRADA*\n_A qualidade é nossa diferença!_`,
      delivery: `🚚 *SAIU PARA ENTREGA*\n\nOlá ${customer.name}!\n\nSeu pedido #${id} saiu para entrega!\n\n📍 Endereço: ${orderData.customer.address}, ${orderData.customer.neighborhood}\n⏰ Chegará em aproximadamente 15-20 minutos\n\n🍕 *PIZZARIA A QUADRADA*\n_A qualidade é nossa diferença!_`,
      completed: `✅ *PEDIDO ENTREGUE*\n\nOlá ${customer.name}!\n\nPedido #${id} entregue com sucesso!\n\nObrigado pela preferência! ❤️\nEsperamos você novamente em breve!\n\n🍕 *PIZZARIA A QUADRADA*\n_A qualidade é nossa diferença!_`
    };

    return statusMessages[status as keyof typeof statusMessages] || 'Status atualizado!';
  }

  // Obter label do tamanho
  private getSizeLabel(size: string): string {
    const labels = {
      small: 'Pequena',
      medium: 'Média',
      large: 'Grande',
      family: 'Família'
    };
    return labels[size as keyof typeof labels] || size;
  }

  // Verificar status da sessão
  async getSessionStatus(): Promise<string> {
    if (!this.serverAvailable) {
      return 'DISCONNECTED';
    }

    try {
      const response = await axios.get(`${this.baseURL}/api/${this.sessionName}/status-session`, {
        timeout: 8000
      });
      return response.data.status || 'DISCONNECTED';
    } catch (error) {
      this.serverAvailable = false;
      return 'DISCONNECTED';
    }
  }

  // Obter QR Code para conexão
  async getQRCode(): Promise<string | null> {
    if (!this.serverAvailable) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseURL}/api/${this.sessionName}/qr-code`, {
        timeout: 8000
      });
      return response.data.qrcode || null;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      return null;
    }
  }

  // Verificar se está conectado
  isSessionConnected(): boolean {
    return this.isConnected && this.serverAvailable;
  }

  // Verificar se o servidor está disponível
  isServerAvailable(): boolean {
    return this.serverAvailable;
  }

  // Método para testar conexão
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/health`, {
        timeout: 5000
      });
      const available = response.status === 200;
      this.serverAvailable = available;
      return available;
    } catch (error) {
      this.serverAvailable = false;
      return false;
    }
  }

  // Método para tentar reconectar manualmente
  async reconnect(): Promise<boolean> {
    console.log('🔄 Tentando reconectar ao WPPConnect...');
    await this.checkServerAvailability();
    return this.serverAvailable && this.isConnected;
  }
}

export const whatsappService = new WhatsAppService();