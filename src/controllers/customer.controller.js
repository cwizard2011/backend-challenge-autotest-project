import { Customer } from '../database/models';
import Token from '../utils/token';

/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * 
   * @param {string} creditCard replace credit card digit with X
   */
  static replaceCreditCard(creditCard) {
    if (typeof creditCard !== 'null' || creditCard !== undefined || creditCard !== '' || creditCard.length >= 12) {
      return creditCard.replace(/^(\d{4})\d(?=\d{4})|\d(?=\d{4})/g, "X");
    } else {
      return creditCard;
    }
  }
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */
  static async create(req, res, next) {
    const { email } = req.body;
    const existingUser = await Customer.findOne({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({
        error: {
          status: 409,
          message: 'User with this email already exists',
        }
      });
    }
    try {
      const customer = await Customer.create(req.body);
      const token = Token.generateToken(customer);
      return res.status(201).json({
        customer: customer.getSafeDataValues(),
        accessToken: `Bearer ${token}`,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const foundCustomer = await Customer.findOne({
        where: {
          email,
        },
        attributes: {
          exclude: ['credit_card']
        }
      });
      if (foundCustomer) {
        const isValid = await foundCustomer.validatePassword(password);
        if (isValid) {
          const token = Token.generateToken(foundCustomer);
          return res.status(200).json({
            customer: foundCustomer.getSafeDataValues(),
            accessToken: `Bearer ${token}`,
          });
        }
      }
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Invalid email or password',
        }
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    const { customerId } = req;
    try {
      const customer = await Customer.findByPk(customerId, {
        attributes: {
          exclude: ['password', 'credit_card'],
        },
      });
      return res.status(200).json(customer);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    const { customerId } = req;
    const { name, email, day_phone, eve_phone, mob_phone } = req.body;
    try {
      const customer = await Customer.findByPk(customerId);
      if (customer) {
        // if password supplied is correct then we proceed
        const updatedCustomer = await customer.update({
          name: name || customer.name,
          email: email || customer.email,
          day_phone: day_phone || customer.day_phone,
          eve_phone: eve_phone || customer.eve_phone,
          mob_phone: mob_phone || customer.mob_phone,
        });
        return res.status(200).json({
            customer_id: updatedCustomer.customer_id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            day_phone: updatedCustomer.day_phone,
            eve_phone: updatedCustomer.eve_phone,
            mob_phone: updatedCustomer.mob_phone,
        });
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Customer with id ${customerId} does not exist`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  
  /**
   * update customer billing info data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    const { customerId } = req;
    const {
      address_1,
      address_2,
      city,
      region,
      postal_code,
      country,
      shipping_region_id,
      name,
    } = req.body;
    try {
      const customer = await Customer.findByPk(customerId);
      if (customer) {
        const updatedCustomer = await customer.update({
          name: name || customer.name,
          address_1: address_1 || customer.address_1,
          address_2: address_2 || customer.address_2,
          city: city || customer.city,
          region: region || customer.region,
          postal_code: postal_code || customer.postal_code,
          country: country || customer.country,
          shipping_region_id: shipping_region_id || customer.shipping_region_id,
        }, {
          attributes: {
            exclude: ['credit_card']
          }
        });
        return res.status(200).json({
          ...updatedCustomer.getSafeDataValues(),
        });
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Customer with id ${customerId} does not exist`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }
  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCreditCard(req, res, next) {
    const { customerId } = req;
    const { credit_card } = req.body
    try {
      const customer = await Customer.findByPk(customerId);
      if (customer) {
        const updatedCustomer = await customer.update({
          credit_card: credit_card || customer.credit_card,
        });
        updatedCustomer.credit_card = CustomerController.replaceCreditCard(updatedCustomer.credit_card)
        return res.status(200).json({
          ...updatedCustomer.getSafeDataValues(),
        });
      }
    } catch (error) {
      return next(error)
    }
  }
}

export default CustomerController;
