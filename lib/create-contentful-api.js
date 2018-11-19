/**
 * Contentful Management API Client. Contains methods which allow access to
 * any operations that can be performed with a management token.
 * @namespace ContentfulClientAPI
 */

/**
 * Types for meta information found across the different entities in Contentful
 * @namespace Meta
 */

/**
 * System metadata. See <a href="https://www.contentful.com/developers/docs/references/content-delivery-api/#/introduction/common-resource-attributes">Common Resource Attributes</a> for more details.
 * @memberof Meta
 * @typedef Sys
 * @prop {string} type
 * @prop {string} id
 * @prop {Meta.Link} space
 * @prop {string} createdAt
 * @prop {string} updatedAt
 * @prop {number} revision
 */

/**
 * Link to another entity. See <a href="https://www.contentful.com/developers/docs/concepts/links/">Links</a> for more details.
 * @memberof Meta
 * @typedef Link
 * @prop {string} type - type of this entity. Always link.
 * @prop {string} id
 * @prop {string} linkType - type of this link. If defined, either Entry or Asset
 */

/**
 * @memberof ContentfulClientAPI
 * @typedef {Object} ClientAPI
 * @prop {function} getSpace
 * @prop {function} getSpaces
 * @prop {function} createSpace
 * @prop {function} createPersonalAccessToken
 * @prop {function} getCurrentUser
 * @prop {function} getPersonalAccessTokens
 * @prop {function} getPersonalAccessToken
 * @prop {function} getOrganizations
 * @prop {function} rawRequest
 * @prop {function} getUsagePeriods
 * @prop {function} getUsages
 */

import { createRequestConfig } from 'contentful-sdk-core'
import errorHandler from './error-handler'
import entities from './entities'
/**
 * Creates API object with methods to access functionality from Contentful's
 * Management API
 * @private
 * @param {Object} params - API initialization params
 * @prop {Object} http - HTTP client instance
 * @prop {Function} shouldLinksResolve - Link resolver preconfigured with global setting
 * @return {ClientAPI}
 */
