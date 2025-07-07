   const handleAddPizza = () => {
     if (!formData.name || !formData.description || !formData.image || !formData.category) {
       dispatch({
         type: 'ADD_NOTIFICATION',
         payload: 'Preencha todos os campos obrigatórios!'
       });
       return;
     }

+    // Verificar se já existe uma pizza com o mesmo nome
+    const existingPizza = state.pizzas.find(pizza => 
+      pizza.name.toLowerCase() === formData.name.toLowerCase() && pizza.id !== editingPizza?.id
+    );
+
+    if (existingPizza) {
+      dispatch({
+        type: 'ADD_NOTIFICATION',
+        payload: 'Já existe uma pizza com este nome no cardápio!'
+      });
+      return;
+    }

     const newPizza: Pizza = {
       id: Date.now().toString(),
       name: formData.name,
       description: formData.description,
       price: formData.sizes.medium,
       image: formData.image,
       category: formData.category,
       ingredients: formData.ingredients,
       sizes: formData.sizes
     };

     dispatch({
       type: 'ADD_PIZZA',
       payload: newPizza
     });

     dispatch({
       type: 'ADD_NOTIFICATION',
       payload: 'Pizza adicionada com sucesso!'
     });

     resetForm();
   };

   const handleUpdatePizza = () => {
     if (!editingPizza || !formData.name || !formData.description || !formData.image || !formData.category) {
       return;
     }

+    // Verificar se já existe uma pizza com o mesmo nome
+    const existingPizza = state.pizzas.find(pizza => 
+      pizza.name.toLowerCase() === formData.name.toLowerCase() && pizza.id !== editingPizza.id
+    );
+
+    if (existingPizza) {
+      dispatch({
+        type: 'ADD_NOTIFICATION',
+        payload: 'Já existe uma pizza com este nome no cardápio!'
+      });
+      return;
+    }

     const updatedPizza: Pizza = {
       ...editingPizza,
       name: formData.name,
       description: formData.description,
       price: formData.sizes.medium,
       image: formData.image,
       category: formData.category,
       ingredients: formData.ingredients,
       sizes: formData.sizes
     };

     dispatch({
       type: 'UPDATE_PIZZA',
       payload: updatedPizza
     });

     dispatch({
       type: 'ADD_NOTIFICATION',
       payload: 'Pizza atualizada com sucesso!'
     });

     resetForm();
   };
@@ .. @@

export default handleUpdatePizza