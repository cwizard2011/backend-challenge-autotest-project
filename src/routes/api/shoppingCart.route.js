import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';
import Authenticator from '../../middlewares/authenticator';

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post('/shoppingcart/add', ShoppingCartController.addItemToCart);
router.put('/shoppingcart/update/:item_id', ShoppingCartController.updateItemInCart);
router.get('/shoppingcart/:cart_id', ShoppingCartController.getCart);
router.delete('/shoppingcart/empty/:cart_id', ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', ShoppingCartController.removeItemFromCart);
router.post('/orders', Authenticator.authenticateUser, ShoppingCartController.createOrder);
router.get('/orders/inCustomer', Authenticator.authenticateUser, ShoppingCartController.getCustomerOrders);
router.get(
  '/orders/:order_id',
  Authenticator.authenticateUser,
  ShoppingCartController.getOrderSummary
);
router.post('/stripe/charge', Authenticator.authenticateUser, ShoppingCartController.processStripePayment);

export default router;
