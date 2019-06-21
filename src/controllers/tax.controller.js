import { Tax, sequelize } from '../database/models';

class TaxController {
  /**
   * This method get all taxes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllTax(req, res, next) {
    try {
      const allTax = await Tax.findAll();
      return res.status(200).json(allTax)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * This method gets a single tax using the tax id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleTax(req, res, next) {
    const { tax_id } = req.params;
    try {
      const tax = await Tax.findByPk(tax_id);
      if (!tax) {
        return res.status(404).json({
          error: {
            status: 404,
            message: `Tax with tax id ${tax_id} not found`
          }
        })
      }
      return res.status(200).json(tax)
    } catch (e) {
      return next(e)
    }
  }
}

export default TaxController;
