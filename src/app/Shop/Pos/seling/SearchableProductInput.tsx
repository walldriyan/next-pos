
// src/components/POSUI/SearchableProductInput.tsx
"use client"

import * as React from "react"
import { PackageSearch } from "lucide-react"
import { useImperativeHandle } from "react";

// --- උපකල්පනය ---
// cmdk library එක import කර තිබූ තැන ඉවත් කළා.
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
// import { cn } from "@/lib/utils"

// --- උපකල්පනය ---
// ඔබගේ types file එක discount-engine එකේ ඇති බව උපකල්පනය කර ඇත.
import { type Product, type ProductBatch } from "../../discount-engine/utils/types";

// Flatten products and batches into a single list for the dropdown
type SearchableItem = {
  value: string;
  label: string;
  product: Product;
  batch?: ProductBatch;
  stock: number;
  price: number;
};

interface SearchableProductInputProps {
  products: Product[];
  onProductSelect: (product: Product, batch?: ProductBatch) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export interface SearchableProductInputRef {
  focusSearchInput: () => void;
}

const SearchableProductInput = React.forwardRef<SearchableProductInputRef, SearchableProductInputProps>(({
  products,
  onProductSelect,
  placeholder = "Select product or batch...",
  searchPlaceholder = "Search by name or barcode...",
  emptyText = "No product found."
}, ref) => {
  const [inputValue, setInputValue] = React.useState("");
  const [filteredItems, setFilteredItems] = React.useState<SearchableItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false); // New state for dropdown visibility

  // Expose a function to focus the input to the parent component
  useImperativeHandle(ref, () => ({
    focusSearchInput: () => {
      inputRef.current?.focus();
    }
  }));

  const searchableItems = React.useMemo(() => {
    const items: SearchableItem[] = [];
    products.forEach(p => {
      if (p.batches && p.batches.length > 0) {
        p.batches.forEach(b => {
          items.push({
            value: b.id.toLowerCase(), // Use batch ID as unique value
            label: `${p.name} (Batch: ${b.batchNumber})`,
            product: p,
            batch: b,
            stock: b.quantity,
            price: b.sellingPrice,
          });
        });
      } else {
        items.push({
          value: p.id.toLowerCase(), // Use product ID as unique value
          label: p.name,
          product: p,
          stock: p.stock,
          price: p.sellingPrice,
        });
      }
    });
    return items;
  }, [products]);


  const handleSelect = (selectedItem: SearchableItem) => {
    if (selectedItem) {
        onProductSelect(selectedItem.product, selectedItem.batch);
    }
    setInputValue(""); // Reset input after selection
    setIsDropdownOpen(false); // Close dropdown
    inputRef.current?.blur(); // Unfocus after selection
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setInputValue(search);
    if (search.length > 0) {
      setFilteredItems(
        searchableItems.filter(item =>
          item.label.toLowerCase().includes(search.toLowerCase())
        )
      );
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredItems.length > 0) {
      handleSelect(filteredItems[0]); // Select the first item on Enter
      e.preventDefault(); // Prevent form submission if input is part of a form
    } else if (e.key === "Escape") {
      setInputValue("");
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Use a short timeout to allow click events on the dropdown to register
    setTimeout(() => {
      if (!e.relatedTarget || !e.relatedTarget.closest(".product-search-dropdown")) {
        setIsDropdownOpen(false);
      }
    }, 150);
  };

  return (
     <div className="relative"> {/* Replaced Command with a div */}
        <div className="relative">
            <input // Replaced CommandInput with input
                ref={inputRef}
                type="text"
                id="global-product-search-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={searchPlaceholder}
                className="h-12 w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 text-base shadow-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        {isDropdownOpen && (
            <ul className="product-search-dropdown absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <li
                            key={item.value}
                            onMouseDown={() => handleSelect(item)} // Use onMouseDown to prevent blur event from firing first
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        >
                            <div className="flex w-full justify-between">
                                <div className="flex flex-col">
                                <span className="font-medium">{item.label}</span>
                                <span className="text-xs text-gray-500">Stock: {item.stock} units</span>
                                </div>
                                <span className="font-semibold">Rs. {item.price.toFixed(2)}</span>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-sm text-gray-500">{emptyText}</li>
                )}
            </ul>
        )}
    </div>
  )
});

SearchableProductInput.displayName = "SearchableProductInput";

export default SearchableProductInput;
