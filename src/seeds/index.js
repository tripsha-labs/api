import countries from './countries.json';
import tags from './tags.json';
import tripTags from './trip-tags.json';
import { Country, Tag, TripTag } from '../models';

export const loadProfileTags = () => {
  return Tag.bulkWrite(
    tags.map(tag => {
      return {
        updateOne: {
          filter: { name: tag.name },
          update: tag,
          upsert: true,
        },
      };
    })
  );
};

export const loadTripTags = () => {
  return TripTag.bulkWrite(
    tripTags.map(tag => {
      return {
        updateOne: {
          filter: { key: tag.key },
          update: tag,
          upsert: true,
        },
      };
    })
  );
};

export const loadCountries = () => {
  return Country.bulkWrite(
    countries.map(country => {
      return {
        updateOne: {
          filter: { code: country.code },
          update: country,
          upsert: true,
        },
      };
    })
  );
};
