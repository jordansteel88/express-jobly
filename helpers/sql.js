const { BadRequestError } = require("../expressError");

/**
 * Allows patch for parts of a SQL object
 * 
 * @param dataToUpdate {Object} {field1: value1, field2: value2, ...} 
 * @param jsToSql {Object} maps JS data to database
 * 
 * @returns {Object} {setCols, values}
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
