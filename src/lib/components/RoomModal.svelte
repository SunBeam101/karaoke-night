<script lang="ts">
	import { enhance } from "$app/forms";
	import { rooms } from "$lib/stores/room";
	import type { ActionData } from "../../routes/$types";

  export let showModal: boolean;

  let dialog: HTMLDialogElement;
  export let form: ActionData;

  $: {
    if (dialog && showModal) {
      dialog.showModal()
    } else {
      dialog && dialog.close();
    };
  }
</script>


<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  class="modal"
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-box" on:click|stopPropagation>
    <h3 class="font-bold text-lg">Create a new room</h3>
    <p class="py-4">Your room needs a name. Please add one below:</p>
    <form id="logic-form" method="POST" action="?/create" use:enhance={() => {
      return async ({ result, update }) => {
        // @ts-expect-error TODO
        rooms.update(prev => [...prev, result.data.room]);
        await update();

        showModal = false;
      }
    }}>
      <div class="form-control w-full max-w-xs">
				<label for="roomName" class="label">
					<span class="label-text">Room name</span>
				</label>
				<input
					id="roomName"
          name="roomName"
					type="text"
					placeholder="Type here"
          value={form?.roomName ?? ''}
          required
					class="input input-bordered input-primary"
				/>
        {#if form?.error}
          <p class="mt-2 text-error">{form.error}</p>
        {/if}
			</div>
    </form>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn mr-2" type="submit" form="logic-form">Create</button>
        <button class="btn btn-error">Close</button>
      </form>
    </div>
  </div>
</dialog>