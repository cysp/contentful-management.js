import { DefaultElements, MetaSysProps, QueryOptions, CollectionProp, MetaLinkProps } from '../common-types';
import { AxiosInstance } from 'axios';
export interface Options {
    teamId?: string;
    query?: QueryOptions;
}
export declare type TeamMembershipProps = {
    /**
     * System metadata
     */
    sys: MetaSysProps & {
        team: {
            sys: MetaLinkProps;
        };
    };
    /**
     * Is admin
     */
    admin: boolean;
    /**
     * Organization membership id
     */
    organizationMembershipId: string;
};
export interface TeamMembership extends TeamMembershipProps, DefaultElements<TeamMembershipProps> {
    /**
     * Deletes this object on the server.
     * @return Promise for the deletion. It contains no data, but the Promise error case should be handled.
     * @example ```javascript
     * const contentful = require('contentful-management')
     *
     * const client = contentful.createClient({
     *   accessToken: '<content_management_api_key>'
     * })
     *
     * client.getOrganization('organizationId')
     * .then(org => org.getTeamMembership('teamId', 'teamMembershipId'))
     * .then((teamMembership) => {
     *  teamMembership.delete();
     * })
     * .catch(console.error)
     * ```
     */
    delete(): Promise<void>;
    /**
     * Sends an update to the server with any changes made to the object's properties
     * @return Object returned from the server with updated changes.
     * @example ```javascript
     * const contentful = require('contentful-management')
     *
     * const client = contentful.createClient({
     *   accessToken: '<content_management_api_key>'
     * })
     *
     * client.getOrganization('organizationId')
     * .then(org => org.getTeamMembership('teamId', 'teamMembershipId'))
     * .then((teamMembership) => {
     *  teamMembership.admin = true;
     *  teamMembership.update();
     * })
     * .catch(console.error)
     * ```
     */
    update(): Promise<TeamMembership>;
}
/**
 * @private
 * @param http - HTTP client instance
 * @param data - Raw team membership data
 * @return Wrapped team membership data
 */
export declare function wrapTeamMembership(http: AxiosInstance, data: TeamMembershipProps): TeamMembershipProps & {
    toPlainObject(): TeamMembershipProps;
};
/**
 * @private
 * @param http - HTTP client instance
 * @param data - Raw team membership collection data
 * @return Wrapped team membership collection data
 */
export declare function wrapTeamMembershipCollection(http: AxiosInstance, data: CollectionProp<TeamMembershipProps>): CollectionProp<TeamMembershipProps> & {
    toPlainObject(): CollectionProp<TeamMembershipProps>;
};
