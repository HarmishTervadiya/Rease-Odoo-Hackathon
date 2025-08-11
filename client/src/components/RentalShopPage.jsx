import React from "react";
import {
  ProductCard,
  Filters,
  ShopHeader,
  Pagination,
} from "./AllShopComponents"; // Assuming components are exported from a single file

const RentalShopPage = () => {
  const mockProducts = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Product Name ${i + 1}`,
    price: 70.0,
  }));

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <Filters />
      <div className="flex-1">
        <ShopHeader />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Pagination />
      </div>
    </div>
  );
};

export { RentalShopPage };
