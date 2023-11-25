<script lang="ts">
	import { page } from '$app/stores';
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

	const socket = setupWebSocket($page.params.roomId);

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

<div class="w-full">
	<form on:submit|preventDefault={addItem}>
		<div class="flex flex-row gap-4 items-end">
			<div class="form-control w-full max-w-xs">
				<label for="input-participant" class="label">
					<span class="label-text">Sign up on the list</span>
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
			<button class="btn btn-primary px-5">Join</button>
		</div>
	</form>

	<div class="h-full md:h-80 flex flex-col relative my-4">
		<div class="text-xl text-primary text-center md:text-left">Up Next:</div>
		<ul class="flex flex-col max-h-full flex-wrap">
			{#each upNext as item, idx (item.id)}
				<li class="m-2">
					<span>{idx + 1}.</span>
					<span>{item.name}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
