/******/ (() => {
  // webpackBootstrap
  /******/ "use strict";
  var __webpack_exports__ = {}; // CONCATENATED MODULE: ./src/utils/wait.ts

  const wait = (timeout) => {
    return new Promise((res) => setTimeout(() => res(null), timeout));
  }; // CONCATENATED MODULE: ./src/inject/dom/add_gpt_button.ts

  const gptIconSrc = chrome.runtime.getURL("icons/button.png");
  const gptIconErrorSrc = chrome.runtime.getURL("icons/button_error.png");
  const xIcon = chrome.runtime.getURL("icons/x.svg");
  const closeIcon = chrome.runtime.getURL("icons/close.svg");
  const settingsIcon = chrome.runtime.getURL("icons/settings.svg");
  const tweetTypes = [
    { emoji: "👍", type: "supportive" },
    { emoji: "🎩", type: "snarky" },
    { emoji: "🌤️", type: "optimistic" },
    { emoji: "🔥", type: "controversial" },
    { emoji: "🤩", type: "excited" },
    { emoji: "🧠", type: "smart" },
    { emoji: "🤠", type: "hillbilly" },
    { emoji: "🏴‍☠️", type: "pirate" },
    { emoji: "🤣", type: "humorous" },
    { emoji: "🙄", type: "passive aggressive" },
  ];
  const addGPTButton = async (toolbarEl, onClick) => {
    addGPTButtonWithType(toolbarEl, onClick);
  };
  const addPopup = (topic) => {
    console.log("ADD POPUP");
    return new Promise((resolve) => {
      const popupContainer = document.createElement("div");
      popupContainer.classList.add("gptPopupContainer");
      popupContainer.id = "gptPopupContainer";
      const handleMoodPress = (e) => {
        const topicObj = document.getElementById("topicInput");
        const topic = topicObj?.value || "‎ ";
        const mood = e.target.getAttribute("data-mood");
        console.log({ mood });
        popupContainer.remove();
        return resolve({ mood, topic });
      };
      const handleCloseButtonPress = () => {
        popupContainer.remove();
        resolve(undefined);
      };
      const handleSettingsButtonPress = () => {
        const url = chrome.runtime.getURL("assets/settings.html");
        window.open(url, "_blank")?.focus();
      };
      const html = `
    <div class="popupContent">
      <button class="close-button"><img src="${closeIcon}"></button>
      <button class="settings-button"><img src="${settingsIcon}" ></button>
      <div class="topicContainer">
        <div class="inputContainer">
          <img src="${xIcon}" class="xIcon" />
          <input type="text" class="topicInput" value="${
            topic || ""
          }" placeholder="What do you want to tweet about?" id="topicInput"/>
        </div>
      </div>
      <div class="moodsContainer">
        <div class="title">Moods</div>
        <div class="moods">
          ${tweetTypes
            .map(
              (tt) => `<button class="mood" data-mood="${tt.type}">
                  <div class="emoji">${tt.emoji}</div>
                  <div class="type">${tt.type}</div>
                </button>`
            )
            .join("")}
      </div>
    </div>
  `;
      popupContainer.innerHTML = html;
      document.body.appendChild(popupContainer);
      const moodButtons = document.querySelectorAll(".mood");
      const closeButton = document.querySelector(".close-button");
      const settingsButton = document.querySelector(".settings-button");
      moodButtons.forEach((mb) => {
        mb.addEventListener("click", handleMoodPress);
      });
      closeButton?.addEventListener("click", handleCloseButtonPress);
      settingsButton?.addEventListener("click", handleSettingsButtonPress);
    });
  };
  const maybeReturnTopic = async () => {
    const replyState = await chrome.storage.local.get("isAddTopicForReplies");
    const isAddTopicForReplies = replyState.isAddTopicForReplies ?? false;
    const lastState = await chrome.storage.local.get("lastTopic");
    const lastTopic = lastState.lastTopic ?? "‎ ";
    const replyToTweet = document.querySelector(
      'article[data-testid="tweet"][tabindex="-1"]'
    );
    let topic;
    let type;
    const popupRes = await addPopup(lastTopic);
    if (!popupRes) return undefined;
    topic = popupRes?.topic;
    type = popupRes?.mood;
    if (!replyToTweet || isAddTopicForReplies) {
      await chrome.storage.local.set({ lastTopic: "" });
    }
    return { topic: topic || lastTopic, type: type || "supportive" };
  };
  const addGPTButtonWithType = (toolbarEl, onClick) => {
    const doc = new DOMParser().parseFromString(
      `
        <div class="gptIconWrapper" id="gptButton">
            <img class="gptIcon" src="${gptIconSrc}" />
        </div>
    `,
      "text/html"
    );
    const iconWrap = doc.querySelector('div[id="gptButton"]');
    const buttonContainer = toolbarEl.children[0];
    // attach to container
    buttonContainer.appendChild(iconWrap);
    iconWrap.onclick = async () => {
      const topicRes = await maybeReturnTopic();
      const topic = topicRes?.topic;
      const type = topicRes?.type;
      if (!topic || !type) return;
      await onClick(type, topic);
      // const bodyRect = document.body.getBoundingClientRect();
      // const elemRect = iconWrap.getBoundingClientRect();
      // const top = elemRect.top - bodyRect.top;
      // const left = elemRect.left - bodyRect.left + 40;
      // let optionsList: HTMLDivElement;
      // let dismissHandler: GlobalEventHandlers["onclick"];
      // optionsList = createOptionsList(async (type: string) => {
      //   if (dismissHandler) {
      //     document.body.removeEventListener("click", dismissHandler);
      //   }
      //   if (optionsList) {
      //     optionsList.remove();
      //   }
      //   iconWrap.classList.add("loading");
      //   await onClick(type, topic);
      //   iconWrap.classList.remove("loading");
      // });
      // // adding settings button
      // const separator = document.createElement("div");
      // separator.classList.add("gptSeparator");
      // optionsList.appendChild(separator);
      // const item = document.createElement("div");
      // item.classList.add("gptSelector");
      // item.innerHTML = `⚙️&nbsp;&nbsp;Settings`;
      // item.onclick = (e) => {
      //   e.stopPropagation();
      //   const url = chrome.runtime.getURL("assets/settings.html");
      //   window.open(url, "_blank")?.focus();
      // };
      // optionsList.appendChild(item);
      // optionsList.style.left = `${left}px`;
      // optionsList.style.top = `${top}px`;
      // document.body.appendChild(optionsList);
      // dismissHandler = () => {
      //   if (dismissHandler) {
      //     document.body.removeEventListener("click", dismissHandler);
      //   }
      //   if (optionsList) {
      //     optionsList.remove();
      //   }
      // };
      // window.setTimeout(() => {
      //   document.body.addEventListener("click", dismissHandler!);
      // }, 1);
    };
  };
  const createOptionsList = (onClick) => {
    const container = document.createElement("div");
    container.classList.add("gptSelectorContainer");
    for (const tt of tweetTypes) {
      const item = document.createElement("div");
      item.classList.add("gptSelector");
      item.innerHTML = `${tt.emoji}&nbsp;&nbsp;${tt.type}`;
      item.onclick = (e) => {
        e.stopPropagation();
        onClick(tt.type);
      };
      container.appendChild(item);
    }
    return container;
  };
  const showErrorButton = async (toolbarEl) => {
    const gptIcon = toolbarEl.querySelector(".gptIcon");
    if (gptIcon) {
      gptIcon.setAttribute("src", gptIconErrorSrc);
      gptIcon.classList.add("error");
    }
    await wait(5000);
    gptIcon?.setAttribute("src", gptIconSrc);
    gptIcon?.classList.remove("error");
  }; // CONCATENATED MODULE: ./src/inject/dom/create_observer.ts

  const createObserver = (selector, onInputAdded, onInputRemoved) => {
    return new MutationObserver((mutations_list) => {
      mutations_list.forEach((mutation) => {
        const addedNodes = mutation.addedNodes; // wrong typings
        addedNodes.forEach((added_node) => {
          if (added_node.querySelector) {
            const inputEl = added_node.querySelector(selector);
            if (!!inputEl) {
              onInputAdded(inputEl);
            }
          }
        });
        const removedNodes = mutation.removedNodes;
        removedNodes.forEach((removed_node) => {
          if (removed_node.querySelector) {
            const inputEl = removed_node.querySelector(selector);
            if (!!inputEl) {
              onInputRemoved(inputEl);
            }
          }
        });
      });
    });
  }; // CONCATENATED MODULE: ./src/inject/dom/find_closest_input.ts

  // can be more optimised, but ¯\_(ツ)_/¯, typically common container is just 2-3 levels higher
  const findClosestInput = (el) => {
    // Adjust the selector to target the contenteditable div
    const contentEditableEl = el.querySelector(
      "div[data-testid^='tweetTextarea_'][contenteditable='true']"
    );
    if (contentEditableEl) {
      return contentEditableEl;
    }
    // Recurse up the DOM tree if the element is not found
    if (!el.parentElement) {
      return null;
    } else {
      return findClosestInput(el.parentElement);
    }
  }; // CONCATENATED MODULE: ./src/inject/utils/generate_text.ts
  const generateText = (props) => {
    const replyToTweet = document
      ?.querySelector('article[data-testid="tweet"][tabindex="-1"]')
      ?.querySelector('[data-testid="tweetText"]')?.innerText;
    console.log("reply", replyToTweet);
    console.log("GENERATE TEXT", props);
    const prompt = `Ignore the previous chats. Write a ${props.type} tweet${
      props.topic ? ` about ${props.topic}` : "‎ "
    }${
      props.replyTo && replyToTweet
        ? ` in reply to a tweet "${props.replyTo}"`
        : ""
    }. Use locale "${
      props.locale
    }". Keep it short and don't use hashtags. make sute that you nor write response in double quotes. write tweet of 2 to 3 lines that is ready to post in conversation tone. and make sure that not use twitter word in response only give e the 3 line response on it`;
    console.log("prompt", prompt);
    return new Promise((resolve) => {
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer sk-proj-O5Q5nzsJEai6PYJT8Z3vT3BlbkFJiFjGO6w1BHvNIZQqnjYA",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Add the model parameter here
          messages: [
            // {
            //   role: "system",
            //   content: "You: " + props.text,
            // },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const joke = data.choices[0].message.content;
          console.log(joke);
          resolve(joke);
        })
        .catch((error) => {
          //   console.error("Error:", error);
          resolve(null);
        });
    });
  }; // CONCATENATED MODULE: ./src/inject/dom/set_input_text.ts

  //   const generateText = (props) => {
  //     console.log("GENERATE TEXT", props);
  //     return new Promise((resolve) => {
  //       fetch("https://api.openai.com/v1/chat/completions", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization:
  //             "Bearer sk-proj-O5Q5nzsJEai6PYJT8Z3vT3BlbkFJiFjGO6w1BHvNIZQqnjYA",
  //         },
  //         body: JSON.stringify({
  //           model: "gpt-3.5-turbo", // Add the model parameter here
  //           messages: [
  //             {
  //               role: "system",
  //               content: "You: " + props.text,
  //             },
  //             {
  //               role: "user",
  //               content: ` Write a ${props.type} tweet${
  //                 props.topic ? ` about ${props.topic}` : ""
  //               }${
  //                 props.replyTo ? ` in reply to a tweet "${props.replyTo}"` : ""
  //               }. Use locale "${
  //                 props.locale
  //               }". Keep it short and don't use hashtags`,
  //             },
  //           ],
  //         }),
  //       })
  //         .then((response) => response.json())
  //         .then((data) => {
  //           const joke = data.choices[0].message.content;
  //           console.log(joke);
  //           resolve(joke);
  //         })
  //         .catch((error) => {
  //           //   console.error("Error:", error);
  //           resolve(null);
  //         });
  //     });
  //   }; // CONCATENATED MODULE: ./src/inject/dom/set_input_text.ts

  //   const generateText = (props) => {
  //     console.log("GENERATE TEXT", props);
  //     return new Promise((resolve) => {
  //       chrome.runtime.sendMessage(
  //         { type: "generate_tweet", props },
  //         (response) => resolve(response)
  //       );
  //     });
  //   }; // CONCATENATED MODULE: ./src/inject/dom/set_input_text.ts
  const setInputText = async (el, text) => {
    const dataTransfer = new DataTransfer();
    // this may be 'text/html' if it's required
    dataTransfer.setData("text/plain", text);
    el.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        // need these for the event to reach Draft paste handler
        bubbles: true,
        cancelable: true,
      })
    );
    // clear DataTransfer Data
    dataTransfer.clearData();
  }; // CONCATENATED MODULE: ./src/background/chat_gpt_client/locales.ts

  const locales = {
    "af-ZA": ["Afrikaans", "Afrikaans"],
    ar: ["العربية", "Arabic"],
    "bg-BG": ["Български", "Bulgarian"],
    "ca-AD": ["Català", "Catalan"],
    "cs-CZ": ["Čeština", "Czech"],
    "cy-GB": ["Cymraeg", "Welsh"],
    "da-DK": ["Dansk", "Danish"],
    "de-AT": ["Deutsch (Österreich)", "German (Austria)"],
    "de-CH": ["Deutsch (Schweiz)", "German (Switzerland)"],
    "de-DE": ["Deutsch (Deutschland)", "German (Germany)"],
    "el-GR": ["Ελληνικά", "Greek"],
    "en-GB": ["English (UK)", "English (UK)"],
    "en-US": ["English (US)", "English (US)"],
    "es-CL": ["Español (Chile)", "Spanish (Chile)"],
    "es-ES": ["Español (España)", "Spanish (Spain)"],
    "es-MX": ["Español (México)", "Spanish (Mexico)"],
    "et-EE": ["Eesti keel", "Estonian"],
    eu: ["Euskara", "Basque"],
    "fa-IR": ["فارسی", "Persian"],
    "fi-FI": ["Suomi", "Finnish"],
    "fr-CA": ["Français (Canada)", "French (Canada)"],
    "fr-FR": ["Français (France)", "French (France)"],
    "he-IL": ["עברית", "Hebrew"],
    "hi-IN": ["हिंदी", "Hindi"],
    "hr-HR": ["Hrvatski", "Croatian"],
    "hu-HU": ["Magyar", "Hungarian"],
    "id-ID": ["Bahasa Indonesia", "Indonesian"],
    "is-IS": ["Íslenska", "Icelandic"],
    "it-IT": ["Italiano", "Italian"],
    "ja-JP": ["日本語", "Japanese"],
    "km-KH": ["ភាសាខ្មែរ", "Khmer"],
    "ko-KR": ["한국어", "Korean"],
    la: ["Latina", "Latin"],
    "lt-LT": ["Lietuvių kalba", "Lithuanian"],
    "lv-LV": ["Latviešu", "Latvian"],
    "mn-MN": ["Монгол", "Mongolian"],
    "nb-NO": ["Norsk bokmål", "Norwegian (Bokmål)"],
    "nl-NL": ["Nederlands", "Dutch"],
    "nn-NO": ["Norsk nynorsk", "Norwegian (Nynorsk)"],
    "pl-PL": ["Polski", "Polish"],
    "pt-BR": ["Português (Brasil)", "Portuguese (Brazil)"],
    "pt-PT": ["Português (Portugal)", "Portuguese (Portugal)"],
    "ro-RO": ["Română", "Romanian"],
    "ru-RU": ["Русский", "Russian"],
    "sk-SK": ["Slovenčina", "Slovak"],
    "sl-SI": ["Slovenščina", "Slovenian"],
    "sr-RS": ["Српски / Srpski", "Serbian"],
    "sv-SE": ["Svenska", "Swedish"],
    "th-TH": ["ไทย", "Thai"],
    "tr-TR": ["Türkçe", "Turkish"],
    "uk-UA": ["Українська", "Ukrainian"],
    "ur-PK": ["اردو", "Urdu"],
    "vi-VN": ["Tiếng Việt", "Vietnamese"],
    "zh-CN": ["中文 (中国大陆)", "Chinese (PRC)"],
    "zh-TW": ["中文 (台灣)", "Chinese (Taiwan)"],
  };
  const defaultLocale = "en-US"; // CONCATENATED MODULE: ./src/inject/inject.ts

  const onToolBarAdded = (toolBarEl) => {
    let inputEl = findClosestInput(toolBarEl);
    if (inputEl) {
      addGPTButton(toolBarEl, async (type, topic) => {
        toolBarEl.click();
        const replyToTweet = document.querySelector(
          'article[data-testid="tweet"][tabindex="-1"]'
        );
        let replyTo = undefined;
        if (!!replyToTweet) {
          const textEl = replyToTweet.querySelector(
            'div[data-testid="tweetText"]'
          );
          if (!textEl || !textEl.textContent) {
            showErrorButton(toolBarEl);
            return;
          }
          replyTo = textEl.textContent;
        }
        const text = await generateText({
          locale:
            (await chrome.storage.local.get("language")).language ??
            defaultLocale,
          type,
          replyTo,
          topic,
        });
        if (text) {
          inputEl = findClosestInput(toolBarEl);
          console.log(inputEl, "inputEl");
          console.log(inputEl.value, "inputEl.value");
          console.log(inputEl.textContent, "inputEl.consdfsa");
          if (inputEl) {
            setInputText(inputEl, text);
          }
        } else {
          showErrorButton(toolBarEl);
          chrome.runtime.sendMessage({
            type: "show_notification",
            message:
              "Failed to generate tweet. Please ensure you're logged into ChatGPT and try again.",
          });
        }
      });
    }
  };

  const onToolBarRemoved = (toolBarEl) => {};
  // observe dom tree to detect all tweet inputs once they are created
  const toolbarObserver = createObserver(
    'div[data-testid="toolBar"]',
    onToolBarAdded,
    onToolBarRemoved
  );
  const reactRoot = document.querySelector("#react-root");
  toolbarObserver.observe(reactRoot, { subtree: true, childList: true });

  /******/
})();