export default function createClientApi ({ http }) {
  const {wrapSpace, wrapSpaceCollection} = entities.space
  const {wrapUser} = entities.user
  const {wrapPersonalAccessToken, wrapPersonalAccessTokenCollection} = entities.personalAccessToken
  const {wrapOrganizationCollection} = entities.organization
  const {wrapUsagePeriodCollection} = entities.usagePeriod
  const {wrapUsageCollection} = entities.usage

  /**
   * Gets all spaces
   * @memberof ContentfulClientAPI
   * @return {Promise<Space.SpaceCollection>} Promise for a collection of Spaces
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getSpaces()
   * .then((response) => console.log(response.items))
   * .catch(console.error)
   */
  function getSpaces (query = {}) {
    return http.get('', createRequestConfig({query: query}))
      .then((response) => wrapSpaceCollection(http, response.data), errorHandler)
  }

  /**
   * Gets a space
   * @memberof ContentfulClientAPI
   * @param {string} id - Space ID
   * @return {Promise<Space.Space>} Promise for a Space
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getSpace('<space_id>')
   * .then((space) => console.log(space))
   * .catch(console.error)
   */
  function getSpace (id) {
    return http.get(id)
      .then((response) => wrapSpace(http, response.data), errorHandler)
  }

  /**
   * Creates a space
   * @memberof ContentfulClientAPI
   * @see {Space.Space}
   * @param {object} data - Object representation of the Space to be created
   * @param {string=} organizationId - Organization ID, if the associated token can manage more than one organization.
   * @return {Promise<Space.Space>} Promise for the newly created Space
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.createSpace({
   *   name: 'Name of new space'
   * })
   * .then((space) => console.log(space))
   * .catch(console.error)
   */
  function createSpace (data, organizationId) {
    return http.post('', data, {
      headers: organizationId ? {'X-Contentful-Organization': organizationId} : {}
    })
      .then((response) => wrapSpace(http, response.data), errorHandler)
  }

  /**
   * Gets a collection of Organizations
   * @memberof ContentfulClientAPI
   * @return {Promise<OrganizationCollection>} Promise for a collection of Organizations
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getOrganizations()
   * .then(result => console.log(result.items))
   * .catch(console.error)
   */
  function getOrganizations () {
    const baseURL = http.defaults.baseURL.replace('/spaces/', '/organizations/')
    return http.get('', {
      baseURL
    })
      .then((response) => wrapOrganizationCollection(http, response.data), errorHandler)
  }

  /**
   * Gets a collection of usage periods for the organization.
   * @memberof ContentfulClientAPI
   * @param {string} organizationId - id of organization
   * @return {Promise<UsagePeriod.UsagePeriodCollection>} Promise for a collection of usage periods
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getUsagePeriods('<organizationId>')
   * .then(result => console.log(result.items))
   * .catch(console.error)
   */
  function getUsagePeriods (organizationId) {
    const baseURL = http.defaults.baseURL.replace('/spaces/', `/organizations/${organizationId}/usage_periods`)
    const headers = {
      'x-contentful-enable-alpha-feature': 'usage-insights'
    }
    return http.get('', {
      baseURL,
      headers
    })
      .then((response) => wrapUsagePeriodCollection(http, response.data), errorHandler)
  }

  /**
   * Gets a collection of usages for the organization.
   * @memberof ContentfulClientAPI
   * @param {string} organizationId
   * @param {string} type - either 'organization' or 'space', type of usages to be returned
   * @param {Object<{filters:{metric: string, usagePeriod: string}, orderBy:{metricUsage: string}}>} query - Object with search params.
   * 'filters[metric]' is a required field, possible values are one of 'cda', 'cma', 'cpa', 'all_apis'.
   * 'filters[usagePeriod]' is also required, it's the ID of the usage period.
   * 'orderBy[metricUsage]' is optional, value can be asc or desc. It orders resources in response's 'items' array by total usage
   * @return {Promise<Usage.UsageCollection>} Promise for a collection of usage
   * @example
   *
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getUsages('<organizationId>', 'space', {
   *    'filters[metric]': 'cda', // required
   *    'filters[usagePeriod]': '1234', // required
   *    'orderBy[metricUsage]': 'asc'
   * })
   * .then(result => console.log(result.items))
   * .catch(console.error)
   */
  function getUsages (organizationId, type, query = {}) {
    if (!(query['filters[metric]'] && query['filters[usagePeriod]'])) {
      return Promise.reject(new Error('Missing either filters[metric] or filters[usagePeriod] in usages query.'))
    }
    const baseURL = http.defaults.baseURL.replace('/spaces/', `/organizations/${organizationId}/usages/${type}`)
    const headers = {
      'x-contentful-enable-alpha-feature': 'usage-insights'
    }
    return http.get('', {baseURL, headers, params: createRequestConfig({query}).params})
      .then((response) => wrapUsageCollection(http, response.data), errorHandler)
  }

  /**
   * Gets the authenticated user
   * @memberof ContentfulClientAPI
   * @return {Promise<User>} Promise for a User
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getCurrentUser()
   * .then(user => console.log(user.firstName))
   * .catch(console.error)
   */
  function getCurrentUser () {
    const baseURL = http.defaults.baseURL.replace('/spaces/', '/users/me/')
    return http.get('', {
      baseURL
    })
      .then((response) => wrapUser(http, response.data), errorHandler)
  }

  /**
   * Creates a personal access token
   * @memberof ContentfulClientAPI
   * @param {Object} data - personal access token config
   * @return {Promise<User>} Promise for a Token
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.createPersonalAccessToken(
   *  {
   *    "name": "My Token",
   *    "scope": [
   *      "content_management_manage"
   *    ]
   *  }
   * )
   * .then(personalAccessToken => console.log(personalAccessToken.token))
   * .catch(console.error)
   */
  function createPersonalAccessToken (data) {
    const baseURL = http.defaults.baseURL.replace('/spaces/', '/users/me/access_tokens')
    return http.post('', data, {
      baseURL
    })
      .then((response) => wrapPersonalAccessToken(http, response.data), errorHandler)
  }

  /**
   * Gets a personal access token
   * @memberof ContentfulClientAPI
   * @param {Object} data - personal access token config
   * @return {Promise<User>} Promise for a Token
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getPersonalAccessToken(tokenId)
   * .then(token => console.log(token.token))
   * .catch(console.error)
   */
  function getPersonalAccessToken (tokenId) {
    const baseURL = http.defaults.baseURL.replace('/spaces/', '/users/me/access_tokens')
    return http.post(tokenId, {
      baseURL
    })
      .then((response) => wrapPersonalAccessToken(http, response.data), errorHandler)
  }

  /**
   * Gets all personal access tokens
   * @memberof ContentfulClientAPI
   * @return {Promise<User>} Promise for a Token
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getPersonalAccessTokens()
   * .then(response => console.log(reponse.items))
   * .catch(console.error)
   */
  function getPersonalAccessTokens () {
    const baseURL = http.defaults.baseURL.replace('/spaces/', '/users/me/access_tokens')
    return http.get('', {
      baseURL
    })
      .then((response) => wrapPersonalAccessTokenCollection(http, response.data), errorHandler)
  }

  /**
   * Make a custom request to the Contentful management API's /spaces endpoint
   * @memberof ContentfulClientAPI
   * @param {Object} opts - axios request options (https://github.com/mzabriskie/axios)
   * @return {Promise<Object>} Promise for the response data
   * @example
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.rawRequest({
   *   method: 'GET',
   *   url: '/custom/path'
   * })
   * .then((responseData) => console.log(responseData))
   * .catch(console.error)
   */
  function rawRequest (opts) {
    return http(opts).then((response) => response.data, errorHandler)
  }

  return {
    getSpaces: getSpaces,
    getSpace: getSpace,
    createSpace: createSpace,
    getOrganizations: getOrganizations,
    getCurrentUser: getCurrentUser,
    createPersonalAccessToken: createPersonalAccessToken,
    getPersonalAccessToken: getPersonalAccessToken,
    getPersonalAccessTokens: getPersonalAccessTokens,
    rawRequest: rawRequest,
    getUsagePeriods: getUsagePeriods,
    getUsages: getUsages
  }
}