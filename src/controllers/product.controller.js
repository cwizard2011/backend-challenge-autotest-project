import {
  Product,
  Department,
  Category,
  Sequelize,
  sequelize
} from '../database/models';
import Pagination from '../utils/pagination';

const { Op } = Sequelize;

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const { query } = req;
    const { page, limit, offset } = Pagination.init(query);
    const sqlQueryMap = {
      limit,
      offset,
    };
    try {
      const products = await Product.findAndCountAll(sqlQueryMap);
      return res.status(200).json({
        paginationMeta: Pagination.getPaginationMeta(products, page, limit),
        rows: products.rows,
      });
    } catch (error) {
      return next(error);
    }
  }

    /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    try {
      const { query_string } = req.query;  // eslint-disable-line
      const product = await Product.findAll({
        where: {
          [Op.or]: {
            name: {
              [Op.like]: `%${query_string}%`,
            },
            description: {
              [Op.like]: `%${query_string}%`,
            }
          }
        }
      })
      if (!product || product.length < 1) {
        res.status(404).json({
          error: {
            status: 404,
            message: 'The searched product is not available at the moment'
          }
        })
      }
      return res.status(200).json({
        rows: product
      });
    } catch (error) {
      return next(error)
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    const { query } = req;
    const { category_id } = req.params;
    try {
      const query = `SELECT * FROM product p
      INNER JOIN product_category pc
      ON p.product_id = pc.product_id
      WHERE      pc.category_id = ${category_id}
      `
      
      const product = await sequelize.query(query)
      if (!product || product[0].length === 0) {
        res.status(404).json({
          error: {
            status: 404,
            message: 'No product for the requested category, kindly check your category id and try again'
          }
        })
      }
      return res.status(200).json({
        rows: product[0]
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    const { query } = req;
    const { department_id } = req.params;

    try {
      const query = `SELECT DISTINCT * FROM product p
        INNER JOIN product_category pc
              ON p.product_id = pc.product_id
        INNER JOIN category c
              ON pc.category_id = c.category_id
        WHERE      c.department_id = ${department_id}
      `
      
      const product = await sequelize.query(query)
      if (!product || product[0].length === 0) {
        res.status(404).json({
          error: {
            status: 404,
            message: 'No product for the requested department, kindly check your category id and try again'
          }
        })
      }
      return res.status(200).json({
        rows: product[0]
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    const { product_id } = req.params;
    try {
      const product = await Product.findByPk(product_id);
      if (product) {
        return res.status(200).json(product);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Product with id ${product_id} does not exist`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  static async getDepartment(req, res, next) {
    const { department_id } = req.params;
    try {
      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(200).json(department);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${departmentId} does not exist`,
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json({
        rows: categories
      })
    } catch (error) {
      return next(error)
    }
  }

  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;
    try {
      const category = await Category.findByPk(category_id)
      if (!category) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'This category cannot be found, kindly check the category id and try again'
          }
        })
      }
      return res.status(200).json(category)
    } catch (error) {
      return next(error)
    }
  }

  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;
    try {
      const departmentCategory = await Category.findAll({
        where: {
          department_id
        }
      })
      if (!departmentCategory) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'There is no category in the requested department, kindly check the department id and try again'
          }
        })
      }
      return res.status(200).json({
        rows: departmentCategory
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default ProductController;
