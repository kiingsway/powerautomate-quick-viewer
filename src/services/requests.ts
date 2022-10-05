import React from 'react'
import axios from 'axios'

const uriApiFlow = "https://us.api.flow.microsoft.com/providers/Microsoft.ProcessSimple";

export function GetEnvironments(token: string) {

    const uri = `${uriApiFlow}/environments`;
    const opt = {
        headers: { 'Accept': 'application/json', 'Authorization': token }
    }

    return axios.get(uri, opt)
}