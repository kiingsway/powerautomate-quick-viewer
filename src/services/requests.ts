import React from 'react'
import axios from 'axios'

const uriApiFlow = "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple";

export function GetEnvironments(token: string) {

    const uri = `${uriApiFlow}/environments`;
    const opt = {
        headers: { 'Accept': 'application/json', 'Authorization': token }
    }

    return axios.get(uri, opt)
}

export function GetFlows(token: string, environmentName: string, sharedType: 'personal' | 'team') {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows?$filter=search('${sharedType}')&api-version=2016-11-01`;
    const opt = {
        headers: { 'Accept': 'application/json', 'Authorization': token }
    }

    return axios.get(uri, opt)
}

export const UpdateStateFlow = (token: string, environmentName: string, flowName: string, turn: 'turnOn' | 'turnOff') => {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/${turn === 'turnOff' ? 'stop' : 'start'}?api-version=2016-11-01`;
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

    return axios.delete(uri,opt)
}