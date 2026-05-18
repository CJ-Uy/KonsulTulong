<script lang="ts">
	import "../../app.css";
	import { signOut } from "$lib/auth-client";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	let { data, children } = $props();

	const navItems = [
		{ href: "/dashboard/queue", label: "Queue", roles: ["secretary", "admin", "doctor"] },
		{ href: "/dashboard/consult", label: "Consult", roles: ["doctor", "admin"] },
		{ href: "/dashboard/forms", label: "Forms", roles: ["doctor", "admin"] },
		{ href: "/dashboard/flows", label: "Flows", roles: ["doctor", "admin"] },
		{ href: "/dashboard/settings", label: "Settings", roles: ["admin"] }
	];

	const visibleNav = $derived(navItems.filter((n) => n.roles.includes(data.user.role)));

	async function logout() {
		await signOut();
		goto("/login");
	}
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-b">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
			<a href="/dashboard" class="font-bold">KonsulTulong</a>
			<nav class="flex gap-4 text-sm">
				{#each visibleNav as item (item.href)}
					<a
						href={item.href}
						class="hover:underline {page.url.pathname.startsWith(item.href)
							? 'font-semibold'
							: 'text-muted-foreground'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="flex items-center gap-3 text-xs">
				{#if data.clinic}
					<span class="text-muted-foreground">{data.clinic.name} · {data.clinic.code}</span>
				{/if}
				<button class="underline" onclick={logout}>Sign out</button>
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
		{@render children()}
	</main>
</div>
