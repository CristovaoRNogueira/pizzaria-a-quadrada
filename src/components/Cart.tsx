import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Store,
  Banknote,
  QrCode,
  CreditCard
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { Customer, PaymentInfo } from "../types";

const Cart: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    reference: "",
    deliveryType: "delivery",
  });
  const [payment, setPayment] = useState<PaymentInfo>({
    method: "dinheiro",
  });
  const [phoneError, setPhoneError] = useState("");

  const total = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleQuantityChange = (
    id: number,
    size: string,
    newQuantity: number
  ) => {
    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { id, quantity: newQuantity, size },
    });
  };

  const handleRemoveItem = (id: number, size: string) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: state.cart.findIndex((item) => 
        item.id === id && 
        item.selectedSize === size
      ),
    });
  };

  const handleContinueShopping = () => {
    dispatch({ type: "SET_VIEW", payload: "menu" });
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setPhoneError("Telefone deve ter 10 ou 11 dígitos");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (value: string) => {
    setCustomer({ ...customer, phone: value });
    if (value) {
      validatePhone(value);
    } else {
      setPhoneError("");
    }
  };

  const getCurrentLocation = () => {
    console.log('🗺️ Solicitando localização do usuário...');
    
    if (navigator.geolocation) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Solicitando sua localização...'
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Localização obtida:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          setCustomer({
            ...customer,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: `Localização capturada! Precisão: ${Math.round(position.coords.accuracy)}m`
          });
        },
        (error) => {
          console.error('❌ Erro ao obter localização:', error);
          let errorMessage = 'Erro ao obter localização. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Permissão negada pelo usuário.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Localização indisponível.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Tempo limite excedido.';
              break;
            default:
              errorMessage += 'Erro desconhecido.';
          }
          
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: errorMessage
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    } else {
      console.error('❌ Geolocalização não suportada');
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: 'Geolocalização não é suportada por este navegador.'
      });
    }
  };

  const generatePixCode = () => {
    // Simulated PIX code generation
    const pixKey = state.businessSettings.payment.pixKey;
    const pixName = state.businessSettings.payment.pixName;
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865802BR5925${pixName}6009SAO PAULO62070503***6304`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validatePhone(customer.phone)) {
      return;
    }

    if (
      customer.deliveryType === "delivery" &&
      (!customer.address || !customer.neighborhood)
    ) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Preencha o endereço para entrega!",
      });
      return;
    }

    // Validar troco se necessário
    if (payment.method === "dinheiro" && payment.needsChange) {
      if (!payment.changeAmount || payment.changeAmount < total) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: "Valor para troco deve ser maior que o total do pedido!",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      console.log("Iniciando criação do pedido...");

      // Preparar dados de pagamento baseado no método
      let paymentData: PaymentInfo = {
        method: payment.method,
      };

      if (payment.method === "dinheiro") {
        paymentData.needsChange = payment.needsChange || false;
        if (payment.needsChange) {
          paymentData.changeAmount = payment.changeAmount;
        }
      } else if (payment.method === "pix") {
        paymentData.pixCode = generatePixCode();
        paymentData.pixPaid = true; // Assumir que será pago
      }

      const orderData = {
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address || "",
          neighborhood: customer.neighborhood || "",
          reference: customer.reference || "",
          deliveryType: customer.deliveryType,
          location: customer.location,
        },
        items: state.cart.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          category: item.category,
          ingredients: item.ingredients,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedFlavors: item.selectedFlavors || [
            { id: item.id, name: item.name },
          ],
          price: item.price,
          selectedAdditionals: item.selectedAdditionals || [],
          notes: item.notes || "",
        })),
        total,
        payment: paymentData,
      };

      console.log("Dados do pedido preparados:", orderData);

      // Enviar pedido para o backend via dispatch
      dispatch({ type: "CREATE_ORDER", payload: orderData });
      
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Pedido enviado com sucesso!",
      });
      
      // Não redirecionar para o menu, deixar o contexto gerenciar a exibição da tela de sucesso

      // Simulate WhatsApp notification
      setTimeout(() => {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: "📱 WhatsApp será aberto automaticamente!",
        });
      }, 1000);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Erro ao enviar pedido. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      cartao: "Cartão de Crédito",
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "dinheiro":
        return <Banknote className="h-4 w-4" />;
      case "pix":
        return <QrCode className="h-4 w-4" />;
      case "cartao":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-6">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Carrinho Vazio
            </h2>
            <p className="text-gray-600 mb-6">
              Adicione algumas pizzas deliciosas ao seu carrinho!
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_VIEW", payload: "menu" })}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ver Cardápio
          </button>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowCheckout(false)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Finalizar Pedido
            </h2>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Delivery Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrega *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCustomer({ ...customer, deliveryType: "delivery" })
                  }
                  className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                    customer.deliveryType === "delivery"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Entrega</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomer({ ...customer, deliveryType: "pickup" })
                  }
                  className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                    customer.deliveryType === "pickup"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Store className="h-5 w-5" />
                  <span>Retirada</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone/WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={customer.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  phoneError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="(77) 99999-9999"
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
            </div>

            {customer.deliveryType === "delivery" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.neighborhood}
                    onChange={(e) =>
                      setCustomer({ ...customer, neighborhood: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={customer.reference}
                    onChange={(e) =>
                      setCustomer({ ...customer, reference: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Compartilhar Localização</span>
                  </button>
                  {customer.location && (
                    <p className="text-green-600 text-sm mt-1">
                      ✓ Localização capturada
                    </p>
                  )}
                </div>
              </>
            )}

            {customer.deliveryType === "pickup" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📍 Endereço para Retirada:
                </h4>
                <p className="text-blue-700 text-sm">
                  Rua das Pizzas, 123 - Centro
                  <br />
                  Vitória da Conquista - BA
                  <br />
                  <strong>Horário:</strong> 18:00 às 23:00
                </p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Pagamento *
              </label>
              <div className="space-y-2">
                {state.businessSettings.payment.acceptCash && (
                  <button
                    type="button"
                    onClick={() => setPayment({ method: "dinheiro" })}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 ${
                      payment.method === "dinheiro"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Banknote className="h-5 w-5" />
                    <span>Dinheiro</span>
                  </button>
                )}

                {state.businessSettings.payment.acceptPix && (
                  <button
                    type="button"
                    onClick={() => setPayment({ method: "pix" })}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 ${
                      payment.method === "pix"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <QrCode className="h-5 w-5" />
                    <span>PIX</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPayment({ method: "cartao" })}
                  className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 ${
                    payment.method === "cartao"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Cartão de Crédito</span>
                </button>
              </div>
            </div>

            {/* Change for cash payment */}
            {payment.method === "dinheiro" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="needsChange"
                    checked={payment.needsChange || false}
                    onChange={(e) =>
                      setPayment({
                        ...payment,
                        needsChange: e.target.checked,
                        changeAmount: e.target.checked
                          ? payment.changeAmount
                          : undefined,
                      })
                    }
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label
                    htmlFor="needsChange"
                    className="text-sm font-medium text-gray-700"
                  >
                    Preciso de troco
                  </label>
                </div>

                {payment.needsChange && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Troco para quanto?
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={total}
                      value={payment.changeAmount || ""}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          changeAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={`Mínimo: R$ ${total.toFixed(2)}`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* PIX Information */}
            {payment.method === "pix" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  💳 Informações do PIX:
                </h4>
                <p className="text-blue-700 text-sm">
                  <strong>Chave PIX:</strong> {state.businessSettings.payment.pixKey}
                  <br />
                  <strong>Nome:</strong> {state.businessSettings.payment.pixName}
                  <br />
                  <strong>Valor:</strong> R$ {total.toFixed(2)}
                </p>
                <p className="text-blue-600 text-xs mt-2">
                  O código PIX será gerado após a confirmação do pedido.
                </p>
              </div>
            )}

            {/* Card Information */}
            {payment.method === "cartao" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  💳 Pagamento no Cartão:
                </h4>
                <p className="text-green-700 text-sm">
                  <strong>Valor:</strong> R$ {total.toFixed(2)}
                  <br />
                  O pagamento será processado na entrega/retirada.
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-red-600">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {getPaymentIcon(payment.method)}
                <span>
                  {isSubmitting
                    ? "Enviando Pedido..."
                    : `Finalizar Pedido - ${getPaymentMethodLabel(payment.method)}`}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Seu Carrinho</h2>
        <button
          onClick={handleContinueShopping}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continuar Pedindo</span>
        </button>
      </div>

      <div className="space-y-4">
        {state.cart.map((item) => (
          <div
            key={`${item.id}-${item.selectedSize}`}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex items-center space-x-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Tamanho: {getSizeLabel(item.selectedSize)}
                </p>
                {item.selectedFlavors && item.selectedFlavors.length > 1 && (
                  <p className="text-sm text-gray-600">
                    Sabores:{" "}
                    {item.selectedFlavors.map((f) => f.name).join(", ")}
                  </p>
                )}
                {item.selectedAdditionals && item.selectedAdditionals.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Adicionais: {item.selectedAdditionals.map((add) => add.name).join(", ")}
                  </p>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-600 italic">
                    Obs: {item.notes}
                  </p>
                )}
                <p className="text-lg font-bold text-red-600">
                  R$ {item.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.id,
                      item.selectedSize,
                      item.quantity - 1
                    )
                  }
                  className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-medium px-2">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.id,
                      item.selectedSize,
                      item.quantity + 1
                    )
                  }
                  className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id, item.selectedSize)}
                  className="text-red-600 hover:text-red-700 p-2 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-3xl font-bold text-red-600">
            R$ {total.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => setShowCheckout(true)}
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? "Processando..." : "Finalizar Pedido"}
        </button>
      </div>
    </div>
  );
};

export default Cart;