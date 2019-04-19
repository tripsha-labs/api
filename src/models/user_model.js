import Validator from "fastest-validator";

let v = new Validator();
const schema = {
  username: { type: "string", empty: false },
  email: { type: "email", empty: false },
  dob: { type: "string", optional: true, empty: false,},
  gender: { 
    type: "enum", 
    optional: true, 
    empty: false, 
    values: ["male", "female", "other"] 
  },
  phone: { type: "number", optional: true, empty: false,},
  languages_speak: { 
    type: "array", 
    optional: true, 
    empty: false, 
    items: "string", 
    enum: [ "english", "hindi"]
  },
  home_address: {
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
  is_looking_travel: {type: "boolean", optional: true, empty: false, values:["true", "false"]},
  profile_pic: {type: "url", optional: true, empty: false},
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
  country_intrests: {
    type: "array",
    optional: true,
    empty: false,
    items: "string"
  },
  $$strict: true
};

export const User = v.compile(schema);