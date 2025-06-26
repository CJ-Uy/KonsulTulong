<script lang="ts">
  import SidebarProvider from "$lib/components/ui/sidebar/sidebar-provider.svelte";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import SiteHeader from "$lib/components/site-header.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  let { children } = $props();
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<SiteHeader />
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>