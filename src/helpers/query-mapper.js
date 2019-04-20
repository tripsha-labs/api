/**
 * 
 * This file is used to build dynamodb queries
 */
import _ from "lodash";

const _mapKeys = key => `${key}=:${key}`;
/**
 * This method will concat all the root level keys as key and placeholder string
 * Ex. Input
 * {
 *      firstName: "John",
 *      lastName: "Doe"
 * }
 * Ex. Output
 * "firstName=:firstName,lastName=:lastName"
 */
export const queryBuilder = objItem => {
    if(!_.isObject(objItem)) return "";
    _.join(_.flatMap(_.keys(objItem), _mapKeys), ",");
}

/**
 * This method will alter all the root level keys with alter value, default ":"
 * Ex. Input
 * {
 *      firstName: "John",
 *      lastName: "Doe"
 * }
 * Ex. Outout
 * {
 *      :firstName: "John",
 *      :lastName: "Doe"
 * }
 */
export const keyPrefixAlterer = (objItem, prefix=":") => {
    if(!_.isObject(objItem)) return {};
    return _.mapKeys(objItem, (value, key) => `${prefix}${key}`);
}