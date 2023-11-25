<script lang="ts">
	import QrImage from '$lib/components/QRImage.svelte';
	import {
		participantList,
		type Item,
		ADD_ITEM_TOPIC,
		REMOVE_ITEM_TOPIC,
		isPlaying,
		TOGGLE_PLAY_TOPIC,
		setupWebSocket
	} from '$lib/stores/socket';
	import type { Socket } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let name = '';
	let current: Item | null = null;
	let upNext: Item[] = [];

	let socket: Socket;

	onMount(() => {
		socket = setupWebSocket($page.params.roomId);

		return () => socket.disconnect();
	});

	$: current = $participantList[0] ?? null;
	$: upNext = $isPlaying ? $participantList.slice(1) : [...$participantList];

	const addItem = () => {
		const newItem = {
			id: Math.random(),
			name
		};

		participantList.set([...$participantList, newItem]);
		socket.emit(ADD_ITEM_TOPIC, newItem);

		name = '';
	};

	const remove = (item: Item | null) => {
		if (!item) {
			return;
		}

		participantList.set($participantList.filter((x) => x.id !== item.id));
		socket.emit(REMOVE_ITEM_TOPIC, item.id);
	};

	const togglePlay = () => {
		isPlaying.update((prev) => {
			socket.emit(TOGGLE_PLAY_TOPIC, prev ? 'stop' : 'start');
			return !prev;
		});
	};

	const goNext = () => {
		remove(current);
	};
</script>

<div class="w-full mb-14">
	<div class="text-3xl text-primary text-center" class:text-secondary={!$isPlaying}>
		{#if $isPlaying}
			<span>On the stage:</span>
			<span>{current?.name ?? ''}</span>
		{:else}
			<span>We're on a short break...</span>
		{/if}
	</div>
</div>

<div class="w-full flex gap-20">
	<div class="flex flex-col items-center">
		<QrImage url={`${$page.url.href}/spectator`} />
		<div class="text-primary text-center mt-3 text-xl font-bold">Join Now!</div>
		<div class="text-primary text-center mt-3 text-lg">Scan the QR code to join the fun!</div>
	</div>

	<div class="flex flex-col gap-6">
		<form on:submit|preventDefault={addItem}>
			<div class="flex flex-row gap-4 items-end">
				<div class="form-control w-full max-w-xs">
					<label for="input-participant" class="label">
						<span class="label-text">Add new participant</span>
					</label>
					<input
						id="input-participant"
						type="text"
						required
						placeholder="Type here"
						class="input input-bordered input-primary"
						bind:value={name}
					/>
				</div>
				<button class="btn btn-primary px-5">Add</button>
			</div>
		</form>

		<div class="flex gap-4">
			{#if $isPlaying}
				<button class="btn btn-error btn-lg" on:click={togglePlay}>Stop</button>
			{:else}
				<button class="btn btn-primary btn-lg" on:click={togglePlay}>Start</button>
			{/if}

			<button class="btn btn-secondary btn-lg" on:click={() => goNext()}>Next</button>
		</div>
	</div>

	<div class="h-96 flex flex-col relative">
		<div class="text-xl text-primary">Up Next:</div>
		<ul class="flex flex-col max-h-full flex-wrap">
			{#each upNext as item, idx (item.id)}
				<li class="m-2">
					<span>{idx + 1}.</span>
					<span>{item.name}</span>
					<button class="text-error text-xl ml-1" on:click={() => remove(item)}>&times;</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
