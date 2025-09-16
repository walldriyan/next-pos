// Typescript syntax (ProductBatch, Product) JavaScript ගොනුවකදී භාවිතා කළ නොහැකි නිසා,
// මම ඒවා ඉවත් කරලා, data ටික export කරනවා.

const oldBatch = {
  id: 't-shirt-batch-old',
  batchNumber: 'OLD-2023',
  sellingPrice: 2000,
  costPrice: 1500,
  quantity: 100,
  productId: 't-shirt-01',
};

const newBatch = {
  id: 't-shirt-batch-new',
  batchNumber: 'NEW-2024',
  sellingPrice: 2500,
  costPrice: 1800,
  quantity: 100,
  productId: 't-shirt-01',
};

const jeansOldBatch = {
  id: 'jeans-batch-old',
  batchNumber: 'JEANS-OLD-2023',
  sellingPrice: 7000,
  costPrice: 4000,
  quantity: 50,
  productId: 'jeans-01',
};

const jeansNewBatch = {
  id: 'jeans-batch-new',
  batchNumber: 'JEANS-NEW-2024',
  sellingPrice: 8000,
  costPrice: 5000,
  quantity: 30,
  productId: 'jeans-01',
};

// වෙනත් ගොනුවකදී භාවිතා කිරීමට හැකි වන පරිදි `sampleProducts` array එක export කිරීම.
export const sampleProducts = [
  {
    id: 't-shirt-01',
    name: 'T-Shirt',
    sellingPrice: 2500,
    batches: [oldBatch, newBatch],
    category: 'Apparel',
    units: {
      baseUnit: 'piece',
      derivedUnits: [
        { name: 'dozen', conversionFactor: 12 },
        { name: 'box', conversionFactor: 48 },
      ],
    },
    stock: 200,
    defaultQuantity: 1,
    isActive: true,
    isService: false,
  },
  {
    id: 'jeans-01',
    name: 'Jeans',
    sellingPrice: 8000,
    batches: [jeansOldBatch, jeansNewBatch],
    category: 'Apparel',
    units: { baseUnit: 'piece' },
    stock: 80,
    defaultQuantity: 1,
    isActive: true,
    isService: false,
  },
  {
    id: 'sugar-01',
    name: 'Sugar',
    sellingPrice: 2, // Price per gram
    category: 'Groceries',
    units: {
      baseUnit: 'g',
      derivedUnits: [
        { name: 'kg', conversionFactor: 1000 },
        { name: '5kg pack', conversionFactor: 5000 },
      ],
    },
    stock: 100000, // 100kg in grams
    defaultQuantity: 1,
    isActive: true,
    isService: false,
  },
];