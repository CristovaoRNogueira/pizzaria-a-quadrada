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
  Additional,
  BusinessSettings,
  BusinessHours,
  PaymentSettings,
  BusinessInfo,
  User,
  UserRole,
  UserPermissions,
} from "../types";
import { pizzas as initialPizzas } from "../data/pizzas";
import { additionals as initialAdditionals } from "../data/additionals";
import { apiService } from "../services/api";

interface AppState {
  cart: CartItem[];
  orders: Order[];
  currentView: "menu" | "cart" | "admin";
  notifications: string[];
  pizzas: Pizza[];
  additionals: Additional[];
  showBeverageSuggestions: boolean;
  lastAddedPizza: Pizza | null;
  businessSettings: BusinessSettings;
  isLoading: boolean;
  currentOrder: Order | null;
  showOrderSuccess: boolean;
  users: User[];
  currentUser: User | null;
  userPermissions: UserPermissions | null;
}

type AppAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | {
      type: "UPDATE_CART_QUANTITY";
      payload: { id: number; quantity: number; size: string };
    }
  | {
      type: "UPDATE_CART_ITEM";
      payload: { id: number; size: string; updates: Partial<CartItem> };
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_VIEW"; payload: "menu" | "cart" | "admin" }
  | { type: "CREATE_ORDER"; payload: Order }
  | {
      type: "UPDATE_ORDER_STATUS";
      payload: { id: number; status: OrderStatus };
    }
  | { type: "ADD_NOTIFICATION"; payload: string }
  | { type: "REMOVE_NOTIFICATION"; payload: number }
  | { type: "ADD_PIZZA"; payload: Pizza }
  | { type: "UPDATE_PIZZA"; payload: Pizza }
  | { type: "DELETE_PIZZA"; payload: number }
  | { type: "ADD_ADDITIONAL"; payload: Additional }
  | { type: "UPDATE_ADDITIONAL"; payload: Additional }
  | { type: "DELETE_ADDITIONAL"; payload: number }
  | { type: "SHOW_BEVERAGE_SUGGESTIONS"; payload: Pizza }
  | { type: "HIDE_BEVERAGE_SUGGESTIONS" }
  | { type: "UPDATE_BUSINESS_SETTINGS"; payload: Partial<BusinessSettings> }
  | { type: "UPDATE_PAYMENT_SETTINGS"; payload: PaymentSettings }
  | { type: "UPDATE_BUSINESS_INFO"; payload: BusinessInfo }
  | { type: "LOAD_BUSINESS_SETTINGS"; payload: BusinessSettings }
  | { type: "SET_PIZZAS"; payload: Pizza[] }
  | { type: "SET_ADDITIONALS"; payload: Additional[] }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CURRENT_ORDER"; payload: Order | null }
  | { type: "SHOW_ORDER_SUCCESS"; payload: boolean }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: number }
  | { type: "SET_CURRENT_USER"; payload: User | null }
  | { type: "REMOVE_ORDER"; payload: number };

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
  acceptCash: true,
  acceptPix: true,
  acceptCard: true,
};

const defaultBusinessInfo: BusinessInfo = {
  name: "Pizzaria a Quadrada",
  whatsapp: "77999742491",
  instagram: "@pizzariaquadrada",
  address: "Rua das Pizzas, 123",
  city: "Vitória da Conquista",
  state: "BA",
  zipCode: "45000-000",
};

const defaultBusinessSettings: BusinessSettings = {
  businessHours: defaultBusinessHours,
  isOpen: true,
  closedMessage:
    "Estamos fechados no momento. Nosso horário de funcionamento é das 18:00 às 23:00.",
  payment: defaultPaymentSettings,
  businessInfo: defaultBusinessInfo,
};

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
        businessInfo: {
          ...defaultBusinessInfo,
          ...parsed.businessInfo,
        },
      };
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
  return defaultBusinessSettings;
};

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

