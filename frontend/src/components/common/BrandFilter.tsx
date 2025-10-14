// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface Brand {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

interface BrandFilterProps {
  allBrands: Brand[];
  selectedBrands: string[];
  onBrandsChange: (brandIds: string[]) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  allBrands,
  selectedBrands,
  onBrandsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleBrand = (brandId: string) => {
    // Prevent deselecting the last brand
    if (selectedBrands.length === 1 && selectedBrands.includes(brandId)) {
      return;
    }

    const newSelection = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId];

    onBrandsChange(newSelection);
  };

  const selectAll = () => {
    onBrandsChange(allBrands.map(b => b.id));
  };

  const clearAll = () => {
    // Keep at least one brand selected
    if (allBrands.length > 0) {
      onBrandsChange([allBrands[0].id]);
    }
  };

  const isAllSelected = selectedBrands.length === allBrands.length;
  const selectedCount = selectedBrands.length;
  const totalCount = allBrands.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          Brands ({selectedCount}/{totalCount})
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Filter by Brand</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Brand List */}
          <div className="max-h-80 overflow-y-auto py-2">
            {allBrands.map((brand) => {
              const isSelected = selectedBrands.includes(brand.id);
              const isOnlyOne = selectedBrands.length === 1 && isSelected;

              return (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  disabled={isOnlyOne}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    isOnlyOne ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Brand Info */}
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <span className="text-2xl">{brand.logo}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                      <p className="text-xs text-gray-500">{brand.industry}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
            <button
              onClick={selectAll}
              disabled={isAllSelected}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isAllSelected
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              disabled={selectedBrands.length <= 1}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedBrands.length <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandFilter;
