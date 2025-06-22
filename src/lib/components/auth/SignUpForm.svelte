<script>
  import { Logo, Google, Facebook } from '$lib/components/icons';
  import { Button } from '../ui/button';
  import { Label } from '../ui/label';
  import { Input } from '../ui/input';
</script>

<section class="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
  <form
    action=""
    class="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
  >
    <div class="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
      <div class="text-center">
        <a href="/" aria-label="go home" class="mx-auto block w-fit">
          <Logo width="32" height="32" />
        </a>
        <h1 class="text-title mb-1 mt-4 text-xl font-semibold">Create a KonsulTulong Account</h1>
        <p class="text-sm">Welcome! Create an account to get started.</p>
      </div>

      <div class="mt-6 space-y-6">
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="firstname" class="block text-sm">First Name</Label>
            <Input type="text" required name="firstname" id="firstname" />
          </div>
          <div class="space-y-2">
            <Label for="lastname" class="block text-sm">Last Name</Label>
            <Input type="text" required name="lastname" id="lastname" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="email" class="block text-sm">Email</Label>
          <Input type="email" required name="email" id="email" />
        </div>

        <div class="space-y-0.5">
          <div class="flex items-center justify-between">
            <Label for="pwd" class="text-title text-sm">Password</Label>
          </div>
          <Input
            type="password"
            required
            name="pwd"
            id="pwd"
            class="input sz-md variant-mixed"
          />
        </div>

        <Button class="w-full">Sign Up</Button>
      </div>

      <div class="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <hr class="border-dashed" />
        <span class="text-muted-foreground text-xs">Or continue With</span>
        <hr class="border-dashed" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline">
          <Google width="0.98em" height="1em" style="margin-right: 0.5em;" />
          <span>Google</span>
        </Button>
        <Button type="button" variant="outline">
          <Facebook width="1em" height="1em" style="margin-right: 0.5em;" />
          <span>Facebook</span>
        </Button>
      </div>
    </div>

    <div class="p-3">
      <p class="text-accent-foreground text-center text-sm">
        Have an account?
        <Button variant="link" href="/login" class="px-2">
          Sign In
        </Button>
      </p>
    </div>
  </form>
</section>