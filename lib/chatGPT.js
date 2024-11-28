async function getInputBox() {
    
    const inputBox = document.querySelector('textarea[id="prompt-textarea"]');
    if (!inputBox) {
        throw new Error('Could not find ChatGPT input box');
    }
    return inputBox;
}

async function getSubmitButton() {
    const submitButton = document.querySelector('button[data-testid="send-button"]');
    if (!submitButton) {
        throw new Error('Could not find ChatGPT submit button');
    }
    return submitButton;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        if (request.type === "generate_tweet") {
            const props = request.props;
            const inputBox = await getInputBox();
            const submitButton = await getSubmitButton();

            const prompt = `Ignore the previous chats. Write a ${props.type} tweet${props.topic ? ` about ${props.topic}` : ""}${props.replyTo ? ` in reply to a tweet "${props.replyTo}"` : ""}. Use locale "${props.locale}". Keep it short and don't use hashtags.`;

            //simulate user input   
            inputBox.value = prompt
            inputBox.dispatchEvent(new Event('input', { bubbles: true }));

            submitButton.click();

            setTimeout(() => {
                let timer = setInterval(() => {
                    const stopButton = document.querySelector('button[data-testid="stop-button"]');

                    const conversationTurns = document.querySelectorAll('[data-testid^="conversation-turn-"]');
                    const lastConversationItem = conversationTurns[conversationTurns.length - 1];
                    const hasSVGs = lastConversationItem.querySelectorAll('svg[class="icon-md-heavy"').length > 0;
                    
                    if (stopButton || !hasSVGs) return
                    const responseElements = document.querySelectorAll('.markdown');
                    if (responseElements.length === 0) return

                    clearInterval(timer);
                    const response = responseElements[responseElements.length - 1].textContent;

                    sendResponse(response);
                }, 300)
            }, 2000)

        }
    })()

    return true
})