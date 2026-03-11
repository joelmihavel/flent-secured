import type { ComponentType } from "react"
import { otpStore } from "./OTPInputOverride.tsx"
import { verifyHandler } from "./AuthflowOverride.tsx"

export function withOtpButton(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        return (
            <Component
                {...props}
                onClick={() => {
                    const inputs = document.querySelectorAll("input")
                    console.log("[OtpButton] all inputs found:", inputs.length)
                    inputs.forEach((input, i) => {
                        console.log(
                            `[OtpButton] input[${i}]:`,
                            input.value,
                            input.type,
                            input.placeholder
                        )
                    })
                    let otpValue = ""
                    inputs.forEach((input) => {
                        if (/^\d{4,6}$/.test(input.value)) {
                            otpValue = input.value
                        }
                    })
                    console.log("[OtpButton] found otp:", otpValue)
                    verifyHandler?.(otpValue)
                }}
            />
        )
    }
}
