import type { ComponentType } from "react"
import { inputStore } from "./AuthflowOverride.tsx"

export function withPhoneInput(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        return (
            <Component
                {...props}
                onChange={(e: any) => {
                    const val = e?.target?.value ?? e
                    console.log("[PhoneInput] value:", val)
                    inputStore.phone = val
                }}
            />
        )
    }
}
