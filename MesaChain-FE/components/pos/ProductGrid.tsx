import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { posDB, Product, LineItem } from '@/lib/db';
import { Plus } from 'lucide-react';

interface ProductGridProps {
  onAddToCart: (item: LineItem) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await posDB.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    const lineItem: LineItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      total: product.price,
    };
    onAddToCart(lineItem);
  };

  return (
    <div className="p-4">
      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <Card 
            key={product.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm">{product.name}</h3>
                  {!product.available && (
                    <Badge variant="secondary" className="text-xs">
                      Out
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.available}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products available in this category
        </div>
      )}
    </div>
  );
}