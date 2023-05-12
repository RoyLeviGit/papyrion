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

export const sendRequest = async (
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
