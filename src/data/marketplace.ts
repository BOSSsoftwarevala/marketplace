export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  masterCategory?: string;
  price: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  url?: string;
  icon?: any;
  discountPrice?: string;
  status?: string;
  features?: string[];
  frontend?: string;
  backend?: string;
  color?: string;
}

export const allMarketplaceProducts: MarketplaceProduct[] = [];
export const totalProductCount = allMarketplaceProducts.length;

export default allMarketplaceProducts;