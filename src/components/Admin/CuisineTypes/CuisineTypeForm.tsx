import { Save, X } from 'lucide-react'

interface CuisineTypeFormProps {
  newForm: { name: string; name_zh: string; name_pt: string }
  setNewForm: (form: { name: string; name_zh: string; name_pt: string }) => void
  onAdd: () => void
  onCancel: () => void
}

export function CuisineTypeForm({ newForm, setNewForm, onAdd, onCancel }: CuisineTypeFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Name (key)"
          value={newForm.name}
          onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
          className="px-3 py-2 border border-neutral-200 rounded-lg"
        />
        <input
          type="text"
          placeholder="中文名稱"
          value={newForm.name_zh}
          onChange={(e) => setNewForm({ ...newForm, name_zh: e.target.value })}
          className="px-3 py-2 border border-neutral-200 rounded-lg"
        />
        <input
          type="text"
          placeholder="Nome PT"
          value={newForm.name_pt}
          onChange={(e) => setNewForm({ ...newForm, name_pt: e.target.value })}
          className="px-3 py-2 border border-neutral-200 rounded-lg"
        />
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Save size={18} className="mx-auto" />
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
