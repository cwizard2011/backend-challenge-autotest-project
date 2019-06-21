import { Router } from 'express';
import TaxController from '../../controllers/tax.controller';

const router = Router();


router.get('/tax', TaxController.getAllTax);
router.get('/tax/:tax_id', TaxController.getSingleTax);

export default router;
