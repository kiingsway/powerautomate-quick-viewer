import { PresenceBadgeStatus } from '@fluentui/react-components';

export interface IConnection {
    connectionInfo: IConnectionName
    summaryInfo: {
        statusText: string
        presence: PresenceBadgeStatus

    }
    name: string
    id: string
    type: string
    properties: {
        apiId: string
        displayName: string
        iconUri: string
        statuses: {
            status: string
            target?: string
            error?: {
                code: string
                message: string
            }
        }[]
        connectionParameters?: any
        keywordsRemaining: number
        createdBy: {
            id: string
            displayName: string
            email: string
            type: string
            tenantId: string
            userPrincipalName: string
        }
        createdTime: string
        lastModifiedTime: string
        environment: {
            id: string
            name: string
        }
        permissions: {
            name: string
            id: string
            type: string
            properties: {
                roleName: string
                principal: {
                    type: string
                    tenantId: string
                    id?: string
                }
                notifyShareTargetOption: string
                inviteGuestToTenant: boolean
            }
        }[]
        allowSharing: boolean
        testLinks?: {
            requestUri: string
            method: string
        }[]
        connectionParametersSet?: any
        expirationTime?: string
        accountName?: string
    }
}

export interface IConnectionName {
    name: string
    id: string
    type: string
    properties: {
        displayName: string
        iconUri: string
        iconBrandColor: string
        apiEnvironment: string
        isCustomApi: boolean
        connectionParameterSets?: any
        connectionParameters: any
        runtimeUrls: string[]
        primaryRuntimeUrl: string
        metadata: any
        capabilities: string[]
        interfaces?: any
        description?: string
        createdTime: string
        changedTime: string
        releaseTag?: string
        tier: string
        publisher: string
        scopes?: {
            will: string[]
            wont: string[]
        }
        termsOfUseUrl?: string
        contact?: {}
        license?: {}
        apiDefinitions?: {
            originalSwaggerUrl: string
            modifiedSwaggerUrl: string
        }
        backendService?: {
            serviceUrl: string
        }
        permissions?: Array<{
            name: string
            id: string
            type: string
            properties: {
                roleName: string
                principal: {
                    id: string
                    type: string
                    tenantId: string
                }
                notifyShareTargetOption: string
                inviteGuestToTenant: boolean
            }
        }>
        createdBy?: {
            id: string
            displayName: string
            email: string
            type: string
            tenantId: string
            userPrincipalName: string
        }
        modifiedBy?: {
            id: string
            displayName: string
            email: string
            type: string
            tenantId: string
            userPrincipalName: string
        }
        environment?: {
            id: string
            name: string
        }
        almMode?: string
        parameters?: {}
        policyTemplateInstances?: Array<any>
        scriptDefinitionUrl?: string
        scriptOperations?: string[]
        xrmConnectorId?: string
    }
}
