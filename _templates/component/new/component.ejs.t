---
to: src/stories/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.svelte
---
<script lang="ts">
  interface Props { }

  let { }: Props = $props();
</script>

<%= h.changeCase.pascal(name) %>
