export type IPackage = {
  category: 'Gold' | 'Silver' | 'Discount';
  price: string;
  features: string[];
  duration: 'Monthly' | 'Yearly' | 'HaflYearly';
  status: 'active' | 'delete';
};
