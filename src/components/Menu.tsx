import React, { useState } from "react";
import { Search, X } from "lucide-react";
import PizzaCard from "./PizzaCard";
import BeverageSuggestions from "./BeverageSuggestions";
import PromotionBanner from "./PromotionBanner";
import Footer from "./Footer";
import { useApp } from "../contexts/AppContext";

const Menu: React.FC = () => {
  const { state } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "Todas" },
    { id: "quadrada", name: "Pizza Quadrada" },
    { id: "redonda", name: "Pizza Redonda" },
    { id: "doce", name: "Pizzas Doces" },
    { id: "bebida", name: "Bebidas" },
  ];

  // Filtrar pizzas por categoria e termo de busca
  const filteredPizzas = state.pizzas.filter((pizza) => {
    const matchesCategory = selectedCategory === "all" || pizza.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizza.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizza.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "quadrada":
        return "🟨";
      case "redonda":
        return "🔴";
      case "doce":
        return "🍰";
      case "bebida":
        return "🥤";
      default:
        return "";
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "quadrada":
        return "Pizzas Quadradas";
      case "redonda":
        return "Pizzas Redondas";
      case "doce":
        return "Pizzas Doces";
      case "bebida":
        return "Bebidas";
      default:
        return "";
    }
  };

  // Check if business is open
  const isBusinessOpen = () => {
    if (!state.businessSettings.isOpen) return false;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const currentTime = now.toTimeString().slice(0, 5);

    // Mapear dia da semana para nome
    const dayNames = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const todayName = dayNames[currentDay];

    const todaySettings = state.businessSettings.businessHours.find(
      (day) => day.day === todayName
    );

    if (!todaySettings || !todaySettings.isOpen) return false;

    // Converter horários para minutos para comparação mais fácil
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutes = timeToMinutes(currentTime);
    const openMinutes = timeToMinutes(todaySettings.openTime);
    const closeMinutes = timeToMinutes(todaySettings.closeTime);

    // Se o horário de fechamento é menor que o de abertura, significa que fecha no dia seguinte
    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    } else {
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }
  };

  const businessOpen = isBusinessOpen();

  const renderCategorizedMenu = () => {
    const categoriesOrder = ["quadrada", "redonda", "doce", "bebida"];

    return (
      <div className="space-y-8">
        {categoriesOrder.map((category) => {
          const categoryPizzas = filteredPizzas.filter(
            (pizza) => pizza.category === category
          );

          if (categoryPizzas.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getCategoryIcon(category)}</span>
                <h3 className="text-2xl font-bold text-gray-800">
                  {getCategoryTitle(category)}
                </h3>
              </div>
              <div className="h-px bg-gradient-to-r from-red-200 via-red-400 to-red-200"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {categoryPizzas.map((pizza) => (
                  <PizzaCard
                    key={pizza.id}
                    pizza={pizza}
                    businessOpen={businessOpen}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Banner de Promoção */}
        <PromotionBanner />

        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Nosso Cardápio
          </h3>

          {/* Business Status */}
          {!businessOpen && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🔴</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium"></p>
                  <p className="text-sm text-red-700">
                    {state.businessSettings.closedMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {businessOpen && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-sm mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🟢</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium"></p>
                  <p className="text-sm text-green-700">
                    Horário de funcionamento hoje:{" "}
                    {(() => {
                      const now = new Date();
                      const currentDay = now.getDay();
                      const dayNames = [
                        "Domingo",
                        "Segunda-feira",
                        "Terça-feira",
                        "Quarta-feira",
                        "Quinta-feira",
                        "Sexta-feira",
                        "Sábado",
                      ];
                      const todayName = dayNames[currentDay];
                      const todaySettings =
                        state.businessSettings.businessHours.find(
                          (day) => day.day === todayName
                        );
                      return todaySettings
                        ? `${todaySettings.openTime} às ${todaySettings.closeTime}`
                        : "Fechado";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informações destacadas */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-gray-800 mb-2"></p>
              <p>
                <span className="font-medium">🟨 Pizza Quadrada:</span>{" "}
                <b>Pequena</b> (4 fatias, 2 sabores) • <b>Média</b> (4 fatias, 2
                sabores) • <b>Grande</b> (12 fatias, 2 sabores) • <b>Família</b>{" "}
                (16 fatias, 4 sabores)
              </p>
              <p>
                <span className="font-medium">🔴 Pizza Redonda:</span>{" "}
                <b>Pequena</b> (4 fatias, 1 sabor) • <b>Média</b> (6 fatias, 2
                sabores) • <b>Grande</b> (8 fatias, 3 sabores) • <b>Família</b>{" "}
                (12 fatias, 3 sabores)
              </p>
            </div>
          </div>
        </div>

        {/* Campo de Pesquisa */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pizzas, ingredientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados da Busca */}
        {searchTerm && (
          <div className="mb-4 text-center">
            <p className="text-gray-600">
              {filteredPizzas.length > 0 
                ? `${filteredPizzas.length} resultado(s) encontrado(s) para "${searchTerm}"`
                : `Nenhum resultado encontrado para "${searchTerm}"`
              }
            </p>
          </div>
        )}

        {/* Menu */}
        {selectedCategory === "all" && !searchTerm ? (
          renderCategorizedMenu()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredPizzas.map((pizza) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                businessOpen={businessOpen}
              />
            ))}
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {filteredPizzas.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Tente buscar por outros termos ou navegue pelas categorias
            </p>
            <button
              onClick={clearSearch}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Limpar Busca
            </button>
          </div>
        )}

        <BeverageSuggestions />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Menu;