import type { ComponentType } from "react"
import { proceedHandler } from "./AuthflowOverride.tsx"

export function withProceedButton(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component
            {...props}
            onClick={() => {
                console.log("[ProceedButton] clicked")
                proceedHandler?.()
            }}
        />
    )
}
