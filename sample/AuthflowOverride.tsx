// AuthFlowOverride.tsx
import { useState } from "react"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import type { ComponentType } from "react"

export let setPhoneValue: (val: string) => void = () => {}
export let setNameValue: (val: string) => void = () => {}

export const inputStore = { phone: "", name: "" }
export let submitHandler: ((phone: string, name: string) => void) | null = null
export let verifyHandler: ((otp: string) => void) | null = null
export let proceedHandler: (() => void) | null = null
export let tenancyStore: Record<string, string> | null = null

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────
const SUPABASE_URL = "https://zqlowjveyqiagnbmfwsb.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbG93anZleXFpYWduYm1md3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTY1NTUsImV4cCI6MjA4NDU3MjU1NX0.k-CdevFklQdbfs9s-89_5RXke-Wcx6lVzu8gcolL0NM"

const ENDPOINTS = {
    authOtp: `${SUPABASE_URL}/functions/v1/landlord-auth-otp`,
    getTenancy: `${SUPABASE_URL}/functions/v1/get-landlord-tenancy`,
    notifyLandlord: `${SUPABASE_URL}/functions/v1/landlord-confirm`,
}

// ─────────────────────────────────────────────
// SUPABASE CLIENT
// ─────────────────────────────────────────────
const supabase = createClient("", SUPABASE_ANON_KEY)
console.log("Here after supabase connection")
// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function post(url: string, body: object, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY, // ← ADD THIS
    }
    if (token) headers["Authorization"] = `Bearer ${token}`
    const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || data.error || "Request failed")
    return data
}