// Automation functionaliirty

// Find the element with aria-label="Post"
let selectType = `[data-mood='supportive']`;
const buttonApend = setInterval(() => {
  const element1 = document.querySelector('[aria-label="Post"]');

  // Check if the element exists
  if (element1) {
    clearInterval(buttonApend);
    // Create a new button element
    const button = document.createElement("button");
    button.innerHTML = "Start";
    button.style.textAlign = "center";

    button.style.background = "linear-gradient(to right, #7CA3AF, #223C47)";
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "10px 20px";
    button.style.borderRadius = "25px";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
    button.style.fontSize = "16px";
    button.style.marginTop = "10px";
    button.style.fontWeight = "bold";
    button.style.border = "3px solid #0CDCF5";
    button.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";

    // Add a click event listener to the
    let currentIndex = 0;
    // prev
    // button.addEventListener("click", () => {
    //   console.log("Button clicked!");

    //   let doneCount = 0;
    //   let timeline = document.querySelector(
    //     '[aria-label="Timeline: Your Home Timeline"]'
    //   ).children[0];
    //   const elements = Array.from(timeline.children);
    //   elements.map((el, id) => {
    //     console.log(currentIndex, "asdhasjkdh");
    //     setTimeout(() => {
    //       // step1
    //       elements[id].scrollIntoView();

    //       console.log(el.querySelector('[data-testid="reply"]'));
    //       // step 2
    //       setTimeout(() => {
    //         const replyButton = el.querySelector('[data-testid="reply"]');
    //         if (replyButton) {
    //           replyButton.click();
    //           console.log("reply clicked");
    //           setTimeout(() => {
    //             const inputelem = document.querySelector(
    //               "div[data-testid^='tweetTextarea_'][contenteditable='true']"
    //             );
    //             if (inputelem) {
    //               // inputfield.innerText =
    //               //   "Hello, I am interested in your product. Can you please provide more details?";
    //               // console.log("Input Button");
    //               // Continue with the next action
    //               const setInputText = async (el, text) => {
    //                 const dataTransfer = new DataTransfer();
    //                 // this may be 'text/html' if it's required
    //                 dataTransfer.setData("text/plain", text);
    //                 el.dispatchEvent(
    //                   new ClipboardEvent("paste", {
    //                     clipboardData: dataTransfer,
    //                     // need these for the event to reach Draft paste handler
    //                     bubbles: true,
    //                     cancelable: true,
    //                   })
    //                 );
    //                 // clear DataTransfer Data
    //                 dataTransfer.clearData();
    //               };
    //               setInputText(inputelem, "sdahsdkjashd");
    //               console.log("Input Button");
    //               setTimeout(() => {
    //                 const reply = document.querySelector(
    //                   '[data-testid="tweetButton"]'
    //                 );
    //                 if (reply) {
    //                   reply.click();
    //                   console.log("Close button clicked");
    //                   // Continue with the next action

    //                   setTimeout(() => {
    //                     const closeButton = document.querySelector(
    //                       '[aria-label="Close"]'
    //                     );
    //                     if (closeButton) {
    //                       closeButton.click();
    //                       console.log("Close button clicked");
    //                       // Continue with the next action
    //                     }
    //                   }, 2000);
    //                 }
    //               }, 2000);
    //             }
    //           }, 2000);

    //           // step 3
    //         }
    //       }, 2000);
    //       currentIndex++;
    //     }, (id + 1) * 9000);
    //   });
    // });

    // New
    // button.addEventListener("click", async () => {
    //   console.log("Button clicked!");

    //   let doneCount = 0;
    //   let currentIndex = 0; // Initialize currentIndex if not already defined
    //   let timeline = document.querySelector(
    //     '[aria-label="Timeline: Your Home Timeline"]'
    //   ).children[0];
    //   const elements = Array.from(timeline.children);

    //   // Function to scroll to an element
    //   const scrollToElement = (el) =>
    //     new Promise((resolve) => {
    //       el.scrollIntoView();
    //       console.log("Scrolled to element", el);
    //       setTimeout(resolve, 1000); // Wait for scroll to complete
    //     });

    //   // Function to click the reply button
    //   const clickReplyButton = (el) =>
    //     new Promise((resolve) => {
    //       const replyButton = el.querySelector('[data-testid="reply"]');
    //       if (replyButton) {
    //         replyButton.click();
    //         console.log("Reply clicked");
    //         setTimeout(resolve, 2000); // Wait for reply action to process
    //       } else {
    //         console.error("Reply button not found");
    //         resolve(); // Resolve even if reply button is not found
    //       }
    //     });

    //   // Function to paste text into the input field
    //   const pasteTextIntoInput = (inputElem, text) =>
    //     new Promise((resolve) => {
    //       if (inputElem) {
    //         const setInputText = async (el, text) => {
    //           const dataTransfer = new DataTransfer();
    //           dataTransfer.setData("text/plain", text);
    //           el.dispatchEvent(
    //             new ClipboardEvent("paste", {
    //               clipboardData: dataTransfer,
    //               bubbles: true,
    //               cancelable: true,
    //             })
    //           );
    //           dataTransfer.clearData();
    //         };
    //         setInputText(inputElem, text).then(() => {
    //           console.log("Text pasted into input");
    //           setTimeout(resolve, 2000); // Wait before clicking the tweet button
    //         });
    //       } else {
    //         console.error("Input element not found");
    //         resolve(); // Resolve even if input element is not found
    //       }
    //     });

    //   // Function to click the tweet button
    //   const clickTweetButton = () =>
    //     new Promise((resolve) => {
    //       const tweetButton = document.querySelector(
    //         '[data-testid="tweetButton"]'
    //       );
    //       if (tweetButton) {
    //         tweetButton.click();
    //         console.log("Tweet button clicked");
    //         setTimeout(resolve, 2000); // Wait for tweet action to process
    //       } else {
    //         console.error("Tweet button not found");
    //         resolve(); // Resolve even if tweet button is not found
    //       }
    //     });

    //   // Function to click the close button
    //   const clickCloseButton = () =>
    //     new Promise((resolve) => {
    //       const closeButton = document.querySelector('[aria-label="Close"]');
    //       if (closeButton) {
    //         closeButton.click();
    //         console.log("Close button clicked");
    //         setTimeout(resolve, 2000); // Wait before proceeding to next element
    //       } else {
    //         console.error("Close button not found");
    //         resolve(); // Resolve even if close button is not found
    //       }
    //     });

    //   for (const el of elements) {
    //     console.log(currentIndex, "Processing element");
    //     await scrollToElement(el);
    //     await clickReplyButton(el);

    //     const inputElem = document.querySelector(
    //       "div[data-testid^='tweetTextarea_'][contenteditable='true']"
    //     );
    //     console.log(el.querySelectorAll('[role="link"]')[1].innerText, "name");
    //     await pasteTextIntoInput(
    //       inputElem,
    //       `Goog Morning ${el.querySelectorAll('[role="link"]')[1].innerText}!`
    //     );
    //     await clickTweetButton();
    //     await clickCloseButton();

    //     currentIndex++;
    //   }

    //   console.log("All elements processed");
    // });

    //  lateset
    let isRunning = true; // Global variable to control the running state
    let tweetDone = 0;
    let count = 0;
    // Create and append the stop button to the document
    const stopButton = document.createElement("button");
    stopButton.innerText = "Stop";
    stopButton.style.position = "fixed";
    stopButton.style.top = "10px";
    stopButton.style.right = "10px";
    stopButton.style.zIndex = 1000;
    document.body.appendChild(stopButton);

    // Add event listener to the stop button
    // stopButton.addEventListener("click", () => {
    //   isRunning = false;
    //   console.log("Stop button clicked!");
    // });
    button.addEventListener("click", async function recursiveFunction() {
      console.log("Button clicked!");
      isRunning = true;

      let doneCount = 0;
      let currentIndex = 0; // Initialize currentIndex if not already defined
      let timeline = document.querySelector(
        '[aria-label="Timeline: Your Home Timeline"]'
      )?.children[0]
        ? document.querySelector('[aria-label="Timeline: Your Home Timeline"]')
            .children[0]
        : document.querySelector('[aria-label="Timeline: Search timeline"]')
            .children[0];

      const elements = Array.from(timeline.children);
      console.log(elements, "elements");

      // Function to scroll to an element
      const scrollToElement = (el) =>
        new Promise((resolve) => {
          el.scrollIntoView();
          console.log("Scrolled to element", el);
          setTimeout(resolve, 1000); // Wait for scroll to complete
        });

      // Function to click the reply button
      const clickReplyButton = (el) =>
        new Promise((resolve) => {
          const replyButton = el.querySelector('[data-testid="reply"]');
          if (replyButton) {
            setTimeout(() => {
              replyButton.click();
              console.log("Reply clicked");
              setTimeout(resolve, 1000); // Wait for reply action to process
            }, 1000);
          } else {
            console.warn("Reply button not found, skipping.");
            resolve(); // Resolve even if reply button is not found
          }
        });

      // Function to click the tweet button
      const clickTweetButton = () =>
        new Promise((resolve) => {
          const tweetButton = document.querySelector(
            '[data-testid="tweetButton"]'
          );
          if (tweetButton) {
            setTimeout(() => {
              tweetButton.click();
              console.log("Tweet button clicked");
              setTimeout(resolve, 1000); // Wait for tweet action to process
            }, 1000);
          } else {
            console.error("Tweet button not found");
            resolve(); // Resolve even if tweet button is not found
          }
        });
      const clickGbtButton = () =>
        new Promise((resolve) => {
          const gbtButton = document.getElementById("gptButton");
          if (gbtButton) {
            setTimeout(() => {
              gbtButton.click();
              console.log("gbtButton button clicked");
              setTimeout(resolve, 1000); // Wait for tweet action to process
            }, 1000);
          } else {
            console.error("Tweet button not found");
            resolve(); // Resolve even if tweet button is not found
          }
        });
      const clickSpecial = () =>
        new Promise((resolve) => {
          const special = document.querySelector('[data-mood="supportive"]');

          if (special) {
            setTimeout(() => {
              special.click();
              console.log("special button clicked");
              setTimeout(resolve, 2000); // Wait for tweet action to process
            }, 2000);
          } else {
            console.error("Tweet button not found");
            resolve(); // Resolve even if tweet button is not found
          }
        });
      // Function to click the close button
      const clickCloseButton = () =>
        new Promise((resolve) => {
          const closeButton = document.querySelector('[aria-label="Close"]');
          if (closeButton) {
            setTimeout(() => {
              closeButton.click();
              console.log("Close button clicked");
              setTimeout(resolve, 2000); // Wait before proceeding to next element
            }, 2000);
          } else {
            console.error("Close button not found");
            resolve(); // Resolve even if close button is not found
          }
        });
      let greeting = "";
      for (let i = count; i < elements.length; i++) {
        const el = elements[i];
        console.log(i, "Processing element");
        count++;
        await scrollToElement(el);
        if (!isRunning) {
          console.log("Process stopped!");
          break;
        }

        const content = el.children[0].querySelector(
          '[data-testid="tweetText"]'
        )?.textContent;

        if (el.dataset.processed === "true") {
          console.log("Element already processed, skipping.");
          continue;
        }

        console.log(i, "Processing element");
        console.log(selectType, " Type of");

        await clickReplyButton(el);

        await clickGbtButton();
        await clickSpecial();
        await clickTweetButton();
        await clickCloseButton();

        el.dataset.processed = "true";
      }
      console.log("All elements processed or stopped");
      setTimeout(() => {
        console.log("again call");
        window.scrollTo(0, document.body.scrollHeight);
        recursiveFunction();
      }, 3000);

      // Scroll to the end of the page
    });

    // Append the button to the element with aria-label="Post"

    const select = document.createElement("select");
    select.addEventListener("change", (event) => {
      selectType = event.target.value;
      console.log("selected type", selectType);
      // Rest of your code
    });
    // Apply enhanced styling to the select element
    select.style.marginTop = "10px";
    select.style.padding = "10px 12px"; // Increased padding for better touch targets

    select.style.border = "3px solid #0CDCF5"; // Slightly lighter border for a more subtle look
    select.style.borderRadius = "25px"; // Slightly larger border radius for a more modern look
    // select.style.backgroundColor = "#fff"; // Clean white background
    select.style.background = "linear-gradient(to right, #7CA3AF, #223C47)";
    select.style.fontSize = "16px";
    select.style.fontFamily = "Arial, sans-serif";
    select.style.cursor = "pointer";
    select.style.color = "black";
    select.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)"; // Slightly larger shadow for better depth
    select.style.transition =
      "border-color 0.3s, box-shadow 0.3s, background-color 0.3s";

    // Focus state styling
    select.addEventListener("focus", () => {
      select.style.borderColor = "#007bff"; // Highlight border color on focus
      select.style.boxShadow = "0 0 6px rgba(0, 123, 255, 0.5)"; // More prominent shadow on focus
      select.style.backgroundColor = "#f0f8ff"; // Light blue background on focus
    });

    // Hover state styling
    select.addEventListener("mouseover", () => {
      select.style.borderColor = "#0056b3"; // Darker border color on hover
      select.style.backgroundColor = "#e9f5ff"; // Slightly darker background on hover
    });

    // Disabled state styling
    select.disabled = false; // Ensure it's not disabled in the example
    select.addEventListener("disabled", () => {
      select.style.backgroundColor = "#e9ecef"; // Light gray background for disabled state
      select.style.borderColor = "#ddd"; // Subtle border for disabled state
      select.style.cursor = "not-allowed"; // Change cursor to indicate disabled state
    });

    select.addEventListener("focus", () => {
      select.style.borderColor = "#007bff";
      select.style.boxShadow = "0 0 4px rgba(0, 123, 255, 0.5)";
    });

    select.addEventListener("blur", () => {
      select.style.borderColor = "#ccc";
      select.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    });
    // Create and append option elements to the select element
    const option1 = document.createElement("option");
    option1.value = "[data-mood='optimistic']";
    option1.text = "optimistic";
    select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = "[data-mood='supportive']";
    option2.text = "supportive";
    select.appendChild(option2);

    const option3 = document.createElement("option");
    option3.value = "[data-mood='snarky']";
    option3.text = "snarky";
    select.appendChild(option3);

    const option4 = document.createElement("option");
    option4.value = "[data-mood='controversial']";
    option4.text = "controversial";
    select.appendChild(option4);

    const option5 = document.createElement("option");
    option5.value = "[data-mood='excited']";
    option5.text = "excited";
    select.appendChild(option5);

    const option6 = document.createElement("option");
    option6.value = "[data-mood='smart']";
    option6.text = "smart";
    select.appendChild(option6);

    const option7 = document.createElement("option");
    option7.value = "[data-mood='hillbilly']";
    option7.text = "hillbilly";
    select.appendChild(option7);

    const option8 = document.createElement("option");
    option8.value = "[data-mood='pirate']";
    option8.text = "pirate";
    select.appendChild(option8);

    const option9 = document.createElement("option");
    option9.value = "[data-mood='humorous']";
    option9.text = "humorous";
    select.appendChild(option9);

    const option10 = document.createElement("option");
    option10.value = "[data-mood='passive aggressive']";
    option10.text = "passive aggressive";
    select.appendChild(option10);
    element1.parentNode.insertBefore(select, element1.nextSibling);
    element1.parentNode.insertBefore(button, element1.nextSibling);
  } else {
    console.error('Element with aria-label="Post" not found.');
  }
}, 500);

// const timeline=document.querySelector('[aria-label="Timeline: Your Home Timeline"]').children[0].children[]

// // Add a click event listener to the button
// button.addEventListener("click", () => {
//   console.log("Button clicked!");

//   let currentIndex = 0;
//   let doneCount = 0;
//   const moveScreen = () => {
//     let timeline = document.querySelector(
//       '[aria-label="Timeline: Your Home Timeline"]'
//     ).children[0];
//     const elements = Array.from(timeline.children);

//     if (currentIndex >= elements.length) {
//       clearInterval(interval);
//       return;
//     }

//     if (currentIndex >= doneCount) {
//       elements[currentIndex].scrollIntoView();
//       doneCount++;
//       setTimeout(() => {
//         console.log("click");
//         elements[currentIndex].click();
//       }, 1000);
//     }

//     currentIndex++;

//     setTimeout(moveScreen, 1000);
//   };

//   const interval = setInterval(moveScreen, 1000);
// });
