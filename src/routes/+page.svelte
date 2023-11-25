<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex justify-center items-center flex-1">
	<div class="card card-compact md:card-normal w-96 bg-primary text-primary-content">
		<div class="card-body">
			<h2 class="card-title">Welcome!</h2>
			<p>Click the button below to host a karaoke room</p>
			<div class="card-actions justify-center mt-4">
				<a class="btn md:btn-lg" href={`/room/${data.userId}`}>Host room</a>
			</div>
		</div>
	</div>
</div>
