// Common validators
import Validator from "fastest-validator";

const idSchema = {
    id: { type: "string", empty: false }
}

export const idValidation = (new Validator()).compile(idSchema);

// Model specific validators
export * from "./user-model";
export * from "./trip-model";
// export * from "./user";