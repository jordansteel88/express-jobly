"use strict";

const db = require("../db.js");

const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Test Job",
    salary: 50000,
    equity: ".5",
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job.title).toEqual("Test Job");
    expect(job.salary).toEqual(50000);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();

    expect(jobs).toEqual([
        {
          id: testJobIds[0],
          title: "J1",
          salary: 10000,
          equity: "0.1",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: testJobIds[1],
          title: "J2",
          salary: 20000,
          equity: "0.2",
          companyHandle: "c3",
          companyName: "C3",
        },
        {
          id: testJobIds[2],
          title: "J3",
          salary: 30000,
          equity: null,
          companyHandle: "c3",
          companyName: "C3",
        },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual(       
      { id: testJobIds[0],
        title: "J1",
        salary: 10000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New Title",
    salary: 12345,
    equity: "0.5"
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job.title).toEqual("New Title");
    expect(job.salary).toEqual(12345);
    expect(job.equity).toEqual("0.5");
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});