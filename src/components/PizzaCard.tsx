import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, X, Clock } from "lucide-react";
import { Pizza } from "../types";
import { useApp } from "../contexts/AppContext";
import { pizzaSizeConfig } from "../data/pizzas";

interface PizzaCardProps {
  pizza: Pizza;
  businessOpen?: boolean;
}

const PizzaCard: React.FC<PizzaCardProps> = ({
  pizza,
  businessOpen = true,
}) => {
  const { state, dispatch } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<
    "small" | "medium" | "large" | "family"
  >("medium");
  const [selectedFlavors, setSelectedFlavors] = useState<Pizza[]>([pizza]);
  const [showFlavorModal, setShowFlavorModal] = useState(false);

  const getCurrentPrice = () => {
    return pizza.sizes[selectedSize] || 0;
  };

  const getSizeConfig = () => {
    if (pizza.category === "quadrada") {
      return pizzaSizeConfig.quadrada[
        selectedSize as keyof typeof pizzaSizeConfig.quadrada
      ];
    } else if (pizza.category === "redonda") {
      return pizzaSizeConfig.redonda[
        selectedSize as keyof typeof pizzaSizeConfig.redonda
      ];
    }
    return null;
  };

  const getAvailableSizes = () => {
    if (pizza.category === "quadrada") {
      return ["small", "medium", "large", "family"] as const;
    } else if (pizza.category === "redonda") {
      return ["small", "medium", "large", "family"] as const;
    } else {
      return ["medium"] as const;
    }
  };

  const getSizeLabel = (size: string) => {
    const labels = {
      small: "P",
      medium: "M",
      large: "G",
      family: "F",
    };
    return labels[size as keyof typeof labels];
  };

  const handleSizeChange = (size: "small" | "medium" | "large" | "family") => {
    setSelectedSize(size);
    setSelectedFlavors([pizza]); // Reset flavors when size changes
  };

  const handleFlavorSelection = (flavor: Pizza) => {
    const sizeConfig = getSizeConfig();
    if (!sizeConfig) return;

    const isAlreadySelected = selectedFlavors.some((f) => f.id === flavor.id);

    if (isAlreadySelected) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.id !== flavor.id));
    } else if (selectedFlavors.length < sizeConfig.maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleAddToCart = () => {
    if (!businessOpen) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload:
          "Não é possível fazer pedidos fora do horário de funcionamento!",
      });
      return;
    }

    if (selectedFlavors.length === 0) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: "Selecione pelo menos um sabor!",
      });
      return;
    }

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        ...pizza,
        quantity,
        selectedSize,
        selectedFlavors: [...selectedFlavors],
        price: getCurrentPrice(),
      },
    });

    const sizeConfig = getSizeConfig();
    const sizeLabel = sizeConfig?.name || selectedSize;
    const flavorNames = selectedFlavors.map((f) => f.name).join(", ");

    dispatch({
      type: "ADD_NOTIFICATION",
      payload: `Pizza ${sizeLabel} (${flavorNames}) adicionada ao carrinho!`,
    });

    setQuantity(1);
    setSelectedFlavors([pizza]);
    setShowFlavorModal(false);
  };

  const openFlavorModal = () => {
    if (!businessOpen) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload:
          "Não é possível fazer pedidos fora do horário de funcionamento!",
      });
      return;
    }

    const sizeConfig = getSizeConfig();
    if (sizeConfig && sizeConfig.maxFlavors > 1) {
      setShowFlavorModal(true);
    } else {
      handleAddToCart();
    }
  };

  const isBeverage = pizza.category === "bebida";
  const sizeConfig = getSizeConfig();
  const availablePizzas = state.pizzas.filter(
    (p) =>
      (p.category === "quadrada" || p.category === "redonda") &&
      p.category === pizza.category
  );

  return (
    <>
      {/* Mobile Layout (1 column) */}
      <div className="md:hidden bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex p-3 space-x-3">
          <div className="relative flex-shrink-0">
            <img
              src={pizza.image}
              alt={pizza.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="absolute -top-1 -right-1 bg-red-600 text-white px-1 py-0.5 rounded-full text-xs font-bold">
              {pizza.category === "quadrada"
                ? "Q"
                : pizza.category === "redonda"
                ? "R"
                : pizza.category === "doce"
                ? "D"
                : "B"}
            </div>
            {!businessOpen && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800 mb-1 truncate">
              {pizza.name}
            </h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {pizza.description}
            </p>

            <div className="text-right mb-2">
              <p className="text-lg font-bold text-red-600">
                R$ {getCurrentPrice().toFixed(2)}
              </p>
            </div>

            {!isBeverage && (
              <div className="mb-2">
                <div className="flex space-x-1 mb-1">
                  {getAvailableSizes().map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      disabled={!businessOpen}
                      className={`flex-1 px-1 py-1 rounded text-xs font-medium transition-colors ${
                        selectedSize === size
                          ? "bg-red-600 text-white"
                          : businessOpen
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {getSizeLabel(size)}
                    </button>
                  ))}
                </div>
                {sizeConfig && (
                  <p className="text-xs text-gray-500">
                    {sizeConfig.slices} fatias • {sizeConfig.maxFlavors} sabor
                    {sizeConfig.maxFlavors > 1 ? "es" : ""}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!businessOpen}
                  className={`rounded-full p-1 transition-colors ${
                    businessOpen
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="font-medium px-1 text-xs">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!businessOpen}
                  className={`rounded-full p-1 transition-colors ${
                    businessOpen
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={openFlavorModal}
                disabled={!businessOpen}
                className={`py-1 px-2 rounded-lg font-medium transition-colors flex items-center space-x-1 text-xs ${
                  businessOpen
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="h-3 w-3" />
                <span>
                  {sizeConfig && sizeConfig.maxFlavors > 1
                    ? "Escolher"
                    : "Adicionar"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (original) */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={pizza.image}
            alt={pizza.name}
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            {pizza.category === "quadrada"
              ? "Quadrada"
              : pizza.category === "redonda"
              ? "Redonda"
              : pizza.category}
          </div>
          {!businessOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Fechado</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{pizza.name}</h3>
          {/* <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {pizza.description}
          </p> */}

          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">Ingredientes:</p>
            <p className="text-xs text-gray-700 line-clamp-1">
              {pizza.ingredients.join(", ")}
            </p>
          </div>

          {!isBeverage && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tamanho:
              </label>
              <div className="flex space-x-1">
                {getAvailableSizes().map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    disabled={!businessOpen}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      selectedSize === size
                        ? "bg-red-600 text-white"
                        : businessOpen
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {getSizeLabel(size)}
                  </button>
                ))}
              </div>
              {sizeConfig && (
                <p className="text-xs text-gray-500 mt-1">
                  {sizeConfig.slices} fatias • {sizeConfig.maxFlavors} sabor
                  {sizeConfig.maxFlavors > 1 ? "es" : ""}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!businessOpen}
                className={`rounded-full p-1 transition-colors ${
                  businessOpen
                    ? "bg-gray-200 hover:bg-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="font-medium px-2 text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={!businessOpen}
                className={`rounded-full p-1 transition-colors ${
                  businessOpen
                    ? "bg-gray-200 hover:bg-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="text-right mb-2">
              <p className="text-xl font-bold text-red-600">
                R$ {getCurrentPrice().toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={openFlavorModal}
            disabled={!businessOpen}
            className={`w-full py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm ${
              businessOpen
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {sizeConfig && sizeConfig.maxFlavors > 1
                ? "Escolher"
                : "Adicionar"}
            </span>
          </button>
        </div>
      </div>

      {/* Flavor Selection Modal */}
      {showFlavorModal && sizeConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Escolha os Sabores
                </h3>
                <p className="text-gray-600 text-sm">
                  Selecione até {sizeConfig.maxFlavors} sabor
                  {sizeConfig.maxFlavors > 1 ? "es" : ""} para sua pizza{" "}
                  {sizeConfig.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFlavors.length}/{sizeConfig.maxFlavors} sabores
                  selecionados
                </p>
              </div>
              <button
                onClick={() => setShowFlavorModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Mobile Layout for Modal */}
              <div className="md:hidden space-y-3 mb-4">
                {availablePizzas.map((availablePizza) => {
                  const isSelected = selectedFlavors.some(
                    (f) => f.id === availablePizza.id
                  );
                  const canSelect =
                    selectedFlavors.length < sizeConfig.maxFlavors ||
                    isSelected;
                  const isDisabled = !canSelect;

                  return (
                    <div
                      key={availablePizza.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-red-500 bg-red-50"
                          : canSelect
                          ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                      } ${isDisabled ? "pointer-events-none" : ""}`}
                      onClick={() =>
                        canSelect && handleFlavorSelection(availablePizza)
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={availablePizza.image}
                          alt={availablePizza.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">
                            {availablePizza.name}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {availablePizza.description}
                          </p>

                          {isSelected && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                              ✓ Selecionado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Layout for Modal */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {availablePizzas.map((availablePizza) => {
                  const isSelected = selectedFlavors.some(
                    (f) => f.id === availablePizza.id
                  );
                  const canSelect =
                    selectedFlavors.length < sizeConfig.maxFlavors ||
                    isSelected;
                  const isDisabled = !canSelect;

                  return (
                    <div
                      key={availablePizza.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-red-500 bg-red-50"
                          : canSelect
                          ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                      } ${isDisabled ? "pointer-events-none" : ""}`}
                      onClick={() =>
                        canSelect && handleFlavorSelection(availablePizza)
                      }
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={availablePizza.image}
                          alt={availablePizza.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {availablePizza.name}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {availablePizza.description}
                          </p>
                          {isSelected && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowFlavorModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={selectedFlavors.length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PizzaCard;
