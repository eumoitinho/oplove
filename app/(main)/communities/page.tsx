import { Metadata } from "next"
import { CommunitiesClient } from "./communities-client"

export const metadata: Metadata = {
  title: "Comunidades - OpenLove",
  description: "Explore comunidades adultas exclusivas para usuários verificados",
}

export default function CommunitiesPage() {
  return <CommunitiesClient />
}