async function get(url: string, token: string) {
    const res = await fetch(url, {
        headers: {
            apikey: SUPABASE_ANON_KEY, // ← ADD THIS
            Authorization: `Bearer ${token}`,
        },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || data.error || "Request failed")
    return data
}
console.log("Just before OTP sending")
// ─────────────────────────────────────────────
// SHARED STATE (module-level so it persists
// across Framer's re-renders of the override)
// ─────────────────────────────────────────────
let _phone = ""
let _name = ""
let _method = ""
let _otpRequestId: string | null = null
let _accessToken = ""
let _tenancyId: string | null = null
let _tenancy: Record<string, string> | null = null

export function getInputValues() {
    console.log("[getInputValues] returning:", inputStore)
    return { phone: inputStore.phone, name: inputStore.name }
}

// ─────────────────────────────────────────────
// THE OVERRIDE
// ─────────────────────────────────────────────
export function withAuthFlow(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [variant, setVariant] = useState("Variant 1")
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState("")
        const [, forceUpdate] = useState(0)
        const refresh = () => forceUpdate((n) => n + 1)

        console.log("Handle submit was called")
        setPhoneValue = (val) => {
            inputStore.phone = val
            console.log("[AuthFlow] inputStore.phone set to:", inputStore.phone)
        }
        setNameValue = (val) => {
            inputStore.name = val
            console.log("[AuthFlow] inputStore.name set to:", inputStore.name)
        }
        // ── STEP 1: Send OTP ──────────────────
        const handleSubmit = async (phone: string, name: string) => {
            console.log("[handleSubmit] received:", {
                phone,
                name,
                phoneEmpty: !phone,
                nameEmpty: !name,
            })
            // setPhoneValue = (val) => {
            //     inputStore.phone = val
            //     console.log(
            //         "[AuthFlow] inputStore.phone set to:",
            //         inputStore.phone
            //     )
            // }
            // setNameValue = (val) => {
            //     inputStore.name = val
            //     console.log(
            //         "[AuthFlow] inputStore.name set to:",
            //         inputStore.name
            //     )
            // }

            console.log("Values received:", {
                phone,
                name,
                phoneLength: phone?.length,
                nameLength: name?.length,
            })
            console.log("Handling submit button on main page")
            setError("")
            if (!phone) {
                setError("Phone number is required")
                return
            }
            if (!name) {
                setError("Name is required")
                return
            }
            _phone = phone
            _name = name

            setLoading(true)
            try {
                console.log("Sending OTP")
                const nameFromEmail =
                    name
                        .split("@")[0]
                        .replace(/[^a-zA-Z0-9 .\-]/g, "")
                        .trim() || "User"
                const data = await post(ENDPOINTS.authOtp, {
                    action: "send_otp",
                    phone_number: phone.trim(),
                })
                console.log("send_otp was a success")
                console.log("send_otp full response:", JSON.stringify(data))
                _otpRequestId = data.data.otp_request_id
                setVariant("Variant 2")
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        submitHandler = handleSubmit

        // ── STEP 2: Verify OTP ────────────────
        // const handleVerifyOtp = async (otp: string) => {
        //     console.log("Here verifying otp")
        //     setError("")
        //     if (!otp || otp.length !== 6) {
        //         alert("Enter the 6-digit OTP — received: '" + otp + "'")
        //         setError("Enter the 6-digit OTP")
        //         return
        //     }
        //     setLoading(true)
        //     try {
        //         let token = ""

        //         if (_method === "cashfree") {
        //             const data = await post(ENDPOINTS.authOtp, {
        //                 action: "verify_otp",
        //                 phone_number: _phone.trim(),
        //                 otp,
        //                 otp_request_id: _otpRequestId,
        //             })
        //             if (data.data.session?.access_token) {
        //                 token = data.data.session.access_token
        //                 await supabase.auth.setSession({
        //                     access_token: data.data.session.access_token,
        //                     refresh_token: data.data.session.refresh_token,
        //                 })
        //             } else if (data.data.token_hash) {
        //                 const { data: sessionData, error: verifyError } =
        //                     await supabase.auth.verifyOtp({
        //                         token_hash: data.data.token_hash,
        //                         type: "magiclink",
        //                     })
        //                 if (verifyError) throw new Error(verifyError.message)
        //                 token = sessionData.session?.access_token ?? ""
        //             }
        //         } else {
        //             const phoneFormatted = _phone.trim().startsWith("+")
        //                 ? _phone.trim()
        //                 : `+91${_phone.trim().replace(/\D/g, "")}`
        //             const { data: sessionData, error: verifyError } =
        //                 await supabase.auth.verifyOtp({
        //                     phone: phoneFormatted,
        //                     token: otp,
        //                     type: "sms",
        //                 })
        //             if (verifyError) throw new Error(verifyError.message)
        //             token = sessionData.session?.access_token ?? ""
        //         }

        //         if (!token)
        //             throw new Error("Authentication failed. Please try again.")
        //         _accessToken = token

        //         // Fetch tenancy
        //         console.log("[fetchTenancy] calling get-landlord-tenancy...")
        //         const tenancyResponse = await get(ENDPOINTS.getTenancy, token)
        //         console.log(
        //             "[fetchTenancy] raw response:",
        //             JSON.stringify(tenancyResponse)
        //         )

        //         const t = tenancyResponse.data
        //         if (!t) {
        //             setLoading(false)
        //             alert(
        //                 "No tenancy found for this phone number. Please contact support."
        //             )
        //             return // stays on Variant 2
        //         }

        //         _tenancyId = t.id
        //         _tenancy = {
        //             agreementId: t.agreement_cert_id ?? t.id,
        //             propertyName: t.property_name ?? t.property_address,
        //             tenants:
        //                 Array.isArray(t.tenant_names) &&
        //                 t.tenant_names.length > 0
        //                     ? t.tenant_names.join(", ")
        //                     : (t.tenant_name ?? "—"),
        //             landlords:
        //                 Array.isArray(t.landlord_names) &&
        //                 t.landlord_names.length > 0
        //                     ? t.landlord_names.join(", ")
        //                     : (t.landlord_name ?? "—"),
        //             monthlyRent: t.monthly_rent_paise
        //                 ? `₹${(t.monthly_rent_paise / 100).toLocaleString("en-IN")}`
        //                 : "—",
        //             deposit: t.security_deposit_paise
        //                 ? `₹${(t.security_deposit_paise / 100).toLocaleString("en-IN")}`
        //                 : "—",
        //             rentDuration: t.rent_duration_months
        //                 ? `${t.rent_duration_months} months`
        //                 : `${t.lease_start_date ?? "—"} – ${t.lease_end_date ?? "—"}`,
        //             exitDate: t.lease_end_date ?? "—",
        //         }
        //         console.log("[fetchTenancy] mapped _tenancy:", _tenancy)
        //         refresh()
        //         tenancyStore = _tenancy
        //         setVariant("Variant 3")
        //     } catch (e: any) {
        //         console.error("[verifyOtp] error:", e.message)
        //         alert(e.message) // visible to user immediately
        //         setError(e.message)
        //         return
        //     } finally {
        //         setLoading(false)
        //     }
        // }
        // verifyHandler = handleVerifyOtp
        const handleVerifyOtp = async (otp: string) => {
            console.log("Here verifying otp")
            setError("")
            if (!otp || otp.length !== 6) {
                alert("Enter the 6-digit OTP — received: '" + otp + "'")
                setError("Enter the 6-digit OTP")
                return
            }

            setLoading(true)
            try {
                // Verify OTP via M360
                const data = await post(ENDPOINTS.authOtp, {
                    action: "verify_otp",
                    phone_number: _phone.trim(),
                    otp,
                    otp_request_id: _otpRequestId,
                })

                const token = data.data.session?.access_token
                if (!token)
                    throw new Error("Authentication failed. Please try again.")
                _accessToken = token

                await supabase.auth.setSession({
                    access_token: data.data.session.access_token,
                    refresh_token: data.data.session.refresh_token,
                })

                // Fetch tenancy
                console.log("[fetchTenancy] calling get-landlord-tenancy...")
                const tenancyResponse = await get(ENDPOINTS.getTenancy, token)
                console.log(
                    "[fetchTenancy] raw response:",
                    JSON.stringify(tenancyResponse)
                )

                const t = tenancyResponse.data
                if (!t) {
                    setLoading(false)
                    alert(
                        "No tenancy found for this phone number. Please contact support."
                    )
                    return
                }

                _tenancyId = t.id
                _tenancy = {
                    agreementId: t.agreement_cert_id ?? t.id,
                    propertyName: t.property_name ?? t.property_address,
                    tenants:
                        Array.isArray(t.tenant_names) &&
                        t.tenant_names.length > 0
                            ? t.tenant_names.join(", ")
                            : (t.tenant_name ?? "—"),
                    landlords:
                        Array.isArray(t.landlord_names) &&
                        t.landlord_names.length > 0
                            ? t.landlord_names.join(", ")
                            : (t.landlord_name ?? "—"),
                    monthlyRent: t.monthly_rent_paise
                        ? `₹${(t.monthly_rent_paise / 100).toLocaleString("en-IN")}`
                        : "—",
                    deposit: t.security_deposit_paise
                        ? `₹${(t.security_deposit_paise / 100).toLocaleString("en-IN")}`
                        : "—",
                    rentDuration: t.rent_duration_months
                        ? `${t.rent_duration_months} months`
                        : `${t.lease_start_date ?? "—"} – ${t.lease_end_date ?? "—"}`,
                    exitDate: t.lease_end_date ?? "—",
                }
                console.log("[fetchTenancy] mapped _tenancy:", _tenancy)
                refresh()
                tenancyStore = _tenancy
                setVariant("Variant 3")
            } catch (e: any) {
                console.error("[verifyOtp] error:", e.message)
                alert(e.message)
                setError(e.message)
                return
            } finally {
                setLoading(false)
            }
        }
        verifyHandler = handleVerifyOtp

        // ── STEP 3: Send landlord invite ──────
        const handleProceed = async () => {
            console.log("[handleProceed] called")
            setError("")

            // Move to Variant 4 immediately — verification runs in background
            setVariant("Variant 4")

            // Fire and forget — don't await, don't block UI
            post(ENDPOINTS.notifyLandlord, {}, _accessToken)
                .then((result) => {
                    console.log(
                        "[handleProceed] notify-landlord response:",
                        JSON.stringify(result)
                    )
                })
                .catch((e) => {
                    console.error(
                        "[handleProceed] notify-landlord error (background):",
                        e.message
                    )
                })
        }
        proceedHandler = handleProceed
        // ── Resend OTP ────────────────────────
        const handleResend = async () => {
            setError("")
            setLoading(true)
            try {
                if (_method === "cashfree" && _otpRequestId) {
                    const data = await post(ENDPOINTS.authOtp, {
                        action: "resend_otp",
                        otp_request_id: _otpRequestId,
                    })
                    _otpRequestId = data.data.otp_request_id
                } else {
                    await post(ENDPOINTS.authOtp, {
                        action: "route_otp",
                        phone_number: _phone.trim(),
                        name: _name.trim(),
                    })
                }
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }

        return (
            <Component
                {...props}
                variant={variant}
                // Pass to Version1 inputs/button
                onSubmit={handleSubmit}
                // Pass to Version2 input/button
                onVerifyOtp={handleVerifyOtp}
                onResend={handleResend}
                // Pass to Version3 — tenancy data + button
                tenancy={_tenancy}
                onProceed={handleProceed}
                // Global
                loading={loading}
                error={error}
            />
        )
    }
}
