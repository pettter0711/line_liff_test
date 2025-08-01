const access_token =
    "wHGKwtZNCmUwqQap7Vm6pCk3ia7RBIwsLG5gsQ2OOqu+XAnJbKUxpG6ZW6j2n3pluEIe1pN/eGzVqkgsqmlrMZSbux2APWUeRWvU7wfcktFxY37bmgdca32s08VaQQHr5zTiwt7C6BOCYXZ9TEJVIAdB04t89/1O/w1cDnyilFU=";

const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const users = sheet
    .getRange("A2:A")
    .getValues()
    .flat()
    .filter((id) => id);

function sendLineReminders() {
    users.forEach((userId) => {
        const payload = {
            to: userId,
            messages: [
                {
                    type: "text",
                    text: "早安~記得打卡喔!✅",
                },
            ],
        };

        const options = {
            method: "post",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer" + access_token,
            },
            payload: JSON.stringify(payload),
        };

        UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
    });
}
