/**
 * @name - Seeds handlar
 * @description - This will handle seed data population in the database
 */
import { successResponse, failureResponse } from '../../utils';
import { loadCountries, loadProfileTags, loadTripTags } from '../../seeds';
const Airtable = require('airtable');

export const seeds = async (req, res) => {
  try {
    await loadCountries();
    await loadProfileTags();
    await loadTripTags();
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

const minifyRecord = record => {
  return {
    id: record.id,
    fields: record.fields,
  };
};

export const airtable = async (req, res) => {
  try {
    const base = new Airtable({ apiKey: 'keyXOWBoWSQZApZbr' }).base(
      'apps1QJEDPaACukEt'
    );

    const table = base('Subscribers');
    const fields = {
      FirstName: 'Ben',
      LastName: 'L',
      Email: 'ben@test.com',
    };
    const createdRecord = await table.create(fields);
    const record = minifyRecord(createdRecord);
    return successResponse(res, record);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
