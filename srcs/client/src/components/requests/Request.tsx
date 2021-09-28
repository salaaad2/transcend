async function Request<TResponse>(url:string,
                                  config: RequestInit = {}): Promise<TResponse> {
    const response = await fetch(url, config);
    if (response.ok === false)
        throw Error(response.statusText);
    return await response.json();
}

export default Request;
