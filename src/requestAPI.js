import fetch from 'node-fetch';

const checkStatus = (response) => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  }
  throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
};

export async function getRequest(url) {
  const response = await fetch(url);
  checkStatus(response);
  const result = await response.json();
  return result;
};

export async function postRequest(url, body) {
  const options = {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch(url, options);
  checkStatus(response);
  const result = await response.json();
  console.log(result.message);
}

const waitFor = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const retryWithBackoff = async (request, args, retries, maxRetries) => {
    try {
        if (retries > 0) {
            const timeToWait = (2 ** retries) * 100;
            await waitFor(timeToWait);
        }
        return await request(...args);
    } catch (e) {
        console.error(e);
        if (retries < maxRetries) {
            return await retryWithBackoff(request, args, retries + 1, maxRetries);
        } else throw e;
    }
}

export function withRetry(request, args) {
    let retries = 0;
    let maxRetries = 5;
    return retryWithBackoff(request, args, retries, maxRetries);
};