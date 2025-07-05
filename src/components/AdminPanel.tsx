import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Printer,
  MessageCircle,
  LogOut,
  Pizza as PizzaIcon,
  Coffee,
  Home,
  BarChart3,
  Send,
  Users,
  Info,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { OrderStatus, Pizza, CartItem } from "../types/index";
import { whatsappService } from "../services/whatsapp";
import WhatsAppStatus from "./WhatsAppStatus";
import BusinessHoursManager from "./BusinessHoursManager";
import PaymentSettings from "./PaymentSettings";
import EstablishmentSettings from "./EstablishmentSettings";
import AdminDashboard from "./AdminDashboard";
import PromotionManager from "./PromotionManager";
import UserManagement from "./UserManagement";
import OrderDetailsModal from "./OrderDetailsModal";

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "menu" | "whatsapp" | "settings" | "promotions" | "users"
  >("orders");
  const [activeOrderTab, setActiveOrderTab] = useState<
    "new" | "accepted" | "production" | "delivery" | "completed" | "all"
  >("new");
  const [activeMenuTab, setActiveMenuTab] = useState<"pizzas" | "bebidas">(
    "pizzas"
  );
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "hours" | "payment" | "establishment"
  >("establishment");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Pizza | null>(null);
  const [formData, setFormData] = useState<Partial<Pizza>>({
    name: "",
    description: "",
    image: "",
    category: "quadrada",
    ingredients: [],
    sizes: { small: 35.0, medium: 35.0, large: 55.0, family: 65.0 },
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Som de notificação para novos pedidos
  useEffect(() => {
    const newOrderCount = state.orders.filter(order => order.status === 'new').length;
    
    if (soundEnabled && newOrderCount > lastOrderCount && lastOrderCount > 0) {
      // Tocar som de notificação
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Erro ao tocar som:', e));
      
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "🔔 Novo pedido recebido!",
      });
    }
    
    setLastOrderCount(newOrderCount);
  }, [state.orders, soundEnabled, lastOrderCount, dispatch]);

  const statusLabels = {
    new: "Novo Pedido",
    accepted: "Aceito",
    production: "Em Produção",
    delivery: "Saiu para Entrega",
    completed: "Entregue",
  };

  const statusIcons = {
    new: Clock,
    accepted: CheckCircle,
    production: ChefHat,
    delivery: Truck,
    completed: Package,
  };

  const statusColors = {
    new: "bg-yellow-500",
    accepted: "bg-blue-500",
    production: "bg-orange-500",
    delivery: "bg-purple-500",
    completed: "bg-green-500",
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    dispatch({
      type: "UPDATE_ORDER_STATUS",
      payload: { id: orderId, status: newStatus },
    });

    const order = state.orders.find((o) => o.id === orderId);
    if (order) {
      try {
        const success = await whatsappService.sendStatusUpdate(
          order.customer.phone,
          newStatus,
          order
        );
        if (success) {
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: `📱 Notificação WhatsApp enviada para ${order.customer.name}!`,
          });
        } else {
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: "Status atualizado! (WhatsApp: envio manual)",
          });
        }
      } catch (error) {
        console.error("Erro ao enviar WhatsApp:", error);
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: "Status atualizado! (WhatsApp indisponível)",
        });
      }
    }
  };

  const sendWhatsAppNotification = async (
    phone: string,
    status: OrderStatus,
    order: import("../types").Order
  ) => {
    try {
      const success = await whatsappService.sendStatusUpdate(
        phone,
        status,
        order
      );
      if (success) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: `📱 Mensagem WhatsApp enviada!`,
        });
      } else {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: "WhatsApp Web aberto para envio manual!",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Erro ao enviar WhatsApp. Tente novamente.",
      });
    }
  };

  const printKitchenOrder = (order: import("../types").Order) => {
    const getSizeLabel = (size: string) => {
      const labels = {
        small: "Pequena",
        medium: "Media",
        large: "Grande",
        family: "Familia",
      };
      return labels[size as keyof typeof labels] || size;
    };

    let printContent = "";
    printContent += "================================\n";
    printContent += "       PIZZARIA A QUADRADA\n";
    printContent += "    A qualidade e nossa diferenca\n";
    printContent += "================================\n\n";
    printContent += `PEDIDO COZINHA #${order.id}\n`;
    printContent += `${new Date().toLocaleString("pt-BR")}\n\n`;
    printContent += "--------------------------------\n";
    printContent += `CLIENTE: ${order.customer.name}\n`;
    printContent += `TELEFONE: ${order.customer.phone}\n`;
    if (order.customer.deliveryType === "delivery") {
      printContent += `ENDERECO: ${order.customer.address}\n`;
      printContent += `BAIRRO: ${order.customer.neighborhood}\n`;
      if (order.customer.reference) {
        printContent += `REF: ${order.customer.reference}\n`;
      }
    } else {
      printContent += `RETIRADA NO LOCAL\n`;
    }
    if (order.customer.notes) {
      printContent += `OBS: ${order.customer.notes}\n`;
    }
    printContent += "--------------------------------\n\n";
    printContent += "ITENS:\n";

    order.items.forEach((item: CartItem, index: number) => {
      const sizeLabel = getSizeLabel(item.selectedSize);
      printContent += `${index + 1}. ${item.quantity}x Pizza ${sizeLabel}\n`;

      if (item.selectedFlavors && item.selectedFlavors.length > 1) {
        printContent += "   SABORES:\n";
        item.selectedFlavors.forEach((flavor: Pizza) => {
          printContent += `   - ${flavor.name}\n`;
        });
      } else {
        printContent += `   - ${item.name}\n`;
      }
      printContent += "\n";
    });

    printContent += "--------------------------------\n";
    printContent += `TOTAL: R$ ${order.total.toFixed(2)}\n`;
    printContent += `PAGAMENTO: ${order.payment.method.toUpperCase()}\n`;
    if (order.payment.needsChange) {
      printContent += `TROCO PARA: R$ ${order.payment.changeAmount?.toFixed(
        2
      )}\n`;
    }
    printContent += "--------------------------------\n\n";
    printContent += "================================\n";

    const printWindow = window.open("", "_blank", "width=400,height=600");

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pedido Cozinha #${order.id}</title>
            <meta charset="UTF-8">
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              
              body { 
                font-family: 'Courier New', 'Lucida Console', monospace; 
                font-size: 11px; 
                line-height: 1.3;
                margin: 0;
                padding: 5mm;
                width: 70mm;
                background: white;
                color: black;
              }
              
              .content {
                white-space: pre-line;
                word-wrap: break-word;
              }
              
              @media print {
                body { 
                  margin: 0; 
                  padding: 2mm;
                  font-size: 10px;
                }
                .no-print { display: none; }
              }
              
              .print-button {
                position: fixed;
                top: 10px;
                right: 10px;
                background: #dc2626;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                z-index: 1000;
              }
              
              .print-button:hover {
                background: #b91c1c;
              }
            </style>
          </head>
          <body>
            <button class="print-button no-print" onclick="window.print(); window.close();">
              🖨️ Imprimir
            </button>
            <div class="content">${printContent}</div>
            <script>
              setTimeout(function() {
                window.print();
              }, 1000);
              
              window.addEventListener('afterprint', function() {
                setTimeout(function() {
                  window.close();
                }, 1000);
              });
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();

      dispatch({
        type: "ADD_NOTIFICATION",
        payload: `Pedido #${order.id} enviado para impressão térmica!`,
      });
    } else {
      alert("Popup bloqueado! Conteúdo da impressão:\n\n" + printContent);
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Popup bloqueado. Verifique as configurações do navegador.",
      });
    }
  };

  const confirmPayment = (orderId: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
      dispatch({
        type: "CONFIRM_PAYMENT",
        payload: orderId
      });
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: `Pagamento do pedido #${orderId} confirmado!`,
      });
    }
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
      dispatch({
        type: "DELETE_ORDER",
        payload: orderId
      });
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: `Pedido #${orderId} excluído com sucesso!`,
      });
    }
  };

  const showOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = [
      "new",
      "accepted",
      "production",
      "delivery",
      "completed",
    ];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  const handleAddItem = () => {
    if (!formData.name || !formData.description || !formData.image) return;

    const newItem: Pizza = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.sizes?.medium || 0,
      image: formData.image,
      category: formData.category as Pizza["category"],
      ingredients: formData.ingredients || [],
      sizes: formData.sizes || {
        small: 35.0,
        medium: 35.0,
        large: 55.0,
        family: 65.0,
      },
    };

    dispatch({ type: "ADD_PIZZA", payload: newItem });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: "Item adicionado ao cardápio!",
    });
    resetForm();
  };

  const handleUpdateItem = () => {
    if (
      !editingItem ||
      !formData.name ||
      !formData.description ||
      !formData.image
    )
      return;

    const updatedItem: Pizza = {
      ...editingItem,
      name: formData.name,
      description: formData.description,
      price: formData.sizes?.medium || 0,
      image: formData.image,
      category: formData.category as Pizza["category"],
      ingredients: formData.ingredients || [],
      sizes: formData.sizes || {
        small: 35.0,
        medium: 35.0,
        large: 55.0,
        family: 65.0,
      },
    };

    dispatch({ type: "UPDATE_PIZZA", payload: updatedItem });
    dispatch({ type: "ADD_NOTIFICATION", payload: "Item atualizado!" });
    resetForm();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      dispatch({ type: "DELETE_PIZZA", payload: id });
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Item removido do cardápio!",
      });
    }
  };

  const startEdit = (item: Pizza) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.category,
      ingredients: [...item.ingredients],
      sizes: { ...item.sizes },
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      category: activeMenuTab === "bebidas" ? "bebida" : "quadrada",
      ingredients: [],
      sizes: { small: 35.0, medium: 35.0, large: 55.0, family: 65.0 },
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleIngredientsChange = (value: string) => {
    const ingredients = value
      .split(",")
      .map((ing) => ing.trim())
      .filter((ing) => ing);
    setFormData({ ...formData, ingredients });
  };

  const getSizeLabel = (size: string) => {
    const labels = {
      small: "Pequena",
      medium: "Média",
      large: "Grande",
      family: "Família",
    };
    return labels[size as keyof typeof labels] || size;
  };

  const getOrdersByStatus = (
    status: "new" | "accepted" | "production" | "delivery" | "completed" | "all"
  ) => {
    if (status === "all") {
      return state.orders;
    }
    return state.orders.filter((order) => order.status === status);
  };

  const getOrderCount = (
    status: "new" | "accepted" | "production" | "delivery" | "completed" | "all"
  ) => {
    return getOrdersByStatus(status).length;
  };

  const getPizzasByCategory = () => {
    if (activeMenuTab === "pizzas") {
      return state.pizzas.filter((pizza) => pizza.category !== "bebida");
    } else {
      return state.pizzas.filter((pizza) => pizza.category === "bebida");
    }
  };

  const getPizzaCount = (category: "pizzas" | "bebidas") => {
    if (category === "pizzas") {
      return state.pizzas.filter((pizza) => pizza.category !== "bebida").length;
    } else {
      return state.pizzas.filter((pizza) => pizza.category === "bebida").length;
    }
  };

  const goToMenu = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">
                PAINEL ADMINISTRATIVO
              </h1>
              <p className="text-red-100 text-sm">Pizzaria a Quadrada</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-red-700 hover:bg-red-800 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                title={soundEnabled ? "Desativar som" : "Ativar som"}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>

              <button
                onClick={goToMenu}
                className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Ver Cardápio</span>
              </button>

              <button
                onClick={onLogout}
                className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="h-5 w-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors relative ${
                activeTab === "orders"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Pedidos
              {getOrderCount("new") > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-red-900 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {getOrderCount("new")}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "menu"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Cardápio
            </button>
            <button
              onClick={() => setActiveTab("promotions")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "promotions"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Send className="h-5 w-5 inline mr-2" />
              Promoções
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "whatsapp"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Configurações
            </button>
          </div>
        </div>

        {activeTab === "dashboard" ? (
          <AdminDashboard />
        ) : activeTab === "promotions" ? (
          <PromotionManager />
        ) : activeTab === "users" ? (
          <UserManagement />
        ) : activeTab === "settings" ? (
          <div>
            {/* Settings Sub-tabs */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md">
                <button
                  onClick={() => setActiveSettingsTab("establishment")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSettingsTab === "establishment"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Estabelecimento
                </button>
                <button
                  onClick={() => setActiveSettingsTab("hours")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSettingsTab === "hours"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Horários
                </button>
                <button
                  onClick={() => setActiveSettingsTab("payment")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSettingsTab === "payment"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Pagamentos
                </button>
              </div>
            </div>

            {activeSettingsTab === "establishment" ? (
              <EstablishmentSettings />
            ) : activeSettingsTab === "hours" ? (
              <BusinessHoursManager />
            ) : (
              <PaymentSettings />
            )}
          </div>
        ) : activeTab === "whatsapp" ? (
          <div>
            <WhatsAppStatus />

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Configuração WhatsApp
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    📱 Como configurar o WPPConnect:
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>
                      1. Instale:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        npm install --global @wppconnect-team/wppconnect-server
                      </code>
                    </li>
                    <li>
                      2. Execute:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        npm start
                      </code>
                    </li>
                    <li>
                      3. Acesse:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        http://localhost:21465
                      </code>
                    </li>
                    <li>4. Escaneie o QR Code com seu WhatsApp</li>
                    <li>5. As mensagens serão enviadas automaticamente!</li>
                  </ol>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ Fallback Automático:
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Se o WPPConnect não estiver disponível, o sistema
                    automaticamente abrirá o WhatsApp Web para envio manual das
                    mensagens. Isso garante que seus clientes sempre recebam as
                    notificações!
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Número Configurado:
                  </h4>
                  <p className="text-sm text-green-700">
                    <strong>WhatsApp Business:</strong> +55 77 99974-2491
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "orders" ? (
          <div>
            {/* Order Status Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveOrderTab("new")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeOrderTab === "new"
                    ? "bg-yellow-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Novos</span>
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                  {getOrderCount("new")}
                </span>
              </button>

              <button
                onClick={() => setActiveOrderTab("accepted")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeOrderTab === "accepted"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Aceitos</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getOrderCount("accepted")}
                </span>
              </button>

              <button
                onClick={() => setActiveOrderTab("production")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeOrderTab === "production"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <ChefHat className="h-4 w-4" />
                <span>Produção</span>
                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  {getOrderCount("production")}
                </span>
              </button>

              <button
                onClick={() => setActiveOrderTab("delivery")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeOrderTab === "delivery"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>Entrega</span>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {getOrderCount("delivery")}
                </span>
              </button>

              <button
                onClick={() => setActiveOrderTab("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeOrderTab === "completed"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Entregues</span>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {getOrderCount("completed")}
                </span>
              </button>

              <button
                onClick={() => setActiveOrderTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeOrderTab === "all"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>Todos</span>
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  {getOrderCount("all")}
                </span>
              </button>
            </div>

            {/* Orders List */}
            {getOrdersByStatus(activeOrderTab).length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {activeOrderTab === "all"
                      ? "Nenhum pedido encontrado"
                      : `Nenhum pedido ${statusLabels[
                          activeOrderTab as OrderStatus
                        ]?.toLowerCase()}`}
                  </h3>
                  <p className="text-gray-500">
                    {activeOrderTab === "all"
                      ? "Os pedidos aparecerão aqui quando os clientes fizerem pedidos."
                      : "Os pedidos aparecerão nesta aba quando mudarem para este status."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {getOrdersByStatus(activeOrderTab).map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-2 rounded-full ${
                              statusColors[order.status]
                            }`}
                          >
                            <StatusIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm">
                              #{order.id}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            R$ {order.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {statusLabels[order.status]}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3 mb-3">
                        <div className="mb-2">
                          <p className="font-medium text-gray-800 text-sm">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.customer.phone}
                          </p>
                          {order.customer.deliveryType === "delivery" ? (
                            <p className="text-xs text-gray-600">
                              📍 {order.customer.neighborhood}
                            </p>
                          ) : (
                            <p className="text-xs text-blue-600 font-medium">
                              🏪 Retirada
                            </p>
                          )}
                        </div>

                        <div className="mb-2">
                          <p className="text-xs text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-600">
                            💳 {order.payment.method.toUpperCase()}
                            {order.payment.confirmed && (
                              <span className="text-green-600 ml-1">✓</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Ações Rápidas */}
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        <button
                          onClick={() => showOrderDetails(order)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
                          title="Ver detalhes"
                        >
                          <Info className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => printKitchenOrder(order)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
                          title="Imprimir"
                        >
                          <Printer className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => confirmPayment(order.id)}
                          className={`p-2 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                            order.payment.confirmed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                          }`}
                          title="Confirmar pagamento"
                          disabled={order.payment.confirmed}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() =>
                            sendWhatsAppNotification(
                              order.customer.phone,
                              order.status,
                              order
                            )
                          }
                          className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
                          title="Excluir pedido"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {nextStatus && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, nextStatus)
                          }
                          className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                        >
                          → {statusLabels[nextStatus]}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Menu Category Tabs */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md">
                <button
                  onClick={() => {
                    setActiveMenuTab("pizzas");
                    setFormData({ ...formData, category: "quadrada" });
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeMenuTab === "pizzas"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <PizzaIcon className="h-5 w-5" />
                  <span>Pizzas</span>
                  <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full">
                    {getPizzaCount("pizzas")}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveMenuTab("bebidas");
                    setFormData({ ...formData, category: "bebida" });
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeMenuTab === "bebidas"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Coffee className="h-5 w-5" />
                  <span>Bebidas</span>
                  <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full">
                    {getPizzaCount("bebidas")}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Gerenciar {activeMenuTab === "pizzas" ? "Pizzas" : "Bebidas"}
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>
                  Adicionar {activeMenuTab === "pizzas" ? "Pizza" : "Bebida"}
                </span>
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {editingItem
                      ? "Editar Item"
                      : `Adicionar Nova ${
                          activeMenuTab === "pizzas" ? "Pizza" : "Bebida"
                        }`}
                  </h4>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {activeMenuTab === "pizzas" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <select
                        value={formData.category || "quadrada"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as Pizza["category"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="quadrada">Pizza Quadrada</option>
                        <option value="redonda">Pizza Redonda</option>
                        <option value="doce">Pizza Doce</option>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Imagem
                    </label>
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredientes (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formData.ingredients?.join(", ") || ""}
                      onChange={(e) => handleIngredientsChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {activeMenuTab === "pizzas" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço Pequena
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sizes?.small || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sizes: {
                                ...formData.sizes!,
                                small: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço Média
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sizes?.medium || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sizes: {
                                ...formData.sizes!,
                                medium: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço Grande
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sizes?.large || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sizes: {
                                ...formData.sizes!,
                                large: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço Família
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sizes?.family || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sizes: {
                                ...formData.sizes!,
                                family: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sizes?.medium || ""}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            sizes: {
                              medium: price,
                              large: price,
                              family: price,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingItem ? "Atualizar" : "Adicionar"}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPizzasByCategory().map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {item.category === "quadrada"
                        ? "Quadrada"
                        : item.category === "redonda"
                        ? "Redonda"
                        : item.category === "doce"
                        ? "Doce"
                        : "Bebida"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <p className="text-lg font-bold text-red-600 mb-3">
                      {item.category === "bebida"
                        ? `R$ ${item.sizes.medium.toFixed(2)}`
                        : item.category === "redonda" && item.sizes.small
                        ? `R$ ${item.sizes.small.toFixed(
                            2
                          )} - ${item.sizes.family.toFixed(2)}`
                        : `R$ ${
                            item.sizes.small?.toFixed(2) ||
                            item.sizes.medium.toFixed(2)
                          } - ${item.sizes.family.toFixed(2)}`}
                    </p>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;