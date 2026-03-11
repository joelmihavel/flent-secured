import type { ComponentType } from "react"

export const otpStore = { otp: "" }

export function withOtpInput(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        return (
            <Component
                {...props}
                onChange={(e: any) => {
                    const val = e?.target?.value ?? e
                    console.log("[OtpInput] onChange value:", val)
                    otpStore.otp = val
                }}
                onValueChange={(val: any) => {
                    console.log("[OtpInput] onValueChange:", val)
                    otpStore.otp = val
                }}
                onInput={(e: any) => {
                    const val = e?.target?.value ?? e
                    console.log("[OtpInput] onInput value:", val)
                    otpStore.otp = val
                }}
            />
        )
    }
}
