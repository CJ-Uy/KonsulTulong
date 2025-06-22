<script lang="ts">
  export let width = "1em";
  export let height = "1em";
  export let style: string | undefined = undefined;
  let className: string | undefined = undefined;
  export { className as class };
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  {style}
  class={className}
  viewBox="0 0 320 512"
  fill="#1877F3"
>
  <path d="M279.14 288l14.22-92.66h-88.91V127.91c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0c-73.22 0-121.09 44.38-121.09 124.72v70.62H22.89V288h81.38v224h100.2V288z"/>
</svg> 