const generateOrderId = (): number => {
  return Date.now();
};

const initialState: AppState = {
  cart: [],
  orders: [],
  currentView: "menu",
  notifications: [],
  pizzas: initialPizzas,
  additionals: initialAdditionals,
  showBeverageSuggestions: false,
  lastAddedPizza: null,
  businessSettings: loadBusinessSettings(),
  isLoading: false,
  currentOrder: null,
  showOrderSuccess: false,
  users: [],
  currentUser: null,
  userPermissions: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_PIZZAS":
      return { ...state, pizzas: action.payload };

    case "SET_ADDITIONALS":
      return { ...state, additionals: action.payload };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "SET_CURRENT_ORDER":
      return { ...state, currentOrder: action.payload };

    case "SHOW_ORDER_SUCCESS":
      return { ...state, showOrderSuccess: action.payload };

    case "SET_USERS":
      return { ...state, users: action.payload };

    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };

    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };

    case "ADD_TO_CART":
      const existingItemIndex = state.cart.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize &&
          JSON.stringify(item.selectedFlavors) === JSON.stringify(action.payload.selectedFlavors) &&
          JSON.stringify(item.selectedAdditionals) === JSON.stringify(action.payload.selectedAdditionals) &&
          item.notes === action.payload.notes
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cart: updatedCart };
      }

      const newState = { ...state, cart: [...state.cart, action.payload] };

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
        cart: state.cart.filter((_, index) => index !== action.payload),
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

    case "UPDATE_CART_ITEM":
      return {
        ...state,
        cart: state.cart.map((item, index) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.size
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "CREATE_ORDER":
      console.log("CREATE_ORDER action triggered with payload:", action.payload);

      // Não gerar ID aqui, deixar o backend gerar
      const orderToCreate = action.payload;

      const orderToSend = {
        customer: {
          name: orderToCreate.customer.name,
          phone: orderToCreate.customer.phone,
          address: orderToCreate.customer.address || "",
          neighborhood: orderToCreate.customer.neighborhood || "",
          reference: orderToCreate.customer.reference || "",
          deliveryType: orderToCreate.customer.deliveryType,
          location: orderToCreate.customer.location,
        },
        items: orderToCreate.items.map((item) => ({
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
          selectedAdditionals: item.selectedAdditionals || [],
          notes: item.notes || "",
          price: item.price,
        })),
        total: orderToCreate.total,
        payment: orderToCreate.payment,
      };

      console.log("Dados preparados para envio ao backend:", orderToSend);

      apiService
        .createOrder(orderToSend)
        .then((response) => {
          console.log("✅ Pedido enviado para o backend com sucesso:", response);
          
          // Atualizar o estado apenas com o pedido retornado pelo backend
          dispatch({
            type: 'SET_CURRENT_ORDER',
            payload: response
          });
          
          dispatch({
            type: 'SHOW_ORDER_SUCCESS',
            payload: true
          });
        })
        .catch((error) => {
          console.error("❌ Erro ao enviar pedido para o backend:", error);
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: 'Erro ao enviar pedido. Tente novamente.'
          });
        });

      // Limpar carrinho imediatamente
      return {
        ...state,
        cart: []
      };

    case "REMOVE_ORDER":
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload),
      };

    case "UPDATE_ORDER_STATUS":
      const updatedOrders = state.orders.map((order) =>
        order.id === action.payload.id
          ? { ...order, status: action.payload.status }
          : order
      );

      const updatedCurrentOrder = state.currentOrder?.id === action.payload.id
        ? { ...state.currentOrder, status: action.payload.status }
        : state.currentOrder;

      return {
        ...state,
        orders: updatedOrders,
        currentOrder: updatedCurrentOrder,
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
          return apiService.getPizzas();
        })
        .then((pizzas) => {
          console.log("Pizzas recarregadas:", pizzas);
        })
        .catch((error) => {
          console.error("Erro ao criar pizza no backend:", error);
        });

      return {
        ...state,
        pizzas: [...state.pizzas, action.payload],
      };

    case "UPDATE_PIZZA":
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

    case "ADD_ADDITIONAL":
      const additionalToCreate = {
        name: action.payload.name,
        description: action.payload.description,
        price: action.payload.price,
        category: action.payload.category,
      };

      apiService
        .createAdditional(additionalToCreate)
        .then((response) => {
          console.log("Adicional criado no backend:", response);
          return apiService.getAdditionals();
        })
        .then((additionals) => {
          console.log("Adicionais recarregados:", additionals);
        })
        .catch((error) => {
          console.error("Erro ao criar adicional no backend:", error);
        });

      return {
        ...state,
        additionals: [...state.additionals, action.payload],
      };

    case "UPDATE_ADDITIONAL":
      const additionalToUpdate = {
        name: action.payload.name,
        description: action.payload.description,
        price: action.payload.price,
        category: action.payload.category,
        isActive: action.payload.isActive,
      };

      apiService
        .updateAdditional(action.payload.id, additionalToUpdate)
        .then((response) => {
          console.log("Adicional atualizado no backend:", response);
        })
        .catch((error) => {
          console.error("Erro ao atualizar adicional no backend:", error);
        });

      return {
        ...state,
        additionals: state.additionals.map((additional) =>
          additional.id === action.payload.id ? action.payload : additional
        ),
      };

    case "DELETE_ADDITIONAL":
      apiService
        .deleteAdditional(action.payload)
        .then(() => {
          console.log("Adicional removido do backend");
        })
        .catch((error) => {
          console.error("Erro ao remover adicional do backend:", error);
        });

      return {
        ...state,
        additionals: state.additionals.filter((additional) => additional.id !== action.payload),
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
      saveBusinessSettings(updatedSettings);

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
      saveBusinessSettings(updatedBusinessSettings);

      apiService
        .updateBusinessSettings(updatedBusinessSettings)
        .catch((error) => {
          console.error("Erro ao salvar configurações no backend:", error);
        });

      return {
        ...state,
        businessSettings: updatedBusinessSettings,
      };

    case "UPDATE_BUSINESS_INFO":
      const updatedBusinessSettingsWithInfo = {
        ...state.businessSettings,
        businessInfo: action.payload,
      };
      saveBusinessSettings(updatedBusinessSettingsWithInfo);

      apiService
        .updateBusinessSettings(updatedBusinessSettingsWithInfo)
        .catch((error) => {
          console.error("Erro ao salvar informações do negócio no backend:", error);
        });

      return {
        ...state,
        businessSettings: updatedBusinessSettingsWithInfo,
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

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        console.log("🔄 Carregando dados do backend...");

        const pizzas = await apiService.getPizzas();
        console.log("✅ Pizzas carregadas:", pizzas.length);
        dispatch({ type: "SET_PIZZAS", payload: pizzas });

        const additionals = await apiService.getAdditionals();
        console.log("✅ Adicionais carregados:", additionals.length);
        dispatch({ type: "SET_ADDITIONALS", payload: additionals });

        const businessSettings = await apiService.getBusinessSettings();
        console.log("✅ Configurações carregadas");
        dispatch({ type: "LOAD_BUSINESS_SETTINGS", payload: businessSettings });

        if (localStorage.getItem("admin_authenticated") === "true") {
          try {
            const orders = await apiService.getOrders();
            console.log("✅ Pedidos carregados:", orders.length);
            dispatch({ type: "SET_ORDERS", payload: orders });
          } catch (error) {
            console.log("ℹ️ Não foi possível carregar pedidos (não autenticado)");
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

    const checkAuthChange = () => {
      if (
        localStorage.getItem("admin_authenticated") === "true" &&
        state.orders.length === 0
      ) {
        loadOrders();
      }
    };

    window.addEventListener("storage", checkAuthChange);

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
      }, 30000);
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