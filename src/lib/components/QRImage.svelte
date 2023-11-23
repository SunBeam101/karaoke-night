<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	export let url: string;
	let canvas: HTMLCanvasElement | undefined;

	const bgColor = '#4BADD4';

	onMount(() => {
		QRCode.toCanvas(canvas, url, { scale: 6, color: { light: bgColor } }, (error) => {
			if (error) {
				console.error('Error rendering QR Code', error);
			}
		});
	});
</script>

<canvas bind:this={canvas} />
