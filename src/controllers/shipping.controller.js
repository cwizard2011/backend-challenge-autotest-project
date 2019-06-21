import { ShippingRegion, Shipping } from '../database/models';

class ShippingController {
  /**
   * get all shipping regions
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and shipping regions data
   * @memberof ShippingController
   */
  static async getShippingRegions(req, res, next) {
    try {
      const shippingRegions = await ShippingRegion.findAll();
      return res.status(200).json(shippingRegions);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get get shipping region shipping types
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and shipping types data
   * @memberof ShippingController
   */
  static async getShippingType(req, res, next) {
    const { shipping_region_id } = req.params;
    try {
      const shippingTypes = await Shipping.findAll({
        where: {
          shipping_region_id,
        },
      });
      if (!shippingTypes || shippingTypes.length === 0) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'Wrong shipping region id, please try again with a valid one'
          }
        })
      }
      return res.status(200).json(shippingTypes);
    } catch (error) {
      return next(error);
    }
  }
}

export default ShippingController;
