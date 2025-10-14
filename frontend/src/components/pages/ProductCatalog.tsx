// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, Edit, Trash2, Eye, DollarSign, Tag } from 'lucide-react';

interface ProductCatalogProps {
  selectedBrands?: string[];
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ selectedBrands = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Map project names to brand IDs for filtering
  const projectToBrandMap: { [key: string]: string } = {
    'SweetNight': 'sweetnight',
    'Eufy': 'eufy',
    'Hisense': 'hisense'
  };

  const allProducts = [
    {
      id: 1,
      name: 'SweetNight CoolNest Mattress',
      sku: 'SN-CN-QUEEN',
      project: 'SweetNight',
      category: 'Mattress',
      price: 899.99,
      stock: 45,
      status: 'active',
      image: '🛏️'
    },
    {
      id: 2,
      name: 'SweetNight Luxury Pillow',
      sku: 'SN-LP-STD',
      project: 'SweetNight',
      category: 'Bedding',
      price: 59.99,
      stock: 120,
      status: 'active',
      image: '🪶'
    },
    {
      id: 3,
      name: 'Eufy X10 Pro Omni',
      sku: 'EF-X10P-BLK',
      project: 'Eufy',
      category: 'Robot Vacuum',
      price: 799.99,
      stock: 32,
      status: 'active',
      image: '🤖'
    },
    {
      id: 4,
      name: 'Eufy Clean Station',
      sku: 'EF-CS-WHT',
      project: 'Eufy',
      category: 'Accessory',
      price: 149.99,
      stock: 78,
      status: 'active',
      image: '🧹'
    },
    {
      id: 5,
      name: 'Hisense U8K 65" QLED TV',
      sku: 'HS-U8K-65',
      project: 'Hisense',
      category: 'Television',
      price: 1299.99,
      stock: 18,
      status: 'active',
      image: '📺'
    },
    {
      id: 6,
      name: 'Hisense Soundbar',
      sku: 'HS-SB-300',
      project: 'Hisense',
      category: 'Audio',
      price: 249.99,
      stock: 56,
      status: 'low_stock',
      image: '🔊'
    }
  ];

  // Filter products based on selected brands and search query
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Brand filtering
    if (selectedBrands && selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        const brandId = projectToBrandMap[product.project];
        return selectedBrands.includes(brandId);
      });
    }

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedBrands, searchQuery, allProducts]);

  // Statistics based on filtered products
  const products = filteredProducts;

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      low_stock: 'bg-yellow-100 text-yellow-700',
      out_of_stock: 'bg-red-100 text-red-700',
      discontinued: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">Manage products across all projects</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Bulk Edit
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Total Products</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Total Value</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">In Stock</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {products.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Low Stock</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {products.filter(p => p.status === 'low_stock').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-gray-700 flex-1"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery
                ? `No products found matching "${searchQuery}"`
                : 'No products match the selected brands'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-6xl">{product.image}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                {product.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-3">SKU: {product.sku}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">{product.category}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                {product.project}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-lg font-bold text-gray-900">${product.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock</span>
                <span className={`font-semibold ${product.stock < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {product.stock} units
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Edit className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
