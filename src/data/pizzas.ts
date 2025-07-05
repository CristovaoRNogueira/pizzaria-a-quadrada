import { Pizza } from '../types';

export const pizzas: Pizza[] = [
  // Pizzas Quadradas
  {
    id: '1',
    name: 'Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    price: 35.00,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'quadrada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão', 'Azeite'],
    sizes: {
      small: 35.00,
      medium: 35.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '2',
    name: 'Pepperoni',
    description: 'Molho de tomate, mussarela e fatias de pepperoni',
    price: 35.00,
    image: 'https://images.pexels.com/photos/845798/pexels-photo-845798.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'quadrada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Pepperoni'],
    sizes: {
      small: 35.00,
      medium: 35.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '3',
    name: 'Quattro Stagioni',
    description: 'Molho de tomate, mussarela, presunto, cogumelos, azeitonas e alcachofra',
    price: 35.00,
    image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'quadrada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Presunto', 'Cogumelos', 'Azeitonas', 'Alcachofra'],
    sizes: {
      small: 35.00,
      medium: 35.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '4',
    name: 'Frango com Catupiry',
    description: 'Molho de tomate, mussarela, frango desfiado e catupiry',
    price: 35.00,
    image: 'https://images.pexels.com/photos/4193513/pexels-photo-4193513.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'quadrada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Frango desfiado', 'Catupiry'],
    sizes: {
      small: 35.00,
      medium: 35.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '5',
    name: 'Portuguesa',
    description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitonas',
    price: 35.00,
    image: 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'quadrada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Presunto', 'Ovos', 'Cebola', 'Azeitonas'],
    sizes: {
      small: 35.00,
      medium: 35.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '6',
    name: 'Calabresa',
    description: 'Molho de tomate, mussarela, calabresa e cebola',
    price: 35.00,
    image: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'quadrada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Calabresa', 'Cebola'],
    sizes: {
      small: 35.00,
      medium: 35.00,
      large: 55.00,
      family: 65.00
    }
  },

  // Pizzas Redondas
  {
    id: '7',
    name: 'Margherita Redonda',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    price: 35.00,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'redonda',
    ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão', 'Azeite'],
    sizes: {
      small: 35.00,
      medium: 45.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '8',
    name: 'Pepperoni Redonda',
    description: 'Molho de tomate, mussarela e fatias de pepperoni',
    price: 35.00,
    image: 'https://images.pexels.com/photos/845798/pexels-photo-845798.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'redonda',
    ingredients: ['Molho de tomate', 'Mussarela', 'Pepperoni'],
    sizes: {
      small: 35.00,
      medium: 45.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '9',
    name: 'Frango com Catupiry Redonda',
    description: 'Molho de tomate, mussarela, frango desfiado e catupiry',
    price: 35.00,
    image: 'https://images.pexels.com/photos/4193513/pexels-photo-4193513.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'redonda',
    ingredients: ['Molho de tomate', 'Mussarela', 'Frango desfiado', 'Catupiry'],
    sizes: {
      small: 35.00,
      medium: 45.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '10',
    name: 'Portuguesa Redonda',
    description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitonas',
    price: 35.00,
    image: 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'redonda',
    ingredients: ['Molho de tomate', 'Mussarela', 'Presunto', 'Ovos', 'Cebola', 'Azeitonas'],
    sizes: {
      small: 35.00,
      medium: 45.00,
      large: 55.00,
      family: 65.00
    }
  },

  // Pizzas Doces
  {
    id: '11',
    name: 'Brigadeiro',
    description: 'Chocolate, leite condensado e granulado',
    price: 35.00,
    image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'doce',
    ingredients: ['Chocolate', 'Leite condensado', 'Granulado'],
    sizes: {
      small: 35.00,
      medium: 45.00,
      large: 55.00,
      family: 65.00
    }
  },
  {
    id: '12',
    name: 'Nutella com Morango',
    description: 'Nutella, morangos frescos e açúcar de confeiteiro',
    price: 35.00,
    image: 'https://images.pexels.com/photos/7525161/pexels-photo-7525161.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'doce',
    ingredients: ['Nutella', 'Morangos frescos', 'Açúcar de confeiteiro'],
    sizes: {
      small: 35.00,
      medium: 45.00,
      large: 55.00,
      family: 65.00
    }
  },

  // Bebidas
  {
    id: '13',
    name: 'Coca-Cola 350ml',
    description: 'Refrigerante Coca-Cola gelado',
    price: 5.50,
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'bebida',
    ingredients: ['Refrigerante'],
    sizes: {
      medium: 5.50,
      large: 5.50,
      family: 5.50
    }
  },
  {
    id: '14',
    name: 'Guaraná Antarctica 350ml',
    description: 'Refrigerante Guaraná Antarctica gelado',
    price: 5.50,
    image: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'bebida',
    ingredients: ['Refrigerante'],
    sizes: {
      medium: 5.50,
      large: 5.50,
      family: 5.50
    }
  },
  {
    id: '15',
    name: 'Suco de Laranja 500ml',
    description: 'Suco natural de laranja',
    price: 8.90,
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'bebida',
    ingredients: ['Suco natural'],
    sizes: {
      medium: 8.90,
      large: 8.90,
      family: 8.90
    }
  },
  {
    id: '16',
    name: 'Água Mineral 500ml',
    description: 'Água mineral natural gelada',
    price: 3.50,
    image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'bebida',
    ingredients: ['Água mineral'],
    sizes: {
      medium: 3.50,
      large: 3.50,
      family: 3.50
    }
  }
];

export const pizzaSizeConfig = {
  quadrada: {
    small: { name: 'Pequena', slices: 4, maxFlavors: 2, price: 35.00 },
    medium: { name: 'Média', slices: 4, maxFlavors: 2, price: 35.00 },
    large: { name: 'Grande', slices: 12, maxFlavors: 2, price: 55.00 },
    family: { name: 'Família', slices: 16, maxFlavors: 4, price: 65.00 }
  },
  redonda: {
    small: { name: 'Pequena', slices: 4, maxFlavors: 1, price: 35.00 },
    medium: { name: 'Média', slices: 6, maxFlavors: 2, price: 45.00 },
    large: { name: 'Grande', slices: 8, maxFlavors: 3, price: 55.00 },
    family: { name: 'Família', slices: 12, maxFlavors: 3, price: 65.00 }
  }
};