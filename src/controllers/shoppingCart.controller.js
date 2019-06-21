import uniqid from 'uniqid';
import stripe from 'stripe';
import { ShoppingCart, Product, Shipping, Order, OrderDetail, Tax, sequelize } from '../database/models';
import MailingController from './mailing.controller';
/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   */
  static generateUniqueCart(req, res) {
    let { cartId } = req.session;
    if (!cartId) {
      cartId = uniqid();
      req.session.cartId = cartId;
      res.cookie('cartId', cartId);
    }
    return res.status(200).json({
      cart_id: cartId,
    });
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async addItemToCart(req, res, next) {
    const { product_id, attributes, quantity, cart_id } = req.body;
    try {
      // first check if product exists
      const product = await Product.findByPk(product_id);
      if (product) {
        // check if product has been added to cart using find or create
        // if it exists then update the quantity
        const [item, created] = await ShoppingCart.findOrCreate({
          where: {
            product_id,
            cart_id,
          },
          defaults: {
            cart_id,
            product_id,
            attributes,
            quantity: quantity || 1,
          },
        });

        if (!created) {
          // if it already existed, then just bump the quantity
          await item.update({
            quantity: quantity ? item.quantity + quantity : item.quantity,
            attributes: attributes || item.attributes,
          });
        }

        return res.status(200).json(item)
      }
      // product does not exist return error message
      return res.status(404).json({
        error: {
          status: 404,
          message: `Product with product id ${product_id} does not exist`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update cart item quantity using item_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async updateItemInCart(req, res, next) {
    const { item_id } = req.params;
    const { quantity } = req.body
    try {
        // check if product has been added to cart using find or create
        // if it exists then update the quantity
        let item = await ShoppingCart.findByPk(item_id);

        if (item) {
          // if it already existed, then just bump the quantity
          await item.update({
            quantity
          });
          return res.status(200).json(item)
        }
      // product does not exist return error message
      return res.status(404).json({
        error: {
          status: 404,
          message: `Item with item id ${item_id} does not exist in the Shopping cart`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * gets items in a cart, if cartId is supplied in req params it uses that to query
   * otherwise, it uses the cartId stored in the session
   * if neither exists it creates a new id and stores it in session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async getCart(req, res, next) {
    // if the cartId is not supplied in the query param, use the cart in the session
    let cartId;
    if (!req.params.cart_id) {
      // eslint-disable-next-line prefer-destructuring
      cartId = req.session.cartId;
      if (!cartId) {
        // generate a new cartId and set in seession
        cartId = uniqid();
        req.session.cartId = cartId;
        res.cookie('cartId', cartId);
      }
    } else {
      // eslint-disable-next-line prefer-destructuring
      cartId = req.params.cart_id;
    }
    try {
      const query = `
      SELECT  DISTINCT  sc.item_id, sc.cart_id, p.name, sc.attributes,
      COALESCE(NULLIF(p.discounted_price, 0), p.price) AS price,
      sc.quantity, p.discounted_price, p.image, sc.product_id,
      COALESCE(NULLIF(p.discounted_price, 0),
               p.price) * sc.quantity AS subtotal
      FROM       shopping_cart sc
      INNER JOIN product p
              ON sc.product_id = p.product_id
      WHERE      sc.cart_id = '${cartId}';
      `
      const cart = await sequelize.query(query)
      if (!cart || cart[0].length === 0) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'The requested shopping cart cannot be found'
          }
        })
      }
      return res.status(200).json(cart[0]);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async emptyCart(req, res, next) {
    const { cart_id } = req.params;
    try {
      const existingCart = await ShoppingCart.findOne({
        where: {
          cart_id
        }
      });
      if (!existingCart) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'The request shopping cart cannot be found'
          }
        })
      }
      await ShoppingCart.destroy({
        where: {
          cart_id,
        },
      });
      return res.status(200).json([]);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   */
  static async removeItemFromCart(req, res, next) {
    const { item_id } = req.params;

    try {
      const item = await ShoppingCart.findByPk(item_id)
      if (!item) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'The requested item cannot be found'
          }
        })
      }
      await ShoppingCart.destroy({
        where: {
          item_id,
        },
      });

      return res.status(200).json({
        message: 'Successfully removed item from cart',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrder(req, res, next) {
    const { shipping_id, cart_id, tax_id } = req.body;

    try {
      const shippingType = await Shipping.findByPk(shipping_id);
      const taxType = await Tax.findByPk(tax_id);
      if (shippingType && taxType) {
        const cart = await ShoppingCart.findAll({
          where: {
            cart_id,
          },
          include: [
            {
              model: Product,
            },
          ],
        });

        const discountedTotal = cart.reduce((acc, curr) => {
          const price = Number(curr.Product.price);
          const discountedPrice = Number(curr.Product.discounted_price);
          return Number(acc) + (discountedPrice || price) * curr.quantity;
        }, 0);
        const taxAmount = (Number(taxType.tax_percentage) * discountedTotal)/100
        const finalTotal = (discountedTotal + taxAmount).toFixed(2)

        const order = await Order.create({
          total_amount: finalTotal,
          comments: 'order for customer',
          customer_id: req.customerId,
          auth_code: 'TURING',
          reference: cart_id,
          shipping_id,
        });

        const orderDetails = [];
        cart.forEach(item => {
          // eslint-disable-next-line camelcase
          const { item_id, ...data } = item.dataValues;
          orderDetails.push({
            order_id: order.order_id,
            ...data,
            product_name: data.Product.name,
            unit_cost: data.Product.price,
          });
        });

        await OrderDetail.bulkCreate(orderDetails);
        return res.status(200).json({
          order_id: order.order_id,
        });
      }
      return res.status(400).json({
        status: false,
        message: 'Invalid shipping type provided',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   */
  static async getOrderSummary(req, res, next) {
    const { order_id } = req.params;
    const { customerId } = req;
    try {
      const query = `
      SELECT      o.order_id, o.total_amount, o.created_on,
        o.shipped_on, o.status, c.name
      FROM        orders o
      INNER JOIN  customer c
        ON o.customer_id = c.customer_id
      WHERE       o.order_id = ${order_id} AND o.customer_id = ${customerId};
      `
      const order = await sequelize.query(query)
      if (order[0].length > 0) {
        return res.status(200).json(...order[0]);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Order with order id ${order_id} does not exist`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   */
  static async getCustomerOrders(req, res, next) {
    const { customerId } = req;
    try {
      const query = `
      SELECT     o.order_id, o.total_amount, o.created_on,
        o.shipped_on, c.name
      FROM       orders o
      INNER JOIN customer c
        ON o.customer_id = c.customer_id
      WHERE      o.customer_id = ${customerId}
      `
      const orders = await sequelize.query(query)
      if (orders[0].length < 1) {
        return res.status(200).json({
          message: 'This customer has not placed an order'
        })
      }
      return res.status(200).json(orders[0]);
    } catch (error) {
      return next(error);
    }
  }

  static async processStripePayment(req, res, next) {
    const { email, stripeToken, order_id } = req.body;
    const { customerId } = req;
    try {
      const order = await Order.findOne({
        where: {
          order_id,
          customer_id: customerId,
          status: 0,
        },
      });

      if (order) {
        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        const customer = await stripeInstance.customers.create({
          email,
          card: stripeToken,
        });

        const charge = await stripeInstance.charges.create({
          amount: (order.total_amount * 100).toFixed(),
          description: order.comments,
          currency: 'usd',
          customer: customer.id,
        });

        // empty out shopping cart
        await ShoppingCart.destroy({
          where: {
            cart_id: order.reference,
          },
        });

        // update order status
        await order.update({
          status: 1,
          reference: charge.id,
        });

        // in the charge object, there is a receipt url
        // we can send this in the body of the mail and order summary
        // MailingController.sendMail(email, charge.receipt_url);

        return res.status(200).json({
          charge,
          message: `Order paid successfully`,
        });
      }
      return res.status(404).json({
        status: false,
        message: `Order with order id ${orderId} does not exist`,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
