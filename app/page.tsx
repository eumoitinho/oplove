import OpenLoveLandingClient from "./OpenLoveLandingClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "OpenLove - Rede Social do Amor",
  description: "A rede social brasileira para encontros, relacionamentos e conexões autênticas.",
}

export default function OpenLoveLanding() {
  return <OpenLoveLandingClient />
}
