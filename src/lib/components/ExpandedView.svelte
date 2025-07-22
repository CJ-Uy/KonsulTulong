<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { Schema } from "./schemas.js";
  import { Button } from "$lib/components/ui/button/index.js";
  export let row: Schema;
  export let open: boolean;
  export let onClose: () => void = () => {};
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Case Details</Dialog.Title>
      <Dialog.Description>
        Expanded view of the selected case.
      </Dialog.Description>
    </Dialog.Header>
    <div class="space-y-2 py-4">
      <div><b>Case Number:</b> {row.caseNum}</div>
      <div><b>Name:</b> {row.name}</div>
      <div><b>Surgical Service:</b> {row.surgicalService}</div>
      <div><b>Status:</b> {row.status}</div>
      <div><b>Age:</b> {row.age}</div>
      <div><b>Sex:</b> {row.sex}</div>
      <div><b>Contact Number:</b> {row.contact}</div>
      <div><b>Time Waited:</b> {row.waitingTime}</div>
    </div>
    <Dialog.Footer>
      <Button onclick={() => { open = false; onClose(); }}>Close</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root> 