/**
 * @jest-environment jsdom
 */

import { createOrder, addPaymentIntent } from '../lib/services/orderservice';
import { getDB } from '../lib/db';

describe('POS Offline Logic ', () => {
  beforeEach(async () => {
    const db = await getDB();
    const tx = db.transaction(['orders', 'LineItems', 'PaymentIntent'], 'readwrite');
    await tx.objectStore('orders').clear();
    await tx.objectStore('LineItems').clear();
    await tx.objectStore('PaymentIntent').clear();
    await tx.done;
  });

  test('debe bloquear la orden al completar el pago', async () => {
    const order = await createOrder(
      { totalAmount: 100, customerName: 'Test MVP' },
      [{ name: 'Coffee', price: 100, quantity: 1, menuItemId: '1' }],
      'cash'
    );

    await addPaymentIntent(order.id, 100, 'cash');

    const db = await getDB();
    const savedOrder = await db.get('orders', order.id);
    
    expect(savedOrder?.isLocked).toBe(true);
    expect(savedOrder?.paymentStatus).toBe('paid');
  });
});