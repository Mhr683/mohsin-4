export interface SupplierInventoryItem {
  productId: string;
  sku: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  stockQuantity: number;
  supplierCostPKR: number;
  isAvailable: boolean;
  lowStockAlert: boolean;
  lastSyncTime: string;
  syncSource: 'MANUAL' | 'CSV_BATCH' | 'API_WEBHOOK';
}

class SupplierInventoryService {
  private inventory: Map<string, SupplierInventoryItem> = new Map();

  constructor() {
    this.seedInitialInventory();
  }

  private seedInitialInventory() {
    const seed: SupplierInventoryItem[] = [
      {
        productId: 'prod-1',
        sku: 'EAR-M90-BLK',
        productName: 'M90 Pro TWS Wireless Earbuds Gaming Headset',
        supplierId: 'sup-1',
        supplierName: 'Al-Madina Electronics Wholesale (Karachi)',
        stockQuantity: 145,
        supplierCostPKR: 850,
        isAvailable: true,
        lowStockAlert: false,
        lastSyncTime: new Date().toISOString(),
        syncSource: 'CSV_BATCH'
      },
      {
        productId: 'prod-2',
        sku: 'TRM-T9-GLD',
        productName: 'T9 Vintage Professional Hair & Beard Trimmer',
        supplierId: 'sup-2',
        supplierName: 'Lahore Sourcing Hub & Importers',
        stockQuantity: 88,
        supplierCostPKR: 1100,
        isAvailable: true,
        lowStockAlert: false,
        lastSyncTime: new Date().toISOString(),
        syncSource: 'API_WEBHOOK'
      },
      {
        productId: 'prod-3',
        sku: 'BLD-PORT-6B',
        productName: '6-Blade Portable USB Rechargeable Juicer Blender',
        supplierId: 'sup-1',
        supplierName: 'Al-Madina Electronics Wholesale (Karachi)',
        stockQuantity: 0,
        supplierCostPKR: 980,
        isAvailable: false,
        lowStockAlert: true,
        lastSyncTime: new Date(Date.now() - 3600 * 1000).toISOString(),
        syncSource: 'MANUAL'
      }
    ];

    seed.forEach((item) => this.inventory.set(item.productId, item));
  }

  getInventoryItem(productId: string): SupplierInventoryItem | undefined {
    return this.inventory.get(productId);
  }

  getAllInventory(): SupplierInventoryItem[] {
    return Array.from(this.inventory.values());
  }

  isProductOrderable(productId: string, requestedQuantity: number = 1): { canOrder: boolean; reason?: string } {
    const item = this.inventory.get(productId);
    if (!item) {
      // If no inventory restriction tracked, allow by default
      return { canOrder: true };
    }

    if (!item.isAvailable || item.stockQuantity <= 0) {
      return {
        canOrder: false,
        reason: `Item "${item.productName}" is currently OUT OF STOCK at manufacturer warehouse (${item.supplierName}).`
      };
    }

    if (item.stockQuantity < requestedQuantity) {
      return {
        canOrder: false,
        reason: `Only ${item.stockQuantity} unit(s) available in stock (Requested: ${requestedQuantity}).`
      };
    }

    return { canOrder: true };
  }

  updateStockManually(productId: string, newStock: number, newCostPKR?: number): SupplierInventoryItem {
    let item = this.inventory.get(productId);
    if (!item) {
      item = {
        productId,
        sku: `SKU-${productId}`,
        productName: 'Product',
        supplierId: 'sup-1',
        supplierName: 'Wholesale Supplier',
        stockQuantity: newStock,
        supplierCostPKR: newCostPKR || 1000,
        isAvailable: newStock > 0,
        lowStockAlert: newStock <= 10,
        lastSyncTime: new Date().toISOString(),
        syncSource: 'MANUAL'
      };
    } else {
      item.stockQuantity = newStock;
      if (newCostPKR !== undefined) item.supplierCostPKR = newCostPKR;
      item.isAvailable = newStock > 0;
      item.lowStockAlert = newStock <= 10;
      item.lastSyncTime = new Date().toISOString();
      item.syncSource = 'MANUAL';
    }

    this.inventory.set(productId, item);
    return item;
  }

  batchUpdateFromCsv(rows: { sku: string; stock: number; cost?: number }[]): { updatedCount: number } {
    let count = 0;
    rows.forEach((row) => {
      for (const [prodId, item] of this.inventory.entries()) {
        if (item.sku.toLowerCase() === row.sku.toLowerCase()) {
          item.stockQuantity = row.stock;
          if (row.cost) item.supplierCostPKR = row.cost;
          item.isAvailable = row.stock > 0;
          item.lowStockAlert = row.stock <= 10;
          item.lastSyncTime = new Date().toISOString();
          item.syncSource = 'CSV_BATCH';
          count++;
          break;
        }
      }
    });
    return { updatedCount: count };
  }
}

export const supplierInventoryService = new SupplierInventoryService();
