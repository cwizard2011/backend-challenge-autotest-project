import { Router } from 'express';
import CustomerController from '../../controllers/customer.controller';
import CustomerValidator from '../../middlewares/customerValidator';
import Authenticator from '../../middlewares/authenticator';

const router = Router();
router.post('/customers', CustomerValidator.validateSignUp, CustomerController.create);
router.post('/customers/login', CustomerValidator.validateLogin, CustomerController.login);
router.get('/customer', Authenticator.authenticateUser, CustomerController.getCustomerProfile);
router.put(
  '/customer',
  CustomerValidator.validateUpdateProfile,
  Authenticator.authenticateUser,
  CustomerController.updateCustomerProfile
);
router.put(
  '/customer/address',
  Authenticator.authenticateUser,
  CustomerController.updateCustomerAddress
);
router.put(
  '/customer/creditCard',
  Authenticator.authenticateUser,
  CustomerController.updateCreditCard
);
export default router;
