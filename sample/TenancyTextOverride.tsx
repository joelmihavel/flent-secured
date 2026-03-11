import type { ComponentType } from "react"
import { tenancyStore } from "./AuthflowOverride.tsx"

export function withAgreementId(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.agreementId ?? "—"} />
    )
}

export function withPropertyName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.propertyName ?? "—"} />
    )
}

export function withTenants(Component: ComponentType<any>): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.tenants ?? "—"} />
    )
}

export function withLandlords(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.landlords ?? "—"} />
    )
}

export function withMonthlyRent(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.monthlyRent ?? "—"} />
    )
}

export function withDeposit(Component: ComponentType<any>): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.deposit ?? "—"} />
    )
}

export function withRentDuration(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.rentDuration ?? "—"} />
    )
}

export function withExitDate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => (
        <Component {...props} text={tenancyStore?.exitDate ?? "—"} />
    )
}
