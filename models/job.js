"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    // console.log(`title: ${title}`);
    const result = await db.query(
          `INSERT INTO jobs
             (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle
        ]
    );
    let job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   * 
   * Includes optional search filters for title, minSalary, and hasEquity.
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */

  static async findAll(filters = {}) {
    let query = `SELECT 
                   j.id,
                   j.title,
                   j.salary,
                   j.equity,
                   j.company_handle AS "companyHandle",
                   c.name AS "companyName"
                 FROM jobs AS j
                 LEFT JOIN companies AS c ON j.company_handle = c.handle`;

    let whereStatementAdditions = [];
    let filterParamsValues = [];

    const { title, minSalary, hasEquity } = filters;
    
    if (title !== undefined ) {
      filterParamsValues.push(`%${title}%`);
      whereStatementAdditions.push(`title ILIKE $${filterParamsValues.length}`);
    } 
    
    if (minSalary !== undefined) {
      filterParamsValues.push(minSalary);
      whereStatementAdditions.push(`salary >= $${filterParamsValues.length}`);
    }

    if (hasEquity) {
      whereStatementAdditions.push(`equity > 0`);
    } 
    
    if (whereStatementAdditions.length > 0) {
      query += " WHERE " + whereStatementAdditions.join(" AND ");
    }

    query += " ORDER BY title";

    const jobsRes = await db.query(query, filterParamsValues);
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, companyName }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT j.id,
                  j.title,
                  j.salary,
                  j.equity,
                  j.company_handle AS "companyHandle",
                  c.name AS "companyName"
           FROM jobs as J
           LEFT JOIN companies AS c ON j.company_handle = c.handle
           WHERE id = $1`,
        [id]
    );

    const job = jobRes.rows[0];
    // console.log(`job: ${job}`);

    if (!job) throw new NotFoundError(`No job: ${job}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data, {}
    );
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;