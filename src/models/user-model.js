import Validator from "fastest-validator";

const userBaseSchema = {
  dob: { type: "string", optional: true, empty: false,},
  gender: { 
    type: "enum", 
    optional: true, 
    empty: false, 
    values: ["male", "female", "other"] 
  },
  phone: { type: "number", optional: true, empty: false,},
  spokenLanguages: { 
    type: "array", 
    optional: true, 
    empty: false, 
    items: "string", 
    enum: [ "english", "hindi"]
  },
  homeAddress: {
    type: "object",
    empty: false, 
    optional: true, 
    props: {
      country: { type: "string", empty: false, optional: true },
      address: { type: "string", empty: false, optional: true },
      city: { type: "string", empty: false, optional: true },
      zip: { type: "number", empty: false, optional: true }
    }
  },
  bio: {type: "string", optional: true, empty: false},
  isLookingForTravel: {type: "boolean", optional: true, empty: false, values:["true", "false"]},
  profilePic: {type: "url", optional: true, empty: false},
  connections: {
    type: "array",
    optional: true,
    empty: false,
    items: {
      type: "string",
      optional: true,
      empty: false,
      props: {
        name: {
          type: "string",
          optional: true,
          empty: false
        },
        details: {
          type: "string",
          optional: true,
          empty: false
        }
      }
    } 
  },
  intrests: {
    type: "array",
    optional: true,
    empty: false,
    items: "string"
  },
  countryIntrests: {
    type: "array",
    optional: true,
    empty: false,
    items: "string"
  },
  $$strict: true
};

const createUserSchema = {
  ...userBaseSchema,
  username: { type: "string", empty: false },
  email: { type: "email", empty: false }
}

export const createUserValidation = (new Validator()).compile(createUserSchema);
export const updateUserValidation = (new Validator()).compile(userBaseSchema);
