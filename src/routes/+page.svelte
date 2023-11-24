<script lang="ts">
  import RoomCard from "$lib/components/RoomCard.svelte";
	import RoomModal from "$lib/components/RoomModal.svelte";
	import { rooms, type Room } from "$lib/stores/room.js";

  export let form;

  const initialRooms: Room[] = [
    {
      id: '1',
      name: 'Initial Room',
    },
    {
      id: '2',
      name: 'Serious room',
    },
    {
      id: '3',
      name: 'Dead meat',
    },
  ];

  rooms.set([...initialRooms]);

  let showModal = false;
</script>

<div class="px-28">

  <button class="btn btn-primary mb-4" on:click={() => (showModal = true)}>Create new room</button>

  <RoomModal bind:showModal={showModal} {form} />

  <h2 class="mb-4 text-2xl text-neutral-content">Existing Rooms:</h2>

  <div class="flex flex-wrap gap-4">
    {#each $rooms as room (room.id)}
      <RoomCard title={room.name}>
        <a class="btn btn-primary" href={`/room/${room.id}`}>
          Join
        </a>
        <button class="btn btn-error" on:click={() => rooms.set($rooms.filter(r => r.id !== room.id))}>
          Delete
        </button>
      </RoomCard>
    {/each}
  </div>
</div>

