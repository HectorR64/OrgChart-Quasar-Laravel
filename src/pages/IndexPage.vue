<template>
  <q-page class="flex flex-center">
    <div class="flex flex-center">
      <div>
        <!-- Árbol de nodos -->
        <blocks-tree :data="treeData" :collapsable="true"
          :props="{ label: 'label', expand: 'expand', children: 'children', key: 'some_id' }">
          <template #node="{ data }">
            <span @click="selectNode(data)">
              <input type="checkbox" :checked="selected.indexOf(data.some_id) > -1"
                @change="(e) => toggleSelect(data, e.target.checked)" /> {{ data.label }}
            </span>
            <br />
          </template>
        </blocks-tree>

        <!-- Input y botón para añadir ramas -->
        <!-- Ventana modal -->
        <q-dialog v-model="showModal">
          <q-card class="my-card">
            <q-card-section>
              <div class="text-h6">Modificar nodo</div>
            </q-card-section>

            <q-card-section>
              <div>ID del nodo: {{ newNodeId }}</div>
              <div>
                <q-input class="q-mb-md" filled v-model="currentNodeLabel" placeholder="Nombre actual del nodo" />
                <q-select v-model="currentNodeDepartment" :options="departments" label="Departamento" outlined />
                <q-btn flat label="Actualizar Nodo" color="primary" @click="updateNodeData" />
              </div>
              <div>
                <q-input class="q-mb-md" filled v-model="newNodeLabel" placeholder="Nueva etiqueta del nodo" />
                <q-select v-model="newNodeDepartment" :options="departments" label="Departamento" outlined />
                <q-btn flat label="Añadir" color="primary" @click="addLeafToNode" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Eliminar" color="primary" @click="deleteNode" />
              <q-btn flat label="Cancelar" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-btn label="Exportar JSON" @click="exportToJson" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    let selected = ref([]);
    let treeData = reactive({});
    let departments = ref([]);

    const loadDepartments = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/departments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        departments.value = response.data;
      } catch (error) {
        console.error('Error al cargar los departamentos:', error);
      }
    };

    const loadTreeData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/organization/index', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        Object.assign(treeData, response.data[0]);
      } catch (error) {
        console.error('Error al cargar los datos del árbol:', error);
      }
    };

    // Esta función ahora llama a loadTreeData
    onMounted(() => {
      loadTreeData();
      loadDepartments();
    });
    const newNodeId = ref(null);
    const newNodeLabel = ref('');
    const currentNodeLabel = ref('');
    const showModal = ref(false);
    const currentNodeDepartment = ref('');
    //const departments = ['sistemas', 'rh', 'contabilidad', 'administracion'];
    const newNodeDepartment = ref('');
    const selectNode = (data) => {
      newNodeId.value = data.some_id;
      currentNodeLabel.value = data.label;
      currentNodeDepartment.value = data.department || ''; // Establecer el departamento del nodo o dejarlo vacío
      showModal.value = true;
    };

    const updateNodeName = () => {
      if (newNodeId.value !== null && currentNodeLabel.value) {
        updateNode(treeData, newNodeId.value, currentNodeLabel.value);
        treeData = { ...treeData }; // Forzar la actualización del árbol
        showModal.value = false;
      }
    };

    const updateNodeData = async () => {
      if (newNodeId.value !== null) {
        const token = localStorage.getItem('access_token');
        const updatedNodeData = {
          label: currentNodeLabel.value,
          expand: true, // o según la lógica de tu aplicación
          parent_id: newNodeId.value, // Asegúrate de que este sea el valor correcto
          department_name: currentNodeDepartment.value
        };

        try {
          const response = await axios.put(`http://127.0.0.1:8000/api/organization/update/${newNodeId.value}`, updatedNodeData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Actualizar el nodo en el árbol
          const updatedNode = response.data;
          updateNodeInTree(treeData, newNodeId.value, {
            ...updatedNode,
            department: updatedNode.department // Asegúrate de que coincida con la estructura de tu árbol
          });

          // Cerrar modal y restablecer campos
          showModal.value = false;
          currentNodeLabel.value = '';
          currentNodeDepartment.value = '';
        } catch (error) {
          console.error('Error al actualizar el nodo:', error);
        }
      }
    };


    const updateNodeInTree = (node, id, updatedNode) => {
      if (node.some_id === id) {
        Object.assign(node, updatedNode);
        return true;
      }

      if (node.children) {
        for (let child of node.children) {
          const updated = updateNodeInTree(child, id, updatedNode);
          if (updated) return true;
        }
      }
      return false;
    };


    const addLeafToNode = async () => {
      if (newNodeId.value !== null && newNodeLabel.value) {
        const token = localStorage.getItem('access_token');
        const newNodeData = {
          label: newNodeLabel.value,
          expand: true, // o según la lógica de tu aplicación
          parent_id: newNodeId.value,
          department_name: newNodeDepartment.value
        };
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/organization/post', newNodeData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Añadir el nodo al árbol local
          const new_id = response.data.id
          addNode(treeData, newNodeId.value, {
            label: newNodeLabel.value,
            department: newNodeDepartment.value, // Incluir el departamento
            some_id: new_id
          });

          // Restablecer los campos y cerrar el modal
          newNodeLabel.value = '';
          newNodeDepartment.value = '';
          showModal.value = false;
        } catch (error) {
          console.error('Error al agregar el nodo:', error);
        }
      }
    };



    const addNode = (node, id, newNode) => {
      if (node.some_id === id) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(newNode);
      } else if (node.children) {
        node.children.forEach(child => addNode(child, id, newNode));
      }
    };

    const toggleSelect = (node, isSelected) => {
      if (isSelected) {
        selected.value.push(node.some_id);
      } else {
        selected.value.splice(selected.value.indexOf(node.some_id), 1);
      }
      if (node.children && node.children.length) {
        node.children.forEach(ch => toggleSelect(ch, isSelected));
      }
    };

    const deleteNode = async () => {
      if (newNodeId.value !== null) {
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.delete(`http://127.0.0.1:8000/api/organization/delete/${newNodeId.value}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data.success === "Personal eliminado correctamente") {
            // Si se elimina correctamente del servidor, intenta eliminar del árbol
            deleteNodeFromTree(treeData, null, newNodeId.value);
            treeData = { ...treeData }; // Forzar la actualización del árbol
            newNodeId.value = null;
            showModal.value = false;
          }
        } catch (error) {
          console.error('Error al eliminar el nodo:', error);
        }

      }
    };

    const deleteNodeFromTree = (node, parent, idToDelete) => {
      if (node.some_id === idToDelete) {
        if (parent && Array.isArray(parent.children)) {
          const index = parent.children.indexOf(node);
          if (index > -1) {
            parent.children.splice(index, 1);
          }
        }
        return;
      }
      if (node.children) {
        node.children.forEach(child => deleteNodeFromTree(child, node, idToDelete));
      }
    };
    const exportToJson = () => {
      const jsonString = JSON.stringify(treeData, null, 2); // Convierte el árbol a JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'treeData.json'; // Nombre del archivo a descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };


    return {
      treeData,
      selected,
      toggleSelect,
      newNodeId,
      newNodeLabel,
      currentNodeLabel,
      addLeafToNode,
      selectNode,
      showModal,
      updateNodeName,
      deleteNode,
      exportToJson,
      currentNodeDepartment,
      departments,
      updateNodeData,
      newNodeDepartment,
    };
  }
})
</script>
<style>
.my-card {
  width: 400px;
}
</style>
