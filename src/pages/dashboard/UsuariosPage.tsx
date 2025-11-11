// Página de gestión de usuarios
export default function UsuariosPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-2">Gestiona los usuarios del sistema</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Nuevo Usuario
        </button>
      </div>

      {/* Lista de usuarios */}
    </div>
  )
}
