import { boot } from 'quasar/wrappers';
import { Intersection } from 'quasar';

export default boot(({ app }) => {
  app.directive('intersect', Intersection);
});
