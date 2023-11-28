// src/boot/vue-blocks-tree.js
import VueBlocksTree from 'vue3-blocks-tree';
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css';

export default ({ app }) => {
  app.use(VueBlocksTree);
};
