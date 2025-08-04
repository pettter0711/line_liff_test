import { appScriptUrl, appLiffId } from "./env.js";

const options = {
    data() {
        return {
            liffId: appLiffId,
            scriptUrl: appScriptUrl,
            userId: "",
            status: "初始化中...",
        };
    },
    methods: {
        async getUser() {
            const liffId = this.liffId;

            try {
                await liff.init({ liffId });
                if (!liff.isLoggedIn()) {
                    liff.login();
                    console.log("liff尚未登入");
                    return;
                }

                const profile = await liff.getProfile();
                const userId = profile.userId;

                this.status = "初始化完成";
                this.userId = userId;

                await fetch(this.scriptUrl, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain" },
                    body: JSON.stringify({ userId }),
                })
                    .then((res) => {
                        return res.text();
                    })
                    .then((msg) => {
                        console.log(`GAS 回應: ${msg}`);
                    })
                    .catch((err) => {
                        console.error(`傳送失敗: ${err}`);
                    });

                // fetch(`${this.scriptUrl}?userId=${userId}`)
                //     .then((res) => {
                //         return res.text();
                //     })
                //     .then((text) => {
                //         alert(text);
                //     });
            } catch (e) {
                this.status = "初始化錯誤";
                console.error(e);
            }
        },
    },
    mounted() {
        console.log("mounted");
    },
};

const { createApp } = Vue;
const app = createApp(options);
app.mount("#app");
