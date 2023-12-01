<script>

	import { isLoading } from "$lib/stores/socket";

</script>

{#if $isLoading}
	<span class="loading loading-spinner loading-lg"></span>
{:else}
  <slot />
{/if}