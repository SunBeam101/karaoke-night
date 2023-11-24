<script lang="ts">
	import {
		type Item,
		participantList,
		setupWebSocket,
		isPlaying,
		ADD_ITEM_TOPIC
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
</script>

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
		<form on:submit|preventDefault={addItem}>
			<div class="form-control w-full max-w-xs">
				<label for="input-participant" class="label">
					<span class="label-text">Join the fun</span>
				</label>
				<input
					id="input-participant"
					type="text"
					placeholder="Type your name here"
					class="input input-bordered input-primary"
					bind:value={name}
				/>
			</div>
		</form>
	</div>

	<div>
		<div class="text-xl text-right text-primary">Up Next:</div>
		<ul>
			{#each upNext as item, idx (item.id)}
				<li class="w-full my-2 text-right text-secondary">
					<span>{idx + 1}.</span>
					<span>{item.name}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
