import axios from 'axios'

const uriApiFlow = "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple";

const defaultHeaders = { 'Accept': 'application/json', Authorization: null };

export function GetEnvironments(token: string) {

    const uri = `${uriApiFlow}/environments`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }
    return axios.get(uri, opt as any);
}

export function GetFlow(token: string, environmentName: string, flowName: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=definition,connectionReferences,properties.flowTriggerUri`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }
    return axios.get(uri, opt);
}

export function GetFlows(token: string, environmentName: string, sharedType: 'personal' | 'team') {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows?$filter=search('${sharedType}')&api-version=2016-11-01&$expand=properties.flowTriggerUri&include=includeSolutionCloudFlows`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }
    return axios.get(uri, opt);
}

export function EditFlow(token: string, environmentName: string, flowName: string, newDefinition: any) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=swagger,properties.connectionreferences.apidefinition,properties.definitionSummary.operations.apiOperation,operationDefinition,plan,properties.throttleData,properties.estimatedsuspensiondata`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }
    return axios.patch(uri, newDefinition, opt);
}

export function UpdateFlow(token: string, environmentName: string, flowName: string, newDefinition: any) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01&$expand=properties.flowTriggerUri`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };

    return axios.patch(uri, newDefinition, opt);
}

export function UpdateStateFlow(token: string, environmentName: string, flowName: string, turn: 'turnOn' | 'turnOff') {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/${turn === 'turnOff' ? 'stop' : 'start'}?api-version=2016-11-01&$expand=properties.flowTriggerUri`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.post(uri, null, opt);
}

export function DeleteFlow(token: string, environmentName: string, flowName: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}?api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.delete(uri, opt);
}

export function GetFlowRuns(token: string, environmentName: string, flowName: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/runs?api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.get(uri, opt);
}

export function GetFlowHistories(token: string, environmentName: string, flowName: string, trigger: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/triggers/${trigger}/histories?&expand=properties&api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.get(uri, opt);
}

export function GetFlowConnections(token: string, environmentName: string, flowName: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/connections?api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.get(uri, opt as any);
}

export function RunFlow(token: string, flowTriggerUri: string) {

    const uri = flowTriggerUri;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }

    return axios.post(uri, {}, opt);
}

export function CancelFlowRun(token: string, environmentName: string, flowName: string, runName: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/runs/${runName}/cancel?api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }

    return axios.post(uri, {}, opt);
}

export function ResubmitFlowRun(token: string, environmentName: string, flowName: string, runName: string, trigger: string) {

    const uri = `${uriApiFlow}/environments/${environmentName}/flows/${flowName}/triggers/${trigger}/histories/${runName}/resubmit?api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } }

    return axios.post(uri, {}, opt);
}

export async function TryGetConnections(token: string, environmentName: string) {
    const userId = '000a00a0-00a0-0a00-aa00-aa0a00aaa0';
    const uri = `https://unitedstates.api.powerapps.com/api/invoke`;
    const opt = {
        headers: {
            Accept: 'application/json',
            Authorization: token,
            'x-ms-path-query': `providers/Microsoft.PowerApps/connections?$expand=permissions($filter=maxAssignedTo('${userId}'))&$filter=environment eq '${environmentName}' and ApiId not in ('shared_logicflows','shared_powerflows')&api-version=2020-06-01&$top=999`
        }
    };
    return axios.get(uri, opt);

}

export async function GetConnections(token: string, environmentName: string, userId: string) {

    const uri = `https://unitedstates.api.powerapps.com/api/invoke`;
    const opt = {
        headers: {
            Accept: 'application/json',
            Authorization: token,
            'x-ms-path-query': `providers/Microsoft.PowerApps/connections?$expand=permissions($filter=maxAssignedTo('${userId}'))&$filter=environment eq '${environmentName}' and ApiId not in ('shared_logicflows','shared_powerflows')&api-version=2020-06-01&$top=999`
        }
    };
    return axios.get(uri, opt);

}

export async function GetConnectionsNames(token: string, environmentName: string, userId: string) {

    const uri = `https://unitedstates.api.powerapps.com/api/invoke`;
    const opt = {
        headers: {
            Accept: 'application/json',
            Authorization: token,
            'x-ms-path-query': `/providers/Microsoft.PowerApps/apis?showApisWithToS=true&$expand=permissions($filter=maxAssignedTo('${userId}'))&$filter=environment eq '${environmentName}'&api-version=2020-06-01`
        }
    };
    return axios.get(uri, opt);

}

export function GetWithNextLink(token: string, nextLink: string) {

    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.get(nextLink, opt as any);
}

export function GetDeletedFlows(token: string, environmentName: string) {
    // Beta
    const uri = `https://us.api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${environmentName}/flows?$top=50&include=includeDeletedFlows&api-version=2016-11-01`;
    const opt = { headers: { ...defaultHeaders, Authorization: token } };
    return axios.get(uri, opt as any);
}