"use client";

import React from "react";
import CartItemCard from "./CartItemCard";
import { SaleItem } from "../../discount-engine/utils/types";

interface ShoppingCartProps {
  cart: SaleItem[];
  discountResult: any;
  onUpdateQuantity: (
    saleItemId: string,
    newDisplayQuantity: number,
    newDisplayUnit?: string
  ) => void;
  onOverrideDiscount: (item: SaleItem) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  discountResult,
  onUpdateQuantity,
  onOverrideDiscount,
}) => {
  const {
    originalSubtotal = 0,
    totalItemDiscount = 0,
    totalCartDiscount = 0,
    totalDiscount = 0,
    finalTotal = 0,
  } = discountResult || {};

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <CartItemCard
              key={item.saleItemId}
              item={item}
              discountResult={discountResult}
              onUpdateQuantity={onUpdateQuantity}
              onOverrideDiscount={onOverrideDiscount}
            />
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-dashed">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {originalSubtotal.toFixed(2)}</span>
            </div>

            {(totalItemDiscount > 0 || totalCartDiscount > 0) && (
              <div className="flex justify-between text-red-600">
                <span>Discounts</span>
                <span>- Rs. {totalDiscount.toFixed(2)}</span>
              </div>
            )}

            {totalItemDiscount > 0 && (
              <div className="flex justify-between pl-4 text-xs text-red-500">
                <span>- Item Discounts</span>
                <span>- Rs. {totalItemDiscount.toFixed(2)}</span>
              </div>
            )}

            {totalCartDiscount > 0 && (
              <div className="flex justify-between pl-4 text-xs text-red-500">
                <span>- Cart Discounts</span>
                <span>- Rs. {totalCartDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-2"></div>

            <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span>Rs. {finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;