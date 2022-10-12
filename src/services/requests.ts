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

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=definition,properties.flowTriggerUri`;
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

export const GetConnections = (token: string) => {
    const uri = `https://unitedstates.api.powerapps.com/api/invoke?api-version=2021-02-01`
    const opt = {
        headers: {Accept: 'application/json', Authorization: token, ['x-ms-path-query']: "providers/Microsoft.PowerApps/connections?%24expand=permissions(%24filter%3dmaxAssignedTo(%27a1c0382b-9056-425c-96d5-e0dad70c2898%27))&%24filter=environment+eq+%27Default-a8b027e9-7f32-430c-97c4-47dd7af95c70%27+and+ApiId+not+in+(%27shared_logicflows%27%2c%27shared_powerflows%27)&api-version=2020-06-01&%24skiptoken=eyJmYWlsdXJlRm91bmQiOmZhbHNlLCJsYXN0UmVnaXN0cmF0aW9uU2VlbiI6InNoYXJlZCIsImxhc3RDb250aW51YXRpb25Ub2tlblNlZW4iOiJleUpRU3lJNklqRWhPQ0ZSVkdzelRWUlZMU0lzSWxKTElqb2lNU0V5TlRJaFVWUm9RMDFFU1ROU1ZHczJUV3RSTTFKcVRYbFBha3BGVGtSTmQxRjZiM2xTUkdzelVYcFJOazFyVVRCT01GSkZUakJHUjA5VVZrUk9la0ptVlVWR1JGUnBNVUpOVlUxM1RYcG5lVkZxYjNsU1JHdDNUbFJaTmsxclVUQk5hbFpFVDJwS1JVOVVXa1ZPVkc5NVVrVlZkMUpGUmtWT2VrSkVUV3BuTlU5RE1VNVZNREZDVkd0R1NGSlZVVFpOYTFKUFVWTXhVRkpyV2twUk1GVjZUbXBWZEZVd2FFSlZhMVpGVDJwS1JWUXdXa2RUVlU1R1RYcFpNVTlxU2tWTmFrWkdVWHBCTWxKRVFUWk5hMUpHVWxSSk1rOXFTa1ZPUkdoQ1RVUnZlVkpFYXpWTlZWRTJUV3RTUmxKVldrVlBha3BGVGtWSk1rNUZSa2RPZW1jdElpd2lUMGxFSWpvaVlURmpNRE00TW1JdE9UQTFOaTAwTWpWakxUazJaRFV0WlRCa1lXUTNNR015T0RrNElpd2lVeUk2SWs1dmRGTmxkQ0o5In0%3d&%24paginationId=76e736f1-e4e7-4ba8-8453-6fbc666ed8de"}
    }
    const opt1 = {
        headers: {Accept: 'application/json', Authorization: token, ['x-ms-path-query']: "providers/Microsoft.PowerApps/connections"}
    }
}