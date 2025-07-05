import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  CartItem,
  Order,
  Customer,
  OrderStatus,
  Pizza,
  BusinessSettings,
  BusinessHours,
  PaymentSettings,
} from "../types";
import { pizzas as initialPizzas } from "../data/pizzas";
import { whatsappService } from "../services/whatsapp";
import { apiService } from "../services/api";

interface AppState {
  cart: CartItem[];
  orders: Order[];
  currentView: "menu" | "cart" | "admin";
  notifications: string[];
  pizzas: Pizza[];
  showBeverageSuggestions: boolean;
  lastAddedPizza: Pizza | null;
  businessSettings: BusinessSettings;
  isLoading: boolean;
}

type AppAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | {
      type: "UPDATE_CART_QUANTITY";
      payload: { id: string; quantity: number; size: string };
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_VIEW"; payload: "menu" | "cart" | "admin" }
  | { type: "CREATE_ORDER"; payload: Order }
  | {
      type: "UPDATE_ORDER_STATUS";
      payload: { id: string; status: OrderStatus };
    }
  | { type: "ADD_NOTIFICATION"; payload: string }
  | { type: "REMOVE_NOTIFICATION"; payload: number }
  | { type: "ADD_PIZZA"; payload: Pizza }
  | { type: "UPDATE_PIZZA"; payload: Pizza }
  | { type: "DELETE_PIZZA"; payload: string }
  | { type: "SHOW_BEVERAGE_SUGGESTIONS"; payload: Pizza }
  | { type: "HIDE_BEVERAGE_SUGGESTIONS" }
  | { type: "UPDATE_BUSINESS_SETTINGS"; payload: Partial<BusinessSettings> }
  | { type: "UPDATE_PAYMENT_SETTINGS"; payload: PaymentSettings }
  | { type: "LOAD_BUSINESS_SETTINGS"; payload: BusinessSettings }
  | { type: "SET_PIZZAS"; payload: Pizza[] }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "SET_LOADING"; payload: boolean };

