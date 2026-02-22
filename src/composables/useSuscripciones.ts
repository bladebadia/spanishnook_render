// src/composables/useSuscripciones.ts
import { ref } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useQuasar } from 'quasar';

export function useSuscripciones() {
  const { user } = useAuth();
  const $q = useQuasar();
  const procesando = ref(false);

  /**
   * Inicia el proceso de suscripción (Checkout).
   */
  const handleSubscribe = async (priceId: string, courseId: string) => {
    if (!user.value) {
      $q.notify({ type: 'warning', message: 'Debes iniciar sesión para suscribirte.' });
      return;
    }

    procesando.value = true;

    try {
      const { data, error } = await supabase.functions.invoke('subscription-webhook', {
        body: {
          priceId: priceId,
          user_id: user.value.id,
          course_id: courseId,
          customer_email: user.value.email,
          customer_name: user.value.user_metadata?.nombre || user.value.email,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago.');
      }

    } catch (err: unknown) {
      console.error('Error suscripción:', err);
      $q.notify({
        type: 'negative',
        message: 'No se pudo iniciar el pago. Inténtalo de nuevo.',
      });
    } finally {
      procesando.value = false;
    }
  };

  /**
   * Cancela o Reactiva una suscripción.
   * @param subscriptionId - ID de Stripe de la suscripción (NO el ID de la tabla, sino stripe_subscription_id)
   * @param cancelar - true para cancelar al final del periodo, false para reactivar
   */
  const cambiarEstadoCancelacion = async (subscriptionId: string, cancelar: boolean) => {
    procesando.value = true;
    try {
      const { data, error } = await supabase.functions.invoke('subscription-webhook', {
        body: { 
          action: 'toggle_cancel', 
          subscriptionId: subscriptionId,
          cancel: cancelar 
        }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      $q.notify({
        type: 'positive',
        message: cancelar 
          ? 'Suscripción cancelada. Tendrás acceso hasta el final del periodo.' 
          : '¡Suscripción reactivada correctamente!',
        icon: cancelar ? 'event_busy' : 'check_circle'
      });
      
      return true; // Retornamos true para indicar éxito y refrescar la lista

    } catch (err: unknown) {
      console.error('Error gestionando suscripción:', err);
      $q.notify({
        type: 'negative',
        message: 'Error al actualizar el estado de la suscripción.',
      });
      return false;
    } finally {
      procesando.value = false;
    }
  };

  return {
    procesando,
    handleSubscribe,
    cambiarEstadoCancelacion
  };
}