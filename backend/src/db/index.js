const pool = require('./pool');

module.exports = {
  /**
   * Global query helper
   * @param {string} text - SQL Query
   * @param {Array} params - Query parameters
   */
  query: (text, params) => {
    // You could add a console.log(text) here during dev to see your SQL in action
    return pool.query(text, params);
  },
  
  // Export the pool itself for cases where you need transactions (BEGIN/COMMIT)
  pool
};