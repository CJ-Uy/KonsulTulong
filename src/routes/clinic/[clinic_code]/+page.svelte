<script>
    import { page } from '$app/state';

    const clinicCode = $derived(page.params.clinic_code);
  </script>
  
  <h1>Clinic Code: {clinicCode}</h1>