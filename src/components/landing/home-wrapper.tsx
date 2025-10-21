"use client"

import dynamic from "next/dynamic"

const HomeClient = dynamic(() => import("@/components/landing/home-client"), {
  ssr: false,
})

export default function HomeWrapper() {
  return <HomeClient />
}