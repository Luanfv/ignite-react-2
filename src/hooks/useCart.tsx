import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const foundProduct = cart.find((product) => product.id === productId);

      if (!!foundProduct) {
        const responseStock = await api.get(`/stock/${productId}`);
        const stock = responseStock.data as Stock;

        if (foundProduct.amount + 1 > stock.amount) {
          throw Error();
        }
        
        const updatedCart = cart.map((product) => {
          if (product.id === foundProduct.id) {
            return { ...product, amount: product.amount + 1 };
          }

          return product;
        }) as Product[];

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
        setCart(updatedCart);
      
        return;
      }

      const response = await api.get(`/products/${productId}`);
      const product = response.data as Product;

      const formatedProduct = { ...product, amount: 1 };
      const updatedCart = [...cart, formatedProduct] as Product[];

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      // TODO
      toast.error('Quantidade solicitada fora de estoque');
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const foundProduct = cart.find((product) => product.id === productId);

      if (!foundProduct) {
        throw Error();
      }

      const updatedCart = cart.filter((product) => product.id !== productId);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const response = await api.get(`/stock/${productId}`);
      const stock = response.data as Stock;

      const updatedCart = cart.map((product) => {
        if (product.id === productId) {
          if (amount > stock.amount) {
            throw Error();
          }

          if (amount < 1) {
            throw Error();
          }

          return { ...product, amount };
        }

        return product;
      });

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      // TODO
      toast.error('Quantidade solicitada fora de estoque');
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
