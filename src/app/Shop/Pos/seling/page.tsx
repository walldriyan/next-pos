"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import { defaultDiscounts } from "../../discount-engine/utils/default-campaign";
import {
  DiscountSet,
  Product,
  ProductBatch,
  SaleItem,
} from "../../discount-engine/utils/types";
import { calculateDiscountsAction } from "./transaction.actions";
import { AuthGuard } from "@/app/(auth)/AuthGuard"; // උපකල්පනය: AuthGuard component එක තිබෙනවා.
import Link from "next/link";
import {
  Button,
  Card,
  Flex,
  Text,
  Heading,
  Box,
  Badge,
} from "@radix-ui/themes";
import { useSession } from "next-auth/react";
import SearchableProductInput, {
  SearchableProductInputRef,
} from "./SearchableProductInput";

import { sampleProducts } from "./data.js"; // data.js ගොනුවෙන් products import කරගැනීම

// ---------------------------------
import CampaignSelector from "./CampaignSelector";
import { allCampaigns } from "../../discount-engine/utils/my-campaigns";
import ShoppingCart from "./ShoppingCart";
import DiscountBehaviorPanel from "./DiscountBehaviorPanel";
import { CustomDiscountForm } from "./CustomDiscountForm";
import { useDrawer } from "@/app/components/UI/drawer/useDrawer";
import { TransactionDialogContent } from "./transaction/TransactionDialogContent";


const initialDiscountResult = {
  lineItems: [],
  totalItemDiscount: 0,
  totalCartDiscount: 0,
  appliedCartRules: [],
  originalSubtotal: 0,
  totalDiscount: 0,
  finalTotal: 0,
  getLineItem: (saleItemId: string) => undefined,
  getAppliedRulesSummary: () => [],
};

