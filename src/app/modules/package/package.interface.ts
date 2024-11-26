export type IPackage = {
  category: 'Monthly' | 'Yearly' | 'HalfYearly';
  title: 'Gold' | 'Silver' | 'Discount';
  productId: string;
  price: string;
  limit: string;
  features: string[];
  // duration: 'Monthly' | 'Yearly' | 'HalfYearly';
};
