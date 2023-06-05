document.addEventListener('DOMContentLoaded', function () {
    const rawBartenderInput = document.querySelector("#rawInput");
    const submitButton = document.querySelector('#submit-button');


    submitButton.addEventListener('click', function () {
        const output = parseBartenderInput(rawInput.value);
        const email = output.email;
        const username = output.username;
        const password = output.password;

        // Open the login page
        browser.tabs.create({
            url: 'https://login.newrelic.com/login'
        }).then((tab) => {
            // Fill the login email field
            browser.tabs.executeScript(tab.id, {
                code: `
          document.querySelector('#login_email').value = '${email}';
        `
            }).then(() => {
                // Submit the form
                browser.tabs.executeScript(tab.id, {
                    code: `
            document.querySelector('#login_submit').click();
          `
                }).then(() => {
                    // Listen for the redirected page to load

                    browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
                        if (tab.active && changeInfo.status === 'complete') {
                            // Execute content script on the redirected page
                            browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
                                const activeTab = tabs[0];
                                browser.tabs.executeScript(activeTab.id, {
                                    code: `
                                        const userInput = document.querySelector('#userInput').value = '${username}';
                                        document.querySelector('#userNameFormSubmit').click();
                                    `
                                });
                            }).then(() => {
                                browser.tabs.executeScript(tab.id, {
                                    code: `
                                        document.querySelector('#password').value = '${password}';
                                        document.querySelector('#signIn').click();
          `
                                });
                            });
                        }
                    });
                });
            });
        });
    });
});


function parseBartenderInput(rawInput) {
    const email = extractEmail(rawInput);
    const username = extractUsernameFromEmail(email)
    const password = extractPassword(rawInput)
    return {
        email,
        username,
        password
    };
}

function extractEmail(text) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

    const emailMatch = text.match(emailRegex);

    if (emailMatch) {
        return emailMatch[1].trim();
    } else {
        return '';
    }
}

function extractUsernameFromEmail(email) {
    const atIndex = email.indexOf('@');
    if (atIndex !== -1) {
        return email.substring(0, atIndex).trim();
    }
    return '';
}

function extractPassword(text) {
    const passwordRegex = /Account Password:\s+(.*)/;
    const passwordMatch = text.match(passwordRegex);
    return passwordMatch ? passwordMatch[1].trim() : '';
}