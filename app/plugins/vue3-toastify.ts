// Docs: https://vue3-toastify.js-bridge.com/get-started/introduction.html

import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"

export default defineNuxtPlugin(() => {
    const config = useToastifyConfig()

    config.autoClose = 5000
    config.position = "bottom-center"
    config.theme = "colored"

    return {
        provide: {
            toastMessage: toast,
        },
    }
})
