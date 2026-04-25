import { Product as IProduct } from '../types';

export class Product implements IProduct {
  public id: string;
  public name: string;
  public price: number;
  public stock: number;
  public sku: string;
  public category?: string;

  constructor(
    id: string,
    name: string,
    price: number,
    stock: number,
    sku: string,
    category?: string
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.sku = sku;
    this.category = category;
  }

  static create(data: Partial<IProduct> & { id: string; name: string; price: number; stock: number; sku: string }): Product {
    return new Product(
      data.id,
      data.name,
      data.price,
      data.stock,
      data.sku,
      data.category
    );
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity && quantity > 0;
  }

  reduceStock(quantity: number): number {
    if (!this.hasStock(quantity)) {
      throw new Error(`Insufficient stock for product ${this.id}. Available: ${this.stock}, Requested: ${quantity}`);
    }
    this.stock -= quantity;
    return this.stock;
  }

  addStock(quantity: number): number {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    this.stock += quantity;
    return this.stock;
  }

  toJSON(): IProduct {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      stock: this.stock,
      sku: this.sku,
      category: this.category
    };
  }
}
