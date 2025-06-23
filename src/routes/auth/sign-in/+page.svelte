<script lang="ts">
  import { Logo, Google, Facebook } from '$lib/components/icons';
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
</script>

<section class="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
  <form
      method="POST"
      class="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
      <div class="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div class="text-center">
              <a
                  href="/"
                  aria-label="go home"
                  class="mx-auto block w-fit">
                  <Logo width="40" height="40" />
              </a>
              <h1 class="mb-1 mt-4 text-xl font-semibold">Sign In to KonsulTulong</h1>
              <p class="text-sm">Welcome back! Sign in to continue.</p>
          </div>

          <div class="mt-6 space-y-6">
              <div class="space-y-2">
                  <Label
                      for="email"
                      class="block text-sm">
                      Username
                  </Label>
                  <Input
                      type="email"
                      required
                      name="email"
                      id="email"
                  />
              </div>

              <div class="space-y-0.5">
                  <div class="flex items-center justify-between">
                      <Label
                          for="password"
                          class="text-title text-sm">
                          Password
                      </Label>
                      <Button
                          variant="link"
                          size="sm"
                          href="#"
                          class="h-auto p-0 text-sm"
                      >
                          Forgot your Password?
                      </Button>
                  </div>
                  <Input
                      type="password"
                      required
                      name="password"
                      id="password"
                      class="input sz-md variant-mixed"
                  />
              </div>

              <Button class="w-full">Sign In</Button>
          </div>

          <div class="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <hr class="border-dashed" />
              <span class="text-muted-foreground text-xs">Or continue with</span>
              <hr class="border-dashed" />
          </div>

          <div class="grid grid-cols-2 gap-3">
              <Button
                  type="button"
                  variant="outline">
                  <Google width="1em" height="1em" style="margin-right: 0.5em;" />
                  <span>Google</span>
              </Button>
              <Button
                  type="button"
                  variant="outline">
                  <Facebook width="1em" height="1em" style="margin-right: 0.5em;" />
                  <span>Facebook</span>
              </Button>
          </div>
      </div>

      <div class="p-3">
          <p class="text-accent-foreground text-center text-sm">
              Don't have an account?
              <Button variant="link" href="/register" class="h-auto px-2">
                  Create account
              </Button>
          </p>
      </div>
  </form>
</section>