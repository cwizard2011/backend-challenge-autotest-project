import { Attribute, AttributeValue, sequelize } from '../database/models';
class AttributeController {
    /**
     * This method get all attributes
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    static async getAllAttributes(req, res, next) {
        try {
            const attributes = await Attribute.findAll()
            return res.status(200).json(attributes);
        } catch (error) {
            return next(error)
        }
    }
  
    /**
     * This method gets a single attribute using the attribute id
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    static async getSingleAttribute(req, res, next) {
      const { attribute_id } = req.params;
      try {
          const attribute = await Attribute.findByPk(attribute_id, {
              attributes: ['attribute_id', 'name']
          })
          if (attribute) {
            return res.status(200).json(attribute)
          }
          return res.status(404).json({
              error: {
                  status: 404,
                  message: 'The requested attribute is not found'
              }
          })
      } catch (error) {
          return next(error)
      }
    }
  
    /**
     * This method gets a list attribute values in an attribute using the attribute id
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    static async getAttributeValues(req, res, next) {
      const { attribute_id } = req.params;
      try {
        const attributeValues = await AttributeValue.findAll({
            where: {
                attribute_id
            }
        });
        if (!attributeValues || attributeValues.length < 1) {
            return res.status(404).json({
                error: {
                    status: 404,
                    message: 'No values for the selected attribute id'
                }
            })
        }
        return res.status(200).json(attributeValues)
      } catch (error) {
          return next(error)
      }
    }
  
    /**
     * This method gets a list attribute values in a product using the product id
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    static async getProductAttributes(req, res, next) {
      const { product_id } = req.params;
      try {
        const query = `SELECT a.name as attribute_name, av.attribute_value_id, av.value as attribute_value FROM
        attribute_value av
        INNER JOIN attribute a on av.attribute_id = a.attribute_id
        WHERE av.attribute_value_id IN (
            SELECT attribute_value_id
            FROM product_attribute
            WHERE product_id = ${product_id}
        )`
        const productAttributes = await sequelize.query(query)
        if (!productAttributes || productAttributes[0].length === 0) {
            return res.status(404).json({
                error: {
                    status: 404,
                    message: 'No attribute for the requested product, kindly check your product Id and try again'
                }
            })
        }
        return res.status(200).json(productAttributes[0]);
      } catch (error) {
          return next(error)
      }
    }
  }
  
  export default AttributeController;
  