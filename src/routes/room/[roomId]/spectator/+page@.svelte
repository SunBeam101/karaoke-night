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
		participantQueue
	} from '$lib/stores/socket';
	import type { ActionData, PageData } from './$types';

	let current: Item | null = null;
	let userDialog: HTMLDialogElement;
	let songDialog: HTMLDialogElement;
	export let form: ActionData;
	export let data: PageData;

	onMount(() => {
		if (!data.user) {
			userDialog.showModal();
		}
	});

	const socket = setupWebSocket($page.params.roomId);

	$: current = $participantList[0] ?? null;

	const addItem = (
		event: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) => {
		const formData = new FormData(event.currentTarget);
		const newItem: Item = {
			id: uuidv4(),
			userName: data.user?.name || '',
			songName: formData.get('songName')?.toString() || '',
			songUrl: formData.get('songUrl')?.toString() || undefined
		};

		participantQueue.update((q) => q.insert(newItem));
		socket.emit(ADD_ITEM_TOPIC, newItem);

		event.currentTarget.reset();
		songDialog.close();
	};
</script>

<dialog bind:this={userDialog} class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Welcome!</h3>
		<p class="py-4">To start, please set your name below:</p>
		<form
			id="nameForm"
			method="post"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update();

					if (result.type === 'success') {
						userDialog.close();
					}
				};
			}}
			class="mr-4"
		>
			<input
				id="userName"
				name="userName"
				type="text"
				required
				placeholder="Type here"
				class="input input-bordered input-primary input-md w-full"
			/>
			{#if form?.problem}
				<div class="pt-4 text-xs text-error">Error: {form.problem}</div>
			{/if}
		</form>
		<p class="py-4 text-xs text-primary">
			Note: It will be name that will idendify you in the list.
		</p>
		<div class="modal-action">
			<button class="btn" type="submit" form="nameForm">Submit</button>
		</div>
	</div>
</dialog>

<dialog bind:this={songDialog} class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Add your song</h3>
		<form id="addSongForm" on:submit|preventDefault={addItem} class="mr-4">
			<div class="form-control w-full max-w-xs mb-2">
				<label for="songName" class="label">
					<span class="label-text">Song name</span>
				</label>
				<input
					id="songName"
					name="songName"
					type="text"
					required
					placeholder="Type here your song"
					class="input input-bordered input-primary input-md w-full"
				/>
			</div>
			<div class="form-control w-full max-w-xs">
				<label for="songUrl" class="label">
					<span class="label-text">Song URL (Optional)</span>
				</label>
				<input
					id="songUrl"
					name="songUrl"
					type="text"
					placeholder="Type here your song url"
					class="input input-bordered input-primary input-md w-full"
				/>
			</div>
			<div class="modal-action">
				<button class="btn btn-secondary" type="button" on:click={() => songDialog.close()}
					>Close</button
				>
				<button class="btn btn-primary" type="submit" form="addSongForm">Submit</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<div class="h-screen px-4 pt-8 pb-20">
	<div class="h-full relative flex items-center justify-center">
		<LoadingCheck>
			<div class="h-full flex flex-col gap-3 overflow-auto absolute top-0 left-0 right-0">
				{#if !$participantList.length}
					<div class="text-3xl text-primary">List is empty...</div>
					<div class="text-3xl text-primary">Join via the button below 👇</div>
				{/if}
				{#each $participantList as item (item.id)}
					<div
						class="w-full btn btn-primary join-item"
						class:btn-accent={$isPlaying && item.id === current?.id}
					>
						<span>{item.songName} ({item.userName})</span>
					</div>
				{/each}
			</div>
		</LoadingCheck>
	</div>
</div>

<div class="btm-nav">
	<button class="bg-secondary text-secondary-content rounded-tl-xl">
		<span class="btm-nav-label text-xl">Vote</span>
	</button>
	<button class="bg-primary text-primary-content rounded-tr-xl" on:click={() => songDialog.showModal()}>
		<span class="btm-nav-label text-xl">Join</span>
	</button>
</div>
