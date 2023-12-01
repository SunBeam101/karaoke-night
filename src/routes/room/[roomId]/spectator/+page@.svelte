<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { v4 as uuidv4 } from 'uuid';
	import LoadingCheck from '$lib/components/LoadingCheck.svelte';
	import {
		type Item,
		participantList,
		setupWebSocket,
		isPlaying,
		ADD_ITEM_TOPIC,
		participantQueue,
	} from '$lib/stores/socket';
	import type { ActionData, PageData } from './$types';

	let current: Item | null = null;
	let dialog: HTMLDialogElement;
	export let form: ActionData;
	export let data: PageData;

	onMount(() => {
		if (!data.user) {
			dialog.showModal();
		}
	})

	const socket = setupWebSocket($page.params.roomId);

	$: current = $participantList[0] ?? null;

	const addItem = () => {
		const newItem = {
			id: uuidv4(),
			name: data.user?.name || '',
		};

		participantQueue.update((q) => q.insert(newItem));
		socket.emit(ADD_ITEM_TOPIC, newItem);
	};
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Welcome!</h3>
		<p class="py-4">To start, please set your name below:</p>
		<form
			id="nameForm"
			method="post"
			use:enhance={() => {
				return async({ update, result }) => {
					await update();

					if (result.type === 'success') {
						dialog.close();
					}
				}
			}}
			class="mr-4"
		>
			<input
				id="userName"
				name="userName"
				type="text"
				placeholder="Type here"
				class="input input-bordered input-primary input-md w-full"
			/>
			{#if form?.problem}
				<div class="pt-4 text-xs text-error">Error: {form.problem}</div>
			{/if}
		</form>
		<p class="py-4 text-xs text-primary">Note: It will be name that will idendify you in the list.</p>
		<div class="modal-action">
			<button class="btn" type="submit" form="nameForm">Submit</button>
		</div>
	</div>
</dialog>

<div class="h-screen px-4 pt-8 pb-20">
	<div class="h-full relative flex items-center justify-center">

		<LoadingCheck>
			<div class="h-full flex flex-col gap-3 overflow-auto absolute top-0 left-0 right-0">
			{#each $participantList as item (item.id)}
					<div
						class="w-full btn btn-primary join-item"
						class:btn-accent={$isPlaying && item.id === current?.id}
						class:btn-success={!$isPlaying && item.id === current?.id}
					>
						<span>{item.name}</span>
					</div>
				{/each}
			</div>
		</LoadingCheck>

	</div>

</div>


<div class="btm-nav">
	<button class="bg-secondary text-secondary-content rounded-tl-xl">
		<button class="btm-nav-label text-xl">Vote</button>
	</button>
	<button class="bg-primary text-primary-content rounded-tr-xl">
		<button class="btm-nav-label text-xl" on:click={addItem}>Join</button>
	</button>
</div>