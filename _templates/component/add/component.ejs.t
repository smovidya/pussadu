---
to: src/stories/<%= h.changeCase.param(componentName) %>/<%= h.changeCase.param(subComponentName) %>.svelte
---
<script lang="ts">
  interface Props { }

  let { }: Props = $props();
</script>

<%= h.changeCase.pascal(componentName) %>/<%= h.changeCase.pascal(subComponentName) %>
