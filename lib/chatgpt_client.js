async function getInputBox() {
  const inputBox = document.querySelector('textarea[data-id="root"]');
  if (!inputBox) {
    throw new Error("Could not find ChatGPT input box");
  }
  return inputBox;
}

async function getSubmitButton() {
  const submitButton = document.querySelector('button[data-id="root"]');
  if (!submitButton) {
    throw new Error("Could not find ChatGPT submit button");
  }
  return submitButton;
}

async function getLastResponse() {
  const responseElements = document.querySelectorAll(".markdown");
  if (responseElements.length === 0) {
    throw new Error("No response found");
  }
  return responseElements[responseElements.length - 1].textContent;
}

// async function generateTweet(props) {
//     return new Promise(async (resolve) => {
//         const chatGPTTab = await getOrCreateChatGPTTab();
//         await focusTab(chatGPTTab.id);

//         chrome.runtime.sendMessage({ type: 'generate_tweet', props }, async (response) => {
//             return resolve(response);
//         });
//     })
// }

async function generateTweet(props) {
  return new Promise(async (resolve) => {
    const chatGPTTab = await getOrCreateChatGPTTab();
    await focusTab(chatGPTTab.id);
    // Call the Chat GPT API here and get the response
    const apiKey = "sk-proj-O5Q5nzsJEai6PYJT8Z3vT3BlbkFJiFjGO6w1BHvNIZQqnjYA";

    const data = {
      model: "gpt-4", // or another model like 'gpt-3.5-turbo'
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "How do I call the ChatGPT API?" },
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    console.log(responseData, "asdfbasjdfbaskjgfaskgfsajgfaks");
  });
}

function getOrCreateChatGPTTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: "https://chat.openai.com/*" }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        chrome.tabs.create(
          { url: "https://chat.openai.com/", active: false },
          (tab) => {
            resolve(tab);
          }
        );
      }
    });
  });
}

function focusTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.update(tabId, { active: true }, resolve);
  });
}

function closeChatGPTTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabId, resolve);
  });
}
