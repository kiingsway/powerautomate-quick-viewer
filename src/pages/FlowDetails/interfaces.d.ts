export interface IGetFlow {
  name: string
  id: string
  type: string
  properties: {
    apiId: string
    displayName: string
    userType: string
    definition: {
      $schema: string
      contentVersion: string
      parameters: any
      triggers: any;
      actions: any;
      description: string
    }
    triggerSchema: {
      type: string
      properties: any;
      required: Array<any>
    }
    state: string
    connectionReferences: any
    installedConnectionReferences: any
    createdTime: string
    lastModifiedTime: string
    flowSuspensionReason: string
    environment: {
      name: string
      type: string
      id: string
    }
    definitionSummary: {
      triggers: Array<{
        type: string
        kind: string
        metadata: {
          operationMetadataId: string
        }
      }>
      actions: {
        type: string
        metadata: {
          operationMetadataId: string
        }
        swaggerOperationId?: string
      }[]
      description: string
    }
    creator: {
      tenantId: string
      objectId: string
      userId: string
      userType: string
    }
    flowTriggerUri: string
    installationStatus: string
    provisioningMethod: string
    flowFailureAlertSubscribed: boolean
    referencedResources: any[];
    isManaged: boolean
  }
}
