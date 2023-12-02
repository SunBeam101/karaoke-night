<script lang="ts">
	import QrImage from '$lib/components/QRImage.svelte';
	import {
		participantList,
		type Item,
		REMOVE_ITEM_TOPIC,
		isPlaying,
		TOGGLE_PLAY_TOPIC,
		setupWebSocket,
		participantQueue
	} from '$lib/stores/socket';
	import type { Socket } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import LoadingCheck from '$lib/components/LoadingCheck.svelte';

	let current: Item | null = null;
	let upNext: Item[] = [];

	let socket: Socket;

	onMount(() => {
		socket = setupWebSocket($page.params.roomId);

		return () => socket.disconnect();
	});

	$: current = $participantList[0] ?? null;
	$: upNext = $isPlaying ? $participantList.slice(1) : [...$participantList];

	const remove = (item: Item | null) => {
		if (!item) {
			return;
		}

		participantQueue.update((q) => q.remove(item.id));
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

<div class="w-full my-14 px-24 flex flex-row items-center gap-10">
	<div class="flex flex-col gap-6">
		<div class="flex gap-4">
			{#if $isPlaying}
				<button class="btn btn-error btn-lg" on:click={togglePlay}>Stop</button>
			{:else}
				<button class="btn btn-primary btn-lg" on:click={togglePlay}>Start</button>
			{/if}

			<button class="btn btn-secondary btn-lg" on:click={() => goNext()}>Next</button>
		</div>
	</div>

	<div class="text-3xl text-primary text-center" class:text-secondary={!$isPlaying}>
		{#if $isPlaying}
			<span>On the stage:</span>
			<span>{current?.userName || ''} - {current?.songName || ''}</span>
		{:else}
			<span>We're on a short break...</span>
		{/if}
	</div>
</div>

<div class="w-full flex justify-evenly gap-20">
	<div class="flex flex-col items-center">
		<QrImage url={`${$page.url.href}/spectator`} />
		<div class="text-primary text-center mt-3 text-xl font-bold">Join Now!</div>
		<div class="text-primary text-center mt-3 text-lg">Scan the QR code to join the fun!</div>
	</div>

	<div class="h-96 flex flex-col">
		<div class="text-xl text-primary mb-2">Up Next:</div>
		<div class="h-full w-64 relative flex items-center justify-center">
			<LoadingCheck>
				<div class="h-full flex flex-col gap-3 overflow-auto absolute top-0 left-0 right-0">
					{#each upNext as item (item.id)}
						<div class="w-full btn btn-primary join-item">
							<span>{item.songName} ({item.userName})</span>
							<button class="text-2xl ml-1 mb-1" on:click={() => remove(item)}>&times;</button>
						</div>
					{/each}
				</div>
			</LoadingCheck>
		</div>
	</div>
</div>
