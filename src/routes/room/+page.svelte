<script lang="ts">
	type Item = {
		id: number;
		name: string;
	};

	import { io } from 'socket.io-client';

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

	socket.on('eventFromServer', (event) => {
		console.log('EVENT', event);
	});

	socket.on('initial-data', (changes) => {
		console.log('INITIAL DATA', changes);
		items = [...changes];
	});

	socket.on('changes', (changes) => {
		items = [...changes];
	});

	let items: Item[] = [];
	let name = '';

	const addItem = () => {
		const newItem = {
			id: Math.random(),
			name
		};

		items = [...items, newItem];

		socket.emit('add-item', newItem);

		name = '';
	};

	const remove = (item: Item) => {
		items = items.filter((x) => x.id !== item.id);
		socket.emit('remove-item', item.id);
	};
</script>

<h1 class="text-primary text-5xl mb-10">Karaoke Night</h1>

<div class="w-full flex justify-evenly">
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

	<ul>
		{#each items as item (item.id)}
			<li class="w-full text-right my-2 text-secondary">
				<span>{item.name}</span>
				<button class="text-error text-xl ml-1" on:click={() => remove(item)}>&times;</button>
			</li>
		{/each}
	</ul>
</div>
