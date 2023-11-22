<script lang="ts">
	type Item = {
		id: number;
		name: string;
	};

	import QrImage from '$lib/components/QRImage.svelte';
	import { io } from 'socket.io-client';
	import { tweened } from 'svelte/motion';

	const socket = io();

	socket.on('connect', () => {
		console.log('Socket connected', socket.id);
	});

	socket.on('disconnect', (reason) => {
		console.log('Socket diconnected', socket.id);

		if (reason === 'io server disconnect') {
			console.log('the disconnection was initiated by the server, you need to reconnect manually');
			socket.connect();
		}
		// else the socket will automatically try to reconnect
	});

	socket.on('initial-data', (changes) => {
		items = [...changes];
	});

	socket.on('changes', (changes) => {
		items = [...changes];
	});

	let items: Item[] = [];
	let name = '';
	let current: Item | null;
	let isPlaying = true;

	$: current = items[0] || null;
	$: isPlaying = items.length === 0 ? false : isPlaying;

	const addItem = () => {
		const newItem = {
			id: Math.random(),
			name
		};

		items = [...items, newItem];

		socket.emit('add-item', newItem);

		name = '';
	};

	const remove = (item: Item | null) => {
		if (!item) {
			return;
		}

		if (item.id === current?.id) {
			progress.set(0);
		}

		items = items.filter((x) => x.id !== item.id);
		socket.emit('remove-item', item.id);
	};

	const SESSION_INTERVAL = 10 * 1000;
	const CADENCE = 100;

	const progress = tweened(0);

	// eslint-disable-next-line no-undef
	let intervalId: NodeJS.Timeout;

	$: {
		if (!isPlaying) {
			clearInterval(intervalId);
			progress.set(0);
		}
	}

	const togglePlay = () => {
		isPlaying = !isPlaying;

		if (isPlaying) {
			intervalId = setInterval(() => {
				if ($progress >= 100) {
					// clearInterval(intervalId);
					goNext();
					progress.set(0);

					return;
				}

				progress.update((v) => v + CADENCE * 100 / SESSION_INTERVAL);
			}, 100);
		} else {
			clearInterval(intervalId);
		}
	};

	const goNext = () => {
		remove(current);
	}

</script>

<h1 class="text-primary text-5xl mb-10">Karaoke Night</h1>

<div class="w-full mb-8 px-8">
	<div class="text-2xl text-primary text-center" class:text-secondary={!isPlaying}>
		{#if isPlaying}
			<span>On the stage:</span>
			<span>{current?.name ?? ''}</span>
		{:else}
			<span>We're on a short break...</span>
		{/if}
	</div>
	<div>
		<progress class="progress progress-primary w-full" class:progress-secondary={!isPlaying} value={$progress} max="100"></progress>
	</div>
</div>

<div class="w-full flex justify-evenly">
	<div class="flex flex-col items-center gap-10">
		<div>
			<QrImage url="www.google.com"/>
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
			{#if isPlaying}
				<button class="btn btn-error" on:click={togglePlay}>Stop</button>
			{:else}	
				<button class="btn btn-primary" on:click={togglePlay}>Start</button>
			{/if}

			<button class="btn btn-secondary" on:click={() => goNext()}>Next</button>
		</div>
	</div>

	<div>
		<div class="text-xl text-right text-primary">
			Up Next:
		</div>
		<ul>
			{#each items as item (item.id)}
				<li class="w-full text-right my-2 text-secondary">
					<span>{item.name}</span>
					<button class="text-error text-xl ml-1" on:click={() => remove(item)}>&times;</button>
				</li>
			{/each}
		</ul>
	</div>

</div>
