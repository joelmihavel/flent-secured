import type { ComponentType } from "react"
import { submitHandler, inputStore } from "./AuthflowOverride.tsx"

export function withSubmitButton(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        return (
            <Component
                {...props}
                onClick={() => {
                    console.log("[SubmitButton] inputStore:", inputStore)
                    submitHandler?.(inputStore.phone, inputStore.name)
                }}
            />
        )
    }
}
