<template>
  <q-page class="q-pa-md example-row-stacked-to-horizontal">
    <q-card class="col-12 col-md-8" flat bordered>
      <q-card-section class="row">
        <!-- Permiso consultar del bakend -->
        <div v-if="permissions.includes('consultar')" class="col-md-6 offset-md-3">
          <!-- Árbol de nodos -->
          <blocks-tree :data="treeData" :collapsable="true"
            :props="{ label: 'label', expand: 'expand', children: 'children', key: 'some_id' }">
            <template #node="{ data }">
              <span @click="selectNode(data)">
                <input type="checkbox" :checked="selected.indexOf(data.some_id) > -1"
                  @change="(e) => toggleSelect(data, e.target.checked)" /> {{ data.label }}
              </span>
              <br />
              <span v-if="data.children && data.children.length">

              </span>
            </template>
          </blocks-tree>

          <!-- Input y botón para añadir ramas -->
          <!-- Ventana modal -->
          <q-dialog v-model="showModal">
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6">Modificar Integrante</div>
              </q-card-section>

              <q-card-section>
                <div>ID: {{ newNodeId }}</div>
                <div>
                  <q-input class="q-mb-md" filled v-model="currentNodeLabel" placeholder="Nombre actual del nodo" />
                  <q-select class="q-mb-md" v-model="currentNodeDepartment" :options="departments" label="Departamento"
                    outlined />
                  <!-- Permiso actualizar del bakend -->
                  <q-btn v-if="permissions.includes('actualizar')" flat label="Actualizar integrante" color="primary"
                    @click="updateNodeData" />
                </div>
                <div>
                  <q-input class="q-mb-md" filled v-model="newNodeLabel" placeholder="Nombre del integrante" />
                  <q-select class="q-mb-md" v-model="newNodeDepartment" :options="departments" label="Departamento"
                    outlined />
                  <!-- Permiso crear del bakend -->
                  <q-btn v-if="permissions.includes('crear')" flat label="Añadir" color="primary"
                    @click="addLeafToNode" />
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <!-- Permiso eliminar del bakend -->
                <q-btn v-if="permissions.includes('eliminar')" flat label="Eliminar" color="primary"
                  @click="deleteNode" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-card-section>
    </q-card>
    <FloatingButton @click="accionBoton">
      <q-icon name="grid_on" />
      <q-tooltip>
        Excel
      </q-tooltip>
    </FloatingButton>
  </q-page>
</template>


<script setup>
import { ref, onMounted, reactive } from 'vue';
import { api } from 'boot/axios'
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css';
import FloatingButton from 'src/components/FloatingButton.vue';

let selected = ref([]);
let treeData = reactive({});
let departments = ref([]);
const token = localStorage.getItem('access_token');
const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'));
const loadDepartments = async () => {

  try {
    const response = await api.get('/departments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    departments.value = response.data;
  } catch (error) {
    console.error('Error al cargar los departamentos:', error);
  }
};

const loadTreeData = async () => {

  try {
    const response = await api.get('/organization/index', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    Object.assign(treeData, response.data[0]);
  } catch (error) {
    console.error('Error al cargar los datos del árbol:', error);
  }
};

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
  currentNodeDepartment.value = data.department || '';
  showModal.value = true;
};

const updateNodeData = async () => {
  if (newNodeId.value !== null) {

    const updatedNodeData = {
      label: currentNodeLabel.value,
      expand: true,
      parent_id: newNodeId.value,
      department_name: currentNodeDepartment.value
    };

    try {
      const response = await api.put(`/organization/update/${newNodeId.value}`, updatedNodeData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Actualizar el nodo en el árbol
      const updatedNode = response.data;
      updateNodeInTree(treeData, newNodeId.value, {
        ...updatedNode,
        department: updatedNode.department
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

    const newNodeData = {
      label: newNodeLabel.value,
      expand: true,
      parent_id: newNodeId.value,
      department_name: newNodeDepartment.value
    };
    try {
      const response = await api.post('/organization/post', newNodeData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Añadir el nodo al árbol local
      const new_id = response.data.id
      addNode(treeData, newNodeId.value, {
        label: newNodeLabel.value,
        department: newNodeDepartment.value, // Incluir el departamento
        some_id: new_id
      });
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

      const response = await api.delete(`/organization/delete/${newNodeId.value}`, {
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
//Descarga el archivo de excel
const accionBoton = async () => {
  try {
    const response = await api.get('/organization/excel', {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob' // Importante para archivos binarios como Excel
    });
    // Crear un URL para el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'organization.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
  }
};

</script>
<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 500px
</style>

