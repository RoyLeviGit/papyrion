import Cookies from "js-cookie";

// export const urlAuth = `${import.meta.env.VITE_API_URL}/auth`
// export const urlRefresh = `${import.meta.env.VITE_API_URL}/refresh`
// export const urlUploadFile = `${import.meta.env.VITE_API_URL}/upload`
// export const urlListFiles = `${import.meta.env.VITE_API_URL}/list-files`
// export const urlDeleteFiles = `${import.meta.env.VITE_API_URL}/delete-files`
// export const urlQuestionDoc = `${import.meta.env.VITE_API_URL}/question_doc`
// export const urlCompletion = `${import.meta.env.VITE_API_URL}/completion`

export const urlAuth = `/auth`
export const urlRefresh = `/refresh`
export const urlUploadFile = `/upload`
export const urlListFiles = `/list-files`
export const urlDeleteFiles = `/delete-files`
export const urlQuestionDoc = `/question_doc`
export const urlCompletion = `/completion`

export const getNewToken = async (
    handleSuccess: () => void,
    handleError: (error: any) => void,
) => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    fetch(urlAuth, {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        Cookies.set('access_token', data.access_token);
        Cookies.set('refresh_token', data.refresh_token);
        handleSuccess();
    })
    .catch(error => {
        handleError(error);
    });
};

export const refreshToken = async (
    handleSuccess: () => void,
    handleError: (error: any) => void,
) => {
    fetch(urlRefresh, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${Cookies.get('refresh_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        Cookies.set('access_token', data.access_token);
        Cookies.set('refresh_token', data.refresh_token);
        handleSuccess();
    })
    .catch((error) => {
        handleError(error);
    });

};

export const processData = async (
  reader: ReadableStreamDefaultReader,
  handleMessage: (data: any, messageId: string) => string,
  handleDone: () => void,
  initialMessageId: string
) => {
    const decoder = new TextDecoder('utf-8');
    const dataPrefix = 'data: ';

    var messageId = initialMessageId;
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            // Not really breaking here
            break;
        }

        const decodedValue = decoder.decode(value);
        const jsonValue = decodedValue.startsWith(dataPrefix)
            ? decodedValue.slice(dataPrefix.length)
            : decodedValue;
        let json;

        try {
            json = JSON.parse(jsonValue);
        } catch (error) {
            continue;
        }

        if (json.event === 'end_stream') {
            break;
        }

        messageId = handleMessage(json.data, messageId);
    }
    reader.releaseLock();
    handleDone()
};

export const sendSourceRequest = async (
    url: string,
    body: object,
    handleMessage: (data: any, messageId: string) => string,
    handleDone: () => void,
    initialMessageId: string
) => {
    const abortController = new AbortController();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: abortController.signal
    });

    if (response.body) {
        await processData(response.body.getReader(), handleMessage, handleDone, initialMessageId);
    }
    abortController.abort();
};