function page() {
  /*  
  *********************************************************************
    States
  *********************************************************************
  */
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [activeCampaign, setActiveCampaign] =
    useState<DiscountSet>(defaultDiscounts);
  const [transactionId, setTransactionId] = useState<string>("");
  const productSearchRef = useRef<SearchableProductInputRef>(null); // useRef import කළා
  //   const drawer = useDrawer();

  const [isCalculating, setIsCalculating] = useState(false);
  const [discountResult, setDiscountResult] = useState<any>(
    initialDiscountResult
  );

  // useSession hook එකෙන් session data ලබාගැනීම
  const { data: session } = useSession();
  const user = session?.user;
  /*  
  *********************************************************************
    create new bill id
  *********************************************************************
  */
  const createNewTransactionId = () => `txn-${Date.now()}`;

  useEffect(() => {
    setTransactionId(createNewTransactionId());
  }, []);

  /*  
  *********************************************************************
    recalculate discount when change
  *********************************************************************
  */

  useEffect(() => {
    const recalculate = async () => {
      if (cart.length === 0) {
        setDiscountResult(initialDiscountResult);
        return;
      }
      setIsCalculating(true);
      const result = await calculateDiscountsAction(cart, activeCampaign);
      if (result.success && result.data) {
        setDiscountResult({
          ...result.data,
          getLineItem: (saleItemId: string) =>
            result.data.lineItems.find(
              (li: any) => li.saleItemId === saleItemId
            ),

          getAppliedRulesSummary: () => result.data.appliedRulesSummary || [],
        });
      } else {
        toast.error("Discount Error", {
          description: result.error,
        });

        setDiscountResult(initialDiscountResult);
      }
      setIsCalculating(false);
    };

    recalculate();
  }, [cart, activeCampaign]); // `toast` function එක dependency array එකෙන් ඉවත් කළා.

  /*  
  *********************************************************************
    keybord focus 
  *********************************************************************
  */

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const isInteracting =
        target.closest(
          '[role="dialog"], [role="menu"], [data-radix-popper-content-wrapper]'
        ) !== null;

      if (isTyping || isInteracting) {
        return;
      }

      const isPrintableKey =
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;

      if (isPrintableKey) {
        if (productSearchRef.current) {
          productSearchRef.current.focusSearchInput();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  /*  
  *********************************************************************
    CartUpdate
  *********************************************************************
  */

  const handleCartUpdate = (
    saleItemId: string,
    newDisplayQuantity: number,
    newDisplayUnit?: string
  ) => {
    setCart((currentCart) => {
      const itemIndex = currentCart.findIndex(
        (item) => item.saleItemId === saleItemId
      );
      if (itemIndex === -1) return currentCart;

      const updatedCart = [...currentCart];
      const currentItem = updatedCart[itemIndex];

      // If the new quantity is zero or less, remove the item
      if (newDisplayQuantity <= 0) {
        updatedCart.splice(itemIndex, 1);
        return updatedCart;
      }

      const unitToUse = newDisplayUnit || currentItem.displayUnit;
      const allUnits = [
        { name: currentItem.units.baseUnit, conversionFactor: 1 },
        ...(currentItem.units.derivedUnits || []),
      ];
      const selectedUnitDefinition = allUnits.find((u) => u.name === unitToUse);
      const conversionFactor = selectedUnitDefinition?.conversionFactor || 1;

      // Calculate the new total quantity in the base unit
      const newBaseQuantity = newDisplayQuantity * conversionFactor;

      updatedCart[itemIndex] = {
        ...currentItem,
        displayUnit: unitToUse,
        displayQuantity: newDisplayQuantity,
        quantity: newBaseQuantity, // This is the total base unit quantity
      };

      return updatedCart;
    });
  };

  /*  
  *********************************************************************
    add to cart
  *********************************************************************
  */
  const addToCart = (product: Product, batch?: ProductBatch) => {
    setCart((currentCart) => {
      // For simplicity in this implementation, we will treat items with different batches as separate cart entries.
      // A more complex system might merge them or check stock across batches.
      const existingItemIndex = currentCart.findIndex(
        (item) => item.id === product.id && item.selectedBatchId === batch?.id
      );

      if (existingItemIndex !== -1) {
        // If item already exists, just increase its quantity by 1 base unit
        const existingItem = currentCart[existingItemIndex];
        const newDisplayQuantity = existingItem.displayQuantity + 1;
        const newBaseQuantity = existingItem.quantity + 1;

        return currentCart.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                displayQuantity: newDisplayQuantity,
                quantity: newBaseQuantity,
              }
            : item
        );
      } else {
        // If new, add it to the cart with default base unit quantities
        const saleItem: SaleItem = {
          ...product,
          saleItemId: `item-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          quantity: 1, // Total base units
          displayQuantity: 1, // Quantity of the selected unit
          displayUnit: product.units.baseUnit, // Default to base unit
          selectedBatchId: batch?.id,
          selectedBatch: batch,
          price: batch ? batch.sellingPrice : product.sellingPrice,
        };
        return [...currentCart, saleItem];
      }
    });
  };

  /*  
  *********************************************************************
    clearCart
  *********************************************************************
  */

  const clearCart = () => {
    setCart([]);
    setTransactionId(createNewTransactionId());
  };

  /*  
  *********************************************************************
    add to cart
  *********************************************************************
  */

  const handleApplyCustomDiscount = (
    saleItemId: string,
    type: "fixed" | "percentage",
    value: number,
    applyOnce: boolean
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.saleItemId === saleItemId) {
          return {
            ...item,
            customDiscountType: type,
            customDiscountValue: value,
            customApplyFixedOnce: applyOnce,
          };
        }
        return item;
      })
    );

    toast.success("Custom Discount Applied!", {
      description: `A custom ${type} discount of ${value} was applied to the item.`,
    });
  };

  /*  
  *********************************************************************
    add to cart
  *********************************************************************
  */

  const { openDrawer } = useDrawer();

  const openCustomDiscountDrawer = (item: SaleItem) => {
    openDrawer(<CustomDiscountForm item={item} onApplyDiscount={handleApplyCustomDiscount} />, {
      title: `Custom Discount for ${item.name}`,
      width: "w-1/3",
    });

  };

  /*  
  *********************************************************************
    add to cart
  *********************************************************************
  */

  const handleTransactionComplete = () => {
    // drawer.closeDrawer();
    // clearCart();
    // toast({
    //     title: "Transaction Complete!",
    //     description: "The cart has been cleared and a new transaction is ready.",
    // });
  };

  const openTransactionDrawer = () => {
     openDrawer(<TransactionDialogContent
          cart={cart}
          discountResult={discountResult}
          transactionId={transactionId}
          activeCampaign={activeCampaign}
          onTransactionComplete={handleTransactionComplete}
        />, {
      title: `Complete Transaction`,
      width: "w-1/2",
    });
  };

  /*  
  *********************************************************************
    add to cart
  *********************************************************************
  */

  /*  
  *********************************************************************
    add to cart
  *********************************************************************
  */
  // UI එක Radix UI components සහ Tailwind CSS class names යොදාගෙන නැවත සකස් කළා.
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <main className="lg:col-span-2 space-y-6">
          <Card>
            <Flex justify="between" align="start">
              <Box>
                <Heading as="h1" size="8" weight="bold" trim="start">
                  My New Shop
                </Heading>
                <Text as="p" color="gray" mt="1">
                  Welcome, {user?.name || "User"}! ({user?.role})
                </Text>
              </Box>
              <Flex gap="3" align="center">
                <AuthGuard>
                  <Link href="/history" passHref>
                    <Button variant="outline">View History</Button>
                  </Link>
                </AuthGuard>
                {/* <LogoutButton /> */}
              </Flex>
            </Flex>
            <Flex mt="4" justify="between" align="center">
              <Text size="2" color="gray">
                Transaction ID: {transactionId}
              </Text>
              {activeCampaign.isOneTimePerTransaction && (
                <Badge color="yellow">One-Time Campaign</Badge>
              )}
            </Flex>
            {isCalculating && (
              <Text size="2" color="blue" mt="2" className="animate-pulse">
                Calculating discounts...
              </Text>
            )}
          </Card>

          <AuthGuard>
            <Card>
              <Flex direction="column" gap="4">
                <CampaignSelector
                  activeCampaign={activeCampaign}
                  allCampaigns={allCampaigns}
                  onCampaignChange={setActiveCampaign}
                />

                <SearchableProductInput
                  ref={productSearchRef}
                  products={sampleProducts}
                  onProductSelect={addToCart}
                />

                <AuthGuard>
                  <Flex gap="3">
                    <Button onClick={clearCart} color="gray" variant="soft">
                      Clear Cart
                    </Button>
                    <Button
                      onClick={openTransactionDrawer}
                      disabled={cart.length === 0 || isCalculating}
                      color="green"
                    >
                      Complete Transaction
                    </Button>
                  </Flex>
                </AuthGuard>
              </Flex>
            </Card>
          </AuthGuard>
        </main>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 h-fit space-y-6">
          <ShoppingCart
            cart={cart}
            discountResult={discountResult}
            onUpdateQuantity={handleCartUpdate}
            onOverrideDiscount={openCustomDiscountDrawer}
          />

          <DiscountBehaviorPanel
            discountResult={discountResult}
            activeCampaign={activeCampaign}
            transactionId={transactionId}
          />

          {process.env.NODE_ENV === "development" &&
            discountResult.finalTotal > 0 && (
              <Card size="2" variant="surface">
                <Flex direction="column" gap="1">
                  <Heading as="h4" size="2" weight="medium" color="blue">
                    Debug Info:
                  </Heading>
                  <Text size="1" color="gray">
                    Original Subtotal: Rs.
                    {discountResult.originalSubtotal.toFixed(2)}
                  </Text>
                  <Text size="1" color="gray">
                    Item Discounts: Rs.
                    {discountResult.totalItemDiscount.toFixed(2)}
                  </Text>
                  <Text size="1" color="gray">
                    Cart Discounts: Rs.
                    {discountResult.totalCartDiscount.toFixed(2)}
                  </Text>
                  <Text size="1" color="gray">
                    Final Total: Rs.{discountResult.finalTotal.toFixed(2)}
                  </Text>
                  <Text size="1" color="gray">
                    Applied Rules:{" "}
                    {discountResult.getAppliedRulesSummary().length}
                  </Text>
                </Flex>
              </Card>
            )}
        </aside>
      </div>
    </div>
  );
}

export default page;
