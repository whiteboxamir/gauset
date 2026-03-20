import { redirect } from "next/navigation";

export default async function AuthLoginAliasPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; email?: string }>;
}) {
    const params = await searchParams;
    const next = params.next?.trim();
    const email = params.email?.trim();
    const destination = new URL("/login", "http://gauset.local");

    if (next) {
        destination.searchParams.set("next", next);
    }
    if (email) {
        destination.searchParams.set("email", email);
    }

    redirect(`${destination.pathname}${destination.search}`);
}
