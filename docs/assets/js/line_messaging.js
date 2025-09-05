import { appScriptUrl, appLiffId } from "./env.js";
import { getApi } from "./components/ApiUtils.js";

const options = {
    data() {
        return {
            liffId: appLiffId,
            scriptUrl: appScriptUrl,
            depts: [],
            sections: [],
            groups: [],
            userInfo: {
                id: "",
                name: "",
                dept: "",
                section: "",
                group: "",
                position: "",
            },
            popover: {
                dept: false,
                section: false,
                group: false,
            },
            isAgree: false,
        };
    },
    methods: {
        /**
         * 1. 表單中的部門、組別、職位改成選單式，姓名為手動輸入 => okay
         * 2. 當部門為"生管課"，會跳出組別輸入欄，此時組別為必填 => okay
         * 3. 隱私權同意框要勾選，才能按下送出按鈕。 => okay
         * 3. 送出表單，先檢查表單內容是否輸入，才會進入Line登入驗證環節 => okay
         * 4. Line登入驗證完成後，再整個表單傳送到google sheet
         * 5. 如表單內容未填，會跳提示訊息 => okay
         * 6. 送出完成後，自動關閉視窗
         */

        async deptOptionAct(data) {
            this.groups = [];
            this.userInfo.section = "";
            this.userInfo.position = "";

            // 使用 find 方法找到對應的部門資料
            const selectedDept = this.depts.find((dept) => dept.en === data);

            if (!selectedDept) {
                console.warn(`找不到部門: ${data}`);
                this.sections = [];
                return;
            }

            // 根據部門是否有課別來載入資料
            if (selectedDept.sec) {
                this.sections = await getApi(
                    "./assets/database/userInfoSection.json"
                );
            } else {
                this.sections = [];
            }

            // 當選擇"總經理"時，自動填入職位
            if (selectedDept.zh === "總經理") {
                this.userInfo.position = "總經理";
            }
        },

        async sectionOptionAct(data) {
            this.userInfo.group = "";
            this.userInfo.position = "";

            // 使用 find 方法找到對應的課別資料
            const selectedSection = this.sections.find(
                (section) => section.en === data
            );

            if (!selectedSection) {
                console.warn(`找不到課別: ${data}`);
                this.groups = [];
                return;
            }

            // 根據課別是否有組別來載入資料
            if (selectedSection.group) {
                this.groups = await getApi(
                    "./assets/database/userInfoGroup.json"
                );
            } else {
                this.groups = [];
            }
        },

        cleanForm() {
            for (let k in this.userInfo) {
                this.userInfo[k] = "";
            }
            this.sections = [];
            this.groups = [];
            this.isAgree = false;
        },

        verifyForm() {
            // 當沒有課別欄位，userInfo的課別自動帶入為"N/A"
            if (this.sections.length <= 0) {
                this.userInfo.section = "N/A";
            }

            // 當沒有組別欄位，userInfo的組別自動帶入為"N/A"
            if (this.groups.length <= 0) {
                this.userInfo.group = "N/A";
            }

            const requires = {
                // id: "系統錯誤，請稍後",
                name: "請輸入姓名!",
                dept: "請輸入部門!",
                section: "請輸入課別!",
                group: "請輸入組別!",
                position: "請輸入職位!",
            };

            for (let key in requires) {
                if (this.userInfo[key] === "") {
                    Swal.fire({
                        title: requires[key],
                        html: "",
                        icon: "error",
                    });

                    return false;
                }
            }

            return true;
        },

        async getUserId() {
            const liffId = this.liffId;

            try {
                await liff.init({ liffId });
                if (!liff.isLoggedIn()) {
                    liff.login();
                    console.log("liff尚未登入");
                    return;
                }

                const profile = await liff.getProfile();
                this.userInfo.id = profile.userId;
            } catch (e) {
                console.error(e);
            }
        },

        async uploadInfo() {
            /**發送資料
             * 1. 表單內容okay，建立line官方帳號用的user id
             * 2. 將 user id 及 使用者資料 整理成form
             * 2. 傳輸給google sheet
             */

            if (!this.isAgree) {
                Swal.fire({
                    title: "請確認使用者協議!",
                    html: "",
                    icon: "error",
                });
                return;
            }

            let verifyForm = this.verifyForm();
            if (!verifyForm) return;

            // 測試用
            this.userInfo.id = "我是假ID";

            let userForm = new FormData();
            for (let k in this.userInfo) {
                userForm.append(k, this.userInfo[k].trim());
            }

            let test = {};
            userForm.forEach((item, key) => {
                test[key] = item;
                console.log(key);
            });

            console.log(test);

            // 登入成功後的init
            Swal.fire({
                title: "資料登入成功",
                html: "",
                icon: "success",
                timer: 1200,
            }).then(() => {
                this.cleanForm();
            });

            return;

            // 1. 表單內容okay，建立line官方帳號用的user id
            await this.getUserId();

            // 2. 將使用者資料整理成form
            // let userForm = new FormData();
            for (let k in this.userInfo) {
                userForm.append(k, this.userInfo[k].trim());
            }

            // 3. 傳輸給google sheet
            try {
                const response = await fetch(this.scriptUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }, // JSON格式
                    body: JSON.stringify(userForm),
                });
            } catch (error) {
                Swal.fire({
                    title: "登陸失敗!",
                    html: "",
                    icon: "error",
                });

                console.error(error);
            }

            // 舊
            // await fetch(this.scriptUrl, {
            //     method: "POST",
            //     headers: { "Content-Type": "text/plain" },
            //     body: JSON.stringify(this.userInfo.id),
            // })
            //     .then((res) => {
            //         return res.text();
            //     })
            //     .then((msg) => {
            //         console.log(`GAS 回應: ${msg}`);
            //     })
            //     .catch((err) => {
            //         console.error(`傳送失敗: ${err}`);
            //     });
        },
    },
    async mounted() {
        console.log("mounted");
        let deptsRoot = "./assets/database/userInfoDept.json";
        this.depts = await getApi(deptsRoot);
    },
};

const { createApp } = Vue;
const app = createApp(options);
app.mount("#app");
