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

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/connections?` +
        'api-version=2016-11-01';
    opt.headers.Authorization = token;
    return axios.get(uri, opt as any)
}