<script lang="ts">
	import QrImage from '$lib/components/QRImage.svelte';
	import {
		participantList,
		type Item,
		setupWebSocket,
		ADD_ITEM_TOPIC,
		REMOVE_ITEM_TOPIC,
		isPlaying,
		TOGGLE_PLAY_TOPIC
	} from '$lib/stores/socket';

	let name = '';
	let current: Item | null = null;
	let upNext: Item[] = [];

	const socket = setupWebSocket();

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

<h1 class="text-primary text-5xl mb-10 underline">Karaoke Night</h1>

<div class="w-full mb-8 px-8">
	<div class="text-2xl text-primary text-center" class:text-secondary={!$isPlaying}>
		{#if $isPlaying}
			<span>On the stage:</span>
			<span>{current?.name ?? ''}</span>
		{:else}
			<span>We're on a short break...</span>
		{/if}
	</div>
</div>

<div class="w-full flex justify-evenly">
	<div class="flex flex-col items-center gap-10">
		<div>
			<QrImage url="www.google.com" />
			<div class="text-primary text-center mt-3 text-xl font-bold">Join Now!</div>
		</div>

		<form on:submit|preventDefault={addItem}>
			<div class="form-control w-full max-w-xs">
				<label for="input-participant" class="label">
					<span class="label-text">Add new participant</span>
				</label>
				<input
					id="input-participant"
					type="text"
					placeholder="Type here"
					class="input input-bordered input-primary"
					bind:value={name}
				/>
			</div>
		</form>

		<div class="flex gap-4">
			{#if $isPlaying}
				<button class="btn btn-error" on:click={togglePlay}>Stop</button>
			{:else}
				<button class="btn btn-primary" on:click={togglePlay}>Start</button>
			{/if}

			<button class="btn btn-secondary" on:click={() => goNext()}>Next</button>
		</div>
	</div>

	<div>
		<div class="text-xl text-right text-primary">Up Next:</div>
		<ul>
			{#each upNext as item, idx (item.id)}
				<li class="w-full text-right my-2 text-secondary">
					<span>{idx + 1}.</span>
					<span>{item.name}</span>
					<button class="text-error text-xl ml-1" on:click={() => remove(item)}>&times;</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
