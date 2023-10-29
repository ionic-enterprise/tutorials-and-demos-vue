export interface Editable<T> {
  editMode: 'view' | 'edit' | 'create';
  data: T;
}
