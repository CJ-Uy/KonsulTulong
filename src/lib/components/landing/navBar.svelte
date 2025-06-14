<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
	import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";

	// 1. The clean, data-driven structure.
	const navigationData = [
		{ title: "Home", href: "/" },
		{ title: "About", href: "/about" },
		{
			title: "Contact Us",
			subItems: [
				{
					title: "Our Socials",
					href: "/socials",
					description: "Follow us on social media platforms."
				},
				{
					title: "Report an Issue",
					href: "/report-issue",
					description: "Let us know about any problems or concerns."
				},
				{
					title: "Emergency Support",
					href: "/emergency-support",
					description: "Get immediate assistance for urgent matters."
				}
			]
		},
		{
			title: "Other",
			subItems: [
				{
					title: "Clinic Admin Login",
					href: "/clinic-admin-login",
					description: "Access your clinic dashboard."
				},
				{
					title: "Register Your Clinic Now",
					href: "/register-clinic",
					description: "Join our network of healthcare providers."
				}
			]
		}
	];
</script>

<!-- 2. The rendering logic, using YOUR successful positioning strategy. -->
<NavigationMenu.Root viewport={false}>
	<NavigationMenu.List>
		{#each navigationData as navItem}
			<!-- The key is adding `relative` here to create a positioning context -->
			<NavigationMenu.Item class="relative">
				<!-- Direct link -->
				{#if navItem.href}
					<NavigationMenu.Link>
						{#snippet child()}
							<a href={navItem.href} class={navigationMenuTriggerStyle()}>
								{navItem.title}
							</a>
						{/snippet}
					</NavigationMenu.Link>
				{/if}

				<!-- Dropdown menu -->
				{#if navItem.subItems}
					<NavigationMenu.Trigger>{navItem.title}</NavigationMenu.Trigger>
					<NavigationMenu.Content class="absolute top-full left-0 z-50 mt-2" style="width: 275px;">
						<ul
							class="bg-popover text-popover-foreground grid gap-3 rounded-md border p-4 shadow-lg"
						>
							{#each navItem.subItems as subItem}
								<li>
									<NavigationMenu.Link
										href={subItem.href}
										class="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
									>
										<div class="text-sm leading-none font-medium">
											{subItem.title}
										</div>
										<p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
											{subItem.description}
										</p>
									</NavigationMenu.Link>
								</li>
							{/each}
						</ul>
					</NavigationMenu.Content>
				{/if}
			</NavigationMenu.Item>
		{/each}
	</NavigationMenu.List>
</NavigationMenu.Root>
