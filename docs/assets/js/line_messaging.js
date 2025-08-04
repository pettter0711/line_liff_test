import { appScriptUrl, appLiffId } from "./env.js";

const options = {
    data() {
        return {
            liffId: appLiffId,
            scriptUrl: appScriptUrl,
        };
    },
    methods: {
        async getUser() {
            const liffId = this.liffId;

            await liff.init({ liffId });
            if (!liff.isLoggedIn()) {
                liff.login();
                console.log("liff尚未登入");
                return;
            }

            const profile = await liff.getProfile();
            const userId = profile.userId;

            console.log(userId);

            await fetch(this.scriptUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            // fetch(`${this.scriptUrl}?userId=${userId}`)
            //     .then((res) => {
            //         return res.text();
            //     })
            //     .then((text) => {
            //         alert(text);
            //     });
        },
    },
    mounted() {
        console.log("mounted");
    },
};

const { createApp } = Vue;
const app = createApp(options);
app.mount("#app");