const defaultBusinessHours: BusinessHours[] = [
  { day: "Domingo", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Segunda-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Terça-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Quarta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Quinta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Sexta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Sábado", isOpen: true, openTime: "18:00", closeTime: "23:00" },
];

export const defaultPaymentSettings: PaymentSettings = {
  pixKey: "77999742491",
  pixName: "Pizzaria a Quadrada",
  stripePublishableKey: "",
  stripeSecretKey: "",
  acceptCash: true,
  acceptPix: true,
  acceptCard: false,
};

const defaultBusinessSettings: BusinessSettings = {
  businessHours: defaultBusinessHours,
  isOpen: true,
  closedMessage:
    "Estamos fechados no momento. Nosso horário de funcionamento é das 18:00 às 23:00.",
  payment: defaultPaymentSettings,
};

// Função para carregar configurações do localStorage (fallback)
const loadBusinessSettings = (): BusinessSettings => {
  try {
    const saved = localStorage.getItem("pizzaria-business-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultBusinessSettings,
        ...parsed,
        payment: {
          ...defaultPaymentSettings,
          ...parsed.payment,
        },
      };
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
  return defaultBusinessSettings;
};

// Função para salvar configurações no localStorage (fallback)
const saveBusinessSettings = (settings: BusinessSettings): void => {
  try {
    localStorage.setItem(
      "pizzaria-business-settings",
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
  }
};

const initialState: AppState = {
  cart: [],
  orders: [],
  currentView: "menu",
  notifications: [],
  pizzas: initialPizzas,
  showBeverageSuggestions: false,
  lastAddedPizza: null,
  businessSettings: loadBusinessSettings(),
  isLoading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_PIZZAS":
      return { ...state, pizzas: action.payload };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "ADD_TO_CART":
      const existingItemIndex = state.cart.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cart: updatedCart };
      }

      const newState = { ...state, cart: [...state.cart, action.payload] };

      // Show beverage suggestions if a pizza was added
      if (action.payload.category !== "bebida") {
        return {
          ...newState,
          showBeverageSuggestions: true,
          lastAddedPizza: action.payload,
        };
      }

      return newState;

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter(
          (item) =>
            !(
              item.id === action.payload.split("-")[0] &&
              item.selectedSize === action.payload.split("-")[1]
            )
        ),
      };

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.payload.id &&
            item.selectedSize === action.payload.size
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "CREATE_ORDER":
      console.log(
        "CREATE_ORDER action triggered with payload:",
        action.payload
      );

      // Preparar dados para envio ao backend
      const orderToSend = {
        customer: {
          name: action.payload.customer.name,
          phone: action.payload.customer.phone,
          address: action.payload.customer.address || "",
          neighborhood: action.payload.customer.neighborhood || "",
          reference: action.payload.customer.reference || "",
          deliveryType: action.payload.customer.deliveryType,
          location: action.payload.customer.location,
        },
        items: action.payload.items.map((item) => ({
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
        })),
        total: action.payload.total,
        payment: {
          method: action.payload.payment.method,
          needsChange: action.payload.payment.needsChange || false,
          changeAmount: action.payload.payment.changeAmount,
          pixCode: action.payload.payment.pixCode,
          stripePaymentIntentId: action.payload.payment.stripePaymentIntentId,
        },
      };

      console.log("Dados preparados para envio ao backend:", orderToSend);

      // Enviar pedido para o backend de forma assíncrona
      apiService
        .createOrder(orderToSend)
        .then((response) => {
          console.log(
            "✅ Pedido enviado para o backend com sucesso:",
            response
          );

          // Recarregar pedidos se for admin
          if (localStorage.getItem("admin_authenticated") === "true") {
            apiService
              .getOrders()
              .then((orders) => {
                console.log("Pedidos recarregados:", orders);
                // Aqui você pode disparar outro action para atualizar os pedidos
                // Mas como estamos dentro do reducer, vamos fazer isso no useEffect
              })
              .catch((error) => {
                console.error("Erro ao recarregar pedidos:", error);
              });
          }
        })
        .catch((error) => {
          console.error("❌ Erro ao enviar pedido para o backend:", error);
          console.error(
            "Detalhes do erro:",
            error.response?.data || error.message
          );
        });

      // Send WhatsApp notification for new order
      setTimeout(async () => {
        try {
          await whatsappService.sendOrderNotification(
            action.payload.customer.phone,
            action.payload
          );
        } catch (error) {
          console.error("Erro ao enviar notificação WhatsApp:", error);
        }
      }, 1000);

      return {
        ...state,
        orders: [...state.orders, action.payload],
        cart: [],
      };

    case "UPDATE_ORDER_STATUS":
      // Enviar atualização para o backend
      apiService
        .updateOrderStatus(action.payload.id, action.payload.status)
        .then(() => {
          console.log("Status do pedido atualizado no backend");
        })
        .catch((error) => {
          console.error("Erro ao atualizar status no backend:", error);
        });

      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id
            ? { ...order, status: action.payload.status }
            : order
        ),
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (_, index) => index !== action.payload
        ),
      };

    case "ADD_PIZZA":
      // Enviar para o backend
      const pizzaToCreate = {
        name: action.payload.name,
        description: action.payload.description,
        image: action.payload.image,
        category: action.payload.category,
        ingredients: action.payload.ingredients,
        sizes: action.payload.sizes,
      };

      apiService
        .createPizza(pizzaToCreate)
        .then((response) => {
          console.log("Pizza criada no backend:", response);
          // Recarregar pizzas
          apiService
            .getPizzas()
            .then((pizzas) => {
              console.log("Pizzas recarregadas:", pizzas);
            })
            .catch((error) => {
              console.error("Erro ao recarregar pizzas:", error);
            });
        })
        .catch((error) => {
          console.error("Erro ao criar pizza no backend:", error);
        });

      return {
        ...state,
        pizzas: [...state.pizzas, action.payload],
      };

    case "UPDATE_PIZZA":
      // Enviar para o backend
      const pizzaToUpdate = {
        name: action.payload.name,
        description: action.payload.description,
        image: action.payload.image,
        category: action.payload.category,
        ingredients: action.payload.ingredients,
        sizes: action.payload.sizes,
      };

      apiService
        .updatePizza(action.payload.id, pizzaToUpdate)
        .then((response) => {
          console.log("Pizza atualizada no backend:", response);
        })
        .catch((error) => {
          console.error("Erro ao atualizar pizza no backend:", error);
        });

      return {
        ...state,
        pizzas: state.pizzas.map((pizza) =>
          pizza.id === action.payload.id ? action.payload : pizza
        ),
      };

    case "DELETE_PIZZA":
      // Enviar para o backend
      apiService
        .deletePizza(action.payload)
        .then(() => {
          console.log("Pizza removida do backend");
        })
        .catch((error) => {
          console.error("Erro ao remover pizza do backend:", error);
        });

      return {
        ...state,
        pizzas: state.pizzas.filter((pizza) => pizza.id !== action.payload),
      };

    case "SHOW_BEVERAGE_SUGGESTIONS":
      return {
        ...state,
        showBeverageSuggestions: true,
        lastAddedPizza: action.payload,
      };

    case "HIDE_BEVERAGE_SUGGESTIONS":
      return {
        ...state,
        showBeverageSuggestions: false,
        lastAddedPizza: null,
      };

    case "LOAD_BUSINESS_SETTINGS":
      return {
        ...state,
        businessSettings: action.payload,
      };

    case "UPDATE_BUSINESS_SETTINGS":
      const updatedSettings = {
        ...state.businessSettings,
        ...action.payload,
      };
      // Salvar no localStorage como fallback
      saveBusinessSettings(updatedSettings);

      // Enviar para o backend
      apiService.updateBusinessSettings(updatedSettings).catch((error) => {
        console.error("Erro ao salvar configurações no backend:", error);
      });

      return {
        ...state,
        businessSettings: updatedSettings,
      };

    case "UPDATE_PAYMENT_SETTINGS":
      const updatedBusinessSettings = {
        ...state.businessSettings,
        payment: action.payload,
      };
      // Salvar no localStorage como fallback
      saveBusinessSettings(updatedBusinessSettings);

      // Enviar para o backend
      apiService
        .updateBusinessSettings(updatedBusinessSettings)
        .catch((error) => {
          console.error("Erro ao salvar configurações no backend:", error);
        });

      return {
        ...state,
        businessSettings: updatedBusinessSettings,
      };

    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados do backend na inicialização
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        console.log("🔄 Carregando dados do backend...");

        // Carregar pizzas
        const pizzas = await apiService.getPizzas();
        console.log("✅ Pizzas carregadas:", pizzas.length);
        dispatch({ type: "SET_PIZZAS", payload: pizzas });

        // Carregar configurações de negócio
        const businessSettings = await apiService.getBusinessSettings();
        console.log("✅ Configurações carregadas");
        dispatch({ type: "LOAD_BUSINESS_SETTINGS", payload: businessSettings });

        // Carregar pedidos (apenas se for admin)
        if (localStorage.getItem("admin_authenticated") === "true") {
          try {
            const orders = await apiService.getOrders();
            console.log("✅ Pedidos carregados:", orders.length);
            dispatch({ type: "SET_ORDERS", payload: orders });
          } catch (error) {
            console.log(
              "ℹ️ Não foi possível carregar pedidos (não autenticado)"
            );
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: "Erro ao conectar com o servidor. Usando dados locais.",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  // Recarregar pedidos quando o usuário faz login como admin
  useEffect(() => {
    const loadOrders = async () => {
      if (localStorage.getItem("admin_authenticated") === "true") {
        try {
          console.log("🔄 Recarregando pedidos para admin...");
          const orders = await apiService.getOrders();
          console.log("✅ Pedidos recarregados:", orders.length);
          dispatch({ type: "SET_ORDERS", payload: orders });
        } catch (error) {
          console.error("❌ Erro ao carregar pedidos:", error);
        }
      }
    };

    // Verificar se o usuário acabou de fazer login
    const checkAuthChange = () => {
      if (
        localStorage.getItem("admin_authenticated") === "true" &&
        state.orders.length === 0
      ) {
        loadOrders();
      }
    };

    // Verificar mudanças na autenticação
    window.addEventListener("storage", checkAuthChange);

    // Verificar imediatamente se já está autenticado
    if (
      localStorage.getItem("admin_authenticated") === "true" &&
      state.orders.length === 0
    ) {
      loadOrders();
    }

    return () => {
      window.removeEventListener("storage", checkAuthChange);
    };
  }, [state.orders.length]);

  // Polling para recarregar pedidos periodicamente quando admin está logado
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (localStorage.getItem("admin_authenticated") === "true") {
      interval = setInterval(async () => {
        try {
          const orders = await apiService.getOrders();
          dispatch({ type: "SET_ORDERS", payload: orders });
        } catch (error) {
          console.error("Erro no polling de pedidos:", error);
        }
      }, 30000); // Recarregar a cada 30 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
