<script lang="ts">
  export let title: string;

</script>

<div class="card w-96 bg-secondary text-primary-content">
  <div class="card-body">
    <h2 class="card-title">{title}</h2>
    <div class="card-actions justify-end">
      <slot />
    </div>
  </div>
</div>