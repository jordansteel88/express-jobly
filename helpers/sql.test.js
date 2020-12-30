const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("correctly maps multiple fields", function () {
    const result = sqlForPartialUpdate(
        { field1: "value1", field2: "value2" },
        { field1: "field1" });
    expect(result).toEqual({
      setCols: "\"field1\"=$1, \"field2\"=$2",
      values: ["value1", "value2"],
    });
  });
});