export type IPackage = {
  category: 'Monthly' | 'Yearly' | 'HalfYearly';
  title: 'Gold' | 'Silver' | 'Discount';
  price: string;
  features: string[];
  // duration: 'Monthly' | 'Yearly' | 'HalfYearly';
};
