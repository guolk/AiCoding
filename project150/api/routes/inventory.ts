import { Router, type Request, type Response } from 'express';
import { mockData } from '../../src/mock/data.js';
import type { Inventory, Shipment } from '../../shared/types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.inventory });
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  
  const item = mockData.inventory.find(i => i.id === id);
  if (item) {
    Object.assign(item, updates);
    item.updatedAt = new Date().toISOString().split('T')[0];
    res.json({ success: true, data: item });
  } else {
    res.status(404).json({ success: false, error: 'Inventory item not found' });
  }
});

router.get('/shipments', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.shipments });
});

router.post('/shipments', async (req: Request, res: Response): Promise<void> => {
  const newShipment: Partial<Shipment> = req.body;
  const shipment: Shipment = {
    id: `sh-new-${Date.now()}`,
    batchNo: newShipment.batchNo || `BATCH-${Date.now()}`,
    origin: newShipment.origin || '',
    destination: newShipment.destination || '',
    shippingMethod: newShipment.shippingMethod || '',
    departureDate: newShipment.departureDate || new Date().toISOString().split('T')[0],
    estimatedArrival: newShipment.estimatedArrival || '',
    actualArrival: newShipment.actualArrival,
    cost: newShipment.cost || 0,
    status: newShipment.status || 'pending',
    trackingNo: newShipment.trackingNo,
    notes: newShipment.notes,
    items: newShipment.items || [],
    createdAt: new Date().toISOString().split('T')[0],
  };
  mockData.shipments.unshift(shipment);
  res.json({ success: true, data: shipment });
});

router.put('/shipments/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, actualArrival } = req.body;
  
  const shipment = mockData.shipments.find(s => s.id === id);
  if (shipment) {
    shipment.status = status;
    if (actualArrival) {
      shipment.actualArrival = actualArrival;
    }
    res.json({ success: true, data: shipment });
  } else {
    res.status(404).json({ success: false, error: 'Shipment not found' });
  }
});

router.get('/planning', async (_req: Request, res: Response): Promise<void> => {
  const lowStockItems = mockData.inventory.filter(
    i => i.currentStock < i.safetyStock
  );
  
  const upcomingRestocks = mockData.shipments
    .filter(s => s.status === 'shipping')
    .map(s => ({
      ...s,
      items: s.items,
    }));
  
  const planning = {
    lowStockItems,
    upcomingRestocks,
    totalStockValue: mockData.inventory.reduce(
      (sum, inv) => {
        const product = mockData.products.find(p => p.id === inv.productId);
        return sum + inv.currentStock * (product?.cost || 0);
      },
      0
    ),
    avgDaysCoverage: +(
      mockData.inventory.reduce((sum, i) => sum + i.currentStock / Math.max(i.dailySalesRate, 0.1), 0) /
      mockData.inventory.length
    ).toFixed(1),
  };
  
  res.json({ success: true, data: planning });
});

export default router;
