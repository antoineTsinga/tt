import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import MultiSelectDropdown from './components/MultiSelectDropdown';

type FormValues = {
  categories: string[];
};

const options = [
  { value: 'dev', label: 'Développement' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'Ressources Humaines' },
];

const App = () => {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { categories: [] },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Données du formulaire:', data);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <MultiSelectDropdown
              label="Catégories"
              options={options}
              selectedValues={field.value}
              onChange={field.onChange}
              placeholder="Choisissez des catégories"
            />
          )}
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Soumettre
        </button>
      </form>
    </div>
  );
};

export default App;