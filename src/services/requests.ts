import React from 'react'
import axios from 'axios'

const uriApiFlow = "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple";

interface IOpt {
    headers: {
        Accept: string;
        Authorization: string | null;
    }
}
let opt: IOpt = {
    headers: { 'Accept': 'application/json', 'Authorization': null }
}

export function GetEnvironments(token: string) {

    const uri = `${uriApiFlow}/environments`;
    opt.headers.Authorization = token;
    return axios.get(uri, opt as any)
}

export function GetFlows(token: string, environmentName: string, sharedType: 'personal' | 'team') {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows?$filter=search('${sharedType}')&api-version=2016-11-01&$expand=properties.flowTriggerUri`;
    const opt = {
        headers: { 'Accept': 'application/json', 'Authorization': token }
    }

    return axios.get(uri, opt)
}

export const EditFlow = (token: string, environmentName: string, flowName: string, newDefinition: any) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=swagger,properties.connectionreferences.apidefinition,properties.definitionSummary.operations.apiOperation,operationDefinition,plan,properties.throttleData,properties.estimatedsuspensiondata`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }

    return axios.patch(uri, newDefinition, opt)
}

export const UpdateStateFlow = (token: string, environmentName: string, flowName: string, turn: 'turnOn' | 'turnOff') => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/${turn === 'turnOff' ? 'stop' : 'start'}?api-version=2016-11-01&$expand=properties.flowTriggerUri`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }

    return axios.post(uri, null, opt)
}

export const DeleteFlow = (token: string, environmentName: string, flowName: string) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }

    return axios.delete(uri, opt)
}

export const GetFlow = (token: string, environmentName: string, flowName: string) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=definition,connectionReferences,properties.flowTriggerUri`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }

    return axios.get(uri, opt)
}

export const GetFlowRuns = (token: string, environmentName: string, flowName: string) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/runs?api-version=2016-11-01`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }

    return axios.get(uri, opt)
}

export const GetFlowHistories = (token: string, environmentName: string, flowName: string, trigger: string) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/triggers/${trigger}/histories?&expand=properties&api-version=2016-11-01`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }

    return axios.get(uri, opt)
}

export const UpdateFlow = (token: string, environmentName: string, flowName: string, newDefinition: any) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=properties.flowTriggerUri`;
    const opt = {
        headers: { 'Accept': 'application/json', 'authorization': token }
    }


    return axios.patch(uri, newDefinition, opt)
}

export const RunFlow = (token: string, flowTriggerUri: string) => {

    const uri = flowTriggerUri;
    const opt = {
        headers: { 'accept': 'application/json', 'authorization': token }
    }

    return axios.post(uri, {}, opt)
}

export const CancelFlowRun = (token: string, environmentName: string, flowName: string, runName: string) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/runs/${runName}/cancel?api-version=2016-11-01`;
    const opt = {
        headers: { 'accept': 'application/json', 'authorization': token }
    }

    return axios.post(uri, {}, opt)
}

export const ResubmitFlowRun = (token: string, environmentName: string, flowName: string, runName: string, trigger: string) => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/triggers/${trigger}/histories/${runName}/resubmit?api-version=2016-11-01`;
    const opt = {
        headers: { 'accept': 'application/json', 'authorization': token }
    }

    return axios.post(uri, {}, opt)
}

export function GetFlowConnections(token: string, environmentName: string, flowName: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/connections?api-version=2016-11-01`;
    opt.headers.Authorization = token;
    return axios.get(uri, opt as any)
}

export const TryGetConnections = async (token: string, environmentName: string) => {
    const userId = '000a00a0-00a0-0a00-aa00-aa0a00aaa0';
    const uri = `https://unitedstates.api.powerapps.com/api/invoke`;
    const opt = {
        headers: {
            Accept: 'application/json',
            Authorization: token,
            ['x-ms-path-query']: `providers/Microsoft.PowerApps/connections?$expand=permissions($filter=maxAssignedTo('${userId}'))&$filter=environment eq '${environmentName}' and ApiId not in ('shared_logicflows','shared_powerflows')&api-version=2020-06-01&$top=999`
        }
    }
    return axios.get(uri, opt)

}

export const GetConnections = async (token: string, environmentName: string, userId: string) => {

    const uri = `https://unitedstates.api.powerapps.com/api/invoke`;
    const opt = {
        headers: {
            Accept: 'application/json',
            Authorization: token,
            ['x-ms-path-query']: `providers/Microsoft.PowerApps/connections?$expand=permissions($filter=maxAssignedTo('${userId}'))&$filter=environment eq '${environmentName}' and ApiId not in ('shared_logicflows','shared_powerflows')&api-version=2020-06-01&$top=999`
        }
    }
    return axios.get(uri, opt)

}

export const GetConnectionsNames = async (token: string, environmentName: string, userId: string) => {

    const uri = `https://unitedstates.api.powerapps.com/api/invoke`;
    const opt = {
        headers: {
            Accept: 'application/json',
            Authorization: token,
            ['x-ms-path-query']: `/providers/Microsoft.PowerApps/apis?showApisWithToS=true&$expand=permissions($filter=maxAssignedTo('${userId}'))&$filter=environment eq '${environmentName}'&api-version=2020-06-01`
        }
    }
    return axios.get(uri, opt)

}

export const GetWithNextLink = (token: string, nextLink: string) => {

    opt.headers.Authorization = token;
    return axios.get(nextLink, opt as any)
}

export const GetDeletedFlows = (token: string, environmentName: string) => {

    const uri = `https://us.api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${environmentName}/flows?$top=50&include=includeDeletedFlows&api-version=2016-11-01`;
    opt.headers.Authorization = token;
    return axios.get(uri, opt as any)
}